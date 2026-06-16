// Phase 18 — soft-light theme.
//
// The rounded, low-contrast counterpart to `soft` for light environments: a
// warm "paper" surface ramp instead of glaring white, gentle borders, and the
// same rounded corners (radius 6 / 4 / 10). Accents are the darker light-theme
// values so they stay legible on a pale background.

import { createTheme, type VoidframeTokens } from "../tokens";

export const softLightTheme: VoidframeTokens = createTheme({
  bg0: "#faf9f6",
  bg1: "#f1f0ec",
  bg2: "#e9e8e3",
  bg3: "#e0dfd9",
  bg4: "#d3d2ca",
  bg5: "#c4c3ba",
  border0: "#e0dfd9",
  border1: "#cfcec6",
  border2: "#b3b2a9",
  border3: "#8d8c83",
  border4: "#66655d",
  text0: "#1c1b18",
  text1: "#3a3934",
  text2: "#5c5b54",
  text3: "#7c7b73",
  text4: "#9b9a91",
  text5: "#b9b8af",
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
  // The soft signature: rounded corners.
  radius: 6,
  radius1: 4,
  radius2: 10,
});
