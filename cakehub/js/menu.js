import { loadMenu, card, $ } from "./app.js";
loadMenu().then(m => { $("#list").innerHTML = m.map(card).join(""); });
