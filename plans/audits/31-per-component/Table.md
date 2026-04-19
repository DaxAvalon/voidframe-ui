# `Table` functionality audit

**File:** `src/components/Data.tsx:40`
**Test:** `src/components/__tests__/Data.test.tsx` + `DataExtended.test.tsx`
**Prop count:** 14
**Bucket:** data

## Prop liveness

- `columns` — LIVE (line 138, 149)
- `data` — LIVE (line 104)
- `striped` — LIVE (line 124, 211)
- `dense` — LIVE (line 125)
- `bordered` — LIVE (line 126)
- `stickyHeader` — LIVE (line 127)
- `adaptive` — LIVE (line 128, 131, 239)
- `loading` — LIVE (line 189)
- `emptyState` — LIVE (line 198)
- `onRowClick` — LIVE (line 210, 213)
- `rowKey` — LIVE (line 203)
- `defaultSort` — LIVE (line 89)
- `sort` — LIVE (line 90)
- `onSortChange` — LIVE (line 100)

## Control pattern

- Pattern: `sort` / `defaultSort` / `onSortChange` — classic controlled/uncontrolled.
- Uses `useControllableState`: NO — hand-rolled via `sort !== undefined ? sort : internalSort` at line 90.
- Issues: `onSortChange` is invoked at line 100 even when sort is uncontrolled (always). OK pattern.

## State transitions

- `loading` → loading row rendered (line 189), replacing body. ✓
- `sortedData.length === 0` → emptyState rendered (line 195). ✓
- `sortable` column header → clickable to cycle asc→desc→null (line 92).
- `adaptive=true` → mobile card mode class + per-cell header label (line 239).
- `onRowClick` absent → row not clickable (line 210, 213).

## Callback signatures

- `onRowClick(row, index)` — verified at 213.
- `onSortChange(next | null)` — verified at 100.

## Test coverage

- File exists: YES (Data.test.tsx + DataExtended.test.tsx).
- Tested props: columns, data, striped, onRowClick, sort.
- Untested props: stickyHeader render, adaptive mobile switch, bordered, dense.
- Tested states: sort cycle, empty state.
- Untested states: loading + sort combination, adaptive cell label rendering.
- Untested callbacks: rowKey with duplicate keys.

## Findings

1. P2 — Sort cycle at line 92 uses default comparator that assumes numeric comparability: `(av as number) < (bv as number)` at line 114. For string columns without a `compare`, `"a" < "b"` coerces correctly, but mixed types produce NaN compares.
2. P2 — `minWidth: columns.length * 60` at line 139 is a magic constant; horizontally constrained tables may overflow or under-fit.
3. P3 — `rowKey` default falls back to index (line 203) — reordering `data` without a stable rowKey mangles React keys.
4. P3 — `striped` applied as class AND per-row `ri % 2 === 1` logic (line 211) — redundant styling layers.
5. P3 — `adaptive=true` renders hidden cell labels always (line 239), adding DOM weight even when not in mobile mode.
