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

  it("renders a legend for multi-series", () => {
    const seriesData = [
      { x: 1, y: 1, series: "a" },
      { x: 2, y: 2, series: "b" },
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
    expect(container.querySelector(".vf-chart-scatter__legend")).toBeTruthy();
  });

  it("hides legend for single series (no series prop)", () => {
    const { container } = renderWithTheme(
      <ScatterPlot data={data} width={400} height={240} />
    );
    expect(container.querySelector(".vf-chart-scatter__legend")).toBeFalsy();
  });

  it("renders title and description", () => {
    const { getByText } = renderWithTheme(
      <ScatterPlot
        data={data}
        width={400}
        height={240}
        title="Points"
        description="XY scatter"
      />
    );
    expect(getByText("Points")).toBeTruthy();
    expect(getByText("XY scatter")).toBeTruthy();
  });

  it("uses the default aria-label", () => {
    const { container } = renderWithTheme(
      <ScatterPlot data={data} width={400} height={240} />
    );
    const svg = container.querySelector("svg[role='img']");
    expect(svg!.getAttribute("aria-label")).toBe("Scatter plot");
  });

  it("renders gridlines by default and hides with showGrid=false", () => {
    const noGrid = renderWithTheme(
      <ScatterPlot data={data} showGrid={false} width={400} height={240} />
    );
    expect(noGrid.container.querySelector(".vf-chart-gridlines")).toBeFalsy();
  });

  it("renders with log scaleKind", () => {
    const logData = [
      { x: 1, y: 10 },
      { x: 10, y: 100 },
    ];
    const { container } = renderWithTheme(
      <ScatterPlot data={logData} scaleKind="log" width={400} height={240} />
    );
    expect(container.querySelectorAll(".vf-chart-point rect").length).toBe(2);
  });

  it("renders with sqrt scaleKind", () => {
    const { container } = renderWithTheme(
      <ScatterPlot data={data} scaleKind="sqrt" width={400} height={240} />
    );
    expect(container.querySelectorAll(".vf-chart-point rect").length).toBe(4);
  });
});
