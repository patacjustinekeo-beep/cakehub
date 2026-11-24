import { $, esc, peso, getSettings, validEmail, reveal } from "./app.js";
import { CFG } from "./config.js";
import { F, db } from "./firebase.js";
import { loadProducts, card, skeleton } from "./products.js";
getSettings().then(s => { if (s.heroTitle && s.heroTitle !== CFG.defaults.heroTitle) $("#h1").textContent = s.heroTitle; if (s.heroText) $("#hp").textContent = s.heroText; });
$("#featured").innerHTML = skeleton(3);
loadProducts().then(ps => {
  const f = ps.filter(p => p.featured); $("#featured").innerHTML = (f.length ? f : ps).slice(0, 6).map(card).join("");
  const b = ps.filter(p => p.bestseller); $("#best").innerHTML = (b.length ? b : ps).slice(0, 4).map(p => `<div class="bi rv"><a href="product.html?id=${encodeURIComponent(p.id)}">${p.img ? `<img src="${esc(p.img)}" alt="${esc(p.name)}" width="84" height="84" loading="lazy">` : ""}</a><div><span class="lbl">Customer favorite</span><h3><a href="product.html?id=${encodeURIComponent(p.id)}">${esc(p.name)}</a></h3></div><div class="bq"><b>${peso(p.price)}</b><button class="btn sm ghost" data-add="${esc(p.id)}">Quick Add</button></div></div>`).join("");
  reveal();
});
$("#nf").onsubmit = async e => {
  e.preventDefault(); const em = $("#ne").value.trim(), m = $("#nm"); m.className = "msg";
  if (!validEmail(em)) { m.textContent = "Please enter a valid email address."; return; }
  try { await F.addDoc(F.collection(db, "subscribers"), { email: em, createdAt: F.serverTimestamp() }); m.className = "msg ok"; m.textContent = "Thank you! You are subscribed."; $("#ne").value = ""; } catch (x) { m.textContent = "Sorry, we could not subscribe you right now. Please try again later."; }
};
