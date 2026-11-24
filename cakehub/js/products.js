import { F, db } from "./firebase.js";
import { esc, peso, toast, $$ } from "./app.js";
import { addItem } from "./cart.js";
const SZ = [{ n: "6 inch", p: 0, s: "serves 8 to 10" }, { n: "8 inch", p: 500, s: "serves 12 to 16" }, { n: "10 inch", p: 1100, s: "serves 20 to 25" }];
const P = (id, name, category, img, price, desc, x = {}) => ({ id, name, category, img: `/images/${img}.webp`, price, desc, sizes: SZ, available: true, pop: 50, ...x });
// NOTE: prices are placeholders (only the 2-tier wedding price comes from your poster). Edit them in Admin > Products.
export const STARTER = [
  P("s1", "Pink Butterfly Cake", "Birthday Cakes", "butterfly", 1500, "Soft pink layers with butterflies and a name topper.", { featured: 1, bestseller: 1, pop: 90 }),
  P("s2", "Roblox Celebration Cake", "Birthday Cakes", "roblox", 1800, "A bold, colorful character cake made to your theme.", { featured: 1, bestseller: 1, pop: 95 }),
  P("s3", "Spider-Man Hero Cake", "Birthday Cakes", "spider", 1500, "Red and blue tiers with a hero topper and custom name.", { bestseller: 1, pop: 80 }),
  P("s4", "Mermaid Dream Cake", "Birthday Cakes", "mermaid", 1600, "Teal and lilac with shells, tails and a name plaque.", { pop: 70 }),
  P("s5", "Little Gentleman Cake", "Birthday Cakes", "noah", 1500, "Blue and gold two-tier cake for a first birthday.", { pop: 60 }),
  P("s6", "Blush Christening Cake", "Signature Cakes", "christening", 1800, "Soft pink and white with a cross topper and blessing plaque.", { featured: 1, pop: 75 }),
  P("s7", "Golden Celebration Cake", "Signature Cakes", "gold50", 2200, "Cream and gold with butterflies for milestone birthdays.", { pop: 65 }),
  P("s8", "Gold Sequin Cake", "Signature Cakes", "goldtall", 2500, "Tall sequin finish with gold spheres and fresh roses.", { featured: 1, pop: 72 }),
  P("s9", "White Floral Wedding Cake", "Wedding Cakes", "kr", 2500, "Two tiers with ivory roses and a custom initials topper.", { featured: 1, pop: 85, sizes: [{ n: "2 tiers", p: 0, s: "serves 25 to 35" }, { n: "3 tiers", p: 2000, s: "serves 50+" }] }),
  P("s10", "Calendar Minimal Cake", "Minimalist Cakes", "october", 1400, "A clean white cake with a calendar print and gold accents.", { featured: 1, pop: 68 }),
  P("s11", "Party Cupcake Box", "Cupcakes & Pastries", "minnie", 480, "Matching cupcakes in your party colors and theme.", { bestseller: 1, pop: 78, sizes: [{ n: "Box of 6", p: 0, s: "6 cupcakes" }, { n: "Box of 12", p: 450, s: "12 cupcakes" }] })
];
export const sizesOf = p => p.sizes?.length ? p.sizes : [{ n: "Standard", p: 0 }];
export const priceOf = (p, size) => p.price + (size?.p || 0);
let cache = [];
export async function loadProducts() {
  const k = "yc_prod", c = JSON.parse(sessionStorage.getItem(k) || "null");
  if (c && Date.now() - c.t < 120000) return (cache = c.d);
  let d = [];
  try { const s = await F.getDocs(F.collection(db, "menu")); d = s.docs.map(x => ({ id: x.id, category: "Signature Cakes", ...x.data() })).filter(x => x.available !== false && x.name); } catch (e) { }
  if (!d.length) d = STARTER;
  try { sessionStorage.setItem(k, JSON.stringify({ t: Date.now(), d })); } catch (e) { }
  return (cache = d);
}
export const imgTag = (p, w = 560, h = 700, eager) => p.img ? `<img src="${esc(p.img)}" alt="${esc(p.name)}" width="${w}" height="${h}" ${eager ? 'fetchpriority="high"' : 'loading="lazy" decoding="async"'}>` : `<div class="ph" aria-hidden="true">🎂</div>`;
export const card = p => `<article class="pcard rv"><a class="pimg" href="product.html?id=${encodeURIComponent(p.id)}">${imgTag(p)}</a><div class="pmeta"><span class="lbl">${esc(p.category)}</span><h3><a href="product.html?id=${encodeURIComponent(p.id)}">${esc(p.name)}</a></h3><p>${esc(p.desc)}</p><p class="sizes">${sizesOf(p).map(s => esc(s.n)).join(" · ")}</p><div class="prow"><span class="pprice">${peso(p.price)}</span><span><a class="link" href="product.html?id=${encodeURIComponent(p.id)}">View Details</a> <button class="btn sm" data-add="${esc(p.id)}">Add to Cart</button></span></div></div></article>`;
export const skeleton = n => Array.from({ length: n }, () => '<div class="pcard"><div class="pimg sk"></div><div class="sk" style="height:1.2rem;margin:.8rem 0 .4rem"></div><div class="sk" style="height:.9rem;width:70%"></div></div>').join("");
document.addEventListener("click", e => {
  const b = e.target.closest("[data-add]"); if (!b) return;
  const p = cache.find(x => String(x.id) === b.dataset.add); if (!p) return; const sz = sizesOf(p)[0];
  addItem({ id: p.id, name: p.name, img: p.img && !p.img.startsWith("data:") ? p.img : "", price: priceOf(p, sz), size: sz.n, qty: 1, opts: {} }); toast(`${p.name} added to your bag`);
});
