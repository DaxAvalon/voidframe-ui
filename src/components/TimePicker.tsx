// TimePicker — hour/minute (optional seconds) spinners.
// No datepicker required; value is a "HH:mm" / "HH:mm:ss" 24h string.

import {
  forwardRef,
  useCallback,
  useMemo,
  type CSSProperties,
  type HTMLAttributes,
} from "react";
import { useControllableState } from "../hooks/useControllableState";
import { useId } from "../hooks/useId";
import { cx } from "../utils/cx";
import { Label } from "./Text";

export type TimePickerFormat = "12h" | "24h";

export interface TimePickerProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  /** Canonical 24h string "HH:mm" or "HH:mm:ss". */
  value?: string;
  defaultValue?: string;
  onChange?: (next: string) => void;
  label?: string;
  /** 12h view displays AM/PM toggle; value remains 24h. */
  format?: TimePickerFormat;
  /** Granularity of minute steps (e.g. 5, 15). Default 1. */
  step?: number;
  /** "HH:mm" inclusive lower bound. */
  min?: string;
  /** "HH:mm" inclusive upper bound. */
  max?: string;
  showSeconds?: boolean;
  disabled?: boolean;
  id?: string;
  style?: CSSProperties;
}

interface ParsedTime {
  h: number;
  m: number;
  s: number;
}

function parse24(value: string): ParsedTime {
  const [hh = "0", mm = "0", ss = "0"] = value.split(":");
  return {
    h: clamp(Number(hh), 0, 23),
    m: clamp(Number(mm), 0, 59),
    s: clamp(Number(ss), 0, 59),
  };
}

function serialize(t: ParsedTime, showSeconds: boolean): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return showSeconds
    ? `${pad(t.h)}:${pad(t.m)}:${pad(t.s)}`
    : `${pad(t.h)}:${pad(t.m)}`;
}

function clamp(n: number, min: number, max: number): number {
  if (Number.isNaN(n)) return min;
  return Math.min(Math.max(n, min), max);
}

function inBounds(
  t: ParsedTime,
  min: ParsedTime | null,
  max: ParsedTime | null
): boolean {
  const total = t.h * 3600 + t.m * 60 + t.s;
  if (min && total < min.h * 3600 + min.m * 60 + min.s) return false;
  if (max && total > max.h * 3600 + max.m * 60 + max.s) return false;
  return true;
}

function range(from: number, to: number, step: number): number[] {
  const out: number[] = [];
  for (let i = from; i <= to; i += step) out.push(i);
  return out;
}

export const TimePicker = forwardRef<HTMLDivElement, TimePickerProps>(
  function TimePicker(
    {
      value,
      defaultValue = "00:00",
      onChange,
      label,
      format = "24h",
      step = 1,
      min,
      max,
      showSeconds = false,
      disabled,
      id,
      className,
      style,
      ...props
    },
    ref
  ) {
    const [current, setCurrent] = useControllableState<string>({
      value,
      defaultValue,
      onChange,
      componentName: "TimePicker",
    });

    const parsed = useMemo(() => parse24(current), [current]);
    const minParsed = useMemo(() => (min ? parse24(min) : null), [min]);
    const maxParsed = useMemo(() => (max ? parse24(max) : null), [max]);

    const pad2 = (n: number) => String(n).padStart(2, "0");

    const update = useCallback(
      (next: ParsedTime) => {
        if (!inBounds(next, minParsed, maxParsed)) return;
        setCurrent(serialize(next, showSeconds));
      },
      [minParsed, maxParsed, setCurrent, showSeconds]
    );

    const hourLabelId = useId();
    const minuteLabelId = useId();
    const secondLabelId = useId();
    const ampmLabelId = useId();
    const hourId = useId(id ? `${id}-h` : undefined);
    const minuteId = useId();
    const secondId = useId();

    const hours =
      format === "12h"
        ? range(1, 12, 1)
        : range(0, 23, 1);

    const minutes = range(0, 59, Math.max(1, step));
    const seconds = range(0, 59, Math.max(1, step));

    const displayHour = (() => {
      if (format === "24h") return parsed.h;
      const h12 = ((parsed.h + 11) % 12) + 1;
      return h12;
    })();
    const pm = parsed.h >= 12;

    const setHour = (rawHour: number) => {
      if (format === "24h") {
        update({ ...parsed, h: clamp(rawHour, 0, 23) });
      } else {
        const hour = clamp(rawHour, 1, 12);
        const h24 = pm ? (hour === 12 ? 12 : hour + 12) : hour === 12 ? 0 : hour;
        update({ ...parsed, h: h24 });
      }
    };

    const setMinute = (m: number) => update({ ...parsed, m: clamp(m, 0, 59) });
    const setSecond = (s: number) => update({ ...parsed, s: clamp(s, 0, 59) });
    const setAmPm = (wantPm: boolean) => {
      const h = parsed.h % 12;
      update({ ...parsed, h: wantPm ? h + 12 : h });
    };

    return (
      <div
        ref={ref}
        className={cx("vf-time-picker", className)}
        style={style}
        role="group"
        aria-label={label ?? "Time picker"}
        {...props}
      >
        {label && <Label>{label}</Label>}
        <div className="vf-time-picker__row">
          <Label id={hourLabelId} className="vf-visually-hidden">Hours</Label>
          <select
            id={hourId}
            aria-labelledby={hourLabelId}
            className="vf-time-picker__select"
            value={displayHour}
            onChange={(e) => setHour(Number(e.target.value))}
            disabled={disabled}
          >
            {hours.map((h) => (
              <option key={h} value={h}>
                {pad2(h)}
              </option>
            ))}
          </select>
          <span className="vf-time-picker__sep" aria-hidden="true">
            :
          </span>
          <Label id={minuteLabelId} className="vf-visually-hidden">Minutes</Label>
          <select
            id={minuteId}
            aria-labelledby={minuteLabelId}
            className="vf-time-picker__select"
            value={parsed.m}
            onChange={(e) => setMinute(Number(e.target.value))}
            disabled={disabled}
          >
            {minutes.map((m) => (
              <option key={m} value={m}>
                {pad2(m)}
              </option>
            ))}
          </select>
          {showSeconds && (
            <>
              <span className="vf-time-picker__sep" aria-hidden="true">
                :
              </span>
              <Label id={secondLabelId} className="vf-visually-hidden">Seconds</Label>
              <select
                id={secondId}
                aria-labelledby={secondLabelId}
                className="vf-time-picker__select"
                value={parsed.s}
                onChange={(e) => setSecond(Number(e.target.value))}
                disabled={disabled}
              >
                {seconds.map((s) => (
                  <option key={s} value={s}>
                    {pad2(s)}
                  </option>
                ))}
              </select>
            </>
          )}
          {format === "12h" && (
            <>
              <Label id={ampmLabelId} className="vf-visually-hidden">AM or PM</Label>
              <div
                className="vf-time-picker__ampm"
                role="radiogroup"
                aria-labelledby={ampmLabelId}
              >
                <button
                  type="button"
                  role="radio"
                  aria-checked={!pm}
                  data-active={!pm ? "true" : undefined}
                  className="vf-time-picker__ampm-btn"
                  onClick={() => setAmPm(false)}
                  disabled={disabled}
                >
                  AM
                </button>
                <button
                  type="button"
                  role="radio"
                  aria-checked={pm}
                  data-active={pm ? "true" : undefined}
                  className="vf-time-picker__ampm-btn"
                  onClick={() => setAmPm(true)}
                  disabled={disabled}
                >
                  PM
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }
);
TimePicker.displayName = "TimePicker";
