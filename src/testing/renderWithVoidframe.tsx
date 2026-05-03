// Phase C.5 — Comprehensive `renderWithVoidframe` test helper.
//
// Wraps a component under test in the FULL voidframe provider stack:
//   - VoidframeProvider (theme + density + locale)
//   - ConfirmProvider   (so `useConfirm()` works without consumer setup)
//
// Re-exports `@testing-library/react`'s `render` / `screen` / `waitFor` /
// `userEvent` for convenience so apps don't have to dual-import. The
// existing `renderWithTheme` is the "VoidframeProvider only" version;
// `renderWithVoidframe` is the "full stack" version most apps want.

import {
  render,
  type RenderOptions,
  type RenderResult,
} from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import { VoidframeProvider } from "../provider/VoidframeProvider";
import { ThemeScope } from "../provider/ThemeScope";
import { ConfirmProvider } from "../components/Dialog";
import type { ThemeOverrides } from "../tokens";
import type { LocalePack } from "../i18n/locales/types";

export interface RenderWithVoidframeOptions extends RenderOptions {
  theme?: ThemeOverrides;
  locale?: LocalePack;
  themeName?: "dark" | "light" | "midnight" | "grey" | "system" | (string & {});
  density?: "comfortable" | "compact" | "spacious";
  contrast?: "normal" | "high";
  direction?: "ltr" | "rtl";
  /**
   * Set to `false` to skip the `ConfirmProvider` wrapper. Defaults to `true`
   * so `useConfirm()` calls inside the component under test work without
   * extra setup. The provider is no-op when nothing inside the tree
   * actually calls `useConfirm`.
   */
  withConfirm?: boolean;
  /**
   * Optional nested `ThemeScope` configuration. When set, wraps the component
   * in a `<ThemeScope>` *inside* the outer VoidframeProvider so the test
   * exercises the local-override theming path. Useful for asserting that
   * portaled overlays inherit a deeper-scoped theme correctly.
   */
  scope?: {
    themeName?: "dark" | "light" | "midnight" | "grey" | (string & {});
    density?: "comfortable" | "compact" | "spacious";
    contrast?: "normal" | "high";
    /** Mirror the scoped theme to documentElement (see ThemeScope.globalize). */
    globalize?: boolean;
  };
  /**
   * Inject extra wrapping around the test component (between the voidframe
   * providers and the component itself). Useful for app-specific
   * router/store providers.
   */
  extraWrappers?: (children: ReactNode) => ReactNode;
}

export interface RenderWithVoidframeResult extends RenderResult {}

/**
 * Render a component inside the full voidframe provider stack. Pass
 * `themeName`/`density`/etc. to test theming behavior. The `ConfirmProvider`
 * is included by default so components that imperatively call `useConfirm()`
 * work in tests without extra plumbing.
 *
 * @example
 *   import { renderWithVoidframe } from "voidframe-ui/testing";
 *   import { screen } from "@testing-library/react";
 *
 *   renderWithVoidframe(<MyDeleteDialog />);
 *   await userEvent.click(screen.getByTestId("vf-confirm-confirm-button"));
 */
export function renderWithVoidframe(
  ui: ReactElement,
  {
    theme,
    locale,
    themeName,
    density,
    contrast,
    direction,
    withConfirm = true,
    scope,
    extraWrappers,
    ...options
  }: RenderWithVoidframeOptions = {}
): RenderWithVoidframeResult {
  return render(ui, {
    wrapper: ({ children }) => {
      // Wrap order (innermost → outermost):
      //   ui  →  extraWrappers  →  ConfirmProvider  →  ThemeScope (if scope)
      //          →  VoidframeProvider
      const wrapped = extraWrappers ? extraWrappers(children) : children;
      const withConfirmWrapper = withConfirm ? (
        <ConfirmProvider>{wrapped}</ConfirmProvider>
      ) : (
        wrapped
      );
      const withScope = scope ? (
        <ThemeScope
          themeName={scope.themeName}
          density={scope.density}
          contrast={scope.contrast}
          globalize={scope.globalize}
        >
          {withConfirmWrapper}
        </ThemeScope>
      ) : (
        withConfirmWrapper
      );
      return (
        <VoidframeProvider
          theme={theme}
          themeName={themeName}
          locale={locale}
          density={density}
          contrast={contrast}
          direction={direction}
        >
          {withScope}
        </VoidframeProvider>
      );
    },
    ...options,
  });
}

// Re-export convenience: most consumers will dual-import @testing-library/react
// for `screen`, `waitFor`, etc. — passing them through saves an import line.
export {
  render,
  screen,
  waitFor,
  fireEvent,
  within,
  cleanup,
  act,
} from "@testing-library/react";
