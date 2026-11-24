import { db, F, A, isOwner, whenUser } from "./firebase.js";
import { $, $$, esc, peso, toast, friendly } from "./app.js";
import { CFG } from "./config.js";
import { mountChat, shrinkImg } from "./chat.js";
import { STATUS } from "./status.js";
import { STARTER } from "./products.js";
const u = await whenUser();
if (!isOwner(u)) {
  $("#gate").hidden = false; $("#panel").hidden = true;
  if (u && u.email === CFG.ownerEmail) { // right account, email not verified yet
    $("#vbox").hidden = false;
    $("#vsend").onclick = () => A.sendEmailVerification(u).then(() => toast("Verification email sent. Check your inbox and spam.")).catch(e => toast(friendly(e)));
    $("#vdone").onclick = async () => { await u.reload(); await u.getIdToken(true); location.reload(); };
  }
  throw 0;
}
$("#gate").hidden = true; $("#panel").hidden = false;
const tabs = $$("[data-tab]"), panes = ["overview", "orders", "products", "customers", "site", "chats"];
const show = t => { tabs.forEach(b => b.setAttribute("aria-selected", b.dataset.tab === t)); panes.forEach(p => $("#" + p).hidden = p !== t); };
tabs.forEach(b => b.onclick = () => show(b.dataset.tab)); show("overview");
const err = e => toast(friendly(e));
// ---------- data
let orders = [], filter = "All", users = [], prods = [];
const dl = o => { const d = o.details || {}; return o.kind === "custom" && d.layers ? `<p>${esc([d.occasion, d.layers + (d.layers > 1 ? " layers" : " layer"), d.shape, d.size, d.flavor + " sponge", d.filling + " filling", d.frosting, "border: " + d.border, "finish: " + d.finish, "toppings: " + d.toppings].filter(Boolean).join(" · "))}<br>Colors: <i class="dotc" style="background:${esc(d.color)}"></i> ${esc(d.color)} <i class="dotc" style="background:${esc(d.accent)}"></i> ${esc(d.accent)}${d.message ? `<br>Message: “${esc(d.message)}”` : ""}${d.cupcakes === "Yes" ? "<br>+ matching cupcakes (6)" : ""}${o.qty > 1 ? `<br>Quantity: ${o.qty}` : ""}</p>` : ""; };
const items = o => (o.items || []).length ? `<p>${o.items.map(i => `${i.qty} × ${esc(i.name)} (${esc(i.size)}${i.opts?.flavor ? ", " + esc(i.opts.flavor) : ""}${i.opts?.filling ? ", " + esc(i.opts.filling) : ""}${i.opts?.msg ? `, “${esc(i.opts.msg)}”` : ""})`).join("<br>")}</p>` : "";
const card = o => `<article class="card o"><span class="badge s-${esc(o.status)}">${esc(o.status)}</span>${o.preview ? `<img class="thumb" src="${o.preview}" alt="Cake design preview. Tap to enlarge.">` : ""}${o.refImg ? `<img class="thumb" src="${o.refImg}" alt="Customer reference photo. Tap to enlarge.">` : ""}<h3>${esc(o.summary)}</h3><p class="note">${o.ref ? "Ref " + esc(o.ref) + " · " : ""}${o.kind === "custom" ? "Custom request" : "Order"}</p><p><b>${esc(o.name)}</b> · ${esc(o.phone)} · ${esc(o.email)}</p><p>${esc(o.method)}${o.address ? " to " + esc(o.address) : ""} · <b>${esc(o.date)}</b> ${esc(o.time || "")} · <b>${peso(o.total)}</b>${o.deliveryFee ? ` (incl. ${peso(o.deliveryFee)} delivery)` : ""}${o.payment ? ` · ${esc(o.payment)}` : ""}</p>${items(o)}${dl(o)}${o.notes ? `<p>Notes: ${esc(o.notes)}</p>` : ""}<div class="two-f" style="max-width:520px"><label>Status<select data-s="${o.id}">${Object.keys(STATUS).map(s => `<option${s === o.status ? " selected" : ""}>${s}</option>`).join("")}</select></label><label>Payment<select data-p="${o.id}">${["Unpaid", "Paid", "Refunded"].map(s => `<option${s === (o.payStatus || "Unpaid") ? " selected" : ""}>${s}</option>`).join("")}</select></label></div><p>${o.kind === "custom" && o.status === "Received" ? `<button class="btn sm" data-ap="${o.id}">Approve request</button> ` : ""}${o.status !== "Cancelled" && o.status !== "Completed" ? `<button class="btn ghost sm" data-cx="${o.id}">Cancel order</button> ` : ""}<button class="btn ghost sm" data-chat="${o.uid}" data-n="${esc(o.name)}">Open chat</button></p></article>`;
function drawOverview() {
  const cnt = s => orders.filter(o => s.includes(o.status)).length, sales = orders.filter(o => o.status === "Completed").reduce((a, o) => a + o.total, 0);
  $("#stats").innerHTML = [[orders.length, "Total orders"], [cnt(["Received", "Confirmed", "Baking", "Ready"]), "Pending"], [cnt(["Completed"]), "Completed"], [peso(sales), "Total sales"], [cnt(["Received"]), "New / to review"]].map(([b, l]) => `<div class="stat"><b>${b}</b><span>${l}</span></div>`).join("");
  $("#recent").innerHTML = orders.slice(0, 5).map(o => `<div class="card o"><span class="badge s-${esc(o.status)}">${esc(o.status)}</span><b>${esc(o.name)}</b><p class="note">${esc(o.summary)} · ${peso(o.total)}</p></div>`).join("") || '<p class="empty">No orders yet.</p>';
  const pop = {}; orders.filter(o => o.status !== "Cancelled").forEach(o => { if (o.items) o.items.forEach(i => pop[i.name] = (pop[i.name] || 0) + i.qty); else if (o.kind === "custom") pop["Custom cakes"] = (pop["Custom cakes"] || 0) + (o.qty || 1); else if (o.details?.item) pop[o.details.item] = (pop[o.details.item] || 0) + (o.details.qty || 1); });
  $("#popular").innerHTML = Object.entries(pop).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([n, q]) => `<div class="card o"><b>${esc(n)}</b> <span class="note">· ${q} sold</span></div>`).join("") || '<p class="empty">No data yet.</p>';
}
function drawOrders() {
  $("#filter").innerHTML = ["All", ...Object.keys(STATUS)].map(s => `<button class="cbtn" data-f="${s}" aria-pressed="${s === filter}">${s}${s === "All" ? "" : " (" + orders.filter(o => o.status === s).length + ")"}</button>`).join("");
  const l = orders.filter(o => filter === "All" || o.status === filter); $("#olist").innerHTML = l.length ? l.map(card).join("") : '<p class="empty">No orders here.</p>';
}
function drawCustomers() {
  $("#clist2").innerHTML = users.length ? users.map(c => { const os = orders.filter(o => o.uid === c.id); return `<details><summary>${esc(c.name || c.email)} <span class="note">· ${esc(c.email)}${c.phone ? " · " + esc(c.phone) : ""} · ${os.length} orders · ${peso(os.filter(o => o.status === "Completed").reduce((a, o) => a + o.total, 0))} completed</span></summary>${os.map(o => `<p class="note">${esc(o.ref || "")} ${esc(o.summary)} · ${esc(o.status)} · ${peso(o.total)}</p>`).join("") || '<p class="note">No orders yet.</p>'}</details>`; }).join("") : '<p class="empty">No registered customers yet.</p>';
}
F.onSnapshot(F.query(F.collection(db, "orders"), F.orderBy("createdAt", "desc"), F.limit(200)), s => { orders = s.docs.map(d => ({ id: d.id, ...d.data() })); drawOverview(); drawOrders(); drawCustomers(); }, err);
F.onSnapshot(F.query(F.collection(db, "users"), F.limit(200)), s => { users = s.docs.map(d => ({ id: d.id, ...d.data() })); drawCustomers(); }, err);
const ol = $("#olist");
ol.addEventListener("change", e => { const t = e.target, id = t.dataset.s || t.dataset.p; if (!id) return; F.updateDoc(F.doc(db, "orders", id), t.dataset.s ? { status: t.value } : { payStatus: t.value }).then(() => toast("Updated")).catch(err); });
ol.addEventListener("click", e => { const a = e.target.closest("[data-ap]"), x = e.target.closest("[data-cx]"), c = e.target.closest("[data-chat]"); if (a) F.updateDoc(F.doc(db, "orders", a.dataset.ap), { status: "Confirmed" }).then(() => toast("Request approved")).catch(err); if (x && confirm("Cancel this order?")) F.updateDoc(F.doc(db, "orders", x.dataset.cx), { status: "Cancelled" }).catch(err); if (c) openChat(c.dataset.chat, c.dataset.n); });
$("#filter").onclick = e => { const b = e.target.closest("[data-f]"); if (b) { filter = b.dataset.f; drawOrders(); } };
// ---------- products
const pf = $("#pform"); let editId = "", pimg = "";
$("#pcat").innerHTML = CFG.categories.map(c => `<option>${esc(c)}</option>`).join("");
const sizesTxt = s => (s || []).map(z => `${z.n}:${z.p || 0}${z.s ? ":" + z.s : ""}`).join(", ");
const parseSizes = t => t.split(",").map(x => x.trim()).filter(Boolean).map(x => { const [n, p, s] = x.split(":").map(y => y.trim()); return { n, p: Number(p) || 0, ...(s ? { s } : {}) }; });
pf.photo.onchange = async e => { const x = e.target.files[0]; if (!x) return; try { pimg = await shrinkImg(x, 700, .75); $("#pprev").src = pimg; $("#pprev").hidden = false; } catch (er) { toast("Could not read that image."); } };
function resetForm() { pf.reset(); editId = ""; pimg = ""; $("#pprev").hidden = true; $("#ptitle").textContent = "Add product"; $("#pcancel").hidden = true; pf.available.checked = true; pf.pop.value = 50; }
$("#pcancel").onclick = resetForm;
pf.onsubmit = async e => {
  e.preventDefault();
  const d = { name: pf.name.value.trim(), desc: pf.desc.value.trim(), category: pf.category.value, price: Number(pf.price.value), pop: Number(pf.pop.value) || 0, sizes: parseSizes(pf.sizes.value), featured: pf.featured.checked, bestseller: pf.bestseller.checked, available: pf.available.checked };
  if (pimg) d.img = pimg;
  try { if (editId) await F.setDoc(F.doc(db, "menu", editId), d, { merge: true }); else await F.addDoc(F.collection(db, "menu"), { ...d, createdAt: F.serverTimestamp() }); sessionStorage.removeItem("yc_prod"); toast("Product saved"); resetForm(); } catch (x) { err(x); }
};
F.onSnapshot(F.collection(db, "menu"), s => {
  prods = s.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  $("#plist").innerHTML = prods.length ? prods.map(p => `<tr><td>${p.img ? `<img src="${esc(p.img)}" alt="" width="48" height="48" style="border-radius:8px;object-fit:cover">` : ""}</td><td><b>${esc(p.name)}</b><br><small class="note">${esc(p.category || "")} · ${p.featured ? "featured · " : ""}${p.bestseller ? "best seller · " : ""}${p.available === false ? "hidden" : "available"}</small></td><td>${peso(p.price)}</td><td><button class="btn ghost sm" data-e="${p.id}">Edit</button> <button class="btn ghost sm" data-a="${p.id}">${p.available === false ? "Show" : "Hide"}</button> <button class="btn ghost sm" data-d="${p.id}">Delete</button></td></tr>`).join("") : '<tr><td colspan="4">No products yet. Add one, or load the starter products.</td></tr>';
  sessionStorage.removeItem("yc_prod");
}, err);
$("#plist").onclick = e => {
  const b = e.target.closest("button"); if (!b) return; const id = b.dataset.e || b.dataset.a || b.dataset.d, p = prods.find(x => x.id === id); if (!p) return;
  if (b.dataset.a) F.updateDoc(F.doc(db, "menu", id), { available: p.available === false }).catch(err);
  else if (b.dataset.d) { if (confirm("Delete this product?")) F.deleteDoc(F.doc(db, "menu", id)).catch(err); }
  else { editId = id; pf.name.value = p.name || ""; pf.desc.value = p.desc || ""; pf.category.value = p.category || CFG.categories[0]; pf.price.value = p.price; pf.pop.value = p.pop ?? 50; pf.sizes.value = sizesTxt(p.sizes); pf.featured.checked = !!p.featured; pf.bestseller.checked = !!p.bestseller; pf.available.checked = p.available !== false; pimg = ""; $("#pprev").src = p.img || ""; $("#pprev").hidden = !p.img; $("#ptitle").textContent = "Edit product"; $("#pcancel").hidden = false; pf.scrollIntoView({ behavior: "smooth" }); }
};
$("#seed").onclick = async () => { try { for (const { id, ...p } of STARTER) await F.addDoc(F.collection(db, "menu"), { ...JSON.parse(JSON.stringify(p)), createdAt: F.serverTimestamp() }); toast("Starter products loaded"); } catch (x) { err(x); } };
// ---------- site settings
const sf = $("#sf");
$("#paycfg").innerHTML = CFG.defaults.payments.map(p => `<div class="pay"><input type="checkbox" name="on_${p.id}" aria-label="Enable ${esc(p.label)}"><span style="flex:1"><b>${esc(p.label)}</b><input name="note_${p.id}" placeholder="Instructions shown to customers (for example your account number)" style="margin-top:.4rem"></span></div>`).join("");
F.getDoc(F.doc(db, "settings", "site")).then(d => {
  const s = { ...CFG.defaults, ...(d.exists() ? d.data() : {}) };
  for (const k of ["heroTitle", "heroText", "promo", "phone", "email", "address", "hours", "deliveryFee"]) sf[k].value = s[k] ?? "";
  CFG.defaults.payments.forEach(p => { const q = (s.payments || []).find(x => x.id === p.id) || p; sf["on_" + p.id].checked = !!q.on; sf["note_" + p.id].value = q.note || ""; });
}).catch(() => { });
sf.onsubmit = async e => {
  e.preventDefault(); const v = k => sf[k].value.trim();
  const d = { heroTitle: v("heroTitle"), heroText: v("heroText"), promo: v("promo"), phone: v("phone"), email: v("email"), address: v("address"), hours: v("hours"), deliveryFee: Number(v("deliveryFee")) || 0, payments: CFG.defaults.payments.map(p => ({ id: p.id, label: p.label, on: sf["on_" + p.id].checked, note: v("note_" + p.id) })) };
  try { await F.setDoc(F.doc(db, "settings", "site"), d, { merge: true }); sessionStorage.removeItem("yc_set"); $("#sm").textContent = "Saved. The website now uses these settings."; } catch (x) { err(x); }
};
// ---------- chats
let un = null;
function openChat(uid, name) { show("chats"); $("#cname").textContent = name || "Customer"; $("#cwrap").hidden = false; un && un(); un = mountChat($("#cbox"), uid, "owner", {}); $("#cwrap").scrollIntoView({ behavior: "smooth" }); }
F.onSnapshot(F.query(F.collection(db, "chats"), F.orderBy("updatedAt", "desc"), F.limit(50)), s => {
  $("#clist").innerHTML = s.docs.length ? s.docs.map(d => { const c = d.data(); return `<button class="thread" data-u="${d.id}" data-n="${esc(c.name)}">${c.unreadOwner ? '<i class="dot" aria-label="New message"></i>' : ""}<b>${esc(c.name || c.email)}</b><span>${esc(c.lastMessage || "")}</span></button>`; }).join("") : '<p class="empty">No customer messages yet.</p>';
  $$("[data-u]").forEach(b => b.onclick = () => openChat(b.dataset.u, b.dataset.n));
  const n = s.docs.filter(d => d.data().unreadOwner).length; $("#cbadge").textContent = n ? ` (${n})` : "";
}, err);
