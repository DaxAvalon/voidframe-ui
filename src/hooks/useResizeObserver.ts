"use client";

import { useEffect, useState, type RefObject } from "react";

export interface ResizeSize {
  width: number;
  height: number;
}

/**
 * Observe an element's content-box size.
 * Returns `{ width: 0, height: 0 }` until the first measurement.
 */
export function useResizeObserver<T extends Element>(
  ref: RefObject<T>
): ResizeSize {
  const [size, setSize] = useState<ResizeSize>({ width: 0, height: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const { width, height } = entry.contentRect;
      setSize({ width, height });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);

  return size;
}
