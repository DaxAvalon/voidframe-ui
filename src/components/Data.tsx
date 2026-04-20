"use client";

// Phase 9 — Data core (Table / Stat / Progress upgrades)

import {
  forwardRef,
  useMemo,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { genericForwardRef } from "../utils/forwardRef";
import { cx } from "../utils/cx";
import { Label } from "./Text";

// ── Table ─────────────────────────────────────────────────────

export type TableAlign = "left" | "center" | "right";
export type SortDirection = "asc" | "desc";

export interface TableColumn<T = Record<string, unknown>> {
  key: string;
  header: ReactNode;
  width?: string;
  align?: TableAlign;
  sortable?: boolean;
  /** Pin to the start or end of the grid. */
  sticky?: "left" | "right";
  className?: string;
  headerClassName?: string;
  color?: string | ((row: T) => string);
  bold?: boolean;
  fontSize?: number;
  render?: (row: T, index: number) => ReactNode;
  /** Custom sort function. Defaults to `<` comparison on the keyed field. */
  compare?: (a: T, b: T) => number;
}

export interface TableProps<T = Record<string, unknown>>
  extends Omit<HTMLAttributes<HTMLDivElement>, "onClick"> {
  columns: TableColumn<T>[];
  data: T[];
  striped?: boolean;
  dense?: boolean;
  bordered?: boolean;
  stickyHeader?: boolean;
  /**
   * Below the `md` breakpoint, render rows as stacked cards (column
   * header shown as a label above each value). Default true.
   */
  adaptive?: boolean;
  loading?: boolean;
  emptyState?: ReactNode;
  onRowClick?: (row: T, index: number) => void;
  rowKey?: (row: T, index: number) => string | number;
  /** Initial sort state (uncontrolled). */
  defaultSort?: { key: string; direction: SortDirection };
  /** Controlled sort state. */
  sort?: { key: string; direction: SortDirection } | null;
  onSortChange?: (next: { key: string; direction: SortDirection } | null) => void;
  style?: CSSProperties;
}

type TableRowLookup = Record<string, unknown>;

/**
 * Semantic `<table>` wrapper with voidframe styling. For sortable /
 * virtualised tables use `DataGrid`.
 */
export const Table = genericForwardRef(function Table<T = Record<string, unknown>>(
  {
    columns,
    data,
    striped,
    dense,
    bordered,
    stickyHeader,
    adaptive = true,
    loading,
    emptyState,
    onRowClick,
    rowKey,
    defaultSort,
    sort,
    onSortChange,
    className,
    style,
    ...props
  }: TableProps<T>,
  ref: React.ForwardedRef<HTMLDivElement>
) {
  const [internalSort, setInternalSort] = useState(defaultSort ?? null);
  const current = sort !== undefined ? sort : internalSort;

  const toggleSort = (key: string) => {
    const next =
      !current || current.key !== key
        ? { key, direction: "asc" as SortDirection }
        : current.direction === "asc"
          ? { key, direction: "desc" as SortDirection }
          : null;
    if (sort === undefined) setInternalSort(next);
    onSortChange?.(next);
  };

  const sortedData = useMemo(() => {
    if (!current) return data;
    const col = columns.find((c) => c.key === current.key);
    if (!col) return data;
    const dir = current.direction === "asc" ? 1 : -1;
    const cmp =
      col.compare ??
      ((a: T, b: T): number => {
        const av = (a as TableRowLookup)[col.key];
        const bv = (b as TableRowLookup)[col.key];
        if (av === bv) return 0;
        return (av as number) < (bv as number) ? -1 : 1;
      });
    return [...data].sort((a, b) => cmp(a, b) * dir);
  }, [data, columns, current]);

  return (
    <div
      ref={ref}
      className={cx(
        "vf-table",
        striped && "vf-table--striped",
        dense && "vf-table--dense",
        bordered && "vf-table--bordered",
        stickyHeader && "vf-table--sticky-header",
        adaptive && "vf-table--adaptive",
        className
      )}
      data-adaptive={adaptive ? "true" : undefined}
      style={style}
      {...props}
    >
      <div
        className="vf-table__grid"
        style={{
          gridTemplateColumns: columns.map((c) => c.width ?? "1fr").join(" "),
          minWidth: columns.length * 60,
        }}
        role="table"
      >
        <div
          role="rowgroup"
          className="vf-table__head"
          style={{ display: "contents" }}
        >
          <div role="row" style={{ display: "contents" }}>
          {columns.map((c) => {
            const isSorted = current?.key === c.key;
            return (
              <div
                key={c.key}
                role="columnheader"
                aria-sort={
                  isSorted
                    ? current!.direction === "asc"
                      ? "ascending"
                      : "descending"
                    : c.sortable
                      ? "none"
                      : undefined
                }
                className={cx(
                  "vf-table__header-cell",
                  c.sortable && "vf-table__header-cell--sortable",
                  c.sticky && `vf-table__cell--sticky-${c.sticky}`,
                  c.headerClassName
                )}
                style={c.align ? { textAlign: c.align } : undefined}
                onClick={c.sortable ? () => toggleSort(c.key) : undefined}
              >
                {c.header}
                {c.sortable && (
                  <span aria-hidden="true" className="vf-table__sort-indicator">
                    {isSorted ? (current!.direction === "asc" ? "▲" : "▼") : "▾"}
                  </span>
                )}
              </div>
            );
          })}
          </div>
        </div>
        <div
          role="rowgroup"
          className="vf-table__body"
          style={{ display: "contents" }}
        >
          {loading ? (
            <div className="vf-table__loading" role="row">
              <div role="cell" style={{ gridColumn: `1 / span ${columns.length}` }}>
                Loading…
              </div>
            </div>
          ) : sortedData.length === 0 ? (
            <div role="row" className="vf-table__empty">
              <div role="cell" style={{ gridColumn: `1 / span ${columns.length}` }}>
                {emptyState ?? "No rows"}
              </div>
            </div>
          ) : (
            sortedData.map((row, ri) => {
              const key = rowKey ? rowKey(row, ri) : ri;
              return (
                <div
                  key={key}
                  role="row"
                  className={cx(
                    "vf-table__row",
                    onRowClick && "vf-table__row--clickable",
                    striped && ri % 2 === 1 && "vf-table__row--alt"
                  )}
                  onClick={onRowClick ? () => onRowClick(row, ri) : undefined}
                  style={{ display: "contents" }}
                >
                  {columns.map((c) => {
                    const inline: CSSProperties = {
                      ...(c.color
                        ? {
                            color:
                              typeof c.color === "function" ? c.color(row) : c.color,
                          }
                        : {}),
                      ...(c.fontSize ? { fontSize: c.fontSize } : {}),
                      ...(c.align ? { textAlign: c.align } : {}),
                    };
                    return (
                      <div
                        key={`${key}-${c.key}`}
                        role="cell"
                        className={cx(
                          "vf-table__cell",
                          c.bold && "vf-table__cell--bold",
                          c.sticky && `vf-table__cell--sticky-${c.sticky}`,
                          c.className
                        )}
                        style={inline}
                      >
                        {adaptive && (
                          <span
                            aria-hidden="true"
                            className="vf-table__cell-label"
                          >
                            {c.header}
                          </span>
                        )}
                        <span className="vf-table__cell-value">
                          {c.render
                            ? c.render(row, ri)
                            : ((row as TableRowLookup)[c.key] as ReactNode)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
});
(Table as { displayName?: string }).displayName = "Table";

// ── Stat ──────────────────────────────────────────────────────

export type StatTone = "neutral" | "info" | "success" | "danger" | "warning";

export interface StatProps extends HTMLAttributes<HTMLDivElement> {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  icon?: ReactNode;
  /** Delta in percent. Positive/negative auto-colors unless `tone` is set. */
  change?: number;
  changeDirection?: "up" | "down";
  tone?: StatTone;
  /** Inline trend numbers for a sparkline. */
  trend?: number[];
  loading?: boolean;
  color?: string;
  style?: CSSProperties;
}

/**
 * Single statistic block: label, value, and optional delta / help text.
 */
export const Stat = forwardRef<HTMLDivElement, StatProps>(function Stat(
  {
    label,
    value,
    sub,
    icon,
    change,
    changeDirection,
    tone,
    trend,
    loading,
    color,
    className,
    style,
    ...props
  },
  ref
) {
  const derivedDirection =
    changeDirection ??
    (typeof change === "number" ? (change >= 0 ? "up" : "down") : undefined);
  const derivedTone =
    tone ??
    (typeof change === "number"
      ? change >= 0
        ? "success"
        : "danger"
      : "neutral");
  return (
    <div
      ref={ref}
      className={cx("vf-stat", `vf-stat--${derivedTone}`, className)}
      style={style}
      {...props}
    >
      <div className="vf-stat__head">
        {icon && <span className="vf-stat__icon">{icon}</span>}
        <Label>{label}</Label>
      </div>
      <div className="vf-stat__value" style={color ? { color } : undefined}>
        {loading ? <span className="vf-stat__loading">…</span> : value}
      </div>
      {typeof change === "number" && !loading && (
        <div className={cx("vf-stat__change", `vf-stat__change--${derivedTone}`)}>
          {derivedDirection === "up" ? "↑" : "↓"} {Math.abs(change).toFixed(1)}%
        </div>
      )}
      {trend && trend.length > 1 && (
        <MiniTrend data={trend} tone={derivedTone} />
      )}
      {sub && <div className="vf-stat__sub">{sub}</div>}
    </div>
  );
});
Stat.displayName = "Stat";

function MiniTrend({ data, tone }: { data: number[]; tone: StatTone }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data
    .map((v, i) => `${(i / (data.length - 1)) * 100},${100 - ((v - min) / range) * 100}`)
    .join(" ");
  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className={cx("vf-stat__trend", `vf-stat__trend--${tone}`)}
      aria-hidden="true"
    >
      <polyline points={pts} fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

// ── Progress ──────────────────────────────────────────────────

export type ProgressVariant = "determinate" | "indeterminate";
export type ProgressTone = "neutral" | "info" | "success" | "danger" | "warning";

export interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  color?: string;
  label?: ReactNode;
  showValue?: boolean;
  height?: number;
  variant?: ProgressVariant;
  tone?: ProgressTone;
  size?: "sm" | "md" | "lg";
  style?: CSSProperties;
}

/**
 * Linear progress bar. Determinate (`value`) or indeterminate. Tones mirror
 * status palette.
 */
export const Progress = forwardRef<HTMLDivElement, ProgressProps>(function Progress(
  {
    value = 0,
    max = 100,
    color,
    label,
    showValue,
    height,
    variant = "determinate",
    tone = "neutral",
    size = "md",
    className,
    style,
    ...props
  },
  ref
) {
  const pct =
    variant === "indeterminate" ? 0 : Math.min((value / max) * 100, 100);
  const composedStyle: CSSProperties = {
    ...(color ? ({ "--vf-accent": color } as CSSProperties) : {}),
    ...(height !== undefined
      ? ({ "--vf-progress-height": `${height}px` } as CSSProperties)
      : {}),
    ...style,
  };
  return (
    <div
      ref={ref}
      className={cx(
        "vf-progress",
        `vf-progress--${size}`,
        `vf-progress--${tone}`,
        `vf-progress--${variant}`,
        className
      )}
      style={composedStyle}
      role="progressbar"
      aria-valuenow={variant === "indeterminate" ? undefined : value}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={typeof label === "string" ? label : undefined}
      {...props}
    >
      {(label || showValue) && variant === "determinate" && (
        <div className="vf-progress__head">
          {label && <Label>{label}</Label>}
          {showValue && (
            <Label style={{ color: "var(--vf-accent, var(--vf-green))" }}>
              {Math.round(pct)}%
            </Label>
          )}
        </div>
      )}
      <div className="vf-progress__track">
        <div
          className="vf-progress__fill"
          style={variant === "determinate" ? { width: `${pct}%` } : undefined}
          data-empty={pct === 0 && variant === "determinate" ? "true" : undefined}
          data-full={pct >= 100 ? "true" : undefined}
        />
      </div>
    </div>
  );
});
Progress.displayName = "Progress";
