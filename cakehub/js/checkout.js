import { $, esc, peso, getSettings, requireLogin, validEmail, toast, friendly } from "./app.js";
import { CFG } from "./config.js";
import { db, F } from "./firebase.js";
import { getCart, clearCart, subtotal } from "./cart.js";
const u = await requireLogin(), f = $("#cf"), s = await getSettings();
if (!getCart().length) location.href = "cart.html";
f.name.value = u.displayName || ""; f.email.value = u.email || "";
const min = new Date(Date.now() + CFG.leadDays * 864e5).toISOString().slice(0, 10); f.date.min = min; f.date.value = min;
const pays = (s.payments || []).filter(x => x.on);
$("#pays").innerHTML = pays.length ? pays.map((p, i) => `<label class="pay"><input type="radio" name="pay" value="${esc(p.id)}"${i === 0 ? " checked" : ""}><span><b>${esc(p.label)}</b>${p.note ? `<br><small>${esc(p.note)}</small>` : ""}</span></label>`).join("") : '<p class="note">No payment method is set up yet. Please contact us to arrange payment.</p>';
const fee = () => f.method.value === "Delivery" ? Number(s.deliveryFee) || 0 : 0;
function draw() {
  $("#sum").innerHTML = getCart().map(i => `<div class="r"><span>${i.qty} × ${esc(i.name)}<br><small class="note">${esc(i.size)}</small></span><span>${peso(i.qty * i.price)}</span></div>`).join("");
  $("#st").textContent = peso(subtotal()); $("#df").textContent = fee() ? peso(fee()) : "Free"; $("#tt").textContent = peso(subtotal() + fee());
}
f.addEventListener("change", () => { $("#addr").hidden = f.method.value !== "Delivery"; draw(); }); draw();
f.onsubmit = async e => {
  e.preventDefault(); const err = $("#err"), v = n => f[n].value.trim(), items = getCart(); err.textContent = "";
  if (v("name").length < 2) return err.textContent = "Please enter your full name.";
  if (!validEmail(v("email"))) return err.textContent = "Please enter a valid email address.";
  if (v("phone").replace(/\D/g, "").length < 7) return err.textContent = "Please enter a valid phone number.";
  if (f.method.value === "Delivery" && v("address").length < 8) return err.textContent = "Please enter your complete delivery address.";
  if (!v("date") || v("date") < min) return err.textContent = `Please choose a date from ${min} onward.`;
  const pay = pays.find(p => p.id === (f.querySelector("[name=pay]:checked")?.value)); if (!pay) return err.textContent = "Please choose a payment method.";
  if (!items.length) return err.textContent = "Your bag is empty.";
  const b = $("#place"); b.disabled = true;
  const ref = "CH-" + Date.now().toString(36).toUpperCase().slice(-5) + Math.random().toString(36).slice(2, 5).toUpperCase(), total = subtotal() + fee();
  try {
    await F.addDoc(F.collection(db, "orders"), { uid: u.uid, name: v("name"), email: u.email, phone: v("phone"), kind: "cart", summary: items.map(i => `${i.qty} × ${i.name}`).join(", ").slice(0, 200), items: items.map(i => ({ id: String(i.id), name: i.name, size: i.size, qty: i.qty, price: i.price, opts: { flavor: i.opts?.flavor || "", filling: i.opts?.filling || "", msg: i.opts?.msg || "" } })), total, deliveryFee: fee(), payment: pay.label, ref, date: v("date"), time: f.time.value, method: f.method.value, address: f.method.value === "Delivery" ? v("address") : "", notes: v("notes"), status: "Received", createdAt: F.serverTimestamp() });
    clearCart(); location.href = "confirmation.html?ref=" + ref;
  } catch (x) { err.textContent = friendly(x); b.disabled = false; }
};
