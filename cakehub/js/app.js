import { CFG } from "./config.js";
import { auth, A, F, db, isOwner, whenUser } from "./firebase.js";
import { count } from "./cart.js";
export const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
export const peso = n => "₱" + Number(n).toLocaleString("en-PH");
export const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
export function toast(t) { const d = document.createElement("div"); d.className = "toast"; d.setAttribute("role", "status"); d.textContent = t; document.body.append(d); setTimeout(() => d.remove(), 3200); }
export const friendly = e => ({ "auth/invalid-credential": "Wrong email or password.", "auth/email-already-in-use": "This email already has an account. Try logging in.", "auth/weak-password": "Password needs at least 6 characters.", "auth/invalid-email": "That email does not look right.", "auth/popup-closed-by-user": "Google sign-in was closed.", "auth/unauthorized-domain": "This website address is not allowed yet. Add it in Firebase > Authentication > Settings > Authorized domains.", "permission-denied": "You do not have permission to do that. Please log in again, and make sure the latest Firestore rules are published." }[e.code] || "Something went wrong. Please try again.");
export const validEmail = v => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v);
export async function getSettings() {
  const k = "yc_set", c = JSON.parse(sessionStorage.getItem(k) || "null"); if (c && Date.now() - c.t < 300000) return c.d;
  let d = {}; try { const s = await F.getDoc(F.doc(db, "settings", "site")); if (s.exists()) d = s.data(); } catch (e) { }
  const m = { ...CFG.defaults, ...d }; sessionStorage.setItem(k, JSON.stringify({ t: Date.now(), d: m })); return m;
}
export const requireLogin = async () => { const u = await whenUser(); if (!u) location.href = "login.html?next=" + encodeURIComponent(location.pathname.split("/").pop() + location.search); return u; };
const page = document.body.dataset.page, hd = document.getElementById("hd"), ft = document.getElementById("ft");
const links = [["index", "Home"], ["cakes", "Our Cakes"], ["customize", "Custom Cakes"], ["about", "About Us"], ["contact", "Contact"]];
const cur = p => p === page ? " aria-current=page" : "";
const IC = { s: '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>', b: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M5 8h14l-1 12H6L5 8z"/><path d="M9 8a3 3 0 016 0"/></svg>' };
hd.className = "nav";
hd.innerHTML = `<a class="brand" href="index.html"><img src="/images/logo.webp" alt="" width="36" height="36"><span><b>CakeHub</b><small>Tagbilaran</small></span></a><button class="burger" aria-label="Menu" aria-expanded="false"><span></span><span></span></button>
<nav class="links" aria-label="Main">${links.map(([p, t]) => p === "cakes" ? `<div class="dd"><a href="cakes.html"${cur(p)}>${t}</a><div class="ddm">${CFG.categories.map(c => `<a href="cakes.html?cat=${encodeURIComponent(c)}">${esc(c)}</a>`).join("")}</div></div>` : `<a href="${p}.html"${cur(p)}>${t}</a>`).join("")}</nav>
<div class="acts"><button class="ic" id="sbtn" aria-label="Search cakes">${IC.s}</button><a class="ic bag" href="cart.html" aria-label="Shopping bag">${IC.b}<i id="bagn">0</i></a><a class="mini" id="acct" href="login.html">Log in</a><a class="mini" id="lo" href="#" hidden>Log out</a><a class="btn sm" href="cakes.html">Order Now</a></div>
<form class="search" id="sform" hidden role="search"><input type="search" id="sq" placeholder="Search our cakes" aria-label="Search cakes"><button class="btn sm">Search</button></form>`;
$(".burger").onclick = e => { const o = hd.classList.toggle("open"); e.currentTarget.setAttribute("aria-expanded", o); };
$("#sbtn").onclick = () => { const f = $("#sform"); f.hidden = !f.hidden; if (!f.hidden) $("#sq").focus(); };
$("#sform").onsubmit = e => { e.preventDefault(); location.href = "cakes.html?q=" + encodeURIComponent($("#sq").value.trim()); };
addEventListener("scroll", () => hd.classList.toggle("scrolled", scrollY > 12), { passive: true });
const badge = () => { const n = count(), b = $("#bagn"); b.textContent = n; b.hidden = !n; b.classList.remove("bump"); void b.offsetWidth; b.classList.add("bump"); };
addEventListener("cartchange", badge); badge();
$("#lo").onclick = e => { e.preventDefault(); A.signOut(auth).then(() => location.href = "index.html"); };
A.onAuthStateChanged(auth, u => { const a = $("#acct"); $("#lo").hidden = !u; if (!u) { a.textContent = "Log in"; a.href = "login.html"; } else if (isOwner(u)) { a.textContent = "Admin"; a.href = "owner.html"; } else { a.textContent = "Account"; a.href = "dashboard.html"; } });
const drawFooter = s => { ft.innerHTML = `<div class="fgrid"><div><p class="fb">CakeHub <small>Tagbilaran</small></p><p>${esc(CFG.tagline)} Handcrafted cakes for birthdays, weddings and every celebration.</p></div>
<div><h4>Explore</h4><a href="cakes.html">Our Cakes</a><a href="customize.html">Custom Cakes</a><a href="about.html">About Us</a><a href="contact.html">Contact</a><a href="cart.html">Shopping Bag</a></div>
<div><h4>Categories</h4>${CFG.categories.slice(0, 5).map(c => `<a href="cakes.html?cat=${encodeURIComponent(c)}">${esc(c)}</a>`).join("")}</div>
<div><h4>Visit</h4><p>${esc(s.address)}</p><p><a href="tel:+63${String(s.phone).replace(/\D/g, "").slice(1)}">${esc(s.phone)}</a><br><a href="mailto:${esc(s.email)}">${esc(s.email)}</a></p><p>${esc(s.hours)}</p><p><a href="${CFG.facebook}" rel="noopener">Facebook</a>${CFG.instagram !== "#" ? ` · <a href="${CFG.instagram}" rel="noopener">Instagram</a>` : ""}</p></div></div>
<p class="copy">© 2026 ${esc(CFG.brand)} · <a href="privacy.html">Privacy Policy</a> · <a href="terms.html">Terms and Conditions</a></p>`; };
drawFooter(CFG.defaults);
getSettings().then(s => { drawFooter(s); if (s.promo) { const d = document.createElement("div"); d.className = "promo"; d.textContent = s.promo; document.body.prepend(d); } });
const io = "IntersectionObserver" in window ? new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -8% 0px" }) : null;
export function reveal() { $$(".rv:not(.in)").forEach(el => io ? io.observe(el) : el.classList.add("in")); }
reveal();
{ const n = navigator; if ((n.hardwareConcurrency || 4) <= 4 || (n.deviceMemory || 4) <= 2) document.documentElement.classList.add("lite"); }
document.addEventListener("click", e => { if (e.target.classList?.contains("thumb")) e.target.classList.toggle("zoom"); });
