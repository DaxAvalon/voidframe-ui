# Changelog

All notable changes to voidframe-ui will be recorded here. Dates are in
UTC. The project follows [Semantic Versioning](https://semver.org).

## [Unreleased]

### Documentation

- README "Subpath imports" section now explains when to reach for a
  subpath vs the root. Bundler consumers (Vite, Webpack, Next.js,
  Remix, …) should keep using `voidframe-ui` — bundlers tree-shake.
  Bundler-free consumers (raw Node scripts, Deno, Bun without a
  bundler, `node --input-type=module`, esm.sh, unpkg) should import
  from the category subpath (`voidframe-ui/core`, `.../forms`, etc.)
  because the root bundle statically references every optional peer's
  chunk; without tree-shaking, Node's ESM loader fails to resolve
  `dompurify` / `d3-*` / `react-live` at load time unless those
  optional peers are installed.

## [1.0.0] - 2026-04-21

First public release. Two years of pre-public development matured the
library through layered framework expansion (primitives, layout, forms,
data, overlays, charts, chat/AI, i18n, responsive, icons, dev tools,
testing helpers) and a sequence of audit passes (parameter
standardisation, security, functionality, docs, accessibility), followed
by three-tier real-browser interaction coverage and a publish-prep
polish pass. Every exported component ships with ARIA semantics,
keyboard navigation, a typed `.*Props` interface, and a `displayName`.
Every stateful component is controllable / uncontrolled.

### Added

- **500+ components** across primitives, layout, navigation, forms, data
  display, overlays, interactive surfaces, a full chat/AI tier,
  specialty widgets (dev tools, identity, numeric, time, help, encoding,
  print), and ~60 bundled monoline icons.
- **75 hooks** covering state (`useControllableState`, `useDebounce`,
  `useLocalStorage`, `useUndoRedo`, …), input / IO
  (`useKeyboardShortcut`, `useCopyToClipboard`, `useEventSource`,
  `useWebSocket`), layout (`useResizeObserver`, `useContainerQuery`,
  `useIntersectionObserver`), and framework glue (`useId`, `useEvent`,
  `useIsomorphicLayoutEffect`).
- **96 utilities** for formatting, date math, colour manipulation,
  a11y announcers, controllable-state wiring, safe URLs, and
  deprecation helpers.
- **Four themes**: `darkTheme`, `lightTheme`, `midnightTheme`,
  `greyTheme`, plus `"system"` resolution and per-subtree
  `<ThemeScope>`.
- **Visual-rhythm theme tokens** (brutalist defaults preserved;
  consumer-overridable):
  - `--vf-font-mono` / `--vf-font-sans` / `--vf-font-display` —
    distinct font-stack slots; `--vf-font-family` kept as an alias
    for the mono slot.
  - `--vf-heading-case` — `uppercase` by default; set to `none` for
    title-case.
  - `--vf-heading-tracking` — heading letter-spacing (`0.08em` default).
  - `--vf-radius-0/1/2` — border-radius scale (0 by default, preserves
    zero-corner brutalist default).
- **Full i18n** via `MessagesProvider` + `Intl.*` — eight shipped
  locale packs (`en`, `es`, `fr`, `de`, `ja`, `zhCN`, `ar`, `he`)
  plus `enXA` pseudolocale.
- **Responsive system** — CSS-driven `<Show>` / `<Hide>`,
  `Responsive<T>` props on every layout primitive, `ResponsiveBox`
  escape hatch, and hooks (`useBreakpoint`, `useDeviceType`,
  `useResponsive`, `useContainerQuery`).
- **Charts** — core families (`BarChart`, `LineChart`, `AreaChart`,
  `ScatterPlot`, `BubbleChart`, `ComposedChart`, `PieChart`,
  `DonutChart`, `RadarChart`, `Histogram`, `CalendarHeatmap`,
  `Sparkline`, `Heatmap`), advanced layouts (`TreeMap`, `Sunburst`,
  `FunnelChart`, `WaterfallChart`, `BoxPlot`, `ViolinPlot`,
  `CandlestickChart`, `OHLCChart`, `StreamGraph`, `HorizonChart`,
  `Sankey`, `ChordDiagram`, `ParallelCoordinates`, `ScatterMatrix`,
  `SmallMultiples`), and geo/network (`DependencyGraph`,
  `TileGridMap`, `NetworkGraph`, `ChoroplethMap`, `BubbleMap`).
  Optional d3 peers are declared in `peerDependenciesMeta`.
- **Chat/AI tier** — `Conversation`, `MessageList`, `Message`,
  `ToolCall`, `Composer` (compound), `SessionList`, `ChatLayout`,
  `AgentRunner`, `DebugPanel`, `TraceViewer`, and supporting
  citation / attachment / streaming surfaces.
- **Dev experience** — `<DevPanel>` HUD (renders / warnings / theme /
  about tabs), `ProfilerScope`, `DevErrorFallback`, runtime misuse
  warnings on `RadioGroup`, `Tabs`, `Select`, `FormField`, `Combobox`,
  `DataGrid`.
- **Tooling** — `voidframe` CLI (`init`, `theme`, `codemod`, `doctor`,
  `test`), a **13-rule ESLint plugin** (`no-deprecated-props`,
  `no-deprecated-prop-combination`, `no-inline-style-overrides`,
  `no-legacy-chart-imports`, `no-raw-hex-colors`, `prefer-asChild`,
  `prefer-compound-pattern`, `prefer-subpath-import`,
  `require-a11y-label`, `require-controlled-pair`, `require-use-client`,
  `require-voidframe-provider`, `exhaustive-kind-variant`), two
  codemods (`legacy-charts-to-v2`, `tokens-from-hex`), a VS Code
  extension with snippets + hover docs + Open Playground command.
- **Tree-shaking subpaths** — alongside the monolithic root import,
  the library ships 14 per-category subpaths driven by the docs
  taxonomy: `voidframe-ui/primitives`, `/core`, `/layout`,
  `/navigation`, `/forms`, `/data`, `/activity`, `/overlays`,
  `/media`, `/animation`, `/icons`, `/chat`, `/specialty`,
  `/interactive`, plus the pre-existing `/charts`, `/dev`,
  `/tokens`, `/testing`, `/styles.css`, and `/theme-script.js`.
  Consumers importing from a subpath only pay for the components
  they touch plus shared primitives; the root `voidframe-ui` import
  keeps working unchanged for progressive migration.
- **Testing subpath** (`voidframe-ui/testing`) — `renderWithTheme`,
  `expectNoA11yViolations`, `installMatchMedia`, `createMockStorage`.
- **SSR-safe** — every stateful module carries `"use client"`, a
  `renderToString` smoke test runs in CI, and a pre-hydration theme
  script ships at `voidframe-ui/theme-script.js` to prevent
  dark→light flash.

### Changed

- Replaced the legacy single-file chart surface with scale / axis /
  grid / legend / tooltip / brush primitives; all current charts
  compose from those primitives.
- Replaced `Drawer`, `Modal`, `Popover` with compound `DrawerV2`,
  `Dialog`, `PopoverV2`. The legacy names remain as deprecation
  shims (see below).
- Parameter standardisation across the public API: canonical
  `variant="solid|outline|ghost|subtle"` on Button / IconButton /
  Badge / ToggleGroup, `tone="neutral|accent|success|warning|danger|info"`
  for semantic colour, `onDismiss` for overlay close, `onValueChange`
  unified on non-form controls, `value`/`onValueChange` on Pagination
  and list editors, Tabs migrated to compound dot-notation (flat
  `tabs[]` API removed), `defaultValue` added to seven controllable
  inputs, `asChild` on `Text`.
- `Dialog.Cancel` and `Dialog.Action` now accept `asChild` so trigger
  children render as the consumer's own interactive element, avoiding
  nested-interactive a11y issues.
- `ReactionPicker.onReact` renamed to `onPick` (the handler emits the
  `Reaction.id`, not an emoji character); `ReactionBar.onReact` is
  unchanged and still emits the emoji.
- `ContextMenu` now dismisses on item click (previously the portaled
  menu swallowed the click and stayed open).
- `MenuBar` triggers render `role="menuitem"` to satisfy the
  `aria-required-children` ARIA rule; opening a sibling menu closes
  the previous one via a shared active-id registry.
- `Menu.Content` auto-focuses the first enabled item on open so
  arrow-key navigation works without an initial hint.
- `Toolbar` now implements orientation-aware arrow-key navigation
  (Home / End jump to first / last) to match its `role="toolbar"`
  contract.
- `ResizableHandle` exposes `aria-valuenow` / `aria-valuemin` /
  `aria-valuemax` / `aria-valuetext` reflecting the percentage split
  of the panel to its left.
- `CommandPalette` input is now an ARIA 1.2 combobox (`role="combobox"`,
  `aria-expanded="true"`, `aria-autocomplete="list"`,
  `aria-controls`/`aria-owns` linking the listbox) with a labelled
  listbox; items are direct listbox children via a `role="presentation"`
  group wrapper so AT can resolve `aria-activedescendant`.
- `Avatar` status indicator gained `role="img"` so its `aria-label`
  is spec-valid.
- `Callout` root element is now `<div>` (was `<aside>`); it is
  editorial emphasis, not a page-level complementary landmark.
- `Toaster` adds `data-vf-ignore-outside-click="true"` so clicking a
  toast's Dismiss button doesn't trip outside-click dismissal of the
  modal underneath it.
- `DismissableLayer.isTopmost()` rewritten to handle portaled sibling
  layers correctly: a layer is topmost iff no descendant layer exists
  and no later-pushed non-ancestor sibling layer exists. Fixes the
  prior cascade where a single Escape closed both a Dialog and a
  nested Popover simultaneously.
- Security hardening: URL safety helpers enforced on every
  user-controlled `href`; stricter component prop validation.
- Functionality fixes: 42 wired-but-inert props restored or removed;
  ChartFrame scale propagation fixed across 10 charts; DonutChart
  innerRatio regression fixed; Popconfirm overlay anchored to
  trigger under Portal.

### Deprecated

- `Drawer` → `DrawerV2` (removal target: v1.1).
- `Button` `primary` prop → `variant="solid"` + `accent="var(--vf-accent)"`
  (removal target: v1.1).

### Performance

- **Tree-shaking.** Category subpath imports let consumers pull only
  the components they use. The root bundle code-splits aggressively
  — each subpath entry file is < 1 KB gzipped and pulls in only the
  chunks its components transitively reference.
- Bundle budgets in CI: core ESM ≤200 KB, charts ESM ≤40 KB, dev ESM
  ≤10 KB, stylesheet ≤50 KB, per-category subpaths individually
  ceilinged, and a combined-JS aggregate guardrail — all gzipped.
- Heavy components expose `Lazy*` wrappers so consumers can
  code-split the chunk at their boundary.
- Dev-only `warn()` / `warnOnce()` calls are guarded by
  `process.env.NODE_ENV !== "production"` and stripped by bundlers.

### Accessibility

- 40+ components formally audited (see `docs/a11y-audit.ts`). Every
  component in the audit runs through `jest-axe` on every commit.
- Remaining surface uses the same patterns — broader audit tracked
  as a post-1.0 initiative.
- Three-tier Playwright interaction coverage (see Testing) adds
  real-browser axe sweeps on 40+ component routes across all four
  built-in themes, plus open-state axe checks on every overlay.

### Testing

- **Unit tests** — 5,100+ tests across 341 files (vitest +
  happy-dom). First line of defence for API contract, prop wiring,
  state transitions, and hook behaviour.
- **Visual regression** — Playwright-driven screenshot sweep across
  the four themes (`test/visual/`).
- **E2E interaction** — dedicated Playwright harness in `e2e/` on
  port 5176 with 44 component-fixture routes and 49 spec files
  covering focus traps through Portals, DOM keyboard navigation
  across compound components, `data-side` flip logic,
  `color-mix()` / `:has()` CSS, clipboard API, touch pointer
  events, `getBoundingClientRect()` math, and `ResizeObserver`
  settle. Runs across chromium + firefox + webkit with
  `@axe-core/playwright` sweeps on chromium. Three tiers:
  - Tier A — flagship flows for the 25 highest-bug-density
    components (overlays, compound keyboard, forms, data, canvas).
  - Tier B — secondary interaction flows for the next 14
    components (ContextMenu, Toast, Spotlight, Carousel, ScrollArea,
    Resizable, Collapsible, CommandPalette, Stepper, Toolbar,
    Calendar, NumberStepper, ColorPicker, Wizard).
  - Tier C / D — display-sweep axe coverage + cross-component
    integration flows (nested overlays, focus-restore chain,
    Escape unwind ordering, scroll-lock stacking, theme-switch
    while overlay open, portal z-order).

### Documentation

- README, this CHANGELOG, docs-site guides, and migration pages
  aligned with the shipping surface (component counts, bundle
  budgets, theme list, subpath exports, contributing link).
- ESLint rule documentation is aspirational at
  `daxavalon.github.io/voidframe-ui/eslint-plugin#<rule>`; each
  rule's message also links to its source file on GitHub so
  pre-deploy the URL still resolves.
- TSDoc backfill across the full public surface — every exported
  component, hook, and utility has a TSDoc block picked up by
  `docs/data/*.json`.
- `CONTRIBUTING.md` added with the full contributor workflow plus
  a dedicated section for AI coding assistants working in this
  codebase.
