# `PieChart` functionality audit

**File:** `src/charts/PieChart.tsx:194`
**Test:** `src/charts/__tests__/PieChart.test.tsx`
**Prop count:** 12
**Bucket:** charts

## Prop liveness
- `data` — LIVE (82, 90, 94-96, 135, 159, 176)
- `innerRatio` — LIVE (99)
- `padAngle` — LIVE (88)
- `cornerRadius` — LIVE (139)
- `startAngle` — LIVE (86-87)
- `endAngle` — LIVE (87)
- `size` — LIVE (80, 98, 111, 126-128)
- `title` — LIVE (114-116)
- `description` — LIVE (117-119)
- `showLegend` — LIVE (156)
- `accessibleLabel` — LIVE (125)
- `valueFormat` — LIVE (174)

## Control pattern
- Pattern: Uncontrolled hover via `useState`; responsive size via measured element
- Uses `useControllableState`: NO
- Issues: none (display-only)

## State transitions
- `total=0` (all zeros) → `pieData` contains zero-angle slices; tooltip omits `% of total` hint ✓ (181-184)
- `endAngle` omitted → defaults to `startAngle + 2π` (full pie) ✓ (87)
- `endAngle` set → partial pie ✓ (87)
- `sizeProp` omitted → fallback chain `measured.width ?? 280` — but chained `??` yields `measured.width` when measured width is 0 because 0 is truthy for `??` (only nullish short-circuits). So a measured width of 0 will be used. (FINDING 1)
- Hover → `onArcHover` with index maps back to `data[i]` ✓ (143-153)

## Callback signatures
- `valueFormat(v: number) => string` — verified (174)

## Test coverage
- File exists: YES, ~12+ tests (shared with DonutChart)
- Tested props: `data`, `size`, `innerRatio` (via DonutChart), `showLegend`, `title`, `description`, `accessibleLabel`, `padAngle`, `cornerRadius`, `endAngle`, `valueFormat`, `className`, `ref`
- Untested props: `startAngle` (explicit override)

## Findings
1. P1 — Size fallback treats measured width 0 as valid at `src/charts/PieChart.tsx:80`. `sizeProp ?? measured.width ?? 280` — if `measured.width === 0`, `??` does NOT fall through (0 is not nullish). Result: chart renders with size 0 until measured. Should use `sizeProp ?? (measured.width || 280)`.
2. P1 — `data` reference-dep memoization at `src/charts/PieChart.tsx:91, 96`. Parents passing fresh arrays rebuild pieData/colors every render.
3. P2 — Redundant `findIndex` calls in tooltip at `src/charts/PieChart.tsx:176-179`. `findIndex` runs twice for the same key on every hover render. Compute once.
4. P2 — `innerRatio > 1` not guarded at `src/charts/PieChart.tsx:99`. Negative or >1 values produce degenerate arcs silently.
5. P3 — `startAngle` override untested (only default exercised) at `src/charts/__tests__/PieChart.test.tsx`.
