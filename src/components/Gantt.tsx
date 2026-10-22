"use client";

// Phase 9 — Gantt
//
// Bar-on-timeline schedule view. Renders dependency arrows between linked
// tasks via an SVG overlay, and supports drag-to-move (whole bar) plus drag
// the right edge to resize. `onTaskUpdate` fires with the new dates, snapped
// to whole days or weeks by default. Dependencies can be created by dragging
// a bar's link handle onto another row (or with the keyboard: Enter on the
// link handle, then Enter on the target bar) and inspected via
// `onDependencyClick`.

import {
  forwardRef,
  memo,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { cx } from "../utils/cx";
import type { Tone } from "../types";
import { toneAttrs } from "../utils/toneAttrs";
import { addDays, startOfDay } from "../utils/date";
import { useMessages } from "../i18n/MessagesProvider";

export interface GanttTask {
  id: string;
  name: string;
  start: Date;
  end: Date;
  /** Ids of the tasks this task depends on (arrows are drawn from them to this task). */
  dependencies?: string[];
  tone?: Tone;
  /** When true, render as a diamond milestone marker instead of a bar. */
  milestone?: boolean;
  /** Shortcut for `getTaskPermissions` returning `{ move: false, resize: false }`. */
  locked?: boolean;
}

export type GanttGranularity = "day" | "week" | "month";

/** Snap unit for drag results. `"none"` keeps the continuous pointer delta. */
export type GanttSnap = "day" | "week" | "none";

export interface GanttUpdate {
  id: string;
  start: Date;
  end: Date;
}

export interface GanttTaskPermissions {
  /** Whether the bar may be dragged to a new start. Default true. */
  move?: boolean;
  /** Whether the bar's end may be dragged. Default true. */
  resize?: boolean;
  /** Whether a dependency may be created from or to this task. Default true. */
  link?: boolean;
}

export interface GanttDependency {
  /** The task depended on; the arrow starts at its end. */
  from: GanttTask;
  /** The dependent task; the arrow points at its start. */
  to: GanttTask;
}

export interface GanttProps extends HTMLAttributes<HTMLDivElement> {
  tasks: GanttTask[];
  /** Range start. Optional when `fitTasks` is set. */
  start?: Date;
  /** Range end. Optional when `fitTasks` is set. */
  end?: Date;
  /** Axis unit. When omitted and `autoGranularity` is set, chosen from the range. Default `"day"`. */
  granularity?: GanttGranularity;
  /**
   * Derive the visible range from the tasks (earliest start to latest end,
   * padded by one unit on each side). Explicit `start`/`end` still win.
   */
  fitTasks?: boolean;
  /**
   * Pick the granularity from the range length when `granularity` is
   * omitted: up to 60 days → day, up to 400 days → week, else month.
   */
  autoGranularity?: boolean;
  /** Width per granularity unit, in px. Default depends on granularity. */
  unitWidth?: number;
  rowHeight?: number;
  /** Width of the task-name column. Default 200. */
  nameColumnWidth?: number | string;
  /**
   * Snap drag results to whole units. Default `"day"`; `"week"` snaps to
   * week starts (the provider's `firstDayOfWeek`); `"none"` emits the raw
   * pointer delta.
   */
  snapTo?: GanttSnap;
  /**
   * Per-task interaction permissions. A task that cannot move renders with
   * a pointer cursor and ignores bar drags; one that cannot resize hides its
   * resize handle. `task.locked` is the shorthand for both false.
   */
  getTaskPermissions?: (task: GanttTask) => GanttTaskPermissions | undefined;
  onTaskClick?: (task: GanttTask) => void;
  onTaskUpdate?: (update: GanttUpdate) => void;
  /**
   * Enables dependency creation: each bar gets a link handle at its end;
   * drag it onto another task's row (or press Enter on it, then Enter on
   * the target bar). Called with `from` (the dependency) and `to` (the
   * dependent task); add `from.id` to `to.dependencies` to persist.
   */
  onDependencyCreate?: (dependency: GanttDependency) => void;
  /** Called when a dependency arrow is clicked (to remove or inspect it). */
  onDependencyClick?: (dependency: GanttDependency) => void;
  /** Override the column header text. Defaults to a locale-aware `Intl.DateTimeFormat`. */
  formatHeader?: (date: Date, granularity: GanttGranularity) => string;
  /** Disable drag interactions. */
  readOnly?: boolean;
  /** Show a vertical marker line at today's date. Default true. */
  showToday?: boolean;
  style?: CSSProperties;
}

const DAY_MS = 86400000;

function unitsBetween(a: Date, b: Date, g: GanttGranularity): number {
  const days = (b.getTime() - a.getTime()) / DAY_MS;
  if (g === "day") return days;
  if (g === "week") return days / 7;
  return days / 30;
}

function unitsToMs(units: number, g: GanttGranularity): number {
  const days = g === "day" ? units : g === "week" ? units * 7 : units * 30;
  return days * DAY_MS;
}

function defaultHeaderFormatter(
  locale: string,
  timeZone: string | undefined
): (date: Date, g: GanttGranularity) => string {
  const opts = (o: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat(locale, timeZone ? { ...o, timeZone } : o);
  let day: Intl.DateTimeFormat | null = null;
  let week: Intl.DateTimeFormat | null = null;
  let month: Intl.DateTimeFormat | null = null;
  return (date, g) => {
    try {
      if (g === "day") return (day ??= opts({ month: "numeric", day: "numeric" })).format(date);
      if (g === "week") return (week ??= opts({ month: "short", day: "numeric" })).format(date);
      return (month ??= opts({ month: "short" })).format(date);
    } catch {
      return g === "month" ? String(date.getMonth() + 1) : `${date.getMonth() + 1}/${date.getDate()}`;
    }
  };
}

/** Snap a date to the nearest day start, or to the nearest week start. */
export function snapDate(date: Date, snap: GanttSnap, firstDayOfWeek = 0): Date {
  if (snap === "none") return date;
  const day = startOfDay(date);
  // Nearest day boundary: round by the fraction of the day elapsed.
  const fraction = (date.getTime() - day.getTime()) / DAY_MS;
  const nearestDay = fraction >= 0.5 ? addDays(day, 1) : day;
  if (snap === "day") return nearestDay;
  const offset = (nearestDay.getDay() - firstDayOfWeek + 7) % 7;
  const weekStart = addDays(nearestDay, -offset);
  return offset >= 4 ? addDays(weekStart, 7) : weekStart;
}

/** Pick a granularity from a range length (see `autoGranularity`). */
export function pickGranularity(start: Date, end: Date): GanttGranularity {
  const days = (end.getTime() - start.getTime()) / DAY_MS;
  if (days <= 60) return "day";
  if (days <= 400) return "week";
  return "month";
}

/** Earliest start to latest end across tasks, padded by one unit on each side. */
export function fitTaskRange(
  tasks: readonly GanttTask[],
  granularity?: GanttGranularity
): { start: Date; end: Date } {
  if (tasks.length === 0) {
    const today = startOfDay(new Date());
    return { start: today, end: addDays(today, 14) };
  }
  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;
  for (const t of tasks) {
    min = Math.min(min, t.start.getTime());
    max = Math.max(max, t.end.getTime());
  }
  const rawStart = startOfDay(new Date(min));
  const rawEnd = startOfDay(new Date(max));
  const g = granularity ?? pickGranularity(rawStart, rawEnd);
  const padDays = g === "day" ? 1 : g === "week" ? 7 : 30;
  return { start: addDays(rawStart, -padDays), end: addDays(rawEnd, padDays) };
}

/**
 * A horizontal timeline that renders tasks as bars across a day, week, or month axis.
 * Useful for schedule overviews, project plans, and resource-allocation views.
 */
const GanttImpl = forwardRef<HTMLDivElement, GanttProps>(function Gantt(
  {
    tasks,
    start: startProp,
    end: endProp,
    granularity: granularityProp,
    fitTasks,
    autoGranularity,
    unitWidth,
    rowHeight = 32,
    nameColumnWidth = 200,
    snapTo = "day",
    getTaskPermissions,
    onTaskClick,
    onTaskUpdate,
    onDependencyCreate,
    onDependencyClick,
    formatHeader: formatHeaderProp,
    readOnly,
    showToday = true,
    className,
    style,
    ...props
  },
  ref
) {
  const { locale, timeZone, firstDayOfWeek } = useMessages();

  const range = useMemo(() => {
    if (startProp && endProp && !fitTasks) return { start: startProp, end: endProp };
    const fitted = fitTasks || !startProp || !endProp ? fitTaskRange(tasks, granularityProp) : null;
    return {
      start: startProp ?? fitted!.start,
      end: endProp ?? fitted!.end,
    };
  }, [startProp, endProp, fitTasks, tasks, granularityProp]);
  const start = range.start;
  const end = range.end;
  const granularity: GanttGranularity =
    granularityProp ?? (autoGranularity ? pickGranularity(start, end) : "day");

  const formatHeader = useMemo(
    () => formatHeaderProp ?? defaultHeaderFormatter(locale, timeZone),
    [formatHeaderProp, locale, timeZone]
  );

  const totalUnits = Math.max(1, Math.ceil(unitsBetween(start, end, granularity)));
  const unitPx =
    unitWidth ?? (granularity === "day" ? 28 : granularity === "week" ? 48 : 80);
  const nameWidth =
    typeof nameColumnWidth === "number" ? `${nameColumnWidth}px` : nameColumnWidth;

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

  const permissionsOf = (task: GanttTask): Required<GanttTaskPermissions> => {
    const p = getTaskPermissions?.(task);
    const lockedDefault = task.locked ? false : true;
    return {
      move: !readOnly && (p?.move ?? lockedDefault),
      resize: !readOnly && (p?.resize ?? lockedDefault),
      link: !readOnly && Boolean(onDependencyCreate) && (p?.link ?? true),
    };
  };

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

  const applyDelta = (
    d: { mode: "move" | "resize"; initialStart: Date; initialEnd: Date },
    deltaPx: number
  ): { start: Date; end: Date } => {
    const deltaMs = unitsToMs(deltaPx / unitPx, granularity);
    if (d.mode === "move") {
      const rawStart = new Date(d.initialStart.getTime() + deltaMs);
      const snapped = snapDate(rawStart, snapTo, firstDayOfWeek);
      const duration = d.initialEnd.getTime() - d.initialStart.getTime();
      return { start: snapped, end: new Date(snapped.getTime() + duration) };
    }
    const minEnd = d.initialStart.getTime() + (snapTo === "week" ? 7 * DAY_MS : DAY_MS);
    const rawEnd = new Date(Math.max(minEnd, d.initialEnd.getTime() + deltaMs));
    const snapped = snapDate(rawEnd, snapTo, firstDayOfWeek);
    return {
      start: d.initialStart,
      end: snapped.getTime() < minEnd ? new Date(minEnd) : snapped,
    };
  };

  const beginDrag = (
    task: GanttTask,
    mode: "move" | "resize",
    e: ReactPointerEvent<HTMLElement>
  ) => {
    if (readOnly) return;
    const perms = permissionsOf(task);
    if (mode === "move" && !perms.move) return;
    if (mode === "resize" && !perms.resize) return;
    e.stopPropagation();
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
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
      const next = applyDelta(d, ev.clientX - d.startClientX);
      setDraftTasks((prev) => ({
        ...prev,
        [d.id]: { ...task, start: next.start, end: next.end },
      }));
    };
    const onUp = (ev: PointerEvent) => {
      const d = dragRef.current;
      if (d) {
        try {
          (e.currentTarget as HTMLElement).releasePointerCapture?.(ev.pointerId);
        } catch {
          /* noop */
        }
        // Recompute the final start/end from the captured initial state + pointer delta.
        // Do NOT read `draftTasks` from the outer render closure — that snapshot was
        // empty at the time beginDrag ran, so pulling from it misses every drag.
        const final = applyDelta(d, ev.clientX - d.startClientX);
        if (
          onTaskUpdate &&
          (final.start.getTime() !== d.initialStart.getTime() ||
            final.end.getTime() !== d.initialEnd.getTime())
        ) {
          onTaskUpdate({ id: d.id, start: final.start, end: final.end });
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

  // ── Dependency creation ───────────────────────────────────────
  const rowsRef = useRef<HTMLDivElement>(null);
  const [linkDraft, setLinkDraft] = useState<{
    fromId: string;
    x: number;
    y: number;
    targetId: string | null;
  } | null>(null);
  // Keyboard linking: the armed source task.
  const [armedLink, setArmedLink] = useState<string | null>(null);

  const taskAtRow = (clientY: number): GanttTask | null => {
    const rows = rowsRef.current;
    if (!rows) return null;
    const rect = rows.getBoundingClientRect();
    const row = Math.floor((clientY - rect.top) / rowHeight);
    return visibleTasks[row] ?? null;
  };

  const commitLink = (from: GanttTask, to: GanttTask) => {
    if (from.id === to.id) return;
    if (!permissionsOf(to).link) return;
    if ((to.dependencies ?? []).includes(from.id)) return;
    onDependencyCreate?.({ from, to });
  };

  const beginLink = (task: GanttTask, e: ReactPointerEvent<HTMLElement>) => {
    if (!permissionsOf(task).link) return;
    e.stopPropagation();
    e.preventDefault();
    const rows = rowsRef.current;
    const toLocal = (ev: { clientX: number; clientY: number }) => {
      const rect = rows?.getBoundingClientRect();
      const nameOffset = rows ? rows.querySelector(".vf-gantt__track")?.getBoundingClientRect().left ?? rect!.left : 0;
      return { x: ev.clientX - nameOffset, y: ev.clientY - (rect?.top ?? 0) };
    };
    const startLocal = toLocal(e);
    setLinkDraft({ fromId: task.id, x: startLocal.x, y: startLocal.y, targetId: null });
    const onMove = (ev: PointerEvent) => {
      const local = toLocal(ev);
      const target = taskAtRow(ev.clientY);
      setLinkDraft({
        fromId: task.id,
        x: local.x,
        y: local.y,
        targetId: target && target.id !== task.id ? target.id : null,
      });
    };
    const onUp = (ev: PointerEvent) => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      const target = taskAtRow(ev.clientY);
      setLinkDraft(null);
      if (target) commitLink(task, target);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  const onBarKeyDown = (task: GanttTask, e: ReactKeyboardEvent<Element>) => {
    if (e.key === "Escape" && armedLink) {
      e.preventDefault();
      setArmedLink(null);
      return;
    }
    if ((e.key === "Enter" || e.key === " ") && armedLink && armedLink !== task.id) {
      e.preventDefault();
      const from = visibleById.get(armedLink);
      if (from) commitLink(from, task);
      setArmedLink(null);
      return;
    }
    if (e.key === "Enter" || e.key === " ") {
      if (e.target !== e.currentTarget) return;
      e.preventDefault();
      onTaskClick?.(task);
    }
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

  // Edges whose dependency is not in `tasks` are not drawn: there is no bar
  // to start the arrow from. Filter tasks consistently if that matters.
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
    ...({
      "--vf-gantt-unit-px": `${unitPx}px`,
      "--vf-gantt-name-width": nameWidth,
    } as CSSProperties),
    ...style,
  };
  const linkSource = linkDraft ? positions.get(linkDraft.fromId) : null;
  const showDepsLayer = dependencyEdges.length > 0 || (linkDraft && linkSource);
  return (
    <div
      ref={ref}
      className={cx(
        "vf-gantt",
        `vf-gantt--${granularity}`,
        linkDraft && "vf-gantt--linking",
        className
      )}
      style={composedStyle}
      role="table"
      aria-label="Gantt chart"
      data-snap={snapTo}
      {...props}
    >
      <div
        className="vf-gantt__timeline"
        style={{
          display: "grid",
          gridTemplateColumns: `${nameWidth} ${trackWidth}px`,
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
        ref={rowsRef}
        className="vf-gantt__rows"
        role="rowgroup"
        style={{
          display: "grid",
          gridTemplateColumns: `${nameWidth} ${trackWidth}px`,
          // The dependency SVG overlays the track column via absolute
          // positioning, so the row container must establish a containing
          // block for it.
          position: "relative",
        }}
      >
        {visibleTasks.map((task) => {
          const pos = positions.get(task.id)!;
          const perms = permissionsOf(task);
          const isLinkTarget = linkDraft?.targetId === task.id;
          return (
            <div
              key={task.id}
              role="row"
              className="vf-gantt__row"
              data-task-id={task.id}
              data-link-target={isLinkTarget || undefined}
              style={{ display: "contents" }}
            >
              <div role="cell" className="vf-gantt__name">
                {task.name}
              </div>
              <div
                role="cell"
                className={cx("vf-gantt__track", isLinkTarget && "vf-gantt__track--link-target")}
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
                    onKeyDown={(e) => onBarKeyDown(task, e)}
                  >
                    <polygon points="8,0 16,8 8,16 0,8" fill="currentColor" />
                  </svg>
                    );
                  })()
                ) : (
                  <div
                    className={cx(
                      "vf-gantt__bar",
                      task.tone && `vf-gantt__bar--${task.tone}`,
                      !perms.move && "vf-gantt__bar--fixed",
                      armedLink === task.id && "vf-gantt__bar--link-source"
                    )}
                    data-tone={task.tone}
                    data-locked={!perms.move && !perms.resize ? "" : undefined}
                    style={{
                      position: "absolute",
                      top: 4,
                      bottom: 4,
                      left: `${pos.left}px`,
                      width: `${pos.width}px`,
                      cursor: perms.move ? "grab" : "pointer",
                    }}
                    role="button"
                    tabIndex={0}
                    aria-label={`${task.name}: ${task.start.toDateString()} → ${task.end.toDateString()}${
                      perms.move ? "" : " (fixed)"
                    }`}
                    onPointerDown={(e) => beginDrag(task, "move", e)}
                    onClick={() => onTaskClick?.(task)}
                    onKeyDown={(e) => onBarKeyDown(task, e)}
                  >
                    <span className="vf-gantt__bar-label">{task.name}</span>
                    {perms.resize && (
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
                {perms.link && !task.milestone ? (
                  <span
                    className="vf-gantt__link"
                    role="button"
                    tabIndex={0}
                    aria-label={`Link from ${task.name}`}
                    aria-pressed={armedLink === task.id}
                    style={{ left: `${pos.left + pos.width}px` }}
                    onPointerDown={(e) => beginLink(task, e)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        e.stopPropagation();
                        setArmedLink((cur) => (cur === task.id ? null : task.id));
                      } else if (e.key === "Escape") {
                        setArmedLink(null);
                      }
                    }}
                  />
                ) : null}
              </div>
            </div>
          );
        })}
        {showDepsLayer && (
          <svg
            aria-hidden={onDependencyClick ? undefined : "true"}
            className="vf-gantt__deps"
            style={{
              // Absolutely positioned so this overlay does not participate
              // in grid auto-placement (which would push the track cells
              // into rows below the SVG span).
              position: "absolute",
              top: 0,
              insetInlineStart: nameWidth,
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
              const d = `M ${startX} ${startY} L ${midX} ${startY} L ${midX} ${endY} L ${endX - 4} ${endY}`;
              const fromTask = visibleById.get(from)!;
              const toTask = visibleById.get(to)!;
              const clickable = Boolean(onDependencyClick);
              return (
                <g
                  key={i}
                  className={cx("vf-gantt__dep", clickable && "vf-gantt__dep--clickable")}
                  data-from={from}
                  data-to={to}
                  role={clickable ? "button" : undefined}
                  tabIndex={clickable ? 0 : undefined}
                  aria-label={clickable ? `Dependency: ${fromTask.name} → ${toTask.name}` : undefined}
                  style={clickable ? { pointerEvents: "visibleStroke", cursor: "pointer" } : undefined}
                  onClick={clickable ? () => onDependencyClick?.({ from: fromTask, to: toTask }) : undefined}
                  onKeyDown={
                    clickable
                      ? (e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            onDependencyClick?.({ from: fromTask, to: toTask });
                          }
                        }
                      : undefined
                  }
                >
                  {clickable ? (
                    <path className="vf-gantt__dep-hit" d={d} fill="none" stroke="transparent" strokeWidth={10} />
                  ) : null}
                  <path
                    d={d}
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
            {linkDraft && linkSource ? (
              <path
                className="vf-gantt__dep vf-gantt__dep--draft"
                d={`M ${linkSource.left + linkSource.width} ${linkSource.centerY} L ${linkDraft.x} ${linkDraft.y}`}
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                strokeDasharray="4 3"
              />
            ) : null}
          </svg>
        )}
        {todayX !== null && (
          <svg
            aria-hidden="true"
            className="vf-gantt__today-layer"
            style={{
              position: "absolute",
              top: 0,
              insetInlineStart: nameWidth,
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
