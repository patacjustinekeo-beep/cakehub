import { db, F, auth, A, isOwner } from "./firebase.js";
import { $, esc, peso, requireLogin } from "./app.js";
import { mountChat } from "./chat.js";
import { STATUS } from "./status.js";
const u = await requireLogin(), name = u.displayName || u.email.split("@")[0];
if (isOwner(u)) $("#ownerlink").hidden = false;
$("#hi").textContent = "Hi, " + name + "!";
const tabs = [...document.querySelectorAll("[data-tab]")], panes = ["orders", "chat", "profile"]; let chatOn = false;
function show(t) { tabs.forEach(b => b.setAttribute("aria-selected", b.dataset.tab === t)); panes.forEach(p => $("#" + p).hidden = p !== t); if (t === "chat" && !chatOn) { chatOn = true; mountChat($("#chatbox"), u.uid, "customer", { name, email: u.email }); } history.replaceState(null, "", "#" + t); }
tabs.forEach(b => b.onclick = () => show(b.dataset.tab)); show(panes.includes(location.hash.slice(1)) ? location.hash.slice(1) : "orders");
F.onSnapshot(F.query(F.collection(db, "orders"), F.where("uid", "==", u.uid)), s => {
  const rows = s.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => (b.createdAt?.seconds || 9e9) - (a.createdAt?.seconds || 9e9));
  $("#olist").innerHTML = rows.length ? rows.map(o => `<article class="card o"><span class="badge s-${esc(o.status)}">${esc(o.status)}</span>${o.preview ? `<img class="thumb" src="${o.preview}" alt="Cake design preview. Tap to enlarge.">` : ""}<h3>${esc(o.summary)}</h3><p class="note">${o.ref ? "Ref " + esc(o.ref) + " · " : ""}${o.kind === "custom" ? "Custom request" : "Order"}</p><p>Needed <b>${esc(o.date)}</b> · ${esc(o.method)} · ${peso(o.total)}</p><p>${esc(STATUS[o.status] || "")}</p>${o.status === "Received" ? `<button class="btn ghost sm" data-c="${o.id}">Cancel</button>` : ""}</article>`).join("") : '<p class="empty">No orders yet. <a class="link" href="cakes.html">Pick a cake</a> or <a class="link" href="customize.html">design your own</a>.</p>';
  document.querySelectorAll("[data-c]").forEach(b => b.onclick = () => confirm("Cancel this order?") && F.updateDoc(F.doc(db, "orders", b.dataset.c), { status: "Cancelled" }));
});
const pf = $("#pf"); pf.name.value = u.displayName || ""; pf.email.value = u.email;
F.getDoc(F.doc(db, "users", u.uid)).then(d => { if (d.exists()) { pf.phone.value = d.data().phone || ""; if (d.data().name) pf.name.value = d.data().name; } }).catch(() => { });
pf.onsubmit = async e => { e.preventDefault(); try { await A.updateProfile(u, { displayName: pf.name.value.trim() }); await F.setDoc(F.doc(db, "users", u.uid), { name: pf.name.value.trim(), phone: pf.phone.value.trim(), email: u.email }, { merge: true }); $("#pm").className = "msg ok"; $("#pm").textContent = "Profile saved."; $("#hi").textContent = "Hi, " + pf.name.value.trim() + "!"; } catch (x) { $("#pm").className = "msg"; $("#pm").textContent = "Could not save. Please try again."; } };
$("#out").onclick = () => A.signOut(auth).then(() => location.href = "index.html");
