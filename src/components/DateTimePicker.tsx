"use client";

// DateTimePicker — DatePicker + TimePicker composed.
// Value is a single Date; the time portion of the date is kept in sync with
// the TimePicker selection.

import {
  forwardRef,
  useCallback,
  type CSSProperties,
  type HTMLAttributes,
} from "react";
import { useControllableState } from "../hooks/useControllableState";
import { cx } from "../utils/cx";
import { formatDate } from "../utils/date";
import { DatePicker, type DatePickerProps } from "./DatePicker";
import { TimePicker, type TimePickerFormat } from "./TimePicker";
import { Label } from "./Text";

export interface DateTimePickerProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  value?: Date | null;
  defaultValue?: Date | null;
  onChange?: (date: Date | null) => void;
  label?: string;
  /** DatePicker props forwarded through. */
  datePickerProps?: Omit<DatePickerProps, "value" | "defaultValue" | "onChange" | "label">;
  /** TimePicker format (12h / 24h). */
  timeFormat?: TimePickerFormat;
  timeStep?: number;
  showSeconds?: boolean;
  disabled?: boolean;
  style?: CSSProperties;
}

function toTimeString(d: Date, showSeconds: boolean): string {
  return formatDate(d, showSeconds ? "HH:mm:ss" : "HH:mm");
}

function applyTime(date: Date, time: string): Date {
  const [hh = "0", mm = "0", ss = "0"] = time.split(":");
  const copy = new Date(date);
  copy.setHours(Number(hh), Number(mm), Number(ss), 0);
  return copy;
}

export const DateTimePicker = forwardRef<HTMLDivElement, DateTimePickerProps>(
  function DateTimePicker(
    {
      value,
      defaultValue,
      onChange,
      label,
      datePickerProps,
      timeFormat = "24h",
      timeStep = 1,
      showSeconds = false,
      disabled,
      className,
      style,
      ...props
    },
    ref
  ) {
    const [current, setCurrent] = useControllableState<Date | null>({
      value,
      defaultValue: defaultValue ?? null,
      onChange,
      componentName: "DateTimePicker",
    });

    const timeValue = current ? toTimeString(current, showSeconds) : "00:00";

    const handleDate = useCallback(
      (d: Date | null) => {
        if (!d) {
          setCurrent(null);
          return;
        }
        // Preserve existing time when the date is updated.
        const preserved = current
          ? applyTime(d, toTimeString(current, showSeconds))
          : d;
        setCurrent(preserved);
      },
      [current, showSeconds, setCurrent]
    );

    const handleTime = useCallback(
      (next: string) => {
        const base = current ?? new Date();
        setCurrent(applyTime(base, next));
      },
      [current, setCurrent]
    );

    return (
      <div
        ref={ref}
        className={cx("vf-datetime-picker", className)}
        style={style}
        role="group"
        aria-label={label ?? "Date and time"}
        {...props}
      >
        {label && <Label>{label}</Label>}
        <div className="vf-datetime-picker__row">
          <DatePicker
            value={current ?? null}
            onChange={handleDate}
            disabled={disabled}
            {...datePickerProps}
          />
          <TimePicker
            value={timeValue}
            onChange={handleTime}
            format={timeFormat}
            step={timeStep}
            showSeconds={showSeconds}
            disabled={disabled || !current}
          />
        </div>
      </div>
    );
  }
);
DateTimePicker.displayName = "DateTimePicker";
