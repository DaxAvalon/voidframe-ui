"use client";

// DatePicker + DateRangePicker + internal Calendar grid.
// Native <Date>, no external deps. Full keyboard spec per WAI-ARIA grid pattern.

import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { useClickOutside, useId, useMergedRefs } from "../hooks";
import { cx } from "../utils/cx";
import {
  addDays,
  addMonths,
  clampDate,
  endOfMonth,
  formatDate,
  getMonthGrid,
  isSameDay,
  isSameMonth,
  monthName,
  parseDate,
  startOfDay,
  startOfMonth,
  weekdayNames,
} from "../utils/date";
import { Label } from "./Text";

// ── Calendar (internal) ───────────────────────────────────────

interface CalendarProps {
  /** Currently-focused month view (controls which grid is shown). */
  viewMonth: Date;
  onViewMonthChange: (next: Date) => void;
  /** Primary selected date (or start date in range mode). */
  selected?: Date | null;
  /** Secondary date for range highlighting. */
  rangeEnd?: Date | null;
  /** Tentative end while hovering in range mode (optional). */
  hoverEnd?: Date | null;
  onSelect: (date: Date) => void;
  onHover?: (date: Date | null) => void;
  min?: Date | null;
  max?: Date | null;
  disabledDates?: (date: Date) => boolean;
  locale: string;
  firstDayOfWeek: 0 | 1;
  showWeekNumbers?: boolean;
  /** ID used for aria-labelledby on the grid. */
  headerId: string;
}

function Calendar({
  viewMonth,
  onViewMonthChange,
  selected,
  rangeEnd,
  hoverEnd,
  onSelect,
  onHover,
  min,
  max,
  disabledDates,
  locale,
  firstDayOfWeek,
  showWeekNumbers,
  headerId,
}: CalendarProps) {
  const today = startOfDay(new Date());
  const [focusDay, setFocusDay] = useState<Date>(() => {
    if (selected && isSameMonth(selected, viewMonth)) return startOfDay(selected);
    return startOfMonth(viewMonth);
  });

  useEffect(() => {
    // Snap focus into the visible month when the view changes.
    if (!isSameMonth(focusDay, viewMonth)) {
      setFocusDay(startOfMonth(viewMonth));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMonth]);

  const grid = useMemo(
    () => getMonthGrid(viewMonth, firstDayOfWeek),
    [viewMonth, firstDayOfWeek]
  );
  const weekdays = useMemo(
    () => weekdayNames(locale, firstDayOfWeek, "short"),
    [locale, firstDayOfWeek]
  );

  const isDisabled = useCallback(
    (d: Date): boolean => {
      if (min && d < startOfDay(min)) return true;
      if (max && d > startOfDay(max)) return true;
      if (disabledDates?.(d)) return true;
      return false;
    },
    [min, max, disabledDates]
  );

  const moveFocus = (next: Date) => {
    const bounded = clampDate(next, min, max);
    if (!isSameMonth(bounded, viewMonth)) {
      onViewMonthChange(startOfMonth(bounded));
    }
    setFocusDay(startOfDay(bounded));
  };

  const handleKey = (e: KeyboardEvent<HTMLDivElement>) => {
    switch (e.key) {
      case "ArrowLeft":
        e.preventDefault();
        moveFocus(addDays(focusDay, -1));
        break;
      case "ArrowRight":
        e.preventDefault();
        moveFocus(addDays(focusDay, 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        moveFocus(addDays(focusDay, -7));
        break;
      case "ArrowDown":
        e.preventDefault();
        moveFocus(addDays(focusDay, 7));
        break;
      case "Home":
        e.preventDefault();
        moveFocus(startOfMonth(focusDay));
        break;
      case "End":
        e.preventDefault();
        moveFocus(endOfMonth(focusDay));
        break;
      case "PageUp":
        e.preventDefault();
        moveFocus(addMonths(focusDay, e.shiftKey ? -12 : -1));
        break;
      case "PageDown":
        e.preventDefault();
        moveFocus(addMonths(focusDay, e.shiftKey ? 12 : 1));
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        if (!isDisabled(focusDay)) onSelect(focusDay);
        break;
    }
  };

  const inRange = (d: Date): boolean => {
    if (!selected) return false;
    const end = rangeEnd ?? hoverEnd;
    if (!end) return false;
    const [lo, hi] = selected <= end ? [selected, end] : [end, selected];
    return d >= startOfDay(lo) && d <= startOfDay(hi);
  };

  return (
    <div className="vf-calendar">
      <div className="vf-calendar__nav">
        <button
          type="button"
          className="vf-calendar__nav-btn"
          aria-label="Previous year"
          onClick={() => onViewMonthChange(addMonths(viewMonth, -12))}
        >
          «
        </button>
        <button
          type="button"
          className="vf-calendar__nav-btn"
          aria-label="Previous month"
          onClick={() => onViewMonthChange(addMonths(viewMonth, -1))}
        >
          ‹
        </button>
        <div id={headerId} className="vf-calendar__title" aria-live="polite">
          {monthName(viewMonth, locale)} {viewMonth.getFullYear()}
        </div>
        <button
          type="button"
          className="vf-calendar__nav-btn"
          aria-label="Next month"
          onClick={() => onViewMonthChange(addMonths(viewMonth, 1))}
        >
          ›
        </button>
        <button
          type="button"
          className="vf-calendar__nav-btn"
          aria-label="Next year"
          onClick={() => onViewMonthChange(addMonths(viewMonth, 12))}
        >
          »
        </button>
      </div>

      <div
        role="grid"
        aria-labelledby={headerId}
        className={cx("vf-calendar__grid", showWeekNumbers && "vf-calendar__grid--with-week")}
        onKeyDown={handleKey}
        tabIndex={-1}
      >
        <div role="row" className="vf-calendar__row vf-calendar__row--head">
          {showWeekNumbers && (
            <div role="columnheader" className="vf-calendar__weekhead">
              Wk
            </div>
          )}
          {weekdays.map((name) => (
            <div key={name} role="columnheader" className="vf-calendar__weekhead">
              {name}
            </div>
          ))}
        </div>
        {Array.from({ length: 6 }).map((_, rowIdx) => {
          const rowDays = grid.slice(rowIdx * 7, rowIdx * 7 + 7);
          return (
            <div key={`row${rowIdx}`} role="row" className="vf-calendar__row">
              {showWeekNumbers && rowDays[0] && (
                <div role="rowheader" className="vf-calendar__weeknum">
                  {getIsoWeek(rowDays[0])}
                </div>
              )}
              {rowDays.map((day) => {
                const isOutside = !isSameMonth(day, viewMonth);
                const isToday = isSameDay(day, today);
                const isSelected = isSameDay(day, selected);
                const isEnd = isSameDay(day, rangeEnd);
                const isFocused = isSameDay(day, focusDay);
                const disabled = isDisabled(day);
                const highlighted = inRange(day);
                return (
                  <button
                    key={`d${day.toISOString()}`}
                    type="button"
                    role="gridcell"
                    aria-selected={isSelected || isEnd}
                    aria-current={isToday ? "date" : undefined}
                    aria-disabled={disabled || undefined}
                    tabIndex={isFocused ? 0 : -1}
                    ref={(el) => {
                      if (isFocused && el && document.activeElement !== el) {
                        if (el.parentElement?.contains(document.activeElement)) {
                          el.focus({ preventScroll: true });
                        }
                      }
                    }}
                    className={cx(
                      "vf-calendar__day",
                      isOutside && "vf-calendar__day--outside",
                      isToday && "vf-calendar__day--today",
                      isSelected && "vf-calendar__day--selected",
                      isEnd && "vf-calendar__day--range-end",
                      highlighted && !isSelected && !isEnd && "vf-calendar__day--in-range",
                      disabled && "vf-calendar__day--disabled"
                    )}
                    disabled={disabled}
                    onClick={() => !disabled && onSelect(day)}
                    onMouseEnter={() => onHover?.(day)}
                    onMouseLeave={() => onHover?.(null)}
                  >
                    {day.getDate()}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function getIsoWeek(d: Date): number {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

// ── DatePicker ────────────────────────────────────────────────

type DateFormat = string | ((d: Date) => string);

export interface DatePickerProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  value?: Date | null;
  defaultValue?: Date | null;
  onValueChange?: (date: Date | null) => void;
  label?: string;
  placeholder?: string;
  min?: Date | null;
  max?: Date | null;
  disabledDates?: (date: Date) => boolean;
  /** Output/input format. Default "yyyy-MM-dd". */
  format?: DateFormat;
  /** Pattern used to parse typed input when `format` is a string. Defaults to `format`. */
  parseFormat?: string;
  locale?: string;
  firstDayOfWeek?: 0 | 1;
  showWeekNumbers?: boolean;
  /** Render calendar always open (no popover trigger). */
  inline?: boolean;
  disabled?: boolean;
  required?: boolean;
  id?: string;
  style?: CSSProperties;
}

/**
 * A text input paired with a popover calendar; selecting a date fills the input.
 * Supports keyboard entry, format parsing, and min/max bounds.
 */
export const DatePicker = forwardRef<HTMLDivElement, DatePickerProps>(
  function DatePicker(
    {
      value,
      defaultValue,
      onValueChange,
      label,
      placeholder = "yyyy-mm-dd",
      min,
      max,
      disabledDates,
      format = "yyyy-MM-dd",
      parseFormat,
      locale = defaultLocale(),
      firstDayOfWeek = 0,
      showWeekNumbers,
      inline,
      disabled,
      required,
      id,
      className,
      style,
      ...props
    },
    ref
  ) {
    const isControlled = value !== undefined;
    const [internal, setInternal] = useState<Date | null>(defaultValue ?? null);
    const current = isControlled ? value ?? null : internal;

    const [open, setOpen] = useState(false);
    const [draft, setDraft] = useState<string>(() => {
      if (!current) return "";
      return typeof format === "function" ? format(current) : formatDate(current, format);
    });
    const [viewMonth, setViewMonth] = useState<Date>(
      () => startOfMonth(current ?? new Date())
    );

    const containerRef = useRef<HTMLDivElement>(null);
    const clickOutsideRef = useClickOutside<HTMLDivElement>(() => setOpen(false));
    const mergedRef = useMergedRefs(ref, containerRef, clickOutsideRef);
    const inputId = useId(id);
    const headerId = useId();
    const popoverId = useId();

    const setValue = useCallback(
      (next: Date | null) => {
        if (!isControlled) setInternal(next);
        onValueChange?.(next);
      },
      [isControlled, onValueChange]
    );

    const displayFormat = useCallback(
      (d: Date): string =>
        typeof format === "function" ? format(d) : formatDate(d, format),
      [format]
    );

    // Keep draft in sync with external `value` changes.
    useEffect(() => {
      setDraft(current ? displayFormat(current) : "");
    }, [current, displayFormat]);

    // Ensure the viewMonth follows the selected value when it changes externally.
    useEffect(() => {
      if (current && !isSameMonth(current, viewMonth)) {
        setViewMonth(startOfMonth(current));
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [current]);

    const handleSelect = (d: Date) => {
      setValue(startOfDay(d));
      setOpen(false);
    };

    const handleInputBlur = () => {
      if (typeof format === "string") {
        const parsed = parseDate(draft, parseFormat ?? format);
        if (parsed) {
          const start = startOfDay(parsed);
          if (!isSameDay(start, current)) setValue(start);
        } else if (draft === "") {
          if (current !== null) setValue(null);
        } else {
          setDraft(current ? displayFormat(current) : "");
        }
      }
    };

    const handleInputKey = (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setOpen(true);
      } else if (e.key === "Escape" && open) {
        e.preventDefault();
        setOpen(false);
      } else if (e.key === "Enter") {
        handleInputBlur();
      }
    };

    const popoverContent = (
      <Calendar
        viewMonth={viewMonth}
        onViewMonthChange={setViewMonth}
        selected={current}
        onSelect={handleSelect}
        min={min}
        max={max}
        disabledDates={disabledDates}
        locale={locale}
        firstDayOfWeek={firstDayOfWeek}
        showWeekNumbers={showWeekNumbers}
        headerId={headerId}
      />
    );

    if (inline) {
      return (
        <div
          ref={mergedRef}
          className={cx("vf-date-picker", "vf-date-picker--inline", className)}
          style={style}
          {...props}
        >
          {label && <Label>{label}</Label>}
          {popoverContent}
        </div>
      );
    }

    return (
      <div
        ref={mergedRef}
        className={cx("vf-date-picker", className)}
        style={style}
        {...props}
      >
        {label && (
          <Label as="label" htmlFor={inputId}>
            {label}
          </Label>
        )}
        <input
          id={inputId}
          type="text"
          role="combobox"
          className="vf-input"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onFocus={() => setOpen(true)}
          onKeyDown={handleInputKey}
          onBlur={handleInputBlur}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls={popoverId}
          aria-autocomplete="none"
        />
        {open && (
          <div
            id={popoverId}
            className="vf-date-picker__popover"
            role="dialog"
            aria-label="Choose date"
          >
            {popoverContent}
          </div>
        )}
      </div>
    );
  }
);
DatePicker.displayName = "DatePicker";

// ── DateRangePicker ───────────────────────────────────────────

export interface DateRange {
  start: Date | null;
  end: Date | null;
}

export interface DateRangePreset {
  label: string;
  range: () => { start: Date; end: Date };
}

export interface DateRangePickerProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  value?: DateRange;
  defaultValue?: DateRange;
  onValueChange?: (range: DateRange) => void;
  label?: string;
  min?: Date | null;
  max?: Date | null;
  disabledDates?: (date: Date) => boolean;
  format?: DateFormat;
  locale?: string;
  firstDayOfWeek?: 0 | 1;
  presets?: DateRangePreset[];
  /** Number of months shown side-by-side (1 or 2). Default 2. */
  numberOfMonths?: 1 | 2;
  disabled?: boolean;
  style?: CSSProperties;
}

export const DateRangePicker = forwardRef<HTMLDivElement, DateRangePickerProps>(
  function DateRangePicker(
    {
      value,
      defaultValue,
      onValueChange,
      label,
      min,
      max,
      disabledDates,
      format = "yyyy-MM-dd",
      locale = defaultLocale(),
      firstDayOfWeek = 0,
      presets,
      numberOfMonths = 2,
      disabled,
      className,
      style,
      ...props
    },
    ref
  ) {
    const isControlled = value !== undefined;
    const [internal, setInternal] = useState<DateRange>(
      defaultValue ?? { start: null, end: null }
    );
    const current = isControlled
      ? (value as DateRange)
      : internal;

    const [viewMonth, setViewMonth] = useState<Date>(
      () => startOfMonth(current.start ?? new Date())
    );
    const [hoverEnd, setHoverEnd] = useState<Date | null>(null);
    const [open, setOpen] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);
    const clickOutsideRef = useClickOutside<HTMLDivElement>(() => {
      setOpen(false);
      setHoverEnd(null);
    });
    const mergedRef = useMergedRefs(ref, containerRef, clickOutsideRef);
    const headerId1 = useId();
    const headerId2 = useId();

    const setRange = (next: DateRange) => {
      if (!isControlled) setInternal(next);
      onValueChange?.(next);
    };

    const displayFormat = useCallback(
      (d: Date): string =>
        typeof format === "function" ? format(d) : formatDate(d, format),
      [format]
    );

    const isDateAllowed = (d: Date): boolean => {
      if (min && d < startOfDay(min)) return false;
      if (max && d > startOfDay(max)) return false;
      if (disabledDates?.(d)) return false;
      return true;
    };

    const handleSelect = (d: Date) => {
      const day = startOfDay(d);
      if (!isDateAllowed(day)) return;
      if (!current.start || (current.start && current.end)) {
        setRange({ start: day, end: null });
      } else if (day < current.start) {
        setRange({ start: day, end: current.start });
        setOpen(false);
      } else {
        setRange({ start: current.start, end: day });
        setOpen(false);
      }
    };

    const applyPreset = (preset: DateRangePreset) => {
      const r = preset.range();
      const s = startOfDay(r.start);
      const e = startOfDay(r.end);
      if (!isDateAllowed(s) || !isDateAllowed(e)) return;
      if (
        current.start &&
        current.end &&
        current.start.getTime() === s.getTime() &&
        current.end.getTime() === e.getTime()
      ) {
        setOpen(false);
        return;
      }
      setRange({ start: s, end: e });
      setViewMonth(startOfMonth(r.start));
      setOpen(false);
    };

    const display =
      current.start && current.end
        ? `${displayFormat(current.start)} – ${displayFormat(current.end)}`
        : current.start
          ? `${displayFormat(current.start)} – …`
          : "";

    const months =
      numberOfMonths === 2
        ? [viewMonth, addMonths(viewMonth, 1)]
        : [viewMonth];

    return (
      <div
        ref={mergedRef}
        className={cx("vf-date-picker", "vf-date-range-picker", className)}
        style={style}
        {...props}
      >
        {label && <Label>{label}</Label>}
        <button
          type="button"
          className="vf-input vf-date-range-picker__trigger"
          onClick={() => setOpen((o) => !o)}
          disabled={disabled}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-label={label ?? "Select date range"}
        >
          {display || "Select range…"}
        </button>
        {open && (
          <div
            className="vf-date-picker__popover vf-date-range-picker__popover"
            role="dialog"
            aria-label="Choose date range"
          >
            {presets && presets.length > 0 && (
              <div
                className="vf-date-range-picker__presets"
                role="group"
                aria-label="Date range presets"
              >
                {presets.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    className="vf-date-range-picker__preset"
                    onClick={() => applyPreset(p)}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            )}
            <div className="vf-date-range-picker__months">
              {months.map((m, i) => (
                <Calendar
                  key={m.toISOString()}
                  viewMonth={m}
                  onViewMonthChange={(next) => {
                    // When navigating the second month, shift the base view.
                    setViewMonth(i === 0 ? next : addMonths(next, -1));
                  }}
                  selected={current.start}
                  rangeEnd={current.end}
                  hoverEnd={!current.end ? hoverEnd : null}
                  onSelect={handleSelect}
                  onHover={setHoverEnd}
                  min={min}
                  max={max}
                  disabledDates={disabledDates}
                  locale={locale}
                  firstDayOfWeek={firstDayOfWeek}
                  headerId={i === 0 ? headerId1 : headerId2}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }
);
DateRangePicker.displayName = "DateRangePicker";

function defaultLocale(): string {
  if (typeof navigator !== "undefined" && navigator.language) return navigator.language;
  return "en-US";
}
