import { defineConfig } from "vite";
import { resolve } from "node:path";
import { readdirSync } from "node:fs";

// Every .html file in the project root becomes its own page in the build.
const pages = Object.fromEntries(
  readdirSync(".").filter(f => f.endsWith(".html")).map(f => [f.replace(".html", ""), resolve(f)])
);

export default defineConfig({
  server: { host: true, port: 5173, allowedHosts: true }, // allowedHosts lets GitHub Codespaces URLs work
  build: { target: "es2022", rollupOptions: { input: pages } }
});
