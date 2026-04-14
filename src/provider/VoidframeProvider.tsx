import { createContext, useContext, useMemo, type CSSProperties, type ReactNode } from "react";
import "../css/index.css";
import {
  defaultTokens,
  createTheme,
  type ThemeOverrides,
  type VoidframeTokens,
} from "../tokens";
import { cx } from "../utils/cx";

const VoidframeContext = createContext<VoidframeTokens>(defaultTokens);

export type ThemeName = "dark" | "light" | (string & {});

export interface VoidframeProviderProps {
  /** Optional theme overrides. Merged over `defaultTokens` and injected as inline CSS variables. */
  theme?: ThemeOverrides;
  /** Built-in or custom theme name. Sets `data-vf-theme` on the root element. */
  themeName?: ThemeName;
  /** Inject the optional CSS reset (`.vf-baseline`). */
  cssBaseline?: boolean;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

/**
 * Theme provider. Wraps your app (or a subtree) and injects the .vf-root
 * baseline class plus `data-vf-theme` for switching between dark/light.
 *
 * Inline runtime overrides via `theme` flow into the root as CSS custom
 * property declarations (e.g., `--vf-green: ...`).
 *
 * @example
 * <VoidframeProvider themeName="dark">
 *   <App />
 * </VoidframeProvider>
 */
export function VoidframeProvider({
  theme,
  themeName = "dark",
  cssBaseline = false,
  className,
  style,
  children,
}: VoidframeProviderProps) {
  const tokens = useMemo<VoidframeTokens>(
    () => (theme ? createTheme(theme) : defaultTokens),
    [theme]
  );

  // For runtime overrides (theme prop), emit per-token CSS variables on the
  // root element so they cascade and beat the stylesheet's defaults.
  const overrideStyle = useMemo<CSSProperties | undefined>(() => {
    if (!theme) return undefined;
    return tokensToCssVars(theme);
  }, [theme]);

  return (
    <VoidframeContext.Provider value={tokens}>
      <div
        className={cx("vf-root", cssBaseline && "vf-baseline", className)}
        data-vf-theme={themeName}
        style={overrideStyle ? { ...overrideStyle, ...style } : style}
      >
        {children}
      </div>
    </VoidframeContext.Provider>
  );
}

/** Map a token override object to its CSS-var equivalent. */
function tokensToCssVars(overrides: ThemeOverrides): CSSProperties {
  const out: Record<string, string | number> = {};
  for (const key in overrides) {
    const value = (overrides as Record<string, unknown>)[key];
    if (value === undefined) continue;
    out[`--vf-${camelToKebab(key)}`] = value as string | number;
  }
  return out as CSSProperties;
}

function camelToKebab(s: string): string {
  return s.replace(/([a-z])([A-Z0-9])/g, "$1-$2").toLowerCase();
}

/**
 * Access the current Voidframe tokens from any child component.
 * Falls back to `defaultTokens` if no provider is found.
 */
export function useTokens(): VoidframeTokens {
  return useContext(VoidframeContext);
}
