import { describe, expect, it } from "vitest";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { ParallelCoordinates } from "../ParallelCoordinates";

const axes = [
  { key: "mpg", label: "MPG" },
  { key: "hp", label: "HP" },
  { key: "weight", label: "Weight" },
];
const data = Array.from({ length: 10 }, (_, i) => ({
  id: i,
  values: { mpg: 20 + i, hp: 80 + i * 10, weight: 3000 - i * 20 },
}));

describe("ParallelCoordinates", () => {
  it("renders one polyline per row", () => {
    const { container } = renderWithTheme(
      <ParallelCoordinates
        data={data}
        axes={axes}
        width={500}
        height={260}
      />
    );
    expect(
      container.querySelectorAll(".vf-chart-parallel__row").length
    ).toBe(data.length);
  });

  it("renders one axis line per dimension", () => {
    const { container } = renderWithTheme(
      <ParallelCoordinates
        data={data}
        axes={axes}
        width={500}
        height={260}
      />
    );
    expect(
      container.querySelectorAll(".vf-chart-parallel__axis-line").length
    ).toBe(axes.length);
  });
});
