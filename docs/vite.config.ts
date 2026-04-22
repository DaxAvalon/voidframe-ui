import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

// Dedicated Vite config for the docs SPA.
//
// Dev:    `npm run docs`       → serves on :5175 with base `/`.
// Build:  `npm run docs:build` → emits to `dist-docs/` with base
//                                 `/` OR `/voidframe-ui/` depending on
//                                 the DOCS_BASE_PATH env var.
//
// The GitHub Pages workflow sets DOCS_BASE_PATH=/voidframe-ui/ so the
// emitted asset paths resolve correctly when the site is served from
// https://daxavalon.github.io/voidframe-ui/. Any other deploy target
// can override via env or leave unset for root-hosted builds.
export default defineConfig({
  root: __dirname,
  plugins: [react()],
  base: process.env.DOCS_BASE_PATH || "/",
  server: {
    host: "0.0.0.0",
    port: 5175,
    strictPort: true,
  },
  build: {
    // Emit to a repo-root-adjacent `dist-docs/` directory so it doesn't
    // collide with the library's own `dist/` bundle.
    outDir: resolve(__dirname, "..", "dist-docs"),
    emptyOutDir: true,
    sourcemap: false,
    // Disable module preload polyfill — modern targets only.
    modulePreload: { polyfill: false },
  },
  resolve: {
    alias: {
      // Docs source imports `from "../src"` for live source (not the
      // published npm package). Aliases mirror the root vite config so
      // the TS ambient imports resolve during this build as well.
      voidframe: resolve(__dirname, "..", "src", "index.ts"),
      "voidframe-ui": resolve(__dirname, "..", "src", "index.ts"),
    },
  },
});
