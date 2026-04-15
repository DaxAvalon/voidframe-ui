"use client";

import { useCallback, useRef } from "react";
import { useIsomorphicLayoutEffect } from "./useIsomorphicLayoutEffect";

/**
 * Stable callback ref that always sees the latest closure.
 * Implements the React `useEvent` RFC: the returned function's identity never
 * changes, but it always invokes the most-recent version of `fn`.
 *
 * Use when passing a callback to deeply-memoized children or to effects with
 * restrictive dependency arrays.
 */
export function useEvent<A extends unknown[], R>(
  fn: (...args: A) => R
): (...args: A) => R {
  const ref = useRef(fn);
  // Update synchronously during commit so call-sites that fire in the same
  // frame see the latest function.
  useIsomorphicLayoutEffect(() => {
    ref.current = fn;
  });
  return useCallback((...args: A) => ref.current(...args), []);
}
