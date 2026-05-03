"use client";

import { useMediaQuery } from "./useMediaQuery";

/** `true` when the user has opted into reduced motion via OS settings. */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}
