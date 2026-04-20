"use client";

// Phase 8 — ResizableGroup / ResizablePanel / ResizableHandle
//
// A simple N-panel resizable layout driven by percentage sizes that always
// sum to 100. Drag a handle to redistribute weight between the two adjacent
// panels. Keyboard-accessible: ArrowLeft/Right or ArrowUp/Down on a focused
// handle adjusts by 1% per press.

import {
  Children,
  createContext,
  forwardRef,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactElement,
  type ReactNode,
} from "react";
import { cx } from "../utils/cx";

export type ResizableDirection = "horizontal" | "vertical";

interface ResizableContextValue {
  direction: ResizableDirection;
  sizes: number[];
  setSizeDelta: (handleIdx: number, delta: number) => void;
}

const ResizableContext = createContext<ResizableContextValue | null>(null);

export interface ResizableGroupProps extends HTMLAttributes<HTMLDivElement> {
  direction?: ResizableDirection;
  /** Percent sizes per panel. Must sum to 100 if provided. */
  defaultSizes?: number[];
  sizes?: number[];
  onLayout?: (sizes: number[]) => void;
  children?: ReactNode;
  style?: CSSProperties;
}

/**
 * Group of panes sharing a split. Drag handles redistribute space among
 * siblings.
 */
export const ResizableGroup = forwardRef<HTMLDivElement, ResizableGroupProps>(
  function ResizableGroup(
    {
      direction = "horizontal",
      defaultSizes,
      sizes: controlledSizes,
      onLayout,
      children,
      className,
      style,
      ...props
    },
    ref
  ) {
    const panelCount = useMemo(() => {
      let n = 0;
      Children.forEach(children, (child) => {
        if (isValidElement(child) && (child as ReactElement).type === ResizablePanel) {
          n++;
        }
      });
      return n;
    }, [children]);

    const initial = useMemo(() => {
      if (controlledSizes) return controlledSizes;
      if (defaultSizes && defaultSizes.length === panelCount) return defaultSizes;
      if (panelCount === 0) return [];
      return Array.from({ length: panelCount }, () => 100 / panelCount);
    }, [controlledSizes, defaultSizes, panelCount]);

    const [internalSizes, setInternalSizes] = useState<number[]>(initial);
    const sizes = controlledSizes ?? internalSizes;

    useEffect(() => {
      if (controlledSizes) return;
      // Resync when panel count changes.
      if (internalSizes.length !== panelCount) {
        setInternalSizes(initial);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [panelCount]);

    const setSizeDelta = useCallback(
      (handleIdx: number, deltaPct: number) => {
        const next = [...sizes];
        const left = next[handleIdx] ?? 0;
        const right = next[handleIdx + 1] ?? 0;
        const min = 5;
        const l = Math.max(min, Math.min(100 - min, left + deltaPct));
        const diff = l - left;
        next[handleIdx] = l;
        next[handleIdx + 1] = Math.max(min, right - diff);
        if (!controlledSizes) setInternalSizes(next);
        onLayout?.(next);
      },
      [sizes, controlledSizes, onLayout]
    );

    const ctxValue = useMemo<ResizableContextValue>(
      () => ({ direction, sizes, setSizeDelta }),
      [direction, sizes, setSizeDelta]
    );

    return (
      <ResizableContext.Provider value={ctxValue}>
        <div
          ref={ref}
          className={cx(
            "vf-resizable",
            `vf-resizable--${direction}`,
            className
          )}
          style={{
            display: "flex",
            flexDirection: direction === "horizontal" ? "row" : "column",
            width: "100%",
            height: "100%",
            ...style,
          }}
          {...props}
        >
          {renderWithIndices(children)}
        </div>
      </ResizableContext.Provider>
    );
  }
);
ResizableGroup.displayName = "ResizableGroup";

function renderWithIndices(children: ReactNode): ReactNode {
  let panelIdx = -1;
  let handleIdx = -1;
  return Children.map(children, (child) => {
    if (!isValidElement(child)) return child;
    const el = child as ReactElement;
    if (el.type === ResizablePanel) {
      panelIdx++;
      return (
        <ResizablePanel
          {...(el.props as ResizablePanelProps)}
          __index={panelIdx}
        />
      );
    }
    if (el.type === ResizableHandle) {
      handleIdx++;
      return (
        <ResizableHandle
          {...(el.props as ResizableHandleProps)}
          __index={handleIdx}
        />
      );
    }
    return child;
  });
}

export interface ResizablePanelProps extends HTMLAttributes<HTMLDivElement> {
  /** Percent (0..100). Used only if the group's defaultSizes isn't provided. */
  defaultSize?: number;
  minSize?: number;
  maxSize?: number;
  children?: ReactNode;
  /** @internal — set by ResizableGroup. */
  __index?: number;
}

/**
 * Single pane inside a `ResizableGroup`. Configurable min/max/default size.
 */
export const ResizablePanel = forwardRef<HTMLDivElement, ResizablePanelProps>(
  function ResizablePanel(
    { children, className, style, __index, ...props },
    ref
  ) {
    const ctx = useContext(ResizableContext);
    const idx = __index ?? 0;
    const pct = ctx?.sizes[idx] ?? 50;
    return (
      <div
        ref={ref}
        className={cx("vf-resizable__panel", className)}
        style={{
          flex: `${pct} 1 0`,
          overflow: "auto",
          ...style,
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);
ResizablePanel.displayName = "ResizablePanel";

export interface ResizableHandleProps extends HTMLAttributes<HTMLDivElement> {
  /** Step size when using keyboard. Default 1 (in percent). */
  keyboardStep?: number;
  /** @internal — set by ResizableGroup. */
  __index?: number;
}

/**
 * Drag handle subpart for `ResizableGroup` / `ResizablePanel`.
 * Keyboard-resizable with arrow keys.
 */
export const ResizableHandle = forwardRef<HTMLDivElement, ResizableHandleProps>(
  function ResizableHandle(
    { className, keyboardStep = 1, __index, ...props },
    ref
  ) {
    const ctx = useContext(ResizableContext);
    const idx = __index ?? 0;
    const containerRef = useRef<HTMLDivElement>(null);
    const dragging = useRef<{ startX: number; startY: number; rectSize: number } | null>(
      null
    );

    const handleDown = (e: ReactPointerEvent<HTMLDivElement>) => {
      if (!ctx) return;
      const parent = e.currentTarget.parentElement;
      const rect = parent?.getBoundingClientRect();
      if (!rect) return;
      e.currentTarget.setPointerCapture(e.pointerId);
      dragging.current = {
        startX: e.clientX,
        startY: e.clientY,
        rectSize: ctx.direction === "horizontal" ? rect.width : rect.height,
      };
    };

    const handleMove = (e: ReactPointerEvent<HTMLDivElement>) => {
      const d = dragging.current;
      if (!d || !ctx) return;
      const delta =
        ctx.direction === "horizontal" ? e.clientX - d.startX : e.clientY - d.startY;
      const pct = (delta / d.rectSize) * 100;
      if (Math.abs(pct) < 0.1) return;
      ctx.setSizeDelta(idx, pct);
      // Re-anchor so the handle tracks continuously.
      d.startX = e.clientX;
      d.startY = e.clientY;
    };

    const handleUp = (e: ReactPointerEvent<HTMLDivElement>) => {
      if (dragging.current) {
        try {
          e.currentTarget.releasePointerCapture(e.pointerId);
        } catch {
          /* noop */
        }
        dragging.current = null;
      }
    };

    const handleKey = (e: KeyboardEvent<HTMLDivElement>) => {
      if (!ctx) return;
      const forward =
        (ctx.direction === "horizontal" && e.key === "ArrowRight") ||
        (ctx.direction === "vertical" && e.key === "ArrowDown");
      const backward =
        (ctx.direction === "horizontal" && e.key === "ArrowLeft") ||
        (ctx.direction === "vertical" && e.key === "ArrowUp");
      if (!forward && !backward) return;
      e.preventDefault();
      ctx.setSizeDelta(idx, forward ? keyboardStep : -keyboardStep);
    };

    return (
      <div
        ref={(node) => {
          (containerRef as { current: HTMLDivElement | null }).current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) (ref as { current: HTMLDivElement | null }).current = node;
        }}
        role="separator"
        aria-orientation={ctx?.direction === "horizontal" ? "vertical" : "horizontal"}
        tabIndex={0}
        className={cx(
          "vf-resizable__handle",
          ctx && `vf-resizable__handle--${ctx.direction}`,
          className
        )}
        onPointerDown={handleDown}
        onPointerMove={handleMove}
        onPointerUp={handleUp}
        onPointerCancel={handleUp}
        onKeyDown={handleKey}
        {...props}
      />
    );
  }
);
ResizableHandle.displayName = "ResizableHandle";

// ── ResizableBox ─────────────────────────────────────────────
//
// Standalone freeform resize: drag the corner (or edge) grip to resize a
// single box. Use `axis="x"` / `"y"` / `"both"` to limit the dimensions.

export type ResizableAxis = "x" | "y" | "both";

export interface ResizableBoxProps extends HTMLAttributes<HTMLDivElement> {
  axis?: ResizableAxis;
  defaultWidth?: number;
  defaultHeight?: number;
  width?: number;
  height?: number;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  onResize?: (size: { width: number; height: number }) => void;
  children?: ReactNode;
}

/**
 * Resizable container with configurable handles. Emits `onResize({ width,
 * height })`.
 */
export const ResizableBox = forwardRef<HTMLDivElement, ResizableBoxProps>(
  function ResizableBox(
    {
      axis = "both",
      defaultWidth = 320,
      defaultHeight = 200,
      width: controlledW,
      height: controlledH,
      minWidth = 80,
      minHeight = 60,
      maxWidth,
      maxHeight,
      onResize,
      className,
      style,
      children,
      ...props
    },
    ref
  ) {
    const [w, setW] = useState(controlledW ?? defaultWidth);
    const [h, setH] = useState(controlledH ?? defaultHeight);
    // Keep internal state aligned with controlled props so a later uncontrolled
    // use or child consumers of `liveW`/`liveH` stay in sync.
    useEffect(() => {
      if (controlledW !== undefined) setW(controlledW);
    }, [controlledW]);
    useEffect(() => {
      if (controlledH !== undefined) setH(controlledH);
    }, [controlledH]);
    const liveW = controlledW ?? w;
    const liveH = controlledH ?? h;
    const dragging = useRef<{
      startX: number;
      startY: number;
      startW: number;
      startH: number;
      which: "corner" | "right" | "bottom";
    } | null>(null);

    const clamp = useCallback(
      (next: { width: number; height: number }) => ({
        width: Math.max(minWidth, Math.min(maxWidth ?? Infinity, next.width)),
        height: Math.max(minHeight, Math.min(maxHeight ?? Infinity, next.height)),
      }),
      [minWidth, minHeight, maxWidth, maxHeight]
    );

    const onDown =
      (which: "corner" | "right" | "bottom") =>
      (e: ReactPointerEvent<HTMLDivElement>) => {
        e.stopPropagation();
        dragging.current = {
          startX: e.clientX,
          startY: e.clientY,
          startW: liveW,
          startH: liveH,
          which,
        };
        try {
          e.currentTarget.setPointerCapture(e.pointerId);
        } catch {
          /* noop */
        }
      };
    const onMove = (e: ReactPointerEvent<HTMLDivElement>) => {
      const d = dragging.current;
      if (!d) return;
      const dx = e.clientX - d.startX;
      const dy = e.clientY - d.startY;
      const next = clamp({
        width:
          (axis === "y" || d.which === "bottom") ? d.startW : d.startW + dx,
        height:
          (axis === "x" || d.which === "right") ? d.startH : d.startH + dy,
      });
      if (controlledW === undefined) setW(next.width);
      if (controlledH === undefined) setH(next.height);
      onResize?.(next);
    };
    const onUp = (e: ReactPointerEvent<HTMLDivElement>) => {
      if (!dragging.current) return;
      dragging.current = null;
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        /* noop */
      }
    };

    const showX = axis !== "y";
    const showY = axis !== "x";
    const showCorner = axis === "both";

    return (
      <div
        ref={ref}
        className={cx("vf-resizable-box", className)}
        style={{
          width: `${liveW}px`,
          height: `${liveH}px`,
          position: "relative",
          ...style,
        }}
        {...props}
      >
        {children}
        {showX && (
          <div
            role="separator"
            aria-orientation="vertical"
            aria-label="Resize width"
            className="vf-resizable-box__grip vf-resizable-box__grip--right"
            onPointerDown={onDown("right")}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
          />
        )}
        {showY && (
          <div
            role="separator"
            aria-orientation="horizontal"
            aria-label="Resize height"
            className="vf-resizable-box__grip vf-resizable-box__grip--bottom"
            onPointerDown={onDown("bottom")}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
          />
        )}
        {showCorner && (
          <div
            role="separator"
            aria-label="Resize"
            className="vf-resizable-box__grip vf-resizable-box__grip--corner"
            onPointerDown={onDown("corner")}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
          />
        )}
      </div>
    );
  }
);
ResizableBox.displayName = "ResizableBox";
