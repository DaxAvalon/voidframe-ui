"use client";

// Sparkline — inline micro-chart for trends. Uses stage-1 scales + Line/Area
// series. No axes, no legend, no tooltip by default.

import { forwardRef, type HTMLAttributes } from "react";
import { linearScale } from "./math/scales";
import { seriesPalette } from "./math/color";
import { Line } from "./series/Line";
import { Area } from "./series/Area";
import { Point } from "./series/Point";
import { cx } from "../utils/cx";
import type { CurveKind } from "./math/curves";

export interface SparklineProps extends HTMLAttributes<HTMLDivElement> {
  data: number[];
  width?: number;
  height?: number;
  stroke?: string;
  fill?: string;
  showArea?: boolean;
  showPoints?: boolean;
  /** Draw a dashed reference line at the mean. Default false. */
  showTrend?: boolean;
  /** Mark the latest point with a filled dot (the "now" value). Default false. */
  highlightLast?: boolean;
  /** Semantic colour for the stroke (and the last-point marker). Overrides the palette default; `stroke` wins. */
  tone?: "neutral" | "success" | "warning" | "danger" | "info";
  curve?: CurveKind;
  strokeWidth?: number;
}

const SPARK_TONE: Record<NonNullable<SparklineProps["tone"]>, string> = {
  neutral: "var(--vf-text-2)",
  success: "var(--vf-success)",
  warning: "var(--vf-warning)",
  danger: "var(--vf-danger)",
  info: "var(--vf-info)",
};

/**
 * Tiny inline trend chart. No axes / labels — context comes from the
 * surrounding content.
 */
export const Sparkline = forwardRef<HTMLDivElement, SparklineProps>(
  function Sparkline(
    {
      data,
      width = 120,
      height = 32,
      stroke,
      fill,
      showArea,
      showPoints,
      showTrend,
      highlightLast,
      tone,
      curve = "linear",
      strokeWidth = 1.5,
      className,
      ...props
    },
    ref
  ) {
    if (data.length === 0) {
      return (
        <div
          ref={ref}
          className={cx("vf-chart-sparkline", className)}
          style={{ width, height }}
          {...props}
        />
      );
    }
    const resolvedStroke = stroke ?? (tone ? SPARK_TONE[tone] : seriesPalette(1)[0]!);
    const resolvedFill = fill ?? resolvedStroke;
    const xScale = linearScale({
      domain: [0, Math.max(1, data.length - 1)],
      range: [0, width],
    });
    const [lo, hi] = [Math.min(...data), Math.max(...data)];
    const yScale = linearScale({
      domain: lo === hi ? [lo - 1, hi + 1] : [lo, hi],
      range: [height - 1, 1],
    });
    const points = data.map((v, i) => ({
      x: xScale(i),
      y: yScale(v),
    }));
    const mean = data.reduce((a, b) => a + b, 0) / data.length;
    const meanY = yScale(mean);
    return (
      <div
        ref={ref}
        className={cx("vf-chart-sparkline", tone && `vf-chart-sparkline--${tone}`, className)}
        style={{ width, height, display: "inline-block" }}
        data-tone={tone}
        {...props}
      >
        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label="Sparkline"
        >
          {showArea && (
            <Area
              data={points.map((p) => ({ x: p.x, y0: height, y1: p.y }))}
              fill={resolvedFill}
              fillOpacity={0.28}
              curve={curve}
            />
          )}
          {showTrend && (
            <line
              x1={0}
              y1={meanY}
              x2={width}
              y2={meanY}
              stroke={stroke ?? 'var(--vf-border-2)'}
              strokeWidth={1}
              strokeDasharray="3 3"
              strokeOpacity={stroke ? 0.5 : 1}
            />
          )}
          <Line
            data={points}
            stroke={resolvedStroke}
            strokeWidth={strokeWidth}
            curve={curve}
          />
          {showPoints && (
            <Point
              data={points}
              shape="square"
              size={3}
              fill={resolvedStroke}
            />
          )}
          {highlightLast && points.length > 0 && (
            <circle
              className="vf-chart-sparkline__last"
              cx={Math.min(width - 2.5, points[points.length - 1]!.x)}
              cy={points[points.length - 1]!.y}
              r={2.5}
              fill={resolvedStroke}
              stroke="var(--vf-bg-1)"
              strokeWidth={1}
            />
          )}
        </svg>
      </div>
    );
  }
);
Sparkline.displayName = "Sparkline";
