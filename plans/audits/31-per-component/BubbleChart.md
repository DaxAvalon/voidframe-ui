# `BubbleChart` functionality audit

**File:** `src/charts/ScatterPlot.tsx:174`
**Test:** `src/charts/__tests__/ScatterPlot.test.tsx` (shared)
**Prop count:** 17
**Bucket:** charts

## Prop liveness
BubbleChart is an alias: `export const BubbleChart = ScatterPlot` (line 174), with `displayName = "BubbleChart"` reassigned at line 175. All prop liveness is identical to ScatterPlot:
- `data` — LIVE
- `series` — LIVE
- `width` — LIVE
- `height` — LIVE
- `margins` — LIVE
- `sizeRange` — LIVE
- `title` — LIVE
- `description` — LIVE
- `showLegend` — LIVE
- `showGrid` — LIVE
- `xTicks` — LIVE
- `yTicks` — LIVE
- `xFormat` — LIVE
- `yFormat` — LIVE
- `accessibleLabel` — LIVE
- `shape` — LIVE
- `scaleKind` — LIVE

## Control pattern
- Pattern: alias — identical to ScatterPlot.
- Uses `useControllableState`: N/A.
- Issues: Not a real component; the `displayName` is forced on the exact same function reference as ScatterPlot → React.memo / devtools will treat them identically. Any logger keyed off `.displayName` sees whichever was assigned last (`BubbleChart`).

## State transitions
- Identical to ScatterPlot.

## Callback signatures
- Identical to ScatterPlot — none.

## Test coverage
- File exists: SHARED with ScatterPlot (no dedicated BubbleChart.test.tsx in `src/charts/__tests__/`).
- Tested props: inherited via ScatterPlot tests.
- Untested props: most size-focused variants (no explicit BubbleChart test).
- Tested states: via ScatterPlot.
- Untested states: BubbleChart as a distinct displayName.
- Untested callbacks: N/A.

## Findings
1. P1 — `displayName` mutation at src/charts/ScatterPlot.tsx:175 reassigns the ScatterPlot function's displayName. Because both exports point to the SAME function instance, whichever was loaded last wins — in this module, BubbleChart is set last, so ScatterPlot's devtools name becomes "BubbleChart". `ScatterPlot.displayName = "ScatterPlot"` at line 171 is OVERWRITTEN by line 175.
2. P2 — No BubbleChart-specific test file — documented as a bubble chart but its distinctive behavior (size-driven radius) is only tested implicitly via ScatterPlot.
3. P2 — BubbleChart users get ScatterPlotProps verbatim; no narrowing to require `sizeRange` or a `size`-carrying datum.
