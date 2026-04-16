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

  it("renders title and description", () => {
    const { getByText } = renderWithTheme(
      <ChordDiagram
        groups={groups}
        matrix={matrix}
        size={320}
        title="Trade"
        description="Flows"
      />
    );
    expect(getByText("Trade")).toBeTruthy();
    expect(getByText("Flows")).toBeTruthy();
  });

  it("uses the default aria-label", () => {
    const { container } = renderWithTheme(
      <ChordDiagram groups={groups} matrix={matrix} size={320} />
    );
    const svg = container.querySelector(".vf-chart-chord__svg");
    expect(svg!.getAttribute("aria-label")).toBe("Chord diagram");
  });

  it("uses custom accessibleLabel", () => {
    const { container } = renderWithTheme(
      <ChordDiagram
        groups={groups}
        matrix={matrix}
        size={320}
        accessibleLabel="trade flows"
      />
    );
    const svg = container.querySelector(".vf-chart-chord__svg");
    expect(svg!.getAttribute("aria-label")).toBe("trade flows");
  });

  it("uses group label when provided, key otherwise", () => {
    const noLabelGroups = [
      { key: "us" },
      { key: "eu", label: "Europe" },
    ];
    const smallMatrix = [
      [0, 5],
      [5, 0],
    ];
    const { container } = renderWithTheme(
      <ChordDiagram groups={noLabelGroups} matrix={smallMatrix} size={320} />
    );
    const labels = container.querySelectorAll(".vf-chart-chord__label");
    expect(labels[0]!.textContent).toBe("us");
    expect(labels[1]!.textContent).toBe("Europe");
  });

  it("applies custom className", () => {
    const { container } = renderWithTheme(
      <ChordDiagram
        groups={groups}
        matrix={matrix}
        size={320}
        className="my-chord"
      />
    );
    expect(
      container.querySelector(".vf-chart-chord")!.classList.contains("my-chord")
    ).toBe(true);
  });

  it("handles single-group matrix (no chords)", () => {
    const singleGroup = [{ key: "a", label: "Only" }];
    const singleMatrix = [[0]];
    const { container } = renderWithTheme(
      <ChordDiagram groups={singleGroup} matrix={singleMatrix} size={320} />
    );
    expect(container.querySelectorAll(".vf-chart-chord__arc").length).toBe(1);
    expect(container.querySelectorAll(".vf-chart-chord__chord").length).toBe(0);
  });

  it("handles all-zero matrix (no chords rendered)", () => {
    const zeroMatrix = [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ];
    const { container } = renderWithTheme(
      <ChordDiagram groups={groups} matrix={zeroMatrix} size={320} />
    );
    expect(container.querySelectorAll(".vf-chart-chord__arc").length).toBe(3);
    expect(container.querySelectorAll(".vf-chart-chord__chord").length).toBe(0);
  });

  it("asymmetric matrix renders chords correctly", () => {
    const asymMatrix = [
      [0, 10, 0],
      [0, 0, 5],
      [0, 0, 0],
    ];
    const { container } = renderWithTheme(
      <ChordDiagram groups={groups} matrix={asymMatrix} size={320} />
    );
    // 2 non-zero off-diagonal entries
    expect(container.querySelectorAll(".vf-chart-chord__chord").length).toBe(2);
  });

  it("uses custom padAngle", () => {
    const { container } = renderWithTheme(
      <ChordDiagram groups={groups} matrix={matrix} size={320} padAngle={0.1} />
    );
    expect(container.querySelectorAll(".vf-chart-chord__arc").length).toBe(3);
  });

  it("uses custom ringThickness", () => {
    const { container } = renderWithTheme(
      <ChordDiagram groups={groups} matrix={matrix} size={320} ringThickness={20} />
    );
    expect(container.querySelectorAll(".vf-chart-chord__arc").length).toBe(3);
  });

  it("uses per-group color", () => {
    const coloredGroups = [
      { key: "us", label: "US", color: "#ff0000" },
      { key: "eu", label: "EU", color: "#00ff00" },
    ];
    const smallMatrix = [
      [0, 5],
      [5, 0],
    ];
    const { container } = renderWithTheme(
      <ChordDiagram groups={coloredGroups} matrix={smallMatrix} size={320} />
    );
    const arcs = container.querySelectorAll(".vf-chart-chord__arc");
    expect(arcs[0]!.getAttribute("fill")).toBe("#ff0000");
    expect(arcs[1]!.getAttribute("fill")).toBe("#00ff00");
  });
});
