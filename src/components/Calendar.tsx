// Phase 9 — Calendar (view-only display)
//
// Three views:
//   - month: 6×7 day grid with event chips.
//   - week: 7-column, 24-hour grid with events positioned by hour/minute.
//   - day: single-column, 24-hour grid.
//
// Emits onRangeChange whenever the visible range shifts (month/week/day nav).

import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { cx } from "../utils/cx";
import {
  addDays,
  addMonths,
  getMonthGrid,
  isSameDay,
  isSameMonth,
  monthName,
  startOfDay,
  startOfMonth,
  weekdayNames,
} from "../utils/date";
import { Label } from "./Text";

export type CalendarView = "month" | "week" | "day";

export interface CalendarEvent {
  date: Date;
  endDate?: Date;
  label: ReactNode;
  tone?: "neutral" | "success" | "warning" | "danger" | "info";
  description?: ReactNode;
}

export interface CalendarRange {
  start: Date;
  end: Date;
}

export interface CalendarProps extends HTMLAttributes<HTMLDivElement> {
  value?: Date[];
  defaultDisplayMonth?: Date;
  displayMonth?: Date;
  onDisplayMonthChange?: (date: Date) => void;
  view?: CalendarView;
  onViewChange?: (view: CalendarView) => void;
  events?: CalendarEvent[];
  firstDayOfWeek?: 0 | 1;
  showWeekNumbers?: boolean;
  locale?: string;
  onDayClick?: (date: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
  onRangeChange?: (range: CalendarRange) => void;
  style?: CSSProperties;
}

function defaultLocale(): string {
  if (typeof navigator !== "undefined" && navigator.language) return navigator.language;
  return "en-US";
}

function getIsoWeek(d: Date): number {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

function startOfWeek(d: Date, firstDay: 0 | 1): Date {
  const start = startOfDay(d);
  const weekday = start.getDay();
  const offset = (weekday - firstDay + 7) % 7;
  return addDays(start, -offset);
}

export const Calendar = forwardRef<HTMLDivElement, CalendarProps>(function Calendar(
  {
    value,
    defaultDisplayMonth,
    displayMonth,
    onDisplayMonthChange,
    view = "month",
    onViewChange,
    events,
    firstDayOfWeek = 0,
    showWeekNumbers,
    locale = defaultLocale(),
    onDayClick,
    onEventClick,
    onRangeChange,
    className,
    style,
    ...props
  },
  ref
) {
  const [internal, setInternal] = useState<Date>(
    defaultDisplayMonth ?? startOfMonth(new Date())
  );
  const current = displayMonth ?? internal;

  const setMonth = useCallback(
    (next: Date) => {
      if (displayMonth === undefined) setInternal(next);
      onDisplayMonthChange?.(next);
    },
    [displayMonth, onDisplayMonthChange]
  );

  const highlighted = useMemo(
    () => new Set((value ?? []).map((d) => startOfDay(d).getTime())),
    [value]
  );

  const eventByDate = useMemo(() => {
    const map = new Map<number, CalendarEvent[]>();
    for (const ev of events ?? []) {
      const key = startOfDay(ev.date).getTime();
      const list = map.get(key);
      if (list) list.push(ev);
      else map.set(key, [ev]);
    }
    return map;
  }, [events]);

  const weekdays = useMemo(
    () => weekdayNames(locale, firstDayOfWeek, "short"),
    [locale, firstDayOfWeek]
  );

  const range = useMemo<CalendarRange>(() => {
    if (view === "month") {
      const first = startOfMonth(current);
      return { start: first, end: addDays(first, 41) };
    }
    if (view === "week") {
      const start = startOfWeek(current, firstDayOfWeek);
      return { start, end: addDays(start, 6) };
    }
    const day = startOfDay(current);
    return { start: day, end: day };
  }, [view, current, firstDayOfWeek]);

  useEffect(() => {
    onRangeChange?.(range);
  }, [range, onRangeChange]);

  const monthGrid = useMemo(
    () => (view === "month" ? getMonthGrid(current, firstDayOfWeek) : []),
    [view, current, firstDayOfWeek]
  );

  const navPrev = () => {
    if (view === "month") setMonth(addMonths(current, -1));
    else if (view === "week") setMonth(addDays(current, -7));
    else setMonth(addDays(current, -1));
  };
  const navNext = () => {
    if (view === "month") setMonth(addMonths(current, 1));
    else if (view === "week") setMonth(addDays(current, 7));
    else setMonth(addDays(current, 1));
  };

  const renderMonthDayCell = (day: Date) => {
    const isToday = isSameDay(day, new Date());
    const isOutside = !isSameMonth(day, current);
    const isHighlighted = highlighted.has(startOfDay(day).getTime());
    const dayEvents = eventByDate.get(startOfDay(day).getTime()) ?? [];
    return (
      <button
        key={day.toISOString()}
        type="button"
        className={cx(
          "vf-calendar-view__day",
          isToday && "vf-calendar-view__day--today",
          isOutside && "vf-calendar-view__day--outside",
          isHighlighted && "vf-calendar-view__day--highlighted"
        )}
        aria-current={isToday ? "date" : undefined}
        onClick={() => onDayClick?.(day)}
      >
        <span className="vf-calendar-view__daynum">{day.getDate()}</span>
        {dayEvents.length > 0 && (
          <ul className="vf-calendar-view__events">
            {dayEvents.map((ev, i) => (
              <li
                key={i}
                className={cx(
                  "vf-calendar-view__event",
                  ev.tone && `vf-calendar-view__event--${ev.tone}`
                )}
                onClick={(e) => {
                  if (onEventClick) {
                    e.stopPropagation();
                    onEventClick(ev);
                  }
                }}
              >
                {ev.label}
              </li>
            ))}
          </ul>
        )}
      </button>
    );
  };

  const weekStart = useMemo(
    () => startOfWeek(current, firstDayOfWeek),
    [current, firstDayOfWeek]
  );

  const hourDays = useMemo<Date[]>(() => {
    if (view === "week") {
      return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    }
    if (view === "day") {
      return [startOfDay(current)];
    }
    return [];
  }, [view, weekStart, current]);

  const hourRows = 24;
  const pxPerHour = 32;

  const renderHourGrid = () => {
    return (
      <div
        className={cx(
          "vf-calendar-view__hour-grid",
          view === "week" && "vf-calendar-view__hour-grid--week"
        )}
        style={{
          gridTemplateColumns: `48px repeat(${hourDays.length}, 1fr)`,
        }}
      >
        {/* Header row with day labels */}
        <div className="vf-calendar-view__hour-cell vf-calendar-view__hour-head" />
        {hourDays.map((day) => (
          <div
            key={`head-${day.toISOString()}`}
            className="vf-calendar-view__hour-cell vf-calendar-view__hour-head"
          >
            <span className="vf-calendar-view__hour-weekday">
              {weekdayNames(locale, firstDayOfWeek, "short")[
                (day.getDay() - firstDayOfWeek + 7) % 7
              ]}
            </span>
            <span className="vf-calendar-view__hour-daynum">{day.getDate()}</span>
          </div>
        ))}
        {/* Hour rows */}
        {Array.from({ length: hourRows }).map((_, h) => (
          <div
            key={`hour-${h}`}
            className="vf-calendar-view__hour-row"
            style={{ display: "contents" }}
          >
            <div className="vf-calendar-view__hour-cell vf-calendar-view__hour-label">
              {String(h).padStart(2, "0")}:00
            </div>
            {hourDays.map((day) => (
              <div
                key={`cell-${day.toISOString()}-${h}`}
                className="vf-calendar-view__hour-cell"
                onClick={() => {
                  const at = new Date(day);
                  at.setHours(h);
                  onDayClick?.(at);
                }}
              />
            ))}
          </div>
        ))}
        {/* Events layer per column */}
        {hourDays.map((day, dayIdx) => {
          const dayEvents = (events ?? []).filter((ev) =>
            isSameDay(ev.date, day)
          );
          return dayEvents.map((ev, evIdx) => {
            const startHour = ev.date.getHours() + ev.date.getMinutes() / 60;
            const endHour =
              ev.endDate
                ? Math.max(startHour + 0.5, ev.endDate.getHours() + ev.endDate.getMinutes() / 60)
                : startHour + 1;
            const top = startHour * pxPerHour + pxPerHour; // +1 row for header
            const height = Math.max(18, (endHour - startHour) * pxPerHour);
            return (
              <button
                type="button"
                key={`ev-${dayIdx}-${evIdx}`}
                className={cx(
                  "vf-calendar-view__hour-event",
                  ev.tone && `vf-calendar-view__hour-event--${ev.tone}`
                )}
                style={{
                  position: "absolute",
                  gridColumn: dayIdx + 2,
                  top,
                  height,
                  left: `calc((100% - 48px) * ${dayIdx / hourDays.length} + 48px)`,
                  width: `calc((100% - 48px) / ${hourDays.length} - 4px)`,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onEventClick?.(ev);
                }}
              >
                {ev.label}
              </button>
            );
          });
        })}
      </div>
    );
  };

  return (
    <div
      ref={ref}
      className={cx("vf-calendar-view", `vf-calendar-view--${view}`, className)}
      style={style}
      role="group"
      aria-label="Calendar"
      {...props}
    >
      <header className="vf-calendar-view__nav">
        <button
          type="button"
          className="vf-calendar-view__nav-btn"
          aria-label="Previous"
          onClick={navPrev}
        >
          ‹
        </button>
        <Label className="vf-calendar-view__title">
          {view === "month"
            ? `${monthName(current, locale)} ${current.getFullYear()}`
            : view === "week"
              ? `Week of ${weekStart.toLocaleDateString(locale)}`
              : current.toLocaleDateString(locale, {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
        </Label>
        <button
          type="button"
          className="vf-calendar-view__nav-btn"
          aria-label="Next"
          onClick={navNext}
        >
          ›
        </button>
        {onViewChange && (
          <div role="tablist" className="vf-calendar-view__view-switch">
            {(["month", "week", "day"] as const).map((v) => (
              <button
                key={v}
                role="tab"
                aria-selected={v === view}
                type="button"
                onClick={() => onViewChange(v)}
                className={cx(
                  "vf-calendar-view__view-btn",
                  v === view && "vf-calendar-view__view-btn--active"
                )}
              >
                {v}
              </button>
            ))}
          </div>
        )}
      </header>
      {view === "month" ? (
        <div
          className={cx(
            "vf-calendar-view__grid",
            showWeekNumbers && "vf-calendar-view__grid--with-week"
          )}
        >
          {showWeekNumbers && <div className="vf-calendar-view__weekhead">Wk</div>}
          {weekdays.map((name) => (
            <div key={name} className="vf-calendar-view__weekhead">
              {name}
            </div>
          ))}
          {monthGrid.map((day, i) => {
            const cells: ReactNode[] = [];
            if (showWeekNumbers && i % 7 === 0) {
              cells.push(
                <div key={`w${i}`} className="vf-calendar-view__weeknum">
                  {getIsoWeek(day)}
                </div>
              );
            }
            cells.push(renderMonthDayCell(day));
            return <div key={i} style={{ display: "contents" }}>{cells}</div>;
          })}
        </div>
      ) : (
        renderHourGrid()
      )}
    </div>
  );
});
Calendar.displayName = "Calendar";
