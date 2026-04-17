// Expanded tests for PrintButton — target ref (iframe printing) and documentTitle

import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef, useRef } from "react";
import { describe, expect, it, vi, afterEach } from "vitest";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { PrintButton } from "../Print";

describe("PrintButton with documentTitle (no target)", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("sets document.title around window.print and restores it", async () => {
    const printSpy = vi.fn();
    vi.stubGlobal("print", printSpy);
    const originalTitle = document.title;

    renderWithTheme(<PrintButton documentTitle="My Report" />);
    await userEvent.click(screen.getByRole("button", { name: "Print" }));

    expect(printSpy).toHaveBeenCalled();
    // Title should be restored after print
    expect(document.title).toBe(originalTitle);
  });

  it("calls window.print without setting title when documentTitle not provided", async () => {
    const printSpy = vi.fn();
    vi.stubGlobal("print", printSpy);
    const originalTitle = document.title;

    renderWithTheme(<PrintButton />);
    await userEvent.click(screen.getByRole("button", { name: "Print" }));

    expect(printSpy).toHaveBeenCalled();
    expect(document.title).toBe(originalTitle);
  });
});

describe("PrintButton with target ref", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    // Clean up any iframes added during tests
    document.querySelectorAll("iframe").forEach((f) => f.remove());
  });

  it("creates iframe when target ref is provided", async () => {
    // Mock iframe contentWindow.print
    const origCreateElement = document.createElement.bind(document);
    vi.spyOn(document, "createElement").mockImplementation((tag: string) => {
      const el = origCreateElement(tag);
      if (tag === "iframe") {
        // Override contentWindow.print after it's appended
        const origAppend = document.body.appendChild.bind(document.body);
        vi.spyOn(document.body, "appendChild").mockImplementationOnce((node) => {
          const result = origAppend(node);
          if ((node as HTMLElement).tagName === "IFRAME") {
            const iframeEl = node as HTMLIFrameElement;
            if (iframeEl.contentWindow) {
              (iframeEl.contentWindow as { print: () => void }).print = vi.fn();
            }
          }
          return result;
        });
      }
      return el;
    });

    function TestWithTarget() {
      const ref = useRef<HTMLDivElement>(null);
      return (
        <>
          <div ref={ref} data-testid="target">
            <p>Content to print</p>
          </div>
          <PrintButton target={ref as React.RefObject<HTMLElement>} />
        </>
      );
    }

    renderWithTheme(<TestWithTarget />);
    const btn = screen.getByRole("button", { name: "Print" });
    await userEvent.click(btn);

    // An iframe should have been appended to document.body
    const iframe = document.querySelector("iframe");
    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveAttribute("aria-hidden", "true");
  });

  it("applies vf-print-button class", () => {
    renderWithTheme(<PrintButton />);
    const btn = screen.getByRole("button", { name: "Print" });
    expect(btn).toHaveClass("vf-print-button");
  });
});
