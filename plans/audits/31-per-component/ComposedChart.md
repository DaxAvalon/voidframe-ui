# `ComposedChart` functionality audit

**File:** `src/charts/ComposedChart.tsx:51`
**Test:** `src/charts/__tests__/ComposedChart.test.tsx`
**Prop count:** 16
**Bucket:** charts

## Prop liveness
- `data` — LIVE (line 120, 247)
- `series` — LIVE (line 121, 97, 136)
- `xKind` — LIVE (line 122)
- `width` — LIVE (line 112)
- `height` — LIVE (line 113)
- `margins` — LIVE (line 114)
- `title` — LIVE (line 115)
- `description` — LIVE (line 116)
- `showLegend` — LIVE (line 133)
- `showGrid` — LIVE (line 128, 267)
- `valueTicks` — LIVE (line 123)
- `xTicks` — LIVE (line 124)
- `valueFormat` — LIVE (line 125, 158, 278)
- `xFormat` — LIVE (line 126, 150, 272)
- `accessibleLabel` — LIVE (line 117)
- `padding` — LIVE (line 129, 213)

## Control pattern
- Pattern: stateless aside from hover.
- Uses `useControllableState`: N/A.
- Issues: no `hiddenKeys`/`onHiddenKeysChange` — inconsistent with AreaChart/BarChart/LineChart family.

## State transitions
- `hasBars` → forces bandScale on x regardless of xKind (line 209).
- `showLegend` → always-on for this chart (no length gate), unlike siblings.
- Hover state → tooltip.
- No loading/error.

## Callback signatures
- No component-level callback props. Bar hover fires internal `onBarHover` → onHover → tooltip.

## Test coverage
- File exists: YES.
- Tested props: data, series types (bar/line/area/scatter mix).
- Untested props: xFormat/valueFormat, padding variants, accessibleLabel.
- Tested states: multi-type rendering.
- Untested states: xKind="time" with bars (override behavior at line 209).
- Untested callbacks: N/A.

## Findings
1. P1 — Non-bar series hover is NOT wired: line/area/scatter branches at lines 322/341/354 do not attach hover handlers. Tooltip only fires for bar series (line 299). Inconsistent with sibling charts that drive hover from the whole inner `<rect>`. src/charts/ComposedChart.tsx:315.
2. P2 — `valueFormat = String` default at line 87 is inconsistent with sibling charts (`formatChartNumber`). Numbers render as raw strings like "1234.56789" by default.
3. P2 — `hasBars` silently overrides `xKind` to band (line 209). If caller sets `xKind="time"` with a mix containing bars, the time axis is discarded — behavior is undocumented.
4. P2 — `yScale` not memoized (line 259).
5. P2 — No `hiddenKeys` support; inconsistent with sibling chart family.
6. P3 — `xValuesRaw` recomputed every render outside memo (line 206), breaking xScale memoization.
