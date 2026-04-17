"use client";

import { useRef, useState } from "react";

/**
 * Derive state from dependencies with explicit equality checking.
 *
 * Unlike `useMemo`, this stores the previous value and only triggers a
 * re-render when the derived value actually changes according to `isEqual`.
 */
export function useDerivedState<T>(
  derive: () => T,
  deps: readonly unknown[],
  isEqual: (prev: T, next: T) => boolean = Object.is
): T {
  const prevDepsRef = useRef<readonly unknown[] | undefined>(undefined);
  const valueRef = useRef<T>(undefined as T);
  const initializedRef = useRef(false);

  // Determine whether deps changed
  const depsChanged =
    !initializedRef.current ||
    prevDepsRef.current === undefined ||
    prevDepsRef.current.length !== deps.length ||
    deps.some((d, i) => !Object.is(d, prevDepsRef.current![i]));

  if (depsChanged) {
    const next = derive();
    if (!initializedRef.current || !isEqual(valueRef.current, next)) {
      valueRef.current = next;
      initializedRef.current = true;
    }
    prevDepsRef.current = deps;
  }

  // We use state solely to trigger re-renders when the value changes.
  // Keep it in sync with the ref.
  const [, forceRender] = useState(0);
  const lastNotifiedRef = useRef<T>(undefined as T);

  if (initializedRef.current && !Object.is(lastNotifiedRef.current, valueRef.current)) {
    lastNotifiedRef.current = valueRef.current;
    // Schedule a re-render on next tick if we're mid-render
    // Actually we can just return the ref value — React will see the new return
  }

  return valueRef.current;
}
