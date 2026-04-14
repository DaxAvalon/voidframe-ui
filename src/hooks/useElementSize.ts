import type { RefObject } from "react";
import { useResizeObserver, type ResizeSize } from "./useResizeObserver";

/**
 * Convenience wrapper over `useResizeObserver`.
 */
export function useElementSize<T extends Element>(ref: RefObject<T>): ResizeSize {
  return useResizeObserver(ref);
}
