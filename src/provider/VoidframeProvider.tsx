"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
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
  tokensToCssVars,
  type BuiltInThemeName,
} from "../themes";
import { MessagesProvider } from "../i18n/MessagesProvider";
import type { PartialMessages } from "../i18n/messages";
import type { LocalePack } from "../i18n/locales/types";
import { cx } from "../utils/cx";

const VoidframeContext = createContext<VoidframeTokens>(defaultTokens);

// ── Runtime configuration types ───────────────────────────

export type VoidframeDensity = "comfortable" | "compact" | "spacious";
export type VoidframeContrast = "normal" | "high";
export type VoidframeDirection = "ltr" | "rtl";
export type VoidframeReducedMotion = "auto" | "always" | "never";
export type ThemeName = BuiltInThemeName | "system" | (string & {});

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
  /** Density mode. Scales spacing globally. */
  density?: VoidframeDensity;
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
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

const BUILTIN_THEMES: Record<BuiltInThemeName, VoidframeTokens> = {
  dark: darkTheme,
  light: lightTheme,
  midnight: midnightTheme,
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
  themeName = "dark",
  density = "comfortable",
  contrast = "normal",
  direction,
  reducedMotion = "auto",
  cssBaseline = false,
  locale,
  messages,
  localeTag,
  firstDayOfWeek,
  timeZone,
  className,
  style,
  children,
}: VoidframeProviderProps) {
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

  const tokens = useMemo<VoidframeTokens>(() => {
    if (!theme) return baseTokens;
    if (isFullTokenSet(theme)) return theme;
    return createTheme({ ...baseTokens, ...theme });
  }, [theme, baseTokens]);

  // Emit runtime CSS vars whenever the caller supplied overrides or a
  // non-default built-in needs to beat `:root`'s stylesheet.
  const overrideStyle = useMemo<CSSProperties>(() => {
    if (isFullTokenSet(theme)) return tokensToCssVars(theme);
    if (theme) return tokensToCssVars(theme);
    return {};
  }, [theme]);

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

  const mergedStyle: CSSProperties | undefined =
    Object.keys(overrideStyle).length > 0 || style
      ? { ...overrideStyle, ...style }
      : undefined;

  return (
    <VoidframeContext.Provider value={tokens}>
      <RuntimeScopeContext.Provider value={scope}>
        <div
          className={cx("vf-root", cssBaseline && "vf-baseline", className)}
          data-vf-theme={resolvedThemeName}
          data-vf-density={density !== "comfortable" ? density : undefined}
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
