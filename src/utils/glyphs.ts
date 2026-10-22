// Typographic glyphs used in numeric output. Monochrome text-presentation
// characters only (see docs/copy-tone.md).

/** True minus sign (U+2212), for negative numbers in meters and clocks. */
export const MINUS = "\u2212";
/** Infinity. */
export const INFINITY = "\u221E";
/** Middle dot separator. */
export const MIDDLE_DOT = "\u00B7";

/** Format a number with a true minus sign instead of hyphen-minus. */
export function withMinus(text: string): string {
  return text.replace(/^-/, MINUS);
}
