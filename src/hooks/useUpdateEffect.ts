import { useEffect, useRef, type DependencyList, type EffectCallback } from "react";

/**
 * Like `useEffect`, but skips the first render.
 */
export function useUpdateEffect(effect: EffectCallback, deps?: DependencyList): void {
  const mounted = useRef(false);
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    return effect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
