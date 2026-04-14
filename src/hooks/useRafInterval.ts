import { useEffect, useRef } from "react";

/**
 * Repeating callback driven by `requestAnimationFrame`. Fires at most once
 * per `ms` milliseconds (defaults to every frame).
 *
 * Use for scroll/animation loops where visual fidelity matters more than
 * timer precision. Pass `null` to pause.
 */
export function useRafInterval(callback: () => void, ms: number | null = 0): void {
  const cbRef = useRef(callback);
  useEffect(() => {
    cbRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (ms === null) return;
    let rafId = 0;
    let cancelled = false;
    let last = performance.now();

    const tick = (now: number) => {
      if (cancelled) return;
      if (now - last >= ms) {
        last = now;
        cbRef.current();
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
    };
  }, [ms]);
}
