# Changelog

All notable changes to Voidframe will be recorded here. Dates are in
UTC. The project follows [Semantic Versioning](https://semver.org).

## [Unreleased]

_Nothing yet._

## [1.0.0] - 2026-04-19

First stable release. The library matured through seven phases of framework
expansion (layout, forms, data, overlays, charts, chat/AI, i18n, responsive,
icons, dev tools, testing helpers) and four audit passes (parameter
standardisation, security, functionality, docs). Every exported component
ships with ARIA semantics, keyboard navigation, an `.*Props` type, and a
`displayName`. Every stateful component is controllable / uncontrolled.

### Added

- **500+ components** across primitives, layout, navigation, forms, data
  display, overlays, interactive surfaces, a full chat/AI tier, specialty
  widgets (dev tools, identity, numeric, time, help, encoding, print),
  and ~60 bundled monoline icons.
- **75 hooks** covering state (`useControllableState`, `useDebounce`,
  `useLocalStorage`, `useUndoRedo`, …), input / IO
  (`useKeyboardShortcut`, `useCopyToClipboard`, `useEventSource`,
  `useWebSocket`), layout (`useResizeObserver`, `useContainerQuery`,
  `useIntersectionObserver`), and framework glue (`useId`, `useEvent`,
  `useIsomorphicLayoutEffect`).
- **96 utilities** for formatting, date math, colour manipulation, a11y
  announcers, controllable-state wiring, safe URLs, and deprecation helpers.
- **Four themes**: `darkTheme`, `lightTheme`, `midnightTheme`, `greyTheme`,
  plus `"system"` resolution and per-subtree `<ThemeScope>`.
- **Full i18n** via `MessagesProvider` + `Intl.*` — eight shipped locale
  packs (`en`, `es`, `fr`, `de`, `ja`, `zhCN`, `ar`, `he`) plus `enXA`
  pseudolocale.
- **Responsive system** — CSS-driven `<Show>` / `<Hide>`, `Responsive<T>`
  props on every layout primitive, `ResponsiveBox` escape hatch, and
  hooks (`useBreakpoint`, `useDeviceType`, `useResponsive`,
  `useContainerQuery`).
- **Charts** — core families (`BarChart`, `LineChart`, `AreaChart`,
  `ScatterPlot`, `BubbleChart`, `ComposedChart`, `PieChart`,
  `DonutChart`, `RadarChart`, `Histogram`, `CalendarHeatmap`,
  `Sparkline`, `Heatmap`), advanced layouts (`TreeMap`, `Sunburst`,
  `FunnelChart`, `WaterfallChart`, `BoxPlot`, `ViolinPlot`,
  `CandlestickChart`, `OHLCChart`, `StreamGraph`, `HorizonChart`,
  `Sankey`, `ChordDiagram`, `ParallelCoordinates`, `ScatterMatrix`,
  `SmallMultiples`), and geo/network (`DependencyGraph`, `TileGridMap`,
  `NetworkGraph`, `ChoroplethMap`, `BubbleMap`). Optional d3 peers are
  declared in `peerDependenciesMeta`.
- **Chat/AI tier** — `Conversation`, `MessageList`, `Message`,
  `ToolCall`, `Composer` (compound), `SessionList`, `ChatLayout`,
  `AgentRunner`, `DebugPanel`, `TraceViewer`, and supporting citation /
  attachment / streaming surfaces.
- **Dev experience** — `<DevPanel>` HUD (renders / warnings / theme /
  about tabs), `ProfilerScope`, `DevErrorFallback`, runtime misuse
  warnings on `RadioGroup`, `Tabs`, `Select`, `FormField`, `Combobox`,
  `DataGrid`.
- **Tooling** — `voidframe` CLI (`init`, `theme`, `codemod`, `doctor`,
  `test`), six-rule ESLint plugin (`no-deprecated-props`,
  `no-legacy-chart-imports`, `no-raw-hex-colors`,
  `prefer-compound-pattern`, `require-a11y-label`, `require-use-client`),
  two codemods (`legacy-charts-to-v2`, `tokens-from-hex`), a VS Code
  extension with snippets + hover docs.
- **Testing subpath** (`voidframe/testing`) — `renderWithTheme`,
  `expectNoA11yViolations`, `installMatchMedia`, `createMockStorage`.
- **SSR-safe** — every stateful module carries `"use client"`, a
  `renderToString` smoke test runs in CI, and a pre-hydration theme
  script ships at `voidframe/theme-script.js` to prevent dark→light
  flash.

### Changed

- Replaced the legacy single-file chart surface with scale / axis / grid
  / legend / tooltip / brush primitives; all current charts compose from
  those primitives.
- Replaced `Drawer`, `Modal`, `Popover` with compound `DrawerV2`,
  `Dialog`, `PopoverV2`. The legacy names remain as deprecation shims
  (see below).
- Parameter standardisation across the public API: canonical
  `variant="solid|outline|ghost|subtle"` on Button / IconButton / Badge
  / ToggleGroup, `kind` for non-shape variants on domain components,
  `onDismiss` for overlay close, `onValueChange` unified on non-form
  controls, `value`/`onValueChange` on Pagination + list editors, Tabs
  migrated to compound dot-notation (flat `tabs[]` API removed),
  `defaultValue` added to seven controllable inputs, `asChild` on
  `Text`.
- Security hardening: URL safety helpers enforced on every
  user-controlled `href`; stricter component prop validation.
- Functionality fixes: 42 wired-but-inert props restored or removed;
  ChartFrame scale propagation fixed across 10 charts; DonutChart
  innerRatio regression fixed; Popconfirm overlay anchored to trigger
  under Portal.

### Deprecated

- `Drawer` → `DrawerV2` (removal target: v1.1).
- `Button` `primary` prop → `variant="accent"` (removal target: v1.1).

### Performance

- Bundle budgets in CI: core ESM ≤200 KB, charts ESM ≤40 KB, dev ESM
  ≤10 KB, stylesheet ≤50 KB, combined JS ≤460 KB (all gzipped).
- Heavy components expose `Lazy*` wrappers so consumers can code-split
  the chunk at their boundary.
- Dev-only `warn()` / `warnOnce()` calls are guarded by
  `process.env.NODE_ENV !== "production"` and stripped by bundlers.

### Accessibility

- 33 components formally audited (see `docs/a11y-audit.ts`). Every
  component in the audit runs through `jest-axe` on every commit.
  Remaining surface uses the same patterns — broader audit tracked in
  plan 33+.

### Documentation

- README, CHANGELOG, docs-site guides, and migration pages aligned with
  the shipping surface (component counts, bundle budgets, theme list,
  subpath exports, contributing link).
- ESLint rule pages rehomed under `voidframe.github.io/ui/eslint-plugin`.
- TSDoc backfill across 29 Tier-A components with more in progress.
