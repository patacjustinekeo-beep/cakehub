import { CFG } from "./config.js";
import { auth, A, F, db, isOwner, whenUser } from "./firebase.js";
export const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
export const peso = n => "₱" + Number(n).toLocaleString("en-PH");
export const $ = s => document.querySelector(s);
export function toast(t) { const d = document.createElement("div"); d.className = "toast"; d.setAttribute("role", "status"); d.textContent = t; document.body.append(d); setTimeout(() => d.remove(), 3500); }
export const friendly = e => ({ "auth/invalid-credential": "Wrong email or password.", "auth/email-already-in-use": "This email already has an account. Try logging in.", "auth/weak-password": "Password needs at least 6 characters.", "auth/invalid-email": "That email does not look right.", "auth/popup-closed-by-user": "Google sign-in was closed.", "auth/unauthorized-domain": "This website address is not allowed yet. Add it in Firebase > Authentication > Settings > Authorized domains.", "permission-denied": "You do not have permission to do that. Please log in again." }[e.code] || "Something went wrong. Please try again.");
const page = document.body.dataset.page;
const links = [["index", "Home"], ["menu", "Menu"], ["customize", "Customize"], ["dashboard", "My orders & chat"]];
document.getElementById("hd").innerHTML = `<a class="logo" href="index.html"><img src="/images/logo.webp" alt="" width="40" height="40"><span>${esc(CFG.brand)}</span></a><nav aria-label="Main">${links.map(([p, t]) => `<a href="${p}.html"${p === page ? " aria-current=page" : ""}>${t}</a>`).join("")}<a id="acct" class="btn sm" href="login.html">Log in</a></nav>`;
document.getElementById("ft").innerHTML = `<div class="fgrid"><div><b>${esc(CFG.brand)}</b><p>${esc(CFG.tagline)}</p></div><div><b>Visit and contact</b><p>${esc(CFG.address)}</p><p><a href="tel:+63${CFG.phone.replace(/\D/g, "").slice(1)}">${esc(CFG.phone)}</a> · <a href="mailto:${esc(CFG.email)}">${esc(CFG.email)}</a></p><p>${esc(CFG.hours)}</p></div><div><b>Order</b><p><a href="menu.html">Menu</a> · <a href="customize.html">Design your cake</a></p><p><a href="dashboard.html#chat">Chat with us</a> · <a href="${CFG.facebook}" rel="noopener">Facebook</a></p></div></div><p class="copy">© 2026 ${esc(CFG.brand)}</p>`;
A.onAuthStateChanged(auth, u => {
  const a = $("#acct"); if (!a) return;
  if (!u) { a.textContent = "Log in"; a.href = "login.html"; return; }
  if (isOwner(u)) { a.textContent = "Owner panel"; a.href = "owner.html"; } else { a.textContent = "Log out"; a.href = "#"; a.onclick = e => { e.preventDefault(); A.signOut(auth).then(() => location.href = "index.html"); }; }
});
export async function loadMenu(force) {
  const k = "yc_menu", c = !force && JSON.parse(sessionStorage.getItem(k) || "null");
  if (c && Date.now() - c.t < 120000) return c.d;
  let d = [];
  try { const s = await F.getDocs(F.collection(db, "menu")); d = s.docs.map(x => ({ id: x.id, ...x.data() })).filter(x => x.available !== false).sort((a, b) => a.name.localeCompare(b.name)); } catch (e) { }
  if (!d.length) d = CFG.starterMenu.map((m, i) => ({ id: "starter" + i, name: m[0], desc: m[1], price: m[2], emoji: m[3], img: m[4] }));
  sessionStorage.setItem(k, JSON.stringify({ t: Date.now(), d })); return d;
}
export const requireLogin = async () => { const u = await whenUser(); if (!u) location.href = "login.html?next=" + encodeURIComponent(location.pathname.split("/").pop() + location.search); return u; };
export const card = m => `<article class="card pc">${m.img ? `<img src="${esc(m.img)}" alt="${esc(m.name)}" loading="lazy" width="315" height="260">` : `<div class="ph" aria-hidden="true">${esc(m.emoji || "🎂")}</div>`}<div class="in"><h3>${esc(m.name)}</h3><p>${esc(m.desc)}</p><p class="price">${peso(m.price)}</p><a class="btn sm" href="order.html?item=${encodeURIComponent(m.id)}">Order this</a></div></article>`;

// Low-end devices get a lighter look (no blur effects).
{ const n = navigator; if ((n.hardwareConcurrency || 4) <= 4 || (n.deviceMemory || 4) <= 2) document.documentElement.classList.add("lite"); }
document.addEventListener("click", e => { if (e.target.classList?.contains("thumb")) e.target.classList.toggle("zoom"); });
