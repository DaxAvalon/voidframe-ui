import { describe, expect, it } from "vitest";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { Heatmap } from "../Heatmap";

describe("Heatmap", () => {
  it("renders one cell per (row, column) pair", () => {
    const { container } = renderWithTheme(
      <Heatmap
        rows={["r1", "r2"]}
        columns={["c1", "c2", "c3"]}
        data={[
          { x: "c1", y: "r1", value: 1 },
          { x: "c2", y: "r2", value: 4 },
        ]}
      />
    );
    expect(
      container.querySelectorAll(".vf-chart-heatmap__cell")
    ).toHaveLength(6);
  });

  it("renders row + column labels", () => {
    const { container } = renderWithTheme(
      <Heatmap
        rows={["r"]}
        columns={["c"]}
        data={[{ x: "c", y: "r", value: 1 }]}
      />
    );
    expect(container.querySelector(".vf-chart-heatmap__row-label")).toBeTruthy();
    expect(container.querySelector(".vf-chart-heatmap__col-label")).toBeTruthy();
  });
});
