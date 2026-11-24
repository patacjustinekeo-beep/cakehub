import { CFG } from "./config.js";
import { db, F } from "./firebase.js";
import { $, esc, peso, toast, loadMenu, requireLogin, friendly } from "./app.js";
const f = $("#of");
const min = new Date(Date.now() + CFG.leadDays * 864e5).toISOString().slice(0, 10); f.date.min = min; f.date.value = min;
let menu = [];
(async () => {
  const u = await requireLogin(); f.name.value = u.displayName || "";
  menu = await loadMenu(); const want = new URLSearchParams(location.search).get("item");
  f.item.innerHTML = menu.map(m => `<option value="${esc(m.id)}"${m.id === want ? " selected" : ""}>${esc(m.name)} (${peso(m.price)})</option>`).join("");
  calc();
})();
function calc() {
  const m = menu.find(x => x.id === f.item.value), q = Math.max(1, Math.min(50, +f.qty.value || 1));
  const total = m ? m.price * q : 0; $("#total").textContent = peso(total);
  return { total, summary: m ? `${q} × ${m.name}` : "", details: { item: m?.name || "", qty: q } };
}
f.addEventListener("input", calc); f.addEventListener("change", calc);
f.method.onchange = () => { $("#addr").hidden = f.method.value !== "Delivery"; };
f.onsubmit = async e => {
  e.preventDefault(); const u = await requireLogin(), c = calc(); if (!c.total) return;
  const b = f.querySelector("button.btn:last-of-type"); b.disabled = true;
  try {
    await F.addDoc(F.collection(db, "orders"), { uid: u.uid, name: f.name.value.trim(), email: u.email, phone: f.phone.value.trim(), kind: "menu", summary: c.summary, details: c.details, total: c.total, date: f.date.value, method: f.method.value, address: f.method.value === "Delivery" ? f.address.value.trim() : "", notes: f.notes.value.trim(), status: "Received", createdAt: F.serverTimestamp() });
    toast("Order sent! We will confirm in your chat."); setTimeout(() => location.href = "dashboard.html", 900);
  } catch (x) { toast(friendly(x)); b.disabled = false; }
};
