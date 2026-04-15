"use client";

// Phase 9 — DataGrid (flagship data component)
//
// Features: sort, filter, column visibility, column reorder (header drag),
// column resize (border drag), column pinning, row selection (single/multi),
// row expansion, row reorder (drag handle column), row grouping with
// collapsible group headers, pagination, virtualized delegation, compound
// toolbar, localStorage persistence of widths/visibility/order, and CSV /
// JSON / clipboard export.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { cx } from "../utils/cx";
import type { SortDirection, TableColumn } from "./Data";
import { VirtualList } from "./Virtualization";

export type RowSelectionMode = "none" | "single" | "multi";
export type DataGridDensity = "compact" | "cozy" | "comfy";

export interface DataGridColumn<T = Record<string, unknown>> extends TableColumn<T> {
  filterable?: boolean;
  hidden?: boolean;
  /** Fixed, initial width in px. */
  initialWidth?: number;
  /** Allow the user to drag the border to resize. */
  resizable?: boolean;
  /** Allow drag-reorder of this column's header. */
  reorderable?: boolean;
  pin?: "left" | "right";
}

export interface DataGridRowReorderEvent {
  fromIndex: number;
  toIndex: number;
}

export interface DataGridColumnReorderEvent {
  from: string;
  to: string;
  nextOrder: string[];
}

export interface DataGridProps<T = Record<string, unknown>>
  extends Omit<HTMLAttributes<HTMLDivElement>, "onSelect"> {
  columns: DataGridColumn<T>[];
  data: T[];
  totalCount?: number;
  rowKey: (row: T, index: number) => string;
  rowSelection?: RowSelectionMode;
  selectedKeys?: Set<string>;
  onSelectionChange?: (next: Set<string>) => void;
  rowExpansion?: boolean;
  renderExpanded?: (row: T) => ReactNode;
  sort?: { key: string; direction: SortDirection } | null;
  onSortChange?: (next: { key: string; direction: SortDirection } | null) => void;
  filters?: Record<string, string>;
  onFiltersChange?: (next: Record<string, string>) => void;
  groupBy?: string;
  onGroupByChange?: (key: string | undefined) => void;
  pagination?: { pageSize: number; page: number; onPageChange: (p: number) => void };
  /** When true, delegates body rendering to a VirtualList. Requires `virtualRowHeight`. */
  virtualized?: boolean;
  virtualRowHeight?: number;
  virtualHeight?: number;
  density?: DataGridDensity;
  emptyState?: ReactNode;
  loading?: boolean;
  error?: ReactNode;
  /** Drag to reorder rows. Emits a pair of indices (within the filtered view). */
  onRowReorder?: (event: DataGridRowReorderEvent) => void;
  /** Drag header to reorder columns. */
  onColumnReorder?: (event: DataGridColumnReorderEvent) => void;
  onColumnResize?: (key: string, width: number) => void;
  /** When set, column widths / visibility / order persist to localStorage under this key. */
  persistKey?: string;
  children?: ReactNode;
  style?: CSSProperties;
}

interface PersistedState {
  widths: Record<string, number | undefined>;
  hidden: string[];
  order: string[];
}

function readPersisted(key: string): Partial<PersistedState> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(`vf-datagrid:${key}`);
    if (!raw) return null;
    return JSON.parse(raw) as Partial<PersistedState>;
  } catch {
    return null;
  }
}

function writePersisted(key: string, state: PersistedState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(`vf-datagrid:${key}`, JSON.stringify(state));
  } catch {
    /* noop */
  }
}

interface DataGridContextValue<T = Record<string, unknown>> {
  columns: DataGridColumn<T>[];
  visibleColumns: DataGridColumn<T>[];
  setColumnHidden: (key: string, hidden: boolean) => void;
  setColumnWidth: (key: string, width: number) => void;
  columnWidths: Record<string, number | undefined>;
  reorderColumn: (from: string, to: string) => void;
  rawData: T[];
  filteredData: T[];
  rowKey: (row: T, index: number) => string;
  selected: Set<string>;
  toggleRow: (key: string) => void;
  toggleAll: () => void;
  allSelected: boolean;
  someSelected: boolean;
  selectionMode: RowSelectionMode;
  expansion: boolean;
  expandedKeys: Set<string>;
  toggleExpand: (key: string) => void;
  renderExpanded?: (row: T) => ReactNode;
  sort: { key: string; direction: SortDirection } | null;
  setSort: (next: { key: string; direction: SortDirection } | null) => void;
  filters: Record<string, string>;
  setFilter: (key: string, value: string) => void;
  density: DataGridDensity;
  loading: boolean;
  emptyState?: ReactNode;
  error?: ReactNode;
  groupBy?: string;
  collapsedGroups: Set<string>;
  toggleGroup: (key: string) => void;
  rowReorder: boolean;
  reorderRow: (from: number, to: number) => void;
  virtualized: boolean;
  virtualRowHeight?: number;
  virtualHeight?: number;
  pagination?: DataGridProps["pagination"];
}

const DataGridContext = createContext<DataGridContextValue | null>(null);
function useDataGrid<T = Record<string, unknown>>(): DataGridContextValue<T> {
  const ctx = useContext(DataGridContext) as DataGridContextValue<T> | null;
  if (!ctx) throw new Error("DataGrid.* must be inside <DataGrid>");
  return ctx;
}

// ── Root ─────────────────────────────────────────────────────

function DataGridRoot<T = Record<string, unknown>>({
  columns,
  data,
  rowKey,
  rowSelection = "none",
  selectedKeys,
  onSelectionChange,
  rowExpansion = false,
  renderExpanded,
  sort,
  onSortChange,
  filters,
  onFiltersChange,
  groupBy,
  pagination,
  virtualized = false,
  virtualRowHeight,
  virtualHeight,
  density = "cozy",
  emptyState,
  loading = false,
  error,
  onRowReorder,
  onColumnReorder,
  onColumnResize,
  persistKey,
  className,
  style,
  children,
  ...props
}: DataGridProps<T>) {
  const persisted = useMemo(
    () => (persistKey ? readPersisted(persistKey) : null),
    [persistKey]
  );

  const [hiddenInternal, setHiddenInternal] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    columns.forEach((c) => c.hidden && initial.add(c.key));
    if (persisted?.hidden) for (const k of persisted.hidden) initial.add(k);
    return initial;
  });
  const [widths, setWidths] = useState<Record<string, number | undefined>>(() => {
    const initial: Record<string, number | undefined> = {};
    columns.forEach((c) => {
      initial[c.key] = c.initialWidth;
    });
    if (persisted?.widths) Object.assign(initial, persisted.widths);
    return initial;
  });
  const [order, setOrder] = useState<string[]>(() => {
    if (persisted?.order && persisted.order.length === columns.length) {
      // Only honor persisted order if it covers the same key set.
      const keySet = new Set(columns.map((c) => c.key));
      if (persisted.order.every((k) => keySet.has(k))) return persisted.order;
    }
    return columns.map((c) => c.key);
  });

  useEffect(() => {
    if (!persistKey) return;
    writePersisted(persistKey, {
      widths,
      hidden: [...hiddenInternal],
      order,
    });
  }, [persistKey, widths, hiddenInternal, order]);

  const [selectedInternal, setSelectedInternal] = useState<Set<string>>(() => new Set());
  const selected = selectedKeys ?? selectedInternal;
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(() => new Set());
  const [sortInternal, setSortInternal] = useState<
    { key: string; direction: SortDirection } | null
  >(null);
  const currentSort = sort !== undefined ? sort : sortInternal;
  const [filtersInternal, setFiltersInternal] = useState<Record<string, string>>({});
  const currentFilters = filters ?? filtersInternal;
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(() => new Set());

  // Column order resolution — re-sort the source columns to match `order`.
  const columnsInOrder = useMemo(() => {
    const byKey = new Map(columns.map((c) => [c.key, c] as const));
    const out: DataGridColumn<T>[] = [];
    for (const key of order) {
      const col = byKey.get(key);
      if (col) out.push(col);
    }
    // Append any columns that weren't in `order` (props may have added new).
    for (const col of columns) {
      if (!order.includes(col.key)) out.push(col);
    }
    return out;
  }, [columns, order]);

  const visibleColumns = useMemo(
    () => columnsInOrder.filter((c) => !hiddenInternal.has(c.key)),
    [columnsInOrder, hiddenInternal]
  );

  const setColumnHidden = useCallback((key: string, hidden: boolean) => {
    setHiddenInternal((prev) => {
      const next = new Set(prev);
      if (hidden) next.add(key);
      else next.delete(key);
      return next;
    });
  }, []);

  const setColumnWidth = useCallback(
    (key: string, width: number) => {
      setWidths((prev) => ({ ...prev, [key]: width }));
      onColumnResize?.(key, width);
    },
    [onColumnResize]
  );

  const reorderColumn = useCallback(
    (from: string, to: string) => {
      if (from === to) return;
      setOrder((prev) => {
        const next = [...prev];
        const fromIdx = next.indexOf(from);
        const toIdx = next.indexOf(to);
        if (fromIdx < 0 || toIdx < 0) return prev;
        next.splice(fromIdx, 1);
        next.splice(toIdx, 0, from);
        onColumnReorder?.({ from, to, nextOrder: next });
        return next;
      });
    },
    [onColumnReorder]
  );

  const setSort = useCallback(
    (next: { key: string; direction: SortDirection } | null) => {
      if (sort === undefined) setSortInternal(next);
      onSortChange?.(next);
    },
    [sort, onSortChange]
  );

  const setFilter = useCallback(
    (key: string, value: string) => {
      const nextFilters = { ...currentFilters, [key]: value };
      if (!value) delete nextFilters[key];
      if (filters === undefined) setFiltersInternal(nextFilters);
      onFiltersChange?.(nextFilters);
    },
    [filters, onFiltersChange, currentFilters]
  );

  const toggleGroup = useCallback((key: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  // Filter → sort → paginate.
  const filteredData = useMemo(() => {
    let rows = data;
    for (const [key, query] of Object.entries(currentFilters)) {
      if (!query) continue;
      const q = query.toLowerCase();
      rows = rows.filter((row) => {
        const v = (row as Record<string, unknown>)[key];
        return String(v ?? "").toLowerCase().includes(q);
      });
    }
    if (currentSort) {
      const col = columns.find((c) => c.key === currentSort.key);
      if (col) {
        const dir = currentSort.direction === "asc" ? 1 : -1;
        const cmp =
          col.compare ??
          ((a: T, b: T): number => {
            const av = (a as Record<string, unknown>)[col.key];
            const bv = (b as Record<string, unknown>)[col.key];
            if (av === bv) return 0;
            return (av as number) < (bv as number) ? -1 : 1;
          });
        rows = [...rows].sort((a, b) => cmp(a, b) * dir);
      }
    }
    if (pagination) {
      const start = (pagination.page - 1) * pagination.pageSize;
      rows = rows.slice(start, start + pagination.pageSize);
    }
    return rows;
  }, [data, currentFilters, currentSort, columns, pagination]);

  const allRowKeys = useMemo(
    () => new Set(filteredData.map((row, i) => rowKey(row, i))),
    [filteredData, rowKey]
  );
  const allSelected =
    selected.size > 0 && [...allRowKeys].every((k) => selected.has(k));
  const someSelected = selected.size > 0 && !allSelected;

  const toggleRow = useCallback(
    (key: string) => {
      if (rowSelection === "none") return;
      const next = new Set(rowSelection === "single" ? [] : selected);
      if (selected.has(key)) {
        next.delete(key);
      } else {
        if (rowSelection === "single") next.clear();
        next.add(key);
      }
      if (selectedKeys === undefined) setSelectedInternal(next);
      onSelectionChange?.(next);
    },
    [selected, rowSelection, selectedKeys, onSelectionChange]
  );

  const toggleAll = useCallback(() => {
    if (rowSelection !== "multi") return;
    const next = allSelected ? new Set<string>() : new Set(allRowKeys);
    if (selectedKeys === undefined) setSelectedInternal(next);
    onSelectionChange?.(next);
  }, [rowSelection, allSelected, allRowKeys, selectedKeys, onSelectionChange]);

  const toggleExpand = useCallback((key: string) => {
    setExpandedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const reorderRow = useCallback(
    (from: number, to: number) => {
      if (from === to) return;
      onRowReorder?.({ fromIndex: from, toIndex: to });
    },
    [onRowReorder]
  );

  const ctx: DataGridContextValue<T> = {
    columns: columnsInOrder,
    visibleColumns,
    setColumnHidden,
    setColumnWidth,
    columnWidths: widths,
    reorderColumn,
    rawData: data,
    filteredData,
    rowKey,
    selected,
    toggleRow,
    toggleAll,
    allSelected,
    someSelected,
    selectionMode: rowSelection,
    expansion: rowExpansion,
    expandedKeys,
    toggleExpand,
    renderExpanded,
    sort: currentSort,
    setSort,
    filters: currentFilters,
    setFilter,
    density,
    loading,
    emptyState,
    error,
    groupBy,
    collapsedGroups,
    toggleGroup,
    rowReorder: !!onRowReorder,
    reorderRow,
    virtualized,
    virtualRowHeight,
    virtualHeight,
    pagination,
  };

  return (
    <DataGridContext.Provider value={ctx as DataGridContextValue}>
      <div
        className={cx("vf-datagrid", `vf-datagrid--${density}`, className)}
        style={style}
        {...props}
      >
        {children ?? <DataGridBody />}
      </div>
    </DataGridContext.Provider>
  );
}

// ── Body ─────────────────────────────────────────────────────

type FlattenedRow<T> =
  | { type: "group"; key: string; label: string; count: number; collapsed: boolean }
  | { type: "row"; row: T; index: number; key: string };

function flattenForRender<T>(
  rows: T[],
  groupBy: string | undefined,
  rowKey: (row: T, i: number) => string,
  collapsed: Set<string>
): FlattenedRow<T>[] {
  if (!groupBy) {
    return rows.map((row, index) => ({ type: "row", row, index, key: rowKey(row, index) }));
  }
  const out: FlattenedRow<T>[] = [];
  const byGroup = new Map<string, Array<{ row: T; index: number }>>();
  rows.forEach((row, index) => {
    const value = (row as Record<string, unknown>)[groupBy];
    const label = String(value ?? "—");
    const list = byGroup.get(label);
    if (list) list.push({ row, index });
    else byGroup.set(label, [{ row, index }]);
  });
  for (const [label, list] of byGroup) {
    const key = `group::${label}`;
    const isCollapsed = collapsed.has(key);
    out.push({
      type: "group",
      key,
      label,
      count: list.length,
      collapsed: isCollapsed,
    });
    if (isCollapsed) continue;
    for (const entry of list) {
      out.push({
        type: "row",
        row: entry.row,
        index: entry.index,
        key: rowKey(entry.row, entry.index),
      });
    }
  }
  return out;
}

function DataGridBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  const ctx = useDataGrid();
  const cols = ctx.visibleColumns;
  const dragFromRef = useRef<number | null>(null);
  const dragColRef = useRef<string | null>(null);

  const rendered = useMemo(
    () =>
      flattenForRender(
        ctx.filteredData,
        ctx.groupBy,
        ctx.rowKey,
        ctx.collapsedGroups
      ),
    [ctx.filteredData, ctx.groupBy, ctx.rowKey, ctx.collapsedGroups]
  );

  const selectionCol = ctx.selectionMode !== "none";
  const expandCol = ctx.expansion;
  const handleCol = ctx.rowReorder;
  const extraCols =
    (selectionCol ? 1 : 0) + (expandCol ? 1 : 0) + (handleCol ? 1 : 0);

  const columnTemplate = [
    handleCol ? "28px" : null,
    selectionCol ? "36px" : null,
    expandCol ? "32px" : null,
    ...cols.map((c) => {
      const w = ctx.columnWidths[c.key];
      return w ? `${w}px` : c.width ?? "1fr";
    }),
  ]
    .filter(Boolean)
    .join(" ");

  const totalColumns = cols.length + extraCols;

  const handleColumnResize = (key: string) => (e: ReactPointerEvent<HTMLSpanElement>) => {
    e.stopPropagation();
    e.preventDefault();
    const startX = e.clientX;
    const startWidth =
      ctx.columnWidths[key] ??
      (e.currentTarget.parentElement?.getBoundingClientRect().width ?? 100);
    const target = e.currentTarget as HTMLElement;
    try {
      target.setPointerCapture?.(e.pointerId);
    } catch {
      /* unsupported in some environments */
    }
    const onMove = (ev: PointerEvent) => {
      const next = Math.max(40, startWidth + (ev.clientX - startX));
      ctx.setColumnWidth(key, next);
    };
    const onUp = (ev: PointerEvent) => {
      try {
        target.releasePointerCapture?.(ev.pointerId);
      } catch {
        /* noop */
      }
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  const renderRowCells = (row: unknown, ri: number, key: string) => {
    const isSelected = ctx.selected.has(key);
    const isExpanded = ctx.expandedKeys.has(key);
    return (
      <div
        key={key}
        role="row"
        aria-selected={isSelected}
        className={cx(
          "vf-datagrid__row",
          isSelected && "vf-datagrid__row--selected"
        )}
        style={{ display: "contents" }}
        draggable={ctx.rowReorder}
        onDragStart={
          ctx.rowReorder
            ? (e) => {
                dragFromRef.current = ri;
                if (e.dataTransfer) e.dataTransfer.effectAllowed = "move";
              }
            : undefined
        }
        onDragOver={
          ctx.rowReorder
            ? (e) => {
                e.preventDefault();
                if (e.dataTransfer) e.dataTransfer.dropEffect = "move";
              }
            : undefined
        }
        onDrop={
          ctx.rowReorder
            ? (e) => {
                e.preventDefault();
                const from = dragFromRef.current;
                if (from === null) return;
                ctx.reorderRow(from, ri);
                dragFromRef.current = null;
              }
            : undefined
        }
      >
        {ctx.rowReorder && (
          <div role="cell" className="vf-datagrid__cell vf-datagrid__cell--handle">
            <span aria-hidden="true" className="vf-datagrid__drag">⋮⋮</span>
          </div>
        )}
        {ctx.selectionMode !== "none" && (
          <div role="cell" className="vf-datagrid__cell vf-datagrid__cell--selection">
            <input
              type={ctx.selectionMode === "multi" ? "checkbox" : "radio"}
              aria-label={`Select row ${ri + 1}`}
              checked={isSelected}
              onChange={() => ctx.toggleRow(key)}
            />
          </div>
        )}
        {ctx.expansion && (
          <div role="cell" className="vf-datagrid__cell">
            <button
              type="button"
              className="vf-datagrid__expand"
              aria-expanded={isExpanded}
              aria-label={isExpanded ? "Collapse row" : "Expand row"}
              onClick={() => ctx.toggleExpand(key)}
            >
              {isExpanded ? "▾" : "▸"}
            </button>
          </div>
        )}
        {cols.map((c) => {
          const inline: CSSProperties = {
            ...(c.color
              ? {
                  color:
                    typeof c.color === "function"
                      ? c.color(row as never)
                      : c.color,
                }
              : {}),
            ...(c.align ? { textAlign: c.align } : {}),
          };
          return (
            <div
              key={`${key}-${c.key}`}
              role="cell"
              className={cx(
                "vf-datagrid__cell",
                c.pin && `vf-datagrid__cell--pin-${c.pin}`,
                c.className
              )}
              style={inline}
            >
              {c.render
                ? c.render(row as never, ri)
                : ((row as Record<string, unknown>)[c.key] as ReactNode)}
            </div>
          );
        })}
        {isExpanded && ctx.renderExpanded && (
          <div
            role="row"
            className="vf-datagrid__expanded"
            style={{ gridColumn: `1 / -1` }}
          >
            {ctx.renderExpanded(row as never)}
          </div>
        )}
      </div>
    );
  };

  const renderGroupRow = (
    label: string,
    key: string,
    count: number,
    collapsed: boolean
  ) => (
    <div
      key={key}
      role="row"
      className="vf-datagrid__group-row"
      style={{ display: "contents" }}
    >
      <div
        role="cell"
        className="vf-datagrid__group-cell"
        style={{ gridColumn: `1 / -1` }}
      >
        <button
          type="button"
          className="vf-datagrid__group-toggle"
          aria-expanded={!collapsed}
          onClick={() => ctx.toggleGroup(key)}
        >
          {collapsed ? "▸" : "▾"}
        </button>
        <strong>{label}</strong>
        <span className="vf-datagrid__group-count">({count})</span>
      </div>
    </div>
  );

  const headerContent = (
    <div role="rowgroup" className="vf-datagrid__head">
      <div role="row" style={{ display: "contents" }}>
        {handleCol && <div role="columnheader" className="vf-datagrid__cell" />}
        {selectionCol && (
          <div role="columnheader" className="vf-datagrid__cell vf-datagrid__cell--selection">
            {ctx.selectionMode === "multi" && (
              <input
                type="checkbox"
                aria-label="Select all rows"
                checked={ctx.allSelected}
                ref={(el) => {
                  if (el) el.indeterminate = ctx.someSelected;
                }}
                onChange={ctx.toggleAll}
              />
            )}
          </div>
        )}
        {expandCol && <div role="columnheader" className="vf-datagrid__cell" />}
        {cols.map((c) => {
          const isSorted = ctx.sort?.key === c.key;
          return (
            <div
              key={c.key}
              role="columnheader"
              aria-sort={
                isSorted
                  ? ctx.sort!.direction === "asc"
                    ? "ascending"
                    : "descending"
                  : c.sortable
                    ? "none"
                    : undefined
              }
              className={cx(
                "vf-datagrid__cell vf-datagrid__header-cell",
                c.sortable && "vf-datagrid__header-cell--sortable",
                c.pin && `vf-datagrid__cell--pin-${c.pin}`,
                c.reorderable && "vf-datagrid__header-cell--reorderable",
                c.headerClassName
              )}
              style={c.align ? { textAlign: c.align } : undefined}
              draggable={c.reorderable || undefined}
              onDragStart={
                c.reorderable
                  ? (e) => {
                      dragColRef.current = c.key;
                      if (e.dataTransfer) e.dataTransfer.effectAllowed = "move";
                    }
                  : undefined
              }
              onDragOver={
                // Allow dropping on any column when a reorderable column is
                // being dragged.
                dragColRef.current
                  ? (e) => {
                      e.preventDefault();
                      if (e.dataTransfer) e.dataTransfer.dropEffect = "move";
                    }
                  : undefined
              }
              onDrop={(e) => {
                const from = dragColRef.current;
                if (!from) return;
                e.preventDefault();
                if (from !== c.key) ctx.reorderColumn(from, c.key);
                dragColRef.current = null;
              }}
              onClick={
                c.sortable
                  ? () =>
                      ctx.setSort(
                        !isSorted
                          ? { key: c.key, direction: "asc" }
                          : ctx.sort!.direction === "asc"
                            ? { key: c.key, direction: "desc" }
                            : null
                      )
                  : undefined
              }
            >
              {c.header}
              {c.sortable && (
                <span aria-hidden="true" className="vf-datagrid__sort">
                  {isSorted ? (ctx.sort!.direction === "asc" ? "▲" : "▼") : "▾"}
                </span>
              )}
              {c.filterable && (
                <input
                  type="text"
                  aria-label={`Filter ${c.key}`}
                  className="vf-datagrid__filter"
                  value={ctx.filters[c.key] ?? ""}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => ctx.setFilter(c.key, e.target.value)}
                  placeholder="Filter…"
                />
              )}
              {c.resizable && (
                <span
                  role="separator"
                  aria-orientation="vertical"
                  aria-label={`Resize ${c.key}`}
                  className="vf-datagrid__resize-handle"
                  onPointerDown={handleColumnResize(c.key)}
                  onClick={(e) => e.stopPropagation()}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  const statusRow = (content: ReactNode) => (
    <div role="row" className="vf-datagrid__status">
      <div role="cell" style={{ gridColumn: `1 / -1` }}>
        {content}
      </div>
    </div>
  );

  if (ctx.loading) {
    return (
      <div
        role="table"
        className={cx("vf-datagrid__table", className)}
        style={{ gridTemplateColumns: columnTemplate }}
        {...props}
      >
        {headerContent}
        <div role="rowgroup" className="vf-datagrid__body">
          {statusRow("Loading…")}
        </div>
      </div>
    );
  }
  if (ctx.error) {
    return (
      <div
        role="table"
        className={cx("vf-datagrid__table", className)}
        style={{ gridTemplateColumns: columnTemplate }}
        {...props}
      >
        {headerContent}
        <div role="rowgroup" className="vf-datagrid__body">
          {statusRow(ctx.error)}
        </div>
      </div>
    );
  }
  if (rendered.length === 0) {
    return (
      <div
        role="table"
        className={cx("vf-datagrid__table", className)}
        style={{ gridTemplateColumns: columnTemplate }}
        {...props}
      >
        {headerContent}
        <div role="rowgroup" className="vf-datagrid__body">
          {statusRow(ctx.emptyState ?? "No rows")}
        </div>
      </div>
    );
  }

  const virtualHeight = ctx.virtualHeight ?? 400;
  if (ctx.virtualized && ctx.virtualRowHeight && !ctx.groupBy) {
    return (
      <div
        role="table"
        className={cx("vf-datagrid__table", className)}
        style={{ gridTemplateColumns: columnTemplate }}
        {...props}
      >
        {headerContent}
        <div role="rowgroup" className="vf-datagrid__body">
          <VirtualList
            items={rendered}
            itemHeight={ctx.virtualRowHeight}
            style={{ height: virtualHeight, gridColumn: `1 / span ${totalColumns}` }}
            renderItem={(item, _, style) => (
              <div
                key={item.key}
                className="vf-datagrid__virtual-row"
                style={style}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: columnTemplate,
                  }}
                >
                  {item.type === "row"
                    ? renderRowCells(item.row, item.index, item.key)
                    : renderGroupRow(item.label, item.key, item.count, item.collapsed)}
                </div>
              </div>
            )}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      role="table"
      className={cx("vf-datagrid__table", className)}
      style={{ gridTemplateColumns: columnTemplate }}
      {...props}
    >
      {headerContent}
      <div role="rowgroup" className="vf-datagrid__body">
        {rendered.map((item) =>
          item.type === "row"
            ? renderRowCells(item.row, item.index, item.key)
            : renderGroupRow(item.label, item.key, item.count, item.collapsed)
        )}
      </div>
    </div>
  );
}

// ── Toolbar + subparts ────────────────────────────────────────

function DataGridToolbar({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cx("vf-datagrid__toolbar", className)} role="toolbar" {...props} />
  );
}

function DataGridSearch({
  placeholder = "Search",
  ...props
}: HTMLAttributes<HTMLInputElement> & { placeholder?: string }) {
  const ctx = useDataGrid();
  const first = ctx.columns.find((c) => c.filterable) ?? ctx.columns[0];
  if (!first) return null;
  const value = ctx.filters[first.key] ?? "";
  return (
    <input
      type="search"
      className="vf-datagrid__search"
      placeholder={placeholder}
      value={value}
      onChange={(e) => ctx.setFilter(first.key, e.target.value)}
      {...props}
    />
  );
}

function DataGridColumnVisibility({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  const ctx = useDataGrid();
  return (
    <div className={cx("vf-datagrid__col-vis", className)} role="group" {...props}>
      {ctx.columns.map((c) => {
        const visible = ctx.visibleColumns.some((v) => v.key === c.key);
        return (
          <label key={c.key} className="vf-datagrid__col-vis-item">
            <input
              type="checkbox"
              checked={visible}
              onChange={() => ctx.setColumnHidden(c.key, visible)}
            />
            <span>{c.key}</span>
          </label>
        );
      })}
    </div>
  );
}

function DataGridFilters({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  const ctx = useDataGrid();
  const filterable = ctx.columns.filter((c) => c.filterable);
  if (filterable.length === 0) return null;
  return (
    <div className={cx("vf-datagrid__filters", className)} role="group" {...props}>
      {filterable.map((c) => (
        <label key={c.key} className="vf-datagrid__filter-item">
          <span>{c.key}</span>
          <input
            type="text"
            value={ctx.filters[c.key] ?? ""}
            onChange={(e) => ctx.setFilter(c.key, e.target.value)}
          />
        </label>
      ))}
    </div>
  );
}

function DataGridFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cx("vf-datagrid__footer", className)} {...props} />;
}

export type DataGridExportFormat = "csv" | "json" | "clipboard";

export interface DataGridExportProps extends HTMLAttributes<HTMLButtonElement> {
  format?: DataGridExportFormat;
  fileName?: string;
  label?: ReactNode;
}

function DataGridExport({
  format = "csv",
  fileName,
  label,
  ...props
}: DataGridExportProps) {
  const ctx = useDataGrid();
  const buildCsv = (): string => {
    return [
      ctx.visibleColumns.map((c) => c.key).join(","),
      ...ctx.filteredData.map((row) =>
        ctx.visibleColumns
          .map((c) => {
            const raw = (row as Record<string, unknown>)[c.key];
            const s = String(raw ?? "").replace(/"/g, '""');
            return `"${s}"`;
          })
          .join(",")
      ),
    ].join("\n");
  };
  const buildJson = (): string => {
    const keys = ctx.visibleColumns.map((c) => c.key);
    return JSON.stringify(
      ctx.filteredData.map((row) => {
        const out: Record<string, unknown> = {};
        for (const k of keys) out[k] = (row as Record<string, unknown>)[k];
        return out;
      }),
      null,
      2
    );
  };
  const run = async () => {
    if (format === "clipboard") {
      try {
        await navigator.clipboard.writeText(buildCsv());
      } catch {
        /* noop */
      }
      return;
    }
    const content = format === "json" ? buildJson() : buildCsv();
    const mime = format === "json" ? "application/json" : "text/csv";
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName ?? `datagrid.${format}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };
  return (
    <button
      type="button"
      className="vf-datagrid__export"
      onClick={run}
      {...props}
    >
      {label ?? `Export ${format.toUpperCase()}`}
    </button>
  );
}

function DataGridPagination({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  const ctx = useDataGrid();
  const p = ctx.pagination;
  if (!p) return null;
  const total = Math.max(1, Math.ceil(ctx.filteredData.length / p.pageSize));
  return (
    <div className={cx("vf-datagrid__pagination", className)} {...props}>
      <button
        type="button"
        className="vf-button"
        disabled={p.page <= 1}
        onClick={() => p.onPageChange(p.page - 1)}
      >
        Prev
      </button>
      <span>
        Page {p.page} / {total}
      </span>
      <button
        type="button"
        className="vf-button"
        disabled={p.page >= total}
        onClick={() => p.onPageChange(p.page + 1)}
      >
        Next
      </button>
    </div>
  );
}

// ── Compound export ──────────────────────────────────────────

export const DataGrid = Object.assign(DataGridRoot, {
  Body: DataGridBody,
  Toolbar: DataGridToolbar,
  Search: DataGridSearch,
  Filters: DataGridFilters,
  ColumnVisibility: DataGridColumnVisibility,
  Export: DataGridExport,
  Footer: DataGridFooter,
  Pagination: DataGridPagination,
});
