// Labelled option list for every built-in theme plus "system", so a theme
// picker never hard-codes names and picks up new built-ins automatically.

import type { BuiltInThemeName } from "./index";

export interface ThemeOption {
  id: BuiltInThemeName | "system";
  label: string;
  description: string;
  /** Which scheme the theme is, for grouping or an icon. `system` follows the OS. */
  scheme: "dark" | "light" | "system";
}

export const THEME_OPTIONS: readonly ThemeOption[] = [
  { id: "system", label: "Auto", description: "Follow the operating system's light or dark setting.", scheme: "system" },
  { id: "dark", label: "Dark", description: "Near-black surfaces, white text. The default.", scheme: "dark" },
  { id: "light", label: "Light", description: "Warm off-white surfaces, black text.", scheme: "light" },
  { id: "midnight", label: "Midnight", description: "True black for OLED screens, cool blue-grey text.", scheme: "dark" },
  { id: "grey", label: "Grey", description: "Neutral mid-grey for print and projection.", scheme: "dark" },
  { id: "soft", label: "Soft", description: "Lower-contrast dark surfaces with rounded corners.", scheme: "dark" },
  { id: "soft-light", label: "Soft light", description: "Lower-contrast light surfaces with rounded corners.", scheme: "light" },
  { id: "booth", label: "Booth", description: "Dark recording-booth ground with a large type scale for reading at a distance.", scheme: "dark" },
];
