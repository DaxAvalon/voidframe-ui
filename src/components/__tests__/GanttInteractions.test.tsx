import { describe, expect, it, vi } from "vitest";
import { fireEvent, screen } from "@testing-library/react";
import { renderWithTheme } from "../../testing/renderWithTheme";
import { render } from "@testing-library/react";
import { VoidframeProvider } from "../../provider/VoidframeProvider";
import {
  Gantt,
  fitTaskRange,
  pickGranularity,
  snapDate,
  type GanttDependency,
  type GanttTask,
  type GanttUpdate,
} from "../Gantt";

const tasks: GanttTask[] = [
  { id: "a", name: "Design", start: new Date(2026, 2, 2), end: new Date(2026, 2, 5) },
  { id: "b", name: "Build", start: new Date(2026, 2, 6), end: new Date(2026, 2, 12), dependencies: ["a"] },
  { id: "c", name: "Launch", start: new Date(2026, 2, 13), end: new Date(2026, 2, 14), locked: true },
];
const start = new Date(2026, 2, 1);
const end = new Date(2026, 2, 20);

function bar(name: string): HTMLElement {
  return screen.getByRole("button", { name: new RegExp(`^${name}:`) });
}

function drag(el: HTMLElement, fromX: number, toX: number) {
  fireEvent.pointerDown(el, { clientX: fromX, pointerId: 1 });
  fireEvent.pointerMove(window, { clientX: toX, pointerId: 1 });
  fireEvent.pointerUp(window, { clientX: toX, pointerId: 1 });
}

describe("snapDate / helpers", () => {
  it("snaps to the nearest day and to week starts honouring firstDayOfWeek", () => {
    expect(snapDate(new Date(2026, 2, 2, 11), "day")).toEqual(new Date(2026, 2, 2));
    expect(snapDate(new Date(2026, 2, 2, 13), "day")).toEqual(new Date(2026, 2, 3));
    // 2026-03-04 is a Wednesday. Sunday weeks: nearest start is Mar 1; Monday weeks: Mar 2.
    expect(snapDate(new Date(2026, 2, 4), "week", 0)).toEqual(new Date(2026, 2, 1));
    expect(snapDate(new Date(2026, 2, 4), "week", 1)).toEqual(new Date(2026, 2, 2));
    // Thursday rounds up to the next week.
    expect(snapDate(new Date(2026, 2, 5), "week", 0)).toEqual(new Date(2026, 2, 8));
    const raw = new Date(2026, 2, 2, 7, 30);
    expect(snapDate(raw, "none")).toBe(raw);
  });

  it("pickGranularity and fitTaskRange derive range and unit from tasks", () => {
    expect(pickGranularity(new Date(2026, 0, 1), new Date(2026, 1, 1))).toBe("day");
    expect(pickGranularity(new Date(2026, 0, 1), new Date(2026, 6, 1))).toBe("week");
    expect(pickGranularity(new Date(2024, 0, 1), new Date(2026, 6, 1))).toBe("month");
    expect(fitTaskRange(tasks, "day")).toEqual({ start: new Date(2026, 2, 1), end: new Date(2026, 2, 15) });
  });
});

describe("Gantt interactions", () => {
  it("snaps a move to whole days by default and keeps the duration", () => {
    const onUpdate = vi.fn<(u: GanttUpdate) => void>();
    renderWithTheme(<Gantt tasks={tasks} start={start} end={end} unitWidth={20} onTaskUpdate={onUpdate} />);
    // 2.6 units right → 2.6 days → snaps to +3 days.
    drag(bar("Design"), 0, 52);
    expect(onUpdate).toHaveBeenCalledWith({
      id: "a",
      start: new Date(2026, 2, 5),
      end: new Date(2026, 2, 8),
    });
  });

  it("snapTo=none emits the raw delta and snapTo=week snaps to week starts", () => {
    const onUpdate = vi.fn<(u: GanttUpdate) => void>();
    const { unmount } = renderWithTheme(
      <Gantt tasks={tasks} start={start} end={end} unitWidth={20} snapTo="none" onTaskUpdate={onUpdate} />
    );
    drag(bar("Design"), 0, 10);
    expect(onUpdate.mock.calls[0]![0].start.getTime()).toBe(new Date(2026, 2, 2).getTime() + 12 * 3600000);
    unmount();
    onUpdate.mockClear();
    renderWithTheme(
      <Gantt tasks={tasks} start={start} end={end} unitWidth={20} snapTo="week" onTaskUpdate={onUpdate} />
    );
    drag(bar("Design"), 0, 100); // +5 days → Mar 7 (Sat) → nearest Sunday is Mar 8
    expect(onUpdate.mock.calls[0]![0].start).toEqual(new Date(2026, 2, 8));
  });

  it("does not emit an update when the snapped result equals the original", () => {
    const onUpdate = vi.fn();
    renderWithTheme(<Gantt tasks={tasks} start={start} end={end} unitWidth={20} onTaskUpdate={onUpdate} />);
    drag(bar("Design"), 0, 4);
    expect(onUpdate).not.toHaveBeenCalled();
  });

  it("respects task.locked and getTaskPermissions for move and resize", () => {
    const onUpdate = vi.fn();
    renderWithTheme(
      <Gantt
        tasks={tasks}
        start={start}
        end={end}
        unitWidth={20}
        onTaskUpdate={onUpdate}
        getTaskPermissions={(t) => (t.id === "b" ? { move: false, resize: true } : undefined)}
      />
    );
    const launch = bar("Launch");
    expect(launch).toHaveAttribute("data-locked");
    expect(launch.getAttribute("aria-label")).toMatch(/\(fixed\)$/);
    expect(launch.querySelector(".vf-gantt__resize")).toBeNull();
    drag(launch, 0, 60);
    expect(onUpdate).not.toHaveBeenCalled();
    const build = bar("Build");
    expect(build).toHaveClass("vf-gantt__bar--fixed");
    expect(build.querySelector(".vf-gantt__resize")).not.toBeNull();
    drag(build, 0, 60);
    expect(onUpdate).not.toHaveBeenCalled();
    drag(build.querySelector(".vf-gantt__resize") as HTMLElement, 0, 40);
    expect(onUpdate).toHaveBeenCalledWith({ id: "b", start: new Date(2026, 2, 6), end: new Date(2026, 2, 14) });
  });

  it("creates a dependency by dragging the link handle onto another row, skipping self and duplicates", () => {
    const onCreate = vi.fn<(d: GanttDependency) => void>();
    const { container } = renderWithTheme(
      <Gantt tasks={tasks} start={start} end={end} unitWidth={20} rowHeight={30} onDependencyCreate={onCreate} />
    );
    const rows = container.querySelector(".vf-gantt__rows") as HTMLElement;
    vi.spyOn(rows, "getBoundingClientRect").mockReturnValue({
      top: 100, left: 0, right: 600, bottom: 190, width: 600, height: 90, x: 0, y: 100, toJSON: () => ({}),
    } as DOMRect);
    const handle = screen.getByRole("button", { name: "Link from Design" });
    fireEvent.pointerDown(handle, { clientX: 300, clientY: 115, pointerId: 1 });
    fireEvent.pointerMove(window, { clientX: 320, clientY: 175, pointerId: 1 });
    expect(container.querySelector(".vf-gantt__dep--draft")).not.toBeNull();
    expect(container.querySelector('[data-task-id="c"]')).toHaveAttribute("data-link-target");
    fireEvent.pointerUp(window, { clientX: 320, clientY: 175, pointerId: 1 });
    expect(onCreate).toHaveBeenCalledTimes(1);
    expect(onCreate.mock.calls[0]![0].from.id).toBe("a");
    expect(onCreate.mock.calls[0]![0].to.id).toBe("c");
    // Dropping on the source row or an existing dependency does nothing.
    fireEvent.pointerDown(handle, { clientX: 300, clientY: 115, pointerId: 1 });
    fireEvent.pointerUp(window, { clientX: 300, clientY: 115, pointerId: 1 });
    fireEvent.pointerDown(handle, { clientX: 300, clientY: 115, pointerId: 1 });
    fireEvent.pointerUp(window, { clientX: 300, clientY: 145, pointerId: 1 }); // "b" already depends on "a"
    expect(onCreate).toHaveBeenCalledTimes(1);
  });

  it("creates a dependency with the keyboard: Enter on the handle, Enter on the target bar", () => {
    const onCreate = vi.fn<(d: GanttDependency) => void>();
    renderWithTheme(<Gantt tasks={tasks} start={start} end={end} onDependencyCreate={onCreate} />);
    const handle = screen.getByRole("button", { name: "Link from Build" });
    fireEvent.keyDown(handle, { key: "Enter" });
    expect(handle).toHaveAttribute("aria-pressed", "true");
    fireEvent.keyDown(bar("Launch"), { key: "Enter" });
    expect(onCreate).toHaveBeenCalledWith(expect.objectContaining({ from: expect.objectContaining({ id: "b" }), to: expect.objectContaining({ id: "c" }) }));
    expect(handle).toHaveAttribute("aria-pressed", "false");
  });

  it("dependency arrows are clickable when onDependencyClick is set", () => {
    const onClick = vi.fn<(d: GanttDependency) => void>();
    renderWithTheme(<Gantt tasks={tasks} start={start} end={end} onDependencyClick={onClick} />);
    const edge = screen.getByRole("button", { name: "Dependency: Design → Build" });
    fireEvent.click(edge);
    expect(onClick).toHaveBeenCalledWith(expect.objectContaining({ from: expect.objectContaining({ id: "a" }), to: expect.objectContaining({ id: "b" }) }));
  });

  it("nameColumnWidth, fitTasks and autoGranularity drive the layout", () => {
    const { container } = renderWithTheme(
      <Gantt tasks={tasks} fitTasks autoGranularity nameColumnWidth={240} unitWidth={10} data-testid="g" />
    );
    const g = screen.getByTestId("g");
    expect(g).toHaveClass("vf-gantt--day");
    expect(g.style.getPropertyValue("--vf-gantt-name-width")).toBe("240px");
    const timeline = container.querySelector(".vf-gantt__timeline") as HTMLElement;
    expect(timeline.style.gridTemplateColumns.startsWith("240px")).toBe(true);
    // Mar 1 → Mar 15 = 14 day columns.
    expect(container.querySelectorAll(".vf-gantt__tick")).toHaveLength(14);
  });

  it("formats headers with the provider locale", () => {
    const { container, unmount } = render(
      <VoidframeProvider localeTag="en-US">
        <Gantt tasks={tasks} start={new Date(2026, 2, 1)} end={new Date(2026, 2, 3)} />
      </VoidframeProvider>
    );
    expect(container.querySelector(".vf-gantt__tick")?.textContent).toBe("3/1");
    unmount();
    const de = render(
      <VoidframeProvider localeTag="de-DE">
        <Gantt tasks={tasks} start={new Date(2026, 2, 1)} end={new Date(2026, 2, 3)} />
      </VoidframeProvider>
    );
    expect(de.container.querySelector(".vf-gantt__tick")?.textContent).toBe("1.3.");
    de.unmount();
    const custom = render(
      <VoidframeProvider>
        <Gantt tasks={tasks} start={new Date(2026, 2, 1)} end={new Date(2026, 2, 3)} formatHeader={(d) => `D${d.getDate()}`} />
      </VoidframeProvider>
    );
    expect(custom.container.querySelector(".vf-gantt__tick")?.textContent).toBe("D1");
  });
});
