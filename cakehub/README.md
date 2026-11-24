# CakeHub Tagbilaran (Vite + npm)

Fast multi-page site built with Vite. Firebase is installed from npm (`firebase` package), with login, orders, owner and customer dashboards, live chat with photos, a menu and a "design your own cake" page.

## Run in GitHub Codespaces
```
unzip cakehub-vite.zip && cd cakehub-vite
npm install
npm run dev
```
Codespaces shows a pop-up for port **5173**. Click "Open in Browser".

## Build and deploy
```
npm run build      # makes the dist/ folder
npm run preview    # test the built site locally
```
Upload `dist/` to GitHub Pages, Netlify, Vercel, or run `firebase deploy` (Firebase Hosting, uses `dist`). Add your final domain to Firebase Auth authorized domains.

## One-time Firebase setup (project cakehub-86ee9)
1. Authentication > Sign-in method: turn on **Email/Password** and **Google**.
2. Authentication > Settings > Authorized domains: add your Codespaces domain (ends in `app.github.dev`) and your final website domain. Without this, login shows a "not allowed" message.
3. Firestore Database > Create database (production mode).
4. Firestore > Rules: paste `firestore.rules` and Publish (or `npx firebase-tools deploy --only firestore:rules`).
5. Open the site, **Log in > Continue with Google** with **patacjustinekeo@gmail.com**. The button changes to **Owner panel**. In Menu, tap **Load starter menu**, then edit prices.

## Notes
- The owner must sign in with Google (verified email). The rules only trust the verified owner email.
- Chat photos are shrunk in the browser and saved in Firestore, so paid Firebase Storage is not needed.
- Edit `js/config.js` for phone, address, hours, prices and cake options.
- Add a new page: create `name.html` in the root; Vite picks it up automatically.

## Photos and prices (please check)
- Cake photos in `public/images/` were cropped from your Facebook screenshots. Replace them with originals for sharper pictures (keep the same file names).
- Only the 2-tier price (₱2,500) comes from your poster. Other starter menu prices and the Customize prices in `js/config.js` are placeholders.
- Make sure customers agree to their cakes (and names on them) being shown on the website.

## Cake designer (customize.html)
- Options on the left: layers (1 to 3), shape (round, square, hexagon, heart), size, flavor, filling, frosting, main and accent colors (swatches or any custom color), side finish (smooth or drip), border, toppings, cupcakes, message and notes.
- Live preview on the right. Drag it, use the slider, or press the left and right arrow keys to rotate 360 degrees.
- **Send design** saves an order with a picture of the cake and also posts the picture and a summary in the customer's chat, so you see it in the Owner panel under Orders and Chats.
- Prices for every option are in `js/config.js` under `design`.
- **Publish `firestore.rules` again.** Orders now accept a `preview` picture.

## Speed on low-end phones
- The preview is drawn with a small custom renderer (no 3D library). It only redraws while the cake moves, pauses when the tab is hidden or off screen, and uses a lower resolution and fewer segments on weaker devices.
- Weak devices also get a no-blur look automatically.
