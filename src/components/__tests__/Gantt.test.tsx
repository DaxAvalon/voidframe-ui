import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { Gantt, type GanttTask } from "../Gantt";

const start = new Date("2026-04-01");
const end = new Date("2026-04-15");

const tasks: GanttTask[] = [
  { id: "a", name: "Design", start: new Date("2026-04-01"), end: new Date("2026-04-05") },
  { id: "b", name: "Build", start: new Date("2026-04-05"), end: new Date("2026-04-10"), dependencies: ["a"] },
  { id: "c", name: "Test", start: new Date("2026-04-10"), end: new Date("2026-04-14"), tone: "success" },
];

describe("Gantt", () => {
  it("renders with role table and aria-label", () => {
    renderWithTheme(<Gantt tasks={tasks} start={start} end={end} />);
    expect(screen.getByRole("table", { name: "Gantt chart" })).toBeInTheDocument();
  });

  it("renders task names", () => {
    const { container } = renderWithTheme(<Gantt tasks={tasks} start={start} end={end} />);
    const names = container.querySelectorAll(".vf-gantt__name");
    const labels = Array.from(names).map((el) => el.textContent);
    expect(labels).toContain("Design");
    expect(labels).toContain("Build");
    expect(labels).toContain("Test");
  });

  it("applies granularity class", () => {
    const { container } = renderWithTheme(
      <Gantt tasks={tasks} start={start} end={end} granularity="week" />
    );
    expect(container.querySelector(".vf-gantt--week")).toBeTruthy();
  });

  it("renders bars as role=button", () => {
    renderWithTheme(<Gantt tasks={tasks} start={start} end={end} />);
    const bars = screen.getAllByRole("button");
    expect(bars.length).toBe(tasks.length);
  });

  it("fires onTaskClick when a bar is clicked", () => {
    const onClick = vi.fn();
    renderWithTheme(
      <Gantt tasks={tasks} start={start} end={end} onTaskClick={onClick} />
    );
    screen.getAllByRole("button")[0].click();
    expect(onClick).toHaveBeenCalledWith(expect.objectContaining({ id: "a", name: "Design" }));
  });

  it("renders dependency SVG when tasks have dependencies", () => {
    const { container } = renderWithTheme(
      <Gantt tasks={tasks} start={start} end={end} />
    );
    const svg = container.querySelector(".vf-gantt__deps");
    expect(svg).toBeTruthy();
    expect(svg?.querySelectorAll(".vf-gantt__dep").length).toBe(1);
  });

  it("renders resize handles when not readOnly", () => {
    const { container } = renderWithTheme(
      <Gantt tasks={tasks} start={start} end={end} />
    );
    const handles = container.querySelectorAll(".vf-gantt__resize");
    expect(handles.length).toBe(tasks.length);
  });

  it("hides resize handles when readOnly", () => {
    const { container } = renderWithTheme(
      <Gantt tasks={tasks} start={start} end={end} readOnly />
    );
    expect(container.querySelectorAll(".vf-gantt__resize").length).toBe(0);
  });
});
