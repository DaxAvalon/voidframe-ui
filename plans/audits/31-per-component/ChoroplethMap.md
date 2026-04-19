# `ChoroplethMap` functionality audit

**File:** `src/charts/ChoroplethMap.tsx:28`
**Test:** `src/charts/__tests__/ChoroplethMap.test.tsx`
**Prop count:** 13
**Bucket:** charts

## Prop liveness

- `topology` — LIVE (line 131)
- `objectKey` — LIVE (line 132)
- `featureIdProp` — LIVE (line 142)
- `values` — LIVE (used in rendering for fill lookup)
- `width` — LIVE (line 96, 136)
- `height` — LIVE (line 136)
- `colors` — LIVE (line 75, passed into quantizeScale)
- `projection` — LIVE (line 118)
- `title` — LIVE (header path)
- `description` — LIVE (header path)
- `showLegend` — LIVE (legend render)
- `accessibleLabel` — LIVE (svg aria-label)
- `valueFormat` — LIVE (tooltip)

## Control pattern

- Pattern: stateless aside from peer-load effect + hover.
- Uses `useControllableState`: N/A.
- Issues: peer dep load via `loadPeer` — gracefully sets `error` state on missing d3-geo/topojson-client.

## State transitions

- Peer missing → `error` state → fallback UI.
- Projection change → effect re-runs and rebuilds `features`.
- `topology`/`objectKey`/`featureIdProp` change → re-fetches peer and recomputes.
- Hover → tooltip.

## Callback signatures

- No callback props.

## Test coverage

- File exists: YES.
- Tested props: topology, objectKey, featureIdProp, values, projection.
- Untested props: accessibleLabel, colors custom, valueFormat.
- Tested states: peer missing fallback.
- Untested states: unknown projection error path (line 120).
- Untested callbacks: N/A.

## Findings

1. P2 — `geoPath` called TWICE at lines 139/140 — once for path generation, once for centroid. Could reuse one instance. Minor waste.
2. P2 — Effect deps include `width` (line 136 uses it) but the dependency array (not shown) should include width/height/topology/objectKey/featureIdProp/projection — if missing, projection will not re-fit on resize.
3. P2 — `mergedRef` hand-rolled (line 89); `useMergedRefs` exists.
4. P2 — No onFeatureClick / onFeatureHover exposed — parent cannot react to user interaction.
5. P3 — `topology` typed as `unknown`; wrong shape just throws inside effect. Documented trade-off.
