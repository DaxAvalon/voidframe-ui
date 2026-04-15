import { describe, expect, it } from "vitest";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { ChordDiagram } from "../ChordDiagram";

const groups = [
  { key: "us", label: "US" },
  { key: "eu", label: "EU" },
  { key: "as", label: "Asia" },
];
const matrix = [
  [0, 6, 3],
  [6, 0, 4],
  [3, 4, 0],
];

describe("ChordDiagram", () => {
  it("renders one outer arc per group", () => {
    const { container } = renderWithTheme(
      <ChordDiagram groups={groups} matrix={matrix} size={320} />
    );
    expect(
      container.querySelectorAll(".vf-chart-chord__arc").length
    ).toBe(groups.length);
  });

  it("renders a chord path per non-zero cross-group flow", () => {
    const { container } = renderWithTheme(
      <ChordDiagram groups={groups} matrix={matrix} size={320} />
    );
    // 6 non-zero off-diagonal entries.
    expect(
      container.querySelectorAll(".vf-chart-chord__chord").length
    ).toBe(6);
  });

  it("renders one label per group", () => {
    const { container } = renderWithTheme(
      <ChordDiagram groups={groups} matrix={matrix} size={320} />
    );
    expect(
      container.querySelectorAll(".vf-chart-chord__label").length
    ).toBe(groups.length);
  });
});
