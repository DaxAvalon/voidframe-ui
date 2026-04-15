import { describe, expect, it } from "vitest";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { ScatterPlot } from "../ScatterPlot";

const data = [
  { x: 10, y: 20 },
  { x: 40, y: 60 },
  { x: 70, y: 30 },
  { x: 90, y: 80, size: 50 },
];

describe("ScatterPlot", () => {
  it("renders one point per datum", () => {
    const { container } = renderWithTheme(
      <ScatterPlot data={data} width={400} height={240} />
    );
    const rects = container.querySelectorAll(".vf-chart-point rect");
    expect(rects).toHaveLength(data.length);
  });

  it("renders with circle shape when requested", () => {
    const { container } = renderWithTheme(
      <ScatterPlot data={data} shape="circle" width={400} height={240} />
    );
    const circles = container.querySelectorAll(".vf-chart-point circle");
    expect(circles).toHaveLength(data.length);
  });

  it("splits points by series key", () => {
    const seriesData = [
      { x: 1, y: 1, series: "a" },
      { x: 2, y: 2, series: "a" },
      { x: 3, y: 3, series: "b" },
    ];
    const { container } = renderWithTheme(
      <ScatterPlot
        data={seriesData}
        series={[
          { key: "a", label: "A" },
          { key: "b", label: "B" },
        ]}
        width={400}
        height={240}
      />
    );
    const groups = container.querySelectorAll(".vf-chart-point");
    expect(groups).toHaveLength(2);
  });
});
