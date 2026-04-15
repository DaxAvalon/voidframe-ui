"use client";

// Phase 15 — ThemeScope
//
// Nested subtree override. Re-emits CSS custom properties + data-attrs
// at its own root div. No JS context dance — tokens flow through CSS
// custom property cascade plus an optional `useTokens` pass-through.

import {
  forwardRef,
  useMemo,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { cx } from "../utils/cx";
import {
  tokensToCssVars,
  type BuiltInThemeName,
} from "../themes";
import type { ThemeOverrides, VoidframeTokens } from "../tokens";
import { darkTheme, lightTheme, midnightTheme } from "../themes";
import {
  useTokens,
  _VoidframeContextForTesting,
  type VoidframeContrast,
  type VoidframeDensity,
  type VoidframeDirection,
  type VoidframeReducedMotion,
} from "./VoidframeProvider";

const BUILTIN_THEMES: Record<BuiltInThemeName, VoidframeTokens> = {
  dark: darkTheme,
  light: lightTheme,
  midnight: midnightTheme,
};

export interface ThemeScopeProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "dir"> {
  theme?: VoidframeTokens | ThemeOverrides;
  themeName?: BuiltInThemeName | (string & {});
  density?: VoidframeDensity;
  contrast?: VoidframeContrast;
  direction?: VoidframeDirection;
  reducedMotion?: VoidframeReducedMotion;
  /** Render as a span to avoid creating a block-level wrapper. */
  inline?: boolean;
  children?: ReactNode;
}

export const ThemeScope = forwardRef<HTMLDivElement, ThemeScopeProps>(
  function ThemeScope(
    {
      theme,
      themeName,
      density,
      contrast,
      direction,
      reducedMotion,
      inline,
      className,
      style,
      children,
      ...props
    },
    ref
  ) {
    const outerTokens = useTokens();
    const tokens = useMemo<VoidframeTokens>(() => {
      if (theme && isFullTokenSet(theme)) return theme;
      const base =
        themeName && themeName in BUILTIN_THEMES
          ? BUILTIN_THEMES[themeName as BuiltInThemeName]
          : outerTokens;
      if (!theme) return base;
      return { ...base, ...theme };
    }, [theme, themeName, outerTokens]);

    const cssVars = useMemo<CSSProperties>(
      () => tokensToCssVars(tokens),
      [tokens]
    );

    const composed: CSSProperties = {
      ...cssVars,
      ...style,
    };

    const Tag = inline ? "span" : "div";

    return (
      <_VoidframeContextForTesting.Provider value={tokens}>
        <Tag
          ref={ref as never}
          className={cx("vf-theme-scope", className)}
          data-vf-theme={themeName}
          data-vf-density={
            density && density !== "comfortable" ? density : undefined
          }
          data-vf-contrast={
            contrast && contrast !== "normal" ? contrast : undefined
          }
          data-vf-motion={
            reducedMotion && reducedMotion !== "auto"
              ? reducedMotion
              : undefined
          }
          dir={direction === "rtl" ? "rtl" : undefined}
          style={composed}
          {...props}
        >
          {children}
        </Tag>
      </_VoidframeContextForTesting.Provider>
    );
  }
);
ThemeScope.displayName = "ThemeScope";

function isFullTokenSet(
  t: VoidframeTokens | ThemeOverrides
): t is VoidframeTokens {
  const k = t as ThemeOverrides;
  return (
    k.bg0 !== undefined &&
    k.text0 !== undefined &&
    k.fontFamily !== undefined &&
    k.sp1 !== undefined
  );
}
