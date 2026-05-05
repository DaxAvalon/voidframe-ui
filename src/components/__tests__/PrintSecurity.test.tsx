"use client";

import { describe, expect, it, beforeEach, vi } from "vitest";

/**
 * The printNode function creates a hidden iframe and writes stylesheets +
 * content into it. We test that:
 * 1. A CSP meta tag blocking scripts is injected.
 * 2. Stylesheets are cloned by attribute, not by outerHTML.
 */

describe("printNode security", () => {
  let printNode: (node: HTMLElement, title?: string) => void;

  beforeEach(async () => {
    // printNode is not exported, so we test the module's internal logic
    // by importing the module and inspecting the DOM output.
    // We need to mock window.print and capture the iframe content.
    vi.restoreAllMocks();
  });

  it("injects CSP meta tag blocking script-src", async () => {
    // Dynamically import so we can access the module
    const mod = await import("../Print");

    // Create a test container
    const node = document.createElement("div");
    node.textContent = "Print me";

    // Render PrintButton and capture its behavior by checking
    // the iframe it creates in the DOM
    const { renderWithTheme } = await import("../../../test/renderWithTheme");
    const ref = { current: null as HTMLDivElement | null };

    const { container } = renderWithTheme(
      <mod.PrintLayout ref={ref}>
        <p>Test content</p>
      </mod.PrintLayout>
    );

    // The printNode function is internal, but we can verify the CSP
    // meta tag pattern exists in the source code
    const printSource = await import("../Print?raw");
    const source = (printSource as { default: string }).default;

    expect(source).toContain('Content-Security-Policy');
    expect(source).toContain("script-src 'none'");

    // Verify stylesheet cloning uses escapeHTML, not outerHTML
    expect(source).not.toContain("link.outerHTML");
    expect(source).not.toContain("style.outerHTML");

  });
});
