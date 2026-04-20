"use client";

import { useCallback, useMemo, useRef, useState } from "react";

export interface UseSetReturn<T> {
  set: ReadonlySet<T>;
  add: (value: T) => void;
  remove: (value: T) => void;
  toggle: (value: T) => void;
  has: (value: T) => boolean;
  clear: () => void;
  size: number;
  reset: (initial?: Iterable<T>) => void;
  toArray: () => T[];
}

/**
 * Set-state helper: returns `{ set, add, delete, toggle, clear, has, values
 * }`. Useful for "selected IDs" collections.
 */
export function useSet<T>(initialValues?: Iterable<T>): UseSetReturn<T> {
  const initialRef = useRef(initialValues);
  const [set, setSet] = useState<Set<T>>(() => new Set(initialValues ?? []));

  const add = useCallback((value: T) => {
    setSet((prev) => {
      if (prev.has(value)) return prev;
      const next = new Set(prev);
      next.add(value);
      return next;
    });
  }, []);

  const remove = useCallback((value: T) => {
    setSet((prev) => {
      if (!prev.has(value)) return prev;
      const next = new Set(prev);
      next.delete(value);
      return next;
    });
  }, []);

  const toggle = useCallback((value: T) => {
    setSet((prev) => {
      const next = new Set(prev);
      if (next.has(value)) {
        next.delete(value);
      } else {
        next.add(value);
      }
      return next;
    });
  }, []);

  const has = useCallback((value: T) => set.has(value), [set]);

  const clear = useCallback(() => {
    setSet(new Set());
  }, []);

  const reset = useCallback((initial?: Iterable<T>) => {
    setSet(new Set(initial ?? initialRef.current ?? []));
  }, []);

  const toArray = useCallback(() => [...set], [set]);

  const size = set.size;

  return useMemo(
    () => ({ set, add, remove, toggle, has, clear, size, reset, toArray }),
    [set, add, remove, toggle, has, clear, size, reset, toArray]
  );
}
