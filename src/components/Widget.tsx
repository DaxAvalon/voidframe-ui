"use client";

// Phase 13 — Widget shell + dashboard grid

import {
  forwardRef,
  useCallback,
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
// Open-canvas dashboard grid. Cards are positioned in a sub-cell
// coordinate system (every position is an integer count of sub-cells
// from the canvas top-left). Each card has a fixed `w × h` in sub-cells
// and snaps in 1-sub-cell increments while being dragged. A live
// micro-grid overlay highlights the proposed drop target.
//
// Snap rules on release:
//   - If the cursor is inside another card's bounds → swap positions.
//   - Else → snap to the cursor target. If that target overlaps another
//     card, walk outward (BFS over neighbour sub-cells) to the nearest
//     empty spot whose rect touches the target.
//
// Resize: pointerdown on the corner grip stops propagation so it never
// triggers a move. The card grows down/right with the top-left
// (`x`, `y`) anchored.

export interface DashboardLayoutItem {
  id: string;
  /** Top-left sub-cell column (0-based). */
  x: number;
  /** Top-left sub-cell row (0-based). */
  y: number;
  /** Width in sub-cells. */
  w: number;
  /** Height in sub-cells. */
  h: number;
}

export type DashboardBounds = "auto" | { rows: number };

export interface DashboardGridProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onClick"> {
  items: DashboardLayoutItem[];
  onLayoutChange?: (next: DashboardLayoutItem[]) => void;
  /** Total sub-cell columns across the canvas. Default 24. */
  cols?: number;
  /** Pixel size of one sub-cell side. Default 32. */
  cellSize?: number;
  /** Pixel gap between sub-cells. Default 4. */
  gap?: number;
  /** Render function per item. */
  renderItem: (id: string, item: DashboardLayoutItem) => ReactNode;
  /** Allow click-drag to move cards. Default true. */
  movable?: boolean;
  /** Show corner-resize grips on each card. Default false. */
  resizable?: boolean;
  /** Min sub-cell width when resizing. Default 2. */
  minW?: number;
  /** Min sub-cell height when resizing. Default 2. */
  minH?: number;
  /** Max sub-cell width. Default `cols`. */
  maxW?: number;
  /** Max sub-cell height. Defaults to bounds rows or unbounded. */
  maxH?: number;
  /** `"auto"` (default) grows the canvas in both axes to fit the
   * furthest card; pass `{ rows: N }` for a fixed sub-cell row count
   * (horizontal still grows past `cols` if a card requires it). */
  bounds?: DashboardBounds;
  /** Empty rows below the lowest card when growing vertically. Default 4. */
  autoPaddingRows?: number;
  /** Empty columns to the right of the furthest card when growing
   * horizontally. Default 4. */
  autoPaddingCols?: number;
}

interface MoveDragState {
  id: string;
  /** Card position at drag start (sub-cells). */
  startX: number;
  startY: number;
  /** Pointer coords at drag start (canvas-local pixels). */
  pointerStartX: number;
  pointerStartY: number;
}

interface ResizeDragState {
  id: string;
  startW: number;
  startH: number;
  pointerStartX: number;
  pointerStartY: number;
}

interface SnapPreview {
  /** Snap target the card would land on if released now (sub-cells). */
  x: number;
  y: number;
  /** Will the release swap with another card instead of snap-adjacent? */
  swapTargetId: string | null;
}

function rectsOverlap(
  a: { x: number; y: number; w: number; h: number },
  b: { x: number; y: number; w: number; h: number }
): boolean {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

function pointInRect(
  px: number,
  py: number,
  r: { x: number; y: number; w: number; h: number }
): boolean {
  return px >= r.x && px < r.x + r.w && py >= r.y && py < r.y + r.h;
}

/**
 * BFS outward from `(x, y)` looking for a sub-cell origin where the
 * `(w, h)` rect fits without overlapping any card in `others` and stays
 * within `[0, cols] × [0, rowsLimit]`.
 */
function findNearestEmpty(
  x: number,
  y: number,
  w: number,
  h: number,
  others: Array<{ x: number; y: number; w: number; h: number }>,
  cols: number,
  rowsLimit: number
): { x: number; y: number } {
  const fits = (cx: number, cy: number) => {
    if (cx < 0 || cy < 0) return false;
    if (cx + w > cols) return false;
    if (cy + h > rowsLimit) return false;
    const rect = { x: cx, y: cy, w, h };
    for (const o of others) if (rectsOverlap(rect, o)) return false;
    return true;
  };
  if (fits(x, y)) return { x, y };
  const seen = new Set<string>();
  const queue: Array<[number, number]> = [[x, y]];
  seen.add(`${x},${y}`);
  while (queue.length) {
    const [cx, cy] = queue.shift()!;
    const neighbours: Array<[number, number]> = [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ];
    for (const [dx, dy] of neighbours) {
      const nx = cx + dx;
      const ny = cy + dy;
      const key = `${nx},${ny}`;
      if (seen.has(key)) continue;
      seen.add(key);
      if (nx < 0 || ny < 0 || nx + w > cols || ny + h > rowsLimit) continue;
      if (fits(nx, ny)) return { x: nx, y: ny };
      queue.push([nx, ny]);
    }
    if (seen.size > 4000) break; // hard cap so we never spin
  }
  // Fallback: clamp into bounds even if it overlaps (shouldn't happen
  // unless the canvas is impossibly full).
  return {
    x: Math.max(0, Math.min(cols - w, x)),
    y: Math.max(0, Math.min(rowsLimit - h, y)),
  };
}

export const DashboardGrid = forwardRef<HTMLDivElement, DashboardGridProps>(
  function DashboardGrid(
    {
      items,
      onLayoutChange,
      cols = 24,
      cellSize = 32,
      gap = 4,
      renderItem,
      movable = true,
      resizable = false,
      minW = 2,
      minH = 2,
      maxW,
      maxH,
      bounds = "auto",
      autoPaddingRows = 4,
      autoPaddingCols = 4,
      className,
      style,
      ...props
    },
    ref
  ) {
    const [moving, setMoving] = useState<MoveDragState | null>(null);
    const [resizing, setResizing] = useState<ResizeDragState | null>(null);
    const [pointer, setPointer] = useState<{ x: number; y: number } | null>(
      null
    );

    const canvasRef = useRef<HTMLDivElement | null>(null);
    const setCanvasRef = (node: HTMLDivElement | null) => {
      canvasRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) (ref as { current: HTMLDivElement | null }).current = node;
    };

    const cellStep = cellSize + gap;
    const subToPx = (n: number) => n * cellStep;

    const movingItem =
      moving ? items.find((i) => i.id === moving.id) ?? null : null;

    // Used extents across both axes — committed cards plus the in-flight
    // drag's pointer-tracked position so the canvas can grow in real
    // time while the user drags toward an edge.
    const usedCols = items.reduce(
      (max, item) => Math.max(max, item.x + item.w),
      0
    );
    const usedRows = items.reduce(
      (max, item) => Math.max(max, item.y + item.h),
      0
    );

    let liveCols = usedCols;
    let liveRows = usedRows;
    if (moving && movingItem && pointer) {
      const offsetX = moving.pointerStartX - subToPx(moving.startX);
      const offsetY = moving.pointerStartY - subToPx(moving.startY);
      const probeX = Math.max(
        0,
        Math.round((pointer.x - offsetX) / cellStep)
      );
      const probeY = Math.max(
        0,
        Math.round((pointer.y - offsetY) / cellStep)
      );
      liveCols = Math.max(liveCols, probeX + movingItem.w);
      liveRows = Math.max(liveRows, probeY + movingItem.h);
    }

    const effectiveCols = Math.max(cols, liveCols + autoPaddingCols);
    const rows =
      bounds === "auto"
        ? Math.max(usedRows, liveRows) + autoPaddingRows
        : bounds.rows;
    // Snap math always allows growing horizontally; vertical growth
    // depends on the bounds prop.
    const colsLimit = effectiveCols;
    const rowsLimit = bounds === "auto" ? Number.POSITIVE_INFINITY : bounds.rows;

    const canvasWidth =
      effectiveCols * cellSize + Math.max(0, effectiveCols - 1) * gap;
    const canvasHeight =
      rows * cellSize + Math.max(0, rows - 1) * gap;

    // Compute the snap preview while moving.
    const preview: SnapPreview | null = useMemo(() => {
      if (!moving || !movingItem || !pointer) return null;
      // Pointer position in sub-cell coordinates relative to the card's
      // top-left corner stays the same offset as at drag start, so we
      // anchor the proposed snap to the same sub-cell offset.
      const offsetX = moving.pointerStartX - subToPx(moving.startX);
      const offsetY = moving.pointerStartY - subToPx(moving.startY);
      const proposedPxX = pointer.x - offsetX;
      const proposedPxY = pointer.y - offsetY;
      const proposedX = Math.round(proposedPxX / cellStep);
      const proposedY = Math.round(proposedPxY / cellStep);
      const others = items
        .filter((i) => i.id !== moving.id)
        .map((i) => ({ x: i.x, y: i.y, w: i.w, h: i.h }));

      // Cursor in sub-cells, for swap detection.
      const cursorSubX = Math.floor(pointer.x / cellStep);
      const cursorSubY = Math.floor(pointer.y / cellStep);
      const swapTarget = items.find(
        (i) =>
          i.id !== moving.id &&
          pointInRect(cursorSubX, cursorSubY, { x: i.x, y: i.y, w: i.w, h: i.h })
      );

      if (swapTarget) {
        return {
          x: swapTarget.x,
          y: swapTarget.y,
          swapTargetId: swapTarget.id,
        };
      }

      const snap = findNearestEmpty(
        Math.max(0, Math.min(colsLimit - movingItem.w, proposedX)),
        Math.max(0, Math.min(rowsLimit - movingItem.h, proposedY)),
        movingItem.w,
        movingItem.h,
        others,
        colsLimit,
        rowsLimit
      );
      return { x: snap.x, y: snap.y, swapTargetId: null };
    }, [moving, movingItem, pointer, items, cellStep, colsLimit, rowsLimit, subToPx]);

    const localFromClient = useCallback(
      (clientX: number, clientY: number) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        return { x: clientX - rect.left, y: clientY - rect.top };
      },
      []
    );

    const localFromPointer = (e: ReactPointerEvent<HTMLElement>) =>
      localFromClient(e.clientX, e.clientY);

    // While moving or resizing, follow the pointer at the window level.
    // The card grabs pointer capture on press, so its events would not
    // bubble to the grid; window listeners catch every move regardless.
    useEffect(() => {
      if (!moving && !resizing) return;
      const onMove = (e: PointerEvent) => {
        setPointer(localFromClient(e.clientX, e.clientY));
      };
      const onUp = () => {
        if (resizing) {
          setResizing(null);
          setPointer(null);
          return;
        }
        commitMoveRef.current();
      };
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
      window.addEventListener("pointercancel", onUp);
      return () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        window.removeEventListener("pointercancel", onUp);
      };
    }, [moving, resizing, localFromClient]);

    const startMove = (item: DashboardLayoutItem) =>
      (e: ReactPointerEvent<HTMLDivElement>) => {
        if (!movable) return;
        if (!onLayoutChange) {
          if (process.env.NODE_ENV !== "production") {
            console.warn(
              "[voidframe] DashboardGrid: `movable` is enabled but `onLayoutChange` is missing — drag is a no-op."
            );
          }
          return;
        }
        // Avoid initiating move when the press starts inside the resize
        // grip; the grip's own handler stops propagation, so we only
        // need to defend against rare event ordering issues.
        const target = e.target as HTMLElement;
        if (target?.closest?.(".vf-dashboard-grid__resize")) return;
        const local = localFromPointer(e);
        setMoving({
          id: item.id,
          startX: item.x,
          startY: item.y,
          pointerStartX: local.x,
          pointerStartY: local.y,
        });
        setPointer(local);
        try {
          e.currentTarget.setPointerCapture(e.pointerId);
        } catch {
          /* noop */
        }
      };

    // Note: in-progress drag pointermove/up are handled by the window
    // listener registered above (the moving card grabs pointer capture
    // and would otherwise swallow events that don't bubble back here).

    const commitMove = useCallback(() => {
      if (!moving || !movingItem || !preview || !onLayoutChange) {
        setMoving(null);
        setPointer(null);
        return;
      }
      if (preview.swapTargetId) {
        const swapTarget = items.find((i) => i.id === preview.swapTargetId);
        if (swapTarget) {
          onLayoutChange(
            items.map((item) => {
              if (item.id === movingItem.id)
                return { ...item, x: swapTarget.x, y: swapTarget.y };
              if (item.id === swapTarget.id)
                return { ...item, x: movingItem.x, y: movingItem.y };
              return item;
            })
          );
        }
      } else if (preview.x !== movingItem.x || preview.y !== movingItem.y) {
        onLayoutChange(
          items.map((item) =>
            item.id === movingItem.id
              ? { ...item, x: preview.x, y: preview.y }
              : item
          )
        );
      }
      setMoving(null);
      setPointer(null);
    }, [moving, movingItem, preview, items, onLayoutChange]);

    // Keep a ref to the latest commitMove so the window pointerup listener
    // (registered once when drag starts) always commits with the current
    // preview, not the snapshot from the moment the drag began.
    const commitMoveRef = useRef(commitMove);
    useEffect(() => {
      commitMoveRef.current = commitMove;
    }, [commitMove]);

    const startResize = (item: DashboardLayoutItem) =>
      (e: ReactPointerEvent<HTMLDivElement>) => {
        e.stopPropagation();
        if (!resizable || !onLayoutChange) return;
        const local = localFromPointer(e);
        setResizing({
          id: item.id,
          startW: item.w,
          startH: item.h,
          pointerStartX: local.x,
          pointerStartY: local.y,
        });
        setPointer(local);
        try {
          e.currentTarget.setPointerCapture(e.pointerId);
        } catch {
          /* noop */
        }
      };

    const onResizeMoveTick = useCallback(() => {
      if (!resizing || !pointer || !onLayoutChange) return;
      const item = items.find((i) => i.id === resizing.id);
      if (!item) return;
      const dx = pointer.x - resizing.pointerStartX;
      const dy = pointer.y - resizing.pointerStartY;
      const widthCap = maxW ?? Number.POSITIVE_INFINITY;
      const nextW = Math.max(
        minW,
        Math.min(widthCap, resizing.startW + Math.round(dx / cellStep))
      );
      const heightCap = maxH ?? (bounds === "auto" ? Infinity : bounds.rows);
      const nextH = Math.max(
        minH,
        Math.min(heightCap, resizing.startH + Math.round(dy / cellStep))
      );
      const clampedH = Math.min(
        nextH,
        bounds === "auto" ? Infinity : bounds.rows - item.y
      );
      if (nextW === item.w && clampedH === item.h) return;
      onLayoutChange(
        items.map((it) =>
          it.id === item.id ? { ...it, w: nextW, h: clampedH } : it
        )
      );
    }, [resizing, pointer, items, onLayoutChange, cellStep, minW, minH, maxW, maxH, bounds]);

    // Re-run the resize delta each time the pointer position actually changes.
    // Depending on `pointer` directly (not the tick callback) keeps emits at
    // most once per pointer event.
    useEffect(() => {
      onResizeMoveTick();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pointer]);

    const showOverlay = !!moving;
    const dragging = !!moving || !!resizing;

    const canvasStyle: CSSProperties = {
      position: "relative",
      width: canvasWidth,
      maxWidth: "100%",
      height: bounds === "auto" ? canvasHeight : canvasHeight,
      ...style,
    };

    // Inline CSS variables let the stylesheet draw the micro-grid via a
    // background-image without re-rendering on every pointer move.
    const overlayBg: CSSProperties = showOverlay
      ? {
          backgroundImage: `linear-gradient(to right, var(--vf-border-1) 1px, transparent 1px),
                            linear-gradient(to bottom, var(--vf-border-1) 1px, transparent 1px)`,
          backgroundSize: `${cellStep}px ${cellStep}px`,
          backgroundPosition: `0 0`,
        }
      : {};

    return (
      <div
        ref={setCanvasRef}
        className={cx(
          "vf-dashboard-grid",
          dragging && "vf-dashboard-grid--dragging",
          className
        )}
        style={{ ...canvasStyle, ...overlayBg }}
        {...props}
      >
        {showOverlay && preview && movingItem && (
          <div
            aria-hidden="true"
            className={cx(
              "vf-dashboard-grid__drop-target",
              preview.swapTargetId && "vf-dashboard-grid__drop-target--swap"
            )}
            style={{
              position: "absolute",
              left: subToPx(preview.x),
              top: subToPx(preview.y),
              width: movingItem.w * cellStep - gap,
              height: movingItem.h * cellStep - gap,
            }}
          />
        )}
        {items.map((item) => {
          const isMoving = moving?.id === item.id;
          const isSwapPartner =
            preview?.swapTargetId === item.id && !!moving;
          // Card position: the moving card follows the pointer; everyone
          // else stays put.
          let displayX = item.x;
          let displayY = item.y;
          let zIndex: number | undefined;
          let cardStyle: CSSProperties = {};
          if (isMoving && moving && pointer && movingItem) {
            const offsetX = moving.pointerStartX - subToPx(moving.startX);
            const offsetY = moving.pointerStartY - subToPx(moving.startY);
            cardStyle = {
              left: pointer.x - offsetX,
              top: pointer.y - offsetY,
              transition: "none",
              opacity: 0.85,
            };
            zIndex = 100;
          } else {
            cardStyle = {
              left: subToPx(displayX),
              top: subToPx(displayY),
            };
          }
          return (
            <div
              key={item.id}
              className={cx(
                "vf-dashboard-grid__cell",
                isMoving && "vf-dashboard-grid__cell--moving",
                isSwapPartner && "vf-dashboard-grid__cell--swap-partner"
              )}
              style={{
                position: "absolute",
                width: item.w * cellStep - gap,
                height: item.h * cellStep - gap,
                zIndex,
                touchAction: "none",
                ...cardStyle,
              }}
              onPointerDown={movable ? startMove(item) : undefined}
            >
              {renderItem(item.id, item)}
              {resizable && onLayoutChange && (
                <div
                  role="separator"
                  aria-label="Resize widget"
                  className="vf-dashboard-grid__resize"
                  onPointerDown={startResize(item)}
                />
              )}
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
