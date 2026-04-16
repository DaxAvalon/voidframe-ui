import { describe, expect, it } from "vitest";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { PrintLayout, PrintButton } from "../Print";

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
});
