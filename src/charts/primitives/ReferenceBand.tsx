"use client";

// ReferenceBand — renders a shaded rectangle between two values on an axis,
// using scales from ChartContext.

import { forwardRef, type CSSProperties } from "react";
import { useChart } from "./ChartContext";

export interface ReferenceBandProps {
  /** Start value on the axis. */
  from: number;
  /** End value on the axis. */
  to: number;
  /** Orientation: "horizontal" shades a Y range, "vertical" shades an X range. */
  orientation?: "horizontal" | "vertical";
  /** Optional label rendered inside the band. */
  label?: string;
  /** Fill color. Default: var(--vf-text-3). */
  fill?: string;
  /** Fill opacity. Default: 0.1. */
  fillOpacity?: number;
  /** CSS class for the group. */
  className?: string;
  /** Inline styles for the group. */
  style?: CSSProperties;
}

/**
 * Chart primitive: coloured band spanning a value range on an axis. Good for
 * thresholds / SLAs.
 */
export const ReferenceBand = forwardRef<SVGGElement, ReferenceBandProps>(
  function ReferenceBand(
    {
      from,
      to,
      orientation = "horizontal",
      label,
      fill = "var(--vf-text-3)",
      fillOpacity = 0.1,
      className,
      style,
    },
    ref
  ) {
    const { innerWidth, innerHeight, xScale, yScale } = useChart();

    if (orientation === "horizontal") {
      if (!yScale) return null;
      const cast = yScale as (v: number) => number;
      const y1 = cast(from);
      const y2 = cast(to);
      if (!Number.isFinite(y1) || !Number.isFinite(y2)) return null;
      const yTop = Math.min(y1, y2);
      const h = Math.abs(y2 - y1);
      return (
        <g ref={ref} className={className} style={style}>
          <rect
            x={0}
            y={yTop}
            width={innerWidth}
            height={h}
            fill={fill}
            fillOpacity={fillOpacity}
          />
          {label && (
            <text
              x={innerWidth + 4}
              y={yTop + h / 2}
              dy="0.35em"
              fill={fill}
              fontSize={11}
              className="vf-chart-reference-band__label"
            >
              {label}
            </text>
          )}
        </g>
      );
    }

    // vertical
    if (!xScale) return null;
    const cast = xScale as (v: number) => number;
    const x1 = cast(from);
    const x2 = cast(to);
    if (!Number.isFinite(x1) || !Number.isFinite(x2)) return null;
    const xLeft = Math.min(x1, x2);
    const w = Math.abs(x2 - x1);
    return (
      <g ref={ref} className={className} style={style}>
        <rect
          x={xLeft}
          y={0}
          width={w}
          height={innerHeight}
          fill={fill}
          fillOpacity={fillOpacity}
        />
        {label && (
          <text
            x={xLeft + w / 2}
            y={-6}
            textAnchor="middle"
            fill={fill}
            fontSize={11}
            className="vf-chart-reference-band__label"
          >
            {label}
          </text>
        )}
      </g>
    );
  }
);
ReferenceBand.displayName = "ReferenceBand";
