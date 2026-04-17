import { describe, expect, it, vi } from "vitest";
import { fireEvent } from "@testing-library/react";
import { renderWithTheme } from "../../../../test/renderWithTheme";
import { Brush } from "../Brush";
import { ChartFrame } from "../ChartFrame";

describe("Brush", () => {
  it("renders a transparent track inside the plot", () => {
    const { container } = renderWithTheme(
      <ChartFrame width={400} height={200}>
        <Brush />
      </ChartFrame>
    );
    expect(container.querySelector(".vf-chart-brush__track")).toBeTruthy();
  });

  it("renders a selection rect when controlled", () => {
    const { container } = renderWithTheme(
      <ChartFrame width={400} height={200}>
        <Brush value={[10, 100]} />
      </ChartFrame>
    );
    const sel = container.querySelector(".vf-chart-brush__selection");
    expect(sel).toBeTruthy();
    expect(sel!.getAttribute("x")).toBe("10");
    expect(Number(sel!.getAttribute("width"))).toBe(90);
  });

  it("fires onChangeEnd with null when drag is smaller than minWidth", () => {
    const onChangeEnd = vi.fn();
    const { container } = renderWithTheme(
      <ChartFrame width={400} height={200}>
        <Brush onChangeEnd={onChangeEnd} minWidth={20} />
      </ChartFrame>
    );
    const track = container.querySelector(
      ".vf-chart-brush__track"
    ) as SVGRectElement;
    // With happy-dom's lack of layout, getScreenCTM returns null, so local
    // coordinates collapse to clientX/Y. We simulate a drag with equal start
    // and end to assert the "cleared" selection behavior.
    fireEvent.pointerDown(track, { clientX: 10, clientY: 10, pointerId: 1 });
    fireEvent.pointerUp(track, { clientX: 15, clientY: 10, pointerId: 1 });
    expect(onChangeEnd).toHaveBeenCalledWith(null);
  });

  it("renders with axis=y variant", () => {
    const { container } = renderWithTheme(
      <ChartFrame width={400} height={200}>
        <Brush axis="y" />
      </ChartFrame>
    );
    expect(container.querySelector(".vf-chart-brush--y")).toBeTruthy();
  });

  it("renders the x-axis variant by default", () => {
    const { container } = renderWithTheme(
      <ChartFrame width={400} height={200}>
        <Brush />
      </ChartFrame>
    );
    expect(container.querySelector(".vf-chart-brush--x")).toBeTruthy();
  });

  it("fires onChange during drag", () => {
    const onChange = vi.fn();
    const { container } = renderWithTheme(
      <ChartFrame width={400} height={200}>
        <Brush onChange={onChange} />
      </ChartFrame>
    );
    const track = container.querySelector(
      ".vf-chart-brush__track"
    ) as SVGRectElement;
    fireEvent.pointerDown(track, { clientX: 10, clientY: 10, pointerId: 1 });
    expect(onChange).toHaveBeenCalledTimes(1);
    fireEvent.pointerMove(track, { clientX: 50, clientY: 10, pointerId: 1 });
    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it("renders selection for y-axis brush", () => {
    const { container } = renderWithTheme(
      <ChartFrame width={400} height={200}>
        <Brush axis="y" value={[20, 100]} />
      </ChartFrame>
    );
    const sel = container.querySelector(".vf-chart-brush__selection");
    expect(sel).toBeTruthy();
    expect(sel!.getAttribute("y")).toBe("20");
  });

  it("renders with defaultValue", () => {
    const { container } = renderWithTheme(
      <ChartFrame width={400} height={200}>
        <Brush defaultValue={[10, 50]} />
      </ChartFrame>
    );
    const sel = container.querySelector(".vf-chart-brush__selection");
    expect(sel).toBeTruthy();
  });
});
