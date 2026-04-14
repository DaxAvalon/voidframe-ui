// ═══════════════════════════════════════════════════════════════
// VOIDFRAME — DESIGN TOKENS
// The single source of truth for all visual decisions.
// Override via createTheme() or VoidframeProvider.
// ═══════════════════════════════════════════════════════════════

/**
 * The full token contract. Every theme implements this interface.
 */
export interface VoidframeTokens {
  // Surfaces
  bg0: string;
  bg1: string;
  bg2: string;
  bg3: string;
  bg4: string;
  bg5: string;

  // Borders
  border0: string;
  border1: string;
  border2: string;
  border3: string;
  border4: string;

  // Text
  text0: string;
  text1: string;
  text2: string;
  text3: string;
  text4: string;
  text5: string;

  // Accents
  green: string;
  red: string;
  amber: string;
  blue: string;
  purple: string;
  cyan: string;
  rose: string;

  // Semantic aliases
  success: string;
  danger: string;
  warning: string;
  info: string;

  // Typography
  fontFamily: string;
  fontXxs: number;
  fontXs: number;
  fontSm: number;
  fontMd: number;
  fontLg: number;
  fontXl: number;
  fontXxl: number;
  font3xl: number;
  lineHeight: number;
  letterSpacing: number;
  labelSpacing: number;

  // Spacing
  sp1: number;
  sp2: number;
  sp3: number;
  sp4: number;
  sp5: number;
  sp6: number;
  sp7: number;
  sp8: number;
  sp9: number;
  sp10: number;
  sp11: number;
  sp12: number;

  // Misc
  radius: number;
  transition: string;
}

export type ThemeOverrides = Partial<VoidframeTokens>;

export const defaultTokens: VoidframeTokens = {
  // ── SURFACES ──────────────────────────────────────────────
  // Five depth layers, darkest to lightest. No shadows needed —
  // depth is communicated through surface brightness alone.
  bg0: "#050505",
  bg1: "#0a0a0a",
  bg2: "#0d0d0d",
  bg3: "#111111",
  bg4: "#161616",
  bg5: "#1a1a1a",

  // ── BORDERS ───────────────────────────────────────────────
  // Four tiers from invisible to prominent.
  border0: "#111111",
  border1: "#1a1a1a",
  border2: "#222222",
  border3: "#333333",
  border4: "#444444",

  // ── TEXT ───────────────────────────────────────────────────
  // Six levels from white to nearly invisible.
  text0: "#ffffff",
  text1: "#cccccc",
  text2: "#888888",
  text3: "#555555",
  text4: "#333333",
  text5: "#1a1a1a",

  // ── ACCENTS ───────────────────────────────────────────────
  // Color is semantic, never decorative.
  green: "#4ade80",
  red: "#f87171",
  amber: "#c8aa3e",
  blue: "#6b9fdd",
  purple: "#a855f7",
  cyan: "#22d3ee",
  rose: "#ff6b6b",

  // ── SEMANTIC ALIASES ──────────────────────────────────────
  success: "#4ade80",
  danger: "#f87171",
  warning: "#c8aa3e",
  info: "#6b9fdd",

  // ── TYPOGRAPHY ────────────────────────────────────────────
  // Monospace only. No secondary typeface.
  fontFamily: "'Courier New', 'Courier', 'Liberation Mono', monospace",
  fontXxs: 8,
  fontXs: 9,
  fontSm: 10,
  fontMd: 12,
  fontLg: 14,
  fontXl: 18,
  fontXxl: 24,
  font3xl: 32,

  lineHeight: 1.6,
  letterSpacing: 1.5,
  labelSpacing: 2,

  // ── SPACING ───────────────────────────────────────────────
  // 12-step scale. Use by name in components.
  sp1: 2,
  sp2: 4,
  sp3: 6,
  sp4: 8,
  sp5: 10,
  sp6: 12,
  sp7: 14,
  sp8: 16,
  sp9: 20,
  sp10: 24,
  sp11: 32,
  sp12: 48,

  // ── MISC ──────────────────────────────────────────────────
  radius: 0,
  transition: "all 0.15s ease",
};

/**
 * Create a custom theme by merging overrides with defaults.
 *
 * @example
 * const warm = createTheme({
 *   bg0: "#0a0806",
 *   green: "#86efac",
 *   fontFamily: "'IBM Plex Mono', monospace",
 * });
 */
export function createTheme(overrides: ThemeOverrides = {}): VoidframeTokens {
  return { ...defaultTokens, ...overrides };
}

/**
 * Append a two-char hex opacity suffix to a hex color.
 * Used to generate subtle tinted backgrounds (badges, cards).
 *
 * @param hex Base hex color (e.g. "#4ade80")
 * @param opacity Two-char hex opacity (e.g. "12", "22", "44")
 */
export function tint(hex: string, opacity: string = "12"): string {
  return `${hex}${opacity}`;
}

/**
 * Predefined light theme override. Inverts the surface/text hierarchy.
 */
export const lightTheme: VoidframeTokens = createTheme({
  bg0: "#f5f5f0",
  bg1: "#eaeae5",
  bg2: "#e0e0db",
  bg3: "#d6d6d1",
  bg4: "#cccccc",
  bg5: "#c0c0bb",
  border0: "#d6d6d1",
  border1: "#cccccc",
  border2: "#bbbbbb",
  border3: "#999999",
  border4: "#777777",
  text0: "#111111",
  text1: "#333333",
  text2: "#666666",
  text3: "#888888",
  text4: "#aaaaaa",
  text5: "#cccccc",
  green: "#16a34a",
  red: "#dc2626",
  amber: "#a16207",
  blue: "#2563eb",
  purple: "#7c3aed",
  cyan: "#0891b2",
  rose: "#e11d48",
  success: "#16a34a",
  danger: "#dc2626",
  warning: "#a16207",
  info: "#2563eb",
});
