"use client";

// Phase 9 — Kanban
//
// Column-based board with drag-drop card moves. Keeps the DnD logic plain
// HTML5 drag-and-drop (no external dep). A keyboard alternative lets users
// move the focused card with `Ctrl+ArrowLeft/Right` to adjacent columns.

import {
  forwardRef,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { cx } from "../utils/cx";
import { Label } from "./Text";

export interface KanbanColumn {
  id: string;
  title: ReactNode;
  wip?: number;
}

export interface KanbanItem {
  id: string;
  columnId: string;
  [key: string]: unknown;
}

export interface KanbanMoveEvent {
  itemId: string;
  fromColumn: string;
  toColumn: string;
  toIndex: number;
}

export interface KanbanProps extends HTMLAttributes<HTMLDivElement> {
  columns: KanbanColumn[];
  items: KanbanItem[];
  onItemMove?: (event: KanbanMoveEvent) => void;
  renderItem: (item: KanbanItem) => ReactNode;
  renderColumnHeader?: (column: KanbanColumn, count: number) => ReactNode;
  readOnly?: boolean;
  /** Show a search input above the board. */
  searchable?: boolean;
  /** Callback for search input changes. When omitted, client-side filtering is used. */
  onSearch?: (query: string) => void;
  /**
   * Customize which fields contribute to the built-in client-side search
   * filter. Return a list of strings to match against. Defaults to
   * `[title, label]` when they are strings.
   */
  getSearchable?: (item: KanbanItem) => string[];
  style?: CSSProperties;
}

/**
 * A column-based task board that supports dragging items between columns.
 * Emits move events so callers can persist reordering and cross-column transitions.
 */
export const Kanban = forwardRef<HTMLDivElement, KanbanProps>(function Kanban(
  {
    columns,
    items,
    onItemMove,
    renderItem,
    renderColumnHeader,
    readOnly,
    searchable,
    onSearch,
    getSearchable,
    className,
    style,
    ...props
  },
  ref
) {
  const [searchQuery, setSearchQuery] = useState("");
  const dragRef = useRef<{ id: string; fromColumn: string; fromIndex: number } | null>(
    null
  );
  const [dropTarget, setDropTarget] = useState<{
    columnId: string;
    index: number;
  } | null>(null);

  const filteredItems = useMemo(() => {
    if (!searchable || onSearch || !searchQuery) return items;
    const q = searchQuery.toLowerCase();
    return items.filter((it) => {
      const fields = getSearchable
        ? getSearchable(it)
        : [
            typeof it.title === "string" ? it.title : "",
            typeof it.label === "string" ? it.label : "",
          ];
      return fields.some((f) => f.toLowerCase().includes(q));
    });
  }, [items, searchable, onSearch, searchQuery, getSearchable]);

  const columnItems = (colId: string) =>
    filteredItems.filter((it) => it.columnId === colId);

  // Compute the drop index for a pointer event over an item by comparing
  // pointer Y to the item's vertical midpoint. Above midpoint = before,
  // below = after.
  const computeDropIndex = (
    e: { clientY: number; currentTarget: Element },
    itemIndex: number
  ): number => {
    const rect = e.currentTarget.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    const before = e.clientY < midY;
    return before ? itemIndex : itemIndex + 1;
  };

  const handleKey = (e: KeyboardEvent<HTMLLIElement>, item: KanbanItem) => {
    if (readOnly) return;
    if (!(e.ctrlKey || e.metaKey)) return;
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    const currentIdx = columns.findIndex((c) => c.id === item.columnId);
    const nextIdx =
      e.key === "ArrowLeft" ? currentIdx - 1 : currentIdx + 1;
    if (nextIdx < 0 || nextIdx >= columns.length) return;
    const target = columns[nextIdx]!;
    if (target.wip !== undefined && columnItems(target.id).length >= target.wip) return;
    onItemMove?.({
      itemId: item.id,
      fromColumn: item.columnId,
      toColumn: target.id,
      toIndex: columnItems(target.id).length,
    });
  };

  return (
    <div
      ref={ref}
      className={cx("vf-kanban", className)}
      style={style}
      role="group"
      aria-label="Kanban board"
      {...props}
    >
      {searchable && (
        <div className="vf-kanban__search">
          <input
            type="text"
            placeholder="Search cards..."
            aria-label="Search cards"
            value={onSearch ? undefined : searchQuery}
            onChange={(e) => {
              const v = e.target.value;
              if (onSearch) {
                onSearch(v);
              } else {
                setSearchQuery(v);
              }
            }}
          />
        </div>
      )}
      {columns.map((col) => {
        const list = columnItems(col.id);
        const atLimit = col.wip !== undefined && list.length >= col.wip;
        return (
          <div
            key={col.id}
            className={cx(
              "vf-kanban__column",
              atLimit && "vf-kanban__column--at-limit"
            )}
            role="list"
            aria-label={typeof col.title === "string" ? col.title : col.id}
            onDragOver={(e) => {
              if (readOnly) return;
              e.preventDefault();
              if (!dropTarget || dropTarget.columnId !== col.id) {
                setDropTarget({ columnId: col.id, index: list.length });
              }
            }}
            onDrop={(e) => {
              if (readOnly) return;
              e.preventDefault();
              const drag = dragRef.current;
              if (!drag) return;
              let toIndex =
                dropTarget?.columnId === col.id ? dropTarget.index : list.length;
              // Drop after the source position within the same column needs to
              // shift down by 1 because removing the source first reduces the
              // target index.
              if (drag.fromColumn === col.id && toIndex > drag.fromIndex) {
                toIndex -= 1;
              }
              onItemMove?.({
                itemId: drag.id,
                fromColumn: drag.fromColumn,
                toColumn: col.id,
                toIndex,
              });
              dragRef.current = null;
              setDropTarget(null);
            }}
            onDragLeave={(e) => {
              const next = e.relatedTarget as Node | null;
              if (next && (e.currentTarget as Node).contains(next)) return;
              setDropTarget(null);
            }}
          >
            <header className="vf-kanban__column-header">
              {renderColumnHeader ? (
                renderColumnHeader(col, list.length)
              ) : (
                <>
                  <Label>{col.title}</Label>
                  <span className="vf-kanban__count">
                    {list.length}
                    {col.wip !== undefined ? ` / ${col.wip}` : ""}
                  </span>
                </>
              )}
            </header>
            <ul className="vf-kanban__list">
              {list.map((item, i) => (
                <li
                  key={item.id}
                  role="listitem"
                  draggable={!readOnly}
                  tabIndex={0}
                  className={cx(
                    "vf-kanban__item",
                    dropTarget?.columnId === col.id &&
                      dropTarget.index === i &&
                      "vf-kanban__item--drop-hint"
                  )}
                  onDragStart={() => {
                    dragRef.current = {
                      id: item.id,
                      fromColumn: col.id,
                      fromIndex: i,
                    };
                  }}
                  onDragEnd={() => {
                    dragRef.current = null;
                    setDropTarget(null);
                  }}
                  onDragOver={(e) => {
                    if (readOnly) return;
                    e.preventDefault();
                    e.stopPropagation();
                    setDropTarget({
                      columnId: col.id,
                      index: computeDropIndex(e, i),
                    });
                  }}
                  onKeyDown={(e) => handleKey(e, item)}
                  aria-grabbed={dragRef.current?.id === item.id || undefined}
                >
                  {renderItem(item)}
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
});
Kanban.displayName = "Kanban";
