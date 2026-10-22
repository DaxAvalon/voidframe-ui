"use client";

import { useCallback, useRef, type PointerEvent as ReactPointerEvent } from "react";

export interface UseLongPressOptions {
  /** Milliseconds to hold before firing. Default 500. */
  threshold?: number;
  /** Called on release if threshold wasn't reached. */
  onCancel?: () => void;
  /**
   * Pointer movement (px) tolerated before the press is cancelled, so a
   * scrolling finger does not fire and a drifting one is not cancelled.
   * Default 10.
   */
  moveTolerance?: number;
  /** Cancel when the pointer leaves the element. Default false (the slop rule decides). */
  cancelOnLeave?: boolean;
}

export interface LongPressBindings {
  onPointerDown: (e: ReactPointerEvent) => void;
  onPointerMove: (e: ReactPointerEvent) => void;
  onPointerUp: (e: ReactPointerEvent) => void;
  onPointerLeave: (e: ReactPointerEvent) => void;
  onPointerCancel: (e: ReactPointerEvent) => void;
}

/**
 * Long-press detection. Returns bindings to spread onto the target element.
 * Movement beyond `moveTolerance` cancels (touch scrolling), leaving the
 * element does not unless `cancelOnLeave` is set.
 */
export function useLongPress(
  handler: (e: ReactPointerEvent) => void,
  { threshold = 500, onCancel, moveTolerance = 10, cancelOnLeave = false }: UseLongPressOptions = {}
): LongPressBindings {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fired = useRef(false);
  const origin = useRef<{ x: number; y: number } | null>(null);

  const cancel = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    const wasPending = timer.current !== null;
    timer.current = null;
    origin.current = null;
    if (wasPending && !fired.current) onCancel?.();
  }, [onCancel]);

  const start = useCallback(
    (e: ReactPointerEvent) => {
      if (timer.current) clearTimeout(timer.current);
      fired.current = false;
      origin.current = { x: e.clientX, y: e.clientY };
      timer.current = setTimeout(() => {
        timer.current = null;
        fired.current = true;
        origin.current = null;
        handler(e);
      }, threshold);
    },
    [handler, threshold]
  );

  const move = useCallback(
    (e: ReactPointerEvent) => {
      if (!origin.current || timer.current === null) return;
      const dx = e.clientX - origin.current.x;
      const dy = e.clientY - origin.current.y;
      if (Math.hypot(dx, dy) > moveTolerance) cancel();
    },
    [moveTolerance, cancel]
  );

  const leave = useCallback(() => {
    if (cancelOnLeave) cancel();
  }, [cancelOnLeave, cancel]);

  return {
    onPointerDown: start,
    onPointerMove: move,
    onPointerUp: cancel,
    onPointerLeave: leave,
    onPointerCancel: cancel,
  };
}
