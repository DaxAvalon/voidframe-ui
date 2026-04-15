"use client";

import { useEffect } from "react";

/**
 * Runs `fn` exactly once on unmount.
 */
export function useUnmountEffect(fn: () => void): void {
  useEffect(() => fn, []); // eslint-disable-line react-hooks/exhaustive-deps
}
