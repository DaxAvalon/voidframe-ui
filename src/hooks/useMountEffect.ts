"use client";

import { useEffect, type EffectCallback } from "react";

/**
 * Runs `effect` once when the component mounts. Cleanup runs on unmount.
 * Equivalent to `useEffect(fn, [])` but communicates intent.
 */
export function useMountEffect(effect: EffectCallback): void {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(effect, []);
}
