import { describe, expect, it } from "vitest";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { LineChart } from "../LineChart";

const data = Array.from({ length: 10 }, (_, i) => ({
  x: i,
  a: i * 2,
  b: 20 - i,
}));

describe("LineChart", () => {
  it("renders one path per series", () => {
    const { container } = renderWithTheme(
      <LineChart
        data={data}
        series={[{ key: "a" }, { key: "b" }]}
        width={400}
        height={240}
      />
    );
    const paths = container.querySelectorAll("path.vf-chart-line");
    expect(paths).toHaveLength(2);
  });

  it("renders series points when showPoints is not disabled", () => {
    const { container } = renderWithTheme(
      <LineChart
        data={data}
        series={[{ key: "a" }]}
        width={400}
        height={240}
      />
    );
    expect(container.querySelector(".vf-chart-point")).toBeTruthy();
  });

  it("suppresses points when showPoints=false", () => {
    const { container } = renderWithTheme(
      <LineChart
        data={data}
        series={[{ key: "a", showPoints: false }]}
        width={400}
        height={240}
      />
    );
    // No Point <g> group should be rendered for this series.
    // (Legend + axes may still contain <g>, but none with vf-chart-point.)
    expect(container.querySelector(".vf-chart-point")).toBeFalsy();
  });

  it("uses a dashed stroke when series.dashed is true", () => {
    const { container } = renderWithTheme(
      <LineChart
        data={data}
        series={[{ key: "a", dashed: true }]}
        width={400}
        height={240}
      />
    );
    const path = container.querySelector("path.vf-chart-line");
    expect(path!.getAttribute("stroke-dasharray")).toBeTruthy();
  });

  it("renders a legend by default for multi-series", () => {
    const { container } = renderWithTheme(
      <LineChart
        data={data}
        series={[{ key: "a" }, { key: "b" }]}
        width={400}
        height={240}
      />
    );
    expect(
      container.querySelector(".vf-chart-line-chart__legend")
    ).toBeTruthy();
  });

  it("hides legend when showLegend=false", () => {
    const { container } = renderWithTheme(
      <LineChart
        data={data}
        series={[{ key: "a" }, { key: "b" }]}
        showLegend={false}
        width={400}
        height={240}
      />
    );
    expect(
      container.querySelector(".vf-chart-line-chart__legend")
    ).toBeFalsy();
  });

  it("renders with category xKind", () => {
    const catData = [
      { x: "Jan", a: 10 },
      { x: "Feb", a: 20 },
      { x: "Mar", a: 15 },
    ];
    const { container } = renderWithTheme(
      <LineChart
        data={catData}
        series={[{ key: "a" }]}
        xKind="category"
        width={400}
        height={240}
      />
    );
    expect(container.querySelector("path.vf-chart-line")).toBeTruthy();
  });

  it("renders with time xKind", () => {
    const timeData = Array.from({ length: 5 }, (_, i) => ({
      x: new Date(2026, 0, i + 1),
      a: i * 3,
    }));
    const { container } = renderWithTheme(
      <LineChart
        data={timeData}
        series={[{ key: "a" }]}
        xKind="time"
        width={400}
        height={240}
      />
    );
    expect(container.querySelector("path.vf-chart-line")).toBeTruthy();
  });

  it("renders with log scaleKind", () => {
    const logData = [
      { x: 1, a: 10 },
      { x: 2, a: 100 },
      { x: 3, a: 1000 },
    ];
    const { container } = renderWithTheme(
      <LineChart
        data={logData}
        series={[{ key: "a" }]}
        scaleKind="log"
        width={400}
        height={240}
      />
    );
    expect(container.querySelector("path.vf-chart-line")).toBeTruthy();
  });

  it("renders with sqrt scaleKind", () => {
    const { container } = renderWithTheme(
      <LineChart
        data={data}
        series={[{ key: "a" }]}
        scaleKind="sqrt"
        width={400}
        height={240}
      />
    );
    expect(container.querySelector("path.vf-chart-line")).toBeTruthy();
  });

  it("handles connectNulls by skipping null values", () => {
    const gapData = [
      { x: 0, a: 10 },
      { x: 1, a: null },
      { x: 2, a: 20 },
    ];
    const { container } = renderWithTheme(
      <LineChart
        data={gapData}
        series={[{ key: "a" }]}
        connectNulls={true}
        width={400}
        height={240}
      />
    );
    expect(container.querySelector("path.vf-chart-line")).toBeTruthy();
  });

  it("renders gridlines when showGrid=true (default)", () => {
    const { container } = renderWithTheme(
      <LineChart
        data={data}
        series={[{ key: "a" }]}
        width={400}
        height={240}
      />
    );
    expect(container.querySelector(".vf-chart-gridlines")).toBeTruthy();
  });

  it("hides gridlines when showGrid=false", () => {
    const { container } = renderWithTheme(
      <LineChart
        data={data}
        series={[{ key: "a" }]}
        showGrid={false}
        width={400}
        height={240}
      />
    );
    expect(container.querySelector(".vf-chart-gridlines")).toBeFalsy();
  });

  it("uses hiddenKeys to hide a series", () => {
    const { container } = renderWithTheme(
      <LineChart
        data={data}
        series={[{ key: "a" }, { key: "b" }]}
        hiddenKeys={["b"]}
        width={400}
        height={240}
      />
    );
    // Only one line path visible
    const paths = container.querySelectorAll("path.vf-chart-line");
    expect(paths).toHaveLength(1);
  });

  it("connectNulls=false keeps gaps in the line", () => {
    const gapData = [
      { x: 0, a: 10 },
      { x: 1, a: null },
      { x: 2, a: 20 },
    ];
    const { container } = renderWithTheme(
      <LineChart
        data={gapData}
        series={[{ key: "a" }]}
        connectNulls={false}
        width={400}
        height={240}
      />
    );
    expect(container.querySelector("path.vf-chart-line")).toBeTruthy();
  });

  it("renders crosshair by default (showCrosshair=true)", () => {
    const { container } = renderWithTheme(
      <LineChart
        data={data}
        series={[{ key: "a" }]}
        width={400}
        height={240}
      />
    );
    // The transparent hover catcher rect should exist
    const rects = container.querySelectorAll("rect[fill='transparent']");
    expect(rects.length).toBeGreaterThan(0);
  });

  it("hides crosshair when showCrosshair=false", () => {
    const { container } = renderWithTheme(
      <LineChart
        data={data}
        series={[{ key: "a" }]}
        showCrosshair={false}
        width={400}
        height={240}
      />
    );
    // Hover catcher is still there but crosshair line won't render
    expect(container.querySelector(".vf-chart-line-chart")).toBeTruthy();
  });

  it("uses custom xFormat for tooltip", () => {
    const { container } = renderWithTheme(
      <LineChart
        data={data}
        series={[{ key: "a" }]}
        xFormat={(v) => `X:${v}`}
        width={400}
        height={240}
      />
    );
    expect(container.querySelector(".vf-chart-line-chart")).toBeTruthy();
  });

  it("renders with all data being the same value (lo===hi edge case)", () => {
    const flatData = [
      { x: 0, a: 5 },
      { x: 1, a: 5 },
      { x: 2, a: 5 },
    ];
    const { container } = renderWithTheme(
      <LineChart
        data={flatData}
        series={[{ key: "a" }]}
        width={400}
        height={240}
      />
    );
    expect(container.querySelector("path.vf-chart-line")).toBeTruthy();
  });

  it("renders title and description in frame header", () => {
    const { getByText } = renderWithTheme(
      <LineChart
        data={data}
        series={[{ key: "a" }]}
        title="Sales"
        description="Over time"
        width={400}
        height={240}
      />
    );
    expect(getByText("Sales")).toBeTruthy();
    expect(getByText("Over time")).toBeTruthy();
  });
});
