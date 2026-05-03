"use client";

// Phase 9 — Gantt
//
// Bar-on-timeline schedule view. Renders dependency arrows between linked
// tasks via an SVG overlay, and supports drag-to-move (whole bar) plus drag
// the right edge to resize. `onTaskUpdate` fires with the new dates.

import {
  forwardRef,
  memo,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { cx } from "../utils/cx";
import { toneAttrs } from "../utils/toneAttrs";
import { addDays } from "../utils/date";

export interface GanttTask {
  id: string;
  name: string;
  start: Date;
  end: Date;
  dependencies?: string[];
  tone?: "neutral" | "success" | "warning" | "danger" | "info";
  /** When true, render as a diamond milestone marker instead of a bar. */
  milestone?: boolean;
}

export type GanttGranularity = "day" | "week" | "month";

export interface GanttUpdate {
  id: string;
  start: Date;
  end: Date;
}

export interface GanttProps extends HTMLAttributes<HTMLDivElement> {
  tasks: GanttTask[];
  start: Date;
  end: Date;
  granularity?: GanttGranularity;
  /** Width per granularity unit, in px. Default depends on granularity. */
  unitWidth?: number;
  rowHeight?: number;
  onTaskClick?: (task: GanttTask) => void;
  onTaskUpdate?: (update: GanttUpdate) => void;
  /** Disable drag interactions. */
  readOnly?: boolean;
  /** Show a vertical marker line at today's date. Default true. */
  showToday?: boolean;
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

function unitsToMs(units: number, g: GanttGranularity): number {
  const days = g === "day" ? units : g === "week" ? units * 7 : units * 30;
  return days * 86400000;
}

/**
 * A horizontal timeline that renders tasks as bars across a day, week, or month axis.
 * Useful for schedule overviews, project plans, and resource-allocation views.
 */
const GanttImpl = forwardRef<HTMLDivElement, GanttProps>(function Gantt(
  {
    tasks,
    start,
    end,
    granularity = "day",
    unitWidth,
    rowHeight = 32,
    onTaskClick,
    onTaskUpdate,
    readOnly,
    showToday = true,
    className,
    style,
    ...props
  },
  ref
) {
  const totalUnits = Math.max(1, Math.ceil(unitsBetween(start, end, granularity)));
  const unitPx =
    unitWidth ?? (granularity === "day" ? 28 : granularity === "week" ? 48 : 80);

  // One column entry per unit — each represents the left edge of a track
  // slot. The tick renders under its slot, aligning 1:1 with bar positions.
  const columns = useMemo(() => {
    const out: Date[] = [];
    const stepDays = granularity === "day" ? 1 : granularity === "week" ? 7 : 30;
    let cursor = new Date(start);
    for (let i = 0; i < totalUnits; i++) {
      out.push(cursor);
      cursor = addDays(cursor, stepDays);
    }
    return out;
  }, [start, totalUnits, granularity]);

  const taskById = useMemo(() => {
    const map = new Map<string, GanttTask>();
    for (const t of tasks) map.set(t.id, t);
    return map;
  }, [tasks]);

  // Local task overrides during drag.
  const [draftTasks, setDraftTasks] = useState<Record<string, GanttTask>>({});
  const visibleTasks = tasks.map((t) => draftTasks[t.id] ?? t);
  const visibleById = useMemo(() => {
    const map = new Map<string, GanttTask>();
    for (const t of visibleTasks) map.set(t.id, t);
    return map;
  }, [visibleTasks]);

  const dragRef = useRef<{
    id: string;
    mode: "move" | "resize";
    startClientX: number;
    initialStart: Date;
    initialEnd: Date;
  } | null>(null);

  const beginDrag = (
    task: GanttTask,
    mode: "move" | "resize",
    e: ReactPointerEvent<HTMLElement>
  ) => {
    if (readOnly) return;
    e.stopPropagation();
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = {
      id: task.id,
      mode,
      startClientX: e.clientX,
      initialStart: task.start,
      initialEnd: task.end,
    };
    const onMove = (ev: PointerEvent) => {
      const d = dragRef.current;
      if (!d) return;
      const deltaPx = ev.clientX - d.startClientX;
      const deltaUnits = deltaPx / unitPx;
      const deltaMs = unitsToMs(deltaUnits, granularity);
      let nextStart = d.initialStart;
      let nextEnd = d.initialEnd;
      if (d.mode === "move") {
        nextStart = new Date(d.initialStart.getTime() + deltaMs);
        nextEnd = new Date(d.initialEnd.getTime() + deltaMs);
      } else {
        nextEnd = new Date(
          Math.max(d.initialStart.getTime() + 86400000, d.initialEnd.getTime() + deltaMs)
        );
      }
      setDraftTasks((prev) => ({
        ...prev,
        [d.id]: { ...task, start: nextStart, end: nextEnd },
      }));
    };
    const onUp = (ev: PointerEvent) => {
      const d = dragRef.current;
      if (d) {
        try {
          (e.currentTarget as HTMLElement).releasePointerCapture(ev.pointerId);
        } catch {
          /* noop */
        }
        // Recompute the final start/end from the captured initial state + pointer delta.
        // Do NOT read `draftTasks` from the outer render closure — that snapshot was
        // empty at the time beginDrag ran, so pulling from it misses every drag.
        const deltaMs = unitsToMs(
          (ev.clientX - d.startClientX) / unitPx,
          granularity
        );
        let finalStart = d.initialStart;
        let finalEnd = d.initialEnd;
        if (d.mode === "move") {
          finalStart = new Date(d.initialStart.getTime() + deltaMs);
          finalEnd = new Date(d.initialEnd.getTime() + deltaMs);
        } else {
          finalEnd = new Date(
            Math.max(
              d.initialStart.getTime() + 86400000,
              d.initialEnd.getTime() + deltaMs
            )
          );
        }
        if (onTaskUpdate) {
          onTaskUpdate({ id: d.id, start: finalStart, end: finalEnd });
        }
        // Clear local draft after the parent has a chance to commit.
        setDraftTasks((prev) => {
          const next = { ...prev };
          delete next[d.id];
          return next;
        });
        dragRef.current = null;
      }
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  // Pre-compute bar positions for use in dependency arrows.
  const positions = useMemo(() => {
    const out = new Map<
      string,
      { left: number; width: number; row: number; centerY: number }
    >();
    visibleTasks.forEach((task, row) => {
      const offset = Math.max(0, unitsBetween(start, task.start, granularity));
      const duration = Math.max(
        0.25,
        unitsBetween(task.start, task.end, granularity)
      );
      out.set(task.id, {
        left: offset * unitPx,
        width: duration * unitPx,
        row,
        centerY: row * rowHeight + rowHeight / 2,
      });
    });
    return out;
  }, [visibleTasks, start, granularity, unitPx, rowHeight]);

  const dependencyEdges = useMemo(() => {
    const out: Array<{ from: string; to: string }> = [];
    for (const task of visibleTasks) {
      for (const depId of task.dependencies ?? []) {
        if (visibleById.has(depId)) out.push({ from: depId, to: task.id });
      }
    }
    return out;
  }, [visibleTasks, visibleById]);

  const trackWidth = columns.length * unitPx;
  const trackHeight = visibleTasks.length * rowHeight;

  const todayX = useMemo(() => {
    if (!showToday) return null;
    const now = new Date();
    if (now < start || now > end) return null;
    return unitsBetween(start, now, granularity) * unitPx;
  }, [showToday, start, end, granularity, unitPx]);

  const composedStyle: CSSProperties = {
    ...({ "--vf-gantt-unit-px": `${unitPx}px` } as CSSProperties),
    ...style,
  };
  return (
    <div
      ref={ref}
      className={cx("vf-gantt", `vf-gantt--${granularity}`, className)}
      style={composedStyle}
      role="table"
      aria-label="Gantt chart"
      {...props}
    >
      <div
        className="vf-gantt__timeline"
        style={{
          display: "grid",
          gridTemplateColumns: `200px ${trackWidth}px`,
        }}
        role="rowgroup"
      >
        <div className="vf-gantt__corner" />
        <div
          className="vf-gantt__ticks"
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${columns.length}, ${unitPx}px)`,
          }}
        >
          {columns.map((c, i) => (
            <div key={i} className="vf-gantt__tick" role="columnheader">
              {formatHeader(c, granularity)}
            </div>
          ))}
        </div>
      </div>
      <div
        className="vf-gantt__rows"
        role="rowgroup"
        style={{
          display: "grid",
          gridTemplateColumns: `200px ${trackWidth}px`,
          // The dependency SVG overlays the track column via absolute
          // positioning, so the row container must establish a containing
          // block for it.
          position: "relative",
        }}
      >
        {visibleTasks.map((task) => {
          const pos = positions.get(task.id)!;
          return (
            <div
              key={task.id}
              role="row"
              className="vf-gantt__row"
              data-task-id={task.id}
              style={{ display: "contents" }}
            >
              <div role="cell" className="vf-gantt__name">
                {task.name}
              </div>
              <div
                role="cell"
                className="vf-gantt__track"
                style={{ height: rowHeight, position: "relative" }}
              >
                {task.milestone ? (
                  (() => {
                    const mTa = toneAttrs("vf-gantt__milestone", { tone: task.tone });
                    return (
                  <svg
                    className={mTa.className}
                    {...mTa.attrs}
                    style={{
                      position: "absolute",
                      top: 4,
                      left: `${pos.left - (rowHeight - 8) / 2}px`,
                      cursor: "pointer",
                    }}
                    width={rowHeight - 8}
                    height={rowHeight - 8}
                    viewBox="0 0 16 16"
                    role="button"
                    tabIndex={0}
                    aria-label={`Milestone: ${task.name} — ${task.start.toDateString()}`}
                    onClick={() => onTaskClick?.(task)}
                  >
                    <polygon points="8,0 16,8 8,16 0,8" fill="currentColor" />
                  </svg>
                    );
                  })()
                ) : (
                  <div
                    className={cx(
                      "vf-gantt__bar",
                      task.tone && `vf-gantt__bar--${task.tone}`
                    )}
                    data-tone={task.tone}
                    style={{
                      position: "absolute",
                      top: 4,
                      bottom: 4,
                      left: `${pos.left}px`,
                      width: `${pos.width}px`,
                      cursor: readOnly ? "pointer" : "grab",
                    }}
                    role="button"
                    tabIndex={0}
                    aria-label={`${task.name}: ${task.start.toDateString()} → ${task.end.toDateString()}`}
                    onPointerDown={(e) => beginDrag(task, "move", e)}
                    onClick={() => onTaskClick?.(task)}
                  >
                    <span className="vf-gantt__bar-label">{task.name}</span>
                    {!readOnly && (
                      <span
                        className="vf-gantt__resize"
                        role="separator"
                        aria-orientation="vertical"
                        aria-label={`Resize ${task.name}`}
                        onPointerDown={(e) => beginDrag(task, "resize", e)}
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {dependencyEdges.length > 0 && (
          <svg
            aria-hidden="true"
            className="vf-gantt__deps"
            style={{
              // Absolutely positioned so this overlay does not participate
              // in grid auto-placement (which would push the track cells
              // into rows below the SVG span).
              position: "absolute",
              top: 0,
              insetInlineStart: 200,
              width: trackWidth,
              height: trackHeight,
              pointerEvents: "none",
              zIndex: 1,
            }}
            width={trackWidth}
            height={trackHeight}
            viewBox={`0 0 ${trackWidth} ${trackHeight}`}
          >
            {dependencyEdges.map(({ from, to }, i) => {
              const a = positions.get(from)!;
              const b = positions.get(to)!;
              const startX = a.left + a.width;
              const startY = a.centerY;
              const endX = Math.max(a.left + a.width + 4, b.left);
              const endY = b.centerY;
              const midX = startX + Math.max(8, (endX - startX) / 2);
              return (
                <g key={i} className="vf-gantt__dep">
                  <path
                    d={`M ${startX} ${startY} L ${midX} ${startY} L ${midX} ${endY} L ${endX - 4} ${endY}`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  />
                  <polygon
                    points={`${endX - 4},${endY - 3} ${endX},${endY} ${endX - 4},${endY + 3}`}
                    fill="currentColor"
                  />
                </g>
              );
            })}
          </svg>
        )}
        {todayX !== null && (
          <svg
            aria-hidden="true"
            className="vf-gantt__today-layer"
            style={{
              position: "absolute",
              top: 0,
              insetInlineStart: 200,
              width: trackWidth,
              height: trackHeight,
              pointerEvents: "none",
              zIndex: 2,
            }}
            width={trackWidth}
            height={trackHeight}
            viewBox={`0 0 ${trackWidth} ${trackHeight}`}
          >
            <line
              className="vf-gantt__today"
              x1={todayX}
              y1={0}
              x2={todayX}
              y2={trackHeight}
            />
          </svg>
        )}
      </div>
    </div>
  );
});
GanttImpl.displayName = "Gantt";

/**
 * Gantt timeline. Memoized at the export site so parent re-renders
 * with referentially-stable `tasks` / `start` / `end` skip the
 * SVG-bar / dependency-line render walk.
 */
export const Gantt = memo(GanttImpl);
(Gantt as unknown as { displayName: string }).displayName = "Gantt";
