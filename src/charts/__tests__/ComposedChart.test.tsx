import { describe, expect, it } from "vitest";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { ComposedChart } from "../ComposedChart";

const data = [
  { x: "Jan", bars: 10, line: 8, area: 6, scatter: 4 },
  { x: "Feb", bars: 15, line: 12, area: 9, scatter: 7 },
  { x: "Mar", bars: 20, line: 18, area: 14, scatter: 11 },
  { x: "Apr", bars: 12, line: 14 },
];

describe("ComposedChart", () => {
  it("renders the wrapper with the documented class", () => {
    const { container } = renderWithTheme(
      <ComposedChart
        data={data}
        series={[
          { key: "bars", type: "bar" },
          { key: "line", type: "line" },
        ]}
        width={500}
        height={300}
      />
    );
    expect(container.querySelector(".vf-chart-composed")).toBeTruthy();
  });

  it("renders a bar series and a line series together", () => {
    const { container } = renderWithTheme(
      <ComposedChart
        data={data}
        series={[
          { key: "bars", type: "bar", label: "Bars" },
          { key: "line", type: "line", label: "Line" },
        ]}
        width={500}
        height={300}
      />
    );
    // Bar series should produce one rect per datum.
    expect(container.querySelectorAll(".vf-chart-bar__rect").length).toBe(
      data.length
    );
    // Line series renders a path with the chart-line class.
    expect(container.querySelector("path.vf-chart-line")).toBeTruthy();
  });

  it("renders an area series with a filled area path", () => {
    const { container } = renderWithTheme(
      <ComposedChart
        data={data}
        series={[
          { key: "bars", type: "bar" },
          { key: "line", type: "area" },
        ]}
        width={500}
        height={300}
      />
    );
    // Area series should produce both an area path and a stroke line on top.
    expect(container.querySelector(".vf-chart-area")).toBeTruthy();
    expect(container.querySelector("path.vf-chart-line")).toBeTruthy();
  });

  it("renders a scatter series via Point primitives", () => {
    const { container } = renderWithTheme(
      <ComposedChart
        data={data}
        series={[
          { key: "bars", type: "bar" },
          { key: "line", type: "scatter" },
        ]}
        width={500}
        height={300}
      />
    );
    expect(container.querySelector(".vf-chart-point")).toBeTruthy();
  });

  it("renders a legend by default and hides it when showLegend=false", () => {
    const withLegend = renderWithTheme(
      <ComposedChart
        data={data}
        series={[
          { key: "bars", type: "bar" },
          { key: "line", type: "line" },
        ]}
        width={500}
        height={300}
      />
    );
    expect(
      withLegend.container.querySelector(".vf-chart-composed__legend")
    ).toBeTruthy();

    const noLegend = renderWithTheme(
      <ComposedChart
        data={data}
        series={[
          { key: "bars", type: "bar" },
          { key: "line", type: "line" },
        ]}
        showLegend={false}
        width={500}
        height={300}
      />
    );
    expect(
      noLegend.container.querySelector(".vf-chart-composed__legend")
    ).toBeFalsy();
  });

  it("renders title and description in the frame header", () => {
    const { getByText } = renderWithTheme(
      <ComposedChart
        data={data}
        series={[{ key: "bars", type: "bar" }]}
        title="Quarterly mix"
        description="Bars + line"
        width={500}
        height={300}
      />
    );
    expect(getByText("Quarterly mix")).toBeTruthy();
    expect(getByText("Bars + line")).toBeTruthy();
  });

  it("renders both bottom and left axes", () => {
    const { container } = renderWithTheme(
      <ComposedChart
        data={data}
        series={[
          { key: "bars", type: "bar" },
          { key: "line", type: "line" },
        ]}
        width={500}
        height={300}
      />
    );
    expect(container.querySelector(".vf-chart-axis--bottom")).toBeTruthy();
    expect(container.querySelector(".vf-chart-axis--left")).toBeTruthy();
  });

  it("renders a dashed line series", () => {
    const { container } = renderWithTheme(
      <ComposedChart
        data={data}
        series={[{ key: "line", type: "line", dashed: true }]}
        width={500}
        height={300}
      />
    );
    const path = container.querySelector("path.vf-chart-line");
    expect(path!.getAttribute("stroke-dasharray")).toBeTruthy();
  });

  it("renders gridlines by default and hides when showGrid=false", () => {
    const withGrid = renderWithTheme(
      <ComposedChart
        data={data}
        series={[{ key: "bars", type: "bar" }]}
        width={500}
        height={300}
      />
    );
    expect(withGrid.container.querySelector(".vf-chart-gridlines")).toBeTruthy();

    const noGrid = renderWithTheme(
      <ComposedChart
        data={data}
        series={[{ key: "bars", type: "bar" }]}
        showGrid={false}
        width={500}
        height={300}
      />
    );
    expect(noGrid.container.querySelector(".vf-chart-gridlines")).toBeFalsy();
  });

  it("applies custom className", () => {
    const { container } = renderWithTheme(
      <ComposedChart
        data={data}
        series={[{ key: "bars", type: "bar" }]}
        width={500}
        height={300}
        className="my-composed"
      />
    );
    expect(
      container
        .querySelector(".vf-chart-composed")!
        .classList.contains("my-composed")
    ).toBe(true);
  });

  it("renders bar+line+area+scatter all together", () => {
    const { container } = renderWithTheme(
      <ComposedChart
        data={data}
        series={[
          { key: "bars", type: "bar" },
          { key: "line", type: "line" },
          { key: "area", type: "area" },
          { key: "scatter", type: "scatter" },
        ]}
        width={500}
        height={300}
      />
    );
    expect(container.querySelectorAll(".vf-chart-bar__rect").length).toBeGreaterThan(0);
    expect(container.querySelector("path.vf-chart-line")).toBeTruthy();
    expect(container.querySelector(".vf-chart-area")).toBeTruthy();
    expect(container.querySelector(".vf-chart-point")).toBeTruthy();
  });

  it("renders with linear xKind (no bars)", () => {
    const linearData = [
      { x: 1, val: 10 },
      { x: 2, val: 20 },
      { x: 3, val: 30 },
    ];
    const { container } = renderWithTheme(
      <ComposedChart
        data={linearData}
        series={[{ key: "val", type: "line" }]}
        xKind="linear"
        width={500}
        height={300}
      />
    );
    expect(container.querySelector("path.vf-chart-line")).toBeTruthy();
  });

  it("renders with time xKind", () => {
    const timeData = [
      { x: new Date(2026, 0, 1), val: 10 },
      { x: new Date(2026, 1, 1), val: 20 },
    ];
    const { container } = renderWithTheme(
      <ComposedChart
        data={timeData}
        series={[{ key: "val", type: "line" }]}
        xKind="time"
        width={500}
        height={300}
      />
    );
    expect(container.querySelector("path.vf-chart-line")).toBeTruthy();
  });

  it("uses custom xFormat and valueFormat", () => {
    const { container } = renderWithTheme(
      <ComposedChart
        data={data}
        series={[{ key: "bars", type: "bar" }]}
        xFormat={(v) => `Q:${v}`}
        valueFormat={(v) => `$${v}`}
        width={500}
        height={300}
      />
    );
    expect(container.querySelector(".vf-chart-composed")).toBeTruthy();
  });

  it("handles equal min/max y values", () => {
    const flatData = [
      { x: "A", val: 5 },
      { x: "B", val: 5 },
    ];
    const { container } = renderWithTheme(
      <ComposedChart
        data={flatData}
        series={[{ key: "val", type: "bar" }]}
        width={500}
        height={300}
      />
    );
    expect(container.querySelectorAll(".vf-chart-bar__rect").length).toBe(2);
  });

  it("formats tick labels using formatChartNumber by default", () => {
    const { container } = renderWithTheme(
      <ComposedChart
        data={[
          { x: "A", val: 1500 },
          { x: "B", val: 2500 },
        ]}
        series={[{ key: "val", type: "bar" }]}
        width={500}
        height={300}
      />
    );
    // formatChartNumber renders 1500 with locale separators ("1,500"),
    // whereas String() would produce "1500". Verify the separator appears.
    const labels = Array.from(
      container.querySelectorAll(".vf-chart-axis__label")
    ).map((el) => el.textContent ?? "");
    expect(labels.some((l) => /[0-9],[0-9]/.test(l))).toBe(true);
  });
});
