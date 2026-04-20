"use client";

import { useCallback, useMemo, useRef, useState } from "react";

export interface UseMapReturn<K, V> {
  map: ReadonlyMap<K, V>;
  get: (key: K) => V | undefined;
  set: (key: K, value: V) => void;
  setAll: (entries: Iterable<[K, V]>) => void;
  remove: (key: K) => void;
  has: (key: K) => boolean;
  clear: () => void;
  size: number;
  reset: (initial?: Iterable<[K, V]>) => void;
}

/**
 * Map-state helper: returns `{ map, set, delete, clear, has, get, entries
 * }`. Identity of `map` updates on every change so React sees a new
 * reference.
 */
export function useMap<K, V>(
  initialEntries?: Iterable<[K, V]>
): UseMapReturn<K, V> {
  const initialRef = useRef(initialEntries);
  const [map, setMap] = useState<Map<K, V>>(
    () => new Map(initialEntries ?? [])
  );

  const get = useCallback((key: K) => map.get(key), [map]);

  const set = useCallback((key: K, value: V) => {
    setMap((prev) => {
      const next = new Map(prev);
      next.set(key, value);
      return next;
    });
  }, []);

  const setAll = useCallback((entries: Iterable<[K, V]>) => {
    setMap((prev) => {
      const next = new Map(prev);
      for (const [k, v] of entries) {
        next.set(k, v);
      }
      return next;
    });
  }, []);

  const remove = useCallback((key: K) => {
    setMap((prev) => {
      const next = new Map(prev);
      next.delete(key);
      return next;
    });
  }, []);

  const has = useCallback((key: K) => map.has(key), [map]);

  const clear = useCallback(() => {
    setMap(new Map());
  }, []);

  const reset = useCallback(
    (initial?: Iterable<[K, V]>) => {
      setMap(new Map(initial ?? initialRef.current ?? []));
    },
    []
  );

  const size = map.size;

  return useMemo(
    () => ({ map, get, set, setAll, remove, has, clear, size, reset }),
    [map, get, set, setAll, remove, has, clear, size, reset]
  );
}
