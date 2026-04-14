import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { Badge, Dots } from "../Badge";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { expectNoA11yViolations } from "../../../test/axe";

describe("Badge", () => {
  it("renders its content", () => {
    renderWithTheme(<Badge>NEW</Badge>);
    expect(screen.getByText("NEW")).toBeInTheDocument();
  });

  it("injects the accent color via --vf-accent", () => {
    renderWithTheme(<Badge color="#4ade80">OK</Badge>);
    const el = screen.getByText("OK");
    expect(el.style.getPropertyValue("--vf-accent")).toBe("#4ade80");
  });

  it("has no a11y violations", async () => {
    const { container } = renderWithTheme(<Badge>LIVE</Badge>);
    await expectNoA11yViolations(container);
  });
});

describe("Dots", () => {
  it("renders `count` dots up to `max`", () => {
    const { root } = renderWithTheme(<Dots count={3} max={8} />);
    expect(root().children).toHaveLength(3);
  });

  it("clamps count to max", () => {
    const { root } = renderWithTheme(<Dots count={20} max={5} />);
    expect(root().children).toHaveLength(5);
  });
});
