# Feature-gap: Data display (24 findings)

### 1. No column pinning on the base Table
**Category:** Table
**Benchmark:** AG Grid, MUI DataGrid (`pinnedColumns`), TanStack `columnPinning`
**Gap:** `DataGrid.tsx` supports `pin: "left" | "right"` per column, but the plain `Table` in `Data.tsx` (simpler API users reach for first) has no pin prop, so sticky first/last columns require upgrading to the full DataGrid.
**Where to add:** `src/components/Data.tsx`
**Priority:** nice-to-have

### 2. No row pinning (sticky pinned rows)
**Category:** Table / DataGrid
**Benchmark:** TanStack Table `rowPinning`, AG Grid `pinnedTopRowData`
**Gap:** DataGrid exposes `rowExpansion` and `onRowReorder` but no API to pin specific rows to top/bottom for comparison/summary.
**Where to add:** `src/components/DataGrid.tsx`
**Priority:** nice-to-have

### 3. No column grouping / nested header rows
**Category:** Table / DataGrid
**Benchmark:** AG Grid `columnGroupShow`, Ant Design `Table` `children` on columns, MUI `columnGroupingModel`
**Gap:** `DataGridColumn` is flat; there is no multi-row header for grouped categories (e.g. "Financials › Q1/Q2/Q3").
**Where to add:** `src/components/DataGrid.tsx` (`DataGridColumn` type + header renderer)
**Priority:** must-have

### 4. No inline cell editing with validation
**Category:** Table / DataGrid
**Benchmark:** MUI DataGrid `editable` columns + `preProcessEditCellProps`, AG Grid `cellEditor`, Handsontable
**Gap:** DataGrid props expose no `editable`, `onCellEdit`, `cellEditor`, or validation hooks — read-only only.
**Where to add:** `src/components/DataGrid.tsx`
**Priority:** must-have

### 5. No spreadsheet clipboard (copy range, paste, fill-handle, undo/redo)
**Category:** Table / DataGrid
**Benchmark:** Handsontable, AG Grid Enterprise `enableRangeSelection` + clipboard, MUI Premium
**Gap:** Grepping DataGrid.tsx shows no `onPaste`, range selection, fill, or undo stack. Export-to-clipboard is per-grid only, not cell-range.
**Where to add:** `src/components/DataGrid.tsx`
**Priority:** nice-to-have

### 6. Row selection lacks shift-click range and keyboard navigation
**Category:** Table / DataGrid
**Benchmark:** AG Grid, TanStack `getIsAllPageRowsSelected`, Mantine `useListState`
**Gap:** `selectedKeys: Set<string>` with `onSelectionChange` exists, but no `shiftKey`/anchor logic or arrow-key focus model is visible in the source.
**Where to add:** `src/components/DataGrid.tsx`
**Priority:** must-have

### 7. No bulk-actions bar tied to selection
**Category:** Table / DataGrid
**Benchmark:** Ant Design `rowSelection` + `Alert` bar, Linear/Notion patterns
**Gap:** No `DataGrid.BulkActions` subcomponent or "N selected" toolbar slot; callers must build their own.
**Where to add:** `src/components/DataGrid.tsx`
**Priority:** must-have

### 8. No row grouping with aggregates (sum/avg per group)
**Category:** Table / DataGrid
**Benchmark:** AG Grid grouping + `aggFunc`, TanStack `getGroupedRowModel` + `aggregationFn`
**Gap:** `groupBy` prop exists as a key, but no aggregation type per column, no group footer rows, no `Column.aggregate`.
**Where to add:** `src/components/DataGrid.tsx`
**Priority:** must-have

### 9. No saved views / presets
**Category:** Table / DataGrid
**Benchmark:** AG Grid column state save/restore, Airtable views, Linear views
**Gap:** `persistKey` persists widths/visibility/order but there's no concept of multiple named views (sort + filter + visibility bundles) a user can switch between.
**Where to add:** `src/components/DataGrid.tsx`
**Priority:** nice-to-have

### 10. No XLSX export, no print layout
**Category:** Table / DataGrid
**Benchmark:** AG Grid `exportDataAsExcel`, MUI `GridToolbarExport` + print
**Gap:** `DataGridExportFormat = "csv" | "json" | "clipboard"` only — no XLSX, no print CSS/`@media print` path.
**Where to add:** `src/components/DataGrid.tsx` + styles
**Priority:** nice-to-have

### 11. No filter builder / typed per-column filters / filter chips
**Category:** Advanced filtering
**Benchmark:** AG Grid `filterType: "agNumberColumnFilter"` + set/condition, Retool, Airtable
**Gap:** `filters?: Record<string, string>` is string-only; no number/date/enum variants, no AND/OR tree builder, no active-filter chip row, no URL sync.
**Where to add:** `src/components/DataGrid.tsx`
**Priority:** must-have

### 12. Pagination is prev/next only
**Category:** Pagination
**Benchmark:** MUI `TablePagination` (pageSize selector + range), Ant `Pagination.jumper`
**Gap:** `DataGridPagination` shows only "Page N / M" + Prev/Next — no page-size selector, no jump-to-page input, no "1–50 of 1,200" range display, no cursor-based pagination hook.
**Where to add:** `src/components/DataGrid.tsx` (`DataGridPagination`)
**Priority:** must-have

### 13. VirtualList dynamic row heights unmeasured
**Category:** Virtualization
**Benchmark:** `@tanstack/react-virtual` `measureElement`, react-virtuoso auto-sizing
**Gap:** `itemHeight` accepts a function, but no ResizeObserver-based measurement cache for unknown content sizes, and no `scrollToIndex`/scroll-restoration API.
**Where to add:** `src/components/Virtualization.tsx`
**Priority:** must-have

### 14. No drag-to-reorder/reparent in TreeView, no checkbox cascade, no badges
**Category:** Tree
**Benchmark:** react-arborist, AG Grid tree data, Mantine Tree
**Gap:** TreeView supports `checkable` + `loadChildren` but props show no `onNodeMove`, no parent/child check cascade, no per-node badge slot, no virtualization.
**Where to add:** `src/components/TreeView.tsx`, `src/components/TreeTable.tsx`
**Priority:** must-have

### 15. Kanban lacks swimlanes, search/filter, archive, reorder-within-column control
**Category:** Kanban
**Benchmark:** Jira (swimlanes), Trello (archive), Linear (filters)
**Gap:** `Kanban` has WIP limits + cross-column drag, but no swimlane grouping row, no board-wide search/filter prop, no archive column affordance, no card-template helper.
**Where to add:** `src/components/Kanban.tsx`
**Priority:** nice-to-have

### 16. Gantt missing today marker, milestones, quarter/year zoom, critical path, resource view
**Category:** Gantt
**Benchmark:** dhtmlxGantt, Bryntum, syncfusion
**Gap:** `granularity` is `"day" | "week" | "month"` only; grep shows zero hits for today/milestone/critical/resource/quarter.
**Where to add:** `src/components/Gantt.tsx`
**Priority:** must-have

### 17. Calendar missing agenda view, drag-to-create, drag-resize, recurring, timezone, all-day row, categories
**Category:** Calendar
**Benchmark:** FullCalendar, Toast UI Calendar
**Gap:** Views are `"month" | "week" | "day"` (no agenda/list). Grep for agenda/timezone/recurring/dragCreate/resize/allDay/overlap/category — no matches.
**Where to add:** `src/components/Calendar.tsx`
**Priority:** must-have

### 18. Activity feed has no infinite scroll, grouping, actor filter, or realtime banner
**Category:** Activity
**Benchmark:** GitHub events feed, Linear activity
**Gap:** Activity.tsx grep for infinite/loadMore/realtime/group/filter/actor returns nothing meaningful — it's purely static items.
**Where to add:** `src/components/Activity.tsx`
**Priority:** nice-to-have

### 19. DiffViewer lacks word-level diff, line annotations, collapsible unchanged hunks, search
**Category:** Viewer
**Benchmark:** react-diff-view, diff2html, GitHub split diff
**Gap:** `DiffViewerProps.variant` is `"unified" | "split"` (good), but no intra-line/word-level highlighting, no fold-unchanged, no "jump to next change," no per-line comment/annotation slot.
**Where to add:** `src/components/Viewers.tsx`
**Priority:** must-have

### 20. CodeBlock has no search-within, download, fullscreen, or theme selection
**Category:** Viewer
**Benchmark:** Shiki + Monaco, CodeMirror
**Gap:** Props show `copyable`, `lineNumbers`, `highlightLines`, `theme` as a string, but no in-block search, no download button, no fullscreen toggle, no collapsible for huge blocks.
**Where to add:** `src/components/Viewers.tsx`
**Priority:** nice-to-have

### 21. JSONViewer missing expand/collapse all, path copy, search highlight, schema overlay, editable mode
**Category:** Viewer
**Benchmark:** react-json-view, JSONEditor by josdejong
**Gap:** Props expose `onSelect(path)` and per-key paths internally, but no `defaultExpandAll`, no "copy path" UI button, no search-highlight prop, no `editable`, no schema/type overlay.
**Where to add:** `src/components/Viewers.tsx`
**Priority:** must-have

### 22. LogViewer / Terminal missing follow-tail toggle, pause, regex filter, export, virtualization for 100k+
**Category:** Viewer
**Benchmark:** Grafana Loki UI, Datadog log explorer, xterm.js
**Gap:** LogViewer has `level`, `filter(fn)`, `highlight: RegExp`, `autoScroll` — but no pause/resume control, no regex-filter input, no export button, and neither LogViewer nor Terminal wraps content in `VirtualList`.
**Where to add:** `src/components/Viewers.tsx`
**Priority:** must-have

### 23. Stat/Metrics missing threshold coloring and period-over-period compare
**Category:** Metrics
**Benchmark:** Grafana stat panel thresholds, Tremor `<DeltaBar>`
**Gap:** `Stat` has `delta` (value+direction) and inline `sparkline`, but no `thresholds: [{at, color}]` prop, no previous-period compare mode, no click-to-drill-down callback.
**Where to add:** `src/components/Metrics.tsx`
**Priority:** nice-to-have

### 24. No async-data wrapper / skeleton shapes matching component
**Category:** Integration
**Benchmark:** TanStack Query + suspense skeletons, Mantine `LoadingOverlay` variants
**Gap:** DataGrid/Table/TreeView each take `loading` as a flat boolean, but there's no shared `<AsyncData>` wrapper with loading/empty/error/retry slots and no component-shaped skeletons (e.g. ghost rows for Table, ghost cards for Kanban).
**Where to add:** new primitive; consumed by Data/DataGrid/TreeView/Kanban/Activity
**Priority:** must-have
