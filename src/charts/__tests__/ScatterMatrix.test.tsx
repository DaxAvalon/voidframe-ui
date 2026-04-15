import { describe, expect, it } from "vitest";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { ScatterMatrix } from "../ScatterMatrix";

const data = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  values: { a: i, b: i * 2, c: 30 - i },
}));

describe("ScatterMatrix", () => {
  it("renders a dimension × dimension grid", () => {
    const { container } = renderWithTheme(
      <ScatterMatrix
        data={data}
        dimensions={["a", "b", "c"]}
        facetHeight={120}
      />
    );
    const diagonals = container.querySelectorAll(".vf-chart-splom__diagonal");
    const cells = container.querySelectorAll(".vf-chart-splom__cell");
    expect(diagonals).toHaveLength(3);
    expect(cells).toHaveLength(6); // 3*3 - 3 diagonals
  });
});
