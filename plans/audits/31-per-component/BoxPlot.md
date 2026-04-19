# `BoxPlot` functionality audit

**File:** `src/charts/BoxPlot.tsx:80`
**Test:** `src/charts/__tests__/BoxPlot.test.tsx`
**Prop count:** 12
**Bucket:** charts

## Prop liveness
- `groups` — LIVE (102, 192)
- `width` — LIVE (122)
- `height` — LIVE (123)
- `margins` — LIVE (124)
- `title` — LIVE (125)
- `description` — LIVE (126)
- `valueTicks` — LIVE (131, 222, 233)
- `valueFormat` — LIVE (132, 143-147)
- `accessibleLabel` — LIVE (127)
- `padding` — LIVE (133, 194)
- `showGrid` — LIVE (134, 222)
- `whiskerK` — LIVE (104)

## Control pattern
- Pattern: Uncontrolled hover via `useState` (108)
- Uses `useControllableState`: NO
- Issues: none (display-only chart)

## State transitions
- `groups=[]` → `stats=[]`, `yExtent` falls back to `[0,1]` ✓ (196-210)
- All values identical in a group → `lo === hi` → `hi = lo + 1` to avoid zero-height axis ✓ (208)
- Missing quantile (empty values) → `quantileSorted` returns undefined → fallback 0 ✓ (62-64)
- Hover on a group `<g>` → tooltip active with stats ✓ (245-253)
- `showGrid=false` → gridlines omitted ✓ (222)
- `outliers=[]` → no outlier row in tooltip ✓ (148-155)

## Callback signatures
- `valueFormat(v: number) => string` — verified (132, 143-147)
- No change/select callbacks — chart is display-only

## Test coverage
- File exists: YES, ~10 tests + `computeBoxStats` tests
- Tested props: `groups`, `width`, `height`, `showGrid`, `whiskerK`, `padding`, `valueFormat`
- Untested props: `margins`, `title`, `description`, `valueTicks`, `accessibleLabel`

## Findings
1. P2 — `computeBoxStats` treats empty `values` silently at `src/charts/BoxPlot.tsx:57-78`. All quantiles fall back to 0; `min/max` also fall to q1/q3=0. Result: a "zero box" renders for a group with no data, with no indication of missingness. Consider skipping empty groups or a visible "no data" state.
2. P2 — Outlier markers centered at band midpoint can overlap at `src/charts/BoxPlot.tsx:302-312`. No jitter; identical outlier values stack as a single circle. Tooltip counts but UI under-reports density.
3. P2 — `midOffset` computed once outside the map loop at `src/charts/BoxPlot.tsx:217-218`. Fine, but then `bandwidth()` is called on every render (not memoized). Minor.
4. P3 — `margins`, `title`, `description`, `valueTicks`, `accessibleLabel` props untested at `src/charts/__tests__/BoxPlot.test.tsx`.
