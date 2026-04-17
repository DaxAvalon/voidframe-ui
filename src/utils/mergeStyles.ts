// ═══════════════════════════════════════════════════════════════
// mergeStyles — merge multiple CSSProperties objects
// Filter falsy args, spread in order, skip undefined values.
// ═══════════════════════════════════════════════════════════════

import type { CSSProperties } from "react";

/**
 * Merge multiple CSSProperties objects. Later values override earlier ones,
 * but explicit `undefined` values are skipped (won't erase existing keys).
 *
 * @example
 * mergeStyles({ color: "red" }, condition && { fontWeight: "bold" })
 */
export function mergeStyles(
  ...styles: (CSSProperties | undefined | null | false)[]
): CSSProperties {
  const result: Record<string, unknown> = {};
  for (const style of styles) {
    if (!style) continue;
    for (const key in style) {
      const value = (style as Record<string, unknown>)[key];
      if (value !== undefined) {
        result[key] = value;
      }
    }
  }
  return result as CSSProperties;
}
