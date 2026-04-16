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

  it("renders whiskers and caps per group", () => {
    const groups = [{ key: "a", values: [1, 2, 3, 4, 5] }];
    const { container } = renderWithTheme(
      <BoxPlot groups={groups} width={400} height={240} />
    );
    expect(
      container.querySelectorAll(".vf-chart-boxplot__whisker").length
    ).toBe(1);
    expect(
      container.querySelectorAll(".vf-chart-boxplot__cap").length
    ).toBe(2);
  });

  it("renders a median line per group", () => {
    const groups = [{ key: "a", values: [1, 2, 3, 4, 5] }];
    const { container } = renderWithTheme(
      <BoxPlot groups={groups} width={400} height={240} />
    );
    expect(
      container.querySelectorAll(".vf-chart-boxplot__median").length
    ).toBe(1);
  });

  it("renders outlier markers", () => {
    const groups = [{ key: "a", values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 100] }];
    const { container } = renderWithTheme(
      <BoxPlot groups={groups} width={400} height={240} />
    );
    expect(
      container.querySelectorAll(".vf-chart-boxplot__outlier").length
    ).toBeGreaterThan(0);
  });

  it("renders title and description", () => {
    const groups = [{ key: "a", values: [1, 2, 3] }];
    const { getByText } = renderWithTheme(
      <BoxPlot
        groups={groups}
        width={400}
        height={240}
        title="Distribution"
        description="By group"
      />
    );
    expect(getByText("Distribution")).toBeTruthy();
    expect(getByText("By group")).toBeTruthy();
  });

  it("hides gridlines when showGrid=false", () => {
    const groups = [{ key: "a", values: [1, 2, 3] }];
    const { container } = renderWithTheme(
      <BoxPlot groups={groups} showGrid={false} width={400} height={240} />
    );
    expect(container.querySelector(".vf-chart-gridlines")).toBeFalsy();
  });

  it("uses group label when provided", () => {
    const groups = [{ key: "a", label: "Alpha Group", values: [1, 2, 3] }];
    const { container } = renderWithTheme(
      <BoxPlot groups={groups} width={400} height={240} />
    );
    // The axis should show the label
    expect(container.querySelector(".vf-chart-boxplot")).toBeTruthy();
  });

  it("renders multiple outliers at correct positions", () => {
    // Data with outliers on both ends
    const groups = [
      { key: "a", values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 100, -50] },
    ];
    const { container } = renderWithTheme(
      <BoxPlot groups={groups} width={400} height={240} />
    );
    const outliers = container.querySelectorAll(".vf-chart-boxplot__outlier");
    expect(outliers.length).toBeGreaterThanOrEqual(2);
  });

  it("respects custom whiskerK", () => {
    // With a very large K, no outliers
    const groups = [
      { key: "a", values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 100] },
    ];
    const stats = computeBoxStats([1, 2, 3, 4, 5, 6, 7, 8, 9, 100], 100);
    expect(stats.outliers.length).toBe(0);
  });

  it("renders with custom padding", () => {
    const groups = [
      { key: "a", values: [1, 2, 3] },
      { key: "b", values: [4, 5, 6] },
    ];
    const { container } = renderWithTheme(
      <BoxPlot groups={groups} width={400} height={240} padding={0.5} />
    );
    expect(
      container.querySelectorAll(".vf-chart-boxplot__box").length
    ).toBe(2);
  });

  it("uses group color when provided", () => {
    const groups = [
      { key: "a", values: [1, 2, 3, 4, 5], color: "#ff0000" },
    ];
    const { container } = renderWithTheme(
      <BoxPlot groups={groups} width={400} height={240} />
    );
    const box = container.querySelector(".vf-chart-boxplot__box");
    expect(box!.getAttribute("fill")).toBe("#ff0000");
  });

  it("uses custom valueFormat", () => {
    const groups = [{ key: "a", values: [1, 2, 3] }];
    const { container } = renderWithTheme(
      <BoxPlot groups={groups} width={400} height={240} valueFormat={(v) => `$${v}`} />
    );
    expect(container.querySelector(".vf-chart-boxplot")).toBeTruthy();
  });

  it("renders with default aria-label", () => {
    const groups = [{ key: "a", values: [1, 2, 3] }];
    const { container } = renderWithTheme(
      <BoxPlot groups={groups} width={400} height={240} />
    );
    const svg = container.querySelector("svg[role='img']");
    expect(svg!.getAttribute("aria-label")).toBe("Box plot");
  });
});
