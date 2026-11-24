import { initializeApp } from "firebase/app";
import * as A from "firebase/auth";
import * as F from "firebase/firestore";
import { CFG } from "./config.js";
export const app = initializeApp(CFG.firebase), auth = A.getAuth(app), db = F.getFirestore(app);
export { A, F };
export const isOwner = u => !!u && u.email === CFG.ownerEmail && u.emailVerified;
export const whenUser = () => new Promise(r => { const un = A.onAuthStateChanged(auth, u => { un(); r(u); }); });
// Analytics loads only when the browser is idle, so it never slows the page.
(window.requestIdleCallback || setTimeout)(() => import("firebase/analytics").then(m => m.isSupported().then(s => s && m.getAnalytics(app))).catch(() => {}), { timeout: 4000 });
