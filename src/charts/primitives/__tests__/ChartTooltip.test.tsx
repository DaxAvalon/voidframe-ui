import { describe, expect, it } from "vitest";
import { renderWithTheme } from "../../../../test/renderWithTheme";
import { ChartTooltip } from "../ChartTooltip";

describe("ChartTooltip", () => {
  it("renders nothing when active=false", () => {
    const { container } = renderWithTheme(
      <ChartTooltip active={false} x={100} y={100}>
        <span>Tooltip content</span>
      </ChartTooltip>
    );
    expect(container.querySelector(".vf-chart-tooltip")).toBeFalsy();
  });

  it("renders tooltip content when active=true", () => {
    const { baseElement } = renderWithTheme(
      <ChartTooltip active={true} x={100} y={100}>
        <span>Tooltip content</span>
      </ChartTooltip>
    );
    // Portal renders outside the container, check baseElement
    const tooltip = baseElement.querySelector(".vf-chart-tooltip");
    expect(tooltip).toBeTruthy();
    expect(tooltip!.getAttribute("role")).toBe("tooltip");
  });

  it("applies custom className", () => {
    const { baseElement } = renderWithTheme(
      <ChartTooltip active={true} x={100} y={100} className="my-tooltip">
        <span>Content</span>
      </ChartTooltip>
    );
    const tooltip = baseElement.querySelector(".vf-chart-tooltip");
    expect(tooltip!.classList.contains("my-tooltip")).toBe(true);
  });

  it("positions via fixed style", () => {
    const { baseElement } = renderWithTheme(
      <ChartTooltip active={true} x={50} y={75}>
        <span>Content</span>
      </ChartTooltip>
    );
    const tooltip = baseElement.querySelector(".vf-chart-tooltip") as HTMLElement;
    expect(tooltip.style.position).toBe("fixed");
  });
});
