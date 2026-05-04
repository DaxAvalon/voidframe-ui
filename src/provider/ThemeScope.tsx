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
import { useIsomorphicLayoutEffect } from "../hooks/useIsomorphicLayoutEffect";
import { cx } from "../utils/cx";
import {
  tokensToCssVars,
  type BuiltInThemeName,
} from "../themes";
import type { ThemeOverrides, VoidframeTokens } from "../tokens";
import {
  darkTheme,
  lightTheme,
  midnightTheme,
  greyTheme,
} from "../themes";
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
  grey: greyTheme,
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
  /**
   * When true, theme attributes are also mirrored to `document.documentElement`
   * for the lifetime of this scope. Use inside a portaled overlay when you
   * need nested theming to affect the whole page (rare). Defaults to `false`
   * — nested scopes are local-only.
   */
  globalize?: boolean;
  children?: ReactNode;
}

/**
 * Subtree-level theme override. Wrap any subtree to apply a different theme
 * without rerooting the whole app.
 */
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
      globalize,
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

    const composed = useMemo<CSSProperties>(
      () => ({ ...cssVars, ...style }),
      [cssVars, style]
    );

    const Tag = inline ? "span" : "div";

    // Optional: mirror this scope's theme attributes to document.documentElement
    // so portaled overlays rendered outside the ThemeScope subtree (Dialog,
    // DrawerV2, Menu dropdowns, Toaster, etc.) inherit the scoped theme too.
    // Off by default — nested scopes are local to their subtree.
    useIsomorphicLayoutEffect(() => {
      if (!globalize) return;
      if (typeof document === "undefined") return;
      const root = document.documentElement;
      const prevTheme = root.getAttribute("data-vf-theme");
      const prevDensity = root.getAttribute("data-vf-density");
      const prevContrast = root.getAttribute("data-vf-contrast");
      const prevMotion = root.getAttribute("data-vf-motion");
      const prevDir = root.getAttribute("dir");
      if (themeName) root.setAttribute("data-vf-theme", themeName);
      if (density && density !== "comfortable")
        root.setAttribute("data-vf-density", density);
      if (contrast && contrast !== "normal")
        root.setAttribute("data-vf-contrast", contrast);
      if (reducedMotion && reducedMotion !== "auto")
        root.setAttribute("data-vf-motion", reducedMotion);
      if (direction === "rtl") root.setAttribute("dir", "rtl");
      return () => {
        if (prevTheme !== null) root.setAttribute("data-vf-theme", prevTheme);
        else if (themeName) root.removeAttribute("data-vf-theme");
        if (prevDensity !== null)
          root.setAttribute("data-vf-density", prevDensity);
        else root.removeAttribute("data-vf-density");
        if (prevContrast !== null)
          root.setAttribute("data-vf-contrast", prevContrast);
        else root.removeAttribute("data-vf-contrast");
        if (prevMotion !== null)
          root.setAttribute("data-vf-motion", prevMotion);
        else root.removeAttribute("data-vf-motion");
        if (prevDir !== null) root.setAttribute("dir", prevDir);
        else if (direction === "rtl") root.removeAttribute("dir");
      };
    }, [globalize, themeName, density, contrast, reducedMotion, direction]);

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
