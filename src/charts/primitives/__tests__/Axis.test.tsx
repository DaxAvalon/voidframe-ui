import { describe, expect, it } from "vitest";
import { renderWithTheme } from "../../../../test/renderWithTheme";
import { bandScale, linearScale } from "../../math/scales";
import { Axis } from "../Axis";
import { ChartFrame } from "../ChartFrame";

describe("Axis", () => {
  it("renders N ticks for a linear scale", () => {
    const scale = linearScale({ domain: [0, 100], range: [0, 400] });
    const { container } = renderWithTheme(
      <ChartFrame width={500} height={200} xScale={scale}>
        <Axis orientation="bottom" ticks={5} />
      </ChartFrame>
    );
    const ticks = container.querySelectorAll(".vf-chart-axis__tick");
    expect(ticks.length).toBeGreaterThanOrEqual(5);
  });

  it("renders one tick per band for a band scale", () => {
    const scale = bandScale({
      domain: ["a", "b", "c", "d"],
      range: [0, 400],
      padding: 0.1,
    });
    const { container } = renderWithTheme(
      <ChartFrame width={500} height={200} xScale={scale}>
        <Axis orientation="bottom" />
      </ChartFrame>
    );
    const ticks = container.querySelectorAll(".vf-chart-axis__tick");
    expect(ticks).toHaveLength(4);
  });

  it("orientation sets the modifier class", () => {
    const scale = linearScale({ domain: [0, 10], range: [0, 100] });
    const { container } = renderWithTheme(
      <ChartFrame width={300} height={200} yScale={scale}>
        <Axis orientation="left" ticks={3} />
      </ChartFrame>
    );
    expect(
      container.querySelector(".vf-chart-axis--left")
    ).toBeTruthy();
  });

  it("hideLabels suppresses tick text", () => {
    const scale = linearScale({ domain: [0, 10], range: [0, 100] });
    const { container } = renderWithTheme(
      <ChartFrame width={300} height={200} xScale={scale}>
        <Axis orientation="bottom" hideLabels />
      </ChartFrame>
    );
    expect(container.querySelector(".vf-chart-axis__label")).toBeFalsy();
  });

  it("hideLine suppresses the main axis line", () => {
    const scale = linearScale({ domain: [0, 10], range: [0, 100] });
    const { container } = renderWithTheme(
      <ChartFrame width={300} height={200} xScale={scale}>
        <Axis orientation="bottom" hideLine />
      </ChartFrame>
    );
    expect(container.querySelector(".vf-chart-axis__line")).toBeFalsy();
  });

  it("hideTickLines suppresses per-tick marks", () => {
    const scale = linearScale({ domain: [0, 10], range: [0, 100] });
    const { container } = renderWithTheme(
      <ChartFrame width={300} height={200} xScale={scale}>
        <Axis orientation="bottom" hideTickLines />
      </ChartFrame>
    );
    expect(container.querySelector(".vf-chart-axis__tick-line")).toBeFalsy();
  });

  it("autoRotate on a left-oriented axis rotates tick labels when density is high", () => {
    const scale = linearScale({ domain: [0, 20], range: [0, 200] });
    const { container } = renderWithTheme(
      <ChartFrame width={300} height={200} yScale={scale}>
        <Axis orientation="left" ticks={20} autoRotate />
      </ChartFrame>
    );
    const labels = container.querySelectorAll(".vf-chart-axis__label");
    const anyRotated = Array.from(labels).some((l) =>
      (l.getAttribute("transform") ?? "").includes("rotate")
    );
    expect(anyRotated).toBe(true);
  });

  it("applies a custom label format", () => {
    const scale = linearScale({ domain: [0, 1], range: [0, 100] });
    const { container } = renderWithTheme(
      <ChartFrame width={300} height={200} xScale={scale}>
        <Axis
          orientation="bottom"
          format={(v) => `${Number(v) * 100}%`}
        />
      </ChartFrame>
    );
    const labels = container.querySelectorAll(".vf-chart-axis__label");
    const texts = Array.from(labels).map((l) => l.textContent);
    expect(texts.some((t) => t?.endsWith("%"))).toBe(true);
  });
});
