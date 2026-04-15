"use client";

// Line — renders a single line path computed from `(x, y)` points with a
// curve interpolator.

import { forwardRef, type SVGAttributes } from "react";
import { line as d3Line } from "d3-shape";
import { cx } from "../../utils/cx";
import { resolveCurve, type CurveKind } from "../math/curves";

export interface LinePoint {
  x: number;
  y: number;
  defined?: boolean;
}

export interface LineProps
  extends Omit<SVGAttributes<SVGPathElement>, "stroke"> {
  data: LinePoint[];
  stroke?: string;
  strokeWidth?: number;
  curve?: CurveKind;
  /** Dashed stroke. Default false. */
  dashed?: boolean;
}

export const Line = forwardRef<SVGPathElement, LineProps>(function Line(
  { data, stroke, strokeWidth = 1.5, curve = "linear", dashed, className, ...props },
  ref
) {
  const path = d3Line<LinePoint>()
    .x((p) => p.x)
    .y((p) => p.y)
    .defined((p) => p.defined !== false)
    .curve(resolveCurve(curve))(data);
  if (!path) return null;
  return (
    <path
      ref={ref}
      className={cx("vf-chart-line", className)}
      d={path}
      fill="none"
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeDasharray={dashed ? "4 3" : undefined}
      shapeRendering="geometricPrecision"
      {...props}
    />
  );
});
Line.displayName = "Line";
