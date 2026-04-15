import { describe, expect, it } from "vitest";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { BoxPlot, computeBoxStats } from "../BoxPlot";

describe("computeBoxStats", () => {
  it("computes quartiles and flags outliers beyond 1.5 * IQR", () => {
    const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 100];
    const stats = computeBoxStats(values);
    expect(stats.median).toBe(5.5);
    expect(stats.outliers).toContain(100);
  });

  it("returns a sensible result for a single value", () => {
    const stats = computeBoxStats([7]);
    expect(stats.median).toBe(7);
    expect(stats.q1).toBe(7);
    expect(stats.q3).toBe(7);
  });
});

describe("BoxPlot", () => {
  it("renders one box per group", () => {
    const groups = [
      { key: "a", values: [1, 2, 3, 4, 5] },
      { key: "b", values: [5, 6, 7, 8, 9] },
    ];
    const { container } = renderWithTheme(
      <BoxPlot groups={groups} width={400} height={240} />
    );
    expect(
      container.querySelectorAll(".vf-chart-boxplot__box").length
    ).toBe(2);
  });
});
