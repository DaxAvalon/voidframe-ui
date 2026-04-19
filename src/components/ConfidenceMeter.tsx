"use client";

import { forwardRef, memo, useMemo, type HTMLAttributes } from "react";
import { cx } from "../utils/cx";

export interface ConfidenceZone {
  min: number;
  max: number;
  label: string;
  color?: string;
}

export interface ConfidenceMeterProps extends HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  label?: string;
  kind?: "bar" | "gauge" | "ring" | "text-only";
  zones?: ConfidenceZone[];
  showLabel?: boolean;
  showValue?: boolean;
  valueFormat?: (value: number) => string;
  size?: "sm" | "md" | "lg";
  animate?: boolean;
}

const DEFAULT_ZONES: ConfidenceZone[] = [
  { min: 0, max: 0.3, label: "Low", color: "var(--vf-red, #ef4444)" },
  { min: 0.3, max: 0.7, label: "Medium", color: "var(--vf-amber, #f59e0b)" },
  { min: 0.7, max: 1.0, label: "High", color: "var(--vf-green, #22c55e)" },
];

function getZone(value: number, zones: ConfidenceZone[]): ConfidenceZone | undefined {
  return zones.find((z) => value >= z.min && value <= z.max);
}

const SVG_SIZE = 100;
const STROKE_WIDTH = 10;
const RADIUS = (SVG_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const ConfidenceMeterImpl = forwardRef<HTMLDivElement, ConfidenceMeterProps>(
  function ConfidenceMeter(
    {
      value: rawValue,
      max = 1,
      label,
      kind = "bar",
      zones = DEFAULT_ZONES,
      showLabel = true,
      showValue = true,
      valueFormat,
      size = "md",
      animate = true,
      className,
      style,
      ...props
    },
    ref
  ) {
    const value = Math.min(max, Math.max(0, rawValue));
    const pct = max > 0 ? value / max : 0;
    const zone = useMemo(() => getZone(pct, zones), [pct, zones]);
    const zoneColor = zone?.color ?? "var(--vf-text-2)";
    const zoneLabel = zone?.label ?? "";

    const formattedValue = valueFormat
      ? valueFormat(value)
      : `${Math.round(pct * 100)}%`;

    const zoneClass = cx(
      pct <= 0.3 && "vf-confidence-meter--low",
      pct > 0.3 && pct <= 0.7 && "vf-confidence-meter--medium",
      pct > 0.7 && "vf-confidence-meter--high"
    );

    return (
      <div
        ref={ref}
        className={cx(
          "vf-confidence-meter",
          `vf-confidence-meter--${kind}`,
          `vf-confidence-meter--${size}`,
          zoneClass,
          className
        )}
        style={style}
        role="meter"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label ?? "Confidence"}
        {...props}
      >
        {kind === "bar" && (
          <div className="vf-confidence-meter__bar">
            <div
              className="vf-confidence-meter__bar-fill"
              style={{
                width: `${pct * 100}%`,
                backgroundColor: zoneColor,
                transition: animate ? "width 0.3s ease" : "none",
              }}
            />
          </div>
        )}

        {kind === "gauge" && (
          <svg
            className="vf-confidence-meter__gauge"
            viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE / 2 + STROKE_WIDTH}`}
          >
            {/* Background arc */}
            <path
              d={`M ${STROKE_WIDTH / 2} ${SVG_SIZE / 2} A ${RADIUS} ${RADIUS} 0 0 1 ${SVG_SIZE - STROKE_WIDTH / 2} ${SVG_SIZE / 2}`}
              fill="none"
              stroke="var(--vf-border-2)"
              strokeWidth={STROKE_WIDTH}
              strokeLinecap="round"
            />
            {/* Foreground arc */}
            <path
              d={`M ${STROKE_WIDTH / 2} ${SVG_SIZE / 2} A ${RADIUS} ${RADIUS} 0 0 1 ${SVG_SIZE - STROKE_WIDTH / 2} ${SVG_SIZE / 2}`}
              fill="none"
              stroke={zoneColor}
              strokeWidth={STROKE_WIDTH}
              strokeLinecap="round"
              strokeDasharray={`${Math.PI * RADIUS}`}
              strokeDashoffset={`${Math.PI * RADIUS * (1 - pct)}`}
              style={{ transition: animate ? "stroke-dashoffset 0.3s ease" : "none" }}
            />
          </svg>
        )}

        {kind === "ring" && (
          <svg
            className="vf-confidence-meter__ring"
            viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
          >
            <circle
              cx={SVG_SIZE / 2}
              cy={SVG_SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke="var(--vf-border-2)"
              strokeWidth={STROKE_WIDTH}
            />
            <circle
              cx={SVG_SIZE / 2}
              cy={SVG_SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke={zoneColor}
              strokeWidth={STROKE_WIDTH}
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={CIRCUMFERENCE * (1 - pct)}
              transform={`rotate(-90 ${SVG_SIZE / 2} ${SVG_SIZE / 2})`}
              style={{ transition: animate ? "stroke-dashoffset 0.3s ease" : "none" }}
            />
          </svg>
        )}

        {showValue && (
          <span className="vf-confidence-meter__value">{formattedValue}</span>
        )}

        {showLabel && zoneLabel && (
          <span className="vf-confidence-meter__label">{zoneLabel}</span>
        )}

        {label && (
          <span className="vf-confidence-meter__label">{label}</span>
        )}
      </div>
    );
  }
);
ConfidenceMeterImpl.displayName = "ConfidenceMeter";
export const ConfidenceMeter = memo(ConfidenceMeterImpl);
(ConfidenceMeter as unknown as { displayName: string }).displayName =
  "ConfidenceMeter";
