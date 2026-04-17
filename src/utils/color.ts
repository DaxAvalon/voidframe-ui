// ═══════════════════════════════════════════════════════════════
// color — color manipulation and accessibility utilities
// Conversions, manipulation, WCAG analysis, and parsing.
// ═══════════════════════════════════════════════════════════════

// ── Conversions ───────────────────────────────────────────────

/**
 * Parse a hex string (#rgb or #rrggbb) to RGB components.
 * Returns null for invalid input.
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const clean = hex.replace(/^#/, "");
  let r: number, g: number, b: number;
  if (clean.length === 3) {
    r = parseInt(clean[0]! + clean[0]!, 16);
    g = parseInt(clean[1]! + clean[1]!, 16);
    b = parseInt(clean[2]! + clean[2]!, 16);
  } else if (clean.length === 6) {
    r = parseInt(clean.slice(0, 2), 16);
    g = parseInt(clean.slice(2, 4), 16);
    b = parseInt(clean.slice(4, 6), 16);
  } else {
    return null;
  }
  if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
  return { r, g, b };
}

/**
 * Convert RGB components (0-255) to a hex string.
 */
export function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  return (
    "#" +
    [clamp(r), clamp(g), clamp(b)]
      .map((v) => v.toString(16).padStart(2, "0"))
      .join("")
  );
}

/**
 * Convert RGB (0-255) to HSL (h: 0-360, s: 0-100, l: 0-100).
 */
export function rgbToHsl(
  r: number,
  g: number,
  b: number
): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l: Math.round(l * 100) };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h: number;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

/**
 * Convert HSL (h: 0-360, s: 0-100, l: 0-100) to RGB (0-255).
 */
export function hslToRgb(
  h: number,
  s: number,
  l: number
): { r: number; g: number; b: number } {
  s /= 100;
  l /= 100;
  if (s === 0) {
    const v = Math.round(l * 255);
    return { r: v, g: v, b: v };
  }
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const hNorm = h / 360;
  return {
    r: Math.round(hue2rgb(p, q, hNorm + 1 / 3) * 255),
    g: Math.round(hue2rgb(p, q, hNorm) * 255),
    b: Math.round(hue2rgb(p, q, hNorm - 1 / 3) * 255),
  };
}

/**
 * Convert a hex color to HSL.
 */
export function hexToHsl(hex: string): { h: number; s: number; l: number } | null {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  return rgbToHsl(rgb.r, rgb.g, rgb.b);
}

/**
 * Convert HSL to a hex color.
 */
export function hslToHex(h: number, s: number, l: number): string {
  const { r, g, b } = hslToRgb(h, s, l);
  return rgbToHex(r, g, b);
}

// ── Manipulation ──────────────────────────────────────────────

/**
 * Lighten a hex color by the given amount (0-1).
 */
export function lighten(hex: string, amount: number): string {
  const hsl = hexToHsl(hex);
  if (!hsl) return hex;
  hsl.l = Math.min(100, hsl.l + amount * 100);
  return hslToHex(hsl.h, hsl.s, hsl.l);
}

/**
 * Darken a hex color by the given amount (0-1).
 */
export function darken(hex: string, amount: number): string {
  const hsl = hexToHsl(hex);
  if (!hsl) return hex;
  hsl.l = Math.max(0, hsl.l - amount * 100);
  return hslToHex(hsl.h, hsl.s, hsl.l);
}

/**
 * Return a hex+alpha string (8-digit hex) with the given alpha (0-1).
 */
export function setAlpha(hex: string, alpha: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const a = Math.max(0, Math.min(1, alpha));
  const aHex = Math.round(a * 255)
    .toString(16)
    .padStart(2, "0");
  return rgbToHex(rgb.r, rgb.g, rgb.b) + aHex;
}

/**
 * Mix two hex colors by weight (0-1, default 0.5).
 * Weight 0 = all color2, weight 1 = all color1.
 */
export function mix(color1: string, color2: string, weight: number = 0.5): string {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  if (!rgb1 || !rgb2) return color1;
  const w = Math.max(0, Math.min(1, weight));
  return rgbToHex(
    Math.round(rgb1.r * w + rgb2.r * (1 - w)),
    Math.round(rgb1.g * w + rgb2.g * (1 - w)),
    Math.round(rgb1.b * w + rgb2.b * (1 - w))
  );
}

// ── Analysis ──────────────────────────────────────────────────

/**
 * Relative luminance per WCAG 2.1.
 * Returns a value between 0 (black) and 1 (white).
 */
export function luminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;
  const linearize = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return (
    0.2126 * linearize(rgb.r) +
    0.7152 * linearize(rgb.g) +
    0.0722 * linearize(rgb.b)
  );
}

/**
 * WCAG contrast ratio between two colors.
 * Returns a value between 1 (identical) and 21 (black on white).
 */
export function contrastRatio(fg: string, bg: string): number {
  const l1 = luminance(fg);
  const l2 = luminance(bg);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if a foreground/background pair meets WCAG accessibility standards.
 * AA normal: 4.5, AA large: 3, AAA normal: 7, AAA large: 4.5
 */
export function isAccessible(
  fg: string,
  bg: string,
  level: "AA" | "AAA" = "AA",
  size: "normal" | "large" = "normal"
): boolean {
  const ratio = contrastRatio(fg, bg);
  if (level === "AA") return size === "large" ? ratio >= 3 : ratio >= 4.5;
  return size === "large" ? ratio >= 4.5 : ratio >= 7;
}

/**
 * Find the most readable color from a list of candidates against a background.
 */
export function mostReadable(bg: string, candidates: string[]): string {
  let best = candidates[0] ?? "#000000";
  let bestRatio = 0;
  for (const c of candidates) {
    const ratio = contrastRatio(c, bg);
    if (ratio > bestRatio) {
      bestRatio = ratio;
      best = c;
    }
  }
  return best;
}

// ── Parsing ───────────────────────────────────────────────────

/**
 * Parse any common CSS color format to RGBA.
 * Supports: #hex (3/6/8 digit), rgb(), rgba(), hsl(), hsla().
 * Named colors are NOT supported.
 */
export function parseColor(
  input: string
): { r: number; g: number; b: number; a: number } | null {
  const s = input.trim();

  // Hex formats
  if (s.startsWith("#")) {
    const clean = s.slice(1);
    if (clean.length === 8) {
      const rgb = hexToRgb("#" + clean.slice(0, 6));
      if (!rgb) return null;
      return { ...rgb, a: parseInt(clean.slice(6, 8), 16) / 255 };
    }
    const rgb = hexToRgb(s);
    if (rgb) return { ...rgb, a: 1 };
    return null;
  }

  // rgb() / rgba()
  const rgbMatch = s.match(
    /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+))?\s*\)$/
  );
  if (rgbMatch) {
    return {
      r: parseInt(rgbMatch[1]!, 10),
      g: parseInt(rgbMatch[2]!, 10),
      b: parseInt(rgbMatch[3]!, 10),
      a: rgbMatch[4] !== undefined ? parseFloat(rgbMatch[4]!) : 1,
    };
  }

  // hsl() / hsla()
  const hslMatch = s.match(
    /^hsla?\(\s*(\d+)\s*,\s*([\d.]+)%?\s*,\s*([\d.]+)%?\s*(?:,\s*([\d.]+))?\s*\)$/
  );
  if (hslMatch) {
    const { r, g, b } = hslToRgb(
      parseInt(hslMatch[1]!, 10),
      parseFloat(hslMatch[2]!),
      parseFloat(hslMatch[3]!)
    );
    return {
      r,
      g,
      b,
      a: hslMatch[4] !== undefined ? parseFloat(hslMatch[4]!) : 1,
    };
  }

  return null;
}

/**
 * Check whether a string is a valid parseable color.
 */
export function isValidColor(input: string): boolean {
  return parseColor(input) !== null;
}
