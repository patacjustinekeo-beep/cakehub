import { $, esc, peso, toast, reveal } from "./app.js";
import { CFG } from "./config.js";
import { addItem } from "./cart.js";
import { loadProducts, imgTag, sizesOf, priceOf, card } from "./products.js";
const id = new URLSearchParams(location.search).get("id"), ps = await loadProducts(), p = ps.find(x => String(x.id) === id), D = CFG.design;
if (!p) $("#pd").innerHTML = '<div class="sec"><h1>Cake not found</h1><p><a class="btn" href="cakes.html">Browse all cakes</a></p></div>';
else {
  document.title = p.name + " | CakeHub Tagbilaran";
  const sz = sizesOf(p), opt = (a, f) => a.map((o, i) => `<option value="${i}">${esc(f(o))}</option>`).join("");
  $("#pd").innerHTML = `<div class="pd-grid"><div class="pd-img">${imgTag(p, 630, 630, true)}</div><div><span class="lbl">${esc(p.category)}</span><h1>${esc(p.name)}</h1><p class="pd-price" id="pp"></p><p>${esc(p.desc)}</p>
<form id="pf" novalidate><div class="two-f"><label>Size<select id="sz">${opt(sz, s => s.n + (s.p ? ` (+${peso(s.p)})` : ""))}</select></label><label>Flavor<select id="fl">${opt(D.flavors, f => f[0] + (f[1] ? ` (+${peso(f[1])})` : ""))}</select></label></div>
<div class="two-f"><label>Filling<select id="fi">${opt(D.fillings, f => f[0] + (f[1] ? ` (+${peso(f[1])})` : ""))}</select></label><label>Quantity<span class="qty"><button type="button" data-d="-1" aria-label="Decrease">−</button><input id="qt" type="number" value="1" min="1" max="20" aria-label="Quantity"><button type="button" data-d="1" aria-label="Increase">+</button></span></label></div>
<label>Message on the cake (optional)<input id="ms" maxlength="40" placeholder="Happy Birthday Ana!"></label><p class="note" id="sv"></p><button class="btn" id="ad">Add to Cart</button> <a class="btn ghost" href="customize.html">Customize it instead</a></form>
<details><summary>Allergen information</summary><p class="note">Our cakes contain wheat, eggs and milk and may contain nuts. Please tell us about any allergies when you order.</p></details></div></div>
<div class="sec"><div class="sh"><h2>You may <em>also love</em></h2></div><div class="pgrid" id="rel"></div></div>`;
  const g = n => $("#" + n), unit = () => priceOf(p, sz[+g("sz").value]) + D.flavors[+g("fl").value][1] + D.fillings[+g("fi").value][1];
  const upd = () => { g("pp").textContent = peso(unit()); g("sv").textContent = sz[+g("sz").value].s ? "Serving: " + sz[+g("sz").value].s : ""; }; upd();
  $("#pf").addEventListener("change", upd);
  $("#pf").onclick = e => { const b = e.target.closest("[data-d]"); if (b) g("qt").value = Math.max(1, Math.min(20, (+g("qt").value || 1) + +b.dataset.d)); };
  $("#pf").onsubmit = e => e.preventDefault();
  g("ad").onclick = () => { const s = sz[+g("sz").value], q = Math.max(1, Math.min(20, Math.round(+g("qt").value) || 1)); addItem({ id: p.id, name: p.name, img: p.img && !p.img.startsWith("data:") ? p.img : "", price: unit(), size: s.n, qty: q, opts: { flavor: D.flavors[+g("fl").value][0], filling: D.fillings[+g("fi").value][0], msg: g("ms").value.trim() } }); toast(`${p.name} added to your bag`); };
  const rel = ps.filter(x => x.id !== p.id && x.category === p.category).concat(ps.filter(x => x.id !== p.id && x.category !== p.category)).slice(0, 3); $("#rel").innerHTML = rel.map(card).join(""); reveal();
}
