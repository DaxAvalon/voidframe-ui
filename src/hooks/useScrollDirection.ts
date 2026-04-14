import { useEffect, useRef, useState } from "react";

export type ScrollDirection = "up" | "down" | null;

export interface UseScrollDirectionOptions {
  /** Minimum pixels between reports (reduces noise). Default 4. */
  threshold?: number;
  /** Element to observe (defaults to window scroll). */
  target?: HTMLElement | null;
}

/**
 * Tracks whether the user is scrolling up or down.
 * Returns `null` until the first scroll event.
 */
export function useScrollDirection({
  threshold = 4,
  target = null,
}: UseScrollDirectionOptions = {}): ScrollDirection {
  const [dir, setDir] = useState<ScrollDirection>(null);
  const last = useRef(0);

  useEffect(() => {
    const getY = () =>
      target ? target.scrollTop : window.scrollY ?? window.pageYOffset;
    last.current = getY();
    const handler = () => {
      const y = getY();
      if (Math.abs(y - last.current) < threshold) return;
      setDir(y > last.current ? "down" : "up");
      last.current = y;
    };
    const source: EventTarget = target ?? window;
    source.addEventListener("scroll", handler, { passive: true });
    return () => source.removeEventListener("scroll", handler);
  }, [threshold, target]);

  return dir;
}
