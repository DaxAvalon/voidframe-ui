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
});
