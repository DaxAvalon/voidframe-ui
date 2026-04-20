"use client";

import { useCallback, useMemo, useRef, useState } from "react";

export interface UseListReturn<T> {
  list: readonly T[];
  set: (newList: T[]) => void;
  push: (...items: T[]) => void;
  removeAt: (index: number) => void;
  removeWhere: (predicate: (item: T) => boolean) => void;
  updateAt: (index: number, item: T) => void;
  updateWhere: (
    predicate: (item: T) => boolean,
    updater: (item: T) => T
  ) => void;
  insertAt: (index: number, item: T) => void;
  move: (fromIndex: number, toIndex: number) => void;
  swap: (indexA: number, indexB: number) => void;
  sort: (compare?: (a: T, b: T) => number) => void;
  filter: (predicate: (item: T) => boolean) => void;
  clear: () => void;
  reset: () => void;
  size: number;
}

/**
 * Array-state helper: returns `{ list, set, push, pop, shift, unshift,
 * insertAt, removeAt, updateAt, filter, sort, clear }`. Each mutator has a
 * stable identity so passing them into memoised children doesn't churn
 * props.
 */
export function useList<T>(initialList?: T[]): UseListReturn<T> {
  const initialRef = useRef(initialList);
  const [list, setList] = useState<T[]>(() => [...(initialList ?? [])]);

  const set = useCallback((newList: T[]) => {
    setList([...newList]);
  }, []);

  const push = useCallback((...items: T[]) => {
    setList((prev) => [...prev, ...items]);
  }, []);

  const removeAt = useCallback((index: number) => {
    setList((prev) => {
      if (index < 0 || index >= prev.length) return prev;
      const next = [...prev];
      next.splice(index, 1);
      return next;
    });
  }, []);

  const removeWhere = useCallback((predicate: (item: T) => boolean) => {
    setList((prev) => prev.filter((item) => !predicate(item)));
  }, []);

  const updateAt = useCallback((index: number, item: T) => {
    setList((prev) => {
      if (index < 0 || index >= prev.length) return prev;
      const next = [...prev];
      next[index] = item;
      return next;
    });
  }, []);

  const updateWhere = useCallback(
    (predicate: (item: T) => boolean, updater: (item: T) => T) => {
      setList((prev) =>
        prev.map((item) => (predicate(item) ? updater(item) : item))
      );
    },
    []
  );

  const insertAt = useCallback((index: number, item: T) => {
    setList((prev) => {
      const clamped = Math.max(0, Math.min(index, prev.length));
      const next = [...prev];
      next.splice(clamped, 0, item);
      return next;
    });
  }, []);

  const move = useCallback((fromIndex: number, toIndex: number) => {
    setList((prev) => {
      if (
        fromIndex < 0 ||
        fromIndex >= prev.length ||
        toIndex < 0 ||
        toIndex >= prev.length
      )
        return prev;
      const next = [...prev];
      const [item] = next.splice(fromIndex, 1) as [T];
      next.splice(toIndex, 0, item);
      return next;
    });
  }, []);

  const swap = useCallback((indexA: number, indexB: number) => {
    setList((prev) => {
      if (
        indexA < 0 ||
        indexA >= prev.length ||
        indexB < 0 ||
        indexB >= prev.length
      )
        return prev;
      const next = [...prev];
      const tmp = next[indexA]!;
      next[indexA] = next[indexB]!;
      next[indexB] = tmp;
      return next;
    });
  }, []);

  const sort = useCallback((compare?: (a: T, b: T) => number) => {
    setList((prev) => [...prev].sort(compare));
  }, []);

  const filter = useCallback((predicate: (item: T) => boolean) => {
    setList((prev) => prev.filter(predicate));
  }, []);

  const clear = useCallback(() => {
    setList([]);
  }, []);

  const reset = useCallback(() => {
    setList([...(initialRef.current ?? [])]);
  }, []);

  const size = list.length;

  return useMemo(
    () => ({
      list,
      set,
      push,
      removeAt,
      removeWhere,
      updateAt,
      updateWhere,
      insertAt,
      move,
      swap,
      sort,
      filter,
      clear,
      reset,
      size,
    }),
    [
      list,
      set,
      push,
      removeAt,
      removeWhere,
      updateAt,
      updateWhere,
      insertAt,
      move,
      swap,
      sort,
      filter,
      clear,
      reset,
      size,
    ]
  );
}
