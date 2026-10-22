"use client";

import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { useIsomorphicLayoutEffect } from "../hooks/useIsomorphicLayoutEffect";
import "../css/index.css";
import {
  defaultTokens,
  createTheme,
  type ThemeOverrides,
  type VoidframeTokens,
} from "../tokens";
import {
  darkTheme,
  lightTheme,
  midnightTheme,
  greyTheme,
  softTheme,
  softLightTheme,
  boothTheme,
  tokensToCssVars,
  themeToCss,
  type BuiltInThemeName,
} from "../themes";
import { MessagesProvider } from "../i18n/MessagesProvider";
import type { PartialMessages } from "../i18n/messages";
import type { LocalePack } from "../i18n/locales/types";
import { cx } from "../utils/cx";
import { scaleTokens, scaledOverrides, type Scale } from "../themes/scale";
import { warnUnknownTokens } from "../utils/auditTokens";

const VoidframeContext = createContext<VoidframeTokens>(defaultTokens);

// ── Runtime configuration types ───────────────────────────

export type VoidframeDensity = "comfortable" | "compact" | "spacious";
export type VoidframeContrast = "normal" | "high";
export type VoidframeDirection = "ltr" | "rtl";
export type VoidframeReducedMotion = "auto" | "always" | "never";
export type ThemeName = BuiltInThemeName | "system" | (string & {});

/**
 * Where theme attributes (`data-vf-theme`, `data-vf-density`, `data-vf-contrast`,
 * `data-vf-motion`) get written.
 *
 * - `"global"` (default) — attributes are written to `document.documentElement`
 *   AND the provider's wrapper div, so portaled overlays (Dialog, DrawerV2,
 *   Menu, ContextMenu, Toaster, Tooltip, Popover, Popconfirm, HoverCard,
 *   Lightbox, Spotlight) inherit the theme even when mounted at `document.body`.
 * - `"root"` — attributes only on the provider's wrapper div. Use when you want
 *   strictly-scoped theming and will handle portal-theme inheritance manually
 *   (e.g. by wrapping individual portaled surfaces in `<ThemeScope>`).
 */
export type VoidframeScope = "global" | "root";

interface ResolvedScope {
  tokens: VoidframeTokens;
  themeName: string;
  density: VoidframeDensity;
  contrast: VoidframeContrast;
  direction: VoidframeDirection;
  reducedMotion: VoidframeReducedMotion;
}

const RuntimeScopeContext = createContext<ResolvedScope | null>(null);

/** Access the nearest resolved theme scope (or `null` outside a provider). */
export function useThemeScope(): ResolvedScope | null {
  return useContext(RuntimeScopeContext);
}

export interface ThemeControl {
  /** The theme name as set (may be `"system"`). */
  themeName: ThemeName;
  /** The name actually applied (`"system"` resolved to `dark`/`light`). */
  resolvedThemeName: string;
  /**
   * Change the theme. Updates the provider's own state when `themeName` is
   * uncontrolled, and always calls `onThemeNameChange`.
   */
  setThemeName: (next: ThemeName) => void;
}

const ThemeControlContext = createContext<ThemeControl | null>(null);

const noProviderControl: ThemeControl = {
  themeName: "dark",
  resolvedThemeName: "dark",
  setThemeName: () => {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[voidframe] useTheme().setThemeName called outside <VoidframeProvider>; nothing to update.");
    }
  },
};

/**
 * Read and change the active theme from anywhere under the provider.
 * Pair with `useThemePersistence` at the root (`themeName={theme}
 * onThemeNameChange={setTheme}`) and a settings pane can call
 * `setThemeName` without lifting state itself.
 */
export function useTheme(): ThemeControl {
  return useContext(ThemeControlContext) ?? noProviderControl;
}

export interface VoidframeProviderProps {
  /**
   * Full token set or partial overrides merged over `defaultTokens`.
   * For pure theme switching, prefer `themeName`.
   */
  theme?: VoidframeTokens | ThemeOverrides;
  /**
   * Named theme. `"system"` follows `prefers-color-scheme`. Custom strings
   * are emitted as `data-vf-theme="…"` so consumer CSS can register new
   * palettes statically.
   */
  themeName?: ThemeName;
  /**
   * Initial theme name when `themeName` is left uncontrolled; the provider
   * then owns the state and `useTheme().setThemeName` changes it. Default
   * `"dark"`.
   */
  defaultThemeName?: ThemeName;
  /** Fires with the next name whenever `useTheme().setThemeName` is called. */
  onThemeNameChange?: (next: ThemeName) => void;
  /** Density mode. Scales spacing globally. */
  density?: VoidframeDensity;
  /**
   * Type scale, independent of the palette: a multiplier applied to every
   * font and spacing token (`1.25`, rounded to half pixels), a preset name
   * (`"booth"`), or a `TypeScale` object. Emitted as runtime `--vf-font-*`
   * / `--vf-sp-*` vars, reaching portaled overlays too.
   */
  scale?: Scale;
  /** Contrast mode. Boosts text + border tokens under `"high"`. */
  contrast?: VoidframeContrast;
  /** Writing direction. Root gains `dir="…"`. */
  direction?: VoidframeDirection;
  /**
   * Motion behavior. `"auto"` (default) respects OS preference; `"always"`
   * force-disables motion; `"never"` overrides the OS preference and
   * keeps animations on.
   */
  reducedMotion?: VoidframeReducedMotion;
  /** Inject the optional CSS reset (`.vf-baseline`). */
  cssBaseline?: boolean;
  /**
   * Full locale pack (messages + direction + firstDayOfWeek). When
   * supplied, direction auto-derives from the pack unless the
   * `direction` prop above overrides it.
   */
  locale?: LocalePack;
  /** Partial message overrides layered on top of `locale` (or English). */
  messages?: PartialMessages;
  /** Override the BCP-47 locale tag independent of the locale pack. */
  localeTag?: string;
  /** 0 = Sunday … 6 = Saturday. Derived from locale pack when omitted. */
  firstDayOfWeek?: number;
  /** Default time zone for date/time rendering. */
  timeZone?: string;
  /**
   * Where theme attributes get written. Default `"global"` writes to
   * `document.documentElement` so portaled overlays inherit the theme.
   * Pass `"root"` to restrict theme scoping to the provider's wrapper div.
   */
  scope?: VoidframeScope;
  /**
   * Development only: after mount, scan the loaded stylesheets once for
   * `var(--vf-…)` references that nothing defines and `console.warn` the
   * names. No-op in production builds. Default `false`.
   */
  auditTokens?: boolean;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

const BUILTIN_THEMES: Record<BuiltInThemeName, VoidframeTokens> = {
  dark: darkTheme,
  light: lightTheme,
  midnight: midnightTheme,
  grey: greyTheme,
  soft: softTheme,
  "soft-light": softLightTheme,
  booth: boothTheme,
};

function resolveSystemScheme(): "dark" | "light" {
  if (typeof window === "undefined" || !window.matchMedia) return "dark";
  return window.matchMedia("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
}

/**
 * Theme provider. Wraps your app (or a subtree) and injects:
 *   - `.vf-root` baseline class
 *   - `data-vf-theme` for stylesheet-driven theme switching
 *   - `data-vf-density`, `data-vf-contrast`, `data-vf-motion` for modes
 *   - `dir` for RTL
 *   - CSS custom properties on `style` when `theme` supplies runtime
 *     overrides
 *
 * @example
 * <VoidframeProvider themeName="system" density="compact">
 *   <App />
 * </VoidframeProvider>
 */
export function VoidframeProvider({
  theme,
  themeName: themeNameProp,
  defaultThemeName = "dark",
  onThemeNameChange,
  density = "comfortable",
  scale,
  contrast = "normal",
  direction,
  reducedMotion = "auto",
  cssBaseline = false,
  locale,
  messages,
  localeTag,
  firstDayOfWeek,
  timeZone,
  scope: themeScopeMode = "global",
  auditTokens: auditTokensProp = false,
  className,
  style,
  children,
}: VoidframeProviderProps) {
  // Theme name: controlled by `themeName`, else owned here.
  const [internalThemeName, setInternalThemeName] = useState<ThemeName>(defaultThemeName);
  const themeName = themeNameProp ?? internalThemeName;
  const setThemeName = useCallback(
    (next: ThemeName) => {
      if (themeNameProp === undefined) setInternalThemeName(next);
      onThemeNameChange?.(next);
    },
    [themeNameProp, onThemeNameChange]
  );
  // Direction resolution: explicit prop > locale pack > ltr.
  const resolvedDirection: VoidframeDirection =
    direction ?? locale?.direction ?? "ltr";
  // Resolve `"system"` to the actual matchMedia result + subscribe to changes.
  const [systemScheme, setSystemScheme] = useState<"dark" | "light">(() =>
    resolveSystemScheme()
  );
  useEffect(() => {
    if (themeName !== "system") return;
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mql = window.matchMedia("(prefers-color-scheme: light)");
    const onChange = () => setSystemScheme(mql.matches ? "light" : "dark");
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [themeName]);

  const resolvedThemeName =
    themeName === "system" ? systemScheme : themeName;

  // Base token set: a built-in, else the caller's full theme, else default.
  const baseTokens = useMemo<VoidframeTokens>(() => {
    if (resolvedThemeName in BUILTIN_THEMES) {
      return BUILTIN_THEMES[resolvedThemeName as BuiltInThemeName];
    }
    return defaultTokens;
  }, [resolvedThemeName]);

  const unscaledTokens = useMemo<VoidframeTokens>(() => {
    if (!theme) return baseTokens;
    if (isFullTokenSet(theme)) return theme;
    return createTheme({ ...baseTokens, ...theme });
  }, [theme, baseTokens]);
  const tokens = useMemo<VoidframeTokens>(
    () => (scale === undefined ? unscaledTokens : scaleTokens(unscaledTokens, scale)),
    [unscaledTokens, scale]
  );

  // Everything that must be emitted at runtime to beat the stylesheet: the
  // caller's theme overrides plus whatever the scale changed.
  const runtimeOverrides = useMemo<ThemeOverrides | null>(() => {
    const scaled = scale === undefined ? {} : scaledOverrides(unscaledTokens, scale);
    if (!theme) return Object.keys(scaled).length ? scaled : null;
    return { ...(theme as ThemeOverrides), ...scaled };
  }, [theme, scale, unscaledTokens]);

  const overrideStyle = useMemo<CSSProperties>(
    () => (runtimeOverrides ? tokensToCssVars(runtimeOverrides) : {}),
    [runtimeOverrides]
  );

  const control = useMemo<ThemeControl>(
    () => ({ themeName, resolvedThemeName, setThemeName }),
    [themeName, resolvedThemeName, setThemeName]
  );

  const scope = useMemo<ResolvedScope>(
    () => ({
      tokens,
      themeName: resolvedThemeName,
      density,
      contrast,
      direction: resolvedDirection,
      reducedMotion,
    }),
    [tokens, resolvedThemeName, density, contrast, resolvedDirection, reducedMotion]
  );

  const mergedStyle = useMemo<CSSProperties | undefined>(
    () =>
      Object.keys(overrideStyle).length > 0 || style
        ? { ...overrideStyle, ...style }
        : undefined,
    [overrideStyle, style]
  );

  // Mirror theme attributes to <html> so portaled overlays (Dialog, DrawerV2,
  // Menu, ContextMenu, Toaster, Tooltip, Popover, Popconfirm, HoverCard,
  // Lightbox, Spotlight) inherit the active theme. React Portals mount at
  // document.body, outside the provider's subtree, so without this write
  // the CSS var cascade never reaches them.
  useIsomorphicLayoutEffect(() => {
    if (themeScopeMode !== "global") return;
    if (typeof document === "undefined") return;
    const root = document.documentElement;

    const prevTheme = root.getAttribute("data-vf-theme");
    const prevDensity = root.getAttribute("data-vf-density");
    const prevContrast = root.getAttribute("data-vf-contrast");
    const prevMotion = root.getAttribute("data-vf-motion");
    const prevDir = root.getAttribute("dir");

    root.setAttribute("data-vf-theme", resolvedThemeName);
    if (density !== "comfortable") root.setAttribute("data-vf-density", density);
    else root.removeAttribute("data-vf-density");
    if (contrast !== "normal") root.setAttribute("data-vf-contrast", contrast);
    else root.removeAttribute("data-vf-contrast");
    if (reducedMotion !== "auto")
      root.setAttribute("data-vf-motion", reducedMotion);
    else root.removeAttribute("data-vf-motion");
    if (resolvedDirection === "rtl") root.setAttribute("dir", "rtl");
    else if (prevDir === "rtl") root.removeAttribute("dir");

    return () => {
      // Restore whatever was there before this provider mounted, so that
      // nested providers or late-unmounting providers don't leave stale
      // attributes on <html>.
      if (prevTheme !== null) root.setAttribute("data-vf-theme", prevTheme);
      else root.removeAttribute("data-vf-theme");
      if (prevDensity !== null) root.setAttribute("data-vf-density", prevDensity);
      else root.removeAttribute("data-vf-density");
      if (prevContrast !== null) root.setAttribute("data-vf-contrast", prevContrast);
      else root.removeAttribute("data-vf-contrast");
      if (prevMotion !== null) root.setAttribute("data-vf-motion", prevMotion);
      else root.removeAttribute("data-vf-motion");
      if (prevDir !== null) root.setAttribute("dir", prevDir);
      else root.removeAttribute("dir");
    };
  }, [themeScopeMode, resolvedThemeName, density, contrast, reducedMotion, resolvedDirection]);

  // Custom `theme` tokens are inline on the wrapper div, which portaled
  // overlays (mounted under document.body) never inherit. Publish them as a
  // stylesheet rule on `html[data-vf-theme="<name>"]` so portals read the
  // same values. Removed on unmount or when the theme changes.
  const themeVarsCss = useMemo(
    () => (runtimeOverrides ? themeToCss(resolvedThemeName, runtimeOverrides) : ""),
    [runtimeOverrides, resolvedThemeName]
  );
  useIsomorphicLayoutEffect(() => {
    if (themeScopeMode !== "global") return;
    if (typeof document === "undefined") return;
    if (!themeVarsCss) return;
    const el = document.createElement("style");
    el.setAttribute("data-vf-theme-vars", resolvedThemeName);
    el.textContent = themeVarsCss;
    document.head.appendChild(el);
    return () => {
      el.remove();
    };
    // Keyed on the serialised CSS (a string), so an inline `theme={{…}}`
    // object with a fresh identity does not churn the style element.
  }, [themeScopeMode, resolvedThemeName, themeVarsCss]);

  useEffect(() => {
    if (!auditTokensProp || process.env.NODE_ENV === "production") return;
    warnUnknownTokens();
  }, [auditTokensProp]);

  return (
    <VoidframeContext.Provider value={tokens}>
      <ThemeControlContext.Provider value={control}>
      <RuntimeScopeContext.Provider value={scope}>
        <div
          className={cx("vf-root", cssBaseline && "vf-baseline", className)}
          data-vf-theme={resolvedThemeName}
          data-vf-density={density !== "comfortable" ? density : undefined}
          data-vf-scale={scale === undefined ? undefined : typeof scale === "object" ? "custom" : String(scale)}
          data-vf-contrast={contrast !== "normal" ? contrast : undefined}
          data-vf-motion={reducedMotion !== "auto" ? reducedMotion : undefined}
          dir={resolvedDirection === "rtl" ? "rtl" : undefined}
          style={mergedStyle}
        >
          <MessagesProvider
            locale={locale}
            messages={messages}
            localeTag={localeTag}
            firstDayOfWeek={firstDayOfWeek}
            timeZone={timeZone}
            direction={resolvedDirection}
          >
            {children}
          </MessagesProvider>
        </div>
      </RuntimeScopeContext.Provider>
      </ThemeControlContext.Provider>
    </VoidframeContext.Provider>
  );
}

function isFullTokenSet(
  t: VoidframeTokens | ThemeOverrides | undefined
): t is VoidframeTokens {
  if (!t) return false;
  // Cheap heuristic — a full set always has the full palette keys.
  const k = t as ThemeOverrides;
  return (
    k.bg0 !== undefined &&
    k.text0 !== undefined &&
    k.fontFamily !== undefined &&
    k.sp1 !== undefined
  );
}

/**
 * Access the current Voidframe tokens from any child component.
 * Falls back to `defaultTokens` if no provider is found.
 */
export function useTokens(): VoidframeTokens {
  return useContext(VoidframeContext);
}

export { VoidframeContext as _VoidframeContextForTesting };
