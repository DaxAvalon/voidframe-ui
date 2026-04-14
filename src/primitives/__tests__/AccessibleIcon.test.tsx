import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AccessibleIcon } from "../AccessibleIcon";

describe("AccessibleIcon", () => {
  it("renders the visible glyph + a hidden label", () => {
    render(
      <AccessibleIcon label="Close">
        <svg data-testid="glyph" />
      </AccessibleIcon>
    );
    expect(screen.getByTestId("glyph")).toBeInTheDocument();
    expect(screen.getByText("Close")).toBeInTheDocument();
  });

  it("marks the glyph aria-hidden", () => {
    render(
      <AccessibleIcon label="X">
        <svg data-testid="glyph" />
      </AccessibleIcon>
    );
    expect(screen.getByTestId("glyph")).toHaveAttribute("aria-hidden", "true");
  });
});
