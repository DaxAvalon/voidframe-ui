"use client";

// Arc — pie/donut slice. Wraps d3-shape.arc with a thin React interface.

import { forwardRef, type SVGAttributes } from "react";
import { arc as d3Arc } from "d3-shape";
import { cx } from "../../utils/cx";

export interface ArcDatum {
  startAngle: number;
  endAngle: number;
  padAngle?: number;
  key?: string;
  value?: number;
}

export interface ArcProps extends SVGAttributes<SVGGElement> {
  data: ArcDatum[];
  innerRadius: number;
  outerRadius: number;
  cornerRadius?: number;
  fill?: string;
  fillFor?: (datum: ArcDatum, index: number) => string | undefined;
  stroke?: string;
  strokeWidth?: number;
  onArcClick?: (datum: ArcDatum, index: number) => void;
  onArcHover?: (
    datum: ArcDatum | null,
    index: number,
    e: React.PointerEvent<SVGPathElement>
  ) => void;
}

export const Arc = forwardRef<SVGGElement, ArcProps>(function Arc(
  {
    data,
    innerRadius,
    outerRadius,
    cornerRadius = 0,
    fill,
    fillFor,
    stroke,
    strokeWidth,
    onArcClick,
    onArcHover,
    className,
    ...props
  },
  ref
) {
  const arcGen = d3Arc<ArcDatum>()
    .innerRadius(innerRadius)
    .outerRadius(outerRadius)
    .cornerRadius(cornerRadius)
    .padAngle((d) => d.padAngle ?? 0);

  return (
    <g ref={ref} className={cx("vf-chart-arc", className)} {...props}>
      {data.map((d, i) => {
        const path = arcGen(d) ?? "";
        return (
          <path
            key={d.key ?? i}
            d={path}
            fill={fillFor?.(d, i) ?? fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
            onClick={onArcClick ? () => onArcClick(d, i) : undefined}
            onPointerMove={
              onArcHover ? (e) => onArcHover(d, i, e) : undefined
            }
            onPointerLeave={
              onArcHover
                ? (e) =>
                    onArcHover(null, i, e as React.PointerEvent<SVGPathElement>)
                : undefined
            }
          />
        );
      })}
    </g>
  );
});
Arc.displayName = "Arc";
