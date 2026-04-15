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
});
