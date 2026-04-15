"use client";

import { useCallback, useState } from "react";
import { usePrefersColorScheme } from "./usePrefersColorScheme";

export type ColorScheme = "dark" | "light" | "system";
export type ResolvedColorScheme = "dark" | "light";

export interface UseColorSchemeReturn {
  /** User-facing choice including "system". */
  scheme: ColorScheme;
  /** Effective scheme after resolving "system" against the OS preference. */
  resolved: ResolvedColorScheme;
  setScheme: (scheme: ColorScheme) => void;
}

/**
 * Manage color-scheme with "system" auto-resolution.
 *
 * Does not persist — pair with `useLocalStorage` for that.
 */
export function useColorScheme(
  initial: ColorScheme = "system"
): UseColorSchemeReturn {
  const [scheme, setScheme] = useState<ColorScheme>(initial);
  const systemScheme = usePrefersColorScheme();
  const resolved: ResolvedColorScheme =
    scheme === "system" ? systemScheme : scheme;
  const set = useCallback((next: ColorScheme) => setScheme(next), []);
  return { scheme, resolved, setScheme: set };
}
