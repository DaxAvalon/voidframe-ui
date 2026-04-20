"use client";

// Area — renders a filled band between y0 and y1 with a curve interpolator.

import { forwardRef, type SVGAttributes } from "react";
import { area as d3Area } from "d3-shape";
import { cx } from "../../utils/cx";
import { resolveCurve, type CurveKind } from "../math/curves";

export interface AreaPoint {
  x: number;
  y0: number;
  y1: number;
  defined?: boolean;
}

export interface AreaProps
  extends Omit<SVGAttributes<SVGPathElement>, "fill"> {
  data: AreaPoint[];
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  curve?: CurveKind;
  /** Fill opacity 0..1. Default 0.35. */
  fillOpacity?: number;
}

/**
 * Area series primitive for line/area charts. Fills between a baseline and a
 * datum series using the enclosing chart's X/Y scales.
 */
export const Area = forwardRef<SVGPathElement, AreaProps>(function Area(
  {
    data,
    fill,
    stroke,
    strokeWidth = 0,
    curve = "linear",
    fillOpacity = 0.35,
    className,
    ...props
  },
  ref
) {
  const path = d3Area<AreaPoint>()
    .x((p) => p.x)
    .y0((p) => p.y0)
    .y1((p) => p.y1)
    .defined((p) => p.defined !== false)
    .curve(resolveCurve(curve))(data);
  if (!path) return null;
  return (
    <path
      ref={ref}
      className={cx("vf-chart-area", className)}
      d={path}
      fill={fill}
      fillOpacity={fillOpacity}
      stroke={stroke}
      strokeWidth={strokeWidth}
      shapeRendering="geometricPrecision"
      {...props}
    />
  );
});
Area.displayName = "Area";
