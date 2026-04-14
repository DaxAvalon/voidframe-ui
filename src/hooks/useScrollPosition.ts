import { useEffect, useState, type RefObject } from "react";

export interface ScrollPos {
  x: number;
  y: number;
}

/**
 * Track scroll position of a specific element (as opposed to `useScroll` which
 * tracks `window`). Returns `{ x: 0, y: 0 }` until first scroll event.
 */
export function useScrollPosition<T extends HTMLElement>(
  ref: RefObject<T>
): ScrollPos {
  const [pos, setPos] = useState<ScrollPos>({ x: 0, y: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handler = () => setPos({ x: el.scrollLeft, y: el.scrollTop });
    handler(); // seed
    el.addEventListener("scroll", handler, { passive: true });
    return () => el.removeEventListener("scroll", handler);
  }, [ref]);

  return pos;
}
