import { act, screen } from "@testing-library/react";
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

  it("renders milestone as diamond SVG instead of bar", () => {
    const milestoneTasks: GanttTask[] = [
      { id: "m", name: "Release", start: new Date("2026-04-07"), end: new Date("2026-04-07"), milestone: true },
    ];
    const { container } = renderWithTheme(
      <Gantt tasks={milestoneTasks} start={start} end={end} />
    );
    expect(container.querySelector(".vf-gantt__milestone")).toBeTruthy();
    expect(container.querySelector(".vf-gantt__bar")).toBeFalsy();
  });

  it("renders today marker when showToday=true and today is in range", () => {
    const now = new Date();
    const rangeStart = new Date(now.getTime() - 86400000 * 5);
    const rangeEnd = new Date(now.getTime() + 86400000 * 5);
    const todayTasks: GanttTask[] = [
      { id: "a", name: "Task", start: rangeStart, end: rangeEnd },
    ];
    const { container } = renderWithTheme(
      <Gantt tasks={todayTasks} start={rangeStart} end={rangeEnd} showToday />
    );
    expect(container.querySelector(".vf-gantt__today")).toBeTruthy();
  });

  it("hides today marker when showToday=false", () => {
    const { container } = renderWithTheme(
      <Gantt tasks={tasks} start={start} end={end} showToday={false} />
    );
    expect(container.querySelector(".vf-gantt__today")).toBeFalsy();
  });

  it("renders with week granularity", () => {
    const { container } = renderWithTheme(
      <Gantt tasks={tasks} start={start} end={end} granularity="week" />
    );
    expect(container.querySelector(".vf-gantt--week")).toBeTruthy();
  });

  it("renders with month granularity", () => {
    const monthEnd = new Date("2026-07-01");
    const { container } = renderWithTheme(
      <Gantt tasks={tasks} start={start} end={monthEnd} granularity="month" />
    );
    expect(container.querySelector(".vf-gantt--month")).toBeTruthy();
  });

  it("renders with custom unitWidth and rowHeight", () => {
    const { container } = renderWithTheme(
      <Gantt tasks={tasks} start={start} end={end} unitWidth={40} rowHeight={48} />
    );
    expect(container.querySelector(".vf-gantt")).toBeTruthy();
  });

  it("applies tone class to bar", () => {
    const { container } = renderWithTheme(
      <Gantt tasks={tasks} start={start} end={end} />
    );
    expect(container.querySelector(".vf-gantt__bar--success")).toBeTruthy();
  });

  it("onTaskUpdate fires with updated start/end after a pointer drag (no stale closure)", () => {
    const onTaskUpdate = vi.fn();
    renderWithTheme(
      <Gantt
        tasks={tasks}
        start={start}
        end={end}
        unitWidth={24}
        granularity="day"
        onTaskUpdate={onTaskUpdate}
      />
    );
    // Find task "a" bar by its aria-label prefix
    const bar = screen.getByLabelText(/^Design:/) as HTMLElement;
    expect(bar).toBeTruthy();

    // Stub pointer capture APIs (not implemented in happy-dom).
    (bar as unknown as { setPointerCapture: () => void }).setPointerCapture = () => {};
    (bar as unknown as { releasePointerCapture: () => void }).releasePointerCapture = () => {};

    // Simulate a move drag: pointerdown on bar → pointermove +48px (two day-units) → pointerup.
    const pdown = new PointerEvent("pointerdown", {
      bubbles: true,
      cancelable: true,
      clientX: 0,
      pointerId: 1,
    });
    act(() => {
      bar.dispatchEvent(pdown);
    });

    const pmove = new PointerEvent("pointermove", {
      bubbles: true,
      clientX: 48,
      pointerId: 1,
    });
    act(() => {
      window.dispatchEvent(pmove);
    });

    const pup = new PointerEvent("pointerup", {
      bubbles: true,
      clientX: 48,
      pointerId: 1,
    });
    act(() => {
      window.dispatchEvent(pup);
    });

    expect(onTaskUpdate).toHaveBeenCalledTimes(1);
    const payload = onTaskUpdate.mock.calls[0]![0] as {
      id: string;
      start: Date;
      end: Date;
    };
    expect(payload.id).toBe("a");
    // The drag moved forward two day-units → +2 days on both bounds.
    const diffStart = payload.start.getTime() - tasks[0]!.start.getTime();
    expect(diffStart).toBe(2 * 86_400_000);
    const diffEnd = payload.end.getTime() - tasks[0]!.end.getTime();
    expect(diffEnd).toBe(2 * 86_400_000);
  });
});
