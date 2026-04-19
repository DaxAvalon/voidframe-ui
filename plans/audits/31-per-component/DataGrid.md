# `DataGrid` functionality audit

**File:** `src/components/DataGrid.tsx:75`
**Test:** `src/components/__tests__/DataGridCoverage.test.tsx` + `DataGridExpanded.test.tsx`
**Prop count:** 27
**Bucket:** data

## Prop liveness
- `columns` — LIVE (line 226, 231, 299)
- `data` — LIVE (line 381, 468)
- `totalCount` — LIVE (line 498, read at 1237)
- `rowKey` — LIVE (line 414, 470)
- `rowSelection` — LIVE (line 423, 438, 476)
- `selectedKeys` — LIVE (line 278, 431)
- `onSelectionChange` — LIVE (line 432, 441)
- `rowExpansion` — LIVE (line 477)
- `renderExpanded` — LIVE (line 480, 807)
- `sort` — LIVE (line 283, 355)
- `onSortChange` — LIVE (line 356)
- `filters` — LIVE (line 285, 365)
- `onFiltersChange` — LIVE (line 366)
- `groupBy` — LIVE (line 289, 489)
- `onGroupByChange` — LIVE (line 294)
- `pagination` — LIVE (line 406, 497)
- `virtualized` — LIVE (line 494, 1016)
- `virtualRowHeight` — LIVE (line 495, 1035)
- `virtualHeight` — LIVE (line 496, 1015)
- `density` — LIVE (line 485, 504)
- `emptyState` — LIVE (line 487, 1009)
- `loading` — LIVE (line 486)
- `error` — LIVE (line 488)
- `onRowReorder` — LIVE (line 456, 492)
- `onColumnReorder` — LIVE (line 346)
- `onColumnResize` — LIVE (line 331)
- `persistKey` — LIVE (line 244, 269)

## Control pattern
- Pattern: mixed controlled/uncontrolled — `selectedKeys`/`onSelectionChange`, `sort`/`onSortChange`, `filters`/`onFiltersChange` each fallback to internal state at 277/280/284.
- Uses `useControllableState`: NO — hand-rolled `selectedKeys ?? selectedInternal` fallback at 278, `sort !== undefined ? sort : sortInternal` at 283, `filters ?? filtersInternal` at 285.
- Issues: `setSort` at line 353 always calls `onSortChange` regardless of controlled/uncontrolled. `setFilter` at line 361 rebuilds `nextFilters` from `currentFilters` but when controlled may race with parent state. `groupBy` is reflected back to parent via `onGroupByChange?.(groupBy)` at 294 — this fires the callback with the same value the parent just passed (echo loop) → FINDING 1.

## State transitions
- `loading` → `aria-busy`/spinner path (context has `loading`, body uses at render line 1005+).
- `error` → rendered in body when set (context at 488).
- `emptyState` → rendered when filteredData length === 0 (line 1009).
- `virtualized && groupBy` → warning logged at line 1019, virtualization silently disabled.
- `rowSelection === "none"` → `toggleRow` early-returns at 423 ✓.
- `rowSelection !== "multi"` → `toggleAll` early-returns at 438 ✓.
- `persistKey` change → existing persisted state is read once; subsequent persistKey change still fires the effect (ok) but column hydration only once per key.

## Callback signatures
- `onSelectionChange(next: Set<string>)` — verified line 432/441.
- `onSortChange(next: {key, direction} | null)` — verified line 356.
- `onFiltersChange(next: Record<string,string>)` — verified line 366.
- `onGroupByChange(key: string | undefined)` — fires on every `groupBy` prop change with the new value, which is redundant (parent already knows) → FINDING 1.
- `onRowReorder({fromIndex, toIndex})` — verified line 456.
- `onColumnReorder({from, to, nextOrder})` — verified line 346.
- `onColumnResize(key, width)` — verified line 331.

## Test coverage
- File exists: YES, ~36 test blocks across 2 files (DataGridCoverage + DataGridExpanded).
- Tested props: columns, data, rowSelection, selectedKeys, pagination, virtualized, density, sort, filters, groupBy, onRowReorder, onColumnResize, persistKey.
- Untested props: `totalCount` (display-only, not asserted), `error` state, server-side combined totalCount+pagination rendering.
- Tested states: loading, selection, expansion, sort/filter/group.
- Untested states: error prop rendering path, virtualized+groupBy warning path.
- Untested callbacks: `onColumnReorder` drag path, `onGroupByChange` echo behavior.

## Findings
1. P1 — `onGroupByChange` echo loop at src/components/DataGrid.tsx:294. Effect calls `onGroupByChange?.(groupBy)` whenever `groupBy` prop changes, which re-emits the value the parent just supplied. If parent uses the callback to update state, this is a redundant round-trip; if parent memoizes on the callback, it re-fires. The callback was presumably intended for internal state changes but no internal state for groupBy exists.
2. P2 — Persist hydration intentionally ignores `columns` changes (src/components/DataGrid.tsx:263). If columns are added after first mount under a `persistKey`, new columns are appended to end but widths/hidden from persisted state for removed columns linger forever in localStorage.
3. P2 — `filteredData` applies pagination slice inside same memo (line 406). This makes `filteredData` the visible page only, so `allRowKeys` at line 414 covers only the current page — "select all" therefore selects only the page's rows, which may be unintended when server totalCount > page size.
4. P3 — `error` state not explicitly covered in tests.
