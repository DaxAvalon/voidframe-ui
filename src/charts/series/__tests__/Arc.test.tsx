import { describe, expect, it, vi } from "vitest";
import { fireEvent } from "@testing-library/react";
import { renderWithTheme } from "../../../../test/renderWithTheme";
import { Arc } from "../Arc";

const data = [
  { startAngle: 0, endAngle: Math.PI / 2, key: "a" },
  { startAngle: Math.PI / 2, endAngle: Math.PI, key: "b" },
  { startAngle: Math.PI, endAngle: Math.PI * 2, key: "c" },
];

function renderSvg(ui: React.ReactElement) {
  return renderWithTheme(
    <svg>
      <g>{ui}</g>
    </svg>
  );
}

describe("Arc", () => {
  it("renders one path per datum", () => {
    const { container } = renderSvg(
      <Arc data={data} innerRadius={0} outerRadius={100} fill="#ccc" />
    );
    const paths = container.querySelectorAll(".vf-chart-arc path");
    expect(paths).toHaveLength(3);
    // Each path should have a valid `d` attribute
    for (const p of paths) {
      expect(p.getAttribute("d")).toBeTruthy();
    }
  });

  it("applies fillFor override per arc", () => {
    const fillFor = (_d: unknown, i: number) =>
      ["red", "green", "blue"][i]!;
    const { container } = renderSvg(
      <Arc
        data={data}
        innerRadius={0}
        outerRadius={100}
        fill="#ccc"
        fillFor={fillFor}
      />
    );
    const paths = container.querySelectorAll(".vf-chart-arc path");
    expect(paths[0]!.getAttribute("fill")).toBe("red");
    expect(paths[1]!.getAttribute("fill")).toBe("green");
    expect(paths[2]!.getAttribute("fill")).toBe("blue");
  });

  it("fires onArcClick with datum and index", () => {
    const onClick = vi.fn();
    const { container } = renderSvg(
      <Arc
        data={data}
        innerRadius={0}
        outerRadius={100}
        fill="#ccc"
        onArcClick={onClick}
      />
    );
    const path = container.querySelector(".vf-chart-arc path")!;
    fireEvent.click(path);
    expect(onClick).toHaveBeenCalledWith(data[0], 0);
  });

  it("fires onArcHover on pointer move and clears on leave", () => {
    const onHover = vi.fn();
    const { container } = renderSvg(
      <Arc
        data={data}
        innerRadius={0}
        outerRadius={100}
        fill="#ccc"
        onArcHover={onHover}
      />
    );
    const path = container.querySelector(".vf-chart-arc path")!;
    fireEvent.pointerMove(path);
    expect(onHover.mock.calls[0]![0]).toEqual(data[0]);
    fireEvent.pointerLeave(path);
    expect(onHover.mock.calls[1]![0]).toBeNull();
  });

  it("renders with corner radius", () => {
    const { container } = renderSvg(
      <Arc
        data={data}
        innerRadius={30}
        outerRadius={100}
        cornerRadius={5}
        fill="#ccc"
      />
    );
    const paths = container.querySelectorAll(".vf-chart-arc path");
    expect(paths).toHaveLength(3);
  });

  it("uses key from datum for the path key", () => {
    const { container } = renderSvg(
      <Arc data={data} innerRadius={0} outerRadius={100} fill="#ccc" />
    );
    // Renders without error when keys are present
    expect(container.querySelectorAll(".vf-chart-arc path")).toHaveLength(3);
  });

  it("applies stroke and strokeWidth", () => {
    const { container } = renderSvg(
      <Arc
        data={data}
        innerRadius={0}
        outerRadius={100}
        fill="#ccc"
        stroke="white"
        strokeWidth={2}
      />
    );
    const path = container.querySelector(".vf-chart-arc path")!;
    expect(path.getAttribute("stroke")).toBe("white");
    expect(path.getAttribute("stroke-width")).toBe("2");
  });
});
