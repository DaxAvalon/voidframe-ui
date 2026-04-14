import { useCallback, useEffect, useRef } from "react";

export interface DebouncedFn<A extends unknown[]> {
  (...args: A): void;
  cancel: () => void;
  flush: () => void;
}

/**
 * Debounce a function. Calls are coalesced — only the last invocation within
 * `delay` ms runs (after the quiet window elapses).
 *
 * The returned function has `.cancel()` and `.flush()` helpers; also cancelled
 * automatically on unmount.
 */
export function useDebouncedCallback<A extends unknown[]>(
  fn: (...args: A) => void,
  delay: number
): DebouncedFn<A> {
  const fnRef = useRef(fn);
  useEffect(() => {
    fnRef.current = fn;
  }, [fn]);

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestArgs = useRef<A | null>(null);

  const cancel = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    latestArgs.current = null;
  }, []);

  const flush = useCallback(() => {
    if (timer.current && latestArgs.current) {
      clearTimeout(timer.current);
      const args = latestArgs.current;
      timer.current = null;
      latestArgs.current = null;
      fnRef.current(...args);
    }
  }, []);

  const debounced = useCallback(
    (...args: A) => {
      latestArgs.current = args;
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        timer.current = null;
        if (latestArgs.current) {
          const a = latestArgs.current;
          latestArgs.current = null;
          fnRef.current(...a);
        }
      }, delay);
    },
    [delay]
  );

  useEffect(() => cancel, [cancel]);

  const result = debounced as DebouncedFn<A>;
  result.cancel = cancel;
  result.flush = flush;
  return result;
}
