// Phase 13 — Widget shell + dashboard grid

import {
  forwardRef,
  useCallback,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { cx } from "../utils/cx";

// ── WidgetShell ─────────────────────────────────────────────

export interface WidgetShellProps
  extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  title?: ReactNode;
  actions?: ReactNode;
  footer?: ReactNode;
  loading?: boolean;
  error?: ReactNode;
  /** Fixed height (number → px, string → raw). */
  height?: number | string;
  /** Show visual handles for drag / resize in DashboardGrid context. */
  resizable?: boolean;
  draggable?: boolean;
  /** "empty" renders children-less with a consumer-provided `empty` node. */
  empty?: ReactNode;
  children?: ReactNode;
}

export const WidgetShell = forwardRef<HTMLElement, WidgetShellProps>(
  function WidgetShell(
    {
      title,
      actions,
      footer,
      loading,
      error,
      height,
      resizable,
      draggable,
      empty,
      className,
      style,
      children,
      ...props
    },
    ref
  ) {
    const composed: CSSProperties = {
      ...style,
      ...(height !== undefined
        ? { height: typeof height === "number" ? `${height}px` : height }
        : {}),
    };
    return (
      <section
        ref={ref}
        className={cx(
          "vf-widget",
          loading && "vf-widget--loading",
          error && "vf-widget--error",
          resizable && "vf-widget--resizable",
          draggable && "vf-widget--draggable",
          className
        )}
        style={composed}
        aria-busy={loading || undefined}
        {...props}
      >
        {(title || actions || draggable) && (
          <header className="vf-widget__header">
            {draggable && (
              <span
                className="vf-widget__drag-handle"
                aria-hidden="true"
                data-drag-handle=""
              >
                ⠿
              </span>
            )}
            {title && <div className="vf-widget__title">{title}</div>}
            {actions && <div className="vf-widget__actions">{actions}</div>}
          </header>
        )}
        <div className="vf-widget__body">
          {loading ? (
            <div className="vf-widget__loading">Loading…</div>
          ) : error ? (
            <div className="vf-widget__error-body">{error}</div>
          ) : (children === undefined || children === null) && empty !== undefined ? (
            <div className="vf-widget__empty">{empty}</div>
          ) : (
            children
          )}
        </div>
        {footer && <footer className="vf-widget__footer">{footer}</footer>}
        {resizable && (
          <span
            className="vf-widget__resize-handle"
            aria-hidden="true"
            data-resize-handle=""
          />
        )}
      </section>
    );
  }
);
WidgetShell.displayName = "WidgetShell";

// ── DashboardGrid ───────────────────────────────────────────
//
// Lightweight layout with CSS-grid placement and optional drag swap.
// We don't bundle react-grid-layout — this is pure-CSS placement using
// the consumer's (x, y, w, h) layout. Drag moves swap positions; resize
// is handled via the corner handle by the consumer's callback.

export interface DashboardLayoutItem {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface DashboardGridProps extends HTMLAttributes<HTMLDivElement> {
  items: DashboardLayoutItem[];
  onLayoutChange?: (next: DashboardLayoutItem[]) => void;
  cols?: number;
  rowHeight?: number;
  gap?: number;
  /** Render function per layout item id. */
  renderItem: (id: string, item: DashboardLayoutItem) => ReactNode;
  /** Enable drag-to-swap. Default false. */
  swappable?: boolean;
}

export const DashboardGrid = forwardRef<HTMLDivElement, DashboardGridProps>(
  function DashboardGrid(
    {
      items,
      onLayoutChange,
      cols = 12,
      rowHeight = 64,
      gap = 8,
      renderItem,
      swappable,
      className,
      style,
      ...props
    },
    ref
  ) {
    const gridStyle: CSSProperties = {
      display: "grid",
      gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
      gridAutoRows: `${rowHeight}px`,
      gap,
      ...style,
    };
    const [draggingId, setDraggingId] = useState<string | null>(null);
    const dragItemsRef = useRef(items);
    dragItemsRef.current = items;

    const swap = useCallback(
      (fromId: string, toId: string) => {
        if (!onLayoutChange) return;
        const from = items.find((i) => i.id === fromId);
        const to = items.find((i) => i.id === toId);
        if (!from || !to) return;
        onLayoutChange(
          items.map((item) => {
            if (item.id === fromId)
              return { ...item, x: to.x, y: to.y, w: to.w, h: to.h };
            if (item.id === toId)
              return { ...item, x: from.x, y: from.y, w: from.w, h: from.h };
            return item;
          })
        );
      },
      [items, onLayoutChange]
    );

    return (
      <div
        ref={ref}
        className={cx("vf-dashboard-grid", className)}
        style={gridStyle}
        {...props}
      >
        {items.map((item) => {
          const cell: CSSProperties = {
            gridColumn: `${item.x + 1} / span ${item.w}`,
            gridRow: `${item.y + 1} / span ${item.h}`,
          };
          const isDragging = draggingId === item.id;
          return (
            <div
              key={item.id}
              className={cx(
                "vf-dashboard-grid__cell",
                isDragging && "vf-dashboard-grid__cell--dragging"
              )}
              style={cell}
              draggable={swappable}
              onDragStart={() => {
                if (swappable) setDraggingId(item.id);
              }}
              onDragOver={(e) => {
                if (swappable && draggingId && draggingId !== item.id) {
                  e.preventDefault();
                }
              }}
              onDrop={() => {
                if (swappable && draggingId && draggingId !== item.id) {
                  swap(draggingId, item.id);
                }
                setDraggingId(null);
              }}
              onDragEnd={() => setDraggingId(null)}
            >
              {renderItem(item.id, item)}
            </div>
          );
        })}
      </div>
    );
  }
);
DashboardGrid.displayName = "DashboardGrid";

// ── Layout helpers ──────────────────────────────────────────

export function packLayout(
  ids: string[],
  cols: number,
  defaultSize: { w: number; h: number } = { w: 4, h: 2 }
): DashboardLayoutItem[] {
  const out: DashboardLayoutItem[] = [];
  let x = 0;
  let y = 0;
  for (const id of ids) {
    if (x + defaultSize.w > cols) {
      x = 0;
      y += defaultSize.h;
    }
    out.push({ id, x, y, w: defaultSize.w, h: defaultSize.h });
    x += defaultSize.w;
  }
  return out;
}

export function usePackedLayout(
  ids: string[],
  cols: number,
  defaultSize?: { w: number; h: number }
): DashboardLayoutItem[] {
  return useMemo(() => packLayout(ids, cols, defaultSize), [
    ids,
    cols,
    defaultSize,
  ]);
}
