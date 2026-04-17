"use client";

import { useRef } from "react";
import { useIsomorphicLayoutEffect } from "./useIsomorphicLayoutEffect";

/**
 * Lock body scroll by setting `overflow: hidden` on `document.body`.
 * Restores original overflow on unlock or unmount. SSR-safe.
 */
export function useLockBodyScroll(locked: boolean = true): void {
  const originalOverflowRef = useRef<string | null>(null);

  useIsomorphicLayoutEffect(() => {
    if (typeof document === "undefined") return;

    if (locked) {
      originalOverflowRef.current = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflowRef.current ?? "";
      };
    }
  }, [locked]);
}
