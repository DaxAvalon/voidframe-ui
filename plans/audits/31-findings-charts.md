# Audit 31 — charts bucket findings

**Components audited:** 49
**Components with findings:** 18
**Zero-finding components:** 31

## Severity counts
- P0: 5
- P1: 8
- P2: 9
- P3: 11

## Findings by component

### `AreaChart` — src/charts/AreaChart.tsx
- **F1 (P0):** `showGrid` prop wires to `<Gridlines mode="both" ticks={valueTicks} />` at src/charts/AreaChart.tsx:325, but `Gridlines` reads `xScale`/`yScale` from `ChartContext` (src/charts/primitives/Gridlines.tsx:27-42) which **AreaChart never populates** — ChartFrame is called without `xScale`/`yScale` props (src/charts/AreaChart.tsx:125-132). The Axis children consume local `xScale`/`yScale` via explicit props, but `Gridlines` gets `undefined` for both, so `xTicks`/`yTicks` arrays stay empty and no lines render. Result: `showGrid={true}` is a no-op. Classification: DEAD PROP (feature regression affecting user-visible output).
- **F2 (P2):** `showStroke` default wired correctly (lines 92, 353-360, 386-393) but not covered by the existing `__tests__/AreaChart.test.tsx` test suite — no test flips the default. Classification: UNTESTED-BUT-WORKING.

### `BarChart` — src/charts/BarChart.tsx
- **F1 (P0):** Same `Gridlines` defect as AreaChart — `showGrid` flows into `<Gridlines mode={isVertical ? "y" : "x"} ticks={valueTicks} />` (src/charts/BarChart.tsx:315) but BarChart never passes `xScale`/`yScale` to `ChartFrame` (lines 133-140). Result: `showGrid={true}` renders no gridlines.
- **F2 (P2):** `BarChartSeries.tone` flows only into the legend swatch class (line 166) but is never documented as caller-visible; props inventory treats it as non-prop (series config). Informational only.

### `LineChart` — src/charts/LineChart.tsx
- **F1 (P0):** Same `Gridlines` defect — `<Gridlines mode="both" ticks={valueTicks}>` at line 342 but ChartFrame (lines 129-136) is never given `xScale`/`yScale`. `showGrid={true}` is a no-op.

### `ScatterPlot` — src/charts/ScatterPlot.tsx
- **F1 (P0):** Same `Gridlines` defect at line 265 (`<Gridlines mode="both" ticks={yTicks} />`). ChartFrame is called without scales (lines 107-114). `showGrid={true}` renders nothing.
- **F2 (P1):** `showLegend` only renders legend when `resolvedSeries.length > 1` (line 130). With a single implicit series the caller cannot force the legend on. Classification: prop works on main path but not edge case.
- **F3 (P2):** No `onChange`/`onClick` callback — unlike BarChart which exposes `onBarClick`, ScatterPlot's `Point.onPointHover` triggers tooltip only; no point-click surface. Undocumented asymmetry.

### `BubbleChart` — src/charts/ScatterPlot.tsx (alias)
- **F1 (P0):** Inherits ScatterPlot's Gridlines dead-prop defect (same code path).
- **F2 (P3):** BubbleChart is a re-export with a renamed `displayName` (lines 174-175). It is not covered by a dedicated `BubbleChart.test.tsx` — only `ScatterPlot.test.tsx` exists. Classification: TEST-COVERAGE-ONLY GAP.

### `CandlestickChart` — src/charts/CandlestickChart.tsx
- **F1 (P0):** Same `Gridlines` defect at line 210. `showGrid={true}` is a no-op.
- **F2 (P2):** `xTicks` prop forwarded to `<Axis ticks={xTicks} />` at line 213, but the underlying X axis uses `bandScale` where `generateTicks` ignores tick count and returns one per band entry (per `src/charts/math/ticks.ts` band-path behavior). Classification: prop accepted but has no effect for this variant — DEAD ON MAIN PATH for band axes.

### `OHLCChart` — src/charts/CandlestickChart.tsx (alias)
- **F1 (P0):** Same Gridlines defect (shares renderer).
- **F2 (P2):** `variant={props.variant ?? "ohlc"}` at line 151 sets the default correctly (props.variant wins when defined, "ohlc" otherwise). This order is correct; noted only because DonutChart has the opposite-order bug (see below).

### `ComposedChart` — src/charts/ComposedChart.tsx
- **F1 (P0):** Same Gridlines defect (line 267, ChartFrame lines 111-118).
- **F2 (P1):** `valueFormat` default is `valueFormat = String` (line 87) where every other chart uses `formatChartNumber`. Docs don't call this out. Classification: default differs from sibling components.
- **F3 (P2):** No `onChange`/`onClick` callback exposed despite mixing bar/line/scatter series — hover is wired to set local state only.

### `OrgChart` — src/charts/OrgChart.tsx
- (none — clean controlled/uncontrolled pattern via `useControllableState` for both `expandedIds` and `zoom`, all 16 props read.)

### `DependencyGraph` — src/charts/DependencyGraph.tsx
- **F1 (P3):** All 15 props wired, but `__tests__/DependencyGraph.test.tsx` does not assert arrow-head rendering when `directed={false}` — path: src/charts/DependencyGraph.tsx:458-461. TEST-COVERAGE-ONLY GAP.

### `NetworkGraph` — src/charts/NetworkGraph.tsx
- **F1 (P1):** `rubberBand` prop (line 132) switches drag behaviour between `sim.alphaTarget(0.3)` and `sim.alphaTarget(0)` (lines 300-306). When `rubberBand=false` and the peer dep `d3-force` isn't resolved yet, `onNodeDown` returns early (line 298) so the drag silently no-ops. Main path works; edge case (mid-load drag) fails silently.
- **F2 (P2):** `coolDownAfter` default 4000 ms is correct but not asserted in `__tests__/NetworkGraph.test.tsx`.

### `HorizonChart` — src/charts/HorizonChart.tsx
- (none — all 14 props consumed; no controlled/uncontrolled state; no callbacks to mis-fire.)

### `ViolinPlot` — src/charts/ViolinPlot.tsx
- **F1 (P3):** `bandwidth === "auto"` branch at line 253 uses Silverman but the explicit-number branch is not exercised by `__tests__/ViolinPlot.test.tsx`. TEST-COVERAGE-ONLY GAP.

### `CalendarHeatmap` — src/charts/CalendarHeatmap.tsx
- **F1 (P1):** `accessibleLabel` default at line 183 (`?? "Calendar heatmap"`) works, but `valueFormat` is passed into the tooltip body only (line 263) and never to the legend labels (lines 244-257) — legend still shows raw `Math.round(maxValue)`. Classification: prop works on main path but not in legend edge path.

### `ChoroplethMap` — src/charts/ChoroplethMap.tsx
- **F1 (P2):** Declared prop `valueFormat` honored in tooltip only. Legend reuses `formatChartNumber(max)` directly (line 245) and ignores the caller's `valueFormat`. Same pattern as CalendarHeatmap F1 but severity P2 because it's strictly a formatting style difference.

### `Heatmap` — src/charts/Heatmap.tsx
- **F1 (P1):** `valueFormat` wired in tooltip (line 197) but legend at line 183 hardcodes `Math.round(max)`. Edge-path inconsistency identical to CalendarHeatmap F1.

### `StreamGraph` — src/charts/StreamGraph.tsx
- (none — all 13 declared props consumed; no controlled state; hover wired; tests present.)

### `BoxPlot` — src/charts/BoxPlot.tsx
- **F1 (P0-adjacent, P1 as-reported):** Same `Gridlines` defect class as bar/line charts — `<Gridlines mode="y" ticks={valueTicks} />` at line 222 reads an unset `yScale` from context. Downgraded to P1 here only because a subtle caveat applies to all chart consumers uniformly; counted once under P0 in the top-level tally via AreaChart. Still, BoxPlot users should be aware.
- **F2 (P2):** `whiskerK` default 1.5 correctly threaded through `computeBoxStats` (line 106); covered by no unit test over edge values.

### `BubbleMap` — src/charts/BubbleMap.tsx
- **F1 (P3):** `color` (default fill) fallback honored at line 224 but `__tests__/BubbleMap.test.tsx` never asserts the default. TEST-COVERAGE-ONLY GAP.

### `ChartFrame` — src/charts/primitives/ChartFrame.tsx
- **F1 (P1):** `useImperativeHandle(ref, …)` at line 89-134 augments `containerRef.current` with `toSVG`/`toPNG` and then the same `ref` is also merged via `useMergedRefs(ref, containerRef)` at line 86. Net effect works (imperative handle is applied after merge), but the pattern is load-bearing for consumers who depend on the DOM ref — any future refactor of the merge order would break consumers who call `ref.current.toPNG()`. Classification: works on main path, fragile on edge.
- **F2 (P2):** `xScale`/`yScale` props accepted and published through context (line 161-162) but **no chart in the `/charts/` bucket actually passes them** — confirmed by a bucket-wide ripgrep. This is the root cause of every other chart's Gridlines/ReferenceLine/ReferenceBand dead-prop finding.

### `DonutChart` — src/charts/PieChart.tsx
- **F1 (P0):** The `DonutChart` wrapper renders `<PieChart ref={ref} innerRatio={props.innerRatio ?? 0.6} {...props} />` at src/charts/PieChart.tsx:199. Spread ordering defeats the default: `{...props}` spreads AFTER `innerRatio={… ?? 0.6}`, so when the caller does not provide `innerRatio`, the explicit `0.6` is OVERWRITTEN by the `innerRatio: undefined` key inside `props`, reverting to PieChart's own default of `0`. Result: DonutChart renders as a Pie (no hole) when caller omits `innerRatio`. The documented "Default 0.6" is dead. Classification: DEAD DEFAULT / DOC-MISMATCH.

### `Histogram` — src/charts/Histogram.tsx
- **F1 (P0):** Same `Gridlines` defect at line 165. `showGrid` is a no-op.

### `PieChart` — src/charts/PieChart.tsx
- **F1 (P2):** `cornerRadius` forwarded to `<Arc cornerRadius={cornerRadius} />` (line 140) but only effective when `padAngle > 0`/outer+inner rings differ; default 0 rendering is fine. Informational only.

### `WaterfallChart` — src/charts/WaterfallChart.tsx
- **F1 (P0-kin):** Same Gridlines defect at line 224. Not re-counted in the top-line tally.

### `ParallelCoordinates` — src/charts/ParallelCoordinates.tsx
- (none — all 11 props read; no Gridlines; no controlled state.)

### `RadarChart` — src/charts/RadarChart.tsx
- **F1 (P1):** `showLegend` only renders when `series.length > 1` (line 257). Caller cannot force the legend on for a single-series radar. Edge-path limitation matches ScatterPlot F2.

### `Sankey` — src/charts/Sankey.tsx
- (none — all 11 props wired; color fallback via palette; tests present.)

### `TreeMap` — src/charts/TreeMap.tsx
- (none — all 11 props wired; `colorForGroup` override respected before palette fallback.)

### `Arc` — src/charts/series/Arc.tsx
- (none — 10/10 props consumed; hover null-event safely synthesized at line 75.)

### `Axis` — src/charts/primitives/Axis.tsx
- **F1 (P1):** `autoRotate` prop declared but only takes effect for X axes (line 104, `shouldRotate = rotate && isX && …`). For `left`/`right` orientations `autoRotate` is a silent no-op. Classification: prop works on main path (X) but not on edge path (Y).
- **F2 (P2):** `hideLine`, `hideTickLines`, `hideLabels` all wired but never exercised in `__tests__/Axis.test.tsx` (quick scan of test file shows default-orientation snapshots only).

### `FunnelChart` — src/charts/FunnelChart.tsx
- (none — 10/10 props wired; `showPercent` gates the secondary text label; hover wired per-step.)

### `Sparkline` — src/charts/Sparkline.tsx
- **F1 (P2):** `showTrend` renders a dashed mean line (line 96-106) but its stroke is hardcoded to `var(--vf-border-2)`, ignoring the passed `stroke` prop. Classification: minor design inconsistency, caller-visible.

### `ChordDiagram` — src/charts/ChordDiagram.tsx
- (none — 9/9 props wired; chord ribbons respect `padAngle` via sub-angle offset.)

### `SmallMultiples` — src/charts/SmallMultiples.tsx
- (none — generic `T` renderer; 9/9 props consumed; facetLabel optional; no callbacks.)

### `Point` — src/charts/series/Point.tsx
- (none — 8/8 props wired; shape branches cover square/circle/diamond/cross.)

### `ScatterMatrix` — src/charts/ScatterMatrix.tsx
- **F1 (P1):** `showAxes=true` only changes tick count from 2→3 on inner ScatterPlot (src/charts/ScatterMatrix.tsx:70-71), not actual axis visibility. Prop name suggests a toggle but behaves as a density knob. Classification: default works, edge semantics mismatch the prop name.

### `Sunburst` — src/charts/Sunburst.tsx
- (none — 8/8 props wired; `padAngle` forwarded to arc generator; labels conditional on `labelMinAngle`.)

### `Area` — src/charts/series/Area.tsx
- **F1 (P3):** No `__tests__/Area.test.tsx` exists. TEST-COVERAGE-ONLY GAP.

### `Bar` — src/charts/series/Bar.tsx
- (none — 6/6 props wired; `radius` and `fillFor` correctly override defaults; tests present.)

### `Brush` — src/charts/primitives/Brush.tsx
- **F1 (P2):** Properly controlled/uncontrolled via `value`/`defaultValue`/`onChange` with `value === undefined` gate. `onChange` fires continuously during drag AND on release; `onChangeEnd` fires only on release. Both behaviours match doc. The `minWidth` gate (line 112) sets selection to `null` when width < minWidth at drag-end — worth documenting as it converts an active selection into a cleared one, which callers may not expect. Classification: undocumented edge behaviour.

### `ReferenceBand` — src/charts/primitives/ReferenceBand.tsx
- **F1 (P0-kin):** Reads `xScale`/`yScale` from `ChartContext` (lines 38-45, 75-79) which **no chart in this bucket populates** (see ChartFrame F2). Consequence: `<ReferenceBand>` as a child of any bucket chart renders `null`. Same root cause as Gridlines defect.

### `ChartTooltip` — src/charts/primitives/ChartTooltip.tsx
- (none — all 5 props wired; active gate is correct; portal positioning via `computeAnchoredPosition`.)

### `Crosshair` — src/charts/primitives/Crosshair.tsx
- (none — 5/5 props wired; early-return guards missing coords.)

### `Line` — src/charts/series/Line.tsx
- **F1 (P3):** No `__tests__/Line.test.tsx` exists for the series primitive. TEST-COVERAGE-ONLY GAP.

### `ReferenceLine` — src/charts/primitives/ReferenceLine.tsx
- **F1 (P0-kin):** Same context-scale dependency as ReferenceBand (lines 39, 70). Without a chart that populates `xScale`/`yScale` on ChartFrame, `<ReferenceLine>` renders `null` silently.

### `ChartLegend` — src/charts/primitives/Legend.tsx
- (none — 4/4 props wired; interactive pattern switches Tag between button/span based on `onToggle`.)

### `ChartTooltipBody` — src/charts/primitives/ChartTooltipBody.tsx
- (none — 3/3 props wired; metrics loop handles color/hint conditionally.)

### `Gridlines` — src/charts/primitives/Gridlines.tsx
- **F1 (P0):** Reads `xScale`/`yScale` from `ChartContext` (lines 27-42). Guard `if (mode !== "y" && xScale)` short-circuits to empty ticks when unset, so no runtime error — but every top-level chart in this bucket fails to provide those scales, so every `<Gridlines>` usage inside a chart renders nothing. This is the single root defect underlying the `showGrid` P0 findings on AreaChart / BarChart / LineChart / ScatterPlot / Candlestick / ComposedChart / Histogram / BoxPlot / WaterfallChart.

### `TileGridMap` — src/charts/TileGridMap.tsx
- **F1 (P3):** `propCount: 0` in `plans/audits/31-component-index.json` is incorrect — the component declares 12 props (cells, values, tileSize, gap, colors, title, description, showLegend, showLabels, accessibleLabel, valueFormat, plus spread). `docs/data/props.json` also shows `props: []` for this component. Classification: PROP-EXTRACTION GAP — `scripts/extract-props.mjs` appears to have misattributed TileGridMap's JSDoc to the exported `US_STATES_GRID` constant instead of the `TileGridMap` component. All 12 props are in fact consumed correctly in the component body (lines 85-104). Classification: AUDIT TOOLING BUG, not a component defect.

## Zero-finding roster

OrgChart, HorizonChart, StreamGraph, ParallelCoordinates, Sankey, TreeMap, Arc, FunnelChart, ChordDiagram, SmallMultiples, Point, Sunburst, Bar, ChartTooltip, Crosshair, ChartLegend, ChartTooltipBody — 17 components are fully wired, tested or test-adjacent, and exhibit no declared-prop liveness, state-transition, or callback-signature issues.

Plus these, which have only P3 test-coverage gaps:

BubbleChart, DependencyGraph, ViolinPlot, BubbleMap, Area, Line — functionally clean; missing/thin tests only.

## Methodology notes

1. **Root defect: un-populated `ChartContext` scales.** Eight top-level charts (AreaChart, BarChart, LineChart, ScatterPlot, CandlestickChart, ComposedChart, Histogram, StreamGraph — plus BoxPlot/WaterfallChart derivatives) call `<ChartFrame>` without passing `xScale`/`yScale`. Any child that consumes them from `useChart()` (Gridlines, ReferenceLine, ReferenceBand) renders nothing silently. I counted each top-level chart's `showGrid`-equivalent regression individually as P0 but listed the underlying Gridlines defect once to avoid double-counting remediation work. The true root cause lives at the ChartFrame integration boundary.

2. **Alias components.** BubbleChart (ScatterPlot alias), OHLCChart (CandlestickChart alias), DonutChart (PieChart wrapper). Each inherits parent defects plus at most one wrapper-specific finding (DonutChart's spread-order default regression is genuine and P0).

3. **ChartFrame's dual-ref pattern.** `useImperativeHandle(ref, …)` is called against the same ref that `useMergedRefs` writes to. The net effect works because React calls `useImperativeHandle` after committing the DOM ref, but the pattern is fragile and was classified P1 rather than ignored.

4. **`propCount: 0` anomaly.** TileGridMap shows `propCount: 0` in the component index; the source file declares 12 props. This is a prop-extractor regression in `scripts/extract-props.mjs` that attributed TileGridMap's TSDoc to a sibling exported constant. Audit was done from the actual source, not the index.

5. **`autoRotate` on Y axes.** Axis's `autoRotate` prop is silently ignored for left/right orientations. Noted as P1 rather than P0 because rotation on Y axes would be cosmetic and no existing caller relies on it.

6. **Render-prop pattern.** OrgChart's `renderNode` and SmallMultiples' `renderItem` props evade ordinary prop-to-code grep but were verified as consumed in the component body.

7. **Untested-but-working.** Several defaults (BarChart `showStroke`, BubbleMap `color`, NetworkGraph `coolDownAfter`, ViolinPlot numeric `bandwidth`, DependencyGraph `directed=false`) execute correctly but aren't asserted by existing tests. Classified P2/P3 per the rubric.

8. **Counts.** Top-line severity counts are per-finding: P0 = 5 (AreaChart, BarChart, LineChart, ScatterPlot, DonutChart — covering the Gridlines defect + the DonutChart default regression; other charts share the same Gridlines root). If each affected top-level chart were individually tallied at P0, the P0 count would rise to ~10.
