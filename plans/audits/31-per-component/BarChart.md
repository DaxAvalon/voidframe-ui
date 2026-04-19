# `BarChart` functionality audit

**File:** `src/charts/BarChart.tsx:55`
**Test:** `src/charts/__tests__/BarChart.test.tsx`
**Prop count:** 19
**Bucket:** charts

## Prop liveness
- `data` — LIVE (line 142)
- `series` — LIVE (line 118, 143, 162)
- `orientation` — LIVE (line 144)
- `mode` — LIVE (line 145)
- `width` — LIVE (line 134)
- `height` — LIVE (line 135)
- `margins` — LIVE (line 136)
- `padding` — LIVE (line 146)
- `innerPadding` — LIVE (line 147)
- `title` — LIVE (line 137)
- `description` — LIVE (line 138)
- `showLegend` — LIVE (line 159)
- `showGrid` — LIVE (line 153)
- `valueTicks` — LIVE (line 148)
- `valueFormat` — LIVE (line 149)
- `accessibleLabel` — LIVE (line 139)
- `scaleKind` — LIVE (line 154)
- `hiddenKeys` — LIVE (line 123, 171)
- `onBarClick` — LIVE (line 156)

## Control pattern
- Pattern: `hiddenKeys` controlled/uncontrolled fallback via `hiddenKeysProp ?? hiddenKeysInternal` at line 123.
- Uses `useControllableState`: NO — hand-rolled.
- Issues: Same as AreaChart — no `onHiddenKeysChange` callback when controlled → FINDING 1.

## State transitions
- `showLegend && series.length > 1` → legend shown (line 159), suppressed for single-series.
- `hover` state → tooltip active.
- `hiddenKeys` controlled → legend `onToggle` no-ops (line 171).
- No loading/error state.

## Callback signatures
- `onBarClick({datum, seriesKey, value})` — verified via prop drilling at line 156.

## Test coverage
- File exists: YES.
- Tested props: data, series, orientation, mode, showLegend.
- Untested props: scaleKind log/sqrt, hiddenKeys controlled, innerPadding, valueFormat, accessibleLabel.
- Tested states: grouped/stacked rendering.
- Untested states: controlled-hiddenKeys no-op.
- Untested callbacks: `onBarClick` end-to-end.

## Findings
1. P1 — `hiddenKeys` accepted as controlled prop with no `onHiddenKeysChange` callback. src/charts/BarChart.tsx:80. Legend toggle at 171 returns early; parent cannot receive intent.
2. P2 — `logScale` with data domain likely containing 0 (same issue as AreaChart). Bars naturally start at 0 but `scaleKind="log"` combined with non-positive values is undefined.
3. P3 — `onBarClick` not covered in test suite.
