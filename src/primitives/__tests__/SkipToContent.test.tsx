import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SkipToContent } from "../SkipToContent";
import { expectNoA11yViolations } from "../../../test/axe";

describe("SkipToContent", () => {
  it("renders an anchor pointing to the target", () => {
    render(<SkipToContent href="#main" />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "#main");
  });

  it("uses a default label when no children given", () => {
    render(<SkipToContent href="#main" />);
    expect(screen.getByText("Skip to main content")).toBeInTheDocument();
  });

  it("accepts custom label children", () => {
    render(<SkipToContent href="#nav">Jump to nav</SkipToContent>);
    expect(screen.getByText("Jump to nav")).toBeInTheDocument();
  });

  it("has the .vf-skip-to-content class", () => {
    render(<SkipToContent href="#x" />);
    expect(screen.getByRole("link")).toHaveClass("vf-skip-to-content");
  });

  it("has no a11y violations", async () => {
    const { container } = render(<SkipToContent href="#main" />);
    await expectNoA11yViolations(container);
  });
});
