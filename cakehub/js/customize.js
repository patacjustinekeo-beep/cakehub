import { CFG } from "./config.js";
import { auth, A, db, F } from "./firebase.js";
import { $, esc, peso, toast, friendly } from "./app.js";
import { shrinkImg } from "./chat.js";
import { buildGeo, drawCake, low } from "./cake3d.js";
const D = CFG.design, f = $("#of"), cv = $("#cv"), ctx = cv.getContext("2d");
const chips = (name, label, arr, fmt, on = 0, type = "radio") => `<fieldset><legend>${label}</legend><div class="chips">${arr.map((o, i) => `<label class="chip"><input type="${type}" name="${name}" value="${i}"${i === on ? " checked" : ""}><span>${esc(fmt(o))}</span></label>`).join("")}</div></fieldset>`;
const add = o => o[1] ? ` (+${peso(o[1])})` : "";
const sw = (name, label, def) => `<fieldset><legend>${label}</legend><div class="swatches">${D.colors.map(([n, h]) => `<label class="sw"><input type="radio" name="${name}" value="${h}"${h === def ? " checked" : ""}><span style="background:${h}"></span><i class="sr">${n}</i></label>`).join("")}<label class="custom">Custom <input type="color" name="${name}c" value="${def}" aria-label="${label} custom color"></label></div></fieldset>`;
const grp = (t, body, open) => `<details${open ? " open" : ""}><summary>${t}</summary>${body}</details>`;
const OCC = ["Birthday", "Wedding", "Anniversary", "Graduation", "Corporate event", "Christening", "Other celebration"];
$("#opts").innerHTML =
  grp("1. Layers, shape and size", chips("tiers", "Layers (tiers)", [1, 2, 3], n => n + (n > 1 ? " layers" : " layer"), 1) + chips("shape", "Shape", D.shapes, o => o[0] + add(o)) + chips("size", "Size of the bottom layer", D.sizes, o => o[0], 1), true) +
  grp("2. Flavor and filling", chips("flavor", "Cake flavor", D.flavors, o => o[0] + add(o)) + chips("filling", "Filling", D.fillings, o => o[0] + add(o))) +
  grp("3. Frosting and colors", chips("frosting", "Frosting", D.frostings, o => o[0] + add(o)) + sw("main", "Main color", "#fff4e0") + sw("accent", "Accent color (drip, ribbon, flowers, topper)", "#d4742a") + chips("finish", "Side finish", D.finishes, o => o[0] + add(o)) + chips("border", "Border", D.borders, o => o[0] + add(o))) +
  grp("4. Toppings", chips("top", "Choose any", D.toppings, o => o[0] + add(o), -1, "checkbox") + `<label class="chip"><input type="checkbox" name="cup"><span>${esc(D.cupcakes[0])} (+${peso(D.cupcakes[1])})</span></label>`) +
  grp("5. Occasion, message and reference", `<label>Occasion<select name="occ">${OCC.map(o => `<option>${o}</option>`).join("")}</select></label><label>Message on the cake (optional)<input name="msg" maxlength="28" placeholder="Happy Birthday Ana!"></label><label>Design description<textarea name="notes" rows="3" placeholder="Example: Spider-Man theme, blue and red"></textarea></label><label>Reference photo (optional)<input name="ref" type="file" accept="image/*"></label><img id="rp" class="pv" alt="Your reference photo" hidden><label>Number of cakes<input name="qty" type="number" min="1" max="10" value="1"></label>`) +
  grp("6. Pickup or delivery", `<label>Your name<input name="name" required></label><label>Phone number<input name="phone" type="tel" required></label><div class="two-f"><label>Preferred date<input name="date" type="date" required></label><label>Preferred time<select name="time"><option>Morning (9am to 12pm)</option><option>Afternoon (12pm to 3pm)</option><option>Late afternoon (3pm to 6pm)</option></select></label></div><label>Pickup or delivery<select name="method"><option>Pickup</option><option>Delivery</option></select></label><label id="addr" hidden>Delivery address<input name="address"></label>`);
const min = new Date(Date.now() + CFG.leadDays * 864e5).toISOString().slice(0, 10); f.date.min = min; f.date.value = min;
f.method.onchange = () => { $("#addr").hidden = f.method.value !== "Delivery"; };
A.onAuthStateChanged(auth, u => { if (u && !f.name.value) f.name.value = u.displayName || ""; $("#loginhint").hidden = !!u; });
let refImg = "";
f.ref.onchange = async e => { const x = e.target.files[0]; if (!x) { refImg = ""; $("#rp").hidden = true; return; } try { refImg = await shrinkImg(x, 700, .7); $("#rp").src = refImg; $("#rp").hidden = false; } catch (er) { toast("Could not read that image."); } };
f.addEventListener("invalid", e => { const d = e.target.closest("details"); if (d) d.open = true; toast("Please fill in your name, phone and date."); }, true);
const custom = {};
const idx = n => +(f.querySelector(`[name=${n}]:checked`)?.value || 0);
const col = n => custom[n] || f.querySelector(`[name=${n}]:checked`)?.value || "#ffffff";
f.addEventListener("input", e => { const n = e.target.name; if (n === "mainc" || n === "accentc") { custom[n.slice(0, -1)] = e.target.value; f.querySelectorAll(`[name=${n.slice(0, -1)}]`).forEach(r => r.checked = false); } else if (n === "main" || n === "accent") delete custom[n]; update(); });
let geo, spec, price = 0, qty = 1, summary = "", details = {};
function inside(fl, fi, main) { const L = [fl[2], fi[2], fl[2], fi[2], fl[2]], H = [16, 7, 16, 7, 16]; let y = 12; return `<svg viewBox="0 0 200 90" role="img" aria-label="Inside your cake: ${esc(fl[0])} sponge with ${esc(fi[0])} filling"><rect x="30" y="6" width="140" height="78" rx="8" fill="${main}" stroke="rgba(0,0,0,.18)"/>${L.map((c, i) => { const r = `<rect x="38" y="${y}" width="124" height="${H[i]}" fill="${c}"/>`; y += H[i]; return r; }).join("")}</svg>`; }
function update() {
  const tiers = idx("tiers") + 1, size = D.sizes[idx("size")], shape = D.shapes[idx("shape")], fl = D.flavors[idx("flavor")], fi = D.fillings[idx("filling")], fr = D.frostings[idx("frosting")], bo = D.borders[idx("border")], fn = D.finishes[idx("finish")];
  const tops = [...f.querySelectorAll("[name=top]:checked")].map(i => D.toppings[+i.value]), cup = f.cup.checked, top = {}; tops.forEach(t => top[t[2]] = 1);
  qty = Math.max(1, Math.min(10, Math.round(+f.qty.value) || 1));
  price = Math.round((D.tierBase[tiers] * size[2] + shape[2] + fl[1] + fi[1] + fr[1] + bo[1] + fn[1] + tops.reduce((a, t) => a + t[1], 0) + (cup ? D.cupcakes[1] : 0)) * qty);
  spec = { tiers, shape: shape[1], d: size[1], main: col("main"), accent: col("accent"), border: idx("border"), finish: idx("finish"), gloss: !!fr[2], msg: f.msg.value.trim(), top };
  geo = buildGeo(spec);
  let serves = 0; for (let i = 0; i < tiers; i++) { const d = size[1] * Math.pow(.74, i); serves += Math.round(d * d * .2); }
  summary = `${tiers} ${tiers > 1 ? "layers" : "layer"}, ${shape[0]}, ${size[0]}, ${fl[0]}, ${fr[0]}${qty > 1 ? ` × ${qty}` : ""}`;
  details = { layers: tiers, shape: shape[0], size: size[0], flavor: fl[0], filling: fi[0], frosting: fr[0], color: spec.main, accent: spec.accent, border: bo[0], finish: fn[0], toppings: tops.map(t => t[0]).join(", ") || "None", message: spec.msg, cupcakes: cup ? "Yes" : "No", occasion: f.occ.value };
  $("#inside").innerHTML = inside(fl, fi, spec.main); $("#sum").textContent = `${summary}. Serves about ${serves * qty}. Inside: ${fl[0]} sponge with ${fi[0]} filling.`; $("#total").textContent = peso(price); kick();
}
let theta = .5, auto = !matchMedia("(prefers-reduced-motion: reduce)").matches, drag = false, shown = true, raf = 0, last = 0, dpr = 1;
const gap = low ? 45 : 30, rot = $("#rot"), autoBtn = $("#auto");
function size() { dpr = Math.min(devicePixelRatio || 1, low ? 1 : 1.75); const w = Math.round(cv.clientWidth * dpr); if (w && cv.width !== w) { cv.width = w; cv.height = w; } }
function frame(t) {
  raf = 0; if (document.hidden || !shown) return;
  if (t - last < gap) { raf = requestAnimationFrame(frame); return; }
  if (auto && !drag) { theta += Math.min(100, t - last) * .0004; rot.value = Math.round(((theta * 57.3) % 360 + 360) % 360); }
  last = t; if (cv.width) drawCake(ctx, cv.width, cv.height, geo, theta);
  if (auto && !drag) raf = requestAnimationFrame(frame);
}
function kick() { if (!raf) raf = requestAnimationFrame(frame); }
const setRot = () => { rot.value = Math.round(((theta * 57.3) % 360 + 360) % 360); kick(); };
new ResizeObserver(() => { size(); kick(); }).observe(cv);
new IntersectionObserver(e => { shown = e[0].isIntersecting; if (shown) kick(); }).observe(cv);
document.addEventListener("visibilitychange", () => !document.hidden && kick());
let sx = 0;
cv.onpointerdown = e => { drag = true; sx = e.clientX; cv.setPointerCapture(e.pointerId); };
cv.onpointermove = e => { if (!drag) return; theta += (e.clientX - sx) * .012; sx = e.clientX; setRot(); };
cv.onpointerup = cv.onpointercancel = () => { drag = false; kick(); };
cv.onkeydown = e => { if (e.key === "ArrowLeft" || e.key === "ArrowRight") { theta += (e.key === "ArrowLeft" ? -1 : 1) * .17; setRot(); e.preventDefault(); } };
rot.oninput = () => { theta = rot.value / 57.3; auto = false; autoBtn.setAttribute("aria-pressed", "false"); kick(); };
autoBtn.setAttribute("aria-pressed", auto); autoBtn.onclick = () => { auto = !auto; autoBtn.setAttribute("aria-pressed", auto); kick(); };
size(); update();
function snapshot() { const oc = document.createElement("canvas"); oc.width = oc.height = 480; const o = oc.getContext("2d"); o.fillStyle = "#efe4d0"; o.fillRect(0, 0, 480, 480); drawCake(o, 480, 480, geo, .55); return oc.toDataURL("image/jpeg", .72); }
f.onsubmit = async e => {
  e.preventDefault(); const u = auth.currentUser;
  if (!u) { $("#loginhint").hidden = false; toast("Please log in first. Your design stays here."); return; }
  const b = $("#send"); b.disabled = true; update();
  try {
    const preview = snapshot(), o = { uid: u.uid, name: f.name.value.trim(), email: u.email, phone: f.phone.value.trim(), kind: "custom", summary: "Custom request: " + summary, details, total: price, qty, occasion: f.occ.value, date: f.date.value, time: f.time.value, method: f.method.value, address: f.method.value === "Delivery" ? f.address.value.trim() : "", notes: f.notes.value.trim(), status: "Received", preview, createdAt: F.serverTimestamp() };
    if (refImg) o.refImg = refImg;
    await F.addDoc(F.collection(db, "orders"), o);
    const tref = F.doc(db, "chats", u.uid);
    await F.setDoc(tref, { name: u.displayName || u.email.split("@")[0], email: u.email, unreadOwner: true, lastMessage: "🎂 New cake design request", updatedAt: F.serverTimestamp() }, { merge: true });
    await F.addDoc(F.collection(tref, "messages"), { from: "customer", at: F.serverTimestamp(), text: `New custom cake request (${f.occ.value}): ${summary}. Toppings: ${details.toppings}. Needed ${f.date.value}. Estimate ${peso(price)}.${spec.msg ? ` Message: ${spec.msg}.` : ""}`.slice(0, 900), img: preview });
    toast("Request sent! We will confirm it in your chat."); setTimeout(() => location.href = "dashboard.html#chat", 1000);
  } catch (x) { toast(friendly(x)); b.disabled = false; }
};
