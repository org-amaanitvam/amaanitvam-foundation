import { defineConfig } from "vite";
import { readdirSync } from "node:fs";
import { resolve, basename } from "node:path";
import { fileURLToPath } from "node:url";

const rootDirectory = fileURLToPath(new URL(".", import.meta.url));

const htmlInputs = Object.fromEntries(
  readdirSync(rootDirectory, { withFileTypes: true })
    .filter(
      (entry) =>
        entry.isFile() &&
        entry.name.toLowerCase().endsWith(".html")
    )
    .map((entry) => [
      basename(entry.name, ".html"),
      resolve(rootDirectory, entry.name),
    ])
);

export default defineConfig({
  root: rootDirectory,
  base: "/",
  publicDir: resolve(rootDirectory, "public"),

  build: {
    outDir: resolve(rootDirectory, "dist"),
    emptyOutDir: true,

    rollupOptions: {
      input: htmlInputs,
    },
  },
});
