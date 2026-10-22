// Token overrides applied under `data-vf-contrast="high"` (mirrors
// src/css/tokens.css). Exported so tests and theme authors can measure the
// high-contrast variant of a theme in JavaScript.

import type { ThemeOverrides } from "../tokens";

/** Overrides for dark-ground themes under high contrast. */
export const highContrastDarkOverrides: ThemeOverrides = {
  text1: "#f5f5f5",
  text2: "#c0c0c0",
  text3: "#888888",
  border1: "#2a2a2a",
  border2: "#3a3a3a",
  border3: "#555555",
  border4: "#7a7a7a",
};

/** Overrides for the light theme under high contrast. */
export const highContrastLightOverrides: ThemeOverrides = {
  text1: "#111111",
  text2: "#333333",
  text3: "#555555",
  border1: "#999999",
  border2: "#777777",
  border3: "#555555",
  border4: "#333333",
};

/** Apply the high-contrast overrides a theme receives (`light` gets the light set, everything else the dark set). */
export function withHighContrast<T extends Record<string, unknown>>(tokens: T, themeName?: string): T {
  const overrides = themeName === "light" || themeName === "soft-light" ? highContrastLightOverrides : highContrastDarkOverrides;
  return { ...tokens, ...overrides };
}
