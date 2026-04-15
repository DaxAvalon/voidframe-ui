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
  curve?: CurveKind;
  strokeWidth?: number;
}

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
    const resolvedStroke = stroke ?? seriesPalette(1)[0]!;
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
        className={cx("vf-chart-sparkline", className)}
        style={{ width, height, display: "inline-block" }}
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
              stroke="var(--vf-border-2)"
              strokeWidth={1}
              strokeDasharray="3 3"
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
        </svg>
      </div>
    );
  }
);
Sparkline.displayName = "Sparkline";
