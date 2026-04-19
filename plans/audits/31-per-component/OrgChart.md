# `OrgChart` functionality audit

**File:** `src/charts/OrgChart.tsx:26`
**Test:** `src/charts/__tests__/OrgChart.test.tsx`
**Prop count:** 16
**Bucket:** charts

## Prop liveness
- `data` — LIVE (line 224, 250)
- `direction` — LIVE (line 245)
- `nodeWidth` — LIVE (line 254, 344)
- `nodeHeight` — LIVE (line 255, 345)
- `horizontalGap` — LIVE (line 256)
- `verticalGap` — LIVE (line 257)
- `renderNode` — LIVE (line 404)
- `onNodeClick` — LIVE (line 401)
- `collapsible` — LIVE (line 449)
- `expandedIds` — LIVE (line 227, via useControllableState)
- `defaultExpandedIds` — LIVE (line 228)
- `onExpandChange` — LIVE (line 229, via useControllableState)
- `connectorStyle` — LIVE (line 371, 380)
- `zoom` — LIVE (line 234, via useControllableState)
- `onZoomChange` — LIVE (line 236)
- `size` — LIVE (line 301, 309)

## Control pattern
- Pattern: `expandedIds`/`defaultExpandedIds`/`onExpandChange` and `zoom`/`onZoomChange` — both via `useControllableState`.
- Uses `useControllableState`: YES (lines 226, 233). ✓
- Issues: `zoom` has no explicit `defaultZoom` prop — uses hardcoded `defaultValue: 1` at line 235. Parents can't set an initial uncontrolled zoom without controlling the state.

## State transitions
- `collapsible === false` → collapse toggle hidden (line 449). Still allows parent to control `expandedIds`.
- Zoom buttons clamp to [0.1, 3] (lines 294/298).
- No loading/error/disabled states.

## Callback signatures
- `onNodeClick(node)` — verified at line 401.
- `onExpandChange(ids: string[])` — verified via useControllableState.
- `onZoomChange(zoom: number)` — verified via useControllableState.

## Test coverage
- File exists: YES.
- Tested props: data, direction, onNodeClick, collapsible, expandedIds.
- Untested props: renderNode custom renderer, connectorStyle variants, zoom controlled, size variants, nodeWidth/nodeHeight customization.
- Tested states: expand/collapse, click.
- Untested states: zoom clamping at bounds, left-right direction layout.
- Untested callbacks: onZoomChange, onExpandChange under useControllableState.

## Findings
1. P2 — `expandedSet` uses latest `expandedIds` from useControllableState but `toggleExpand` at line 283 reads from the stale closure. Works because React re-renders, but setting `expandedIds` then immediately inspecting would race.
2. P2 — `zoom` clamping done in handlers (lines 294, 298) not in `setZoomLevel`, so a parent passing `zoom={10}` (controlled) is rendered at 10x without clamp. src/charts/OrgChart.tsx:337.
3. P2 — No `defaultZoom` prop; first-paint zoom is forced to 1. If user wants an uncontrolled initial zoom of 0.5 there's no path.
4. P3 — `svg` `transform: scale(zoomLevel)` AND `width/height = svg * zoom` (lines 337-340) — double-scales visually (CSS transform + attribute). Probably a bug: one or the other would suffice.
5. P3 — `size` only affects font sizes (lines 301-302) — no change to node dimensions or connector size; may surprise users.
