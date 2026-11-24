import { $, esc, peso } from "./app.js";
import { getCart, setQty, removeItem, subtotal } from "./cart.js";
function draw() {
  const c = getCart();
  if (!c.length) { $("#cart").innerHTML = '<div class="empty"><h3>Your bag is empty</h3><p>Find a cake you love, or design your own.</p><a class="btn" href="cakes.html">Continue Shopping</a> <a class="btn ghost" href="customize.html">Design your own</a></div>'; return; }
  $("#cart").innerHTML = `<div class="lay"><div>${c.map(i => `<div class="crow"><div>${i.img ? `<img src="${esc(i.img)}" alt="${esc(i.name)}" width="92" height="92" loading="lazy">` : '<div class="ph" style="height:92px">🎂</div>'}</div><div><h3>${esc(i.name)}</h3><p class="note">${esc(i.size)}${i.opts?.flavor ? " · " + esc(i.opts.flavor) : ""}${i.opts?.filling ? " · " + esc(i.opts.filling) : ""}${i.opts?.msg ? ` · “${esc(i.opts.msg)}”` : ""}<br>${peso(i.price)} each</p></div><span class="qty"><button data-k="${esc(i.key)}" data-d="-1" aria-label="Decrease quantity">−</button><input data-k="${esc(i.key)}" type="number" min="1" max="20" value="${i.qty}" aria-label="Quantity for ${esc(i.name)}"><button data-k="${esc(i.key)}" data-d="1" aria-label="Increase quantity">+</button></span><b class="pprice">${peso(i.price * i.qty)}</b><button class="x" data-rm="${esc(i.key)}">Remove</button></div>`).join("")}<p style="margin-top:1.4rem"><a class="btn ghost" href="cakes.html">Continue Shopping</a></p></div>
<aside class="sumbox"><h3>Summary</h3><div class="r"><span>Subtotal</span><b>${peso(subtotal())}</b></div><p class="note">Delivery fee, if any, is calculated at checkout.</p><a class="btn" href="checkout.html" style="width:100%;text-align:center">Proceed to Checkout</a></aside></div>`;
}
$("#cart").addEventListener("click", e => { const b = e.target.closest("[data-d]"), r = e.target.closest("[data-rm]"); if (b) { const i = getCart().find(x => x.key === b.dataset.k); setQty(b.dataset.k, i.qty + +b.dataset.d); } else if (r) removeItem(r.dataset.rm); });
$("#cart").addEventListener("change", e => { if (e.target.dataset.k && e.target.tagName === "INPUT") setQty(e.target.dataset.k, e.target.value); });
addEventListener("cartchange", draw); draw();
