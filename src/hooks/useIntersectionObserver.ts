"use client";

import { useEffect, useState, type RefObject } from "react";

export interface UseIntersectionOptions {
  root?: Element | null;
  rootMargin?: string;
  threshold?: number | number[];
  /** Disconnect after first intersection. */
  once?: boolean;
}

export interface IntersectionState {
  isIntersecting: boolean;
  entry: IntersectionObserverEntry | null;
}

/**
 * Observe element intersection with the viewport (or a custom root).
 */
export function useIntersectionObserver<T extends Element>(
  ref: RefObject<T>,
  options: UseIntersectionOptions = {}
): IntersectionState {
  const { root = null, rootMargin, threshold, once } = options;
  const [state, setState] = useState<IntersectionState>({
    isIntersecting: false,
    entry: null,
  });

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        setState({ isIntersecting: entry.isIntersecting, entry });
        if (once && entry.isIntersecting) observer.disconnect();
      },
      { root, rootMargin, threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, root, rootMargin, threshold, once]);

  return state;
}
