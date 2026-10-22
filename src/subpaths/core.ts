// Per-category tree-shaking subpath. Re-exports a focused slice of the
// main library so consumers can `import { Button } from "voidframe-ui/core"`
// and drop every non-Core component from their bundle.
//
// Source of truth: docs/taxonomy.ts Core category.

export * from "../components/Button";
export * from "../components/Badge";
export * from "../components/Card";
export * from "../components/Text";
export * from "../components/Loading";
export * from "../components/SplitButton";
export * from "../components/CopyButton";
export * from "../components/Result";

// The provider and theming surface, so an app can mount voidframe from
// `voidframe-ui/core` without the root entry's optional peers.
export { VoidframeProvider, useTokens, useThemeScope } from "../provider/VoidframeProvider";
export type {
  VoidframeProviderProps,
  VoidframeDensity,
  VoidframeContrast,
  VoidframeDirection,
  VoidframeReducedMotion,
  VoidframeScope,
  ThemeName,
} from "../provider/VoidframeProvider";
export { ThemeScope } from "../provider/ThemeScope";
export type { ThemeScopeProps } from "../provider/ThemeScope";
export { useThemePersistence } from "../hooks/useThemePersistence";
export type {
  UseThemePersistenceOptions,
  UseThemePersistenceReturn,
} from "../hooks/useThemePersistence";
export { defaultTokens, createTheme, tint } from "../tokens";
export type { VoidframeTokens, ThemeOverrides } from "../tokens";
export {
  darkTheme,
  lightTheme,
  midnightTheme,
  greyTheme,
  softTheme,
  softLightTheme,
  boothTheme,
  tokensToCssVars,
  themeToCss,
  THEME_NAMES,
} from "../themes";
export type { BuiltInThemeName } from "../themes";
