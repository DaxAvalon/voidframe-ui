# 09 — Components: Data Display

**Goal:** Ship ~35 data-display components — the heart of dashboard UIs. Tables, trees, calendars, visualizations, and primitives for dense information presentation.

**Depends on:** Track A (01-06), some depend on Phase 08 (overlays for popovers).
**Effort:** 5-7 days (DataGrid is heavy).

## Tables & Grids

### D01. Table (upgrade)

```tsx
<Table
  columns={ColumnDef<T>[]}
  data={T[]}
  striped | dense | bordered
  stickyHeader
  onRowClick={(row, index) => void}
  rowKey={(row) => string}
  emptyState={<EmptyState />}
  loading={boolean}
/>
```

- Column definition: `{ key, header, width, align, render, sortable, sticky, className, style, headerClassName }`.
- Cell render via string key or function.
- Sticky first/last columns.
- Zebra stripes via `striped`.

### D02. DataGrid (new — the flagship)

```tsx
<DataGrid<T>
  columns onSort onFilter onGroupBy
  data totalCount
  pagination | virtualized | infinite
  rowSelection: "none" | "single" | "multi"  selectedKeys onSelectionChange
  rowExpansion renderExpanded
  rowReorder onRowReorder
  columnReorder onColumnReorder
  columnResize onColumnResize
  density
  toolbar={<DataGrid.Toolbar />}
  footer
  emptyState loading error
/>
```

Compound pattern:

```tsx
<DataGrid>
  <DataGrid.Toolbar>
    <DataGrid.Search />
    <DataGrid.Filters />
    <DataGrid.ColumnVisibility />
    <DataGrid.Export />
  </DataGrid.Toolbar>
  <DataGrid.Body />
  <DataGrid.Footer>
    <DataGrid.Pagination />
  </DataGrid.Footer>
</DataGrid>
```

Features:
- Column sort (asc/desc/none) — multi-column via Shift.
- Column filter (per-column filter UI in header).
- Column visibility toggle.
- Column reorder (drag headers).
- Column resize (drag borders).
- Column pinning (left/right sticky).
- Row selection (checkbox column).
- Row expansion (caret column; custom rendered content).
- Row grouping with collapsible group rows.
- Row reorder (drag handle column).
- Virtualization (delegates to VirtualList).
- Export (CSV, JSON, clipboard).
- Persistence of column widths/visibility/order to localStorage.

### D03. TreeTable (new)

Table with hierarchical rows. Expand/collapse parent rows.

```tsx
<TreeTable columns data={TreeNode[]} getChildren={(row) => row.children} />
```

### D04. TreeView (new)

```tsx
<TreeView
  items={TreeNode[]}
  defaultExpanded={string[]}
  expanded onExpandedChange
  selected onSelectionChange
  multiSelect checkable
  renderItem={(item, { expanded, selected }) => ReactNode}
  loadChildren={async (node) => TreeNode[]}   // lazy load
/>
```

- Indentation proportional to depth.
- Icons: expand caret, optional item icon.
- Full keyboard spec (Phase 05).

### D05. VirtualList (new)

```tsx
<VirtualList<T>
  items
  itemHeight={number | (index) => number}
  estimatedItemHeight
  overscan={3}
  horizontal
  renderItem={(item, index, style) => ReactNode}
  onEndReached={() => void}
/>
```

- Windowing for 10k+ items.
- Fixed or variable height.
- Smooth scroll-to-index API.

### D06. VirtualGrid (new)

2D virtualization (rows × columns). Used internally by DataGrid for very large datasets.

### D07. InfiniteScroll (new)

```tsx
<InfiniteScroll
  hasMore loading onLoadMore
  loader={<Spinner />}
  threshold={0.8}
  scrollParent={ref | null}
/>
```

- Intersection observer + throttle.

---

## Trees & Lists

### D08. List (upgrade)

Semantic `<ul>`-based list with Voidframe styling.

```tsx
<List>
  <List.Item leading={<Icon />} trailing={<Badge />}>Item</List.Item>
</List>
```

### D09. DataList (new — alternative to Table for key-value rows)

```tsx
<DataList>
  <DataList.Item label="NAME" value="Alice" />
  <DataList.Item label="EMAIL" value="alice@void.dev" />
</DataList>
```

- Similar to KeyValue but scaled for longer lists with consistent alignment.

### D10. DescriptionList (new)

Semantic `<dl>` wrapper.

```tsx
<DescriptionList>
  <DescriptionList.Term>Name</DescriptionList.Term>
  <DescriptionList.Description>Alice</DescriptionList.Description>
</DescriptionList>
```

### D11. KeyValue (upgrade)

Existing component, styled inline key-value pair.

---

## Stats & Metrics

### D12. Stat (upgrade)

```tsx
<Stat
  label="REVENUE"
  value="$42.3K"
  change={+12.5}              // delta in percent
  changeDirection="up" | "down"
  tone="success" | "danger"
  icon
  trend={[...]}               // inline sparkline
  loading
/>
```

### D13. StatGroup (new)

Horizontal row of stats with dividers.

### D14. MetricCard (new)

Expanded stat card with sparkline, trend, and sublabel.

```tsx
<MetricCard
  title="Active Users"
  value={12456}
  delta={{ value: 8.2, direction: "up" }}
  sparkline={[...]}
  subtitle="vs. last week"
  icon
/>
```

### D15. Progress (upgrade)

Linear progress bar.

```tsx
<Progress value={50} max={100} variant="determinate" | "indeterminate" label tone="success" size />
```

### D16. CircularProgress (new)

```tsx
<CircularProgress value size stroke showLabel />
```

### D17. SegmentedProgress (upgrade — SegmentBar)

Stacked segments representing phases or categories.

```tsx
<SegmentedProgress segments={[
  { value: 30, label: "DONE", tone: "success" },
  { value: 20, label: "IN PROGRESS", tone: "warning" },
  { value: 50, label: "TODO", tone: "neutral" },
]} total={100} />
```

### D18. Gauge (new)

Radial gauge for 0-100 metrics with zones.

```tsx
<Gauge value={72} min={0} max={100} zones={[
  { from: 0, to: 50, tone: "success" },
  { from: 50, to: 80, tone: "warning" },
  { from: 80, to: 100, tone: "danger" },
]} />
```

---

## Visualization Primitives

### D19. Sparkline (new)

```tsx
<Sparkline data={number[]} width={100} height={20} stroke showArea showPoints showTrend />
```

- SVG polyline. Optional area fill, endpoints, trend indicator.

### D20. Heatmap (new)

```tsx
<Heatmap
  data={{ x, y, value }[]}
  rows={string[]} columns={string[]}
  colorScale={(v) => string}
  cellSize
  onCellClick
/>
```

- Matrix visualization. Tooltip on hover.

### D21. TrendIndicator (new)

```tsx
<TrendIndicator value={+12.5} showArrow format="percent" />
```

- Up/down arrow + colored value.

### D22. ChartContainer (new)

Wrapper for integrating external chart libs (Recharts/Visx/D3) with consistent sizing, aspect, title, legend, tooltip styling.

```tsx
<ChartContainer title="Revenue" height={300} legend>
  <LineChart data={...} />
</ChartContainer>
```

- We **don't** ship a full chart engine. We ship the wrapper and styling guidance.

---

## Viewers

### D23. CodeBlock (new)

```tsx
<CodeBlock
  code
  language="typescript"
  theme="void-dark"
  lineNumbers highlightLines={[3, 5-7]}
  copyable
  fileName
  maxHeight
/>
```

- Syntax highlighting via `shiki` (build-time) or `prismjs` / `highlight.js` (runtime — peer dep).
- Copy button.

### D24. JSONViewer (new)

```tsx
<JSONViewer
  data={unknown}
  defaultExpanded={depth | boolean}
  collapsible keySort
  showDataTypes
  onSelect={(path) => void}
/>
```

- Expandable/collapsible tree.
- Type-aware coloring (string/number/bool/null).

### D25. DiffViewer (new)

```tsx
<DiffViewer
  oldValue newValue
  variant="unified" | "split"
  language
  showLineNumbers
/>
```

- Character-level diff highlighting.
- Uses `diff` lib for computation.

### D26. LogViewer (new)

Monospace scrollable log output.

```tsx
<LogViewer
  entries={LogEntry[]}                    // { timestamp, level, message, source? }
  level="info" | "warn" | "error" | "debug"
  filter={(entry) => boolean}
  autoScroll
  highlight={regex}
  onEntryClick
/>
```

- Color-coded by level.
- Auto-scroll pauses on user scroll.
- Search + filter bar.

### D27. Terminal (new — for command output display)

```tsx
<Terminal
  lines={string[] | ReactNode[]}
  prompt="$"
  onCommand={(cmd) => void}
  history
  autoFocus
  cursor="block" | "underline" | "bar"
/>
```

- Mimics terminal emulator (visual only; doesn't run commands).
- Cursor blink; supports ANSI color escape codes if pre-parsed.

### D28. MarkdownRenderer (new)

```tsx
<MarkdownRenderer
  content={string}
  plugins
  components={{ h1: MyH1, code: MyCode }}
  linkTarget
/>
```

- Renders markdown with Voidframe styling.
- Code blocks use `<CodeBlock>`.
- Built on `react-markdown` (peer dep).

---

## Calendars & Timelines

### D29. Calendar (new)

Full-view calendar for date display (not a picker — see DatePicker).

```tsx
<Calendar
  value={Date[]}                           // highlighted dates
  view="month" | "week" | "day"
  events={{ date, label, tone? }[]}
  onViewChange onRangeChange
  firstDayOfWeek
  showWeekNumbers
/>
```

### D30. Timeline (upgrade)

```tsx
<Timeline orientation="vertical" | "horizontal">
  <Timeline.Item time="2026-03-01" icon tone="success" title description>
  </Timeline.Item>
</Timeline>
```

### D31. Gantt (new — minimal)

```tsx
<Gantt
  tasks={{ id, name, start, end, dependencies? }[]}
  start end
  granularity="day" | "week" | "month"
  onTaskClick onTaskUpdate
/>
```

- Simple bar-on-timeline view. Not a full project-management grid.

### D32. Activity / ActivityFeed (new)

```tsx
<Activity>
  <Activity.Item actor="Alice" action="pushed" target="main" time={...} />
  <Activity.Item actor="Bob" action="commented" preview="..." time={...} />
</Activity>
```

- Chronological list of events with avatars, actions, and relative timestamps.

---

## Chips & Badges

### D33. Badge (upgrade)

```tsx
<Badge variant="solid" | "outline" | "subtle" tone size dot icon onClick>Label</Badge>
```

### D34. Tag (upgrade)

Similar to Badge; removable via X button.

```tsx
<Tag onRemove={() => ...}>label</Tag>
```

### D35. Dots (upgrade)

Status dots (existing).

### D36. StatusIndicator (new)

```tsx
<StatusIndicator status="online" | "offline" | "away" | "busy" | "loading" label />
```

- Animated dot + label. For presence indicators.

---

## Avatars

### D37. Avatar (upgrade)

```tsx
<Avatar src name fallback="AB" size status="online" square />
```

- Falls back to initials if image fails.
- Optional status dot.

### D38. AvatarGroup (upgrade)

```tsx
<AvatarGroup max={3} size>
  {users.map(u => <Avatar ... />)}
</AvatarGroup>
```

- Overlapping avatars with "+N" counter.

---

## Additional

### D39. EmptyState (upgrade)

```tsx
<EmptyState icon title description action={<Button>Create</Button>} />
```

### D40. Skeleton (upgrade)

```tsx
<Skeleton width height shape="rect" | "circle" | "text" animation="pulse" | "shimmer" />
```

### D41. Tooltip (upgrade → see Phase 10 for overlay spec)

### D42. KanbanBoard (new)

```tsx
<Kanban
  columns={[{ id, title, wip? }]}
  items={[{ id, columnId, ... }]}
  onItemMove={({ itemId, fromColumn, toColumn, toIndex }) => void}
  renderItem={(item) => ReactNode}
  renderColumnHeader
  readOnly
/>
```

- Drag-drop with keyboard alternative.
- WIP limits highlight.

---

## Acceptance Criteria

- [ ] All 42 data-display components implemented.
- [ ] DataGrid supports all listed features.
- [ ] VirtualList handles 10k+ items at 60fps.
- [ ] TreeView handles 1000+ nodes.
- [ ] CodeBlock highlights major languages cleanly.
- [ ] JSONViewer handles deeply nested (10+ levels) data.
- [ ] LogViewer streams 1000s of lines without jank.
- [ ] Kanban supports keyboard drag.
- [ ] All pass axe audit.
- [ ] Demo updated with data-heavy examples.
