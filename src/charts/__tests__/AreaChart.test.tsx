import { describe, expect, it } from "vitest";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { AreaChart } from "../AreaChart";

const data = [
  { x: 0, a: 4, b: 2 },
  { x: 1, a: 6, b: 3 },
  { x: 2, a: 8, b: 5 },
  { x: 3, a: 7, b: 4 },
];

describe("AreaChart", () => {
  it("renders one area path per series in single mode", () => {
    const { container } = renderWithTheme(
      <AreaChart
        data={data}
        series={[{ key: "a" }, { key: "b" }]}
        width={400}
        height={240}
      />
    );
    expect(container.querySelectorAll("path.vf-chart-area")).toHaveLength(2);
  });

  it("stacks areas when mode='stacked'", () => {
    const { container } = renderWithTheme(
      <AreaChart
        data={data}
        series={[{ key: "a" }, { key: "b" }]}
        mode="stacked"
        width={400}
        height={240}
      />
    );
    expect(container.querySelectorAll("path.vf-chart-area")).toHaveLength(2);
  });

  it("renders 100%-stacked areas", () => {
    const { container } = renderWithTheme(
      <AreaChart
        data={data}
        series={[{ key: "a" }, { key: "b" }]}
        mode="100%-stacked"
        width={400}
        height={240}
      />
    );
    expect(container.querySelectorAll("path.vf-chart-area")).toHaveLength(2);
  });

  it("renders legend for multi-series", () => {
    const { container } = renderWithTheme(
      <AreaChart
        data={data}
        series={[{ key: "a" }, { key: "b" }]}
        width={400}
        height={240}
      />
    );
    expect(
      container.querySelector(".vf-chart-area-chart__legend")
    ).toBeTruthy();
  });

  it("hides legend for single series", () => {
    const { container } = renderWithTheme(
      <AreaChart
        data={data}
        series={[{ key: "a" }]}
        width={400}
        height={240}
      />
    );
    expect(
      container.querySelector(".vf-chart-area-chart__legend")
    ).toBeFalsy();
  });

  it("renders stroke line on top of area by default", () => {
    const { container } = renderWithTheme(
      <AreaChart
        data={data}
        series={[{ key: "a" }]}
        width={400}
        height={240}
      />
    );
    expect(container.querySelector("path.vf-chart-line")).toBeTruthy();
  });

  it("suppresses stroke line when showStroke=false", () => {
    const { container } = renderWithTheme(
      <AreaChart
        data={data}
        series={[{ key: "a" }]}
        showStroke={false}
        width={400}
        height={240}
      />
    );
    expect(container.querySelector("path.vf-chart-line")).toBeFalsy();
  });

  it("renders with category xKind", () => {
    const catData = [
      { x: "Jan", a: 10, b: 5 },
      { x: "Feb", a: 15, b: 8 },
    ];
    const { container } = renderWithTheme(
      <AreaChart
        data={catData}
        series={[{ key: "a" }, { key: "b" }]}
        xKind="category"
        width={400}
        height={240}
      />
    );
    expect(container.querySelectorAll("path.vf-chart-area")).toHaveLength(2);
  });

  it("renders with time xKind", () => {
    const timeData = [
      { x: new Date(2026, 0, 1), a: 10 },
      { x: new Date(2026, 1, 1), a: 20 },
    ];
    const { container } = renderWithTheme(
      <AreaChart
        data={timeData}
        series={[{ key: "a" }]}
        xKind="time"
        width={400}
        height={240}
      />
    );
    expect(container.querySelectorAll("path.vf-chart-area")).toHaveLength(1);
  });

  it("renders with log scaleKind", () => {
    const logData = [
      { x: 1, a: 10 },
      { x: 2, a: 100 },
    ];
    const { container } = renderWithTheme(
      <AreaChart
        data={logData}
        series={[{ key: "a" }]}
        scaleKind="log"
        width={400}
        height={240}
      />
    );
    expect(container.querySelectorAll("path.vf-chart-area")).toHaveLength(1);
  });

  it("renders with sqrt scaleKind", () => {
    const { container } = renderWithTheme(
      <AreaChart
        data={data}
        series={[{ key: "a" }]}
        scaleKind="sqrt"
        width={400}
        height={240}
      />
    );
    expect(container.querySelectorAll("path.vf-chart-area")).toHaveLength(1);
  });

  it("hides gridlines when showGrid=false", () => {
    const { container } = renderWithTheme(
      <AreaChart
        data={data}
        series={[{ key: "a" }]}
        showGrid={false}
        width={400}
        height={240}
      />
    );
    expect(container.querySelector(".vf-chart-gridlines")).toBeFalsy();
  });

  it("supports hiddenKeys to hide series", () => {
    const { container } = renderWithTheme(
      <AreaChart
        data={data}
        series={[{ key: "a" }, { key: "b" }]}
        hiddenKeys={["b"]}
        width={400}
        height={240}
      />
    );
    expect(container.querySelectorAll("path.vf-chart-area")).toHaveLength(1);
  });

  it("renders stacked areas with gradient fills (stroke on top)", () => {
    const { container } = renderWithTheme(
      <AreaChart
        data={data}
        series={[{ key: "a" }, { key: "b" }]}
        mode="stacked"
        showStroke={true}
        width={400}
        height={240}
      />
    );
    // Should have 2 area paths + 2 line paths (stroke overlay)
    expect(container.querySelectorAll("path.vf-chart-area")).toHaveLength(2);
    expect(container.querySelectorAll("path.vf-chart-line")).toHaveLength(2);
  });

  it("stacked mode suppresses stroke line when showStroke=false", () => {
    const { container } = renderWithTheme(
      <AreaChart
        data={data}
        series={[{ key: "a" }, { key: "b" }]}
        mode="stacked"
        showStroke={false}
        width={400}
        height={240}
      />
    );
    expect(container.querySelectorAll("path.vf-chart-area")).toHaveLength(2);
    expect(container.querySelector("path.vf-chart-line")).toBeFalsy();
  });

  it("renders custom xFormat for tooltip", () => {
    const { container } = renderWithTheme(
      <AreaChart
        data={data}
        series={[{ key: "a" }]}
        xFormat={(v) => `X:${v}`}
        width={400}
        height={240}
      />
    );
    expect(container.querySelector(".vf-chart-area-chart")).toBeTruthy();
  });

  it("renders title and description", () => {
    const { getByText } = renderWithTheme(
      <AreaChart
        data={data}
        series={[{ key: "a" }]}
        title="Revenue"
        description="Monthly"
        width={400}
        height={240}
      />
    );
    expect(getByText("Revenue")).toBeTruthy();
    expect(getByText("Monthly")).toBeTruthy();
  });

  it("handles equal-value data (lo === hi edge case)", () => {
    const flatData = [
      { x: 0, a: 5 },
      { x: 1, a: 5 },
    ];
    const { container } = renderWithTheme(
      <AreaChart
        data={flatData}
        series={[{ key: "a" }]}
        width={400}
        height={240}
      />
    );
    expect(container.querySelectorAll("path.vf-chart-area")).toHaveLength(1);
  });
});
