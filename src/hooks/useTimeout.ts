import { useEffect, useRef } from "react";

/**
 * Fire `callback` after `delay` ms. Pass `null` to pause.
 * Callback identity changes are handled — the ref is always kept current.
 */
export function useTimeout(callback: () => void, delay: number | null): void {
  const savedCallback = useRef(callback);
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);
  useEffect(() => {
    if (delay === null) return;
    const id = setTimeout(() => savedCallback.current(), delay);
    return () => clearTimeout(id);
  }, [delay]);
}
