"use client";

import { useCallback, useEffect, useRef } from "react";

/**
 * Throttle a function. Call at most once every `interval` ms.
 * Leading-edge: the first call fires immediately; subsequent calls within
 * the interval are dropped (or held as "trailing" — see `trailing`).
 */
export function useThrottledCallback<A extends unknown[]>(
  fn: (...args: A) => void,
  interval: number,
  options: { leading?: boolean; trailing?: boolean } = {}
): (...args: A) => void {
  const { leading = true, trailing = true } = options;
  const fnRef = useRef(fn);
  useEffect(() => {
    fnRef.current = fn;
  }, [fn]);

  const lastCall = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingArgs = useRef<A | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  return useCallback(
    (...args: A) => {
      const now = Date.now();
      const elapsed = now - lastCall.current;
      if (elapsed >= interval) {
        if (leading) {
          lastCall.current = now;
          fnRef.current(...args);
        } else {
          // Leading disabled — schedule trailing if not already.
          pendingArgs.current = args;
          if (!timer.current) {
            lastCall.current = now;
            timer.current = setTimeout(() => {
              timer.current = null;
              const a = pendingArgs.current;
              pendingArgs.current = null;
              if (a) fnRef.current(...a);
            }, interval);
          }
        }
      } else if (trailing) {
        pendingArgs.current = args;
        if (!timer.current) {
          timer.current = setTimeout(() => {
            timer.current = null;
            lastCall.current = Date.now();
            const a = pendingArgs.current;
            pendingArgs.current = null;
            if (a) fnRef.current(...a);
          }, interval - elapsed);
        }
      }
    },
    [interval, leading, trailing]
  );
}
