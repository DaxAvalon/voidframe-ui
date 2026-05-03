"use client";

// Phase 9 — Virtualization: VirtualList, VirtualGrid, InfiniteScroll
//
// Windowed rendering for large datasets. Keeps things small and dependency-free.

import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
  type UIEvent,
} from "react";
import { cx } from "../utils/cx";
import { genericForwardRef } from "../utils/forwardRef";
import { genericMemo } from "../utils/genericMemo";

// ── VirtualList ──────────────────────────────────────────────

export interface VirtualListProps<T>
  extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  items: T[];
  itemHeight: number | ((index: number, item: T) => number);
  /**
   * Hint for the average rendered size when `itemHeight` is a function.
   * Unmeasured rows use this value for offset/viewport math on first paint;
   * real measurements (via ResizeObserver on rendered rows) progressively
   * replace estimates. Ignored when `itemHeight` is a number. Without this
   * hint, variable-height lists fall back to calling `itemHeight(index, item)`
   * for every item on mount — fine for hundreds of rows, not thousands.
   */
  estimatedItemHeight?: number;
  /** Rows to render beyond the visible window. */
  overscan?: number;
  horizontal?: boolean;
  renderItem: (item: T, index: number, style: CSSProperties) => ReactNode;
  onEndReached?: () => void;
  /** Threshold (0..1) of the viewport before onEndReached fires. */
  endThreshold?: number;
  style?: CSSProperties;
}

/**
 * Virtualised 1D list. Renders only the visible rows; supports variable
 * height via measurement.
 */
const VirtualListImpl = genericForwardRef(function VirtualList<T>(
  {
    items,
    itemHeight,
    estimatedItemHeight,
    overscan = 3,
    horizontal,
    renderItem,
    onEndReached,
    endThreshold = 0.9,
    className,
    style,
    ...props
  }: VirtualListProps<T>,
  ref: React.ForwardedRef<HTMLDivElement>
) {
  const [viewportSize, setViewportSize] = useState(0);
  const [scrollOffset, setScrollOffset] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Measured-size cache: index → measured pixel extent. Only written when a
  // rendered row's ResizeObserver reports a concrete size. Used in preference
  // to `itemHeight()` / `estimatedItemHeight` whenever available.
  const [measured, setMeasured] = useState<Map<number, number>>(() => new Map());
  const useEstimate =
    typeof itemHeight === "function" && typeof estimatedItemHeight === "number";

  const resolveSize = useCallback(
    (index: number): number => {
      const hit = measured.get(index);
      if (hit !== undefined) return hit;
      if (typeof itemHeight === "number") return itemHeight;
      if (useEstimate) return estimatedItemHeight as number;
      return itemHeight(index, items[index]!);
    },
    [itemHeight, items, measured, useEstimate, estimatedItemHeight]
  );

  // Pre-compute offsets; cheap for fixed size, O(n) for variable.
  const offsets = useMemo(() => {
    const arr: number[] = [];
    let offset = 0;
    for (let i = 0; i < items.length; i++) {
      arr.push(offset);
      offset += resolveSize(i);
    }
    return { offsets: arr, total: offset };
  }, [items, resolveSize]);

  const totalSize = offsets.total;

  const setFromEl = (el: HTMLDivElement | null) => {
    containerRef.current = el;
    if (typeof ref === "function") ref(el);
    else if (ref) (ref as { current: HTMLDivElement | null }).current = el;
    if (el) {
      setViewportSize(horizontal ? el.clientWidth : el.clientHeight);
    }
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      setViewportSize(horizontal ? el.clientWidth : el.clientHeight);
    };
    update();
    if (typeof ResizeObserver !== "undefined") {
      const ro = new ResizeObserver(update);
      ro.observe(el);
      return () => ro.disconnect();
    }
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [horizontal]);

  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const next = horizontal ? el.scrollLeft : el.scrollTop;
    setScrollOffset(next);
    if (onEndReached) {
      const threshold = (next + viewportSize) / Math.max(1, totalSize);
      if (threshold >= endThreshold) onEndReached();
    }
  };

  // Binary-search the start index — sufficient for fixed size, OK for variable.
  const startIndex = useMemo(() => {
    if (items.length === 0) return 0;
    let lo = 0;
    let hi = items.length - 1;
    while (lo < hi) {
      const mid = (lo + hi) >>> 1;
      const next = offsets.offsets[mid + 1] ?? totalSize;
      if (next <= scrollOffset) lo = mid + 1;
      else hi = mid;
    }
    return Math.max(0, lo - overscan);
  }, [items, offsets, scrollOffset, totalSize, overscan]);

  const endIndex = useMemo(() => {
    if (items.length === 0) return 0;
    let i = startIndex;
    const limit = scrollOffset + viewportSize;
    while (
      i < items.length &&
      (offsets.offsets[i] ?? totalSize) < limit
    ) {
      i++;
    }
    return Math.min(items.length - 1, i + overscan);
  }, [items, offsets, scrollOffset, viewportSize, totalSize, overscan, startIndex]);

  // ResizeObserver-driven measurement: write rendered rows' actual extents
  // back into `measured` so subsequent offset calculations use real sizes
  // instead of `estimatedItemHeight`. Only active when useEstimate is set.
  const observeRow = useCallback(
    (index: number) => (el: HTMLDivElement | null) => {
      if (!useEstimate || !el || typeof ResizeObserver === "undefined") return;
      const ro = new ResizeObserver(() => {
        const size = horizontal ? el.offsetWidth : el.offsetHeight;
        if (!size) return;
        setMeasured((prev) => {
          if (prev.get(index) === size) return prev;
          const next = new Map(prev);
          next.set(index, size);
          return next;
        });
      });
      ro.observe(el);
      (el as unknown as { __vfRo?: ResizeObserver }).__vfRo = ro;
    },
    [useEstimate, horizontal]
  );

  const slice: ReactNode[] = [];
  for (let i = startIndex; i <= endIndex; i++) {
    const item = items[i];
    if (item === undefined) continue;
    const pos = offsets.offsets[i] ?? 0;
    const size = resolveSize(i);
    // When using estimates, wrap each row in a measuring slot. The wrapper is
    // absolutely positioned and lets the consumer's content define its own
    // height, which ResizeObserver then reports back.
    if (useEstimate) {
      const slotStyle: CSSProperties = horizontal
        ? { position: "absolute", left: pos, top: 0, height: "100%" }
        : { position: "absolute", top: pos, left: 0, width: "100%" };
      const inner: CSSProperties = horizontal
        ? { height: "100%" }
        : { width: "100%" };
      slice.push(
        <div key={i} ref={observeRow(i)} style={slotStyle} data-item-index={i}>
          {renderItem(item, i, inner)}
        </div>
      );
      continue;
    }
    const style: CSSProperties = horizontal
      ? { position: "absolute", left: pos, top: 0, width: size, height: "100%" }
      : { position: "absolute", top: pos, left: 0, width: "100%", height: size };
    slice.push(renderItem(item, i, style));
  }

  const outerStyle: CSSProperties = {
    position: "relative",
    overflow: "auto",
    ...style,
  };
  const innerStyle: CSSProperties = horizontal
    ? { position: "relative", width: totalSize, height: "100%" }
    : { position: "relative", height: totalSize, width: "100%" };

  return (
    <div
      ref={setFromEl}
      className={cx("vf-virtual-list", horizontal && "vf-virtual-list--horizontal", className)}
      style={outerStyle}
      onScroll={handleScroll}
      {...props}
    >
      <div style={innerStyle}>{slice}</div>
    </div>
  );
});
(VirtualListImpl as { displayName?: string }).displayName = "VirtualList";

/**
 * Virtualized list. Memoized via `genericMemo` so the per-item-type
 * generic survives. Parent re-renders with stable `items` / `renderItem`
 * skip the slice computation + visible-window render.
 */
export const VirtualList = genericMemo(VirtualListImpl);
(VirtualList as unknown as { displayName: string }).displayName = "VirtualList";

// ── VirtualGrid ──────────────────────────────────────────────

export interface VirtualGridProps<T>
  extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  items: T[];
  columnCount: number;
  rowHeight: number;
  columnWidth: number;
  overscan?: number;
  renderCell: (item: T, index: number, style: CSSProperties) => ReactNode;
  style?: CSSProperties;
}

/**
 * Virtualised 2D grid. Renders only the visible cells; suitable for
 * thousands of items.
 */
const VirtualGridImpl = genericForwardRef(function VirtualGrid<T>(
  {
    items,
    columnCount,
    rowHeight,
    columnWidth,
    overscan = 2,
    renderCell,
    className,
    style,
    ...props
  }: VirtualGridProps<T>,
  ref: React.ForwardedRef<HTMLDivElement>
) {
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);
  const elRef = useRef<HTMLDivElement | null>(null);

  const setFromEl = (el: HTMLDivElement | null) => {
    elRef.current = el;
    if (typeof ref === "function") ref(el);
    else if (ref) (ref as { current: HTMLDivElement | null }).current = el;
    if (el) setViewportHeight(el.clientHeight);
  };

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;
    const update = () => setViewportHeight(el.clientHeight);
    update();
    if (typeof ResizeObserver !== "undefined") {
      const ro = new ResizeObserver(update);
      ro.observe(el);
      return () => ro.disconnect();
    }
    return;
  }, []);

  const rowCount = Math.ceil(items.length / columnCount);
  const totalHeight = rowCount * rowHeight;

  const startRow = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
  const endRow = Math.min(
    rowCount - 1,
    Math.ceil((scrollTop + viewportHeight) / rowHeight) + overscan
  );

  const cells: ReactNode[] = [];
  for (let r = startRow; r <= endRow; r++) {
    for (let c = 0; c < columnCount; c++) {
      const idx = r * columnCount + c;
      if (idx >= items.length) break;
      const cellStyle: CSSProperties = {
        position: "absolute",
        top: r * rowHeight,
        left: c * columnWidth,
        width: columnWidth,
        height: rowHeight,
      };
      cells.push(renderCell(items[idx]!, idx, cellStyle));
    }
  }

  return (
    <div
      ref={setFromEl}
      className={cx("vf-virtual-grid", className)}
      style={{ position: "relative", overflow: "auto", ...style }}
      onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
      {...props}
    >
      <div
        style={{
          position: "relative",
          height: totalHeight,
          width: columnCount * columnWidth,
        }}
      >
        {cells}
      </div>
    </div>
  );
});
(VirtualGridImpl as { displayName?: string }).displayName = "VirtualGrid";

/** Virtualized 2D grid. Memoized at the export site (generic-preserving). */
export const VirtualGrid = genericMemo(VirtualGridImpl);
(VirtualGrid as unknown as { displayName: string }).displayName = "VirtualGrid";

// ── InfiniteScroll ───────────────────────────────────────────

export interface InfiniteScrollProps extends HTMLAttributes<HTMLDivElement> {
  hasMore: boolean;
  loading?: boolean;
  onLoadMore: () => void;
  /** Threshold 0..1 of the parent scroll before triggering load. Default 0.8. */
  threshold?: number;
  loader?: ReactNode;
  /** When supplied, observes this element's scroll. Otherwise observes window. */
  scrollParent?: HTMLElement | null;
}

/**
 * Infinite scroll loader. Calls `onLoadMore` when the sentinel enters the
 * viewport; renders a loading indicator slot.
 */
export const InfiniteScroll = forwardRef<HTMLDivElement, InfiniteScrollProps>(
  function InfiniteScroll(
    {
      hasMore,
      loading,
      onLoadMore,
      threshold = 0.8,
      loader,
      scrollParent,
      className,
      children,
      ...props
    },
    ref
  ) {
    const sentinelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (!hasMore) return;
      const target = sentinelRef.current;
      if (!target) return;
      if (typeof IntersectionObserver === "undefined") return;
      let hasFired = false;
      const io = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              if (!loading && !hasFired) {
                hasFired = true;
                onLoadMore();
              }
            } else {
              // Sentinel out of view → reset guard for the next intersection.
              hasFired = false;
            }
          }
        },
        { root: scrollParent ?? null, threshold }
      );
      io.observe(target);
      return () => io.disconnect();
    }, [hasMore, loading, onLoadMore, scrollParent, threshold]);

    return (
      <div
        ref={ref}
        className={cx("vf-infinite-scroll", className)}
        {...props}
      >
        {children}
        <div ref={sentinelRef} className="vf-infinite-scroll__sentinel" aria-hidden="true" />
        {loading && (loader ?? <div className="vf-infinite-scroll__loader">Loading…</div>)}
      </div>
    );
  }
);
InfiniteScroll.displayName = "InfiniteScroll";
