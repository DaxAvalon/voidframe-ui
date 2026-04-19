# `ResponsiveBox` functionality audit

**File:** `src/responsive/ResponsiveBox.tsx:19`
**Test:** `src/responsive/__tests__/Responsive.test.tsx` + `coverageGaps.test.tsx`
**Prop count:** 25
**Bucket:** layout

## Prop liveness
- `display` — LIVE (line 94, 124)
- `direction` — LIVE (line 95, 125)
- `align` — LIVE (line 96, 126)
- `justify` — LIVE (line 97, 129)
- `columns` — LIVE (line 98, 139)
- `gap` — LIVE (line 99, 142)
- `wrap` — LIVE (line 100, 143)
- `p` — LIVE (line 102, 146)
- `px` — LIVE (line 103, 147)
- `py` — LIVE (line 104, 150)
- `pt` — LIVE (line 105, 153)
- `pr` — LIVE (line 106, 154)
- `pb` — LIVE (line 107, 155)
- `pl` — LIVE (line 108, 156)
- `m` — LIVE (line 110, 157)
- `mx` — LIVE (line 111, 158)
- `my` — LIVE (line 112, 159)
- `mt` — LIVE (line 113, 160)
- `mr` — LIVE (line 114, 161)
- `mb` — LIVE (line 115, 162)
- `ml` — LIVE (line 116, 163)
- `maxWidth` — LIVE (line 118, 164)
- `minWidth` — LIVE (line 119, 165)
- `width` — LIVE (line 120, 166)
- `height` — LIVE (line 121, 167)

## Control pattern
- Pattern: stateless forwardRef presentation primitive; all layout props are `Responsive<T>` values resolved via `useResponsive`.
- Uses `useControllableState`: N/A (no interactive state).
- Issues: none.

## State transitions
- No loading/disabled/error state — pure layout primitive.
- No interactive state transitions.

## Callback signatures
- No callback props; only `...rest` forwards DOM attributes (onClick, etc.) via spread at line 176.

## Test coverage
- File exists: YES, 28 occurrences (6 in Responsive.test.tsx, 22 in coverageGaps.test.tsx).
- Tested props: display, direction, align, justify, columns, gap, wrap, p/px/py/pt/pr/pb/pl, m/mx/my/mt/mr/mb/ml, maxWidth/minWidth/width/height (coverageGaps enumerates each axis).
- Untested props: edge combinations like conflicting `p` + `pt`.
- Tested states: breakpoint resolution.
- Untested states: style override precedence (user `style` overrides computed merged at line 168, not asserted).
- Untested callbacks: N/A.

## Findings
1. P2 — `align="start"` maps to `flex-start` (line 127) but for `display="grid"` the correct CSS value is literal `start`. At src/responsive/ResponsiveBox.tsx:127, alignItems is forced to `flex-start`/`flex-end` even when display is grid, where `start`/`end` would be the valid grid values. Works because `flex-start` is treated as `start` by grid in practice but semantically misnamed.
2. P3 — Style merge at line 168 puts user `style` LAST, so user style wins over computed layout props — the docstring ("resolve once per render") doesn't call this out. Behavior may surprise users expecting typed props to win.
3. P2 — No memoization on the merged style object; a new `CSSProperties` object is created every render, defeating any `memo()` wrapping downstream. src/responsive/ResponsiveBox.tsx:123.
