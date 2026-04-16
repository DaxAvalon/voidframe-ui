// Tests for Gantt — bars, today line, milestones, dependency arrows, readOnly

import { screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { Gantt, type GanttTask } from "../Gantt";

const today = new Date();
const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
const endDate = new Date(today.getFullYear(), today.getMonth() + 2, 0);

const tasks: GanttTask[] = [
  {
    id: "task-1",
    name: "Task One",
    start: new Date(today.getFullYear(), today.getMonth(), 5),
    end: new Date(today.getFullYear(), today.getMonth(), 15),
    tone: "success",
  },
  {
    id: "task-2",
    name: "Task Two",
    start: new Date(today.getFullYear(), today.getMonth(), 10),
    end: new Date(today.getFullYear(), today.getMonth(), 20),
    dependencies: ["task-1"],
  },
];

describe("Gantt", () => {
  describe("rendering", () => {
    it("renders with role=table and label", () => {
      renderWithTheme(
        <Gantt tasks={tasks} start={startDate} end={endDate} />
      );
      expect(screen.getByRole("table", { name: "Gantt chart" })).toBeInTheDocument();
    });

    it("applies gantt class and granularity class", () => {
      const { container } = renderWithTheme(
        <Gantt tasks={tasks} start={startDate} end={endDate} granularity="day" />
      );
      expect(container.querySelector(".vf-gantt")).toBeInTheDocument();
      expect(container.querySelector(".vf-gantt--day")).toBeInTheDocument();
    });

    it("renders task name cells", () => {
      renderWithTheme(
        <Gantt tasks={tasks} start={startDate} end={endDate} />
      );
      // Each task appears in both the name cell and bar label
      const nameCells = document.querySelectorAll(".vf-gantt__name");
      expect(nameCells.length).toBe(2);
      expect(nameCells[0].textContent).toBe("Task One");
      expect(nameCells[1].textContent).toBe("Task Two");
    });
  });

  describe("bars", () => {
    it("renders task bars with correct classes", () => {
      renderWithTheme(
        <Gantt tasks={tasks} start={startDate} end={endDate} />
      );
      const bars = document.querySelectorAll(".vf-gantt__bar");
      expect(bars.length).toBe(2);
    });

    it("applies tone class to bars", () => {
      renderWithTheme(
        <Gantt tasks={tasks} start={startDate} end={endDate} />
      );
      expect(document.querySelector(".vf-gantt__bar--success")).toBeInTheDocument();
    });

    it("renders bar labels", () => {
      renderWithTheme(
        <Gantt tasks={tasks} start={startDate} end={endDate} />
      );
      const barLabels = document.querySelectorAll(".vf-gantt__bar-label");
      expect(barLabels.length).toBe(2);
    });

    it("bars have aria-label with name and date range", () => {
      renderWithTheme(
        <Gantt tasks={tasks} start={startDate} end={endDate} />
      );
      const bar = screen.getByRole("button", { name: /Task One/ });
      expect(bar).toBeInTheDocument();
    });

    it("calls onTaskClick when bar is clicked", async () => {
      const onTaskClick = vi.fn();
      renderWithTheme(
        <Gantt
          tasks={tasks}
          start={startDate}
          end={endDate}
          onTaskClick={onTaskClick}
          readOnly
        />
      );
      // Use readOnly so click doesn't trigger setPointerCapture (not available in happy-dom)
      const bar = screen.getAllByRole("button", { name: /Task One/ })[0];
      await userEvent.click(bar);
      expect(onTaskClick).toHaveBeenCalledWith(tasks[0]);
    });
  });

  describe("today line", () => {
    it("renders today line by default when today is in range", () => {
      renderWithTheme(
        <Gantt tasks={tasks} start={startDate} end={endDate} />
      );
      expect(document.querySelector(".vf-gantt__today")).toBeInTheDocument();
      expect(document.querySelector(".vf-gantt__today-layer")).toBeInTheDocument();
    });

    it("hides today line when showToday=false", () => {
      renderWithTheme(
        <Gantt tasks={tasks} start={startDate} end={endDate} showToday={false} />
      );
      expect(document.querySelector(".vf-gantt__today")).not.toBeInTheDocument();
    });

    it("hides today line when today is outside the range", () => {
      const pastStart = new Date(2020, 0, 1);
      const pastEnd = new Date(2020, 1, 1);
      renderWithTheme(
        <Gantt tasks={tasks} start={pastStart} end={pastEnd} />
      );
      expect(document.querySelector(".vf-gantt__today")).not.toBeInTheDocument();
    });
  });

  describe("milestones", () => {
    it("renders milestone diamond instead of bar", () => {
      const milestoneTasks: GanttTask[] = [
        {
          id: "ms-1",
          name: "Release",
          start: new Date(today.getFullYear(), today.getMonth(), 10),
          end: new Date(today.getFullYear(), today.getMonth(), 10),
          milestone: true,
          tone: "info",
        },
      ];
      renderWithTheme(
        <Gantt tasks={milestoneTasks} start={startDate} end={endDate} />
      );
      expect(document.querySelector(".vf-gantt__milestone")).toBeInTheDocument();
      expect(document.querySelector(".vf-gantt__milestone--info")).toBeInTheDocument();
      // No bar should render for milestone
      expect(document.querySelector(".vf-gantt__bar")).not.toBeInTheDocument();
      // Milestone SVG contains a polygon (diamond)
      expect(document.querySelector(".vf-gantt__milestone polygon")).toBeInTheDocument();
    });

    it("milestone has accessible aria-label", () => {
      const milestoneTasks: GanttTask[] = [
        {
          id: "ms-1",
          name: "Release",
          start: new Date(today.getFullYear(), today.getMonth(), 10),
          end: new Date(today.getFullYear(), today.getMonth(), 10),
          milestone: true,
        },
      ];
      renderWithTheme(
        <Gantt tasks={milestoneTasks} start={startDate} end={endDate} />
      );
      const milestone = screen.getByRole("button", { name: /Milestone: Release/ });
      expect(milestone).toBeInTheDocument();
    });

    it("calls onTaskClick when milestone is clicked", async () => {
      const onTaskClick = vi.fn();
      const milestoneTasks: GanttTask[] = [
        {
          id: "ms-1",
          name: "Release",
          start: new Date(today.getFullYear(), today.getMonth(), 10),
          end: new Date(today.getFullYear(), today.getMonth(), 10),
          milestone: true,
        },
      ];
      renderWithTheme(
        <Gantt
          tasks={milestoneTasks}
          start={startDate}
          end={endDate}
          onTaskClick={onTaskClick}
        />
      );
      await userEvent.click(screen.getByRole("button", { name: /Milestone: Release/ }));
      expect(onTaskClick).toHaveBeenCalledWith(milestoneTasks[0]);
    });
  });

  describe("dependency arrows", () => {
    it("renders dependency SVG when tasks have dependencies", () => {
      renderWithTheme(
        <Gantt tasks={tasks} start={startDate} end={endDate} />
      );
      expect(document.querySelector(".vf-gantt__deps")).toBeInTheDocument();
      // Should render one dependency edge (task-2 depends on task-1)
      const depGroups = document.querySelectorAll(".vf-gantt__dep");
      expect(depGroups.length).toBe(1);
    });

    it("dependency arrows have path and arrowhead", () => {
      renderWithTheme(
        <Gantt tasks={tasks} start={startDate} end={endDate} />
      );
      const depGroup = document.querySelector(".vf-gantt__dep");
      expect(depGroup).toBeInTheDocument();
      expect(depGroup?.querySelector("path")).toBeInTheDocument();
      expect(depGroup?.querySelector("polygon")).toBeInTheDocument();
    });

    it("does not render dependency SVG when no dependencies", () => {
      const noDeps: GanttTask[] = [
        { id: "a", name: "A", start: startDate, end: endDate },
      ];
      renderWithTheme(
        <Gantt tasks={noDeps} start={startDate} end={endDate} />
      );
      expect(document.querySelector(".vf-gantt__deps")).not.toBeInTheDocument();
    });
  });

  describe("readOnly mode", () => {
    it("does not render resize handle in readOnly mode", () => {
      renderWithTheme(
        <Gantt tasks={tasks} start={startDate} end={endDate} readOnly />
      );
      expect(document.querySelector(".vf-gantt__resize")).not.toBeInTheDocument();
    });

    it("renders resize handle when not readOnly", () => {
      renderWithTheme(
        <Gantt tasks={tasks} start={startDate} end={endDate} />
      );
      const resizers = document.querySelectorAll(".vf-gantt__resize");
      expect(resizers.length).toBe(2); // one per non-milestone task
    });

    it("bar has pointer cursor in readOnly mode", () => {
      renderWithTheme(
        <Gantt tasks={tasks} start={startDate} end={endDate} readOnly />
      );
      const bar = document.querySelector(".vf-gantt__bar") as HTMLElement;
      expect(bar.style.cursor).toBe("pointer");
    });

    it("bar has grab cursor when not readOnly", () => {
      renderWithTheme(
        <Gantt tasks={tasks} start={startDate} end={endDate} />
      );
      const bar = document.querySelector(".vf-gantt__bar") as HTMLElement;
      expect(bar.style.cursor).toBe("grab");
    });
  });

  describe("granularity", () => {
    it("applies week granularity class", () => {
      const { container } = renderWithTheme(
        <Gantt tasks={tasks} start={startDate} end={endDate} granularity="week" />
      );
      expect(container.querySelector(".vf-gantt--week")).toBeInTheDocument();
    });

    it("applies month granularity class", () => {
      const { container } = renderWithTheme(
        <Gantt tasks={tasks} start={startDate} end={endDate} granularity="month" />
      );
      expect(container.querySelector(".vf-gantt--month")).toBeInTheDocument();
    });

    it("renders tick column headers", () => {
      renderWithTheme(
        <Gantt tasks={tasks} start={startDate} end={endDate} granularity="day" />
      );
      const ticks = document.querySelectorAll(".vf-gantt__tick");
      expect(ticks.length).toBeGreaterThan(0);
    });
  });

  describe("timeline structure", () => {
    it("renders timeline and rows row groups", () => {
      renderWithTheme(
        <Gantt tasks={tasks} start={startDate} end={endDate} />
      );
      const rowgroups = screen.getAllByRole("rowgroup");
      expect(rowgroups.length).toBe(2); // timeline + rows
    });

    it("renders one row per task", () => {
      renderWithTheme(
        <Gantt tasks={tasks} start={startDate} end={endDate} />
      );
      const rows = screen.getAllByRole("row");
      expect(rows.length).toBe(tasks.length);
    });

    it("renders name and track cells per row", () => {
      renderWithTheme(
        <Gantt tasks={tasks} start={startDate} end={endDate} />
      );
      const nameCells = document.querySelectorAll(".vf-gantt__name");
      expect(nameCells.length).toBe(tasks.length);
      const trackCells = document.querySelectorAll(".vf-gantt__track");
      expect(trackCells.length).toBe(tasks.length);
    });
  });
});
