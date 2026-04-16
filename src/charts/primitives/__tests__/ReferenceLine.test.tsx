import { describe, expect, it } from "vitest";
import { renderWithTheme } from "../../../../test/renderWithTheme";
import { linearScale } from "../../math/scales";
import { ChartFrame } from "../ChartFrame";
import { ReferenceLine } from "../ReferenceLine";

const yScale = linearScale({ domain: [0, 100], range: [0, 200] });
const xScale = linearScale({ domain: [0, 100], range: [0, 400] });

describe("ReferenceLine", () => {
  // ── horizontal (default) ──────────────────────────────────

  it("renders a horizontal line at the given Y value", () => {
    const { container } = renderWithTheme(
      <ChartFrame width={500} height={300} yScale={yScale}>
        <ReferenceLine value={50} />
      </ChartFrame>
    );
    const line = container.querySelector("line");
    expect(line).toBeTruthy();
    expect(line?.getAttribute("x1")).toBe("0");
    expect(line?.getAttribute("shape-rendering")).toBe("crispEdges");
  });

  it("renders a label when provided (horizontal)", () => {
    const { container } = renderWithTheme(
      <ChartFrame width={500} height={300} yScale={yScale}>
        <ReferenceLine value={50} label="Target" />
      </ChartFrame>
    );
    const text = container.querySelector(
      ".vf-chart-reference-line__label"
    );
    expect(text).toBeTruthy();
    expect(text?.textContent).toBe("Target");
  });

  it("does not render a label when omitted (horizontal)", () => {
    const { container } = renderWithTheme(
      <ChartFrame width={500} height={300} yScale={yScale}>
        <ReferenceLine value={50} />
      </ChartFrame>
    );
    expect(
      container.querySelector(".vf-chart-reference-line__label")
    ).toBeFalsy();
  });

  it("returns null when yScale is missing for horizontal", () => {
    const { container } = renderWithTheme(
      <ChartFrame width={500} height={300}>
        <ReferenceLine value={50} orientation="horizontal" />
      </ChartFrame>
    );
    // no line rendered
    expect(container.querySelector("line")).toBeFalsy();
  });

  it("returns null when yScale produces non-finite value", () => {
    const badScale = linearScale({ domain: [0, 0], range: [0, 0] });
    const { container } = renderWithTheme(
      <ChartFrame width={500} height={300} yScale={badScale}>
        <ReferenceLine value={NaN} />
      </ChartFrame>
    );
    expect(container.querySelector("line")).toBeFalsy();
  });

  // ── vertical ──────────────────────────────────────────────

  it("renders a vertical line at the given X value", () => {
    const { container } = renderWithTheme(
      <ChartFrame width={500} height={300} xScale={xScale}>
        <ReferenceLine value={25} orientation="vertical" />
      </ChartFrame>
    );
    const line = container.querySelector("line");
    expect(line).toBeTruthy();
    expect(line?.getAttribute("y1")).toBe("0");
  });

  it("renders a label when provided (vertical)", () => {
    const { container } = renderWithTheme(
      <ChartFrame width={500} height={300} xScale={xScale}>
        <ReferenceLine value={25} orientation="vertical" label="Cutoff" />
      </ChartFrame>
    );
    const text = container.querySelector(
      ".vf-chart-reference-line__label"
    );
    expect(text).toBeTruthy();
    expect(text?.textContent).toBe("Cutoff");
  });

  it("does not render a label when omitted (vertical)", () => {
    const { container } = renderWithTheme(
      <ChartFrame width={500} height={300} xScale={xScale}>
        <ReferenceLine value={25} orientation="vertical" />
      </ChartFrame>
    );
    expect(
      container.querySelector(".vf-chart-reference-line__label")
    ).toBeFalsy();
  });

  it("returns null when xScale is missing for vertical", () => {
    const { container } = renderWithTheme(
      <ChartFrame width={500} height={300}>
        <ReferenceLine value={25} orientation="vertical" />
      </ChartFrame>
    );
    expect(container.querySelector("line")).toBeFalsy();
  });

  it("returns null when xScale produces non-finite value (vertical)", () => {
    const badScale = linearScale({ domain: [0, 0], range: [0, 0] });
    const { container } = renderWithTheme(
      <ChartFrame width={500} height={300} xScale={badScale}>
        <ReferenceLine value={NaN} orientation="vertical" />
      </ChartFrame>
    );
    expect(container.querySelector("line")).toBeFalsy();
  });

  // ── prop passthrough ──────────────────────────────────────

  it("applies custom stroke and strokeDasharray", () => {
    const { container } = renderWithTheme(
      <ChartFrame width={500} height={300} yScale={yScale}>
        <ReferenceLine value={50} stroke="red" strokeDasharray="8 2" />
      </ChartFrame>
    );
    const line = container.querySelector("line");
    expect(line?.getAttribute("stroke")).toBe("red");
    expect(line?.getAttribute("stroke-dasharray")).toBe("8 2");
  });

  it("applies className and style to the group", () => {
    const { container } = renderWithTheme(
      <ChartFrame width={500} height={300} yScale={yScale}>
        <ReferenceLine
          value={50}
          className="custom-ref"
          style={{ opacity: 0.5 }}
        />
      </ChartFrame>
    );
    const g = container.querySelector(".custom-ref");
    expect(g).toBeTruthy();
    expect((g as HTMLElement).style.opacity).toBe("0.5");
  });
});
