const K = "yc_cart";
export const getCart = () => { try { return JSON.parse(localStorage.getItem(K) || "[]"); } catch (e) { return []; } };
const save = c => { try { localStorage.setItem(K, JSON.stringify(c)); } catch (e) { } dispatchEvent(new Event("cartchange")); };
export const keyOf = it => [it.id, it.size, it.opts?.flavor || "", it.opts?.filling || "", it.opts?.msg || ""].join("|");
export function addItem(it) { const c = getCart(), k = keyOf(it), f = c.find(x => x.key === k), q = Math.max(1, Math.min(20, +it.qty || 1)); if (f) f.qty = Math.min(20, f.qty + q); else c.push({ ...it, key: k, qty: q }); save(c); }
export function setQty(k, q) { const c = getCart(), f = c.find(x => x.key === k); if (!f) return; f.qty = Math.max(1, Math.min(20, Math.round(+q) || 1)); save(c); }
export const removeItem = k => save(getCart().filter(x => x.key !== k));
export const clearCart = () => save([]);
export const count = () => getCart().reduce((a, x) => a + x.qty, 0);
export const subtotal = () => getCart().reduce((a, x) => a + x.qty * x.price, 0);
