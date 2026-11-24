import { $, esc, peso, requireLogin } from "./app.js";
import { db, F } from "./firebase.js";
import { STATUS } from "./status.js";
const u = await requireLogin(), ref = new URLSearchParams(location.search).get("ref") || "";
const s = await F.getDocs(F.query(F.collection(db, "orders"), F.where("uid", "==", u.uid), F.where("ref", "==", ref)));
if (s.empty) $("#cfm").innerHTML = '<h1>We could not find that order</h1><p><a class="btn" href="dashboard.html">Go to my orders</a></p>';
else { const o = s.docs[0].data(); $("#cfm").innerHTML = `<span class="eyebrow">Thank you</span><h1>Order received</h1><p>Your order reference is <b>${esc(o.ref)}</b>. Keep it for any questions.</p><p>Status <span class="bd s-${esc(o.status)}">${esc(o.status)}</span><br>${esc(STATUS[o.status] || "")}</p>
<div class="card"><p>${(o.items || []).map(i => `${i.qty} × ${esc(i.name)} (${esc(i.size)})`).join("<br>")}</p><p>${esc(o.method)} on <b>${esc(o.date)}</b>, ${esc(o.time || "")}${o.address ? "<br>" + esc(o.address) : ""}</p><p>Payment: ${esc(o.payment)}. <small class="note">Payment has not been processed on this website. We will confirm the total with you.</small></p><p>Delivery fee: ${o.deliveryFee ? peso(o.deliveryFee) : "Free"}<br>Total: <b>${peso(o.total)}</b></p></div>
<p style="margin-top:1.4rem"><a class="btn" href="dashboard.html#chat">Chat with us</a> <a class="btn ghost" href="dashboard.html">View my orders</a></p>`; }
