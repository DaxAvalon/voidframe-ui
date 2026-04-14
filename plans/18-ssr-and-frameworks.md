# 18 — SSR & Framework Compatibility

**Goal:** Voidframe is certified-compatible with every major React framework and rendering mode — Next.js (app + pages), Remix, Astro, Vite SSR, Gatsby, plain CRA — and safe under Strict Mode, Concurrent rendering, and React Server Components.

**Depends on:** 02 Architecture (Strict Mode rules), 04 CSS, 15 Theming.
**Effort:** 2-3 days.

## Framework Compatibility Matrix

| Framework | Tested | Notes |
|---|---|---|
| Next.js 14+ (App Router) | ✓ | Most components are client-only; see RSC boundary below. |
| Next.js (Pages Router) | ✓ | Full SSR support. |
| Remix | ✓ | Full SSR. |
| Astro | ✓ | Client islands. |
| Vite SSR (vite-plugin-ssr) | ✓ | |
| Gatsby | ✓ | |
| CRA / plain SPA | ✓ | Baseline. |
| React Native | ✗ | Out of scope. |

Each framework gets a **starter template** (Phase 24) and a documented integration guide.

## RSC (React Server Components) Boundary

React components in Voidframe fall into three buckets:

### ✓ RSC-compatible (pure, no state, no DOM)

- Text, Label, Heading, Code, Kbd (small display components)
- Divider, Spacer, Separator
- Badge, Tag (if not interactive)
- Box, Container, Center, AspectRatio, Grid (unless they use responsive JS)
- MarkdownRenderer (renders HTML from string)

These can be used directly in RSC without `"use client"`.

### ✗ Client-only (state, hooks, context, event handlers)

Most of Voidframe:

- Every form component (Input, Select, Toggle, DatePicker, etc.)
- Every overlay (Modal, Drawer, Dropdown, Popover, Tooltip)
- Every interactive component (Tabs, Accordion, Carousel, Lightbox)
- Table (basic rendering could be RSC; sortable/interactive versions are client)
- DataGrid, TreeView, Combobox
- Every chat/AI component (stateful)

These require `"use client"` at the top of consumer files that import them.

### Strategy

The root `VoidframeProvider` is **client-only** (context requires it). This means any page rendering Voidframe components must have at least one client boundary.

**Pattern**: Provide a thin client wrapper in consumer apps:

```tsx
// app/providers.tsx
"use client";
import { VoidframeProvider } from "voidframe";

export function AppProviders({ children }: { children: ReactNode }) {
  return <VoidframeProvider>{children}</VoidframeProvider>;
}
```

```tsx
// app/layout.tsx
import { AppProviders } from "./providers";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
```

This pattern keeps the layout server-rendered while wrapping children in a single client boundary.

### `"use client"` Directives

Every Voidframe component file that uses hooks includes `"use client"` at the top.

Pure display components do not — they can render on both server and client.

---

## SSR Safety Rules

Voidframe components must not crash or warn during server rendering.

### Rules

1. **No `window` / `document` references in module top-level or render.** Guard with `typeof window !== "undefined"` or use `useIsomorphicLayoutEffect`.
2. **No `useLayoutEffect` during SSR** — use `useIsomorphicLayoutEffect` which falls back to `useEffect` on the server.
3. **No `Math.random()` / `Date.now()` for IDs during render** — use `useId`.
4. **No direct DOM access during render** — only in effects.
5. **No portals during SSR** — `Portal` primitive returns `null` until mounted.
6. **`<Presence>` waits for mount** — doesn't try to measure animations during SSR.
7. **Media queries** — return a default `false` during SSR; re-evaluate on mount.

### Test

A Node test that renders every component to string via `renderToString`:

```ts
import { renderToString } from "react-dom/server";
import * as Voidframe from "voidframe";

test("SSR smoke test", () => {
  for (const name in Voidframe) {
    const Component = (Voidframe as any)[name];
    if (typeof Component !== "function") continue;
    expect(() => renderToString(<Component />)).not.toThrow();
  }
});
```

Components with required props need per-component SSR tests.

---

## Hydration Safety

Hydration mismatches occur when server HTML and client first-render HTML differ.

### Common pitfalls (avoid)

- **Date/time rendered from `new Date()`** — server and client clocks differ. Use `suppressHydrationWarning` or defer to client-only render.
- **Random values** — `Math.random()` on server ≠ client. Use `useId`.
- **Viewport-dependent rendering** — `useMediaQuery` during first render differs. Our hooks default to `false` on SSR.
- **Theme from localStorage** — server doesn't know user's persisted theme; causes FOUC or mismatch. Solutions:
  - Set theme via cookie, read on server.
  - Or render dark by default and accept one-frame flash on theme change (our default).
  - Document the `<script>` trick for pre-hydration theme sync.

### Pre-hydration theme script

Provide a one-liner to include in `<head>`:

```html
<script>
  (function() {
    try {
      var t = localStorage.getItem("voidframe-theme");
      if (t) document.documentElement.setAttribute("data-vf-theme", t);
    } catch {}
  })();
</script>
```

Ships as `voidframe/theme-script.js` for convenience.

### `<HydrationBoundary>` (optional)

Utility component to defer hydration for heavy client-only subtrees:

```tsx
<HydrationBoundary fallback={<Skeleton />}>
  <DataGrid />
</HydrationBoundary>
```

Uses React's `<Suspense>` + `React.lazy` pattern internally.

---

## Strict Mode Safety

Under `<StrictMode>`, React:
- Mounts, unmounts, remounts every component in development.
- Invokes effects twice.

Our rules (Phase 02) plus:
- **No side effects in render** — test with a render-counter that passes under double-invocation.
- **Every subscription has a cleanup** — subscriptions that don't clean up leak on Strict remount.
- **Refs not assumed single-render** — a ref holding "has initialized" is OK; a ref that only works on first mount is suspicious.

Test: wrap demo in `<StrictMode>` and verify no warnings.

---

## Concurrent Rendering Safety

Under concurrent mode, React can:
- Interrupt a render.
- Discard a render in progress.
- Re-render with different props mid-flight.

### Rules

- **No mutations in render.** Pure function, pure result.
- **No reading `document.activeElement` in render.** Do it in effects.
- **Don't assume order of renders** across components.

Most Voidframe code already complies if it followed Phase 02.

---

## React Version Support

- **React 18+** required (hooks `useId`, `useSyncExternalStore`, `useInsertionEffect`, `useDeferredValue`, `useTransition`).
- **React 19** supported. Track breaking changes; migrate patterns as React evolves.
- Peer dep: `"react": ">=18.0.0"` in package.json.

## Node Version Support

- Node 18+ for build tooling.
- Consumers don't run Voidframe on Node except for SSR — only tested rendering paths matter.

---

## Bundler Compatibility

Tested builds:
- **Vite** (primary — our build tool).
- **Webpack 5** (via Next.js).
- **Rollup**.
- **esbuild**.
- **Parcel 2**.
- **Turbopack** (Next.js 14+).

Every bundler should correctly:
- Tree-shake unused components.
- Handle our dual ESM/CJS output.
- Resolve subpath exports (`voidframe/icons`).

If a bundler can't, document workarounds.

---

## Peer Dependencies

Voidframe's peers:

```json
{
  "peerDependencies": {
    "react": ">=18.0.0",
    "react-dom": ">=18.0.0"
  }
}
```

Optional peer deps for specific components (not required unless the component is used):
- `@floating-ui/react-dom` (actually: make this a hard dep since multiple components need it and it's small)
- `shiki` or `prismjs` — CodeBlock (peer, consumer picks)
- `libphonenumber-js` — PhoneInput (peer)
- `@lexical/react` or `@tiptap/react` — RichTextEditor (peer)
- `mermaid` — Mermaid diagrams (peer)
- `react-grid-layout` — DashboardGrid (peer)

Document every peer clearly. Don't silently pull in 200KB of deps.

---

## Package.json `exports`

Use subpath exports for tree-shaking:

```json
{
  "exports": {
    ".": {
      "types": "./dist/types/index.d.ts",
      "import": "./dist/voidframe.es.js",
      "require": "./dist/voidframe.cjs.js"
    },
    "./styles.css": "./dist/styles.css",
    "./tokens": { "types": "./dist/types/tokens.d.ts", "import": "./dist/tokens.js" },
    "./icons": { "types": "./dist/types/icons.d.ts", "import": "./dist/icons.js" },
    "./locales": { "types": "./dist/types/locales.d.ts", "import": "./dist/locales.js" },
    "./locales/*": "./dist/locales/*.js",
    "./primitives": { "types": "./dist/types/primitives.d.ts", "import": "./dist/primitives.js" },
    "./hooks": { "types": "./dist/types/hooks.d.ts", "import": "./dist/hooks.js" },
    "./theme-script.js": "./dist/theme-script.js",
    "./package.json": "./package.json"
  }
}
```

---

## Testing

Part of Phase 19:
- SSR render-to-string test per component.
- Next.js app-router smoke test in CI.
- Remix smoke test in CI.
- Hydration diff check.

---

## Acceptance Criteria

- [ ] Every component renders via `renderToString` without error.
- [ ] `"use client"` directives present on every stateful component.
- [ ] Next.js app-router starter template runs without warnings.
- [ ] Remix starter template runs.
- [ ] Astro starter template runs.
- [ ] Strict Mode: demo app shows no warnings in dev.
- [ ] Hydration: no mismatch warnings on framework smoke tests.
- [ ] Theme script pre-hydration snippet documented and shipped.
- [ ] `<HydrationBoundary>` utility exported.
- [ ] Integration docs per framework published.

## Notes

- **RSC + context is awkward.** The client-wrapper pattern is the official solution. Document it prominently.
- **Don't try to be RSC-native everywhere.** Interactive UI is inherently client. That's fine.
- **Test on real frameworks.** Unit tests can't catch framework-specific issues; integration smoke tests catch them.
