# `ScatterPlot` functionality audit

**File:** `src/charts/ScatterPlot.tsx:43`
**Test:** `src/charts/__tests__/ScatterPlot.test.tsx`
**Prop count:** 17
**Bucket:** charts

## Prop liveness
- `data` — LIVE (line 116)
- `series` — LIVE (line 93, 117)
- `width` — LIVE (line 108)
- `height` — LIVE (line 109)
- `margins` — LIVE (line 110)
- `sizeRange` — LIVE (line 119, 253)
- `title` — LIVE (line 111)
- `description` — LIVE (line 112)
- `showLegend` — LIVE (line 130)
- `showGrid` — LIVE (line 124)
- `xTicks` — LIVE (line 120)
- `yTicks` — LIVE (line 121)
- `xFormat` — LIVE (line 122, 147)
- `yFormat` — LIVE (line 123, 148)
- `accessibleLabel` — LIVE (line 113)
- `shape` — LIVE (line 125, 288)
- `scaleKind` — LIVE (line 126, 248)

## Control pattern
- Pattern: stateless (apart from tooltip hover state).
- Uses `useControllableState`: N/A.
- Issues: none.

## State transitions
- `showLegend && resolvedSeries.length > 1` → legend rendered (line 130), suppressed for single-series.
- `hover` → tooltip active.
- No loading/error.

## Callback signatures
- No component-level callback props. Inherited `onClick` DOM attr is NOT in Omit so is passed through.

## Test coverage
- File exists: YES.
- Tested props: data, series, sizeRange, showLegend, showGrid.
- Untested props: scaleKind log/sqrt, shape variants, xFormat/yFormat, accessibleLabel.
- Tested states: single/multi series, bubble (size) rendering.
- Untested states: legend suppression single-series.
- Untested callbacks: N/A.

## Findings
1. P2 — No `onPointClick` / `onPointHover` exposed externally. Internal onHover drives the tooltip but parent cannot receive hover/click intent. src/charts/ScatterPlot.tsx:43.
2. P2 — Missing legend toggle support compared to sibling charts (AreaChart/BarChart/LineChart expose `hiddenKeys`). Inconsistent API across chart family.
3. P3 — `sScale` computed outside useMemo (line 253). Object re-created every render.
4. P3 — `scaleKind` named "Y-axis" in docs (line 64) but the prop is read-only applied to y; x is forever linear. Docs accurate but API could use explicit `xScaleKind`/`yScaleKind`.
