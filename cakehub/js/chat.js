import { db, F } from "./firebase.js";
import { esc } from "./app.js";
function shrink(file) { return new Promise((res, rej) => { const i = new Image(), u = URL.createObjectURL(file); i.onload = () => { const s = Math.min(1, 900 / Math.max(i.width, i.height)), c = document.createElement("canvas"); c.width = i.width * s; c.height = i.height * s; c.getContext("2d").drawImage(i, 0, 0, c.width, c.height); URL.revokeObjectURL(u); res(c.toDataURL("image/jpeg", .6)); }; i.onerror = rej; i.src = u; }); }
// role: "customer" | "owner". uid = the customer's uid (thread id). Photos are shrunk and stored in Firestore, so no paid Storage plan is needed.
export function mountChat(el, uid, role, who) {
  el.innerHTML = `<div class="log" aria-live="polite"></div><form class="send"><input name="t" maxlength="1000" placeholder="Type your message" autocomplete="off" aria-label="Message"><label class="btn alt sm">Photo<input type="file" accept="image/*" hidden></label><button class="btn sm">Send</button></form>`;
  const log = el.querySelector(".log"), f = el.querySelector("form"), tref = F.doc(db, "chats", uid);
  const seen = role === "owner" ? { unreadOwner: false } : { unreadCustomer: false };
  const un = F.onSnapshot(F.query(F.collection(tref, "messages"), F.orderBy("at"), F.limitToLast(60)), s => {
    log.innerHTML = s.docs.length ? s.docs.map(d => { const m = d.data(); return `<div class="b ${m.from === role ? "me" : "them"}">${m.img ? `<img src="${m.img}" alt="Photo sent in chat" loading="lazy">` : ""}${m.text ? `<p>${esc(m.text)}</p>` : ""}</div>`; }).join("") : `<p class="empty">No messages yet. Say hi and tell us what cake you want.</p>`;
    log.scrollTop = log.scrollHeight; if (s.docs.length) F.setDoc(tref, seen, { merge: true }).catch(() => { });
  }, () => { log.innerHTML = '<p class="empty">Could not load the chat. Please log in again.</p>'; });
  async function send(m) {
    const meta = role === "owner" ? { unreadCustomer: true, unreadOwner: false } : { name: who.name, email: who.email, unreadOwner: true };
    await F.setDoc(tref, { ...meta, lastMessage: m.text || "📷 Photo", updatedAt: F.serverTimestamp() }, { merge: true });
    await F.addDoc(F.collection(tref, "messages"), { from: role, at: F.serverTimestamp(), ...m });
  }
  f.onsubmit = async e => { e.preventDefault(); const t = f.t.value.trim(); if (!t) return; f.t.value = ""; try { await send({ text: t }); } catch (x) { f.t.value = t; } };
  f.querySelector("input[type=file]").onchange = async e => { const x = e.target.files[0]; if (!x) return; try { await send({ img: await shrink(x) }); } catch (er) { alert("Could not send the photo."); } e.target.value = ""; };
  return un;
}
export function shrinkImg(file, max = 700, q = .7) { return new Promise((res, rej) => { const i = new Image(), u = URL.createObjectURL(file); i.onload = () => { const s = Math.min(1, max / Math.max(i.width, i.height)), c = document.createElement("canvas"); c.width = Math.round(i.width * s); c.height = Math.round(i.height * s); c.getContext("2d").drawImage(i, 0, 0, c.width, c.height); URL.revokeObjectURL(u); res(c.toDataURL("image/jpeg", q)); }; i.onerror = rej; i.src = u; }); }
