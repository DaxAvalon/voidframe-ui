import { describe, expect, it } from "vitest";
import { renderWithTheme } from "../../../../test/renderWithTheme";
import { ChartTooltipBody } from "../ChartTooltipBody";

describe("ChartTooltipBody", () => {
  it("renders the title", () => {
    const { container, getByText } = renderWithTheme(
      <ChartTooltipBody title="Series A" metrics={[]} />
    );
    expect(container.querySelector(".vf-chart-tooltip__body")).toBeTruthy();
    expect(container.querySelector(".vf-chart-tooltip__title")).toBeTruthy();
    expect(getByText("Series A")).toBeTruthy();
  });

  it("omits the metrics block when metrics is empty", () => {
    const { container } = renderWithTheme(
      <ChartTooltipBody title="Empty" metrics={[]} />
    );
    expect(container.querySelector(".vf-chart-tooltip__metrics")).toBeFalsy();
  });

  it("renders one row per metric", () => {
    const { container } = renderWithTheme(
      <ChartTooltipBody
        title="Sales"
        metrics={[
          { label: "value", value: "100" },
          { label: "delta", value: "+5" },
          { label: "share", value: "12%" },
        ]}
      />
    );
    expect(
      container.querySelectorAll(".vf-chart-tooltip__row").length
    ).toBe(3);
  });

  it("renders a swatch when metric.color is set", () => {
    const { container } = renderWithTheme(
      <ChartTooltipBody
        title="Series"
        metrics={[{ label: "value", value: "10", color: "#abc" }]}
      />
    );
    const swatch = container.querySelector(".vf-chart-tooltip__swatch");
    expect(swatch).toBeTruthy();
    expect((swatch as HTMLElement).style.background).toBe("#abc");
  });

  it("renders a hint when metric.hint is set", () => {
    const { container, getByText } = renderWithTheme(
      <ChartTooltipBody
        title="Series"
        metrics={[
          { label: "value", value: "10", hint: "of 100 total" },
        ]}
      />
    );
    expect(container.querySelector(".vf-chart-tooltip__hint")).toBeTruthy();
    expect(getByText("of 100 total")).toBeTruthy();
  });

  it("renders the footer when provided", () => {
    const { container, getByText } = renderWithTheme(
      <ChartTooltipBody
        title="Sales"
        metrics={[{ label: "value", value: "10" }]}
        footer="updated 10s ago"
      />
    );
    expect(container.querySelector(".vf-chart-tooltip__footer")).toBeTruthy();
    expect(getByText("updated 10s ago")).toBeTruthy();
  });

  it("omits the footer block when not provided", () => {
    const { container } = renderWithTheme(
      <ChartTooltipBody
        title="Sales"
        metrics={[{ label: "value", value: "10" }]}
      />
    );
    expect(container.querySelector(".vf-chart-tooltip__footer")).toBeFalsy();
  });
});
