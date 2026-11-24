# CakeHub Tagbilaran (Vite + Firebase)

Luxury editorial cake shop website: catalog with filters and search, product pages, shopping bag, checkout, custom cake designer with a rotating 360 degree preview, customer accounts with chat, and an admin dashboard.

## Run in GitHub Codespaces
```
unzip cakehub-vite.zip && cd cakehub-lux
npm install
npm run dev
```
Open port **5173**. Build with `npm run build` (output in `dist/`).

## One-time Firebase setup (project cakehub-86ee9)
1. Authentication > Sign-in method: turn on **Email/Password** and **Google**.
2. Authentication > Settings > Authorized domains: add your Codespaces domain (ends in `app.github.dev`) and your final domain.
3. Firestore Database > Create database.
4. Firestore > Rules: paste `firestore.rules` and **Publish** (it has new rules for products, settings, contact messages and the newsletter).
5. Log in as the owner (patacjustinekeo@gmail.com) with Google, or with a password after verifying the email. The top bar shows **Admin**.
6. Admin > Products > **Load starter products**, then edit names, prices and photos. Admin > Site: set delivery fee, payment methods and your contact details.

## What is where
- Shop: Home, Our Cakes (search, category, price, sort), product pages, Shopping Bag, Checkout, Order confirmation.
- Custom Cakes: layers, shape, size, flavor, filling, frosting, colors, drip or smooth, borders, toppings, cupcakes, message, reference photo, quantity. Live 360 degree preview. Sent as a request (status Received) that you approve in Admin > Orders.
- Account: orders and status tracking, chat with photos, profile.
- Admin: Overview, Orders (status, payment status, approve, cancel), Products, Customers, Site (homepage text, promo banner, business info, delivery fee, payment methods), Chats.
- `js/config.js`: prices and colors of the designer options.

## Things to check
- Product prices are placeholders (only the 2-tier wedding price comes from your poster). Edit them in Admin > Products.
- Photos were cropped from your Facebook screenshots, so they are small. Upload better originals in Admin > Products (they are saved compressed in Firestore, no paid Storage needed). Make sure customers agree to their cakes and names being shown.
- Testimonials are demo text. Replace them with real reviews. Mission and vision text is generic. Privacy and Terms pages are templates to review.
- No online payment is connected. Checkout never says a payment was processed. GCash and bank transfer stay off until you add instructions in Admin > Site.
- Prices in the cart are saved by the browser, so you confirm the final total in chat.

## Speed
No frameworks. Pages load only their own script. Images are lazy loaded with fixed sizes. The 3D preview is a small custom renderer that only redraws while moving, pauses when hidden, and uses lower quality on weaker devices. Blur effects are used only on the navigation, a few panels, and turn off on weak devices.
