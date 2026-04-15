// Phase 19 — Exported test utility.
//
// Mirror of the internal `test/renderWithTheme.tsx` — kept here so
// consumers can import it from `voidframe/testing` without reaching
// into the repo's private test folder.

import {
  render,
  type RenderOptions,
  type RenderResult,
} from "@testing-library/react";
import type { ReactElement } from "react";
import { VoidframeProvider } from "../provider/VoidframeProvider";
import type { ThemeOverrides } from "../tokens";
import type { LocalePack } from "../i18n/locales/types";

export interface RenderWithThemeOptions extends RenderOptions {
  theme?: ThemeOverrides;
  locale?: LocalePack;
  themeName?: "dark" | "light" | "midnight" | "system" | (string & {});
  density?: "comfortable" | "compact" | "spacious";
  contrast?: "normal" | "high";
  direction?: "ltr" | "rtl";
}

export interface RenderWithThemeResult extends RenderResult {
  /**
   * The inner element rendered beneath the provider wrapper. Useful
   * when assertions need to target the component's root without the
   * `.vf-root` wrapper in the way.
   */
  root: () => HTMLElement;
}

/**
 * Render a component inside `<VoidframeProvider>` with optional theme /
 * locale / density / contrast overrides. Returns the standard Testing
 * Library result plus a `root()` accessor that skips the provider's
 * wrapper div.
 */
export function renderWithTheme(
  ui: ReactElement,
  { theme, locale, themeName, density, contrast, direction, ...options }:
    RenderWithThemeOptions = {}
): RenderWithThemeResult {
  const result = render(ui, {
    wrapper: ({ children }) => (
      <VoidframeProvider
        theme={theme}
        themeName={themeName}
        locale={locale}
        density={density}
        contrast={contrast}
        direction={direction}
      >
        {children}
      </VoidframeProvider>
    ),
    ...options,
  });
  const root = () => {
    const wrapper = result.container.firstChild as HTMLElement | null;
    const inner = wrapper?.firstChild as HTMLElement | null;
    if (!inner) throw new Error("renderWithTheme: no root element rendered");
    return inner;
  };
  return { ...result, root };
}
