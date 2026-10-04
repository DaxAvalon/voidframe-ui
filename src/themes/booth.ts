// Booth theme — a recorder read from one to two metres away in a dark room.
//
// The dark theme's ground and accents, with the text tiers lifted so every
// tier used for words measures at least 7:1 on the ground (WCAG 1.4.6), the
// type scale raised so controls and labels read at arm's length, a tighter
// line height for large type, and zero radius. Specified by Vonyx
// (DaxAvalon/Vonyx#131, docs/ux/booth-visual-language.md §2); see #12.
// The values are a starting point to tune in usability sessions.

import { createTheme, type VoidframeTokens } from "../tokens";

export const boothTheme: VoidframeTokens = createTheme({
  bg0: "#050505",
  bg1: "#0a0a0a",
  bg2: "#0d0d0d",
  bg3: "#111111",
  bg4: "#161616",
  bg5: "#1a1a1a",
  border0: "#1a1a1a",
  border1: "#2a2a2a",
  border2: "#3a3a3a",
  border3: "#555555",
  border4: "#7a7a7a",
  text0: "#ffffff",
  text1: "#f0f0f0",
  text2: "#c8c8c8",
  text3: "#a0a0a0",
  text4: "#444444",
  text5: "#1a1a1a",
  fontXxs: 11,
  fontXs: 12,
  fontSm: 14,
  fontMd: 18,
  fontLg: 24,
  fontXl: 32,
  fontXxl: 40,
  font3xl: 48,
  lineHeight: 1.4,
  radius: 0,
});
