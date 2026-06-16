// Phase 18 — soft theme.
//
// A rounded, lower-contrast take on the dark theme. Surfaces step up in soft
// charcoals rather than pure black, borders are gentle, and corners are
// rounded (radius 6 / 4 / 10) — the deliberate opt-out of the brutalist
// zero-radius default for product UIs that want a calmer feel while keeping
// the monospace identity. Accents reuse the soft pastel ramp.

import { createTheme, type VoidframeTokens } from "../tokens";

export const softTheme: VoidframeTokens = createTheme({
  bg0: "#121214",
  bg1: "#17171a",
  bg2: "#1c1c20",
  bg3: "#222227",
  bg4: "#29292f",
  bg5: "#313138",
  border0: "#222227",
  border1: "#2b2b31",
  border2: "#38383f",
  border3: "#47474f",
  border4: "#5a5a63",
  text0: "#f3f3f6",
  text1: "#cdcdd4",
  text2: "#9696a0",
  text3: "#6a6a73",
  text4: "#45454c",
  text5: "#2b2b31",
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
  // The soft signature: rounded corners.
  radius: 6,
  radius1: 4,
  radius2: 10,
});
