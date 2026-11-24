// Tiny 2D-canvas "3D" cake renderer (no libraries). Prisms are rotated and projected by hand,
// geometry is built once per change, and drawing only happens when something moves.
const nav = typeof navigator !== "undefined" ? navigator : {};
export const low = (nav.hardwareConcurrency || 4) <= 4 || (nav.deviceMemory || 4) <= 2;
const SEG = low ? 28 : 40, PHI = 0.42, sP = Math.sin(PHI), cP = Math.cos(PHI), TH = 3.4, GOLD = [217, 178, 95];
export const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const shade = (c, b) => { const f = v => Math.round(Math.max(0, Math.min(255, b <= 1 ? v * b : v + (255 - v) * (b - 1)))); return `rgb(${f(c[0])},${f(c[1])},${f(c[2])})`; };
const mix = (c, k) => [0, 1, 2].map(i => Math.round(c[i] + (255 - c[i]) * k));
const rnd = i => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const lum = c => .3 * c[0] + .59 * c[1] + .11 * c[2];
const lines = m => { if (m.length <= 14) return [m]; const mid = m.length / 2; let best = -1; for (let i = 0; i < m.length; i++) if (m[i] === " " && (best < 0 || Math.abs(i - mid) < Math.abs(best - mid))) best = i; return best < 0 ? [m.slice(0, 14), m.slice(14)] : [m.slice(0, best), m.slice(best + 1)]; };
function shapePoly(shape) {
  let p = [];
  if (shape === "heart") {
    for (let i = 0; i < SEG; i++) { const t = i / SEG * 6.2832; p.push([16 * Math.sin(t) ** 3 / 17, -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) / 17]); }
    const mz = p.reduce((a, q) => a + q[1], 0) / p.length; p = p.map(q => [q[0], q[1] - mz]);
    let ar = 0; for (let i = 0; i < p.length; i++) { const a = p[i], b = p[(i + 1) % p.length]; ar += a[0] * b[1] - b[0] * a[1]; } if (ar < 0) p.reverse();
  } else { const n = shape === "square" ? 4 : shape === "hexagon" ? 6 : SEG, k = shape === "square" ? Math.SQRT2 : shape === "hexagon" ? 1.04 : 1, o = shape === "square" ? Math.PI / 4 : 0; for (let i = 0; i < n; i++) { const a = i / n * 6.2832 + o; p.push([Math.cos(a) * k, Math.sin(a) * k]); } }
  return p;
}
function resample(p, N) {
  const n = p.length, L = [0]; for (let i = 0; i < n; i++) { const a = p[i], b = p[(i + 1) % n]; L.push(L[i] + Math.hypot(b[0] - a[0], b[1] - a[1])); }
  const out = []; let e = 0;
  for (let j = 0; j < N; j++) { const d = j / N * L[n]; while (L[e + 1] < d) e++; const a = p[e], b = p[(e + 1) % n], u = (d - L[e]) / (L[e + 1] - L[e] || 1), dx = b[0] - a[0], dz = b[1] - a[1], l = Math.hypot(dx, dz) || 1; out.push([a[0] + dx * u, a[1] + dz * u, dz / l, -dx / l]); }
  return out;
}
// sp: {tiers, shape, d (bottom diameter, inches), main, accent, border 0|1|2, finish 0|1, gloss, msg, top:{sprinkles,berries,flowers,candles,topper}}
export function buildGeo(sp) {
  const poly = shapePoly(sp.shape), tiers = [];
  for (let i = 0; i < sp.tiers; i++) tiers.push({ r: sp.d / 2 * Math.pow(.74, i), y0: i * TH, y1: (i + 1) * TH });
  return { sp, poly, per: resample(poly, SEG), tiers, H: sp.tiers * TH, R: sp.d / 2, ext: sp.shape === "square" ? 1.5 : 1.2, main: hex(sp.main), acc: hex(sp.accent) };
}
export function drawCake(ctx, W, H, g, th) {
  const sp = g.sp, c = Math.cos(th), s = Math.sin(th), R = g.R, tp = sp.top, n = g.tiers.length;
  const extra = tp.topper || tp.candles ? 4 : tp.flowers || tp.berries ? 1.7 : .6;
  const upMax = (g.H + extra) * cP + R * g.ext * sP, upMin = -.3 * cP - R * g.ext * sP;
  const S = Math.min(W * .92 / (2 * R * g.ext * 1.05), H * .92 / (upMax - upMin)), mid = (upMax + upMin) / 2;
  let px = 0, py = 0, pd = 0;
  const P = (x, y, z) => { const xr = x * c + z * s, zr = -x * s + z * c; px = W / 2 + xr * S; py = H / 2 - (y * cP - zr * sP - mid) * S; pd = zr * cP + y * sP; };
  const quad = (a, b, c2, d, fill) => { ctx.fillStyle = fill; ctx.strokeStyle = fill; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(c2[0], c2[1]); ctx.lineTo(d[0], d[1]); ctx.closePath(); ctx.fill(); ctx.stroke(); };
  const lp = (p, q, t) => [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t];
  ctx.clearRect(0, 0, W, H);
  P(0, -.3, 0); ctx.save(); ctx.translate(px, py); ctx.scale(1, sP);
  const rg = ctx.createRadialGradient(0, 0, 0, 0, 0, R * 1.6 * S); rg.addColorStop(0, "rgba(40,20,5,.38)"); rg.addColorStop(1, "rgba(40,20,5,0)");
  ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(0, 0, R * 1.6 * S, 0, 6.3); ctx.fill(); ctx.restore();
  const tier = (pts, r, y0, y1, col, o) => {
    const m = pts.length, vis = [], E = (pt, y) => { P(pt[0] * r, y, pt[1] * r); return [px, py]; };
    for (let k = 0; k < m; k++) {
      const a = pts[k], b = pts[(k + 1) % m], dx = b[0] - a[0], dz = b[1] - a[1], l = Math.hypot(dx, dz) || 1, nx = dz / l, nz = -dx / l, nzr = -nx * s + nz * c;
      if (nzr > .02) vis.push({ k, nxr: nx * c + nz * s, nzr, d: -(a[0] + b[0]) / 2 * s + (a[1] + b[1]) / 2 * c });
    }
    if (sp.shape === "heart") vis.sort((u, v) => u.d - v.d);
    for (const v of vis) {
      const a = pts[v.k], b = pts[(v.k + 1) % m], lam = v.nxr * -.61 + v.nzr * .79, br = .8 + .3 * lam;
      const A1 = E(a, y1), B1 = E(b, y1), B0 = E(b, y0), A0 = E(a, y0);
      quad(A1, B1, B0, A0, shade(col, br));
      if (o.ribbon) quad(lp(A1, A0, .14), lp(B1, B0, .14), lp(B1, B0, .3), lp(A1, A0, .3), shade(g.acc, br));
      if (o.drip) {
        quad(A1, B1, lp(B1, B0, .1), lp(A1, A0, .1), shade(g.acc, br));
        if (rnd(v.k * 7 + y0 * 3 + 1) > .3) {
          const L = (.18 + .5 * rnd(v.k * 3 + y0 + 5)) * TH * cP * S, Tl = lp(A1, B1, .22), Tr = lp(A1, B1, .78), Bl = [Tl[0], Tl[1] + L], Br = [Tr[0], Tr[1] + L], f = shade(g.acc, br);
          quad(Tl, Tr, Br, Bl, f); ctx.beginPath(); ctx.arc((Bl[0] + Br[0]) / 2, (Bl[1] + Br[1]) / 2, Math.abs(Br[0] - Bl[0]) / 2, 0, Math.PI); ctx.fill();
        }
      }
      if (o.gloss && lam > .55) quad(lp(A1, B1, .3), lp(A1, B1, .46), lp(A0, B0, .46), lp(A0, B0, .3), "rgba(255,255,255,.2)");
    }
    if (o.pearls) for (const q of g.per) { if (-q[2] * s + q[3] * c <= .05) continue; P(q[0] * r * 1.02, y0 + .34, q[1] * r * 1.02); ctx.fillStyle = "#fff6e6"; ctx.beginPath(); ctx.arc(px, py, .2 * S, 0, 6.3); ctx.fill(); ctx.fillStyle = "rgba(0,0,0,.12)"; ctx.beginPath(); ctx.arc(px + .05 * S, py + .06 * S, .14 * S, 0, 6.3); ctx.fill(); ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(px - .06 * S, py - .07 * S, .07 * S, 0, 6.3); ctx.fill(); }
    ctx.beginPath(); for (let k = 0; k < m; k++) { P(pts[k][0] * r, y1, pts[k][1] * r); k ? ctx.lineTo(px, py) : ctx.moveTo(px, py); } ctx.closePath();
    const tc = shade(o.drip ? g.acc : col, 1.06); ctx.fillStyle = tc; ctx.strokeStyle = tc; ctx.fill(); ctx.stroke();
  };
  tier(g.poly, R * 1.18, -.28, 0, GOLD, {});
  g.tiers.forEach((t, i) => tier(g.poly, t.r, t.y0, t.y1, g.main, { drip: sp.finish === 1, ribbon: sp.border === 2, pearls: sp.border === 1, gloss: sp.gloss }));
  const tt = g.tiers[n - 1], rt = tt.r, yt = tt.y1, f = { heart: .55, hexagon: .9, square: .9 }[sp.shape] || .85, ink = lum(sp.finish ? g.acc : g.main) > 140 ? "#4a2a1a" : "#fffaf0";
  if (tp.sprinkles) {
    const pal = [g.acc, [255, 255, 255], [244, 114, 150], [250, 214, 90], [90, 160, 230]]; ctx.lineCap = "round"; ctx.lineWidth = Math.max(1.5, .13 * S);
    for (let i = 0; i < 36; i++) { const a = rnd(i * 2 + 1) * 6.283, rr = Math.sqrt(rnd(i * 2 + 2)) * .86 * f * rt, x = Math.cos(a) * rr, z = Math.sin(a) * rr, ang = rnd(i + 99) * 3.14, dx = Math.cos(ang) * .3, dz = Math.sin(ang) * .3; P(x - dx, yt, z - dz); const x1 = px, y1 = py; P(x + dx, yt, z + dz); ctx.strokeStyle = shade(pal[i % 5], 1); ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(px, py); ctx.stroke(); }
  }
  if (sp.msg && !tp.topper) {
    const ls = lines(sp.msg); ctx.save(); P(0, yt, 0); ctx.transform(c * S / 10, -s * sP * S / 10, s * S / 10, c * sP * S / 10, px, py);
    let fs = 15; ctx.font = `700 ${fs}px Georgia,serif`; const wmax = Math.max(...ls.map(t => ctx.measureText(t).width)) || 1;
    fs = Math.max(6, Math.min(18, fs * 1.8 * f * rt * 10 / wmax)); ctx.font = `700 ${fs}px Georgia,serif`; ctx.fillStyle = ink; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ls.forEach((t, i) => ctx.fillText(t, 0, (i - (ls.length - 1) / 2) * fs * 1.15)); ctx.restore();
  }
  const it = [];
  if (tp.berries) { const bc = ["#c8283c", "#5b3a9a", "#e04a5a"]; for (let i = 0; i < 8; i++) { const a = i / 8 * 6.283 + .3; it.push({ t: "b", x: Math.cos(a) * .72 * f * rt, y: yt + .4, z: Math.sin(a) * .72 * f * rt, col: bc[i % 3] }); } for (let i = 0; i < 3; i++) { const a = i * 2.1; it.push({ t: "b", x: Math.cos(a) * .22 * rt, y: yt + .7, z: Math.sin(a) * .22 * rt, col: bc[(i + 1) % 3] }); } }
  if (tp.flowers) [-2.4, -1.2, .1].forEach((a, i) => it.push({ t: "f", x: Math.cos(a) * .5 * f * rt, y: yt + .5, z: Math.sin(a) * .5 * f * rt, k: i }));
  if (tp.candles) { const k = Math.min(1, rt / 3.5); [-1.1, 0, 1.1].forEach((x, i) => it.push({ t: "c", x: x * k, y: yt, z: (i === 1 ? -.5 : .3) * k })); }
  if (tp.topper) it.push({ t: "p", x: 0, y: yt, z: -.2 });
  for (const q of it) { P(q.x, q.y, q.z); q.px = px; q.py = py; q.pd = pd; }
  it.sort((u, v) => u.pd - v.pd);
  for (const q of it) {
    if (q.t === "b") { ctx.fillStyle = q.col; ctx.beginPath(); ctx.arc(q.px, q.py, .45 * S, 0, 6.3); ctx.fill(); ctx.fillStyle = "rgba(255,255,255,.5)"; ctx.beginPath(); ctx.arc(q.px - .15 * S, q.py - .17 * S, .14 * S, 0, 6.3); ctx.fill(); }
    else if (q.t === "f") {
      ctx.fillStyle = "#4f8a4b"; ctx.beginPath(); ctx.ellipse(q.px + (q.k % 2 ? .9 : -.9) * S, q.py + .2 * S, .55 * S, .22 * S, q.k % 2 ? .5 : -.5, 0, 6.3); ctx.fill();
      ctx.fillStyle = shade(mix(g.acc, .6), 1); for (let j = 0; j < 5; j++) { const a = j * 1.2566 + q.k; ctx.beginPath(); ctx.arc(q.px + Math.cos(a) * .4 * S, q.py + Math.sin(a) * .32 * S, .38 * S, 0, 6.3); ctx.fill(); }
      ctx.fillStyle = "#e8b840"; ctx.beginPath(); ctx.arc(q.px, q.py, .24 * S, 0, 6.3); ctx.fill();
    } else if (q.t === "c") {
      const w = .32 * S, h = 2.4 * S * cP; ctx.fillStyle = "#fffdf6"; ctx.fillRect(q.px - w / 2, q.py - h, w, h);
      ctx.fillStyle = shade(g.acc, 1); for (let i = 0; i < 3; i++) ctx.fillRect(q.px - w / 2, q.py - h + i * h / 3 + h / 12, w, h / 8);
      ctx.fillStyle = "#ffb938"; ctx.beginPath(); ctx.ellipse(q.px, q.py - h - .35 * S, .2 * S, .4 * S, 0, 0, 6.3); ctx.fill(); ctx.fillStyle = "#fff3a0"; ctx.beginPath(); ctx.ellipse(q.px, q.py - h - .28 * S, .09 * S, .22 * S, 0, 0, 6.3); ctx.fill();
    } else {
      P(-.9, yt, q.z); const b1x = px, b1y = py; P(-.9, yt + 1.6, q.z); const t1x = px, t1y = py; P(.9, yt, q.z); const b2x = px, b2y = py; P(.9, yt + 1.6, q.z); const t2x = px, t2y = py; P(0, yt + 2.5, q.z);
      ctx.strokeStyle = shade(GOLD, .9); ctx.lineWidth = Math.max(1.5, .12 * S); ctx.beginPath(); ctx.moveTo(b1x, b1y); ctx.lineTo(t1x, t1y); ctx.moveTo(b2x, b2y); ctx.lineTo(t2x, t2y); ctx.stroke();
      const hw = 2.2 * S * Math.abs(c), hh = .85 * S * cP;
      if (hw > 3) {
        ctx.fillStyle = c > 0 ? "#fffaf0" : "#efe0c4"; ctx.strokeStyle = shade(GOLD, .95); ctx.lineWidth = Math.max(1.5, .1 * S); ctx.fillRect(px - hw, py - hh, hw * 2, hh * 2); ctx.strokeRect(px - hw, py - hh, hw * 2, hh * 2);
        if (c > 0) { const ls = lines(sp.msg || "Happy Birthday"); ctx.save(); ctx.translate(px, py); ctx.scale(Math.abs(c), 1); let fs = .8 * S; ctx.font = `700 ${fs}px Georgia,serif`; const wm = Math.max(...ls.map(t => ctx.measureText(t).width)) || 1; fs = Math.min(fs, fs * 3.9 * S / wm, ls.length > 1 ? .62 * S : fs); ctx.font = `700 ${fs}px Georgia,serif`; ctx.fillStyle = shade(g.acc, .7); ctx.textAlign = "center"; ctx.textBaseline = "middle"; ls.forEach((t, i) => ctx.fillText(t, 0, (i - (ls.length - 1) / 2) * fs * 1.15)); ctx.restore(); }
      }
    }
  }
}
