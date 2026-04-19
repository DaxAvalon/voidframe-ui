# `DashboardGrid` functionality audit

**File:** `src/components/Widget.tsx:150`
**Test:** `src/components/__tests__/DragDrop*` / `Widget*` tests (no dedicated file — check src/components/__tests__/)
**Prop count:** 15
**Bucket:** layout

## Prop liveness
- `items` — LIVE (line 326, 331, 335)
- `onLayoutChange` — LIVE (line 485, 493, 504, 527, 545, 565)
- `cols` — LIVE (line 290, 322)
- `cellSize` — LIVE (line 291, 322)
- `gap` — LIVE (line 292, 322)
- `renderItem` — LIVE (line 670)
- `movable` — LIVE (line 294, 458, 668)
- `resizable` — LIVE (line 295, 527, 671)
- `minW` — LIVE (line 296, 570)
- `minH` — LIVE (line 297, 570)
- `maxW` — LIVE (line 298, 550, 570)
- `maxH` — LIVE (line 299, 555, 570)
- `bounds` — LIVE (line 300, 555)
- `autoPaddingRows` — LIVE (line 301)
- `autoPaddingCols` — LIVE (line 302)

## Control pattern
- Pattern: fully controlled via `items` + `onLayoutChange`.
- Uses `useControllableState`: NO — items are always controlled.
- Issues: no `defaultItems` — uncontrolled mode not supported. Callers MUST own layout state. Reasonable for this domain.

## State transitions
- `movable=false` → pointer down gated at line 458 (cannot start move).
- `resizable=false` → resize grip not rendered (line 671) AND resize start gated (527).
- `onLayoutChange` absent → move/resize commit is a no-op (lines 485/527/545). Component becomes effectively read-only without warning.

## Callback signatures
- `onLayoutChange(next: DashboardLayoutItem[])` — verified at 493/504/565.

## Test coverage
- File exists: SHARED — search shows Widget tests are spread (no DashboardGrid-dedicated file observed in listing; covered by DragDrop tests).
- Tested props: items, onLayoutChange, movable/resizable subsets.
- Untested props: bounds fixed-rows variant, autoPaddingRows/Cols numeric, maxW/maxH, minW/minH edge cases.
- Tested states: drag move.
- Untested states: resize bounded by maxW/maxH, swap vs adjacent-snap.
- Untested callbacks: onLayoutChange after resize.

## Findings
1. P1 — Without `onLayoutChange`, `movable=true`/`resizable=true` is silently inert (lines 485/527/545 early-return if onLayoutChange missing). Drag interaction still starts and tracks pointer but never commits — confusing UX. Either disable interaction when onLayoutChange is absent, or warn in dev.
2. P2 — `setCanvasRef` hand-rolls ref merging at line 316; `useMergedRefs` exists in project.
3. P2 — `bounds={rows: N}` prohibits vertical growth (line 555) but horizontal growth still happens unconditionally; documented at line 176 but behavior not tested.
4. P3 — `findNearestEmpty` hard-caps search at 4000 cells (line 275); for very large grids this silently fails to find valid placement.
5. P3 — `maxW` defaults unset, but doc says "Default `cols`" (line 170) — actual code uses `Number.POSITIVE_INFINITY` (line 550). Doc/impl mismatch.
