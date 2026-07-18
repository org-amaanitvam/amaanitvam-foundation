import { defineConfig } from "vite";
import { resolve } from "node:path";
import { readdirSync } from "node:fs";

const htmlFiles = readdirSync(process.cwd())
  .filter((file) => file.endsWith(".html"));

const input = Object.fromEntries(
  htmlFiles.map((file) => [
    file.replace(/\.html$/, ""),
    resolve(process.cwd(), file),
  ])
);

export default defineConfig({
  root: ".",
  publicDir: "public",

  server: {
    host: "0.0.0.0",
    port: 5173,
  },

  preview: {
    host: "0.0.0.0",
    port: 4173,
  },

  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input,
    },
  },
});
