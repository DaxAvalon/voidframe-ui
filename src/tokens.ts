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

  // Accent opacity variants (hex with alpha)
  green5: string;   green10: string;  green20: string;  green40: string;  green60: string;
  red5: string;     red10: string;    red20: string;    red40: string;    red60: string;
  amber5: string;   amber10: string;  amber20: string;  amber40: string;  amber60: string;
  blue5: string;    blue10: string;   blue20: string;   blue40: string;   blue60: string;
  purple5: string;  purple10: string; purple20: string; purple40: string; purple60: string;
  cyan5: string;    cyan10: string;   cyan20: string;   cyan40: string;   cyan60: string;
  rose5: string;    rose10: string;   rose20: string;   rose40: string;   rose60: string;

  // Semantic aliases
  success: string;
  danger: string;
  warning: string;
  info: string;

  // Typography
  fontFamily: string;
  /** Monospace font stack (body text, dense UI). Falls through to fontFamily. */
  fontMono: string;
  /** Sans-serif font stack (opt-in for specific subtrees via ThemeScope). */
  fontSans: string;
  /** Display font stack (page-level headings, if a distinct face is desired). */
  fontDisplay: string;
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
  /** Heading letter-spacing (em-based). Applied to `.vf-h*` utilities + chrome headings. */
  headingTracking: string;
  /** Heading `text-transform`. Default `"uppercase"` preserves brutalist behavior; set to `"none"` for title-case. */
  headingCase: "uppercase" | "none" | "lowercase" | "capitalize";

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

  // Breakpoints (Phase 16). Pixel thresholds for responsive props.
  bpSm: number;
  bpMd: number;
  bpLg: number;
  bpXl: number;
  bpXxl: number;

  // Misc
  radius: number;
  /** Border-radius scale (brutalist default 0; consumers can soften corners). */
  radius1: number;
  radius2: number;
  transition: string;

  // Border widths
  borderWidth0: number;
  borderWidth1: number;
  borderWidth2: number;
  borderWidth3: number;
  borderWidth4: number;
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

  // ── ACCENT OPACITY VARIANTS ──────────────────────────────
  green5: "#4ade800d", green10: "#4ade801a", green20: "#4ade8033", green40: "#4ade8066", green60: "#4ade8099",
  red5: "#f871710d", red10: "#f871711a", red20: "#f8717133", red40: "#f8717166", red60: "#f8717199",
  amber5: "#c8aa3e0d", amber10: "#c8aa3e1a", amber20: "#c8aa3e33", amber40: "#c8aa3e66", amber60: "#c8aa3e99",
  blue5: "#6b9fdd0d", blue10: "#6b9fdd1a", blue20: "#6b9fdd33", blue40: "#6b9fdd66", blue60: "#6b9fdd99",
  purple5: "#a855f70d", purple10: "#a855f71a", purple20: "#a855f733", purple40: "#a855f766", purple60: "#a855f799",
  cyan5: "#22d3ee0d", cyan10: "#22d3ee1a", cyan20: "#22d3ee33", cyan40: "#22d3ee66", cyan60: "#22d3ee99",
  rose5: "#ff6b6b0d", rose10: "#ff6b6b1a", rose20: "#ff6b6b33", rose40: "#ff6b6b66", rose60: "#ff6b6b99",

  // ── SEMANTIC ALIASES ──────────────────────────────────────
  success: "#4ade80",
  danger: "#f87171",
  warning: "#c8aa3e",
  info: "#6b9fdd",

  // ── TYPOGRAPHY ────────────────────────────────────────────
  // Monospace by default. Sans + display slots let consumers opt into a
  // secondary face without forking the library.
  fontFamily: "'Courier New', 'Courier', 'Liberation Mono', monospace",
  fontMono: "'Courier New', 'Courier', 'Liberation Mono', monospace",
  fontSans:
    "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  fontDisplay: "'Courier New', 'Courier', 'Liberation Mono', monospace",
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
  headingTracking: "0.08em",
  headingCase: "uppercase",

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

  // ── BREAKPOINTS ───────────────────────────────────────────
  bpSm: 640,
  bpMd: 768,
  bpLg: 1024,
  bpXl: 1280,
  bpXxl: 1536,

  // ── MISC ──────────────────────────────────────────────────
  radius: 0,
  radius1: 2,
  radius2: 4,
  transition: "all 0.15s ease",

  // ── BORDER WIDTHS ─────────────────────────────────────────
  borderWidth0: 0,
  borderWidth1: 1,
  borderWidth2: 2,
  borderWidth3: 3,
  borderWidth4: 4,
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
  bg4: "#c0c0bb",
  bg5: "#b0b0a8",
  border0: "#c8c8c3",
  border1: "#b8b8b3",
  border2: "#8e8e89",
  border3: "#5e5e5a",
  border4: "#3a3a37",
  text0: "#000000",
  text1: "#1a1a1a",
  text2: "#3e3e3e",
  text3: "#5e5e5e",
  text4: "#7a7a7a",
  text5: "#9a9a9a",
  green: "#0f7f38",
  red: "#b91c1c",
  amber: "#854d0e",
  blue: "#1d4ed8",
  purple: "#6d28d9",
  cyan: "#0e7490",
  rose: "#be123c",
  green5: "#0f7f380d", green10: "#0f7f381a", green20: "#0f7f3833", green40: "#0f7f3866", green60: "#0f7f3899",
  red5: "#b91c1c0d", red10: "#b91c1c1a", red20: "#b91c1c33", red40: "#b91c1c66", red60: "#b91c1c99",
  amber5: "#854d0e0d", amber10: "#854d0e1a", amber20: "#854d0e33", amber40: "#854d0e66", amber60: "#854d0e99",
  blue5: "#1d4ed80d", blue10: "#1d4ed81a", blue20: "#1d4ed833", blue40: "#1d4ed866", blue60: "#1d4ed899",
  purple5: "#6d28d90d", purple10: "#6d28d91a", purple20: "#6d28d933", purple40: "#6d28d966", purple60: "#6d28d999",
  cyan5: "#0e74900d", cyan10: "#0e74901a", cyan20: "#0e749033", cyan40: "#0e749066", cyan60: "#0e749099",
  rose5: "#be123c0d", rose10: "#be123c1a", rose20: "#be123c33", rose40: "#be123c66", rose60: "#be123c99",
  success: "#0f7f38",
  danger: "#b91c1c",
  warning: "#854d0e",
  info: "#1d4ed8",
  borderWidth0: 0,
  borderWidth1: 1,
  borderWidth2: 2,
  borderWidth3: 3,
  borderWidth4: 4,
});

/**
 * Mid-contrast grey theme — lighter than the default dark but darker than
 * the full-light theme. Ideal for long reading sessions or anyone who
 * finds the dark theme too dim and the light theme too glaring.
 */
export const greyTheme: VoidframeTokens = createTheme({
  bg0: "#2a2a2a",
  bg1: "#2f2f2f",
  bg2: "#353535",
  bg3: "#3b3b3b",
  bg4: "#424242",
  bg5: "#4a4a4a",
  border0: "#3b3b3b",
  border1: "#484848",
  border2: "#5a5a5a",
  border3: "#6e6e6e",
  border4: "#8a8a8a",
  text0: "#f5f5f5",
  text1: "#dcdcdc",
  text2: "#b0b0b0",
  text3: "#8a8a8a",
  text4: "#6a6a6a",
  text5: "#4a4a4a",
  green: "#6ee7a8",
  red: "#fb7185",
  amber: "#f1c96b",
  blue: "#8fb8f0",
  purple: "#c4a3ff",
  cyan: "#7fe8f3",
  rose: "#ff95b6",
  green5: "#6ee7a80d", green10: "#6ee7a81a", green20: "#6ee7a833", green40: "#6ee7a866", green60: "#6ee7a899",
  red5: "#fb71850d", red10: "#fb71851a", red20: "#fb718533", red40: "#fb718566", red60: "#fb718599",
  amber5: "#f1c96b0d", amber10: "#f1c96b1a", amber20: "#f1c96b33", amber40: "#f1c96b66", amber60: "#f1c96b99",
  blue5: "#8fb8f00d", blue10: "#8fb8f01a", blue20: "#8fb8f033", blue40: "#8fb8f066", blue60: "#8fb8f099",
  purple5: "#c4a3ff0d", purple10: "#c4a3ff1a", purple20: "#c4a3ff33", purple40: "#c4a3ff66", purple60: "#c4a3ff99",
  cyan5: "#7fe8f30d", cyan10: "#7fe8f31a", cyan20: "#7fe8f333", cyan40: "#7fe8f366", cyan60: "#7fe8f399",
  rose5: "#ff95b60d", rose10: "#ff95b61a", rose20: "#ff95b633", rose40: "#ff95b666", rose60: "#ff95b699",
  success: "#6ee7a8",
  danger: "#fb7185",
  warning: "#f1c96b",
  info: "#8fb8f0",
  borderWidth0: 0,
  borderWidth1: 1,
  borderWidth2: 2,
  borderWidth3: 3,
  borderWidth4: 4,
});
