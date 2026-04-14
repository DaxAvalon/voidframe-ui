import { render, type RenderOptions, type RenderResult } from "@testing-library/react";
import type { ReactElement } from "react";
import { VoidframeProvider } from "../src/provider/VoidframeProvider";
import type { ThemeOverrides } from "../src/tokens";

export interface RenderWithThemeResult extends RenderResult {
  /**
   * The root element of the component under test.
   * `VoidframeProvider` wraps children in its own styled div; this getter
   * skips past the wrapper so tests can assert against the real component.
   */
  root: () => HTMLElement;
}

export function renderWithTheme(
  ui: ReactElement,
  { theme, ...options }: RenderOptions & { theme?: ThemeOverrides } = {}
): RenderWithThemeResult {
  const result = render(ui, {
    wrapper: ({ children }) => (
      <VoidframeProvider theme={theme}>{children}</VoidframeProvider>
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
