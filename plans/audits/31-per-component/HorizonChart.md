# `HorizonChart` functionality audit

**File:** `src/charts/HorizonChart.tsx:31`
**Test:** `src/charts/__tests__/HorizonChart.test.tsx`
**Prop count:** 14
**Bucket:** charts

## Prop liveness

- `data` — LIVE (line 83, 115)
- `xKind` — LIVE (line 82)
- `bands` — LIVE (line 119, 149)
- `width` — LIVE (line 88, 140)
- `height` — LIVE (line 141, 155)
- `curve` — LIVE (line 162, 167)
- `positiveColor` — LIVE (line 174, 241)
- `negativeColor` — LIVE (line 181, 241)
- `title` — LIVE (line 130)
- `description` — LIVE (line 131)
- `accessibleLabel` — LIVE (line 139)
- `seriesLabel` — LIVE (line 238)
- `valueFormat` — LIVE (line 239)
- `xFormat` — LIVE (line 229)

## Control pattern

- Pattern: stateless (hover tooltip only).
- Uses `useControllableState`: N/A.
- Issues: none.

## State transitions

- `hover` → tooltip.
- No loading/error/disabled.

## Callback signatures

- No callbacks.

## Test coverage

- File exists: YES.
- Tested props: data, bands, positiveColor/negativeColor.
- Untested props: curve, seriesLabel, xFormat, valueFormat, accessibleLabel.
- Tested states: rendering.
- Untested states: negative-value rendering.
- Untested callbacks: N/A.

## Findings

1. P2 — Uses `d3-shape` (`d3Area`) directly (line 14) without the peer-load pattern used by NetworkGraph. If d3-shape is not installed, this throws on import — no graceful fallback.
2. P2 — `bandSize` computed outside useMemo (line 119).
3. P3 — `absMax || 1` fallback at line 116 — if all values are 0, `bandSize` = 1 with `absMax = 0`, giving a chart with empty bands (correct, but visually empty).
4. P3 — No `onHover` / `onClick` callback exposed to parents.
