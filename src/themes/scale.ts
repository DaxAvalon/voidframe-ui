// Type scale — a layer independent of palette.
//
// A theme's colours and its type size are different decisions: a recorder
// read from two metres wants the booth scale on whatever palette the user
// prefers, and an operator at a 4K monitor wants everything ×1.25. `scale`
// on VoidframeProvider / ThemeScope applies one of these to the active
// tokens at runtime; `scaleTokens` is the pure function behind it.

import type { ThemeOverrides, VoidframeTokens } from "../tokens";

export const FONT_SCALE_KEYS = [
  "fontXxs",
  "fontXs",
  "fontSm",
  "fontMd",
  "fontLg",
  "fontXl",
  "fontXxl",
  "font3xl",
] as const satisfies readonly (keyof VoidframeTokens)[];

export const SPACE_SCALE_KEYS = [
  "sp1",
  "sp2",
  "sp3",
  "sp4",
  "sp5",
  "sp6",
  "sp7",
  "sp8",
  "sp9",
  "sp10",
  "sp11",
  "sp12",
] as const satisfies readonly (keyof VoidframeTokens)[];

/** The eight font sizes (px) plus the body line height. */
export type TypeScale = Pick<VoidframeTokens, (typeof FONT_SCALE_KEYS)[number]> & {
  lineHeight?: number;
  /** Long-form reading size (px); see `--vf-reading-size`. */
  readingSize?: number;
};

export const TYPE_SCALES = {
  /** The default scale: dense monospace chrome. */
  default: {
    fontXxs: 8,
    fontXs: 9,
    fontSm: 10,
    fontMd: 12,
    fontLg: 14,
    fontXl: 18,
    fontXxl: 24,
    font3xl: 32,
    lineHeight: 1.6,
    readingSize: 14,
  },
  /** Read at one to two metres: controls and labels at arm's length. */
  booth: {
    fontXxs: 11,
    fontXs: 12,
    fontSm: 14,
    fontMd: 18,
    fontLg: 24,
    fontXl: 32,
    fontXxl: 40,
    font3xl: 48,
    lineHeight: 1.4,
    readingSize: 22,
  },
} as const satisfies Record<string, TypeScale>;

export type TypeScaleName = keyof typeof TYPE_SCALES;

/**
 * What `scale` accepts: a multiplier applied to every font and spacing
 * token (half-pixel rounding), a named preset (fonts and line height only),
 * or a `TypeScale` object.
 */
export type Scale = number | TypeScaleName | TypeScale;

/** Round to the nearest half pixel so scaled values still land on crisp edges. */
export function roundHalf(px: number): number {
  return Math.round(px * 2) / 2;
}

/** Apply a `Scale` to a token set; returns a new object, never mutates. */
export function scaleTokens(tokens: VoidframeTokens, scale: Scale): VoidframeTokens {
  if (typeof scale === "number") {
    if (!Number.isFinite(scale) || scale <= 0 || scale === 1) return tokens;
    const out: VoidframeTokens = { ...tokens };
    for (const k of FONT_SCALE_KEYS) out[k] = Math.max(1, roundHalf(tokens[k] * scale));
    for (const k of SPACE_SCALE_KEYS) out[k] = roundHalf(tokens[k] * scale);
    out.readingSize = Math.max(1, roundHalf(tokens.readingSize * scale));
    return out;
  }
  const preset: TypeScale = typeof scale === "string" ? TYPE_SCALES[scale] : scale;
  const out: VoidframeTokens = { ...tokens };
  for (const k of FONT_SCALE_KEYS) if (preset[k] !== undefined) out[k] = preset[k];
  if (preset.lineHeight !== undefined) out.lineHeight = preset.lineHeight;
  if (preset.readingSize !== undefined) out.readingSize = preset.readingSize;
  return out;
}

/** The subset of `tokens` a `Scale` can change, for emitting only those vars. */
export function scaledOverrides(tokens: VoidframeTokens, scale: Scale): ThemeOverrides {
  const scaled = scaleTokens(tokens, scale);
  const out: ThemeOverrides = {};
  for (const k of [...FONT_SCALE_KEYS, ...SPACE_SCALE_KEYS, "lineHeight", "readingSize"] as const) {
    if (scaled[k] !== tokens[k]) (out as Record<string, unknown>)[k] = scaled[k];
  }
  return out;
}
