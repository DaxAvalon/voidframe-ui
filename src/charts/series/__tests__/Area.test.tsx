import { describe, expect, it } from "vitest";
import { renderWithTheme } from "../../../../test/renderWithTheme";
import { Area } from "../Area";

const data = [
  { x: 0, y0: 100, y1: 50 },
  { x: 50, y0: 100, y1: 30 },
  { x: 100, y0: 100, y1: 60 },
];

function renderSvg(ui: React.ReactElement) {
  return renderWithTheme(
    <svg>
      <g>{ui}</g>
    </svg>
  );
}

describe("Area", () => {
  it("renders a path with the documented class", () => {
    const { container } = renderSvg(<Area data={data} fill="steelblue" />);
    const path = container.querySelector(".vf-chart-area");
    expect(path).toBeTruthy();
    expect(path!.getAttribute("d")).toMatch(/^M/);
  });

  it("applies fill, stroke, and default fillOpacity", () => {
    const { container } = renderSvg(
      <Area data={data} fill="#abc" stroke="red" strokeWidth={2} />
    );
    const path = container.querySelector(".vf-chart-area")!;
    expect(path.getAttribute("fill")).toBe("#abc");
    expect(path.getAttribute("stroke")).toBe("red");
    expect(path.getAttribute("fill-opacity")).toBe("0.35");
  });

  it("respects a custom fillOpacity", () => {
    const { container } = renderSvg(
      <Area data={data} fill="steelblue" fillOpacity={0.8} />
    );
    const path = container.querySelector(".vf-chart-area")!;
    expect(path.getAttribute("fill-opacity")).toBe("0.8");
  });

  it("skips undefined points via the defined flag", () => {
    const mixed = [
      { x: 0, y0: 100, y1: 50 },
      { x: 50, y0: 100, y1: 30, defined: false },
      { x: 100, y0: 100, y1: 60 },
    ];
    const { container } = renderSvg(<Area data={mixed} fill="#abc" />);
    expect(container.querySelector(".vf-chart-area")).toBeTruthy();
  });

  it("renders null when data is empty", () => {
    const { container } = renderSvg(<Area data={[]} fill="#abc" />);
    expect(container.querySelector(".vf-chart-area")).toBeNull();
  });
});
