"use client";

// Phase 13 — Widget shell + dashboard grid

import {
  createContext,
  forwardRef,
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
import { warnOnce } from "../utils/warn";
import { announce } from "../utils/announce";
import { useElementSize } from "../hooks/useElementSize";

// ── WidgetShell status context ──────────────────────────────
//
// A widget body usually owns the data fetch, but the shell owns the
// loading / error / empty presentation. The body reports its status through
// this context so the shell can render the right slot without the parent
// threading state through props. While a body-reported status is showing,
// the body stays mounted (hidden) so its effects keep running and can clear
// the status again.

export interface WidgetShellStatus {
  loading?: boolean;
  /** Error content; `null`/`undefined`/`false` means no error. */
  error?: ReactNode;
  /** Empty content; `true` uses the shell's `empty` prop, a node replaces it. */
  empty?: ReactNode | boolean;
}

export interface WidgetShellContextValue {
  /** Whether this body is rendered inside a `WidgetShell`. */
  inShell: boolean;
  /** Status the body has reported so far. */
  status: WidgetShellStatus;
  /** Merge a partial status; pass `undefined` for a field to clear it. */
  setStatus: (status: WidgetShellStatus) => void;
}

const noopShell: WidgetShellContextValue = {
  inShell: false,
  status: {},
  setStatus: () => undefined,
};

const WidgetShellContext = createContext<WidgetShellContextValue>(noopShell);

/**
 * Access the enclosing `WidgetShell` from a widget body. `setStatus` drives
 * the shell's loading / error / empty slots. Outside a shell it is a no-op
 * and `inShell` is false, so bodies can render standalone.
 */
export function useWidgetShell(): WidgetShellContextValue {
  return useContext(WidgetShellContext);
}

/**
 * Declarative form of `useWidgetShell().setStatus`: keeps the enclosing
 * shell's status in sync with the given values on every change.
 *
 * ```tsx
 * function CpuBody() {
 *   const q = useCpuQuery();
 *   useWidgetShellStatus({ loading: q.isLoading, error: q.error?.message, empty: q.data?.length === 0 });
 *   return <Sparkline data={q.data ?? []} />;
 * }
 * ```
 */
export function useWidgetShellStatus(status: WidgetShellStatus): void {
  const { setStatus } = useWidgetShell();
  const { loading, error, empty } = status;
  useEffect(() => {
    setStatus({ loading, error, empty });
  }, [setStatus, loading, error, empty]);
  useEffect(
    () => () => {
      setStatus({ loading: undefined, error: undefined, empty: undefined });
    },
    [setStatus]
  );
}

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

/**
 * Standardised card-shaped shell for a dashboard widget: header, body,
 * optional footer actions.
 */
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
    // Body-reported status (via useWidgetShell). Props win when set; the
    // body fills in what the parent did not decide.
    const [bodyStatus, setBodyStatus] = useState<WidgetShellStatus>({});
    const setStatus = useCallback((next: WidgetShellStatus) => {
      setBodyStatus((prev) => {
        const merged = { ...prev, ...next };
        if (
          merged.loading === prev.loading &&
          merged.error === prev.error &&
          merged.empty === prev.empty
        )
          return prev;
        return merged;
      });
    }, []);
    const shellContext = useMemo<WidgetShellContextValue>(
      () => ({ inShell: true, status: bodyStatus, setStatus }),
      [bodyStatus, setStatus]
    );
    const isLoading = loading ?? bodyStatus.loading ?? false;
    const errorNode: ReactNode =
      error !== undefined && error !== null && error !== false
        ? error
        : bodyStatus.error !== undefined && bodyStatus.error !== null && bodyStatus.error !== false
          ? bodyStatus.error
          : null;
    const bodyEmpty = bodyStatus.empty;
    const emptyNode: ReactNode | undefined =
      bodyEmpty === true
        ? (empty ?? "No data.")
        : bodyEmpty === false || bodyEmpty === undefined || bodyEmpty === null
          ? undefined
          : bodyEmpty;
    const bodyDriven =
      loading === undefined && bodyStatus.loading === true
        ? "loading"
        : !(error !== undefined && error !== null && error !== false) && errorNode
          ? "error"
          : emptyNode !== undefined
            ? "empty"
            : null;
    return (
      <section
        ref={ref}
        className={cx(
          "vf-widget",
          isLoading && "vf-widget--loading",
          errorNode && "vf-widget--error",
          resizable && "vf-widget--resizable",
          draggable && "vf-widget--draggable",
          className
        )}
        style={composed}
        aria-busy={isLoading || undefined}
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
        <WidgetShellContext.Provider value={shellContext}>
          <div className="vf-widget__body" data-status={bodyDriven ?? undefined}>
            {isLoading && bodyDriven !== "loading" ? (
              <div className="vf-widget__loading">Loading…</div>
            ) : errorNode && bodyDriven !== "error" ? (
              <div className="vf-widget__error-body">{errorNode}</div>
            ) : (children === undefined || children === null) && empty !== undefined ? (
              <div className="vf-widget__empty">{empty}</div>
            ) : (
              <>
                {bodyDriven === "loading" ? (
                  <div className="vf-widget__loading">Loading…</div>
                ) : bodyDriven === "error" ? (
                  <div className="vf-widget__error-body">{errorNode}</div>
                ) : bodyDriven === "empty" ? (
                  <div className="vf-widget__empty">{emptyNode}</div>
                ) : null}
                {/* Children keep one tree position so a body that reports a
                    status is hidden, never remounted, while it shows. */}
                <div
                  className={cx("vf-widget__content", bodyDriven && "vf-widget__content--hidden")}
                  hidden={bodyDriven ? true : undefined}
                >
                  {children}
                </div>
              </>
            )}
          </div>
        </WidgetShellContext.Provider>
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
  /**
   * Pixel size of one sub-cell side. Default 32. `"auto"` fills the
   * container width: the canvas is `width: 100%` and the sub-cell is
   * derived from the measured width and `cols`.
   */
  cellSize?: number | "auto";
  /** Pixel gap between sub-cells. Default 4. */
  gap?: number;
  /** Render function per item. */
  renderItem: (id: string, item: DashboardLayoutItem) => ReactNode;
  /** Allow click-drag to move cards. Default true. */
  movable?: boolean;
  /**
   * Start a move only from a drag handle inside the card: `true` matches
   * `[data-drag-handle]` (what `WidgetShell draggable` renders), a string
   * is a CSS selector. Default `false` (any pointerdown on the card
   * starts a move) so widget bodies with their own controls should set it.
   */
  dragHandle?: boolean | string;
  /**
   * Arrow keys move the focused card; Shift+Arrow resizes it (when
   * `resizable`). Default `true`.
   */
  keyboard?: boolean;
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
  /**
   * Upper bound on the number of candidate cells the collision-avoidance
   * search will evaluate before bailing out. Default 4000 — enough for
   * grids up to ~60×60 sub-cells. Raise this if you have a very dense,
   * large canvas and are seeing drop targets snap to arbitrary positions;
   * lower it to cap worst-case CPU on pathological layouts.
   */
  collisionSearchCap?: number;
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
  rowsLimit: number,
  searchCap = 4000
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
    if (seen.size > searchCap) break; // hard cap so we never spin
  }
  // Fallback: clamp into bounds even if it overlaps (shouldn't happen
  // unless the canvas is impossibly full).
  return {
    x: Math.max(0, Math.min(cols - w, x)),
    y: Math.max(0, Math.min(rowsLimit - h, y)),
  };
}

/**
 * Responsive dashboard grid with configurable columns per breakpoint.
 * Children can span columns/rows via `GridItem`.
 */
export const DashboardGrid = forwardRef<HTMLDivElement, DashboardGridProps>(
  function DashboardGrid(
    {
      items,
      onLayoutChange,
      cols = 24,
      cellSize: cellSizeProp = 32,
      gap = 4,
      renderItem,
      movable = true,
      dragHandle = false,
      keyboard = true,
      resizable = false,
      minW = 2,
      minH = 2,
      maxW,
      maxH,
      bounds = "auto",
      autoPaddingRows = 4,
      autoPaddingCols = 4,
      collisionSearchCap = 4000,
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

    // `cellSize="auto"`: measure the canvas (width: 100%) and derive the
    // sub-cell from it. Before the first measurement fall back to 32 px.
    const autoCell = cellSizeProp === "auto";
    const measured = useElementSize(canvasRef);
    const cellSize = autoCell
      ? measured.width > 0
        ? Math.max(8, Math.floor((measured.width - Math.max(0, cols - 1) * gap) / cols))
        : 32
      : cellSizeProp;
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
        rowsLimit,
        collisionSearchCap
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
          warnOnce(
            "DashboardGrid:movable-without-onLayoutChange",
            "DashboardGrid: `movable` is enabled but `onLayoutChange` is missing — drag is a no-op."
          );
          return;
        }
        // Avoid initiating move when the press starts inside the resize
        // grip; the grip's own handler stops propagation, so we only
        // need to defend against rare event ordering issues.
        const target = e.target as HTMLElement;
        if (target?.closest?.(".vf-dashboard-grid__resize")) return;
        // With a drag handle, only a press on the handle starts a move, so
        // buttons, links and inputs inside the card keep working.
        if (dragHandle) {
          const selector =
            typeof dragHandle === "string" ? dragHandle : "[data-drag-handle]";
          const handle = target?.closest?.(selector);
          if (!handle || !e.currentTarget.contains(handle)) return;
        }
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

    // Keyboard: arrows move the focused card one sub-cell; Shift+Arrow
    // resizes it. Only when the key lands on the card itself, so controls
    // inside the widget keep their own arrow-key behaviour.
    const onCellKeyDown = (item: DashboardLayoutItem) =>
      (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (!keyboard || !onLayoutChange || e.target !== e.currentTarget) return;
        const delta: Record<string, [number, number]> = {
          ArrowLeft: [-1, 0],
          ArrowRight: [1, 0],
          ArrowUp: [0, -1],
          ArrowDown: [0, 1],
        };
        const d = delta[e.key];
        if (!d) return;
        e.preventDefault();
        const [dx, dy] = d;
        const maxWidth = maxW ?? colsLimit;
        const maxHeight = maxH ?? (Number.isFinite(rowsLimit) ? rowsLimit : Number.POSITIVE_INFINITY);
        if (e.shiftKey) {
          if (!resizable) return;
          const w = Math.max(minW, Math.min(maxWidth, item.w + dx));
          const h = Math.max(minH, Math.min(maxHeight, item.h + dy));
          if (w === item.w && h === item.h) return;
          onLayoutChange(items.map((i) => (i.id === item.id ? { ...i, w, h } : i)));
          announce(`${item.id} resized to ${w} by ${h}`);
          return;
        }
        if (!movable) return;
        const x = Math.max(0, Math.min(colsLimit - item.w, item.x + dx));
        const y = Math.max(0, Math.min(Number.isFinite(rowsLimit) ? rowsLimit - item.h : Number.POSITIVE_INFINITY, item.y + dy));
        if (x === item.x && y === item.y) return;
        // Land on another card: swap places with it, as a pointer drop would.
        const occupant = items.find(
          (i) =>
            i.id !== item.id &&
            x < i.x + i.w && x + item.w > i.x && y < i.y + i.h && y + item.h > i.y
        );
        if (occupant) {
          onLayoutChange(
            items.map((i) =>
              i.id === item.id
                ? { ...i, x: occupant.x, y: occupant.y }
                : i.id === occupant.id
                  ? { ...i, x: item.x, y: item.y }
                  : i
            )
          );
          announce(`${item.id} swapped with ${occupant.id}`);
          return;
        }
        onLayoutChange(items.map((i) => (i.id === item.id ? { ...i, x, y } : i)));
        announce(`${item.id} moved to column ${x + 1}, row ${y + 1}`);
      };

    const showOverlay = !!moving;
    const dragging = !!moving || !!resizing;
    const focusable = keyboard && !!onLayoutChange && (movable || resizable);

    const canvasStyle: CSSProperties = {
      position: "relative",
      width: autoCell ? "100%" : canvasWidth,
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
              data-state={isMoving ? "moving" : resizing?.id === item.id ? "resizing" : isSwapPartner ? "swap-partner" : "idle"}
              style={{
                position: "absolute",
                width: item.w * cellStep - gap,
                height: item.h * cellStep - gap,
                zIndex,
                touchAction: "none",
                ...cardStyle,
              }}
              data-item-id={item.id}
              tabIndex={focusable ? 0 : undefined}
              aria-label={focusable ? item.id : undefined}
              aria-roledescription={focusable ? "movable widget" : undefined}
              onKeyDown={focusable ? onCellKeyDown(item) : undefined}
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

/** Input to `packLayout`: an id with optional size, or a bare id. */
export interface PackLayoutItem {
  id: string;
  /** Width in cells. Defaults to `defaults.w`. */
  w?: number;
  /** Height in cells. Defaults to `defaults.h`. */
  h?: number;
}

export interface PackLayoutOptions {
  /** Default size for items that do not specify one. Default `{ w: 4, h: 2 }`. */
  w?: number;
  h?: number;
  /** First row to place into (used to pack newcomers below an existing layout). Default 0. */
  startY?: number;
}

/**
 * Pack items into a `cols`-wide grid. Items are placed in order at the
 * lowest available row, left-most first (skyline packing), so widgets of
 * different widths and heights fill gaps instead of advancing by one
 * uniform row height. Items wider than `cols` are clamped to `cols`.
 *
 * The `string[]` form with a uniform size is unchanged from earlier
 * releases: left to right, wrapping to a new row of the default height.
 */
export function packLayout(
  items: ReadonlyArray<string | PackLayoutItem>,
  cols: number,
  defaults: { w: number; h: number } | PackLayoutOptions = { w: 4, h: 2 }
): DashboardLayoutItem[] {
  const defW = Math.max(1, Math.floor(defaults.w ?? 4));
  const defH = Math.max(1, Math.floor(defaults.h ?? 2));
  const startY = Math.max(0, Math.floor(("startY" in defaults ? defaults.startY : undefined) ?? 0));
  const width = Math.max(1, Math.floor(cols));
  // Skyline: the first free row in each column.
  const skyline = new Array<number>(width).fill(startY);
  const out: DashboardLayoutItem[] = [];
  for (const raw of items) {
    const item: PackLayoutItem = typeof raw === "string" ? { id: raw } : raw;
    const w = Math.min(width, Math.max(1, Math.floor(item.w ?? defW)));
    const h = Math.max(1, Math.floor(item.h ?? defH));
    let bestX = 0;
    let bestY = Number.POSITIVE_INFINITY;
    for (let x = 0; x + w <= width; x++) {
      let top = 0;
      for (let c = x; c < x + w; c++) top = Math.max(top, skyline[c]!);
      if (top < bestY) {
        bestY = top;
        bestX = x;
      }
    }
    out.push({ id: item.id, x: bestX, y: bestY, w, h });
    for (let c = bestX; c < bestX + w; c++) skyline[c] = bestY + h;
  }
  return out;
}

export function usePackedLayout(
  items: ReadonlyArray<string | PackLayoutItem>,
  cols: number,
  defaults?: { w: number; h: number } | PackLayoutOptions
): DashboardLayoutItem[] {
  return useMemo(() => packLayout(items, cols, defaults), [
    items,
    cols,
    defaults,
  ]);
}

// ── Persisted dashboard layout ──────────────────────────────

/** Minimal storage surface: `localStorage`, or any `{ get, set, remove }` adapter. */
export interface DashboardLayoutStorage {
  get: (key: string) => string | null;
  set: (key: string, value: string) => void;
  remove?: (key: string) => void;
}

export interface UseDashboardLayoutOptions {
  /** Storage key. Omit to keep the layout in memory only. */
  storageKey?: string;
  /** The current widget set, with optional default sizes. */
  items: ReadonlyArray<string | PackLayoutItem>;
  /** Grid width in cells. */
  cols: number;
  /** Default size for items without one. */
  defaults?: { w: number; h: number };
  /** Storage adapter. Default `window.localStorage` (no-op when unavailable). */
  storage?: DashboardLayoutStorage | Storage | null;
  /**
   * Bump to discard stored layouts written under an older version (the
   * value is stored alongside the layout). Default 1.
   */
  version?: number;
}

export interface UseDashboardLayoutResult {
  layout: DashboardLayoutItem[];
  /** Pass to `DashboardGrid onLayoutChange`; persists and re-renders. */
  onLayoutChange: (next: DashboardLayoutItem[]) => void;
  /** Discard the stored layout and re-pack every item. */
  reset: () => void;
}

function isLayoutItem(value: unknown): value is DashboardLayoutItem {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === "string" &&
    [v.x, v.y, v.w, v.h].every((n) => typeof n === "number" && Number.isFinite(n) && n >= 0)
  );
}

function readStoredLayout(
  storage: DashboardLayoutStorage | null,
  key: string | undefined,
  version: number
): DashboardLayoutItem[] | null {
  if (!storage || !key) return null;
  try {
    const raw = storage.get(key);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    const list: unknown = Array.isArray(parsed)
      ? parsed
      : typeof parsed === "object" && parsed !== null && (parsed as { version?: unknown }).version === version
        ? (parsed as { layout?: unknown }).layout
        : null;
    if (!Array.isArray(list)) return null;
    const items = list.filter(isLayoutItem);
    return items.length === list.length ? items : null;
  } catch {
    return null;
  }
}

/**
 * Merge a stored layout with the current widget set.
 *
 * - Ids present in both keep their stored position and size.
 * - Ids no longer in `items` are dropped.
 * - New ids are packed into the first free rows below everything kept, in
 *   the order they appear in `items`, using their declared size.
 * - Items that are wider than `cols` are clamped.
 *
 * Returns a new array (in `items` order) or `stored` itself when nothing
 * changed, so callers can compare by identity.
 */
export function reconcileLayout(
  stored: readonly DashboardLayoutItem[] | null,
  items: ReadonlyArray<string | PackLayoutItem>,
  cols: number,
  defaults: { w: number; h: number } = { w: 4, h: 2 }
): DashboardLayoutItem[] {
  const specs = items.map((i) => (typeof i === "string" ? { id: i } : i));
  if (!stored) return packLayout(specs, cols, defaults);
  const byId = new Map(stored.map((s) => [s.id, s] as const));
  const kept: DashboardLayoutItem[] = [];
  const fresh: PackLayoutItem[] = [];
  for (const spec of specs) {
    const s = byId.get(spec.id);
    if (s) {
      const w = Math.min(Math.max(1, cols), s.w);
      kept.push(w === s.w && s.x + w <= cols ? s : { ...s, w, x: Math.max(0, Math.min(s.x, cols - w)) });
    } else fresh.push(spec);
  }
  const usedRows = kept.reduce((m, k) => Math.max(m, k.y + k.h), 0);
  const packed = fresh.length ? packLayout(fresh, cols, { ...defaults, startY: usedRows }) : [];
  const packedById = new Map(packed.map((p) => [p.id, p] as const));
  const next = specs.map((spec) => byId.get(spec.id) ?? packedById.get(spec.id)!).map((entry) => {
    const k = kept.find((x) => x.id === entry.id);
    return k ?? entry;
  });
  const unchanged =
    next.length === stored.length && next.every((n, i) => n === stored[i]);
  return unchanged ? (stored as DashboardLayoutItem[]) : next;
}

function resolveStorage(
  storage: DashboardLayoutStorage | Storage | null | undefined
): DashboardLayoutStorage | null {
  if (storage === null) return null;
  if (storage === undefined) {
    if (typeof window === "undefined" || !window.localStorage) return null;
    storage = window.localStorage;
  }
  if ("getItem" in storage) {
    const s = storage;
    return {
      get: (k) => s.getItem(k),
      set: (k, v) => s.setItem(k, v),
      remove: (k) => s.removeItem(k),
    };
  }
  return storage;
}

/**
 * A `DashboardGrid` layout that survives reloads and widget-set changes.
 * Reads `storageKey` once, reconciles it with `items` (see
 * `reconcileLayout`) whenever the id set or `cols` changes, and writes
 * every `onLayoutChange` back.
 *
 * ```tsx
 * const { layout, onLayoutChange, reset } = useDashboardLayout({
 *   storageKey: "ops-dashboard",
 *   items: widgets.map((w) => ({ id: w.id, w: w.span, h: w.rows })),
 *   cols: 12,
 * });
 * <DashboardGrid items={layout} onLayoutChange={onLayoutChange} />
 * ```
 */
export function useDashboardLayout({
  storageKey,
  items,
  cols,
  defaults,
  storage: storageProp,
  version = 1,
}: UseDashboardLayoutOptions): UseDashboardLayoutResult {
  const storage = useMemo(() => resolveStorage(storageProp), [storageProp]);
  const itemsKey = items
    .map((i) => (typeof i === "string" ? i : `${i.id}:${i.w ?? ""}x${i.h ?? ""}`))
    .join("|");
  const [layout, setLayout] = useState<DashboardLayoutItem[]>(() =>
    reconcileLayout(readStoredLayout(storage, storageKey, version), items, cols, defaults)
  );
  const persist = useCallback(
    (next: DashboardLayoutItem[]) => {
      if (!storage || !storageKey) return;
      try {
        storage.set(storageKey, JSON.stringify({ version, layout: next }));
      } catch {
        /* storage full or unavailable */
      }
    },
    [storage, storageKey, version]
  );
  // Reconcile when the widget set or width changes.
  const lastKeyRef = useRef(`${itemsKey}#${cols}`);
  useEffect(() => {
    const key = `${itemsKey}#${cols}`;
    if (lastKeyRef.current === key) return;
    lastKeyRef.current = key;
    setLayout((prev) => {
      const next = reconcileLayout(prev, items, cols, defaults);
      if (next !== prev) persist(next);
      return next;
    });
    // `itemsKey` captures items' identity-relevant content.
  }, [itemsKey, cols, persist]);
  const onLayoutChange = useCallback(
    (next: DashboardLayoutItem[]) => {
      setLayout(next);
      persist(next);
    },
    [persist]
  );
  const reset = useCallback(() => {
    const next = packLayout(items, cols, defaults);
    setLayout(next);
    if (storage && storageKey) {
      try {
        storage.remove?.(storageKey);
      } catch {
        /* noop */
      }
    }
  }, [itemsKey, cols, defaults, storage, storageKey]);
  return { layout, onLayoutChange, reset };
}
