import { describe, expect, it } from "vitest";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { RadarChart } from "../RadarChart";

describe("RadarChart", () => {
  it("renders one polygon per series plus ring polygons", () => {
    const { container } = renderWithTheme(
      <RadarChart
        axes={["A", "B", "C", "D"]}
        series={[
          { key: "p", label: "P", values: [1, 2, 3, 4] },
          { key: "q", label: "Q", values: [4, 3, 2, 1] },
        ]}
        rings={3}
        size={240}
      />
    );
    const rings = container.querySelectorAll(".vf-chart-radar__ring");
    expect(rings).toHaveLength(3);
    const seriesGroups = container.querySelectorAll(".vf-chart-radar__series");
    expect(seriesGroups).toHaveLength(2);
  });

  it("shows a label per axis", () => {
    const { container } = renderWithTheme(
      <RadarChart
        axes={["A", "B", "C"]}
        series={[{ key: "p", values: [1, 2, 3] }]}
        size={200}
      />
    );
    const labels = container.querySelectorAll(".vf-chart-radar__label");
    expect(labels).toHaveLength(3);
  });

  it("renders title and description", () => {
    const { getByText } = renderWithTheme(
      <RadarChart
        axes={["A", "B", "C"]}
        series={[{ key: "p", values: [1, 2, 3] }]}
        size={200}
        title="Skills"
        description="Assessment"
      />
    );
    expect(getByText("Skills")).toBeTruthy();
    expect(getByText("Assessment")).toBeTruthy();
  });

  it("uses the default aria-label", () => {
    const { container } = renderWithTheme(
      <RadarChart
        axes={["A", "B", "C"]}
        series={[{ key: "p", values: [1, 2, 3] }]}
        size={200}
      />
    );
    const svg = container.querySelector("svg[role='img']");
    expect(svg!.getAttribute("aria-label")).toBe("Radar chart");
  });

  it("renders legend by default for multi-series", () => {
    const { container } = renderWithTheme(
      <RadarChart
        axes={["A", "B", "C"]}
        series={[
          { key: "p", values: [1, 2, 3] },
          { key: "q", values: [3, 2, 1] },
        ]}
        size={200}
      />
    );
    expect(container.querySelector(".vf-chart-radar__legend")).toBeTruthy();
  });

  it("applies custom className", () => {
    const { container } = renderWithTheme(
      <RadarChart
        axes={["A", "B"]}
        series={[{ key: "p", values: [1, 2] }]}
        size={200}
        className="my-radar"
      />
    );
    expect(
      container.querySelector(".vf-chart-radar")!.classList.contains("my-radar")
    ).toBe(true);
  });

  it("showLegend=true renders a legend for single-series charts", () => {
    const { container } = renderWithTheme(
      <RadarChart
        axes={["A", "B", "C"]}
        series={[{ key: "p", label: "P", values: [1, 2, 3] }]}
        size={200}
        showLegend
      />
    );
    expect(container.querySelector(".vf-chart-radar__legend")).toBeTruthy();
  });

  it("renders axis lines per dimension", () => {
    const { container } = renderWithTheme(
      <RadarChart
        axes={["A", "B", "C", "D"]}
        series={[{ key: "p", values: [1, 2, 3, 4] }]}
        size={200}
      />
    );
    expect(
      container.querySelectorAll(".vf-chart-radar__axis").length
    ).toBe(4);
  });
});
