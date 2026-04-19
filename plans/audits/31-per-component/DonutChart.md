# `DonutChart` functionality audit

**File:** `src/charts/PieChart.tsx:197`
**Test:** `src/charts/__tests__/PieChart.test.tsx`
**Prop count:** 12 (same PieChartProps shape)
**Bucket:** charts

## Prop liveness
- `data` — LIVE (passed via spread at 199)
- `innerRatio` — LIVE (199; defaults to 0.6 when caller does not supply)
- `padAngle` — LIVE (spread)
- `cornerRadius` — LIVE (spread)
- `startAngle` — LIVE (spread)
- `endAngle` — LIVE (spread)
- `size` — LIVE (spread)
- `title` — LIVE (spread)
- `description` — LIVE (spread)
- `showLegend` — LIVE (spread)
- `accessibleLabel` — LIVE (spread)
- `valueFormat` — LIVE (spread)

## Control pattern
- Pattern: Thin wrapper around PieChart forcing `innerRatio` default to 0.6
- Uses `useControllableState`: NO (inherits stateless PieChart)
- Issues:
  - Prop ordering at `src/charts/PieChart.tsx:199` is buggy: `<PieChart innerRatio={props.innerRatio ?? 0.6} {...props} />`. The spread AFTER the explicit prop means the caller's `props.innerRatio` — even when undefined — overrides the 0.6 default because `innerRatio: undefined` is a valid object-literal key. (FINDING 1)

## State transitions
- Caller omits `innerRatio` → `props.innerRatio === undefined` → `innerRatio: undefined` in spread overrides the `0.6` → PieChart's own default of 0 wins. This defeats the whole point of DonutChart. (FINDING 1)
- Caller passes `innerRatio={0.8}` → spread wins, renders with 0.8 ✓
- All other behaviors inherited from PieChart

## Callback signatures
- `valueFormat(v: number) => string` — inherited (174 in PieChart)

## Test coverage
- File exists: YES, shared with PieChart
- Tested: one test `"DonutChart defaults to innerRatio=0.6"` at line 19-25 renders DonutChart without innerRatio — if FINDING 1 is real, this test should fail... unless `renderWithTheme` or the visual check is loose enough to pass with 0. Worth verifying.
- Untested props: `padAngle`, `cornerRadius`, `startAngle`, `endAngle`, `title`, `description`, `valueFormat` (for DonutChart specifically)

## Findings
1. P0 — `innerRatio` default is NOT applied for DonutChart at `src/charts/PieChart.tsx:199`. Line reads `<PieChart ref={ref} innerRatio={props.innerRatio ?? 0.6} {...props} />`. Because `{...props}` is spread AFTER `innerRatio`, it overwrites the explicit prop — and if the caller doesn't pass `innerRatio`, the spread still contributes `innerRatio: undefined` which overrides the `0.6` assignment. Net effect: DonutChart renders as a flat pie (innerRatio=0) when caller omits the prop. Fix: reverse the order → `<PieChart ref={ref} {...props} innerRatio={props.innerRatio ?? 0.6} />`.
2. P1 — Test at `src/charts/__tests__/PieChart.test.tsx:19-25` claiming "DonutChart defaults to innerRatio=0.6" likely gives false confidence. If the test asserts on DOM class `vf-chart-pie` or a generic path, it may pass even with innerRatio=0. Validate the assertion actually checks the inner radius value.
3. P3 — `padAngle`, `cornerRadius`, `startAngle`, `endAngle`, `title`, `description`, `valueFormat` — explicit DonutChart coverage absent (relies on PieChart tests).
