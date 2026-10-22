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
export { VoidframeProvider, useTokens, useThemeScope, useTheme } from "../provider/VoidframeProvider";
export type {
  VoidframeProviderProps,
  ThemeControl,
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
export { readToken, readTokens } from "../utils/readToken";
export type { ReadTokenOptions } from "../utils/readToken";
export { useVoidframeTokens } from "../hooks/useVoidframeTokens";
export type { UseVoidframeTokensOptions } from "../hooks/useVoidframeTokens";
export type {
  UseThemePersistenceOptions,
  UseThemePersistenceReturn,
} from "../hooks/useThemePersistence";
export { defaultTokens, createTheme, tint, withAccentAlphas, defineTheme, tokensToCssDeclarations } from "../tokens";
export type { VoidframeTokens, ThemeOverrides, AccentHue, DefineThemeInput, DefinedTheme } from "../tokens";
export {
  darkTheme,
  lightTheme,
  midnightTheme,
  greyTheme,
  softTheme,
  softLightTheme,
  boothTheme,
  boothPalette,
  boothScale,
  TYPE_SCALES,
  scaleTokens,
  tokensToCssVars,
  themeToCss,
  THEME_NAMES,
  THEME_OPTIONS,
} from "../themes";
export type { BuiltInThemeName, ThemeOption, Scale, TypeScale, TypeScaleName } from "../themes";
