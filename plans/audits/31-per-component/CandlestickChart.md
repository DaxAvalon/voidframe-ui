# `CandlestickChart` functionality audit

**File:** `src/charts/CandlestickChart.tsx:35`
**Test:** `src/charts/__tests__/CandlestickChart.test.tsx`
**Prop count:** 16
**Bucket:** charts

## Prop liveness
- `data` — LIVE (line 105)
- `variant` — LIVE (line 106, 228)
- `width` — LIVE (line 97)
- `height` — LIVE (line 98)
- `margins` — LIVE (line 99)
- `title` — LIVE (line 100)
- `description` — LIVE (line 101)
- `valueTicks` — LIVE (line 107)
- `valueFormat` — LIVE (line 108, 128, 221)
- `xTicks` — LIVE (line 109)
- `xFormat` — LIVE (line 110, 121, 215)
- `accessibleLabel` — LIVE (line 102)
- `padding` — LIVE (line 111, 187)
- `showGrid` — LIVE (line 112, 210)
- `upColor` — LIVE (line 113, 124)
- `downColor` — LIVE (line 114, 124)

## Control pattern
- Pattern: stateless (hover tooltip only).
- Uses `useControllableState`: N/A.
- Issues: none.

## State transitions
- `variant="ohlc"` → tick-mark rendering (line 228).
- `variant="candle"` → filled rect rendering (line 266).
- Hover state → tooltip.
- No loading/error/disabled.

## Callback signatures
- No component-level callback props.

## Test coverage
- File exists: YES.
- Tested props: data, variant, width/height.
- Untested props: valueFormat, xFormat, padding, upColor/downColor overrides, accessibleLabel.
- Tested states: candle vs ohlc rendering.
- Untested states: hover tooltip emergence.
- Untested callbacks: N/A.

## Findings
1. P2 — Tooltip percent change calculation at src/charts/CandlestickChart.tsx:136 divides by `hover.datum.open`; if `open === 0` this is `Infinity`. No guard.
2. P2 — `band` scale created outside useMemo (line 184) — re-created every render.
3. P3 — No click/hover callback exposed to parent.
4. P3 — Tooltip color for `close` uses `tone` variable (line 135) — but the up/down color is the same for all metrics on the hovered candle, which is fine; just undocumented.
