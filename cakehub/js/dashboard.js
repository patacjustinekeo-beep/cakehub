import { db, F, auth, A, isOwner } from "./firebase.js";
import { $, esc, peso, requireLogin } from "./app.js";
import { mountChat } from "./chat.js";
const STATUS = { Received: "We got your order. We will confirm it in the chat.", Confirmed: "Confirmed. We will start baking soon.", Baking: "Your cake is being baked.", Ready: "Ready for pickup or delivery.", Completed: "Done. Thank you!", Cancelled: "This order was cancelled." };
const u = await requireLogin();
if (isOwner(u)) $("#ownerlink").hidden = false;
$("#hi").textContent = "Hi, " + (u.displayName || u.email.split("@")[0]) + "!";
const tabs = [...document.querySelectorAll("[data-tab]")];
let chatOn = false;
function show(t) { tabs.forEach(b => b.setAttribute("aria-selected", b.dataset.tab === t)); $("#orders").hidden = t !== "orders"; $("#chat").hidden = t !== "chat"; if (t === "chat" && !chatOn) { chatOn = true; mountChat($("#chatbox"), u.uid, "customer", { name: u.displayName || u.email.split("@")[0], email: u.email }); } history.replaceState(null, "", "#" + t); }
tabs.forEach(b => b.onclick = () => show(b.dataset.tab));
show(location.hash === "#chat" ? "chat" : "orders");
F.onSnapshot(F.query(F.collection(db, "orders"), F.where("uid", "==", u.uid)), s => {
  const rows = s.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => (b.createdAt?.seconds || 9e9) - (a.createdAt?.seconds || 9e9));
  $("#olist").innerHTML = rows.length ? rows.map(o => `<article class="card o"><span class="badge s-${esc(o.status)}">${esc(o.status)}</span>${o.preview ? `<img class="thumb" src="${o.preview}" alt="Cake design preview. Tap to enlarge.">` : ""}<h3>${esc(o.summary)}</h3><p>Needed on <b>${esc(o.date)}</b> · ${esc(o.method)} · ${peso(o.total)}</p><p>${esc(STATUS[o.status] || "")}</p>${o.status === "Received" ? `<button class="btn alt sm" data-c="${o.id}">Cancel order</button>` : ""}</article>`).join("") : `<p class="empty">No orders yet. <a href="menu.html">Pick a cake</a> or <a href="customize.html">design your own</a>.</p>`;
  document.querySelectorAll("[data-c]").forEach(b => b.onclick = () => confirm("Cancel this order?") && F.updateDoc(F.doc(db, "orders", b.dataset.c), { status: "Cancelled" }));
});
