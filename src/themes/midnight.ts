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
  // Opacity ramps must track the accents above; without these, createTheme
  // fills them from the default dark accents and tinted surfaces mismatch.
  // Values mirror tokens.css [data-vf-theme="midnight"].
  green5: "#6ee7a80d", green10: "#6ee7a81a", green20: "#6ee7a833", green40: "#6ee7a866", green60: "#6ee7a899",
  red5: "#f47a7a0d", red10: "#f47a7a1a", red20: "#f47a7a33", red40: "#f47a7a66", red60: "#f47a7a99",
  amber5: "#e2c2560d", amber10: "#e2c2561a", amber20: "#e2c25633", amber40: "#e2c25666", amber60: "#e2c25699",
  blue5: "#7db0ee0d", blue10: "#7db0ee1a", blue20: "#7db0ee33", blue40: "#7db0ee66", blue60: "#7db0ee99",
  purple5: "#b983ff0d", purple10: "#b983ff1a", purple20: "#b983ff33", purple40: "#b983ff66", purple60: "#b983ff99",
  cyan5: "#7fe8f30d", cyan10: "#7fe8f31a", cyan20: "#7fe8f333", cyan40: "#7fe8f366", cyan60: "#7fe8f399",
  rose5: "#ff95b60d", rose10: "#ff95b61a", rose20: "#ff95b633", rose40: "#ff95b666", rose60: "#ff95b699",
  success: "#6ee7a8",
  danger: "#f47a7a",
  warning: "#e2c256",
  info: "#7db0ee",
});
