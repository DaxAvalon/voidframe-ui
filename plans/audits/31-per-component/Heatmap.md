# `Heatmap` functionality audit

**File:** `src/charts/Heatmap.tsx:54`
**Test:** `src/charts/__tests__/Heatmap.test.tsx`
**Prop count:** 13
**Bucket:** charts

## Prop liveness
- `rows` — LIVE (used at 93, 132-144, 145)
- `columns` — LIVE (used at 92, 120-131, 146)
- `data` — LIVE (used at 78 in memo)
- `colors` — LIVE (used at 86, 177)
- `cellSize` — LIVE (used at 92-93, 125, 138, 153-156)
- `cellGap` — LIVE (used at 92-93, 125, 138, 153-154)
- `title` — LIVE (used at 105-107)
- `description` — LIVE (used at 105, 108-110)
- `showRowLabels` — LIVE (used at 90, 132)
- `showColumnLabels` — LIVE (used at 91, 120)
- `valueFormat` — LIVE (used at 197)
- `accessibleLabel` — LIVE (used at 116)
- `showLegend` — LIVE (used at 174)

## Control pattern
- Pattern: Uncontrolled hover state via local `useState` (line 95)
- Uses `useControllableState`: NO
- Issues: none — hover is ephemeral UI; no external control surface expected

## State transitions
- Empty `data` → memo returns `max: 1`, all cells render default `--vf-bg-3` fill ✓ (line 82, 148)
- Missing cell for row/col pair → `cell` is undefined, renders default color and tooltip shows `—` ✓ (147-148, 197)
- `hover` set on `onPointerMove` → tooltip becomes active ✓ (159-168, 190)
- `hover` cleared on `onPointerLeave` → tooltip hides ✓ (168, 190)
- `showLegend=false` → legend omitted ✓ (174)
- `showRowLabels=false` → leftPad collapses to 0, no row labels ✓ (90, 132)
- `showColumnLabels=false` → topPad collapses to 0, no column labels ✓ (91, 120)

## Callback signatures
- `valueFormat(v: number) => string` — verified, invoked only for cells with data (197)
- No change/select callbacks — component is display-only, no way to observe hover externally (FINDING 2)

## Test coverage
- File exists: YES, 12+ tests covering rows/columns/data, row label toggle, column label toggle, legend toggle, colors, cellSize/cellGap, valueFormat, accessibleLabel
- Tested props: `rows`, `columns`, `data`, `showRowLabels`, `showColumnLabels`, `showLegend`, `colors`, `cellSize`, `cellGap`, `valueFormat`, `accessibleLabel`
- Untested props: `title`, `description`

## Findings
1. P2 — Legend labels collapse to empty strings at `src/charts/Heatmap.tsx:177-186`. Only the first and last buckets receive labels (`"Low"` and `"${max}+`); intermediate buckets use `label: ""`. Screen readers in ChartLegend will see blank entries. Consider computing quantile thresholds.
2. P2 — No hover/selection callback surface at `src/charts/Heatmap.tsx:95-101`. Hover state is entirely internal; consumers cannot react to cell focus (e.g. sync across multiple heatmaps). Undocumented limitation.
3. P3 — `title` and `description` props untested at `src/charts/__tests__/Heatmap.test.tsx`. Both are LIVE but have no dedicated test.
