# `BubbleMap` functionality audit

**File:** `src/charts/BubbleMap.tsx:57`
**Test:** `src/charts/__tests__/BubbleMap.test.tsx`
**Prop count:** 12
**Bucket:** charts

## Prop liveness
- `topology` — LIVE (120, effect dep)
- `objectKey` — LIVE (122, effect dep)
- `points` — LIVE (133, 146 effect dep, 151 sizeExtent)
- `width` — LIVE (86, 176, 188, 203)
- `height` — LIVE (126, 204)
- `projection` — LIVE (109, 111, 146 effect dep)
- `sizeRange` — LIVE (161)
- `color` — LIVE (224, 226)
- `title` — LIVE (191-193)
- `description` — LIVE (194-196)
- `accessibleLabel` — LIVE (202)
- `valueFormat` — LIVE (240)

## Control pattern
- Pattern: Async peer-loaded; internal hover + error + projected points state
- Uses `useControllableState`: NO
- Issues:
  - Error recovery: once `error` is set, it never clears even if props change (e.g. peer becomes available) (FINDING 1)

## State transitions
- Peer load failure (`MissingPeerDependencyError`) → `error` state set, error UI rendered ✓ (139, 171-182)
- Non-peer error → thrown (140) — UI remains in loading/empty state with `basePaths=[]` and no visible error (FINDING 2)
- Empty `points` → `sizeExtent` falls back to `[0,1]` via `!Number.isFinite(lo)` check ✓ (155)
- All same value → `hi = lo + 1` ✓ (156)
- Unknown projection → throws `new Error`, caught only if `MissingPeerDependencyError`; otherwise re-thrown and would escape async promise (FINDING 2, 3)
- Effect dep on `points` array identity → recomputes projection on any parent re-render if array identity changes (FINDING 4)
- Hover → sets hover with clientX/Y; leave → nulls hover ✓ (228-231)

## Callback signatures
- `valueFormat(v: number) => string` — verified (240)

## Test coverage
- File exists: YES, ~8+ tests
- Tested props: `topology`, `objectKey`, `points`, `accessibleLabel`, `projection`, `color`, `sizeRange`
- Untested props: `width`, `height`, `title`, `description`, `valueFormat`

## Findings
1. P1 — Error state never clears at `src/charts/BubbleMap.tsx:88-90, 94-146`. Once `setError` fires, subsequent effect runs do not reset it; if the peer later loads (e.g., dynamic import retried), error UI persists. Clear `setError(null)` at effect start.
2. P0 — Non-peer errors propagate into an unhandled async rejection at `src/charts/BubbleMap.tsx:140`. The `else throw e` escapes a detached promise inside an IIFE, causing `UnhandledPromiseRejection`. Should `setError` with a generic error or call a provided `onError`.
3. P1 — Unknown projection error thrown after IIFE boundary at `src/charts/BubbleMap.tsx:111`. Same unhandled-rejection issue as above.
4. P2 — Effect depends on `points` reference at `src/charts/BubbleMap.tsx:146`. Parent passing a fresh array each render re-runs projection / re-downloads nothing but re-imports peers (loadPeer likely memoizes, but still does work). Consider memoizing inside or depending on a stable derived value.
5. P2 — `sizeRange` dep on array reference at `src/charts/BubbleMap.tsx:162`. Same re-memoize on every render if caller passes inline tuple.
6. P3 — `width`, `height`, `title`, `description`, `valueFormat` untested at `src/charts/__tests__/BubbleMap.test.tsx`.
