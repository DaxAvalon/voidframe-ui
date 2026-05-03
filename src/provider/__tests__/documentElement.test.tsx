import { describe, expect, it, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { VoidframeProvider } from "../VoidframeProvider";

describe("VoidframeProvider — global theme attributes on <html>", () => {
  beforeEach(() => {
    const root = document.documentElement;
    root.removeAttribute("data-vf-theme");
    root.removeAttribute("data-vf-density");
    root.removeAttribute("data-vf-contrast");
    root.removeAttribute("data-vf-motion");
    root.removeAttribute("dir");
  });

  it("writes data-vf-theme to document.documentElement by default (scope='global')", () => {
    render(
      <VoidframeProvider themeName="midnight">
        <div />
      </VoidframeProvider>
    );
    expect(document.documentElement.getAttribute("data-vf-theme")).toBe("midnight");
  });

  it("writes density/contrast/motion/dir to <html> when non-default", () => {
    render(
      <VoidframeProvider
        themeName="light"
        density="compact"
        contrast="high"
        reducedMotion="always"
        direction="rtl"
      >
        <div />
      </VoidframeProvider>
    );
    const root = document.documentElement;
    expect(root.getAttribute("data-vf-theme")).toBe("light");
    expect(root.getAttribute("data-vf-density")).toBe("compact");
    expect(root.getAttribute("data-vf-contrast")).toBe("high");
    expect(root.getAttribute("data-vf-motion")).toBe("always");
    expect(root.getAttribute("dir")).toBe("rtl");
  });

  it("omits non-default attrs on <html> when values are default", () => {
    render(
      <VoidframeProvider themeName="dark">
        <div />
      </VoidframeProvider>
    );
    const root = document.documentElement;
    expect(root.getAttribute("data-vf-theme")).toBe("dark");
    expect(root.hasAttribute("data-vf-density")).toBe(false);
    expect(root.hasAttribute("data-vf-contrast")).toBe(false);
    expect(root.hasAttribute("data-vf-motion")).toBe(false);
  });

  it("scope='root' does NOT write to document.documentElement", () => {
    render(
      <VoidframeProvider themeName="midnight" scope="root">
        <div />
      </VoidframeProvider>
    );
    expect(document.documentElement.hasAttribute("data-vf-theme")).toBe(false);
  });

  it("scope='root' still sets attrs on the provider's wrapper div", () => {
    const { container } = render(
      <VoidframeProvider themeName="midnight" scope="root">
        <div />
      </VoidframeProvider>
    );
    const wrapper = container.querySelector(".vf-root");
    expect(wrapper).toHaveAttribute("data-vf-theme", "midnight");
  });

  it("cleans up <html> attributes on unmount", () => {
    const { unmount } = render(
      <VoidframeProvider themeName="light" density="compact">
        <div />
      </VoidframeProvider>
    );
    expect(document.documentElement.getAttribute("data-vf-theme")).toBe("light");
    unmount();
    expect(document.documentElement.hasAttribute("data-vf-theme")).toBe(false);
    expect(document.documentElement.hasAttribute("data-vf-density")).toBe(false);
  });

  it("restores pre-existing attributes on unmount (nested/late-remounting safe)", () => {
    document.documentElement.setAttribute("data-vf-theme", "preexisting");
    const { unmount } = render(
      <VoidframeProvider themeName="light">
        <div />
      </VoidframeProvider>
    );
    expect(document.documentElement.getAttribute("data-vf-theme")).toBe("light");
    unmount();
    expect(document.documentElement.getAttribute("data-vf-theme")).toBe(
      "preexisting"
    );
  });

  it("updates <html> when themeName prop changes", () => {
    const { rerender } = render(
      <VoidframeProvider themeName="dark">
        <div />
      </VoidframeProvider>
    );
    expect(document.documentElement.getAttribute("data-vf-theme")).toBe("dark");
    rerender(
      <VoidframeProvider themeName="light">
        <div />
      </VoidframeProvider>
    );
    expect(document.documentElement.getAttribute("data-vf-theme")).toBe("light");
  });
});
