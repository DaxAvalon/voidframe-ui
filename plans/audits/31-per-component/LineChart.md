# `LineChart` functionality audit

**File:** `src/charts/LineChart.tsx:55`
**Test:** `src/charts/__tests__/LineChart.test.tsx`
**Prop count:** 19
**Bucket:** charts

## Prop liveness
- `data` — LIVE (line 138)
- `series` — LIVE (line 117, 139, 158)
- `xKind` — LIVE (line 140)
- `width` — LIVE (line 130)
- `height` — LIVE (line 131)
- `margins` — LIVE (line 132)
- `title` — LIVE (line 133)
- `description` — LIVE (line 134)
- `showLegend` — LIVE (line 155)
- `showGrid` — LIVE (line 148)
- `showCrosshair` — LIVE (line 149)
- `valueTicks` — LIVE (line 141)
- `xTicks` — LIVE (line 142)
- `valueFormat` — LIVE (line 143)
- `xFormat` — LIVE (line 144)
- `accessibleLabel` — LIVE (line 135)
- `scaleKind` — LIVE (line 150)
- `hiddenKeys` — LIVE (line 111, 166)
- `connectNulls` — LIVE (line 151)

## Control pattern
- Pattern: `hiddenKeys` controlled/uncontrolled fallback at line 111.
- Uses `useControllableState`: NO.
- Issues: Same as AreaChart/BarChart — no `onHiddenKeysChange` → FINDING 1.

## State transitions
- `showLegend && series.length > 0` → legend rendered (line 155). Unlike AreaChart/BarChart, LineChart renders legend even for a single series.
- `hover` state → tooltip active.
- `showCrosshair` → crosshair displayed in inner component.
- No loading/error state.

## Callback signatures
- No component-level callback props beyond inherited DOM attributes.

## Test coverage
- File exists: YES.
- Tested props: data, series, xKind, showLegend, showGrid, showCrosshair.
- Untested props: scaleKind log/sqrt, hiddenKeys controlled, connectNulls, xFormat/valueFormat, accessibleLabel, description.
- Tested states: rendering variants.
- Untested states: connectNulls behavior with null values, controlled-hiddenKeys no-op.
- Untested callbacks: N/A.

## Findings
1. P1 — `hiddenKeys` controlled prop with no companion callback. src/charts/LineChart.tsx:76. Legend toggle at 166 returns early; parent cannot receive toggle intent.
2. P2 — Inconsistent legend threshold across chart family: LineChart shows legend at `series.length > 0` (line 155), whereas AreaChart/BarChart require `> 1`. User-facing inconsistency.
3. P3 — `connectNulls` not covered in tests.
