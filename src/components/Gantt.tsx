// Phase 9 — Gantt (minimal)
//
// Bar-on-timeline chart for task schedules. Not a full project-management
// grid; rendering only. `granularity` controls the width of each column.

import {
  forwardRef,
  useMemo,
  type CSSProperties,
  type HTMLAttributes,
} from "react";
import { cx } from "../utils/cx";
import { addDays } from "../utils/date";

export interface GanttTask {
  id: string;
  name: string;
  start: Date;
  end: Date;
  dependencies?: string[];
  tone?: "neutral" | "success" | "warning" | "danger" | "info";
}

export type GanttGranularity = "day" | "week" | "month";

export interface GanttProps extends HTMLAttributes<HTMLDivElement> {
  tasks: GanttTask[];
  start: Date;
  end: Date;
  granularity?: GanttGranularity;
  onTaskClick?: (task: GanttTask) => void;
  style?: CSSProperties;
}

function unitsBetween(a: Date, b: Date, g: GanttGranularity): number {
  const days = (b.getTime() - a.getTime()) / 86400000;
  if (g === "day") return days;
  if (g === "week") return days / 7;
  return days / 30;
}

function formatHeader(date: Date, g: GanttGranularity): string {
  if (g === "day") return `${date.getMonth() + 1}/${date.getDate()}`;
  if (g === "week") return `W${Math.ceil(date.getDate() / 7)}`;
  return date.toLocaleString("default", { month: "short" });
}

export const Gantt = forwardRef<HTMLDivElement, GanttProps>(function Gantt(
  { tasks, start, end, granularity = "day", onTaskClick, className, style, ...props },
  ref
) {
  const totalUnits = Math.max(1, Math.ceil(unitsBetween(start, end, granularity)));
  const unitPx =
    granularity === "day" ? 28 : granularity === "week" ? 48 : 80;

  const columns = useMemo(() => {
    const out: Date[] = [];
    const stepDays = granularity === "day" ? 1 : granularity === "week" ? 7 : 30;
    let cursor = new Date(start);
    for (let i = 0; i <= totalUnits; i++) {
      out.push(cursor);
      cursor = addDays(cursor, stepDays);
    }
    return out;
  }, [start, totalUnits, granularity]);

  return (
    <div
      ref={ref}
      className={cx("vf-gantt", `vf-gantt--${granularity}`, className)}
      style={style}
      role="table"
      aria-label="Gantt chart"
      {...props}
    >
      <div
        className="vf-gantt__timeline"
        style={{
          display: "grid",
          gridTemplateColumns: `200px repeat(${columns.length}, ${unitPx}px)`,
        }}
        role="rowgroup"
      >
        <div className="vf-gantt__corner" />
        {columns.map((c, i) => (
          <div key={i} className="vf-gantt__tick" role="columnheader">
            {formatHeader(c, granularity)}
          </div>
        ))}
      </div>
      <div
        className="vf-gantt__rows"
        role="rowgroup"
        style={{
          display: "grid",
          gridTemplateColumns: `200px repeat(${columns.length}, ${unitPx}px)`,
        }}
      >
        {tasks.map((task) => {
          const offset = Math.max(0, unitsBetween(start, task.start, granularity));
          const duration = Math.max(
            0.25,
            unitsBetween(task.start, task.end, granularity)
          );
          return (
            <div
              key={task.id}
              role="row"
              className="vf-gantt__row"
              style={{ display: "contents" }}
            >
              <div role="cell" className="vf-gantt__name">
                {task.name}
              </div>
              <div
                role="cell"
                className="vf-gantt__track"
                style={{ gridColumn: `2 / span ${columns.length}` }}
              >
                <button
                  type="button"
                  className={cx(
                    "vf-gantt__bar",
                    task.tone && `vf-gantt__bar--${task.tone}`
                  )}
                  style={{
                    left: `${offset * unitPx}px`,
                    width: `${duration * unitPx}px`,
                  }}
                  aria-label={`${task.name}: ${task.start.toDateString()} → ${task.end.toDateString()}`}
                  onClick={onTaskClick ? () => onTaskClick(task) : undefined}
                >
                  <span className="vf-gantt__bar-label">{task.name}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});
Gantt.displayName = "Gantt";
