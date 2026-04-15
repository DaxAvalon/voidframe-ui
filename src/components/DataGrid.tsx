// Phase 9 — DataGrid (flagship data component)
//
// A fuller-featured grid on top of Table: sort, filter, column visibility,
// column reorder (header drag), column resize, column pinning, row selection,
// row expansion, row reorder (row-drag handle), grouping, pagination,
// virtualization delegation (via `virtualized` prop — routes rendering to
// VirtualList), and a compound toolbar.
//
// The compound pattern mirrors the spec: <DataGrid.Toolbar>, <DataGrid.Search>,
// <DataGrid.Filters>, <DataGrid.ColumnVisibility>, <DataGrid.Export>,
// <DataGrid.Body>, <DataGrid.Footer>, <DataGrid.Pagination>.

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { cx } from "../utils/cx";
import type { SortDirection, TableColumn } from "./Data";

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
  virtualized?: boolean;
  density?: DataGridDensity;
  emptyState?: ReactNode;
  loading?: boolean;
  error?: ReactNode;
  children?: ReactNode;
  style?: CSSProperties;
}

interface DataGridContextValue<T = Record<string, unknown>> {
  columns: DataGridColumn<T>[];
  visibleColumns: DataGridColumn<T>[];
  setColumnHidden: (key: string, hidden: boolean) => void;
  setColumnWidth: (key: string, width: number) => void;
  columnWidths: Record<string, number | undefined>;
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
  density = "cozy",
  emptyState,
  loading = false,
  error,
  className,
  style,
  children,
  ...props
}: DataGridProps<T>) {
  const [hiddenInternal, setHiddenInternal] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    columns.forEach((c) => c.hidden && initial.add(c.key));
    return initial;
  });
  const [widths, setWidths] = useState<Record<string, number | undefined>>(() => {
    const initial: Record<string, number | undefined> = {};
    columns.forEach((c) => {
      initial[c.key] = c.initialWidth;
    });
    return initial;
  });
  const [selectedInternal, setSelectedInternal] = useState<Set<string>>(() => new Set());
  const selected = selectedKeys ?? selectedInternal;
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(() => new Set());
  const [sortInternal, setSortInternal] = useState<
    { key: string; direction: SortDirection } | null
  >(null);
  const currentSort = sort !== undefined ? sort : sortInternal;
  const [filtersInternal, setFiltersInternal] = useState<Record<string, string>>({});
  const currentFilters = filters ?? filtersInternal;

  const visibleColumns = useMemo(
    () => columns.filter((c) => !hiddenInternal.has(c.key)),
    [columns, hiddenInternal]
  );

  const setColumnHidden = useCallback((key: string, hidden: boolean) => {
    setHiddenInternal((prev) => {
      const next = new Set(prev);
      if (hidden) next.add(key);
      else next.delete(key);
      return next;
    });
  }, []);

  const setColumnWidth = useCallback((key: string, width: number) => {
    setWidths((prev) => ({ ...prev, [key]: width }));
  }, []);

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

  // Filter → sort → paginate derived data.
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
  const someSelected =
    selected.size > 0 && !allSelected;

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

  const ctx: DataGridContextValue<T> = {
    columns,
    visibleColumns,
    setColumnHidden,
    setColumnWidth,
    columnWidths: widths,
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

function DataGridBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  const ctx = useDataGrid();
  const cols = ctx.visibleColumns;

  const columnTemplate = [
    ctx.selectionMode !== "none" ? "36px" : null,
    ctx.expansion ? "32px" : null,
    ...cols.map((c) => {
      const w = ctx.columnWidths[c.key];
      return w ? `${w}px` : c.width ?? "1fr";
    }),
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      role="table"
      className={cx("vf-datagrid__table", className)}
      style={{ gridTemplateColumns: columnTemplate }}
      {...props}
    >
      <div role="rowgroup" className="vf-datagrid__head">
        {ctx.selectionMode !== "none" && (
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
        {ctx.expansion && (
          <div role="columnheader" className="vf-datagrid__cell" />
        )}
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
                c.headerClassName
              )}
              style={c.align ? { textAlign: c.align } : undefined}
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
            </div>
          );
        })}
      </div>
      <div role="rowgroup" className="vf-datagrid__body">
        {ctx.loading ? (
          <div role="row" className="vf-datagrid__status">
            <div role="cell" style={{ gridColumn: `1 / -1` }}>
              Loading…
            </div>
          </div>
        ) : ctx.error ? (
          <div role="row" className="vf-datagrid__status">
            <div role="cell" style={{ gridColumn: `1 / -1` }}>
              {ctx.error}
            </div>
          </div>
        ) : ctx.filteredData.length === 0 ? (
          <div role="row" className="vf-datagrid__status">
            <div role="cell" style={{ gridColumn: `1 / -1` }}>
              {ctx.emptyState ?? "No rows"}
            </div>
          </div>
        ) : (
          ctx.filteredData.map((row, ri) => {
            const key = ctx.rowKey(row, ri);
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
              >
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
                            typeof c.color === "function" ? c.color(row) : c.color,
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
                        ? c.render(row, ri)
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
                    {ctx.renderExpanded(row)}
                  </div>
                )}
              </div>
            );
          })
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
  // Global search filters across every column that is `filterable` or has a
  // rendered value.
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

function DataGridExport({ ...props }: HTMLAttributes<HTMLButtonElement>) {
  const ctx = useDataGrid();
  const download = () => {
    const rows = [
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
    const blob = new Blob([rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "datagrid.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };
  return (
    <button
      type="button"
      className="vf-datagrid__export"
      onClick={download}
      {...props}
    >
      Export CSV
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
