import { db, F, isOwner, whenUser } from "./firebase.js";
import { $, esc, peso, toast, friendly } from "./app.js";
import { CFG } from "./config.js";
import { mountChat } from "./chat.js";
import { STATUS } from "./status.js";
const u = await whenUser();
if (!isOwner(u)) { $("#gate").hidden = false; $("#panel").hidden = true; throw 0; }
$("#gate").hidden = true; $("#panel").hidden = false;
const tabs = [...document.querySelectorAll("[data-tab]")], panes = ["orders", "menu", "chats"];
const show = t => { tabs.forEach(b => b.setAttribute("aria-selected", b.dataset.tab === t)); panes.forEach(p => $("#" + p).hidden = p !== t); };
tabs.forEach(b => b.onclick = () => show(b.dataset.tab)); show("orders");
// ORDERS
let orders = [], filter = "All";
const drawOrders = () => {
  const c = s => orders.filter(o => o.status === s).length;
  $("#stats").innerHTML = ["Received", "Confirmed", "Baking", "Ready"].map(s => `<div class="stat"><b>${c(s)}</b><span>${s}</span></div>`).join("") + `<div class="stat"><b>${peso(orders.filter(o => o.status === "Completed").reduce((a, o) => a + o.total, 0))}</b><span>Completed sales</span></div>`;
  $("#filter").innerHTML = ["All", ...Object.keys(STATUS)].map(s => `<button class="btn ${s === filter ? "" : "alt"} sm" data-f="${s}">${s}</button>`).join("");
  const l = orders.filter(o => filter === "All" || o.status === filter);
  $("#olist").innerHTML = l.length ? l.map(o => { const d = o.details || {}; return `<article class="card o"><span class="badge s-${esc(o.status)}">${esc(o.status)}</span>${o.preview ? `<img class="thumb" src="${o.preview}" alt="Cake design preview. Tap to enlarge.">` : ""}<h3>${esc(o.summary)}</h3><p><b>${esc(o.name)}</b> · ${esc(o.phone)} · ${esc(o.email)}</p><p>Needed <b>${esc(o.date)}</b> · ${esc(o.method)}${o.address ? " to " + esc(o.address) : ""} · <b>${peso(o.total)}</b></p>${o.kind === "custom" && d.layers ? `<p>${esc([d.layers + (d.layers > 1 ? " layers" : " layer"), d.shape, d.size, d.flavor + " sponge", d.filling + " filling", d.frosting, "border: " + d.border, "finish: " + d.finish, "toppings: " + d.toppings].join(" · "))}<br>Colors: <i class="dotc" style="background:${esc(d.color)}"></i> main ${esc(d.color)} <i class="dotc" style="background:${esc(d.accent)}"></i> accent ${esc(d.accent)}${d.message ? `<br>Message: “${esc(d.message)}”` : ""}${d.cupcakes === "Yes" ? "<br>+ matching cupcakes (6)" : ""}</p>` : ""}${o.notes ? `<p>Notes: ${esc(o.notes)}</p>` : ""}<label>Status <select data-s="${o.id}">${Object.keys(STATUS).map(s => `<option${s === o.status ? " selected" : ""}>${s}</option>`).join("")}</select></label> <button class="btn alt sm" data-chat="${o.uid}" data-n="${esc(o.name)}">Open chat</button></article>`; }).join("") : `<p class="empty">No orders here.</p>`;
  document.querySelectorAll("[data-f]").forEach(b => b.onclick = () => { filter = b.dataset.f; drawOrders(); });
  document.querySelectorAll("[data-s]").forEach(s => s.onchange = () => F.updateDoc(F.doc(db, "orders", s.dataset.s), { status: s.value }).then(() => toast("Status updated")).catch(e => toast(friendly(e))));
  document.querySelectorAll("[data-chat]").forEach(b => b.onclick = () => openChat(b.dataset.chat, b.dataset.n));
};
F.onSnapshot(F.query(F.collection(db, "orders"), F.orderBy("createdAt", "desc"), F.limit(100)), s => { orders = s.docs.map(d => ({ id: d.id, ...d.data() })); drawOrders(); });
// MENU
const mf = $("#mf"); let items = [];
const drawMenu = () => { $("#mlist").innerHTML = items.length ? items.map(m => `<tr><td>${esc(m.emoji || "🎂")} <b>${esc(m.name)}</b><br><small>${esc(m.desc)}</small></td><td>${peso(m.price)}</td><td><button class="btn alt sm" data-a="${m.id}">${m.available === false ? "Show" : "Hide"}</button> <button class="btn alt sm" data-p="${m.id}">Price</button> <button class="btn alt sm" data-d="${m.id}">Delete</button></td></tr>`).join("") : `<tr><td colspan=3>Your menu is empty. Add an item, or load the starter menu.</td></tr>`;
  const g = id => items.find(x => x.id === id);
  document.querySelectorAll("[data-a]").forEach(b => b.onclick = () => F.updateDoc(F.doc(db, "menu", b.dataset.a), { available: g(b.dataset.a).available === false }));
  document.querySelectorAll("[data-p]").forEach(b => b.onclick = () => { const p = +prompt("New price in pesos", g(b.dataset.p).price); if (p > 0) F.updateDoc(F.doc(db, "menu", b.dataset.p), { price: p }); });
  document.querySelectorAll("[data-d]").forEach(b => b.onclick = () => confirm("Delete this item?") && F.deleteDoc(F.doc(db, "menu", b.dataset.d)));
  sessionStorage.removeItem("yc_menu"); };
F.onSnapshot(F.collection(db, "menu"), s => { items = s.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => a.name.localeCompare(b.name)); drawMenu(); });
mf.onsubmit = async e => { e.preventDefault(); try { await F.addDoc(F.collection(db, "menu"), { name: mf.name.value.trim(), desc: mf.desc.value.trim(), price: +mf.price.value, emoji: mf.emoji.value.trim() || "🎂", available: true, createdAt: F.serverTimestamp() }); mf.reset(); toast("Added to the menu"); } catch (x) { toast(friendly(x)); } };
$("#seed").onclick = async () => { for (const m of CFG.starterMenu) await F.addDoc(F.collection(db, "menu"), { name: m[0], desc: m[1], price: m[2], emoji: m[3], img: m[4], available: true, createdAt: F.serverTimestamp() }); toast("Starter menu loaded"); };
// CHATS
let un = null;
function openChat(uid, name) { show("chats"); $("#cname").textContent = name || "Customer"; $("#cwrap").hidden = false; un && un(); un = mountChat($("#cbox"), uid, "owner", {}); $("#cwrap").scrollIntoView({ behavior: "smooth" }); }
F.onSnapshot(F.query(F.collection(db, "chats"), F.orderBy("updatedAt", "desc"), F.limit(50)), s => {
  $("#clist").innerHTML = s.docs.length ? s.docs.map(d => { const c = d.data(); return `<button class="thread" data-u="${d.id}" data-n="${esc(c.name)}">${c.unreadOwner ? '<i class="dot" aria-label="New message"></i>' : ""}<b>${esc(c.name || c.email)}</b><span>${esc(c.lastMessage || "")}</span></button>`; }).join("") : `<p class="empty">No customer messages yet.</p>`;
  document.querySelectorAll("[data-u]").forEach(b => b.onclick = () => openChat(b.dataset.u, b.dataset.n));
  const n = s.docs.filter(d => d.data().unreadOwner).length; $("#cbadge").textContent = n ? ` (${n})` : "";
});
