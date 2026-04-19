# `NetworkGraph` functionality audit

**File:** `src/charts/NetworkGraph.tsx:72`
**Test:** `src/charts/__tests__/NetworkGraph.test.tsx` + `NetworkGraphCoverage.test.tsx`
**Prop count:** 15
**Bucket:** charts

## Prop liveness
- `nodes` — LIVE (line 169)
- `links` — LIVE (implied by simulation effect)
- `width` — LIVE (line 152)
- `height` — LIVE (line 217)
- `linkDistance` — LIVE (line 213, 259)
- `chargeStrength` — LIVE (line 215, 260)
- `centerStrength` — LIVE (line 216, 261)
- `directed` — LIVE (line 488)
- `selectable` — LIVE (line 353, 363)
- `rubberBand` — LIVE (line 300, 324)
- `title` — LIVE (header render path)
- `description` — LIVE (header render path)
- `accessibleLabel` — LIVE (svg aria-label)
- `onNodeClick` — LIVE (line 354)
- `coolDownAfter` — LIVE (line 228, 262)

## Control pattern
- Pattern: purely internal state (simNodes/simLinks/selected). No controlled variant.
- Uses `useControllableState`: NO.
- Issues: peer dep (`d3-force`) loaded lazily; if missing, `error` state shows fallback.

## State transitions
- Peer dep missing → `error` state rendered.
- `selectable=false` → clicks don't toggle selection (353, 363) but `onNodeClick` still fires.
- `rubberBand=false` → drag pins node without heating simulation.
- `directed=false` → no arrow markers.
- Cooldown → `lastTickRef` > coolDownAfter → simulation stops.

## Callback signatures
- `onNodeClick(node: NetworkNode)` — verified at 354.

## Test coverage
- File exists: YES, 2 files (NetworkGraph + Coverage).
- Tested props: nodes, links, directed, selectable, rubberBand presence.
- Untested props: linkDistance/chargeStrength/centerStrength numeric behavior, coolDownAfter timeout path, accessibleLabel.
- Tested states: peer-missing fallback, selection.
- Untested states: coolDownAfter timeout, drag with rubberBand=false.
- Untested callbacks: onNodeClick with uncontrolled selection.

## Findings
1. P2 — `width` prop may be undefined initially if `widthProp` is not provided and `useElementSize` hasn't measured yet; falls back to 560 (line 152). First tick of simulation uses 560 then re-runs when measured width arrives — causes visible re-layout.
2. P2 — Hand-rolled `mergedRef` at line 145 — `useMergedRefs` hook exists in project.
3. P2 — Simulation effect's dependency list at lines 259-262 includes coolDownAfter; changing it restarts the entire simulation (costly).
4. P3 — `coolDownAfter` default 4000ms can never be disabled (no sentinel); user wanting an always-warm sim must pass Infinity.
5. P3 — Selection cleared on any SVG click regardless of whether that click was on background (line 363). If selectable, clicking a node and then clicking another node triggers both the node's onClick and svg's onClick — the event propagation order means this works but is fragile.
