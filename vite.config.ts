/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";
import { visualizer } from "rollup-plugin-visualizer";
import { resolve } from "path";

const analyze = process.env.ANALYZE === "1";

export default defineConfig({
  test: {
    globals: true,
    environment: "happy-dom",
    setupFiles: ["./test/setup.ts"],
    include: [
      "src/**/*.{test,spec}.{ts,tsx}",
      "test/**/*.{test,spec}.{ts,tsx}",
      "tools/**/*.{test,spec}.{ts,tsx}",
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      exclude: [
        "dist",
        "demo",
        "plans",
        "**/*.stories.*",
        "**/*.test.*",
        "test/**",
        "vite.config.ts",
      ],
      thresholds: {
        // Library-wide floors. Phase 19 sets a pragmatic baseline so
        // regressions surface in CI; per-layer targets (utilities /
        // hooks / primitives at 95%) live in the phase doc and can be
        // raised incrementally.
        lines: 75,
        statements: 75,
        functions: 75,
        branches: 70,
      },
    },
  },
  plugins: [
    react(),
    dts({
      outDir: "dist/types",
      rollupTypes: true,
      tsconfigPath: "./tsconfig.build.json",
    }),
    // Opt-in bundle analyzer. Produces dist/stats.html when ANALYZE=1.
    ...(analyze
      ? [
          visualizer({
            filename: "dist/stats.html",
            gzipSize: true,
            brotliSize: true,
            template: "treemap",
          }),
        ]
      : []),
  ],
  server: {
    host: "0.0.0.0",
    port: 5174,
    watch: {
      // Polling is required for reliable file-watching when the project
      // is bind-mounted into a container.
      usePolling: true,
      interval: 100,
    },
  },
  preview: {
    host: "0.0.0.0",
    port: 4173,
  },
  build: {
    // All CSS imports across the library bundle into a single file
    // emitted as `dist/voidframe.css`. Consumers do `import "voidframe/styles.css"`.
    cssCodeSplit: false,
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "Voidframe",
      formats: ["es", "cjs"],
      fileName: (format) => `voidframe.${format}.js`,
    },
    rollupOptions: {
      external: ["react", "react-dom", "react/jsx-runtime"],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
          "react/jsx-runtime": "jsxRuntime",
        },
        // Pin the bundled CSS file name regardless of entry hashing.
        assetFileNames: (asset) =>
          asset.name && asset.name.endsWith(".css")
            ? "voidframe.css"
            : "[name][extname]",
      },
    },
  },
});
