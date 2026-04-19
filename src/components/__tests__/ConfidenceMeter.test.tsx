import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { ConfidenceMeter } from "../ConfidenceMeter";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { expectNoA11yViolations } from "../../../test/axe";

describe("ConfidenceMeter", () => {
  it("renders the formatted value", () => {
    renderWithTheme(<ConfidenceMeter value={0.75} />);
    expect(screen.getByText("75%")).toBeInTheDocument();
  });

  it("renders bar fill with correct width", () => {
    renderWithTheme(<ConfidenceMeter value={0.5} kind="bar" />);
    const fill = document.querySelector(".vf-confidence-meter__bar-fill") as HTMLElement;
    expect(fill).toBeTruthy();
    expect(fill.style.width).toBe("50%");
  });

  it.each(["bar", "gauge", "ring", "text-only"] as const)(
    "applies variant class for %s",
    (variant) => {
      const { root } = renderWithTheme(
        <ConfidenceMeter value={0.5} kind={variant} />
      );
      expect(root().className).toContain(`vf-confidence-meter--${variant}`);
    }
  );

  it("shows Low zone for 0.1", () => {
    renderWithTheme(<ConfidenceMeter value={0.1} />);
    expect(screen.getByText("Low")).toBeInTheDocument();
  });

  it("shows Medium zone for 0.5", () => {
    renderWithTheme(<ConfidenceMeter value={0.5} />);
    expect(screen.getByText("Medium")).toBeInTheDocument();
  });

  it("shows High zone for 0.9", () => {
    renderWithTheme(<ConfidenceMeter value={0.9} />);
    expect(screen.getByText("High")).toBeInTheDocument();
  });

  it("uses custom zones", () => {
    const zones = [{ min: 0, max: 1, label: "Custom", color: "blue" }];
    renderWithTheme(<ConfidenceMeter value={0.5} zones={zones} />);
    expect(screen.getByText("Custom")).toBeInTheDocument();
  });

  it("hides label when showLabel={false}", () => {
    renderWithTheme(<ConfidenceMeter value={0.5} showLabel={false} />);
    expect(screen.queryByText("Medium")).not.toBeInTheDocument();
  });

  it("hides value when showValue={false}", () => {
    renderWithTheme(<ConfidenceMeter value={0.5} showValue={false} />);
    expect(screen.queryByText("50%")).not.toBeInTheDocument();
  });

  it("applies valueFormat", () => {
    renderWithTheme(
      <ConfidenceMeter value={0.753} valueFormat={(v) => `${(v * 100).toFixed(1)}%`} />
    );
    expect(screen.getByText("75.3%")).toBeInTheDocument();
  });

  it("respects max prop", () => {
    renderWithTheme(<ConfidenceMeter value={50} max={100} />);
    expect(screen.getByText("50%")).toBeInTheDocument();
  });

  it("renders label prop", () => {
    renderWithTheme(<ConfidenceMeter value={0.5} label="Confidence" />);
    expect(screen.getByText("Confidence")).toBeInTheDocument();
  });

  it("disables animation when animate={false}", () => {
    renderWithTheme(<ConfidenceMeter value={0.5} kind="bar" animate={false} />);
    const fill = document.querySelector(".vf-confidence-meter__bar-fill") as HTMLElement;
    expect(fill.style.transition).toBe("none");
  });

  it.each(["sm", "md", "lg"] as const)("applies size class %s", (size) => {
    const { root } = renderWithTheme(
      <ConfidenceMeter value={0.5} size={size} />
    );
    expect(root().className).toContain(`vf-confidence-meter--${size}`);
  });

  it("clamps value to 0-max range", () => {
    const { root } = renderWithTheme(<ConfidenceMeter value={-5} />);
    expect(root().getAttribute("aria-valuenow")).toBe("0");
    const { root: root2 } = renderWithTheme(<ConfidenceMeter value={999} />);
    expect(root2().getAttribute("aria-valuenow")).toBe("1");
  });

  it("has no a11y violations with role=meter", async () => {
    const { container } = renderWithTheme(<ConfidenceMeter value={0.5} />);
    const meter = container.querySelector("[role='meter']");
    expect(meter).toBeTruthy();
    expect(meter?.getAttribute("aria-valuenow")).toBe("0.5");
    await expectNoA11yViolations(container);
  });
});
