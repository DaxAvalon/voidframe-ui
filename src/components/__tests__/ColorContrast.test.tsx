import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ColorContrast } from "../ColorContrast";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { expectNoA11yViolations } from "../../../test/axe";

describe("ColorContrast", () => {
  it("renders swatches", () => {
    renderWithTheme(
      <ColorContrast foreground="#000000" background="#ffffff" />
    );
    expect(screen.getByText("Foreground")).toBeInTheDocument();
    expect(screen.getByText("Background")).toBeInTheDocument();
  });

  it("calculates black/white ratio close to 21", () => {
    renderWithTheme(
      <ColorContrast foreground="#000000" background="#ffffff" />
    );
    expect(screen.getByText("21.00:1")).toBeInTheDocument();
  });

  it("detects low contrast pair", () => {
    renderWithTheme(
      <ColorContrast foreground="#777777" background="#888888" />
    );
    const ratioEl = document.querySelector(".vf-color-contrast__ratio");
    expect(ratioEl?.className).toContain("fail");
  });

  it("shows AA Normal pass for high contrast", () => {
    renderWithTheme(
      <ColorContrast foreground="#000000" background="#ffffff" />
    );
    const criteria = screen.getAllByText("AA Normal");
    const parent = criteria[0]!.closest(".vf-color-contrast__criterion");
    expect(parent?.className).toContain("pass");
  });

  it("shows AA Large pass for moderate contrast", () => {
    renderWithTheme(
      <ColorContrast foreground="#000000" background="#ffffff" />
    );
    const criteria = screen.getAllByText("AA Large");
    const parent = criteria[0]!.closest(".vf-color-contrast__criterion");
    expect(parent?.className).toContain("pass");
  });

  it("shows AAA pass/fail correctly", () => {
    renderWithTheme(
      <ColorContrast foreground="#000000" background="#ffffff" />
    );
    const aaaNormal = screen.getAllByText("AAA Normal");
    const parent = aaaNormal[0]!.closest(".vf-color-contrast__criterion");
    expect(parent?.className).toContain("pass");
  });

  it("shows checkmark for passing criteria", () => {
    renderWithTheme(
      <ColorContrast foreground="#000000" background="#ffffff" />
    );
    // All criteria pass for black on white
    const checkmarks = screen.getAllByText("\u2713");
    expect(checkmarks.length).toBeGreaterThan(0);
  });

  it("shows X for failing criteria", () => {
    // Very low contrast pair
    renderWithTheme(
      <ColorContrast foreground="#cccccc" background="#dddddd" />
    );
    const xMarks = screen.getAllByText("\u2717");
    expect(xMarks.length).toBeGreaterThan(0);
  });

  it("renders preview text", () => {
    renderWithTheme(
      <ColorContrast foreground="#000000" background="#ffffff" />
    );
    expect(screen.getByText("Sample Text")).toBeInTheDocument();
  });

  it("shows custom previewText", () => {
    renderWithTheme(
      <ColorContrast
        foreground="#000000"
        background="#ffffff"
        previewText="Hello World"
      />
    );
    expect(screen.getByText("Hello World")).toBeInTheDocument();
  });

  it("hides preview when showPreview={false}", () => {
    renderWithTheme(
      <ColorContrast
        foreground="#000000"
        background="#ffffff"
        showPreview={false}
      />
    );
    expect(screen.queryByText("Sample Text")).not.toBeInTheDocument();
  });

  it("hides details when showDetails={false}", () => {
    renderWithTheme(
      <ColorContrast
        foreground="#000000"
        background="#ffffff"
        showDetails={false}
      />
    );
    expect(screen.queryByText("AA Normal")).not.toBeInTheDocument();
  });

  it("swap button exchanges colors", async () => {
    const onFg = vi.fn();
    const onBg = vi.fn();
    renderWithTheme(
      <ColorContrast
        foreground="#000000"
        background="#ffffff"
        onForegroundChange={onFg}
        onBackgroundChange={onBg}
      />
    );
    await userEvent.click(screen.getByLabelText("Swap colors"));
    expect(onFg).toHaveBeenCalledWith("#ffffff");
    expect(onBg).toHaveBeenCalledWith("#000000");
  });

  it.each(["sm", "md"] as const)("applies size class %s", (size) => {
    const { root } = renderWithTheme(
      <ColorContrast foreground="#000000" background="#ffffff" size={size} />
    );
    expect(root().className).toContain(`vf-color-contrast--${size}`);
  });

  it("has no a11y violations", async () => {
    const { container } = renderWithTheme(
      <ColorContrast foreground="#000000" background="#ffffff" />
    );
    await expectNoA11yViolations(container);
  });
});
