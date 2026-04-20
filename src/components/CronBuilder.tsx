"use client";

import { forwardRef, memo, useCallback, useMemo } from "react";
import type { HTMLAttributes } from "react";
import { useControllableState } from "../hooks/useControllableState";
import { cx } from "../utils/cx";

export interface CronPreset {
  label: string;
  value: string;
}

export interface CronBuilderProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (expression: string) => void;
  mode?: "visual" | "raw" | "both";
  presets?: CronPreset[];
  showPreview?: boolean;
  previewCount?: number;
  size?: "sm" | "md";
  disabled?: boolean;
  /**
   * Number of fields in the cron expression. 5 = standard UNIX
   * (minute / hour / day / month / weekday); 6 = Quartz-style with a leading
   * seconds field. Defaults to the width of the current `value` / `defaultValue`,
   * falling back to 5.
   */
  fields?: 5 | 6;
}

const DEFAULT_PRESETS: CronPreset[] = [
  { label: "Every minute", value: "* * * * *" },
  { label: "Every hour", value: "0 * * * *" },
  { label: "Daily midnight", value: "0 0 * * *" },
  { label: "Weekly Monday 9am", value: "0 9 * * 1" },
  { label: "Monthly 1st", value: "0 0 1 * *" },
];

const FIELD_NAMES_5 = ["minute", "hour", "day", "month", "weekday"] as const;
const FIELD_NAMES_6 = ["second", "minute", "hour", "day", "month", "weekday"] as const;
const FIELD_LABELS_5 = ["Minute", "Hour", "Day of Month", "Month", "Day of Week"];
const FIELD_LABELS_6 = ["Second", "Minute", "Hour", "Day of Month", "Month", "Day of Week"];
const FIELD_RANGES_5: [number, number][] = [
  [0, 59],
  [0, 23],
  [1, 31],
  [1, 12],
  [0, 6],
];
const FIELD_RANGES_6: [number, number][] = [
  [0, 59],
  ...FIELD_RANGES_5,
];

type FieldType = "every" | "specific" | "range" | "interval";

interface ParsedField {
  type: FieldType;
  value: string;
  specific?: number[];
  rangeStart?: number;
  rangeEnd?: number;
  interval?: number;
}

function parseField(expr: string, _fieldIdx: number): ParsedField {
  if (expr === "*") return { type: "every", value: expr };
  if (expr.includes("/")) {
    const parts = expr.split("/");
    return {
      type: "interval",
      value: expr,
      interval: parseInt(parts[1] ?? "1", 10),
    };
  }
  if (expr.includes("-")) {
    const parts = expr.split("-");
    return {
      type: "range",
      value: expr,
      rangeStart: parseInt(parts[0] ?? "0", 10),
      rangeEnd: parseInt(parts[1] ?? "0", 10),
    };
  }
  return {
    type: "specific",
    value: expr,
    specific: expr.split(",").map((s) => parseInt(s, 10)),
  };
}

function buildField(parsed: ParsedField, fieldIdx: number, ranges: [number, number][]): string {
  const [min] = ranges[fieldIdx]!;
  switch (parsed.type) {
    case "every":
      return "*";
    case "specific":
      return (parsed.specific ?? [min]).join(",");
    case "range":
      return `${parsed.rangeStart ?? min}-${parsed.rangeEnd ?? min}`;
    case "interval":
      return `*/${parsed.interval ?? 1}`;
    default:
      return "*";
  }
}

/** Simple next-run calculator for cron expressions. Accepts 5- or 6-field form. */
export function getNextRuns(cron: string, count: number): Date[] {
  const parts = cron.trim().split(/\s+/);
  if (parts.length !== 5 && parts.length !== 6) return [];
  const hasSeconds = parts.length === 6;

  const parseSegment = (
    seg: string,
    min: number,
    max: number
  ): number[] | null => {
    if (seg === "*") return null; // any value
    if (seg.includes("/")) {
      const [, stepStr] = seg.split("/");
      const step = parseInt(stepStr ?? "1", 10);
      if (isNaN(step) || step < 1) return null;
      const vals: number[] = [];
      for (let i = min; i <= max; i += step) vals.push(i);
      return vals;
    }
    if (seg.includes("-")) {
      const [a, b] = seg.split("-").map(Number);
      if (a === undefined || b === undefined || isNaN(a) || isNaN(b))
        return null;
      const vals: number[] = [];
      for (let i = a; i <= b; i++) vals.push(i);
      return vals;
    }
    return seg.split(",").map(Number).filter((n) => !isNaN(n));
  };

  const offset = hasSeconds ? 1 : 0;
  const seconds = hasSeconds ? parseSegment(parts[0]!, 0, 59) : null;
  const minutes = parseSegment(parts[0 + offset]!, 0, 59);
  const hours = parseSegment(parts[1 + offset]!, 0, 23);
  const days = parseSegment(parts[2 + offset]!, 1, 31);
  const months = parseSegment(parts[3 + offset]!, 1, 12);
  const weekdays = parseSegment(parts[4 + offset]!, 0, 6);

  const matches = (d: Date): boolean => {
    if (seconds && !seconds.includes(d.getSeconds())) return false;
    if (minutes && !minutes.includes(d.getMinutes())) return false;
    if (hours && !hours.includes(d.getHours())) return false;
    if (days && !days.includes(d.getDate())) return false;
    if (months && !months.includes(d.getMonth() + 1)) return false;
    if (weekdays && !weekdays.includes(d.getDay())) return false;
    return true;
  };

  const results: Date[] = [];
  const cursor = new Date();
  if (hasSeconds) {
    cursor.setMilliseconds(0);
    cursor.setSeconds(cursor.getSeconds() + 1);
  } else {
    cursor.setSeconds(0, 0);
    cursor.setMinutes(cursor.getMinutes() + 1);
  }

  // 1 year of seconds ≈ 31.5M ticks; keep minute-granularity when not using
  // seconds to preserve previous cost envelope.
  const limit = hasSeconds ? 60 * 60 * 24 * 31 : 525960;
  const stepMs = hasSeconds ? 1000 : 60_000;
  for (let i = 0; i < limit && results.length < count; i++) {
    if (matches(cursor)) {
      results.push(new Date(cursor));
    }
    cursor.setTime(cursor.getTime() + stepMs);
  }

  return results;
}

function isValidCron(expr: string): boolean {
  const parts = expr.trim().split(/\s+/);
  if (parts.length !== 5 && parts.length !== 6) return false;
  return parts.every((p) => /^[\d,\-\*\/]+$/.test(p));
}

function resolveFieldCount(
  fields: 5 | 6 | undefined,
  value: string | undefined,
  defaultValue: string | undefined
): 5 | 6 {
  if (fields) return fields;
  const probe = (value ?? defaultValue ?? "").trim();
  if (!probe) return 5;
  return probe.split(/\s+/).length === 6 ? 6 : 5;
}

const CronBuilderImpl = forwardRef<HTMLDivElement, CronBuilderProps>(
  function CronBuilder(
    {
      value,
      defaultValue,
      onValueChange,
      mode = "both",
      presets = DEFAULT_PRESETS,
      showPreview = true,
      previewCount = 5,
      size = "md",
      disabled = false,
      fields,
      className,
      style,
      ...props
    },
    ref
  ) {
    const fieldCount = resolveFieldCount(fields, value, defaultValue);
    const FIELD_NAMES = fieldCount === 6 ? FIELD_NAMES_6 : FIELD_NAMES_5;
    const FIELD_LABELS = fieldCount === 6 ? FIELD_LABELS_6 : FIELD_LABELS_5;
    const FIELD_RANGES = fieldCount === 6 ? FIELD_RANGES_6 : FIELD_RANGES_5;
    const initial = defaultValue ?? (fieldCount === 6 ? "* * * * * *" : "* * * * *");

    const [current, setCurrent] = useControllableState<string>({
      value,
      defaultValue: initial,
      onChange: onValueChange,
      componentName: "CronBuilder",
    });

    const cronParts = current.trim().split(/\s+/);
    const valid = isValidCron(current) && cronParts.length === fieldCount;

    const parsedFields = useMemo(() => {
      if (!valid) return FIELD_NAMES.map(() => parseField("*", 0));
      return FIELD_NAMES.map((_, i) => parseField(cronParts[i] ?? "*", i));
    }, [current, valid, FIELD_NAMES]);

    const updateField = useCallback(
      (fieldIdx: number, parsed: ParsedField) => {
        const parts = current.trim().split(/\s+/);
        while (parts.length < fieldCount) parts.push("*");
        if (parts.length > fieldCount) parts.length = fieldCount;
        parts[fieldIdx] = buildField(parsed, fieldIdx, FIELD_RANGES);
        setCurrent(parts.join(" "));
      },
      [current, setCurrent, fieldCount, FIELD_RANGES]
    );

    const preview = useMemo(() => {
      if (!showPreview || !valid) return [];
      return getNextRuns(current, previewCount);
    }, [current, showPreview, previewCount, valid]);

    const showVisual = mode === "visual" || mode === "both";
    const showRaw = mode === "raw" || mode === "both";

    return (
      <div
        ref={ref}
        className={cx("vf-cron-builder", `vf-cron-builder--${size}`, className)}
        style={style}
        {...props}
      >
        {mode === "both" && (
          <div className="vf-cron-builder__mode-toggle" aria-hidden="true" />
        )}

        {showVisual && (
          <div className="vf-cron-builder__visual">
            {FIELD_NAMES.map((name, i) => {
              const parsed = parsedFields[i]!;
              const [min, max] = FIELD_RANGES[i]!;

              return (
                <div
                  key={name}
                  className="vf-cron-builder__field"
                  data-field={name}
                >
                  <span className="vf-cron-builder__field-label">
                    {FIELD_LABELS[i]}
                  </span>
                  <select
                    className="vf-cron-builder__field-type"
                    value={parsed.type}
                    disabled={disabled}
                    aria-label={`${FIELD_LABELS[i]} type`}
                    onChange={(e) => {
                      const type = e.target.value as FieldType;
                      updateField(i, {
                        type,
                        value: "",
                        specific: type === "specific" ? [min] : undefined,
                        rangeStart: type === "range" ? min : undefined,
                        rangeEnd: type === "range" ? max : undefined,
                        interval: type === "interval" ? 1 : undefined,
                      });
                    }}
                  >
                    <option value="every">Every</option>
                    <option value="specific">Specific</option>
                    <option value="range">Range</option>
                    <option value="interval">Interval</option>
                  </select>
                  <span className="vf-cron-builder__field-values">
                    {parsed.type === "specific" && (
                      <input
                        type="text"
                        value={(parsed.specific ?? []).join(",")}
                        disabled={disabled}
                        aria-label={`${FIELD_LABELS[i]} values`}
                        onChange={(e) => {
                          const vals = e.target.value
                            .split(",")
                            .map(Number)
                            .filter((n) => !isNaN(n));
                          updateField(i, {
                            ...parsed,
                            specific: vals,
                          });
                        }}
                      />
                    )}
                    {parsed.type === "range" && (
                      <>
                        <input
                          type="number"
                          min={min}
                          max={max}
                          value={parsed.rangeStart ?? min}
                          disabled={disabled}
                          aria-label={`${FIELD_LABELS[i]} range start`}
                          onChange={(e) =>
                            updateField(i, {
                              ...parsed,
                              rangeStart: parseInt(e.target.value, 10),
                            })
                          }
                        />
                        <span>-</span>
                        <input
                          type="number"
                          min={min}
                          max={max}
                          value={parsed.rangeEnd ?? max}
                          disabled={disabled}
                          aria-label={`${FIELD_LABELS[i]} range end`}
                          onChange={(e) =>
                            updateField(i, {
                              ...parsed,
                              rangeEnd: parseInt(e.target.value, 10),
                            })
                          }
                        />
                      </>
                    )}
                    {parsed.type === "interval" && (
                      <input
                        type="number"
                        min={1}
                        value={parsed.interval ?? 1}
                        disabled={disabled}
                        aria-label={`${FIELD_LABELS[i]} interval`}
                        onChange={(e) =>
                          updateField(i, {
                            ...parsed,
                            interval: parseInt(e.target.value, 10),
                          })
                        }
                      />
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {showRaw && (
          <div className="vf-cron-builder__raw">
            <input
              type="text"
              className="vf-cron-builder__raw-input"
              value={current}
              disabled={disabled}
              aria-label="Cron expression"
              onChange={(e) => setCurrent(e.target.value)}
            />
            {!valid && current.trim() !== "" && (
              <span className="vf-cron-builder__raw-error" role="alert">
                Invalid cron expression
              </span>
            )}
          </div>
        )}

        {presets.length > 0 && (
          <div className="vf-cron-builder__presets">
            {presets.map((p) => (
              <button
                key={p.value}
                type="button"
                className="vf-cron-builder__preset"
                disabled={disabled}
                onClick={() => setCurrent(p.value)}
              >
                {p.label}
              </button>
            ))}
          </div>
        )}

        {showPreview && valid && preview.length > 0 && (
          <div className="vf-cron-builder__preview">
            <span className="vf-cron-builder__preview-label">
              Next {preview.length} runs:
            </span>
            {preview.map((d, i) => (
              <span key={i} className="vf-cron-builder__preview-time">
                {d.toLocaleString()}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  }
);
CronBuilderImpl.displayName = "CronBuilder";
/**
 * Visual builder for a cron expression. Controllable via `value` /
 * `onChange`; emits the standard five-field string.
 */
export const CronBuilder = memo(CronBuilderImpl);
(CronBuilder as unknown as { displayName: string }).displayName =
  "CronBuilder";
