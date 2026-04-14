# VOIDFRAME — Production Framework Implementation Plan

## Context

Voidframe is a dark monochrome React UI framework with a terminal-brutalist aesthetic. The current foundation is real but early: 63 components, 14 hooks, 14 utilities, a token-based theme system driven by React context, and a Vite library build. All styling is inline `style={{}}`. No TypeScript. Minimal accessibility. No tests. No animations. No SSR story.

This plan turns Voidframe into a **tier-1, production-grade component framework** — competitive in depth, quality, and DX with Radix, Ark, Mantine, Chakra, and MUI — while preserving its distinctive brutalist identity.

The plan is deliberately large. Each sub-document in `plans/` is focused, self-contained, and owns its own success criteria. Read the overview to understand scope and sequencing; read sub-documents when executing a specific phase.

## Source Layout

```
voidframe/
├── package.json
├── vite.config.js
├── README.md
├── VoidFrameImplementationPlan.md         # this file
├── plans/                                 # detailed sub-plans
│   ├── 01-typescript-migration.md
│   ├── 02-architecture-patterns.md
│   ├── 03-primitives-and-hooks.md
│   ├── 04-css-architecture.md
│   ├── 05-accessibility.md
│   ├── 06-animation-system.md
│   ├── 07-components-forms.md
│   ├── 08-components-layout-navigation.md
│   ├── 09-components-data-display.md
│   ├── 10-components-feedback-overlays.md
│   ├── 11-components-interactive-media.md
│   ├── 12-components-chat-ai.md
│   ├── 13-components-specialty.md
│   ├── 14-iconography.md
│   ├── 15-theming-system.md
│   ├── 16-responsive-system.md
│   ├── 17-i18n-rtl-locale.md
│   ├── 18-ssr-and-frameworks.md
│   ├── 19-testing.md
│   ├── 20-performance.md
│   ├── 21-dev-experience.md
│   ├── 22-tooling-and-build.md
│   ├── 23-docs-and-playground.md
│   ├── 24-cli-and-distribution.md
│   └── 25-design-tools.md
├── src/
│   ├── index.js                           # barrel export
│   ├── tokens.js                          # design tokens
│   ├── utils.js                           # formatting + misc helpers
│   ├── provider/VoidframeProvider.jsx
│   ├── hooks/index.js
│   └── components/                        # 11 grouped modules (current)
└── demo/
    ├── index.html
    └── App.jsx
```

## Design Principles (inviolable)

1. **Monospace only** — Courier New. No secondary typeface ever.
2. **Zero border-radius** — all elements are rectangular.
3. **Five-layer depth** — `bg0→bg5` surfaces, no box-shadows.
4. **Accent by exception** — 95% grayscale. Color is semantic only.
5. **Information density** — tight spacing, dense tables, trust the user.
6. **Uppercase chrome** — labels/metadata are uppercase + letter-spaced. Content is mixed-case.
7. **Keyboard-first** — every interaction reachable without a pointer.
8. **Deterministic aesthetic** — same input produces visually identical output across themes.

The brutalist aesthetic is a **constraint, not a limitation**. Every component we add must feel like it was forged from the void — not retrofitted from a generic design system.

## Design Tokens (current baseline)

```js
{
  bg0: "#050505", bg1: "#0a0a0a", bg2: "#0d0d0d", bg3: "#111111", bg4: "#161616", bg5: "#1a1a1a",
  border0: "#111111", border1: "#1a1a1a", border2: "#222222", border3: "#333333", border4: "#444444",
  text0: "#ffffff", text1: "#cccccc", text2: "#888888", text3: "#555555", text4: "#333333", text5: "#1a1a1a",
  green: "#4ade80", red: "#f87171", amber: "#c8aa3e", blue: "#6b9fdd", purple: "#a855f7", cyan: "#22d3ee", rose: "#ff6b6b",
  success: "#4ade80", danger: "#f87171", warning: "#c8aa3e", info: "#6b9fdd",
  fontFamily: "'Courier New', 'Courier', 'Liberation Mono', monospace",
  fontXxs: 8, fontXs: 9, fontSm: 10, fontMd: 12, fontLg: 14, fontXl: 18, fontXxl: 24, font3xl: 32,
  sp1-sp12: 2→48 scale,
  radius: 0, transition: "all 0.15s ease",
}
```

Tokens will expand in [15-theming-system.md](plans/15-theming-system.md) to include density modes, high-contrast, breakpoints, z-index scale, motion tokens, and semantic color aliases.

## Plan Structure

The 25 sub-documents are grouped into five tracks:

### Track A — Foundation (architecture layer)

| # | Document | Focus |
|---|----------|-------|
| 01 | [TypeScript migration](plans/01-typescript-migration.md) | Rename, type every component/hook/util, ship `.d.ts` |
| 02 | [Architecture patterns](plans/02-architecture-patterns.md) | Polymorphic `as`, forwardRef, `asChild`/Slot, compound components, controllable state, dev warnings |
| 03 | [Primitives & hooks](plans/03-primitives-and-hooks.md) | Slot, Portal, FocusTrap, Presence, DismissableLayer, FloatingElement, ~60 hooks |
| 04 | [CSS architecture](plans/04-css-architecture.md) | Replace inline styles with CSS custom properties, `cx()`, pseudo-selectors, keyframes |
| 05 | [Accessibility](plans/05-accessibility.md) | WCAG 2.1 AA on every interactive component, keyboard nav, screen-reader patterns |
| 06 | [Animation system](plans/06-animation-system.md) | `<Transition>` primitive, overlay enter/exit, `prefers-reduced-motion` |

### Track B — Components (the surface area)

| # | Document | Count |
|---|----------|-------|
| 07 | [Forms & inputs](plans/07-components-forms.md) | ~40 |
| 08 | [Layout & navigation](plans/08-components-layout-navigation.md) | ~30 |
| 09 | [Data display](plans/09-components-data-display.md) | ~35 |
| 10 | [Feedback & overlays](plans/10-components-feedback-overlays.md) | ~25 |
| 11 | [Interactive & media](plans/11-components-interactive-media.md) | ~25 |
| 12 | [Chat & AI UX](plans/12-components-chat-ai.md) | ~35 |
| 13 | [Specialty](plans/13-components-specialty.md) | ~20 |

Target: **~200 named components** by end of Track B.

### Track C — Systems (cross-cutting capability)

| # | Document | Focus |
|---|----------|-------|
| 14 | [Iconography](plans/14-iconography.md) | `<Icon>`, bundled void-aesthetic set, third-party integration, sprite/font support |
| 15 | [Theming system](plans/15-theming-system.md) | Multiple themes, density modes, high-contrast, ThemeScope, runtime switching |
| 16 | [Responsive system](plans/16-responsive-system.md) | Breakpoint tokens, `Responsive<T>` prop pattern, `<Show>`/`<Hide>`, container queries |
| 17 | [i18n, RTL, locale](plans/17-i18n-rtl-locale.md) | Message catalog, logical properties, pluralization, locale-aware formatting |
| 18 | [SSR & frameworks](plans/18-ssr-and-frameworks.md) | Next.js app router, Remix, Astro, RSC boundary, Strict Mode, hydration safety |

### Track D — Quality

| # | Document | Focus |
|---|----------|-------|
| 19 | [Testing](plans/19-testing.md) | Vitest + RTL, axe-core a11y, Playwright component, Chromatic visual regression |
| 20 | [Performance](plans/20-performance.md) | `memo`, bundle budgets, code splitting, per-component entry points, profiling |
| 21 | [Dev experience](plans/21-dev-experience.md) | Dev warnings, debug mode, DevTools panel, error messages with fix suggestions |

### Track E — Ecosystem

| # | Document | Focus |
|---|----------|-------|
| 22 | [Tooling & build](plans/22-tooling-and-build.md) | ESLint, Prettier, Storybook, CI, changesets, release automation |
| 23 | [Docs & playground](plans/23-docs-and-playground.md) | Dogfooded docs site, live playground, recipe cookbook, API reference |
| 24 | [CLI & distribution](plans/24-cli-and-distribution.md) | `voidframe add <component>` (shadcn-style), starter templates, npm package |
| 25 | [Design tools](plans/25-design-tools.md) | Figma plugin + library, Style Dictionary export, VSCode extension |

## Execution Order

Dependencies drive sequencing. The order below optimizes for **unblocking** rather than numerical order.

| Order | Phase | Effort | Why here |
|-------|-------|--------|----------|
| 1 | 01 TypeScript | 2-3 d | Everything else is harder without types. |
| 2 | 02 Architecture patterns | 2-3 d | Polymorphism + controllable state + Slot are load-bearing. Establish before touching components. |
| 3 | 03 Primitives & hooks | 3-4 d | FocusTrap/Portal/Presence/Floating/etc. unlock overlays and interactive components. |
| 4 | 04 CSS architecture | 3-4 d | Unlocks pseudo-selectors, SSR, responsive, reduced-motion. Migrate existing 63 components first. |
| 5 | 06 Animation system | 1-2 d | `<Transition>` primitive needed by overlays. |
| 6 | 05 Accessibility (pass 1) | 2-3 d | Retrofit a11y onto the 63 existing components now that primitives exist. |
| 7 | 15 Theming | 1-2 d | Density + nested scopes + high-contrast before new components are built. |
| 8 | 16 Responsive | 1-2 d | `Responsive<T>` before Layout components are rebuilt. |
| 9 | 14 Iconography | 1-2 d | Icon system before form/nav/chat components that need icons. |
| 10 | 07 Forms & inputs | 6-8 d | Highest consumer demand; also stresses all prior foundations. |
| 11 | 08 Layout & navigation | 3-4 d | AppShell, Sidebar, ContextMenu, etc. |
| 12 | 09 Data display | 5-7 d | DataGrid is large; TreeView, VirtualList, Calendar, charts primitives. |
| 13 | 10 Feedback & overlays | 3-4 d | Sheet, HoverCard, CommandPalette, NotificationCenter, Spotlight. |
| 14 | 11 Interactive & media | 3-4 d | Carousel, Lightbox, drag-drop, video/audio. |
| 15 | 12 Chat & AI UX | 5-7 d | Full chat surface — message list, streaming, tool calls, citations, composer. |
| 16 | 13 Specialty | 3-5 d | Terminal, CodeEditor, MarkdownRenderer, DiffViewer, JSONViewer. |
| 17 | 05 Accessibility (pass 2) | 2-3 d | Audit the new components; run axe across entire library. |
| 18 | 17 i18n / RTL | 2-3 d | Message catalog + RTL logical properties. |
| 19 | 18 SSR & frameworks | 2-3 d | Certify Next.js (app + pages), Remix, Astro, Vite. RSC boundary documented. |
| 20 | 19 Testing | 5-7 d | Unit + a11y + visual regression across everything. |
| 21 | 20 Performance | 2-3 d | Profile, memoize, bundle split, set budgets. |
| 22 | 21 Dev experience | 2 d | Dev warnings, debug mode, DevTools panel. |
| 23 | 22 Tooling | 2 d | Storybook, CI, changesets, release flow. |
| 24 | 23 Docs & playground | 4-6 d | Dogfooded docs site with live playground. |
| 25 | 24 CLI & distribution | 2-3 d | `voidframe add` + starter templates. |
| 26 | 25 Design tools | 2-3 d | Figma library, token export, VSCode extension. |

**Total estimated effort: 70-95 days of focused work** (about 3-5 months of full-time or 6-9 months part-time).

## Success Criteria (what "done" looks like)

### Surface
- **~200 components**, **~60 hooks**, **~20 primitives** — all exported with types
- **100% TypeScript** with strict mode; every component has an exported `Props` interface
- **WCAG 2.1 AA** on every interactive component (axe-verified)
- **Zero-runtime CSS** for static styles; inline styles only as escape hatch
- **Polymorphic + forwardRef** on every component
- **Controlled + uncontrolled** variants on every stateful component

### Compatibility
- Works in: **Next.js 14+** (app + pages router), **Remix**, **Astro**, **Vite**, **Gatsby**, **Parcel**, plain CRA
- **SSR-safe**, **RSC-aware**, **Strict Mode safe**, **Concurrent rendering safe**
- **RTL complete** — every component passes mirrored visual regression
- **Locale-aware** formatting (dates, numbers, currencies, plurals)
- **Zero hydration mismatches** in verified frameworks

### Performance
- **Core bundle <50KB gzipped**, full library <150KB gzipped
- **Tree-shakable**: importing `<Button>` pulls only Button + its deps
- **Per-component entry points** published
- **Lazy-loadable heavies** (Modal, CodeEditor, DatePicker, DataGrid) documented

### Quality
- **Unit tests** on every component, hook, utility
- **Axe a11y tests** on every interactive component
- **Playwright component tests** on every overlay/interaction-heavy component
- **Visual regression** on every component (Chromatic or Percy)
- **Zero type errors**, **zero lint errors**, **zero console warnings** in strict/dev mode

### Ecosystem
- Published **docs site** with live playground, recipes, migration guides, a11y statement
- **CLI** (`voidframe add <component>`) for copy-paste source distribution
- **Starter templates** for Next.js, Vite, Remix
- **Figma library** matching every component 1:1
- **Style Dictionary export** for non-React and design-tool consumers
- **VSCode extension** with snippets + token preview

## Non-Goals (things Voidframe will not try to be)

- **Not a headless-only library.** Voidframe is opinionated about aesthetic. If you want to paint it yourself, use Radix or Ark. (We will, however, expose enough primitives that you could build a headless layer on top.)
- **Not a mobile-first framework.** Optimized for dense desktop UIs. Responsive + mobile will work; it won't be the center of gravity.
- **Not a charting library.** We ship primitives (Sparkline, Heatmap, Gauge) but not a full chart engine. Integrate with Recharts/Visx/D3 for that.
- **Not a form library.** We ship excellent form *components*; for schema-driven forms, integrate react-hook-form or Formik (adapters provided).
- **Not a CSS framework.** We emit the CSS for *our* components; we don't provide utility classes for your app.
- **Not an animation engine.** We ship a lightweight `<Transition>` for enter/exit; for complex choreography, integrate Framer Motion.

## Rules for Implementation

- **Type-first**: every new component lands with TS types from day one.
- **Tests concurrent with code (non-negotiable)**: every new component, hook, utility, bug-fix — and every migration of an existing one — lands with its tests in the same commit. Tests are a continuous discipline, not a batch phase.
  - Minimum per component: 1 render test, 1 prop test, 1 interaction test (if stateful), 1 a11y assertion.
  - Minimum per hook: 1 behavior test via `renderHook`.
  - Minimum per utility: happy path + edge case + error case.
  - Bug fixes ship with a regression test proving the fix.
- **Phase gate**: no phase is complete until `make test` passes in Docker with the new tests included. `make check` (tsc) and `make build` must also pass.
- **Demo-safe**: the `demo/` app must continuously work throughout every phase. Never break it.
- **Commit small**: one component or one sub-phase per commit. Never batch.
- **Preserve pixel parity** across CSS migrations — screenshot before and after.
- **Preserve the aesthetic** — any new component must feel consistent with the brutalist identity. When in doubt, simplify.
- **Respect `style` escape hatch** — the `style` prop must always work as a final override on every component.
- **No silent failures** — dev-mode warnings must fire for invalid prop combinations, missing required context, and a11y violations.
- **Everything runs in Docker** — no host-level Node/npm invocations. See "Dev Environment" below.

## Dev Environment

All tooling runs inside Docker. Nothing touches the host's Node install.

**One-time setup** (after cloning):

```
make build-image     # build the dev image
```

**Daily workflow:**

```
make dev        # library watch server  → http://localhost:5174
make demo       # interactive demo      → http://localhost:5173
make check      # tsc --noEmit
make test       # vitest run (full suite)
make test-watch # vitest in watch mode
make build      # production build (dist/ + .d.ts)
make sh         # interactive shell in the dev container
make install    # refresh node_modules after package.json changes
make reset      # nuke node_modules volume + rebuild image
```

**Under the hood:**

- [Dockerfile.dev](Dockerfile.dev) — single `node:20-alpine` image with deps pre-installed.
- [docker-compose.yml](docker-compose.yml) — services: `demo`, `dev`, `typecheck`, `test`, `test-watch`, `build`, `shell`, `install`.
- Named volume `voidframe_node_modules` shadows the host bind-mount so host `node_modules` never populates.
- [vite.config.ts](vite.config.ts) binds dev server to `0.0.0.0` with `usePolling: true` for reliable HMR across bind mounts.

**Phase completion checklist** (every phase):
1. `make check` passes (zero type errors).
2. `make test` passes (all tests green, including new ones added this phase).
3. `make build` passes (production bundle emits cleanly with `.d.ts`).
4. Demo still renders without regressions (`make demo`, manual verify).
5. No new dev-mode warnings in the console when running the demo.

## Cross-References

- [README.md](README.md) — user-facing framework introduction
- [LICENSE](LICENSE) — MIT
- [package.json](package.json) — current peer deps & build config
- [demo/App.jsx](demo/App.jsx) — current component showcase

---

**Start with [01-typescript-migration.md](plans/01-typescript-migration.md).** Each sub-document is self-contained: read it before starting that phase; it will list its own inputs, deliverables, and acceptance criteria.
