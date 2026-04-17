import { describe, expect, it } from "vitest";
import { renderWithTheme } from "../../../../test/renderWithTheme";
import { linearScale } from "../../math/scales";
import { ChartFrame } from "../ChartFrame";
import { ReferenceBand } from "../ReferenceBand";

const yScale = linearScale({ domain: [0, 100], range: [0, 200] });
const xScale = linearScale({ domain: [0, 100], range: [0, 400] });

describe("ReferenceBand", () => {
  // ── horizontal (default) ──────────────────────────────────

  it("renders a rect for a horizontal band", () => {
    const { container } = renderWithTheme(
      <ChartFrame width={500} height={300} yScale={yScale}>
        <ReferenceBand from={20} to={80} />
      </ChartFrame>
    );
    const rect = container.querySelector("rect");
    expect(rect).toBeTruthy();
    expect(rect?.getAttribute("x")).toBe("0");
  });

  it("renders a label when provided (horizontal)", () => {
    const { container } = renderWithTheme(
      <ChartFrame width={500} height={300} yScale={yScale}>
        <ReferenceBand from={20} to={80} label="Range" />
      </ChartFrame>
    );
    const text = container.querySelector(
      ".vf-chart-reference-band__label"
    );
    expect(text).toBeTruthy();
    expect(text?.textContent).toBe("Range");
  });

  it("does not render a label when omitted (horizontal)", () => {
    const { container } = renderWithTheme(
      <ChartFrame width={500} height={300} yScale={yScale}>
        <ReferenceBand from={20} to={80} />
      </ChartFrame>
    );
    expect(
      container.querySelector(".vf-chart-reference-band__label")
    ).toBeFalsy();
  });

  it("returns null when yScale is missing for horizontal", () => {
    const { container } = renderWithTheme(
      <ChartFrame width={500} height={300}>
        <ReferenceBand from={20} to={80} orientation="horizontal" />
      </ChartFrame>
    );
    expect(container.querySelector("rect")).toBeFalsy();
  });

  it("returns null when yScale produces non-finite values (horizontal)", () => {
    const badScale = linearScale({ domain: [0, 0], range: [0, 0] });
    const { container } = renderWithTheme(
      <ChartFrame width={500} height={300} yScale={badScale}>
        <ReferenceBand from={NaN} to={50} />
      </ChartFrame>
    );
    expect(container.querySelector("rect")).toBeFalsy();
  });

  // ── vertical ──────────────────────────────────────────────

  it("renders a rect for a vertical band", () => {
    const { container } = renderWithTheme(
      <ChartFrame width={500} height={300} xScale={xScale}>
        <ReferenceBand from={10} to={50} orientation="vertical" />
      </ChartFrame>
    );
    const rect = container.querySelector("rect");
    expect(rect).toBeTruthy();
    expect(rect?.getAttribute("y")).toBe("0");
  });

  it("renders a label when provided (vertical)", () => {
    const { container } = renderWithTheme(
      <ChartFrame width={500} height={300} xScale={xScale}>
        <ReferenceBand
          from={10}
          to={50}
          orientation="vertical"
          label="Zone"
        />
      </ChartFrame>
    );
    const text = container.querySelector(
      ".vf-chart-reference-band__label"
    );
    expect(text).toBeTruthy();
    expect(text?.textContent).toBe("Zone");
  });

  it("does not render a label when omitted (vertical)", () => {
    const { container } = renderWithTheme(
      <ChartFrame width={500} height={300} xScale={xScale}>
        <ReferenceBand from={10} to={50} orientation="vertical" />
      </ChartFrame>
    );
    expect(
      container.querySelector(".vf-chart-reference-band__label")
    ).toBeFalsy();
  });

  it("returns null when xScale is missing for vertical", () => {
    const { container } = renderWithTheme(
      <ChartFrame width={500} height={300}>
        <ReferenceBand from={10} to={50} orientation="vertical" />
      </ChartFrame>
    );
    expect(container.querySelector("rect")).toBeFalsy();
  });

  it("returns null when xScale produces non-finite values (vertical)", () => {
    const badScale = linearScale({ domain: [0, 0], range: [0, 0] });
    const { container } = renderWithTheme(
      <ChartFrame width={500} height={300} xScale={badScale}>
        <ReferenceBand from={NaN} to={50} orientation="vertical" />
      </ChartFrame>
    );
    expect(container.querySelector("rect")).toBeFalsy();
  });

  // ── prop passthrough ──────────────────────────────────────

  it("applies custom fill and fillOpacity", () => {
    const { container } = renderWithTheme(
      <ChartFrame width={500} height={300} yScale={yScale}>
        <ReferenceBand from={20} to={80} fill="blue" fillOpacity={0.3} />
      </ChartFrame>
    );
    const rect = container.querySelector("rect");
    expect(rect?.getAttribute("fill")).toBe("blue");
    expect(rect?.getAttribute("fill-opacity")).toBe("0.3");
  });

  it("applies className and style to the group", () => {
    const { container } = renderWithTheme(
      <ChartFrame width={500} height={300} yScale={yScale}>
        <ReferenceBand
          from={20}
          to={80}
          className="custom-band"
          style={{ opacity: 0.5 }}
        />
      </ChartFrame>
    );
    const g = container.querySelector(".custom-band");
    expect(g).toBeTruthy();
    expect((g as HTMLElement).style.opacity).toBe("0.5");
  });
});
