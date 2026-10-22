"use client";

// Lightweight data visuals between `Progress` and the d3 charts:
// BarList, TargetProgress, DayDots, StreakBadge, ScaleInput, StatusLine, TagGroup.

import {
  forwardRef,
  useMemo,
  useState,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { cx } from "../utils/cx";
import type { Tone, Hue } from "../types";
import { useControllableState } from "../hooks/useControllableState";
import { useId } from "../hooks/useId";
import { Tag } from "./DataExtended";

export type VisualTone = "neutral" | Tone;

// ── BarList ──────────────────────────────────────────────────────

export interface BarListItem {
  key?: string;
  label: ReactNode;
  value: number;
  tone?: VisualTone;
  /** Secondary text after the value. */
  meta?: ReactNode;
  href?: string;
  onClick?: () => void;
}

export interface BarListProps extends HTMLAttributes<HTMLDivElement> {
  items: BarListItem[];
  /** Bar scale maximum. Default: the largest value. */
  max?: number;
  format?: (value: number) => string;
  showValue?: boolean;
  /** Order bars by value, largest first. Default `"none"`. */
  sort?: "none" | "desc" | "asc";
  /** Accessible name. Default "Bar list". */
  label?: string;
}

/** Ranked horizontal bars: label, bar scaled to the largest value, value. */
export const BarList = forwardRef<HTMLDivElement, BarListProps>(function BarList(
  { items, max, format = (v) => String(v), showValue = true, sort = "none", label = "Bar list", className, ...rest },
  ref
) {
  const sorted = useMemo(() => {
    if (sort === "none") return items;
    return [...items].sort((a, b) => (sort === "desc" ? b.value - a.value : a.value - b.value));
  }, [items, sort]);
  const scale = max ?? Math.max(0, ...items.map((i) => i.value)) || 1;
  return (
    <div ref={ref} role="list" aria-label={label} className={cx("vf-bar-list", className)} {...rest}>
      {sorted.map((item, i) => {
        const pct = Math.max(0, Math.min(100, (item.value / scale) * 100));
        const tone = item.tone ?? "neutral";
        const Label = item.href ? "a" : item.onClick ? "button" : "span";
        return (
          <div key={item.key ?? i} role="listitem" className={cx("vf-bar-list__row", `vf-bar-list__row--${tone}`)} data-tone={tone !== "neutral" ? tone : undefined}>
            <div className="vf-bar-list__track">
              <div className="vf-bar-list__bar" style={{ width: `${pct}%` }} />
              <Label
                className={cx("vf-bar-list__label", Label !== "span" && "vf-bar-list__label--link")}
                {...(Label === "a" ? { href: item.href } : Label === "button" ? { type: "button", onClick: item.onClick } : {})}
              >
                {item.label}
              </Label>
            </div>
            {showValue ? (
              <span className="vf-bar-list__value">
                {format(item.value)}
                {item.meta !== undefined ? <span className="vf-bar-list__meta"> {item.meta}</span> : null}
              </span>
            ) : null}
          </div>
        );
      })}
    </div>
  );
});
BarList.displayName = "BarList";

// ── TargetProgress ───────────────────────────────────────────────

export interface TargetProgressProps extends HTMLAttributes<HTMLDivElement> {
  value: number;
  target: number;
  /** `at-least` (default): meeting or exceeding the target is good; `at-most`: staying under it is. */
  direction?: "at-least" | "at-most";
  unit?: string;
  format?: (value: number) => string;
  label?: ReactNode;
  /** Fraction of the target within which the state is `warning` rather than `danger`. Default 0.1. */
  warnWithin?: number;
  /** Show "value / target" text. Default true. */
  showValues?: boolean;
  /** Show the signed difference to the target. Default false. */
  showDelta?: boolean;
  /** Bar scale maximum. Default `max(value, target) * 1.1`. */
  max?: number;
}

/** State of a value against a target. */
export function targetState(
  value: number,
  target: number,
  direction: "at-least" | "at-most" = "at-least",
  warnWithin = 0.1
): "success" | "warning" | "danger" {
  const met = direction === "at-least" ? value >= target : value <= target;
  if (met) return "success";
  const gap = Math.abs(target - value);
  return gap <= Math.abs(target) * warnWithin ? "warning" : "danger";
}

/** Progress toward (or under) a target with a marker, met/near/missed tone and optional delta. */
export const TargetProgress = forwardRef<HTMLDivElement, TargetProgressProps>(function TargetProgress(
  { value, target, direction = "at-least", unit, format = (v) => String(v), label, warnWithin = 0.1, showValues = true, showDelta = false, max, className, ...rest },
  ref
) {
  const state = targetState(value, target, direction, warnWithin);
  const scale = max ?? Math.max(value, target, 0) * 1.1 || 1;
  const pct = Math.max(0, Math.min(100, (value / scale) * 100));
  const targetPct = Math.max(0, Math.min(100, (target / scale) * 100));
  const delta = value - target;
  const text = `${format(value)}${unit ? ` ${unit}` : ""} / ${format(target)}${unit ? ` ${unit}` : ""}`;
  return (
    <div
      ref={ref}
      className={cx("vf-target-progress", `vf-target-progress--${state}`, className)}
      data-state={state}
      role="meter"
      aria-valuemin={0}
      aria-valuemax={Math.round(scale)}
      aria-valuenow={value}
      aria-valuetext={`${text}, ${state === "success" ? "target met" : state === "warning" ? "near target" : "target missed"}`}
      aria-label={typeof label === "string" ? label : undefined}
      {...rest}
    >
      {(label || showValues) && (
        <div className="vf-target-progress__head">
          {label ? <span className="vf-target-progress__label">{label}</span> : null}
          {showValues ? (
            <span className="vf-target-progress__values">
              {text}
              {showDelta ? (
                <span className="vf-target-progress__delta">
                  {" "}
                  ({delta > 0 ? "+" : ""}
                  {format(delta)}
                  {unit ? ` ${unit}` : ""})
                </span>
              ) : null}
            </span>
          ) : null}
        </div>
      )}
      <div className="vf-target-progress__track">
        <div className="vf-target-progress__fill" style={{ width: `${pct}%` }} />
        <div className="vf-target-progress__marker" style={{ insetInlineStart: `${targetPct}%` }} aria-hidden="true" />
      </div>
    </div>
  );
});
TargetProgress.displayName = "TargetProgress";

// ── DayDots / StreakBadge ────────────────────────────────────────

export interface DayDotsProps extends HTMLAttributes<HTMLDivElement> {
  /** One entry per day, oldest first: `true`/`false`, a count (0 = missed), or `null` for no data. */
  values: Array<boolean | number | null>;
  /** Labels for the accessible description (dates or weekday initials). */
  labels?: string[];
  size?: "sm" | "md";
  tone?: VisualTone;
  /** Accessible name. Default "Last N days". */
  label?: string;
}

/** Last-N-days dot strip: filled for done, hollow for missed, dimmed for no data. */
export const DayDots = forwardRef<HTMLDivElement, DayDotsProps>(function DayDots(
  { values, labels, size = "md", tone = "success", label, className, ...rest },
  ref
) {
  const done = values.filter((v) => v === true || (typeof v === "number" && v > 0)).length;
  const known = values.filter((v) => v !== null).length;
  return (
    <div
      ref={ref}
      role="img"
      aria-label={`${label ?? `Last ${values.length} days`}: ${done} of ${known} done`}
      className={cx("vf-day-dots", `vf-day-dots--${size}`, className)}
      data-tone={tone !== "neutral" ? tone : undefined}
      {...rest}
    >
      {values.map((v, i) => {
        const state = v === null ? "unknown" : v === true || (typeof v === "number" && v > 0) ? "done" : "missed";
        return (
          <span
            key={i}
            className={cx("vf-day-dots__dot", `vf-day-dots__dot--${state}`)}
            data-state={state}
            title={labels?.[i] !== undefined ? `${labels[i]}: ${typeof v === "number" ? v : state}` : undefined}
          />
        );
      })}
    </div>
  );
});
DayDots.displayName = "DayDots";

export interface StreakBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  count: number;
  /** Unit word; pluralised with "s". Default "day". */
  unit?: string;
  /** Personal best, shown after the count. */
  best?: number;
  tone?: VisualTone;
  /** Glyph before the count (none by default: no fire emoji). */
  icon?: ReactNode;
}

/** Plain streak count ("12 days", "best 30"), no celebration. */
export const StreakBadge = forwardRef<HTMLSpanElement, StreakBadgeProps>(function StreakBadge(
  { count, unit = "day", best, tone = "neutral", icon, className, ...rest },
  ref
) {
  const word = count === 1 ? unit : `${unit}s`;
  return (
    <span ref={ref} className={cx("vf-streak-badge", className)} data-tone={tone !== "neutral" ? tone : undefined} {...rest}>
      {icon ? <span className="vf-streak-badge__icon" aria-hidden="true">{icon}</span> : null}
      <span className="vf-streak-badge__count">{count}</span> <span className="vf-streak-badge__unit">{word}</span>
      {best !== undefined ? <span className="vf-streak-badge__best"> · best {best}</span> : null}
    </span>
  );
});
StreakBadge.displayName = "StreakBadge";

// ── ScaleInput ───────────────────────────────────────────────────

export interface ScaleInputProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  min?: number;
  max?: number;
  value?: number | null;
  defaultValue?: number | null;
  onValueChange?: (value: number) => void;
  /** Per-step labels: an array (index 0 = `min`) or a map by value. Unlabelled steps show the number. */
  labels?: string[] | Record<number, string>;
  /** Words under the ends ("Strongly disagree" … "Strongly agree"). */
  endLabels?: [ReactNode, ReactNode];
  renderStep?: (step: { value: number; label: string; selected: boolean }) => ReactNode;
  label?: string;
  name?: string;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
}

/** Labelled 1–N scale (Likert, mood, confidence) as a radio group with arrow-key movement. */
export const ScaleInput = forwardRef<HTMLDivElement, ScaleInputProps>(function ScaleInput(
  { min = 1, max = 5, value, defaultValue, onValueChange, labels, endLabels, renderStep, label, name, disabled, size = "md", className, ...rest },
  ref
) {
  const [current, setCurrent] = useControllableState<number | null>({
    value,
    defaultValue: defaultValue ?? null,
    onChange: (v) => {
      if (v !== null) onValueChange?.(v);
    },
    componentName: "ScaleInput",
  });
  const id = useId();
  const steps = useMemo(() => Array.from({ length: Math.max(0, max - min + 1) }, (_, i) => min + i), [min, max]);
  const labelFor = (v: number) => (Array.isArray(labels) ? labels[v - min] : labels?.[v]) ?? String(v);
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    const base = current ?? min - 1;
    let next: number | null = null;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") next = Math.min(max, base + 1);
    else if (e.key === "ArrowLeft" || e.key === "ArrowDown") next = Math.max(min, base - 1);
    else if (e.key === "Home") next = min;
    else if (e.key === "End") next = max;
    if (next === null) return;
    e.preventDefault();
    setCurrent(next);
    const el = e.currentTarget.querySelector<HTMLElement>(`[data-value="${next}"]`);
    el?.focus();
  };
  return (
    <div
      ref={ref}
      role="radiogroup"
      aria-label={label}
      aria-disabled={disabled || undefined}
      className={cx("vf-scale-input", `vf-scale-input--${size}`, className)}
      onKeyDown={onKey}
      {...rest}
    >
      <div className="vf-scale-input__steps">
        {steps.map((v) => {
          const selected = current === v;
          const text = labelFor(v);
          return (
            <button
              key={v}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={text !== String(v) ? `${v}, ${text}` : String(v)}
              data-value={v}
              data-selected={selected || undefined}
              tabIndex={selected || (current === null && v === min) ? 0 : -1}
              disabled={disabled}
              className={cx("vf-scale-input__step", selected && "vf-scale-input__step--selected")}
              onClick={() => setCurrent(v)}
            >
              {renderStep ? renderStep({ value: v, label: text, selected }) : <span className="vf-scale-input__value">{v}</span>}
            </button>
          );
        })}
      </div>
      {endLabels ? (
        <div className="vf-scale-input__ends" aria-hidden="true">
          <span>{endLabels[0]}</span>
          <span>{endLabels[1]}</span>
        </div>
      ) : null}
      {name ? <input type="hidden" name={name} id={id} value={current ?? ""} /> : null}
    </div>
  );
});
ScaleInput.displayName = "ScaleInput";

// ── StatusLine ───────────────────────────────────────────────────

export interface StatusLineProps extends HTMLAttributes<HTMLDivElement> {
  tone?: VisualTone;
  icon?: ReactNode;
  /** Trailing control (Retry, Dismiss). */
  action?: ReactNode;
  /** Override the live role; default `alert` for danger/warning, `status` otherwise. */
  live?: "status" | "alert" | "none";
  children?: ReactNode;
}

/** One quiet line of status: a dot, the message, an optional action; `role` from its tone. */
export const StatusLine = forwardRef<HTMLDivElement, StatusLineProps>(function StatusLine(
  { tone = "neutral", icon, action, live, className, children, ...rest },
  ref
) {
  const role = live === "none" ? undefined : live ?? (tone === "danger" || tone === "warning" ? "alert" : "status");
  return (
    <div ref={ref} role={role} className={cx("vf-status-line", `vf-status-line--${tone}`, className)} data-tone={tone !== "neutral" ? tone : undefined} {...rest}>
      <span className="vf-status-line__mark" aria-hidden="true">
        {icon ?? ""}
      </span>
      <span className="vf-status-line__text">{children}</span>
      {action ? <span className="vf-status-line__action">{action}</span> : null}
    </div>
  );
});
StatusLine.displayName = "StatusLine";

// ── TagGroup ─────────────────────────────────────────────────────

export interface TagGroupTag {
  label: ReactNode;
  key?: string;
  hue?: Hue;
  color?: string;
}

export interface TagGroupProps extends Omit<HTMLAttributes<HTMLDivElement>, "onSelect"> {
  tags: Array<string | TagGroupTag>;
  /** Tags shown before folding the rest behind "+N more". Default 5; `Infinity` shows all. */
  max?: number;
  /** Let the "+N more" control expand the group. Default true. */
  expandable?: boolean;
  moreLabel?: (n: number) => ReactNode;
  lessLabel?: ReactNode;
  onSelect?: (tag: TagGroupTag, index: number) => void;
  onRemove?: (tag: TagGroupTag, index: number) => void;
  size?: "sm" | "md";
  label?: string;
}

/** A row of `Tag`s that folds the overflow behind "+N more". */
export const TagGroup = forwardRef<HTMLDivElement, TagGroupProps>(function TagGroup(
  { tags, max = 5, expandable = true, moreLabel = (n) => `+${n} more`, lessLabel = "Show fewer", onSelect, onRemove, size = "md", label = "Tags", className, ...rest },
  ref
) {
  const [expanded, setExpanded] = useState(false);
  const all = tags.map((t) => (typeof t === "string" ? { label: t, key: t } : t));
  const shown = expanded ? all : all.slice(0, max);
  const hidden = all.length - shown.length;
  return (
    <div ref={ref} role="list" aria-label={label} className={cx("vf-tag-group", `vf-tag-group--${size}`, className)} {...rest}>
      {shown.map((t, i) => (
        <Tag
          key={t.key ?? i}
          role="listitem"
          hue={t.hue}
          color={t.color}
          className={cx("vf-tag-group__tag", onSelect && "vf-tag-group__tag--selectable")}
          tabIndex={onSelect ? 0 : undefined}
          onClick={onSelect ? () => onSelect(t, i) : undefined}
          onKeyDown={
            onSelect
              ? (e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelect(t, i);
                  }
                }
              : undefined
          }
          onRemove={onRemove ? () => onRemove(t, i) : undefined}
        >
          {t.label}
        </Tag>
      ))}
      {hidden > 0 ? (
        expandable ? (
          <button type="button" className="vf-tag-group__more" onClick={() => setExpanded(true)}>
            {moreLabel(hidden)}
          </button>
        ) : (
          <span className="vf-tag-group__more">{moreLabel(hidden)}</span>
        )
      ) : expanded && all.length > max ? (
        <button type="button" className="vf-tag-group__more" onClick={() => setExpanded(false)}>
          {lessLabel}
        </button>
      ) : null}
    </div>
  );
});
TagGroup.displayName = "TagGroup";
