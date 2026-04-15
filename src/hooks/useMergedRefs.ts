"use client";

import { useCallback, type MutableRefObject, type Ref, type RefCallback } from "react";

/**
 * Merge multiple refs into one. Apply when a component has its own internal
 * ref AND forwards a ref AND optionally merges a child's ref (via `<Slot>`).
 *
 * Each ref can be a callback, an object ref, or null/undefined (skipped).
 *
 * @example
 * const internal = useRef<HTMLDivElement>(null);
 * const setRef = useMergedRefs(internal, forwardedRef);
 * return <div ref={setRef} />;
 */
export function useMergedRefs<T>(
  ...refs: Array<Ref<T> | undefined | null>
): RefCallback<T> {
  return useCallback(
    (node: T) => {
      for (const ref of refs) {
        if (ref == null) continue;
        if (typeof ref === "function") {
          ref(node);
        } else {
          (ref as MutableRefObject<T | null>).current = node;
        }
      }
    },
    // Spread refs into deps so a changing ref re-binds.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    refs
  );
}
