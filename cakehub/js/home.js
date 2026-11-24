import { loadMenu, card, $ } from "./app.js";
loadMenu().then(m => { $("#featured").innerHTML = m.slice(0, 3).map(card).join(""); });
