"use client";

// Bar — a single rect series keyed to a band/point scale. Used by BarChart
// (vertical + horizontal), Histogram, CalendarHeatmap (via grid cells).

import { forwardRef, type SVGAttributes } from "react";
import { cx } from "../../utils/cx";

export interface BarDatum {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface BarProps extends Omit<SVGAttributes<SVGGElement>, "onClick"> {
  data: BarDatum[];
  fill?: string;
  /** Per-bar override. Return undefined to use the default `fill`. */
  fillFor?: (datum: BarDatum, index: number) => string | undefined;
  onBarClick?: (datum: BarDatum, index: number) => void;
  onBarHover?: (
    datum: BarDatum | null,
    index: number,
    e: React.PointerEvent<SVGRectElement>
  ) => void;
  /** Corner radius. Default 0 (brutalist). */
  radius?: number;
}

export const Bar = forwardRef<SVGGElement, BarProps>(function Bar(
  {
    data,
    fill,
    fillFor,
    onBarClick,
    onBarHover,
    radius = 0,
    className,
    ...props
  },
  ref
) {
  return (
    <g ref={ref} className={cx("vf-chart-bar", className)} {...props}>
      {data.map((d, i) => (
        <rect
          key={i}
          className="vf-chart-bar__rect"
          x={d.x}
          y={d.y}
          width={Math.max(0, d.width)}
          height={Math.max(0, d.height)}
          rx={radius}
          ry={radius}
          fill={fillFor?.(d, i) ?? fill}
          shapeRendering="crispEdges"
          onClick={onBarClick ? () => onBarClick(d, i) : undefined}
          onPointerMove={
            onBarHover ? (e) => onBarHover(d, i, e) : undefined
          }
          onPointerLeave={
            onBarHover
              ? (e) => onBarHover(null, i, e as React.PointerEvent<SVGRectElement>)
              : undefined
          }
        />
      ))}
    </g>
  );
});
Bar.displayName = "Bar";
