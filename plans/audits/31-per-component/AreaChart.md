# `AreaChart` functionality audit

**File:** `src/charts/AreaChart.tsx:55`
**Test:** `src/charts/__tests__/AreaChart.test.tsx`
**Prop count:** 19
**Bucket:** charts

## Prop liveness
- `data` — LIVE (line 134, 241)
- `series` — LIVE (line 108, 135, 154)
- `mode` — LIVE (line 136, 276)
- `xKind` — LIVE (line 137, 244)
- `width` — LIVE (line 126)
- `height` — LIVE (line 127)
- `margins` — LIVE (line 128)
- `title` — LIVE (line 129)
- `description` — LIVE (line 130)
- `showLegend` — LIVE (line 151)
- `showGrid` — LIVE (line 145, 325)
- `showStroke` — LIVE (line 146, 353/386)
- `valueTicks` — LIVE (line 138, 325, 335)
- `xTicks` — LIVE (line 139, 329)
- `valueFormat` — LIVE (line 140, 192, 336)
- `xFormat` — LIVE (line 141, 179, 330)
- `accessibleLabel` — LIVE (line 131)
- `scaleKind` — LIVE (line 147, 318)
- `hiddenKeys` — LIVE (line 112, 162)

## Control pattern
- Pattern: `hiddenKeys` + internal `hiddenKeysInternal` fallback. Legend toggle is suppressed when controlled (line 162 early-returns).
- Uses `useControllableState`: NO — hand-rolled `hiddenKeysProp ?? hiddenKeysInternal` at line 112.
- Issues: No `onHiddenKeysChange` callback — if parent passes `hiddenKeys`, there is no way to receive toggle events → FINDING 1.

## State transitions
- `hiddenKeys` controlled → legend clicks are no-ops (line 162).
- `showLegend && series.length > 1` → legend rendered (line 151). Single-series legend never renders even if `showLegend=true`.
- `hover` state → tooltip active at line 172; null on leave at 424.
- No loading/error/disabled state.

## Callback signatures
- No component-level callback props beyond inherited HTMLAttributes (which exclude `onClick` + `title`). Internal legend `onToggle(key: string)` consumes without emitting outward.

## Test coverage
- File exists: YES.
- Tested props: data, series, mode, xKind, showLegend, showGrid.
- Untested props: `scaleKind` (log/sqrt paths), `hiddenKeys` controlled, `xFormat`/`valueFormat` custom formatters, `accessibleLabel`, `description`.
- Tested states: single/stacked rendering.
- Untested states: controlled-hiddenKeys no-op, single-series legend suppression.
- Untested callbacks: legend toggle in uncontrolled mode.

## Findings
1. P1 — `hiddenKeys` accepted as a controlled prop with no companion `onHiddenKeysChange` callback. src/charts/AreaChart.tsx:77. When a parent supplies `hiddenKeys`, legend `onToggle` at line 161 returns early at 162; the parent cannot react to user toggle intent. Either remove the controlled variant or add `onHiddenKeysChange`.
2. P2 — `xValuesRaw` rebuilt every render (line 241, outside useMemo). Dependency list for xScale uses `xValuesRaw` reference which changes every render, so `useMemo` at 243 never caches.
3. P2 — `logScale` passed domain that may include 0 (line 308 forces `lo=0` when all data is non-negative). `logScale([0, hi])` is mathematically undefined; no guard. src/charts/AreaChart.tsx:287.
4. P3 — Legend suppressed for single series (line 151) is intentional but untested.
