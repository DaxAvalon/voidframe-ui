// Phase 9 — Calendar (view-only display)
//
// Full-view calendar for display. Not a picker — see DatePicker for that. The
// view prop toggles month/week/day grids. Events are tagged onto cells.

import {
  forwardRef,
  useCallback,
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
  label: ReactNode;
  tone?: "neutral" | "success" | "warning" | "danger" | "info";
  description?: ReactNode;
}

export interface CalendarProps extends HTMLAttributes<HTMLDivElement> {
  /** Highlighted dates. */
  value?: Date[];
  /** Displayed reference date (uncontrolled default). */
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

  const grid = useMemo(() => {
    if (view === "month") {
      return getMonthGrid(current, firstDayOfWeek);
    }
    if (view === "week") {
      const start = new Date(current);
      const weekday = start.getDay();
      const offset = (weekday - firstDayOfWeek + 7) % 7;
      return Array.from({ length: 7 }, (_, i) => addDays(start, i - offset));
    }
    return [current];
  }, [view, current, firstDayOfWeek]);

  const renderDayCell = (day: Date) => {
    const isToday = isSameDay(day, new Date());
    const isOutside = view === "month" && !isSameMonth(day, current);
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
              >
                {ev.label}
              </li>
            ))}
          </ul>
        )}
      </button>
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
          onClick={() => setMonth(addMonths(current, -1))}
        >
          ‹
        </button>
        <Label className="vf-calendar-view__title">
          {monthName(current, locale)} {current.getFullYear()}
        </Label>
        <button
          type="button"
          className="vf-calendar-view__nav-btn"
          aria-label="Next"
          onClick={() => setMonth(addMonths(current, 1))}
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
      {view !== "day" && (
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
          {(view === "month" ? grid : grid).map((day, i) => {
            const cells: ReactNode[] = [];
            if (showWeekNumbers && i % 7 === 0) {
              cells.push(
                <div key={`w${i}`} className="vf-calendar-view__weeknum">
                  {getIsoWeek(day)}
                </div>
              );
            }
            cells.push(renderDayCell(day));
            return <>{cells}</>;
          })}
        </div>
      )}
      {view === "day" && <div className="vf-calendar-view__single">{renderDayCell(current)}</div>}
    </div>
  );
});
Calendar.displayName = "Calendar";
