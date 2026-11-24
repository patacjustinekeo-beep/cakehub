import { $, esc, reveal } from "./app.js";
import { CFG } from "./config.js";
import { loadProducts, card, skeleton } from "./products.js";
const u = new URLSearchParams(location.search);
let all = [], cat = u.get("cat") || "All", term = (u.get("q") || "").toLowerCase(), price = "all", sort = "pop";
$("#q").value = u.get("q") || ""; $("#grid").innerHTML = skeleton(6);
const band = { 1: p => p.price < 1500, 2: p => p.price >= 1500 && p.price <= 2500, 3: p => p.price > 2500 }, ts = p => p.createdAt?.seconds || 0;
function cats() { const have = [...new Set(all.map(p => p.category))], order = [...CFG.categories.filter(c => have.includes(c)), ...have.filter(c => !CFG.categories.includes(c))]; $("#cats").innerHTML = ["All", ...order].map(c => `<button class="cbtn" data-c="${esc(c)}" aria-pressed="${c === cat}">${esc(c)}</button>`).join(""); }
function draw() {
  let l = all.filter(p => (cat === "All" || p.category === cat) && (!term || (p.name + " " + p.desc + " " + p.category).toLowerCase().includes(term)) && (price === "all" || band[price](p)));
  l.sort(sort === "lo" ? (a, b) => a.price - b.price : sort === "hi" ? (a, b) => b.price - a.price : sort === "new" ? (a, b) => ts(b) - ts(a) : (a, b) => (b.pop || 0) - (a.pop || 0));
  $("#cnt").textContent = `${l.length} ${l.length === 1 ? "cake" : "cakes"}`;
  $("#grid").innerHTML = l.length ? l.map(card).join("") : '<p class="empty">No cakes match your search. Try another category or <a class="link" href="customize.html">design your own</a>.</p>'; reveal();
  document.querySelectorAll(".cbtn").forEach(b => b.setAttribute("aria-pressed", b.dataset.c === cat));
}
loadProducts().then(ps => { all = ps; cats(); draw(); });
$("#cats").onclick = e => { const b = e.target.closest("[data-c]"); if (b) { cat = b.dataset.c; draw(); } };
let t; $("#q").oninput = e => { clearTimeout(t); t = setTimeout(() => { term = e.target.value.trim().toLowerCase(); draw(); }, 250); };
$("#pr").onchange = e => { price = e.target.value; draw(); }; $("#so").onchange = e => { sort = e.target.value; draw(); };
