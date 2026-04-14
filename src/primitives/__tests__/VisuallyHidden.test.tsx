import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { VisuallyHidden, visuallyHiddenStyle } from "../VisuallyHidden";

describe("VisuallyHidden", () => {
  it("renders the label text", () => {
    render(<VisuallyHidden>Close dialog</VisuallyHidden>);
    expect(screen.getByText("Close dialog")).toBeInTheDocument();
  });

  it("applies screen-reader-only styles", () => {
    render(<VisuallyHidden data-testid="v">x</VisuallyHidden>);
    const el = screen.getByTestId("v");
    expect(el.style.position).toBe(visuallyHiddenStyle.position);
    expect(el.style.width).toBe("1px");
    expect(el.style.overflow).toBe("hidden");
  });
});
