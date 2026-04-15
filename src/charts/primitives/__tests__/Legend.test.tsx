import { describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { renderWithTheme } from "../../../../test/renderWithTheme";
import { ChartLegend } from "../Legend";

describe("ChartLegend", () => {
  const items = [
    { key: "a", label: "Mobile", color: "var(--vf-green)" },
    { key: "b", label: "Desktop", color: "var(--vf-amber)" },
  ];

  it("renders one item per series", () => {
    const { container } = renderWithTheme(<ChartLegend items={items} />);
    expect(container.querySelectorAll(".vf-chart-legend__item")).toHaveLength(2);
  });

  it("is static (no button) when onToggle is omitted", () => {
    const { container } = renderWithTheme(<ChartLegend items={items} />);
    expect(container.querySelector("button")).toBeFalsy();
  });

  it("renders buttons and fires onToggle when interactive", async () => {
    const onToggle = vi.fn();
    const { container } = renderWithTheme(
      <ChartLegend items={items} onToggle={onToggle} />
    );
    const buttons = container.querySelectorAll("button");
    expect(buttons).toHaveLength(2);
    await userEvent.click(buttons[1]!);
    expect(onToggle).toHaveBeenCalledWith("b");
  });

  it("marks disabled items visually", () => {
    const { container } = renderWithTheme(
      <ChartLegend items={[{ ...items[0]!, disabled: true }, items[1]!]} />
    );
    const first = container.querySelector(".vf-chart-legend__item");
    expect(first!.classList.contains("vf-chart-legend__item--disabled")).toBe(
      true
    );
  });

  it("supports line-glyph swatches", () => {
    const { container } = renderWithTheme(
      <ChartLegend items={[{ ...items[0]!, glyph: "line" }]} />
    );
    expect(container.querySelector("line")).toBeTruthy();
  });
});
