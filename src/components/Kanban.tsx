"use client";

// Phase 9 — Kanban
//
// Column-based board with drag-drop card moves. Keeps the DnD logic plain
// HTML5 drag-and-drop (no external dep). A keyboard alternative lets users
// move the focused card with `Ctrl+ArrowLeft/Right` to adjacent columns.

import {
  forwardRef,
  memo,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ForwardedRef,
  type HTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
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
  /**
   * Index of the card in the target column after the move, counted over the
   * column's cards without the dragged card (so the moved card ends up at
   * `toColumnOrder[toIndex]`).
   */
  toIndex: number;
  /**
   * Ids of every card in the target column after the move, in order,
   * including the moved card. Persist this directly.
   */
  toColumnOrder: string[];
  /**
   * Ids of every card left in the source column after the move. Equal to
   * `toColumnOrder` when the move is within one column.
   */
  fromColumnOrder: string[];
}

export interface KanbanProps<T extends KanbanItem = KanbanItem>
  extends HTMLAttributes<HTMLDivElement> {
  columns: KanbanColumn[];
  items: T[];
  onItemMove?: (event: KanbanMoveEvent) => void;
  renderItem: (item: T) => ReactNode;
  renderColumnHeader?: (column: KanbanColumn, count: number) => ReactNode;
  /**
   * Called when a card is clicked, or activated with Enter / Space while
   * focused. Not called for the click the browser fires at the end of a drag,
   * so a board can be both draggable and openable.
   */
  onItemClick?: (item: T, event: MouseEvent<HTMLLIElement> | KeyboardEvent<HTMLLIElement>) => void;
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
  getSearchable?: (item: T) => string[];
  /**
   * Maximum height of a column's card list before it scrolls internally.
   * Default `60vh` (set by the stylesheet as `--vf-kanban-column-max-height`).
   * Pass `"none"` to let columns grow with their content.
   */
  columnMaxHeight?: number | string;
  style?: CSSProperties;
}

/**
 * A column-based task board that supports dragging items between columns.
 * Emits move events so callers can persist reordering and cross-column transitions.
 */
function KanbanInner<T extends KanbanItem>(
  {
    columns,
    items,
    onItemMove,
    onItemClick,
    renderItem,
    renderColumnHeader,
    readOnly,
    searchable,
    onSearch,
    getSearchable,
    columnMaxHeight,
    className,
    style,
    ...props
  }: KanbanProps<T>,
  ref: ForwardedRef<HTMLDivElement>
) {
  const [searchQuery, setSearchQuery] = useState("");
  const dragRef = useRef<{ id: string; fromColumn: string; fromIndex: number } | null>(
    null
  );
  // Set when a drag gesture happened on a card; the click the browser emits
  // when the pointer is released must not open the card.
  const dragHappenedRef = useRef(false);
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

  // Build the full move event: the resulting order of both affected columns
  // so consumers can persist it without re-deriving the splice.
  const buildMove = (
    itemId: string,
    fromColumn: string,
    toColumn: string,
    toIndex: number
  ): KanbanMoveEvent => {
    const fromOrder = columnItems(fromColumn)
      .map((it) => it.id)
      .filter((id) => id !== itemId);
    const toBase =
      fromColumn === toColumn
        ? fromOrder.slice()
        : columnItems(toColumn)
            .map((it) => it.id)
            .filter((id) => id !== itemId);
    const clamped = Math.max(0, Math.min(toIndex, toBase.length));
    toBase.splice(clamped, 0, itemId);
    return {
      itemId,
      fromColumn,
      toColumn,
      toIndex: clamped,
      toColumnOrder: toBase,
      fromColumnOrder: fromColumn === toColumn ? toBase : fromOrder,
    };
  };

  const handleKey = (e: KeyboardEvent<HTMLLIElement>, item: T) => {
    if (onItemClick && (e.key === "Enter" || e.key === " ") && e.target === e.currentTarget) {
      e.preventDefault();
      onItemClick(item, e);
      return;
    }
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
    onItemMove?.(
      buildMove(item.id, item.columnId, target.id, columnItems(target.id).length)
    );
  };

  const boardStyle: CSSProperties | undefined =
    columnMaxHeight !== undefined
      ? ({
          ...style,
          "--vf-kanban-column-max-height":
            typeof columnMaxHeight === "number" ? `${columnMaxHeight}px` : columnMaxHeight,
        } as CSSProperties)
      : style;

  return (
    <div
      ref={ref}
      className={cx("vf-kanban", className)}
      style={boardStyle}
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
              onItemMove?.(buildMove(drag.id, drag.fromColumn, col.id, toIndex));
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
                    onItemClick && "vf-kanban__item--clickable",
                    dropTarget?.columnId === col.id &&
                      dropTarget.index === i &&
                      "vf-kanban__item--drop-hint"
                  )}
                  onDragStart={() => {
                    dragHappenedRef.current = true;
                    dragRef.current = {
                      id: item.id,
                      fromColumn: col.id,
                      fromIndex: i,
                    };
                  }}
                  onDragEnd={() => {
                    dragRef.current = null;
                    setDropTarget(null);
                    // The synthetic click, when the browser emits one, follows
                    // dragend in the same task; release the guard afterwards.
                    setTimeout(() => {
                      dragHappenedRef.current = false;
                    }, 0);
                  }}
                  onClick={
                    onItemClick
                      ? (e) => {
                          if (dragHappenedRef.current) return;
                          onItemClick(item, e);
                        }
                      : undefined
                  }
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
}

const KanbanImpl = forwardRef(KanbanInner) as unknown as (<T extends KanbanItem>(
  props: KanbanProps<T> & { ref?: Ref<HTMLDivElement> }
) => ReactElement | null) & { displayName?: string };
KanbanImpl.displayName = "Kanban";

/**
 * Kanban board with column-bounded drag/drop. Memoized at the export
 * site so re-rendering a parent with unrelated state doesn't re-render
 * the full board grid; consumers can rely on referentially-stable
 * `items` / `onMove` callbacks for the optimization to actually fire.
 *
 * Generic over the card type: `<Kanban<Card> items={cards} renderItem={(card) => …} />`
 * types `renderItem`, `getSearchable` and `onItemClick` with your card.
 */
export const Kanban = memo(KanbanImpl as never) as unknown as (<T extends KanbanItem>(
  props: KanbanProps<T> & { ref?: Ref<HTMLDivElement> }
) => ReactElement | null) & { displayName?: string };
Kanban.displayName = "Kanban";
