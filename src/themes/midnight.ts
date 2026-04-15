// Phase 15 — midnight theme.
//
// Deeper blacks than the default dark theme, slightly desaturated accents
// to match the quieter surface ramp. Targets OLED screens, low-light
// work, and dashboards that want to fade into the background.

import { createTheme, type VoidframeTokens } from "../tokens";

export const midnightTheme: VoidframeTokens = createTheme({
  bg0: "#000000",
  bg1: "#040407",
  bg2: "#07070d",
  bg3: "#0b0b14",
  bg4: "#11111c",
  bg5: "#161624",
  border0: "#0b0b14",
  border1: "#14141f",
  border2: "#1b1b2a",
  border3: "#2a2a3f",
  border4: "#3a3a55",
  text0: "#e8e8f5",
  text1: "#bbbbd0",
  text2: "#7d7d94",
  text3: "#4f4f66",
  text4: "#2e2e44",
  text5: "#161624",
  green: "#6ee7a8",
  red: "#f47a7a",
  amber: "#e2c256",
  blue: "#7db0ee",
  purple: "#b983ff",
  cyan: "#7fe8f3",
  rose: "#ff95b6",
  success: "#6ee7a8",
  danger: "#f47a7a",
  warning: "#e2c256",
  info: "#7db0ee",
});
