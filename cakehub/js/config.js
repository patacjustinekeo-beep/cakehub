// EDIT THIS FILE to change business info, prices and options. No other code changes needed.
export const CFG = {
  firebase: {
    apiKey: "AIzaSyC1Z3l_7ypc6l60cgK2Ar3wTayc2qab02U",
    authDomain: "cakehub-86ee9.firebaseapp.com",
    projectId: "cakehub-86ee9",
    storageBucket: "cakehub-86ee9.firebasestorage.app",
    messagingSenderId: "795014255751",
    appId: "1:795014255751:web:c4e5e2813d7fb071efd422",
    measurementId: "G-85CJPHSVPP"
  },
  ownerEmail: "patacjustinekeo@gmail.com",
  brand: "CakeHub Tagbilaran",
  tagline: "Baked with love and design with passion.",
  phone: "0912 471 8716",
  email: "jkennt22@gmail.com",
  address: "79 Ramon Enerio, Tagbilaran City, Bohol 6300",
  hours: "Message us to book. Order at least 2 days ahead.",
  facebook: "https://www.facebook.com/profile.php?id=61584458616964",
  leadDays: 2,
  payment: "We confirm your total in the chat. You pay after we agree on the details.",
  // Cake designer options and prices (pesos). Only the 2-tier price (2500, medium) comes from your poster: edit the rest.
  design: {
    tierBase: { 1: 1200, 2: 2500, 3: 4500 },
    sizes: [["Small (6 inch bottom)", 6, 0.85], ["Medium (8 inch bottom)", 8, 1], ["Large (10 inch bottom)", 10, 1.3]],
    shapes: [["Round", "round", 0], ["Square", "square", 0], ["Hexagon", "hexagon", 150], ["Heart", "heart", 300]],
    flavors: [["Vanilla", 0, "#f3deb0"], ["Chocolate", 0, "#5a3320"], ["Ube", 0, "#9b7bc2"], ["Mocha", 0, "#8b6045"], ["Strawberry", 0, "#f2a0b3"], ["Red velvet", 100, "#a8282f"], ["Carrot", 100, "#d98a3d"]],
    fillings: [["Cream", 0], ["Chocolate fudge", 100], ["Caramel", 100], ["Fresh fruits", 150], ["Cream cheese", 120], ["Custard", 80]],
    frostings: [["Buttercream", 0, 0], ["Whipped cream", 0, 0], ["Fondant (smooth, glossy)", 300, 1], ["Chocolate ganache (glossy)", 200, 1]],
    borders: [["None", 0], ["Pearls", 100], ["Ribbon band", 80]],
    finishes: [["Smooth", 0], ["Drip", 150]],
    toppings: [["Sprinkles", 50, "sprinkles"], ["Berries", 150, "berries"], ["Flowers", 250, "flowers"], ["Candles", 40, "candles"], ["Name topper (plaque)", 120, "topper"]],
    cupcakes: ["Add matching cupcakes (6)", 480],
    colors: [["Ivory", "#fff4e0"], ["White", "#ffffff"], ["Blush", "#f7c6d0"], ["Pink", "#f08aa9"], ["Red", "#d6404e"], ["Orange", "#f0a35a"], ["Yellow", "#f6d768"], ["Mint", "#bfe3cb"], ["Sage green", "#9bbf8e"], ["Green", "#2e7d4f"], ["Sky blue", "#a9d4f0"], ["Blue", "#3b78c4"], ["Navy", "#243b6b"], ["Lavender", "#c9b3e6"], ["Purple", "#7a4fa8"], ["Chocolate", "#6a3e2a"], ["Black", "#2b2b2e"], ["Gold", "#d8b25a"]]
  },
  starterMenu: [
    ["Custom Birthday Cake", "Any theme, name and colors you like.", 1200, "🎂", "/images/minnie.webp"],
    ["Character Theme Cake", "Roblox, Spider-Man, mermaid and more.", 1500, "🎂", "/images/roblox.webp"],
    ["2-Tier Custom Cake", "Starting price for a designed 2-tier cake.", 2500, "🎂", "/images/gold50.webp"],
    ["Wedding Cake", "Elegant tiers with flowers and a custom topper.", 2500, "💍", "/images/kr.webp"],
    ["Christening Cake", "Soft colors with a name and cross topper.", 1800, "🎂", "/images/christening.webp"],
    ["Cupcake Box (6)", "Matching cupcakes in your party colors.", 480, "🧁", "/images/butterfly.webp"]
  ]
};
