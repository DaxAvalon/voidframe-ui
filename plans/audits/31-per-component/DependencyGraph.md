# `DependencyGraph` functionality audit

**File:** `src/charts/DependencyGraph.tsx:42`
**Test:** `src/charts/__tests__/DependencyGraph.test.tsx`
**Prop count:** 15
**Bucket:** charts

## Prop liveness
- `nodes` — LIVE (line 140, 151)
- `edges` — LIVE (line 149, 211, 348)
- `direction` — LIVE (line 162, 288)
- `nodeWidth` — LIVE (line 167, 191)
- `nodeHeight` — LIVE (line 168, 195)
- `layerGap` — LIVE (line 168)
- `siblingGap` — LIVE (line 167)
- `width` — LIVE (line 198)
- `height` — LIVE (line 199)
- `title` — LIVE (line 237)
- `description` — LIVE (line 238)
- `accessibleLabel` — LIVE (line 246)
- `onNodeClick` — LIVE (line 495)
- `selectable` — LIVE (line 251, 493)
- `directed` — LIVE (line 438)

## Control pattern
- Pattern: fully internal selection state (`selected` at 206); no controlled variant.
- Uses `useControllableState`: NO.
- Issues: `selectable=false` disables clearing on SVG background click but node click still calls `setSelected` → FINDING 1.

## State transitions
- `selectable=false` → SVG background click no-ops (line 251), but node click at line 494 ALSO gates on `selectable`, so fine; however `onNodeClick` still fires (line 495). OK as intent.
- `directed=false` → arrow markers omitted (line 438).
- `hover` → tooltip for edge or node.
- No loading/error/disabled state.

## Callback signatures
- `onNodeClick(node)` — verified at 495. Called with a reconstructed node object `{id, label, group}` (not the PlacedNode).

## Test coverage
- File exists: YES.
- Tested props: nodes, edges, direction.
- Untested props: selectable=false behavior, directed=false (no arrows), accessibleLabel, title/description.
- Tested states: rendering, basic click.
- Untested states: cycle handling (line 92 puts cycle node at layer 0), obstacle-obstructed dashed edges.
- Untested callbacks: onNodeClick return object structure.

## Findings
1. P2 — Cycle fallback at line 92 returns 0 but does NOT add cycle node to `visiting.delete()` path before setting `layer`. Comment says "cycle: place at layer 0" — correct behavior but not tested.
2. P2 — SVG has `onClick` handler at line 250 that clears selection when `selectable=true`, but non-selectable mode leaves NO way to deselect once selected outside node clicks. Since `selectable=false` also disables node-driven selection (line 493), stalemate is avoided — but if parent sets selection externally there's no path.
3. P3 — `onNodeClick` fires with a reconstructed object `{id, label, group}` discarding layer/index/x/y from PlacedNode (line 495). Callers who want layout info get none.
4. P3 — `mergedRef` implementation at line 130 hand-rolls ref merging; project has `useMergedRefs` hook used elsewhere.
5. P3 — `width` / `height` prop overrides `natural*` but doesn't update viewBox (stays at width/height); OK but unclear.
