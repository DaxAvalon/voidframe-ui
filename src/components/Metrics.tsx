"use client";

// Phase 9 — Metrics: StatGroup, MetricCard, CircularProgress, Gauge,
// SegmentedProgress, TrendIndicator, StatusIndicator.

import {
  forwardRef,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { cx } from "../utils/cx";
import { toneAttrs } from "../utils/toneAttrs";
import { Label } from "./Text";
import { Stat, type StatTone } from "./Data";

// ── StatGroup ────────────────────────────────────────────────

export interface StatGroupProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  divided?: boolean;
  /**
   * Render children in a CSS grid with `N` equal columns rather than the
   * default horizontal flex row. Useful for 3-up / 4-up stat dashboards
   * that previously forced consumers to wrap in their own grid. Omit or
   * set to 0 to keep the default row behavior.
   */
  columns?: number;
}

/**
 * Row or grid of `Stat`s with consistent spacing and optional dividers.
 * Pass `columns` for an N-column grid; omit for the default horizontal row.
 */
export const StatGroup = forwardRef<HTMLDivElement, StatGroupProps>(
  function StatGroup(
    { divided = true, columns, className, children, style, ...props },
    ref
  ) {
    const gridStyle: React.CSSProperties | undefined =
      columns && columns > 0
        ? {
            display: "grid",
            gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
            ...style,
          }
        : style;
    return (
      <div
        ref={ref}
        className={cx(
          "vf-stat-group",
          divided && "vf-stat-group--divided",
          columns && "vf-stat-group--grid",
          className
        )}
        style={gridStyle}
        {...props}
      >
        {children}
      </div>
    );
  }
);
StatGroup.displayName = "StatGroup";

// ── MetricCard ───────────────────────────────────────────────

export interface MetricCardProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  title: ReactNode;
  value: ReactNode;
  delta?: { value: number; direction: "up" | "down" };
  sparkline?: number[];
  subtitle?: ReactNode;
  icon?: ReactNode;
  tone?: StatTone;
}

/**
 * Dashboard card showing a metric, delta, and optional sparkline. Richer
 * variant of `BigNumber`.
 */
export const MetricCard = forwardRef<HTMLDivElement, MetricCardProps>(
  function MetricCard(
    {
      title,
      value,
      delta,
      sparkline,
      subtitle,
      icon,
      tone = "neutral",
      className,
      ...props
    },
    ref
  ) {
    const ta = toneAttrs("vf-metric-card", { tone });
    return (
      <div
        ref={ref}
        className={cx(ta.className, className)}
        {...ta.attrs}
        {...props}
      >
        <div className="vf-metric-card__head">
          {icon && <span className="vf-metric-card__icon">{icon}</span>}
          <Label>{title}</Label>
        </div>
        <div className="vf-metric-card__value">{value}</div>
        {delta && (
          <div
            className={cx(
              "vf-metric-card__delta",
              `vf-metric-card__delta--${delta.direction}`
            )}
          >
            {delta.direction === "up" ? "↑" : "↓"} {Math.abs(delta.value).toFixed(1)}%
          </div>
        )}
        {sparkline && sparkline.length > 1 && (
          <Stat
            aria-hidden="true"
            label=""
            value=""
            trend={sparkline}
            tone={tone}
            className="vf-metric-card__spark"
          />
        )}
        {subtitle && <div className="vf-metric-card__sub">{subtitle}</div>}
      </div>
    );
  }
);
MetricCard.displayName = "MetricCard";

// ── CircularProgress ─────────────────────────────────────────

export interface CircularProgressProps extends HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  size?: number;
  stroke?: number;
  showLabel?: boolean;
  /** Indeterminate variant: spins if true. */
  indeterminate?: boolean;
  tone?: "neutral" | "success" | "danger" | "warning";
  style?: CSSProperties;
}

/**
 * Circular progress indicator. Supports determinate (`value`) or
 * indeterminate mode; sizes and thicknesses configurable.
 */
export const CircularProgress = forwardRef<HTMLDivElement, CircularProgressProps>(
  function CircularProgress(
    {
      value = 0,
      max = 100,
      size = 48,
      stroke = 4,
      showLabel,
      indeterminate,
      tone = "neutral",
      className,
      style,
      ...props
    },
    ref
  ) {
    const pct = Math.min(100, Math.max(0, (value / max) * 100));
    const radius = (size - stroke) / 2;
    const circumference = 2 * Math.PI * radius;
    const dashOffset = circumference * (1 - pct / 100);
    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuenow={indeterminate ? undefined : value}
        aria-valuemin={0}
        aria-valuemax={max}
        className={cx(
          "vf-circ-progress",
          `vf-circ-progress--${tone}`,
          indeterminate && "vf-circ-progress--indeterminate",
          className
        )}
        style={{ width: size, height: size, ...style }}
        {...props}
      >
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--vf-border-2)"
            strokeWidth={stroke}
          />
          <circle
            className="vf-circ-progress__fill"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeLinecap="round"
            stroke="currentColor"
            strokeWidth={stroke}
            strokeDasharray={circumference}
            strokeDashoffset={indeterminate ? circumference * 0.75 : dashOffset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </svg>
        {showLabel && !indeterminate && (
          <span className="vf-circ-progress__label">{Math.round(pct)}%</span>
        )}
      </div>
    );
  }
);
CircularProgress.displayName = "CircularProgress";

// ── SegmentedProgress ────────────────────────────────────────

export interface SegmentedProgressSegment {
  value: number;
  label?: ReactNode;
  tone?: "neutral" | "success" | "warning" | "danger" | "info";
  color?: string;
}

export interface SegmentedProgressProps extends HTMLAttributes<HTMLDivElement> {
  segments: SegmentedProgressSegment[];
  total?: number;
  showLabels?: boolean;
}

/**
 * Progress bar composed of discrete segments filled left-to-right as
 * progress advances.
 */
export const SegmentedProgress = forwardRef<HTMLDivElement, SegmentedProgressProps>(
  function SegmentedProgress(
    { segments, total, showLabels, className, ...props },
    ref
  ) {
    const sum =
      total ?? segments.reduce((acc, s) => acc + Math.max(0, s.value), 0);
    return (
      <div
        ref={ref}
        className={cx("vf-seg-progress", className)}
        role="group"
        aria-label="Segmented progress"
        {...props}
      >
        <div className="vf-seg-progress__track">
          {segments.map((s, i) => {
            const pct = sum > 0 ? (s.value / sum) * 100 : 0;
            return (
              <div
                key={i}
                className={cx(
                  "vf-seg-progress__seg",
                  `vf-seg-progress__seg--${s.tone ?? "neutral"}`
                )}
                style={{
                  width: `${pct}%`,
                  ...(s.color ? { background: s.color } : {}),
                }}
                aria-label={
                  typeof s.label === "string"
                    ? `${s.label} ${pct.toFixed(0)}%`
                    : `${pct.toFixed(0)}%`
                }
              />
            );
          })}
        </div>
        {showLabels && (
          <div className="vf-seg-progress__legend">
            {segments.map((s, i) => (
              <span key={i} className="vf-seg-progress__legend-item">
                <span
                  className={cx(
                    "vf-seg-progress__swatch",
                    `vf-seg-progress__swatch--${s.tone ?? "neutral"}`
                  )}
                  style={s.color ? { background: s.color } : undefined}
                />
                {s.label}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  }
);
SegmentedProgress.displayName = "SegmentedProgress";

// ── Gauge ────────────────────────────────────────────────────

export interface GaugeZone {
  from: number;
  to: number;
  tone: "success" | "warning" | "danger" | "neutral";
  color?: string;
}

export interface GaugeProps extends HTMLAttributes<HTMLDivElement> {
  value: number;
  min?: number;
  max?: number;
  size?: number;
  stroke?: number;
  zones?: GaugeZone[];
  label?: ReactNode;
  showValue?: boolean;
}

/**
 * Radial gauge for a single value in a range. Configurable arc span, tick
 * marks, and threshold bands.
 */
export const Gauge = forwardRef<HTMLDivElement, GaugeProps>(function Gauge(
  {
    value,
    min = 0,
    max = 100,
    size = 120,
    stroke = 10,
    zones,
    label,
    showValue = true,
    className,
    ...props
  },
  ref
) {
  const range = max - min || 1;
  const pct = Math.min(1, Math.max(0, (value - min) / range));
  const halfCircle = Math.PI * (size / 2 - stroke);
  const dashOffset = halfCircle * (1 - pct);
  return (
    <div
      ref={ref}
      role="meter"
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value}
      className={cx("vf-gauge", className)}
      style={{ width: size, height: size / 2 + stroke }}
      {...props}
    >
      <svg
        width={size}
        height={size / 2 + stroke}
        viewBox={`0 0 ${size} ${size / 2 + stroke}`}
      >
        <path
          d={`M ${stroke / 2} ${size / 2} A ${size / 2 - stroke / 2} ${size / 2 - stroke / 2} 0 0 1 ${size - stroke / 2} ${size / 2}`}
          fill="none"
          stroke="var(--vf-border-2)"
          strokeWidth={stroke}
        />
        {zones?.map((z, i) => {
          const zStart = Math.max(0, (z.from - min) / range);
          const zEnd = Math.min(1, (z.to - min) / range);
          if (zEnd <= zStart) return null;
          return (
            <path
              key={i}
              d={`M ${stroke / 2} ${size / 2} A ${size / 2 - stroke / 2} ${size / 2 - stroke / 2} 0 0 1 ${size - stroke / 2} ${size / 2}`}
              fill="none"
              className={cx("vf-gauge__zone", `vf-gauge__zone--${z.tone}`)}
              stroke={z.color ?? "currentColor"}
              strokeWidth={stroke}
              strokeDasharray={`${halfCircle * (zEnd - zStart)} ${halfCircle}`}
              strokeDashoffset={-halfCircle * zStart}
            />
          );
        })}
        <path
          d={`M ${stroke / 2} ${size / 2} A ${size / 2 - stroke / 2} ${size / 2 - stroke / 2} 0 0 1 ${size - stroke / 2} ${size / 2}`}
          fill="none"
          stroke="var(--vf-accent, var(--vf-green))"
          strokeWidth={stroke}
          strokeDasharray={halfCircle}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
        />
      </svg>
      {(label || showValue) && (
        <div className="vf-gauge__label">
          {label}
          {showValue && <strong>{value}</strong>}
        </div>
      )}
    </div>
  );
});
Gauge.displayName = "Gauge";

// ── TrendIndicator ───────────────────────────────────────────

export interface TrendIndicatorProps extends HTMLAttributes<HTMLSpanElement> {
  value: number;
  /** "percent" or "number". Default "percent". */
  format?: "percent" | "number";
  /** Show the ▲/▼ arrow. Default true. */
  showArrow?: boolean;
}

/**
 * Up/down / flat arrow plus percentage showing a delta. Tones follow
 * direction (success on rise, danger on fall, with invertable semantics).
 */
export const TrendIndicator = forwardRef<HTMLSpanElement, TrendIndicatorProps>(
  function TrendIndicator(
    { value, format = "percent", showArrow = true, className, ...props },
    ref
  ) {
    const dir = value >= 0 ? "up" : "down";
    return (
      <span
        ref={ref}
        className={cx(
          "vf-trend",
          `vf-trend--${dir}`,
          className
        )}
        {...props}
      >
        {showArrow && <span aria-hidden="true">{dir === "up" ? "▲" : "▼"}</span>}
        <span>
          {Math.abs(value).toFixed(1)}
          {format === "percent" ? "%" : ""}
        </span>
      </span>
    );
  }
);
TrendIndicator.displayName = "TrendIndicator";

// ── StatusIndicator ──────────────────────────────────────────

export type StatusIndicatorStatus =
  | "online"
  | "offline"
  | "away"
  | "busy"
  | "loading";

export interface StatusIndicatorProps extends HTMLAttributes<HTMLSpanElement> {
  status: StatusIndicatorStatus;
  label?: ReactNode;
}

/**
 * Coloured dot plus label indicating a status (`online`, `idle`, `busy`,
 * `offline`). Optional pulse.
 */
export const StatusIndicator = forwardRef<HTMLSpanElement, StatusIndicatorProps>(
  function StatusIndicator({ status, label, className, ...props }, ref) {
    return (
      <span
        ref={ref}
        className={cx(
          "vf-status-indicator",
          `vf-status-indicator--${status}`,
          className
        )}
        role="status"
        aria-label={typeof label === "string" ? label : status}
        {...props}
      >
        <span className="vf-status-indicator__dot" aria-hidden="true" />
        {label && <span className="vf-status-indicator__label">{label}</span>}
      </span>
    );
  }
);
StatusIndicator.displayName = "StatusIndicator";
