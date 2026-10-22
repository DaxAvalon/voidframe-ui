// Regression: custom `theme` tokens must reach portaled overlays. The
// provider publishes them as a stylesheet rule on html[data-vf-theme=…],
// which portals mounted under document.body inherit.
import { render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { VoidframeProvider } from "../VoidframeProvider";
import { createTheme, themeToCss } from "../../index";

const styleEl = (name: string) =>
  document.head.querySelector(`style[data-vf-theme-vars="${name}"]`);

afterEach(() => {
  document.head.querySelectorAll("style[data-vf-theme-vars]").forEach((n) => n.remove());
});

describe("VoidframeProvider publishes custom theme tokens for portals", () => {
  it("emits an html[data-vf-theme] rule carrying the override tokens", () => {
    render(
      <VoidframeProvider themeName="warm" theme={{ bg1: "#123456", green: "#00ff00" }}>
        <span>x</span>
      </VoidframeProvider>
    );
    const el = styleEl("warm");
    expect(el).not.toBeNull();
    expect(el!.textContent).toContain('html[data-vf-theme="warm"]');
    expect(el!.textContent).toContain("--vf-bg-1:#123456;");
    expect(el!.textContent).toContain("--vf-green:#00ff00;");
  });

  it("emits the full set for a createTheme() object and removes it on unmount", () => {
    const warm = createTheme({ bg0: "#0a0806" });
    const { unmount } = render(
      <VoidframeProvider themeName="warm" theme={warm}>
        <span>x</span>
      </VoidframeProvider>
    );
    expect(styleEl("warm")!.textContent).toContain("--vf-bg-0:#0a0806;");
    unmount();
    expect(styleEl("warm")).toBeNull();
  });

  it("emits nothing without a theme object or under scope=root", () => {
    render(
      <>
        <VoidframeProvider themeName="dark">
          <span>a</span>
        </VoidframeProvider>
        <VoidframeProvider themeName="scoped" theme={{ bg1: "#000001" }} scope="root">
          <span>b</span>
        </VoidframeProvider>
      </>
    );
    expect(document.head.querySelectorAll("style[data-vf-theme-vars]")).toHaveLength(0);
  });

  it("does not churn the style element when the theme object identity changes", () => {
    const { rerender } = render(
      <VoidframeProvider themeName="warm" theme={{ bg1: "#123456" }}>
        <span>x</span>
      </VoidframeProvider>
    );
    const first = styleEl("warm");
    rerender(
      <VoidframeProvider themeName="warm" theme={{ bg1: "#123456" }}>
        <span>y</span>
      </VoidframeProvider>
    );
    expect(styleEl("warm")).toBe(first);
  });

  it("themeToCss escapes quotes in the name and serialises px for numeric tokens", () => {
    const css = themeToCss('ev"il', { fontMd: 14, lineHeight: 1.5 });
    expect(css).toBe('html[data-vf-theme="evil"]{--vf-font-md:14px;--vf-line-height:1.5;}');
  });
});
