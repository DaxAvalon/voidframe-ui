"use client";

// Phase 11 — Swipeable, SwipeActions, Zoomable
//
// Pointer-event-based gesture wrappers. No external deps.

import {
  forwardRef,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type WheelEvent,
} from "react";
import { cx } from "../utils/cx";

// ── Swipeable ───────────────────────────────────────────────

export interface SwipeableProps extends HTMLAttributes<HTMLDivElement> {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  /** Pixels of travel before a swipe registers. Default 50. */
  threshold?: number;
  children?: ReactNode;
}

export const Swipeable = forwardRef<HTMLDivElement, SwipeableProps>(function Swipeable(
  {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    threshold = 50,
    className,
    children,
    onPointerDown,
    onPointerUp,
    ...props
  },
  ref
) {
  const start = useRef<{ x: number; y: number } | null>(null);
  return (
    <div
      ref={ref}
      className={cx("vf-swipeable", className)}
      onPointerDown={(e) => {
        start.current = { x: e.clientX, y: e.clientY };
        onPointerDown?.(e);
      }}
      onPointerUp={(e) => {
        const s = start.current;
        if (s) {
          const dx = e.clientX - s.x;
          const dy = e.clientY - s.y;
          if (Math.abs(dx) > Math.abs(dy)) {
            if (dx >= threshold) onSwipeRight?.();
            else if (dx <= -threshold) onSwipeLeft?.();
          } else {
            if (dy >= threshold) onSwipeDown?.();
            else if (dy <= -threshold) onSwipeUp?.();
          }
        }
        start.current = null;
        onPointerUp?.(e);
      }}
      {...props}
    >
      {children}
    </div>
  );
});
Swipeable.displayName = "Swipeable";

// ── SwipeActions (mobile list-row actions) ──────────────────

export interface SwipeActionsProps extends HTMLAttributes<HTMLDivElement> {
  leadingActions?: ReactNode;
  trailingActions?: ReactNode;
  /** Width of the action panel that gets revealed. Default 80. */
  actionWidth?: number;
  children?: ReactNode;
}

const SwipeActionsRoot = forwardRef<HTMLDivElement, SwipeActionsProps>(
  function SwipeActions(
    { leadingActions, trailingActions, actionWidth = 80, className, children, ...props },
    ref
  ) {
    const [offset, setOffset] = useState(0);
    const start = useRef<number | null>(null);
    const startOffset = useRef(0);

    const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
      start.current = e.clientX;
      startOffset.current = offset;
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        /* noop */
      }
    };
    const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
      if (start.current === null) return;
      const dx = e.clientX - start.current;
      let next = startOffset.current + dx;
      const max = trailingActions ? actionWidth : 0;
      const min = leadingActions ? -actionWidth : 0;
      next = Math.max(-max, Math.min(-min, -next));
      setOffset(-next);
    };
    const onPointerUp = () => {
      // Snap to nearest open/closed.
      if (Math.abs(offset) < actionWidth / 2) setOffset(0);
      else if (offset > 0) setOffset(actionWidth);
      else setOffset(-actionWidth);
      start.current = null;
    };

    return (
      <div
        ref={ref}
        className={cx("vf-swipe-actions", className)}
        {...props}
      >
        {leadingActions && (
          <div
            className="vf-swipe-actions__leading"
            style={{ width: actionWidth }}
          >
            {leadingActions}
          </div>
        )}
        <div
          className="vf-swipe-actions__content"
          style={{ transform: `translateX(${offset}px)` }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          {children}
        </div>
        {trailingActions && (
          <div
            className="vf-swipe-actions__trailing"
            style={{ width: actionWidth }}
          >
            {trailingActions}
          </div>
        )}
      </div>
    );
  }
);
SwipeActionsRoot.displayName = "SwipeActions";

export interface SwipeActionProps extends HTMLAttributes<HTMLButtonElement> {
  tone?: "neutral" | "success" | "warning" | "danger" | "info";
  children?: ReactNode;
}

const SwipeAction = forwardRef<HTMLButtonElement, SwipeActionProps>(
  function SwipeAction({ tone = "neutral", className, children, ...props }, ref) {
    return (
      <button
        ref={ref}
        type="button"
        className={cx(
          "vf-swipe-actions__action",
          `vf-swipe-actions__action--${tone}`,
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
SwipeAction.displayName = "SwipeAction";

export const SwipeActions = Object.assign(SwipeActionsRoot, {
  Action: SwipeAction,
});

// ── Zoomable (pan + pinch/wheel zoom) ────────────────────────

export interface ZoomableProps extends HTMLAttributes<HTMLDivElement> {
  min?: number;
  max?: number;
  step?: number;
  defaultScale?: number;
  scale?: number;
  onScaleChange?: (next: number) => void;
  /** Show the +/- controls. Default true. */
  controls?: boolean;
  children?: ReactNode;
}

export const Zoomable = forwardRef<HTMLDivElement, ZoomableProps>(function Zoomable(
  {
    min = 0.5,
    max = 4,
    step = 0.1,
    defaultScale = 1,
    scale: scaleProp,
    onScaleChange,
    controls = true,
    className,
    style,
    children,
    ...props
  },
  ref
) {
  const [internal, setInternal] = useState(defaultScale);
  const scale = scaleProp ?? internal;
  const setScale = (next: number) => {
    const clamped = Math.max(min, Math.min(max, next));
    if (scaleProp === undefined) setInternal(clamped);
    onScaleChange?.(clamped);
  };

  const [pan, setPan] = useState({ x: 0, y: 0 });
  const dragging = useRef<{ x: number; y: number } | null>(null);

  const onWheel = (e: WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    setScale(scale + (e.deltaY < 0 ? step : -step));
  };
  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (scale <= 1) return;
    dragging.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* noop */
    }
  };
  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    setPan({
      x: e.clientX - dragging.current.x,
      y: e.clientY - dragging.current.y,
    });
  };
  const onPointerUp = () => {
    dragging.current = null;
  };

  const merged: CSSProperties = {
    transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
    transformOrigin: "center center",
    transition: dragging.current ? "none" : "transform 0.15s ease",
    cursor: scale > 1 ? (dragging.current ? "grabbing" : "grab") : "default",
  };

  return (
    <div
      ref={ref}
      className={cx("vf-zoomable", className)}
      style={style}
      {...props}
    >
      <div
        className="vf-zoomable__viewport"
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div className="vf-zoomable__content" style={merged}>
          {children}
        </div>
      </div>
      {controls && (
        <div className="vf-zoomable__controls" role="group" aria-label="Zoom">
          <button
            type="button"
            className="vf-button vf-button--ghost"
            onClick={() => setScale(scale - step)}
            aria-label="Zoom out"
          >
            −
          </button>
          <span className="vf-zoomable__level">{Math.round(scale * 100)}%</span>
          <button
            type="button"
            className="vf-button vf-button--ghost"
            onClick={() => setScale(scale + step)}
            aria-label="Zoom in"
          >
            +
          </button>
          <button
            type="button"
            className="vf-button vf-button--ghost"
            onClick={() => {
              setScale(1);
              setPan({ x: 0, y: 0 });
            }}
            aria-label="Reset zoom"
          >
            Reset
          </button>
        </div>
      )}
    </div>
  );
});
Zoomable.displayName = "Zoomable";
