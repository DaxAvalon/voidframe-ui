import { describe, expect, it } from "vitest";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { ComposedChart } from "../ComposedChart";

const data = [
  { x: "Jan", bars: 10, line: 8 },
  { x: "Feb", bars: 15, line: 12 },
  { x: "Mar", bars: 20, line: 18 },
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
});
