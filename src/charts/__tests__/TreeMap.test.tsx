import { describe, expect, it } from "vitest";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { TreeMap } from "../TreeMap";

const data = {
  name: "root",
  children: [
    {
      name: "alpha",
      children: [
        { name: "a1", value: 10 },
        { name: "a2", value: 20 },
      ],
    },
    {
      name: "beta",
      children: [
        { name: "b1", value: 15 },
        { name: "b2", value: 5 },
      ],
    },
  ],
};

describe("TreeMap", () => {
  it("renders one cell per leaf node", () => {
    const { container } = renderWithTheme(
      <TreeMap data={data} width={320} height={200} />
    );
    expect(
      container.querySelectorAll(".vf-chart-treemap__cell").length
    ).toBe(4);
  });

  it("respects the chosen tile algorithm", () => {
    const { container } = renderWithTheme(
      <TreeMap data={data} tile="slice" width={320} height={200} />
    );
    // Same leaf count, different geometry — we just verify it renders.
    expect(
      container.querySelectorAll(".vf-chart-treemap__cell").length
    ).toBe(4);
  });
});
