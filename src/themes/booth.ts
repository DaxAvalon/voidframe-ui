// Booth theme — a recorder read from one to two metres away in a dark room.
//
// Two independent halves: `boothPalette` (the dark theme's ground and
// accents with the text tiers lifted so every tier used for words measures
// at least 7:1 on the ground, WCAG 1.4.6) and `boothScale` (the type scale
// raised so controls and labels read at arm's length, with a tighter line
// height for large type; see `TYPE_SCALES.booth`). `boothTheme` composes
// them with zero radius. Use `themeName="midnight" scale="booth"` for the
// scale on another palette. Specified by Vonyx (DaxAvalon/Vonyx#131,
// docs/ux/booth-visual-language.md §2); see #12 and #68.

import { createTheme, type ThemeOverrides, type VoidframeTokens } from "../tokens";
import { TYPE_SCALES, type TypeScale } from "./scale";

export const boothPalette: ThemeOverrides = {
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
  readingMeasure: "60ch",
};

export const boothScale: TypeScale = TYPE_SCALES.booth;

export const boothTheme: VoidframeTokens = createTheme({
  ...boothPalette,
  ...boothScale,
  radius: 0,
});
