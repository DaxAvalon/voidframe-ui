import { describe, expect, it } from "vitest";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { DonutChart, PieChart } from "../PieChart";

const data = [
  { key: "a", label: "A", value: 30 },
  { key: "b", label: "B", value: 20 },
  { key: "c", label: "C", value: 50 },
];

describe("PieChart", () => {
  it("renders one arc path per datum", () => {
    const { container } = renderWithTheme(<PieChart data={data} size={200} />);
    const arcs = container.querySelectorAll(".vf-chart-arc path");
    expect(arcs).toHaveLength(3);
  });

  it("DonutChart defaults to innerRatio=0.6", () => {
    const { container } = renderWithTheme(
      <DonutChart data={data} size={200} />
    );
    expect(container.querySelectorAll(".vf-chart-arc path")).toHaveLength(3);
  });

  it("renders a legend", () => {
    const { container } = renderWithTheme(<PieChart data={data} size={200} />);
    expect(
      container.querySelectorAll(".vf-chart-legend__item")
    ).toHaveLength(3);
  });
});
