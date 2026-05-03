"use client";

// Phase 9 — TreeTable
//
// Table with hierarchical rows. Each row may have children exposed via
// `getChildren(row) => T[]`. A caret column handles expand/collapse. The
// first data column is indented proportional to depth.

import {
  useCallback,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { cx } from "../utils/cx";
import { itemKeyAttrs } from "../hooks/useItemKey";
import type { TableColumn } from "./Data";
import { genericForwardRef } from "../utils/forwardRef";

export interface TreeTableProps<T = Record<string, unknown>>
  extends Omit<HTMLAttributes<HTMLDivElement>, "onClick"> {
  columns: TableColumn<T>[];
  data: T[];
  getChildren: (row: T) => T[] | undefined;
  rowKey: (row: T) => string;
  defaultExpanded?: string[];
  onRowClick?: (row: T) => void;
  /**
   * Return arbitrary HTML attributes for each rendered row. Mirrors
   * `Table.rowAttributes` / `DataGrid.rowAttributes`.
   */
  rowAttributes?: (row: T, depth: number) => HTMLAttributes<HTMLDivElement>;
  style?: CSSProperties;
}

/**
 * Data table with expandable tree rows. Combines `DataGrid`'s
 * sorting/filtering with hierarchical grouping.
 */
export const TreeTable = genericForwardRef(function TreeTable<
  T = Record<string, unknown>,
>(
  {
    columns,
    data,
    getChildren,
    rowKey,
    defaultExpanded = [],
    onRowClick,
    rowAttributes,
    className,
    style,
    ...props
  }: TreeTableProps<T>,
  ref: React.ForwardedRef<HTMLDivElement>
) {
  const [expanded, setExpanded] = useState<Set<string>>(
    () => new Set(defaultExpanded)
  );
  const toggle = useCallback((key: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const flat: Array<{ row: T; depth: number; hasChildren: boolean }> = [];
  const walk = (rows: T[], depth: number) => {
    for (const row of rows) {
      const children = getChildren(row);
      const hasChildren = !!children && children.length > 0;
      flat.push({ row, depth, hasChildren });
      if (hasChildren && expanded.has(rowKey(row))) {
        walk(children!, depth + 1);
      }
    }
  };
  walk(data, 0);

  const columnTemplate =
    ["28px", ...columns.map((c) => c.width ?? "1fr")].join(" ");

  return (
    <div
      ref={ref}
      className={cx("vf-tree-table", "vf-table", className)}
      style={style}
      {...props}
    >
      <div
        role="treegrid"
        className="vf-table__grid vf-tree-table__grid"
        style={{ gridTemplateColumns: columnTemplate }}
      >
        <div role="row" className="vf-table__head" style={{ display: "contents" }}>
          <div role="columnheader" className="vf-table__header-cell" />
          {columns.map((c) => (
            <div
              key={c.key}
              role="columnheader"
              className={cx("vf-table__header-cell", c.headerClassName)}
              style={c.align ? { textAlign: c.align } : undefined}
            >
              {c.header}
            </div>
          ))}
        </div>
        {flat.map(({ row, depth, hasChildren }, i) => {
          const key = rowKey(row);
          const isExpanded = expanded.has(key);
          return (
            <div
              key={key}
              role="row"
              aria-level={depth + 1}
              aria-expanded={hasChildren ? isExpanded : undefined}
              className="vf-tree-table__row"
              {...itemKeyAttrs("row", String(key))}
              style={{ display: "contents" }}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              {...(rowAttributes?.(row, depth) ?? {})}
            >
              <div role="cell" className="vf-table__cell vf-tree-table__caret">
                {hasChildren ? (
                  <button
                    type="button"
                    className="vf-tree-table__disclosure"
                    aria-label={isExpanded ? "Collapse" : "Expand"}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggle(key);
                    }}
                  >
                    {isExpanded ? "▾" : "▸"}
                  </button>
                ) : null}
              </div>
              {columns.map((c, ci) => {
                const inline: CSSProperties = {
                  ...(ci === 0
                    ? { paddingInlineStart: `${8 + depth * 16}px` }
                    : {}),
                  ...(c.align ? { textAlign: c.align } : {}),
                };
                return (
                  <div
                    key={`${key}-${c.key}-${i}`}
                    role="cell"
                    className={cx("vf-table__cell", c.className)}
                    style={inline}
                  >
                    {c.render
                      ? c.render(row, i)
                      : ((row as Record<string, unknown>)[c.key] as ReactNode)}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
});
(TreeTable as { displayName?: string }).displayName = "TreeTable";
