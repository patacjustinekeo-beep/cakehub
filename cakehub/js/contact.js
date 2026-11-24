import { $, getSettings, esc, validEmail } from "./app.js";
import { db, F } from "./firebase.js";
getSettings().then(s => { $("#ia").textContent = s.address; $("#ip").innerHTML = `<a class="link" href="tel:+63${String(s.phone).replace(/\D/g, "").slice(1)}">${esc(s.phone)}</a><br><a class="link" href="mailto:${esc(s.email)}">${esc(s.email)}</a>`; $("#ih").textContent = s.hours; });
const f = $("#kf"), m = $("#km");
f.onsubmit = async e => {
  e.preventDefault(); m.className = "msg"; const v = n => f[n].value.trim();
  if (v("name").length < 2) return m.textContent = "Please enter your name.";
  if (!validEmail(v("email"))) return m.textContent = "Please enter a valid email address.";
  if (v("message").length < 5) return m.textContent = "Please write a short message.";
  try { await F.addDoc(F.collection(db, "inquiries"), { name: v("name"), email: v("email"), message: v("message"), createdAt: F.serverTimestamp() }); m.className = "msg ok"; m.textContent = "Thank you! We received your message and will reply soon."; f.reset(); } catch (x) { m.textContent = "Sorry, we could not send your message. Please try again or contact us directly."; }
};
