# Changelog

All notable changes to Voidframe will be recorded here. Dates are in
UTC. The project follows [Semantic Versioning](https://semver.org).

## [Unreleased]

### Added — Phase 28: CLI & Distribution

- `voidframe` CLI (`tools/cli/`) — `init`, `theme`, `codemod`, `doctor`,
  and `test` subcommands for scaffolding new projects, generating test
  files with prop-aware stubs, and running health checks.
- VS Code extension (`tools/vscode-voidframe/`) — snippets for every
  public component (prefixed `vf-<name>` or the PascalCase name), hover
  docs backed by the same props metadata the docs site uses, and an
  "Open Playground" command. Packaged as `.vsix`, not published.
- `prepublishOnly` hook runs typecheck + full tests + build before any
  `npm publish` attempt.
- `.npmignore` plus tightened `files` field so only the published
  surface ships to npm.

### Added — Phase 27: Docs & Playground

- `docs/` Vite app (port 5175) with a brutalist shell, search, eight
  representative component pages, and live `<Playground>` examples.
- `src/dev/Playground` — react-live-powered in-browser code editor +
  preview pane.
- `src/dev/PropsTable` — renders auto-extracted component docs with
  required-first sorting and prop filters.
- `scripts/extract-props.mjs` — walks `src/**\/*.tsx` with
  `react-docgen-typescript` and writes `docs/data/props.json`.

### Added — Phase 26: Tooling / Build

- `eslint-plugin-voidframe` (`tools/eslint-plugin-voidframe/`) with
  `no-raw-hex-colors`, `no-legacy-chart-imports`, and
  `require-use-client` rules.
- Codemods (`tools/codemods/`): `legacy-charts-to-v2`, `tokens-from-hex`.
- Bundle analyzer via `rollup-plugin-visualizer` behind `npm run analyze`.
- Per-artifact size budgets under `size-limit` (ESM, CJS, CSS, combined).

### Added — Phase 25: Dev Experience

- `DevPanel` floating HUD with Renders / Warnings / Theme / About tabs.
- `ProfilerScope` + `useRenderProfiler` for per-component render metrics.
- `DevErrorFallback` (pair with primitive `ErrorBoundary`) for a
  brutalist error overlay with stack + reset.
- Runtime misuse warnings on `RadioGroup`, `Tabs`, `Select`,
  `FormField`, and `Combobox`.

### Added — Phase 24: Geo + Network charts

- `NetworkGraph` (force-directed), `DependencyGraph` (layered DAG with
  side-gutter edge routing), `ChoroplethMap`, `BubbleMap`, `TileGridMap`.
- Optional peer-dep plumbing (`d3-force`, `d3-geo`, `topojson-client`).

### Added — Phase 23: Advanced charts

- `TreeMap`, `Sunburst`, `FunnelChart`, `WaterfallChart`, `BoxPlot`,
  `ViolinPlot`, `CandlestickChart`, `OHLC`, `StreamGraph`, `HorizonChart`,
  `Sankey`, `ChordDiagram`, `ParallelCoordinates`, `ScatterMatrix`,
  `SmallMultiples`.

### Added — Phase 22: Core charts

- `BarChart`, `LineChart`, `AreaChart`, `ScatterPlot`, `BubbleChart`,
  `ComposedChart`, `PieChart`, `DonutChart`, `RadarChart`, `Histogram`,
  `CalendarHeatmap`, refreshed `Sparkline`, refreshed `Heatmap`.

### Added — Phase 21: Chart foundations

- Scales, axes, gridlines, legend, tooltip, crosshair, brush primitives.
- `computeAnchoredPosition` lifted to `src/utils/anchor.ts`.

### Earlier phases

Phases 1–20 established the component surface (layout, forms, data,
overlays, charts-legacy, i18n, responsive system, icons). See git
history for per-commit detail.
