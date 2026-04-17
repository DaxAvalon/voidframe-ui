import { describe, expect, it, vi } from "vitest";
import { fireEvent } from "@testing-library/react";
import { renderWithTheme } from "../../../../test/renderWithTheme";
import { Bar } from "../Bar";

const data = [
  { x: 0, y: 10, width: 40, height: 80 },
  { x: 50, y: 20, width: 40, height: 60 },
  { x: 100, y: 5, width: 40, height: 90 },
];

function renderSvg(ui: React.ReactElement) {
  return renderWithTheme(
    <svg>
      <g>{ui}</g>
    </svg>
  );
}

describe("Bar", () => {
  it("renders one rect per datum with the right class", () => {
    const { container } = renderSvg(<Bar data={data} fill="#ccc" />);
    expect(container.querySelectorAll(".vf-chart-bar__rect")).toHaveLength(3);
  });

  it("applies fillFor override per bar", () => {
    const fillFor = (_d: unknown, i: number) =>
      i === 0 ? "red" : "blue";
    const { container } = renderSvg(
      <Bar data={data} fill="green" fillFor={fillFor} />
    );
    const rects = container.querySelectorAll(".vf-chart-bar__rect");
    expect(rects[0]!.getAttribute("fill")).toBe("red");
    expect(rects[1]!.getAttribute("fill")).toBe("blue");
  });

  it("fires onBarClick with datum and index", () => {
    const onClick = vi.fn();
    const { container } = renderSvg(
      <Bar data={data} fill="#ccc" onBarClick={onClick} />
    );
    const rect = container.querySelector(".vf-chart-bar__rect")!;
    fireEvent.click(rect);
    expect(onClick).toHaveBeenCalledWith(data[0], 0);
  });

  it("fires onBarHover on pointer move and clears on leave", () => {
    const onHover = vi.fn();
    const { container } = renderSvg(
      <Bar data={data} fill="#ccc" onBarHover={onHover} />
    );
    const rect = container.querySelector(".vf-chart-bar__rect")!;
    fireEvent.pointerMove(rect);
    expect(onHover.mock.calls[0]![0]).toEqual(data[0]);
    fireEvent.pointerLeave(rect);
    expect(onHover.mock.calls[1]![0]).toBeNull();
  });

  it("applies corner radius when radius prop is set", () => {
    const { container } = renderSvg(
      <Bar data={data} fill="#ccc" radius={4} />
    );
    const rect = container.querySelector(".vf-chart-bar__rect")!;
    expect(rect.getAttribute("rx")).toBe("4");
    expect(rect.getAttribute("ry")).toBe("4");
  });

  it("clamps negative width/height to zero", () => {
    const negData = [{ x: 0, y: 0, width: -10, height: -5 }];
    const { container } = renderSvg(<Bar data={negData} fill="#ccc" />);
    const rect = container.querySelector(".vf-chart-bar__rect")!;
    expect(rect.getAttribute("width")).toBe("0");
    expect(rect.getAttribute("height")).toBe("0");
  });
});
