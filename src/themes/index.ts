// Phase 15 — themes package
//
// Each named theme is a full `VoidframeTokens`. `tokensToCssVars` emits
// the canonical `--vf-*` CSS custom properties so the same token object
// drives both runtime JS (useTokens) and stylesheet cascade.

import type { CSSProperties } from "react";
import type { ThemeOverrides, VoidframeTokens } from "../tokens";

export { darkTheme } from "./dark";
export { lightTheme } from "./light";
export { midnightTheme } from "./midnight";

export const THEME_NAMES = ["dark", "light", "midnight"] as const;
export type BuiltInThemeName = (typeof THEME_NAMES)[number];

/** Emit `--vf-*` CSS custom properties from a partial or full token set. */
export function tokensToCssVars(
  tokens: ThemeOverrides | VoidframeTokens
): CSSProperties {
  const out: Record<string, string | number> = {};
  for (const key of Object.keys(tokens) as Array<keyof VoidframeTokens>) {
    const value = (tokens as Record<string, unknown>)[key];
    if (value === undefined) continue;
    const cssKey = `--vf-${camelToKebab(key)}`;
    out[cssKey] =
      typeof value === "number" && !UNITLESS_KEYS.has(key)
        ? `${value}px`
        : (value as string | number);
  }
  return out as CSSProperties;
}

const UNITLESS_KEYS = new Set<keyof VoidframeTokens>([
  "lineHeight",
  "radius",
]);

function camelToKebab(s: string): string {
  return s.replace(/([a-z])([A-Z0-9])/g, "$1-$2").toLowerCase();
}
