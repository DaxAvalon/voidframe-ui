// Theme contrast assertions for consumer CI and the library's own tests.

import { contrastRatio } from "../utils/color";

export interface ThemeContrastOptions {
  /** Minimum ratio. Default 4.5 (WCAG AA for body text); use 7 for AAA / high contrast. */
  min?: number;
  /** Surface token keys the text tiers are measured against. Default `["bg0", "bg1", "bg2"]`. */
  surfaces?: readonly string[];
  /** Text token keys that carry words. Default `["text0", "text1", "text2"]` (text3 and below are decorative tiers). */
  tiers?: readonly string[];
}

export interface ThemeContrastFailure {
  tier: string;
  surface: string;
  ratio: number;
  min: number;
}

/** Every tier × surface pair under `min`, with the measured ratio. */
export function themeContrastReport(
  tokens: Record<string, unknown>,
  options: ThemeContrastOptions = {}
): ThemeContrastFailure[] {
  const { min = 4.5, surfaces = ["bg0", "bg1", "bg2"], tiers = ["text0", "text1", "text2"] } = options;
  const out: ThemeContrastFailure[] = [];
  for (const tier of tiers) {
    const fg = tokens[tier];
    if (typeof fg !== "string") continue;
    for (const surface of surfaces) {
      const bg = tokens[surface];
      if (typeof bg !== "string") continue;
      const ratio = contrastRatio(fg, bg);
      if (ratio < min) out.push({ tier, surface, ratio, min });
    }
  }
  return out;
}

/**
 * Throw when any word-carrying text tier falls under `min` on any surface.
 *
 * ```ts
 * expectThemeContrast(myTheme);                      // AA on bg0–bg2
 * expectThemeContrast(myTheme, { min: 7 });          // AAA / high contrast
 * ```
 */
export function expectThemeContrast(tokens: Record<string, unknown>, options: ThemeContrastOptions = {}): void {
  const failures = themeContrastReport(tokens, options);
  if (failures.length === 0) return;
  const min = options.min ?? 4.5;
  const lines = failures.map((f) => `  ${f.tier} on ${f.surface}: ${f.ratio.toFixed(2)}:1 (min ${min}:1)`);
  throw new Error(`Theme contrast below ${min}:1 for ${failures.length} pair(s):\n${lines.join("\n")}`);
}
