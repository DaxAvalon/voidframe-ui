"use client";

// Point — scatter/bubble dots. Uses `<rect>` instead of `<circle>` by default
// so strokes stay crisp at 1 device pixel (brutalist).

import { forwardRef, type SVGAttributes } from "react";
import { cx } from "../../utils/cx";

export interface PointDatum {
  x: number;
  y: number;
  size?: number;
}

export type PointShape = "square" | "circle" | "diamond" | "cross";

export interface PointProps extends SVGAttributes<SVGGElement> {
  data: PointDatum[];
  shape?: PointShape;
  /** Default size (side length for square, radius for circle). Default 4. */
  size?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  onPointClick?: (datum: PointDatum, index: number) => void;
  onPointHover?: (
    datum: PointDatum | null,
    index: number,
    e: React.PointerEvent<SVGGElement>
  ) => void;
}

export const Point = forwardRef<SVGGElement, PointProps>(function Point(
  {
    data,
    shape = "square",
    size = 4,
    fill,
    stroke,
    strokeWidth = 1,
    onPointClick,
    onPointHover,
    className,
    ...props
  },
  ref
) {
  return (
    <g ref={ref} className={cx("vf-chart-point", className)} {...props}>
      {data.map((p, i) => {
        const r = (p.size ?? size) / 2;
        const commonProps = {
          fill,
          stroke,
          strokeWidth,
          onClick: onPointClick ? () => onPointClick(p, i) : undefined,
          onPointerMove: onPointHover
            ? (e: React.PointerEvent<SVGGElement>) => onPointHover(p, i, e)
            : undefined,
          onPointerLeave: onPointHover
            ? (e: React.PointerEvent<SVGGElement>) =>
                onPointHover(null, i, e)
            : undefined,
        };
        if (shape === "circle") {
          return (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={r}
              {...commonProps}
              shapeRendering="geometricPrecision"
            />
          );
        }
        if (shape === "diamond") {
          const pts = `${p.x},${p.y - r} ${p.x + r},${p.y} ${p.x},${p.y + r} ${p.x - r},${p.y}`;
          return (
            <polygon
              key={i}
              points={pts}
              {...commonProps}
              shapeRendering="geometricPrecision"
            />
          );
        }
        if (shape === "cross") {
          return (
            <g key={i} {...commonProps}>
              <line
                x1={p.x - r}
                y1={p.y}
                x2={p.x + r}
                y2={p.y}
                stroke={stroke ?? fill}
                strokeWidth={strokeWidth}
              />
              <line
                x1={p.x}
                y1={p.y - r}
                x2={p.x}
                y2={p.y + r}
                stroke={stroke ?? fill}
                strokeWidth={strokeWidth}
              />
            </g>
          );
        }
        return (
          <rect
            key={i}
            x={p.x - r}
            y={p.y - r}
            width={r * 2}
            height={r * 2}
            {...commonProps}
            shapeRendering="crispEdges"
          />
        );
      })}
    </g>
  );
});
Point.displayName = "Point";
