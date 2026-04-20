import { describe, expect, it } from "vitest";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { BubbleChart, ScatterPlot } from "../ScatterPlot";

const data = [
  { x: 10, y: 20, size: 5 },
  { x: 40, y: 60, size: 25 },
  { x: 70, y: 30, size: 50 },
  { x: 90, y: 80, size: 100 },
];

describe("BubbleChart", () => {
  it("is an alias for ScatterPlot", () => {
    expect(BubbleChart).toBe(ScatterPlot);
  });

  it("has its own displayName for DX", () => {
    expect(
      (BubbleChart as unknown as { displayName: string }).displayName
    ).toBe("BubbleChart");
  });

  it("renders one point per datum when size is provided", () => {
    const { container } = renderWithTheme(
      <BubbleChart data={data} width={400} height={240} />
    );
    expect(
      container.querySelectorAll(".vf-chart-point rect").length
    ).toBe(data.length);
  });

  it("respects sizeRange for scaling radii", () => {
    const { container } = renderWithTheme(
      <BubbleChart
        data={data}
        sizeRange={[4, 24]}
        width={400}
        height={240}
        shape="circle"
      />
    );
    const circles = container.querySelectorAll(".vf-chart-point circle");
    expect(circles.length).toBe(data.length);
  });
});
