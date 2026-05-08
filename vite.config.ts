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
      "docs/**/*.{test,spec}.{ts,tsx}",
      "scripts/**/*.{test,spec}.{ts,tsx}",
    ],
    exclude: [
      "test/visual/**",  // Playwright tests — run via `npx playwright test`
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "dist",
        "demo",
        "plans",
        "**/*.stories.*",
        "**/*.test.*",
        "test/**",
        "vite.config.ts",
        // CLI template files — scaffolded verbatim into consumer
        // projects by `voidframe init`. They run in the consumer's
        // environment, not ours. Indirectly validated by
        // tools/cli/__tests__/init.test.ts which copies + asserts on
        // the output tree.
        "tools/cli/templates/**",
        // VS Code extension entry — requires the vscode runtime API
        // (only available inside a running editor) to execute. The
        // logic it wires is in tools/vscode-voidframe/src/docs.js,
        // which IS covered by __tests__/docs.test.ts.
        "tools/vscode-voidframe/src/extension.js",
        "src/dev/**",
        "src/lazy.ts",
        "docs/**",
        "tools/**",
        "scripts/**",
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
        perFile: false,
      },
    },
  },
  plugins: [
    react(),
    dts({
      outDir: "dist/types",
      rollupTypes: false,
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
    // emitted as `dist/voidframe.css`. Consumers do `import "voidframe-ui/styles.css"`.
    cssCodeSplit: false,
    lib: {
      // Multi-entry: core (root barrel), charts (subpath), and dev
      // (subpath) each get their own entry so consumers who never
      // touch charts or dev tools don't pay their bundle cost.
      entry: {
        voidframe: resolve(__dirname, "src/index.ts"),
        charts: resolve(__dirname, "src/charts/index.ts"),
        dev: resolve(__dirname, "src/dev/index.ts"),
        tokens: resolve(__dirname, "src/tokens.ts"),
        testing: resolve(__dirname, "src/testing/index.ts"),
        "testing-axe": resolve(__dirname, "src/testing/axe.ts"),
        // Per-category tree-shaking subpaths — one bundle per taxonomy
        // section so consumers can pull just Forms, Data, Icons, etc.
        // without dragging the whole library in. Source of truth for
        // membership: docs/taxonomy.ts.
        primitives: resolve(__dirname, "src/subpaths/primitives.ts"),
        core: resolve(__dirname, "src/subpaths/core.ts"),
        layout: resolve(__dirname, "src/subpaths/layout.ts"),
        navigation: resolve(__dirname, "src/subpaths/navigation.ts"),
        forms: resolve(__dirname, "src/subpaths/forms.ts"),
        data: resolve(__dirname, "src/subpaths/data.ts"),
        activity: resolve(__dirname, "src/subpaths/activity.ts"),
        overlays: resolve(__dirname, "src/subpaths/overlays.ts"),
        media: resolve(__dirname, "src/subpaths/media.ts"),
        animation: resolve(__dirname, "src/subpaths/animation.ts"),
        icons: resolve(__dirname, "src/subpaths/icons.ts"),
        chat: resolve(__dirname, "src/subpaths/chat.ts"),
        specialty: resolve(__dirname, "src/subpaths/specialty.ts"),
        interactive: resolve(__dirname, "src/subpaths/interactive.ts"),
        reactflow: resolve(__dirname, "src/subpaths/reactflow.ts"),
        "compat-shadcn": resolve(__dirname, "src/subpaths/compat-shadcn.ts"),
      },
      name: "Voidframe",
      formats: ["es", "cjs"],
      fileName: (format, entryName) => `${entryName}.${format}.js`,
    },
    rollupOptions: {
      external: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        // d3 math packages — promoted to optional peer deps so chart
        // consumers install what they need.
        /^d3-/,
        "topojson-client",
        // DOMPurify — runtime dep of RichTextEditor + Mermaid only.
        "dompurify",
        // react-live — runtime dep of Playground (dev subpath only).
        "react-live",
        // Testing Library + axe — runtime deps of the testing subpath
        // only. Consumers install what they already use for their tests.
        /^@testing-library\//,
        "jest-axe",
        // Encoding peers — lazy-loaded by <QRCode> and <Barcode> only.
        "qrcode-generator",
        "jsbarcode",
      ],
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
        // Rollup's default chunk-naming picks the largest module in a
        // chunk as the file name, which produced opaque pairings like
        // `FloatingActionButton-*.js` for the chunk that actually
        // contains ContextMenu + Menu + Popovers + several helpers.
        // Manual chunks here group structurally-related modules under
        // predictable names so consumers analysing their own bundles
        // see what's in them at a glance. Anything not matched falls
        // back to rollup's default.
        manualChunks(id: string): string | undefined {
          if (!id.includes("/src/")) return undefined;
          if (
            /\/src\/components\/(Menu|MegaMenu|Popovers|Popconfirm|FloatingActionButton|Lightbox|Spotlight|ToastSystem|Overlay)\.tsx$/.test(
              id
            )
          ) {
            return "overlays";
          }
          if (/\/src\/charts\/math\//.test(id)) {
            return "charts-math";
          }
          if (
            /\/src\/components\/(TreeView|TreeSelect|TreeTable|Cascader|Transfer)\.tsx$/.test(
              id
            )
          ) {
            return "tree";
          }
          return undefined;
        },
      },
    },
  },
});
