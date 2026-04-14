import { useCallback, useRef, type PointerEvent as ReactPointerEvent } from "react";

export interface UseLongPressOptions {
  /** Milliseconds to hold before firing. Default 500. */
  threshold?: number;
  /** Called on release if threshold wasn't reached. */
  onCancel?: () => void;
}

export interface LongPressBindings {
  onPointerDown: (e: ReactPointerEvent) => void;
  onPointerUp: (e: ReactPointerEvent) => void;
  onPointerLeave: (e: ReactPointerEvent) => void;
  onPointerCancel: (e: ReactPointerEvent) => void;
}

/**
 * Long-press detection. Returns bindings to spread onto the target element.
 */
export function useLongPress(
  handler: (e: ReactPointerEvent) => void,
  { threshold = 500, onCancel }: UseLongPressOptions = {}
): LongPressBindings {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fired = useRef(false);

  const start = useCallback(
    (e: ReactPointerEvent) => {
      fired.current = false;
      timer.current = setTimeout(() => {
        fired.current = true;
        handler(e);
      }, threshold);
    },
    [handler, threshold]
  );

  const cancel = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    if (!fired.current) onCancel?.();
  }, [onCancel]);

  return {
    onPointerDown: start,
    onPointerUp: cancel,
    onPointerLeave: cancel,
    onPointerCancel: cancel,
  };
}
