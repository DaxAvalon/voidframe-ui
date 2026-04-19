# `ViolinPlot` functionality audit

**File:** `src/charts/ViolinPlot.tsx:31`
**Test:** `src/charts/__tests__/ViolinPlot.test.tsx`
**Prop count:** 14
**Bucket:** charts

## Prop liveness

- `groups` — LIVE (line 118, 172)
- `width` — LIVE (line 110)
- `height` — LIVE (line 111)
- `margins` — LIVE (line 112)
- `title` — LIVE (line 113)
- `description` — LIVE (line 114)
- `valueTicks` — LIVE (line 122, 214)
- `valueFormat` — LIVE (line 123, 215)
- `accessibleLabel` — LIVE (line 115)
- `padding` — LIVE (line 124, 174)
- `resolution` — LIVE (line 119, 255)
- `bandwidth` — LIVE (line 120, 253)
- `minSampleForKde` — LIVE (line 121, 221)
- `showGrid` — LIVE (line 125, 203)

## Control pattern

- Pattern: stateless (hover tooltip only).
- Uses `useControllableState`: N/A.
- Issues: none.

## State transitions

- `g.values.length < minSampleForKde` → fallback box rendering (line 221).
- `bandwidth === "auto"` → Silverman's rule applied (line 253).
- Hover state → tooltip.

## Callback signatures

- No callback props.

## Test coverage

- File exists: YES.
- Tested props: groups, resolution, bandwidth.
- Untested props: minSampleForKde fallback threshold, padding, valueFormat, accessibleLabel.
- Tested states: KDE rendering, fallback rendering.
- Untested states: empty values group, `bandwidth=0` edge.
- Untested callbacks: N/A.

## Findings

1. P2 — `silvermanBandwidth` at line 58 uses `|| 1` to guard against zero; if all values are equal, sd=0 → h=1 by fallback. KDE with h=1 may still produce a degenerate violin.
2. P2 — `kde()` at line 66 divides by `n * h` — if h = 0 (can happen if `bandwidth={0}` passed explicitly), produces Infinity. No guard.
3. P2 — `band` created outside useMemo (line 171) — re-created every render.
4. P3 — No callback for hover/click exposed outward.
5. P3 — `resolution=1` would produce `k/(resolution-1)` = `0/0` = NaN at line 256. No guard for resolution < 2.
