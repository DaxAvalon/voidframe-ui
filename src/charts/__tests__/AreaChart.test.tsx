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
});
