# `OHLCChart` functionality audit

**File:** `src/charts/CandlestickChart.tsx:149`
**Test:** `src/charts/__tests__/CandlestickChart.test.tsx` (shared)
**Prop count:** 16
**Bucket:** charts

## Prop liveness
OHLCChart is a thin wrapper over CandlestickChart:
```
OHLCChart(props, ref) => <CandlestickChart ref={ref} {...props} variant={props.variant ?? "ohlc"} />
```
All 16 props from `CandlestickChartProps` are live via spread:
- `data`, `variant`, `width`, `height`, `margins`, `title`, `description`, `valueTicks`, `valueFormat`, `xTicks`, `xFormat`, `accessibleLabel`, `padding`, `showGrid`, `upColor`, `downColor` — all LIVE via `{...props}` at line 151.

## Control pattern
- Pattern: thin default-setter wrapper — `variant` defaults to `"ohlc"` instead of `"candle"`.
- Uses `useControllableState`: N/A.
- Issues: User CAN override `variant` to `"candle"` (line 151: `variant={props.variant ?? "ohlc"}`). An OHLCChart that renders as a candle defeats the wrapper's purpose → FINDING 1.

## State transitions
- Inherited from CandlestickChart.

## Callback signatures
- None.

## Test coverage
- File exists: SHARED with CandlestickChart.
- Tested props: inherited via CandlestickChart tests.
- Untested props: OHLC-specific rendering with explicit variant override.
- Tested states: OHLC render path covered when CandlestickChart tests use `variant="ohlc"`.
- Untested states: `OHLCChart variant="candle"` (the loophole).
- Untested callbacks: N/A.

## Findings
1. P2 — `OHLCChart` allows `variant` override via spread at src/charts/CandlestickChart.tsx:151. A consumer passing `variant="candle"` to `<OHLCChart>` gets a candlestick chart, contradicting the named alias. Either `Omit<CandlestickChartProps, "variant">` or hard-force `variant="ohlc"` (ignore prop).
2. P3 — OHLCChart has no dedicated test file.
