import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { Divider, Label, Spacer, Text } from "../Text";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { expectNoA11yViolations } from "../../../test/axe";

describe("Text", () => {
  it("renders children", () => {
    renderWithTheme(<Text>hello</Text>);
    expect(screen.getByText("hello")).toBeInTheDocument();
  });

  it("renders as the tag given to `as`", () => {
    renderWithTheme(<Text as="h1">title</Text>);
    const el = screen.getByText("title");
    expect(el.tagName).toBe("H1");
  });

  it("applies uppercase modifier class when `upper` is set", () => {
    renderWithTheme(<Text upper>hi</Text>);
    expect(screen.getByText("hi")).toHaveClass("vf-text--upper");
  });

  it("has no a11y violations", async () => {
    const { container } = renderWithTheme(
      <Text as="p">Accessible text block</Text>
    );
    await expectNoA11yViolations(container);
  });
});

describe("Label", () => {
  it("renders with the vf-label class", () => {
    renderWithTheme(<Label>metadata</Label>);
    expect(screen.getByText("metadata")).toHaveClass("vf-label");
  });
});

describe("Divider", () => {
  it("renders without children", () => {
    const { root } = renderWithTheme(<Divider />);
    expect(root()).toBeInstanceOf(HTMLElement);
  });

  it("accepts a custom spacing", () => {
    const { root } = renderWithTheme(<Divider spacing={20} />);
    expect(root().style.margin).toContain("20px");
  });
});

describe("Spacer", () => {
  it("renders with default height when no size given", () => {
    const { root } = renderWithTheme(<Spacer />);
    expect(root()).toBeInstanceOf(HTMLElement);
  });

  it("respects explicit size", () => {
    const { root } = renderWithTheme(<Spacer size={42} />);
    expect(root().style.height).toBe("42px");
  });
});
