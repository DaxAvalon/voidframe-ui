import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

// Dedicated Vite app for Playwright e2e tests. One route per tested
// component; isolated from demo/ to keep the page DOM minimal (cleaner
// axe baseline, faster navigation between specs). Serves on :5176.
export default defineConfig({
  root: __dirname,
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 5176,
    strictPort: true,
    watch: {
      usePolling: true,
      interval: 100,
    },
  },
  preview: {
    host: "0.0.0.0",
    port: 5176,
    strictPort: true,
  },
  resolve: {
    alias: {
      // Resolve the library from source so Playwright exercises the
      // working tree, not dist/.
      voidframe: resolve(__dirname, "../src/index.ts"),
    },
  },
});
