# `CalendarHeatmap` functionality audit

**File:** `src/charts/CalendarHeatmap.tsx:29`
**Test:** `src/charts/__tests__/CalendarHeatmap.test.tsx`
**Prop count:** 13
**Bucket:** charts

## Prop liveness

- `start` — LIVE (line 114)
- `end` — LIVE (line 115)
- `data` — LIVE (line 96, 102)
- `colors` — LIVE (line 107)
- `cellSize` — LIVE (used in rendering below)
- `cellGap` — LIVE (used in rendering below)
- `title` — LIVE (header path)
- `description` — LIVE (header path)
- `showDayLabels` — LIVE (rendering condition)
- `showMonthLabels` — LIVE (rendering condition)
- `valueFormat` — LIVE (tooltip)
- `accessibleLabel` — LIVE (svg aria-label)
- `showLegend` — LIVE (legend render)

## Control pattern

- Pattern: stateless (hover tooltip only).
- Uses `useControllableState`: N/A.
- Issues: none.

## State transitions

- Hover state → tooltip.
- No loading/error.

## Callback signatures

- No callback props.

## Test coverage

- File exists: YES.
- Tested props: start, end, data, colors.
- Untested props: cellSize/cellGap custom, showDayLabels=false, showMonthLabels=false, valueFormat.
- Tested states: rendering.
- Untested states: empty data (maxValue=1 fallback).
- Untested callbacks: N/A.

## Findings

1. P2 — `firstSunday = addDays(s, -s.getDay())` at line 117 hard-codes Sunday as week-start; no `firstDayOfWeek` prop (inconsistent with sibling Calendar.tsx which supports it).
2. P2 — `maxValue || 1` fallback at line 103 — if all values are 0, scale domain is [0, 1] and all cells hit the first color bucket. No visible differentiation.
3. P2 — `mergedRef` hand-rolled at line 86; `useMergedRefs` exists.
4. P3 — `WEEKDAY_LABELS` at line 57 is hardcoded English ("Mon", "Wed", "Fri") — not localizable.
5. P3 — `MONTHS` hardcoded English at line 58 — no locale support.
