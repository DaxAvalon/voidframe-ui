import { describe, expect, it } from "vitest";
import { renderWithTheme } from "../../../../test/renderWithTheme";
import { Line } from "../Line";

const data = [
  { x: 0, y: 10 },
  { x: 50, y: 20 },
  { x: 100, y: 5 },
];

function renderSvg(ui: React.ReactElement) {
  return renderWithTheme(
    <svg>
      <g>{ui}</g>
    </svg>
  );
}

describe("Line", () => {
  it("renders a path with the documented class", () => {
    const { container } = renderSvg(<Line data={data} stroke="steelblue" />);
    const path = container.querySelector(".vf-chart-line");
    expect(path).toBeTruthy();
    expect(path!.getAttribute("d")).toMatch(/^M/);
  });

  it("uses fill=none and strokeWidth default 1.5", () => {
    const { container } = renderSvg(<Line data={data} stroke="red" />);
    const path = container.querySelector(".vf-chart-line")!;
    expect(path.getAttribute("fill")).toBe("none");
    expect(path.getAttribute("stroke-width")).toBe("1.5");
  });

  it("applies dashed stroke pattern when dashed=true", () => {
    const { container } = renderSvg(
      <Line data={data} stroke="red" dashed />
    );
    const path = container.querySelector(".vf-chart-line")!;
    expect(path.getAttribute("stroke-dasharray")).toBe("4 3");
  });

  it("skips undefined points via the defined flag", () => {
    const mixed = [
      { x: 0, y: 10 },
      { x: 50, y: 20, defined: false },
      { x: 100, y: 5 },
    ];
    const { container } = renderSvg(<Line data={mixed} stroke="red" />);
    expect(container.querySelector(".vf-chart-line")).toBeTruthy();
  });

  it("renders null when data is empty", () => {
    const { container } = renderSvg(<Line data={[]} stroke="red" />);
    expect(container.querySelector(".vf-chart-line")).toBeNull();
  });
});
