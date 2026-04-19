# `WaterfallChart` functionality audit

**File:** `src/charts/WaterfallChart.tsx:57`
**Test:** `src/charts/__tests__/WaterfallChart.test.tsx`
**Prop count:** 12
**Bucket:** charts

## Prop liveness
- `steps` — LIVE (83, 110, 212, 239)
- `width` — LIVE (134)
- `height` — LIVE (135)
- `margins` — LIVE (136)
- `title` — LIVE (137)
- `description` — LIVE (138)
- `valueFormat` — LIVE (147, 161, 168, 176, 236)
- `accessibleLabel` — LIVE (139)
- `colors` — LIVE (144, 162, 171-172, 248-251)
- `showGrid` — LIVE (145, 224)
- `valueTicks` — LIVE (146, 224, 235)
- `padding` — LIVE (148, 214)

## Control pattern
- Pattern: Uncontrolled hover via `useState` (125)
- Uses `useControllableState`: NO
- Issues: none

## State transitions
- `"total"` step → magnitude = current cumulative, start=0, end=cumulative ✓ (84-95)
- `value >= 0` → kind=increase ✓ (102)
- `value < 0` → kind=decrease ✓
- Empty steps → extent `[0, 1]` via `lo===hi` fallback ✓ (121)
- Connector lines skip when next step is total at 264 ✓
- Total step does NOT mutate cumulative (86 reads but 97-98 only updated in non-total branch) ✓ — correct: subtotals don't advance the running sum
- BUT: a `"total"` step resets `start=0, end=cumulative`, meaning the rendered bar spans from the baseline to cumulative. If a later delta occurs the running cumulative continues from previous cumulative (total didn't modify it). Correct behavior.

## Callback signatures
- `valueFormat(v: number) => string` — verified (147, 236, 161, 168, 176)

## Test coverage
- File exists: YES, ~6 tests
- Tested props: `steps`, `width`, `height`, `showGrid`
- Untested props: `margins`, `title`, `description`, `valueFormat`, `accessibleLabel`, `colors`, `valueTicks`, `padding`

## Findings
1. P2 — `"total"` step position when `cumulative <= 0` at `src/charts/WaterfallChart.tsx:84-95`. If running sum is negative, total bar ranges from 0 to a negative value; `extent[0] < 0` handled (116-117) but the bar color is `colors[2]` regardless of direction — a "subtotal pillar" pointing down looks visually similar to a decrease. Consider tinting total bars based on sign.
2. P2 — `extent` always includes 0 at `src/charts/WaterfallChart.tsx:112-114`. `lo=0, hi=0` init guarantees axis crosses zero; intentional for waterfall semantics but undocumented.
3. P2 — `band.bandwidth()` + `y` scale not memoized at `src/charts/WaterfallChart.tsx:211-221`. Recomputed on every render inside WaterfallInner.
4. P2 — Connector line can overlap bar edges when `padding` is very small at `src/charts/WaterfallChart.tsx:262-278`. No min-gap guard.
5. P3 — Most props untested at `src/charts/__tests__/WaterfallChart.test.tsx`: `margins`, `title`, `description`, `valueFormat`, `accessibleLabel`, `colors`, `valueTicks`, `padding`.
