"use client";

// ReferenceLine — renders a horizontal or vertical reference line at a
// specific value on the Y or X axis, using the scales from ChartContext.

import { forwardRef, type CSSProperties } from "react";
import { useChart } from "./ChartContext";

export interface ReferenceLineProps {
  /** The value on the axis where the line should appear. */
  value: number;
  /** Orientation: "horizontal" draws at a Y value, "vertical" at an X value. */
  orientation?: "horizontal" | "vertical";
  /** Label rendered next to the line. */
  label?: string;
  /** Stroke color. Default: var(--vf-text-3). */
  stroke?: string;
  /** Stroke dash array. Default: "4 3" (dashed). */
  strokeDasharray?: string;
  /** CSS class for the line group. */
  className?: string;
  /** Inline styles for the group. */
  style?: CSSProperties;
}

export const ReferenceLine = forwardRef<SVGGElement, ReferenceLineProps>(
  function ReferenceLine(
    {
      value,
      orientation = "horizontal",
      label,
      stroke = "var(--vf-text-3)",
      strokeDasharray = "4 3",
      className,
      style,
    },
    ref
  ) {
    const { innerWidth, innerHeight, xScale, yScale } = useChart();

    if (orientation === "horizontal") {
      if (!yScale) return null;
      const y = (yScale as (v: number) => number)(value);
      if (!Number.isFinite(y)) return null;
      return (
        <g ref={ref} className={className} style={style}>
          <line
            x1={0}
            y1={y}
            x2={innerWidth}
            y2={y}
            stroke={stroke}
            strokeDasharray={strokeDasharray}
            shapeRendering="crispEdges"
          />
          {label && (
            <text
              x={innerWidth + 4}
              y={y}
              dy="0.35em"
              fill={stroke}
              fontSize={11}
              className="vf-chart-reference-line__label"
            >
              {label}
            </text>
          )}
        </g>
      );
    }

    // vertical
    if (!xScale) return null;
    const x = (xScale as (v: number) => number)(value);
    if (!Number.isFinite(x)) return null;
    return (
      <g ref={ref} className={className} style={style}>
        <line
          x1={x}
          y1={0}
          x2={x}
          y2={innerHeight}
          stroke={stroke}
          strokeDasharray={strokeDasharray}
          shapeRendering="crispEdges"
        />
        {label && (
          <text
            x={x}
            y={-6}
            textAnchor="middle"
            fill={stroke}
            fontSize={11}
            className="vf-chart-reference-line__label"
          >
            {label}
          </text>
        )}
      </g>
    );
  }
);
ReferenceLine.displayName = "ReferenceLine";
