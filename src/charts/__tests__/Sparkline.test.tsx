import { describe, expect, it } from "vitest";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { Sparkline } from "../Sparkline";

describe("Sparkline", () => {
  it("renders an SVG line path for non-empty data", () => {
    const { container } = renderWithTheme(
      <Sparkline data={[1, 2, 3, 4, 5]} width={100} height={30} />
    );
    expect(container.querySelector("path.vf-chart-line")).toBeTruthy();
  });

  it("renders an area when showArea is true", () => {
    const { container } = renderWithTheme(
      <Sparkline data={[1, 2, 3]} showArea width={80} height={24} />
    );
    expect(container.querySelector("path.vf-chart-area")).toBeTruthy();
  });

  it("renders points when showPoints is true", () => {
    const { container } = renderWithTheme(
      <Sparkline data={[1, 2, 3]} showPoints width={80} height={24} />
    );
    expect(container.querySelector(".vf-chart-point")).toBeTruthy();
  });

  it("renders nothing interactive for empty data", () => {
    const { container } = renderWithTheme(<Sparkline data={[]} />);
    expect(container.querySelector("svg")).toBeFalsy();
  });
});
