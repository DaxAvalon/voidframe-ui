import { describe, expect, it, vi } from "vitest";
import { fireEvent } from "@testing-library/react";
import { renderWithTheme } from "../../../../test/renderWithTheme";
import { Point } from "../Point";

const data = [
  { x: 10, y: 20 },
  { x: 30, y: 40 },
  { x: 50, y: 60, size: 12 },
];

function renderSvg(ui: React.ReactElement) {
  return renderWithTheme(
    <svg>
      <g>{ui}</g>
    </svg>
  );
}

describe("Point", () => {
  it("renders square rects by default", () => {
    const { container } = renderSvg(
      <Point data={data} fill="#000" />
    );
    const rects = container.querySelectorAll(".vf-chart-point rect");
    expect(rects).toHaveLength(3);
    // Default size=4, half=2
    expect(rects[0]!.getAttribute("shape-rendering")).toBe("crispEdges");
  });

  it("renders circles when shape=circle", () => {
    const { container } = renderSvg(
      <Point data={data} shape="circle" fill="#000" />
    );
    const circles = container.querySelectorAll(".vf-chart-point circle");
    expect(circles).toHaveLength(3);
    expect(circles[0]!.getAttribute("shape-rendering")).toBe(
      "geometricPrecision"
    );
  });

  it("renders diamonds when shape=diamond", () => {
    const { container } = renderSvg(
      <Point data={data} shape="diamond" fill="#000" />
    );
    const polygons = container.querySelectorAll(".vf-chart-point polygon");
    expect(polygons).toHaveLength(3);
  });

  it("renders cross lines when shape=cross", () => {
    const { container } = renderSvg(
      <Point data={data} shape="cross" fill="#000" stroke="#000" />
    );
    // Each cross renders 2 lines inside a <g>
    const lines = container.querySelectorAll(".vf-chart-point line");
    expect(lines).toHaveLength(6);
  });

  it("respects per-point size override", () => {
    const { container } = renderSvg(
      <Point data={data} shape="circle" size={4} fill="#000" />
    );
    const circles = container.querySelectorAll(".vf-chart-point circle");
    // Third point has size=12, radius=6
    expect(circles[2]!.getAttribute("r")).toBe("6");
    // First point uses default size=4, radius=2
    expect(circles[0]!.getAttribute("r")).toBe("2");
  });

  it("fires onPointClick with datum and index", () => {
    const onClick = vi.fn();
    const { container } = renderSvg(
      <Point data={data} fill="#000" onPointClick={onClick} />
    );
    const rect = container.querySelector(".vf-chart-point rect")!;
    fireEvent.click(rect);
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onClick).toHaveBeenCalledWith(data[0], 0);
  });

  it("fires onPointHover on pointer move and clears on leave", () => {
    const onHover = vi.fn();
    const { container } = renderSvg(
      <Point data={data} fill="#000" onPointHover={onHover} />
    );
    const rect = container.querySelector(".vf-chart-point rect")!;
    fireEvent.pointerMove(rect, { clientX: 10, clientY: 20 });
    expect(onHover).toHaveBeenCalledTimes(1);
    expect(onHover.mock.calls[0]![0]).toEqual(data[0]);
    fireEvent.pointerLeave(rect);
    expect(onHover).toHaveBeenCalledTimes(2);
    expect(onHover.mock.calls[1]![0]).toBeNull();
  });

  it("applies custom className", () => {
    const { container } = renderSvg(
      <Point data={data} fill="#000" className="my-points" />
    );
    expect(
      container
        .querySelector(".vf-chart-point")!
        .classList.contains("my-points")
    ).toBe(true);
  });
});
