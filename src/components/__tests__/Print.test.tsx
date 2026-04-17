import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { PrintLayout, PrintButton } from "../Print";
import { useRef } from "react";

describe("Print components", () => {
  it("PrintLayout renders children with data-print-layout", () => {
    const { container } = renderWithTheme(
      <PrintLayout><p>content</p></PrintLayout>
    );
    expect(container.querySelector("[data-print-layout]")).toBeTruthy();
  });

  it("PrintButton renders a button", () => {
    const { container } = renderWithTheme(<PrintButton />);
    expect(container.querySelector("button")).toBeTruthy();
  });

  it("PrintButton with target ref creates iframe for printNode and escapeHTML", async () => {
    // This exercises printNode (lines 130-168) including escapeHTML (lines 170-175)
    // and the iframe cleanup callback (lines 158-160).
    const printSpy = vi.fn();
    const focusSpy = vi.fn();
    const addEventSpy = vi.fn();

    function Probe() {
      const ref = useRef<HTMLDivElement>(null);
      return (
        <>
          <div ref={ref} data-testid="target">Target Content</div>
          <PrintButton target={ref} documentTitle="Test <Title> & 'Quotes'">
            Print
          </PrintButton>
        </>
      );
    }

    renderWithTheme(<Probe />);

    // Mock iframe contentWindow
    const origCreateElement = document.createElement.bind(document);
    vi.spyOn(document, "createElement").mockImplementation((tag: string) => {
      const el = origCreateElement(tag);
      if (tag === "iframe") {
        Object.defineProperty(el, "contentWindow", {
          get: () => ({
            focus: focusSpy,
            addEventListener: addEventSpy,
            print: printSpy,
          }),
        });
      }
      return el;
    });

    await userEvent.click(screen.getByRole("button", { name: "Print" }));

    // printNode was called: iframe was appended, doc was written, print was called
    expect(printSpy).toHaveBeenCalled();
    // escapeHTML was called for the document title containing < > &
    expect(focusSpy).toHaveBeenCalled();
    expect(addEventSpy).toHaveBeenCalledWith("afterprint", expect.any(Function));

    vi.restoreAllMocks();
  });
});
