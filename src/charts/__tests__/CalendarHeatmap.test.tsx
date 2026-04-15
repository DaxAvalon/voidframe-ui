import { describe, expect, it } from "vitest";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { CalendarHeatmap } from "../CalendarHeatmap";

describe("CalendarHeatmap", () => {
  it("renders one cell per day in the range", () => {
    const start = new Date(2026, 0, 1);
    const end = new Date(2026, 0, 10); // 10 days inclusive
    const { container } = renderWithTheme(
      <CalendarHeatmap
        start={start}
        end={end}
        data={Array.from({ length: 10 }, (_, i) => ({
          date: new Date(2026, 0, 1 + i),
          value: i,
        }))}
        cellSize={10}
      />
    );
    const cells = container.querySelectorAll(".vf-chart-calheat__cell");
    expect(cells).toHaveLength(10);
  });

  it("renders month labels when enabled", () => {
    const { container } = renderWithTheme(
      <CalendarHeatmap
        start={new Date(2026, 0, 1)}
        end={new Date(2026, 2, 15)}
        data={[]}
      />
    );
    const months = container.querySelectorAll(".vf-chart-calheat__month");
    expect(months.length).toBeGreaterThan(0);
  });
});
