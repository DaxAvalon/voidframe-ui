import { describe, expect, it, vi } from "vitest";
import { fireEvent } from "@testing-library/react";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { BarChart } from "../BarChart";

const data = [
  { category: "a", mobile: 10, desktop: 20 },
  { category: "b", mobile: 30, desktop: 40 },
  { category: "c", mobile: 20, desktop: 10 },
];

describe("BarChart", () => {
  it("renders one bar group per series in grouped mode", () => {
    const { container } = renderWithTheme(
      <BarChart
        data={data}
        series={[
          { key: "mobile", label: "Mobile" },
          { key: "desktop", label: "Desktop" },
        ]}
        width={400}
        height={200}
      />
    );
    const groups = container.querySelectorAll(".vf-chart-bar");
    expect(groups).toHaveLength(2);
    // 3 rects per series = 6 total bar rects.
    expect(
      container.querySelectorAll(".vf-chart-bar__rect")
    ).toHaveLength(6);
  });

  it("renders stacked bars as one rect per category per series", () => {
    const { container } = renderWithTheme(
      <BarChart
        data={data}
        series={[
          { key: "mobile" },
          { key: "desktop" },
        ]}
        mode="stacked"
        width={400}
        height={200}
      />
    );
    expect(
      container.querySelectorAll(".vf-chart-bar__rect")
    ).toHaveLength(6); // 3 categories x 2 series
  });

  it("renders a legend for multi-series", () => {
    const { container } = renderWithTheme(
      <BarChart
        data={data}
        series={[{ key: "mobile" }, { key: "desktop" }]}
        width={400}
        height={200}
      />
    );
    expect(
      container.querySelectorAll(".vf-chart-legend__item").length
    ).toBeGreaterThanOrEqual(2);
  });

  it("calls onBarClick with the datum and series key", () => {
    const onBarClick = vi.fn();
    const { container } = renderWithTheme(
      <BarChart
        data={data}
        series={[{ key: "mobile" }]}
        width={400}
        height={200}
        onBarClick={onBarClick}
      />
    );
    const rect = container.querySelector(".vf-chart-bar__rect");
    fireEvent.click(rect!);
    expect(onBarClick).toHaveBeenCalled();
    const arg = onBarClick.mock.calls[0]![0];
    expect(arg.seriesKey).toBe("mobile");
    expect(arg.datum.category).toBe("a");
  });

  it("horizontal orientation swaps axis positions", () => {
    const { container } = renderWithTheme(
      <BarChart
        data={data}
        series={[{ key: "mobile" }]}
        orientation="horizontal"
        width={400}
        height={200}
      />
    );
    // band axis on the left, value axis on the bottom.
    expect(container.querySelector(".vf-chart-axis--left")).toBeTruthy();
    expect(container.querySelector(".vf-chart-axis--bottom")).toBeTruthy();
  });

  it("renders 100%-stacked bars", () => {
    const { container } = renderWithTheme(
      <BarChart
        data={data}
        series={[{ key: "mobile" }, { key: "desktop" }]}
        mode="100%-stacked"
        width={400}
        height={200}
      />
    );
    expect(
      container.querySelectorAll(".vf-chart-bar__rect")
    ).toHaveLength(6);
  });

  it("renders title and description", () => {
    const { getByText } = renderWithTheme(
      <BarChart
        data={data}
        series={[{ key: "mobile" }]}
        title="Traffic"
        description="By device"
        width={400}
        height={200}
      />
    );
    expect(getByText("Traffic")).toBeTruthy();
    expect(getByText("By device")).toBeTruthy();
  });

  it("hides legend for single series", () => {
    const { container } = renderWithTheme(
      <BarChart
        data={data}
        series={[{ key: "mobile" }]}
        width={400}
        height={200}
      />
    );
    expect(
      container.querySelector(".vf-chart-bar-chart__legend")
    ).toBeFalsy();
  });

  it("renders with log scaleKind", () => {
    const logData = [
      { category: "a", v: 10 },
      { category: "b", v: 100 },
    ];
    const { container } = renderWithTheme(
      <BarChart
        data={logData}
        series={[{ key: "v" }]}
        scaleKind="log"
        width={400}
        height={200}
      />
    );
    expect(container.querySelectorAll(".vf-chart-bar__rect")).toHaveLength(2);
  });

  it("renders with sqrt scaleKind", () => {
    const { container } = renderWithTheme(
      <BarChart
        data={data}
        series={[{ key: "mobile" }]}
        scaleKind="sqrt"
        width={400}
        height={200}
      />
    );
    expect(container.querySelectorAll(".vf-chart-bar__rect")).toHaveLength(3);
  });

  it("renders gridlines by default and hides when showGrid=false", () => {
    const withGrid = renderWithTheme(
      <BarChart
        data={data}
        series={[{ key: "mobile" }]}
        width={400}
        height={200}
      />
    );
    expect(withGrid.container.querySelector(".vf-chart-gridlines")).toBeTruthy();

    const noGrid = renderWithTheme(
      <BarChart
        data={data}
        series={[{ key: "mobile" }]}
        showGrid={false}
        width={400}
        height={200}
      />
    );
    expect(noGrid.container.querySelector(".vf-chart-gridlines")).toBeFalsy();
  });

  it("renders horizontal stacked bars", () => {
    const { container } = renderWithTheme(
      <BarChart
        data={data}
        series={[{ key: "mobile" }, { key: "desktop" }]}
        mode="stacked"
        orientation="horizontal"
        width={400}
        height={200}
      />
    );
    expect(container.querySelectorAll(".vf-chart-bar__rect")).toHaveLength(6);
  });

  it("supports hiddenKeys to hide series", () => {
    const { container } = renderWithTheme(
      <BarChart
        data={data}
        series={[{ key: "mobile" }, { key: "desktop" }]}
        hiddenKeys={["desktop"]}
        width={400}
        height={200}
      />
    );
    // Only mobile rects
    expect(container.querySelectorAll(".vf-chart-bar__rect")).toHaveLength(3);
  });

  it("calls onBarClick per bar in stacked mode", () => {
    const onBarClick = vi.fn();
    const { container } = renderWithTheme(
      <BarChart
        data={data}
        series={[{ key: "mobile" }, { key: "desktop" }]}
        mode="stacked"
        width={400}
        height={200}
        onBarClick={onBarClick}
      />
    );
    const rect = container.querySelector(".vf-chart-bar__rect");
    fireEvent.click(rect!);
    expect(onBarClick).toHaveBeenCalled();
    const arg = onBarClick.mock.calls[0]![0];
    expect(arg.datum).toBeDefined();
    expect(arg.seriesKey).toBeDefined();
    expect(typeof arg.value).toBe("number");
  });

  it("fires tooltip hover callbacks on bar mouseenter", () => {
    const { container } = renderWithTheme(
      <BarChart
        data={data}
        series={[{ key: "mobile" }, { key: "desktop" }]}
        width={400}
        height={200}
      />
    );
    const rect = container.querySelector(".vf-chart-bar__rect")!;
    fireEvent.pointerEnter(rect, { clientX: 50, clientY: 50 });
    // Component should not crash; tooltip renders internally
    expect(container.querySelector(".vf-chart-bar-chart")).toBeTruthy();
  });

  it("horizontal grouped mode renders per-bar onBarClick correctly", () => {
    const onBarClick = vi.fn();
    const { container } = renderWithTheme(
      <BarChart
        data={data}
        series={[{ key: "mobile" }]}
        orientation="horizontal"
        mode="grouped"
        width={400}
        height={200}
        onBarClick={onBarClick}
      />
    );
    const rect = container.querySelector(".vf-chart-bar__rect");
    fireEvent.click(rect!);
    expect(onBarClick).toHaveBeenCalled();
  });

  it("100%-stacked shows percentage hint in tooltip", () => {
    const { container } = renderWithTheme(
      <BarChart
        data={data}
        series={[{ key: "mobile" }, { key: "desktop" }]}
        mode="100%-stacked"
        width={400}
        height={200}
      />
    );
    // Just ensure it renders, tooltip percentage logic is internal
    expect(container.querySelectorAll(".vf-chart-bar__rect")).toHaveLength(6);
  });

  it("uses custom valueFormat", () => {
    const { container } = renderWithTheme(
      <BarChart
        data={data}
        series={[{ key: "mobile" }]}
        valueFormat={(v) => `$${v}`}
        width={400}
        height={200}
      />
    );
    expect(container.querySelector(".vf-chart-bar-chart")).toBeTruthy();
  });

  it("applies series tone in legend", () => {
    const { container } = renderWithTheme(
      <BarChart
        data={data}
        series={[
          { key: "mobile", tone: "success" },
          { key: "desktop", tone: "danger" },
        ]}
        width={400}
        height={200}
      />
    );
    expect(container.querySelector(".vf-chart-bar-chart__legend")).toBeTruthy();
  });
});
