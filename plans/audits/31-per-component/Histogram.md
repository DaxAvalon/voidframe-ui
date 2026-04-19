# `Histogram` functionality audit

**File:** `src/charts/Histogram.tsx:43`
**Test:** `src/charts/__tests__/Histogram.test.tsx`
**Prop count:** 12
**Bucket:** charts

## Prop liveness
- `values` — LIVE (86, 134, 153)
- `bins` — LIVE (87, 152)
- `width` — LIVE (78)
- `height` — LIVE (79)
- `margins` — LIVE (80)
- `title` — LIVE (81)
- `description` — LIVE (82)
- `showGrid` — LIVE (91, 165)
- `color` — LIVE (63, 90)
- `accessibleLabel` — LIVE (83)
- `xTicks` — LIVE (88, 166)
- `yTicks` — LIVE (89, 165, 167)

## Control pattern
- Pattern: Uncontrolled hover via `useState` (64)
- Uses `useControllableState`: NO
- Issues: none (display-only)

## State transitions
- `values=[]` → extent falls back to `[0,1]` via Infinity check ✓ (138)
- All same values → `hi = lo + 1` ✓ (139)
- `maxCount=0` (no bins) → `Math.max(1, ...)` ensures non-zero y-domain ✓ (156)
- Hover → lo/hi/count captured ✓ (185-195)

## Callback signatures
- No external change/select callbacks (display-only)

## Test coverage
- File exists: YES, ~6 tests
- Tested props: `values`, `bins`, `width`, `height`, `className`, default accessible label
- Untested props: `margins`, `title`, `description`, `showGrid`, `color`, `accessibleLabel` (custom), `xTicks`, `yTicks`

## Findings
1. P2 — `xScale` is not memoized at `src/charts/Histogram.tsx:143-147`. It is used as a dependency of the `binned` memo (154), so `binned` is recomputed on every render. `xScale` should be wrapped in `useMemo` keyed to `[extent, innerWidth]`.
2. P2 — `yScale` not memoized at `src/charts/Histogram.tsx:157-161`. Minor.
3. P2 — Tooltip upper-bound notation `[lo, hi)` at `src/charts/Histogram.tsx:98` is half-open, matching d3 convention, but the last bin is inclusive of hi in d3-bin — notation is misleading for the final bin.
4. P2 — `resolvedColor = color ?? seriesPalette(1)[0]!` at `src/charts/Histogram.tsx:63` runs on every render (no memo). `seriesPalette` might be a single-line constant but this creates a new array every render.
5. P3 — `margins`, `title`, `description`, `showGrid`, `color`, custom `accessibleLabel`, `xTicks`, `yTicks` untested at `src/charts/__tests__/Histogram.test.tsx`.
