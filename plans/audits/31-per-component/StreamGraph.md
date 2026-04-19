# `StreamGraph` functionality audit

**File:** `src/charts/StreamGraph.tsx:64`
**Test:** `src/charts/__tests__/StreamGraph.test.tsx`
**Prop count:** 13
**Bucket:** charts

## Prop liveness
- `data` — LIVE (used at 109, 231)
- `series` — LIVE (used at 86-87, 110, 120, 144, 231)
- `xKind` — LIVE (used at 111, 190, 198, 212, 216)
- `curve` — LIVE (used at 112, 265)
- `width` — LIVE (used at 101)
- `height` — LIVE (used at 102)
- `margins` — LIVE (used at 103)
- `title` — LIVE (used at 104)
- `description` — LIVE (used at 105)
- `showLegend` — LIVE (used at 117)
- `accessibleLabel` — LIVE (used at 106)
- `valueFormat` — LIVE (used at 149)
- `xFormat` — LIVE (used at 136-137)

## Control pattern
- Pattern: Uncontrolled hover via `useState` (line 89)
- Uses `useControllableState`: NO
- Issues: none — hover is presentation-only

## State transitions
- Empty `data` → `innerWidth` scale domain `[Infinity, -Infinity]` for linear; stack produces empty → `yMin=-1, yMax=1` fallback ✓ (243)
- `xKind="time"` → dates parsed (191-193) ✓
- `xKind="category"` → pointScale; `xAt` falls back to 0 for unknown keys (217) ✓
- `xKind="linear"` (default) → numeric cast (204) ✓
- Hover pointer move on overlay rect → `bisectNearest` finds closest datum → `onHover(...)` fires ✓ (277-291)
- Hover pointer leave → `onHover(null)` ✓ (292)
- Non-finite series values (NaN, null) → filtered from tooltip metrics (146) ✓

## Callback signatures
- `valueFormat(v: number) => string` — verified (149)
- `xFormat(v: number | Date | string) => string` — verified (137); when absent, falls back to `toDateString()` for Date or `String(x)` — note this stringifies a Date to ISO-ish only via `toDateString` which drops time (possible P2)

## Test coverage
- File exists: YES, 10+ tests covering basic render, legend toggle, category/time xKind, xFormat, valueFormat, curve
- Tested props: `data`, `series`, `xKind`, `curve`, `showLegend`, `valueFormat`, `xFormat`
- Untested props: `width`, `height`, `margins`, `title`, `description`, `accessibleLabel`

## Findings
1. P2 — Default x tooltip loses time-of-day at `src/charts/StreamGraph.tsx:139`. When `xFormat` is not passed and `x` is a Date, tooltip uses `toDateString()` which truncates hours/minutes. For time-series with intra-day resolution this is silently lossy.
2. P2 — `xValuesRaw` derived every render without memoization at `src/charts/StreamGraph.tsx:187`. It is a dependency of the xScale memo (209), which defeats the memo because a fresh array is passed each render. Recompute happens always when data changes even with identity guards.
3. P2 — `y` scale built every render (no `useMemo`) at `src/charts/StreamGraph.tsx:247`. Minor perf gap in a file that memoizes adjacent computations.
4. P3 — `margins`, `title`, `description`, `width`, `height`, `accessibleLabel` props untested at `src/charts/__tests__/StreamGraph.test.tsx`. All LIVE but uncovered.
