"use client";

import { useMediaQuery } from "./useMediaQuery";

/** `"dark" | "light"` — user's system preference. Returns `null` pre-match. */
export function usePrefersColorScheme(): "dark" | "light" {
  const dark = useMediaQuery("(prefers-color-scheme: dark)");
  return dark ? "dark" : "light";
}
