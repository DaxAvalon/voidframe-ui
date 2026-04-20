"use client";

// Axis primitive — renders a 1px axis line + evenly spaced tick marks with
// labels. Inherits scale from ChartContext when a scale isn't passed.

import { forwardRef, useMemo } from "react";
import { cx } from "../../utils/cx";
import type { AxisTickScale } from "../math/ticks";
import { generateTicks, type Tick, type TickOptions } from "../math/ticks";
import { useChart } from "./ChartContext";

export type AxisOrientation = "bottom" | "top" | "left" | "right";

export interface AxisProps
  extends Omit<
    React.SVGAttributes<SVGGElement>,
    "orientation" | "scale" | "format"
  > {
  orientation: AxisOrientation;
  scale?: AxisTickScale;
  /** Target tick count. Ignored for band/point scales. Default 5. */
  ticks?: number;
  /** Custom label formatter. */
  format?: (value: unknown) => string;
  /** Optional axis title placed at the far end. */
  label?: string;
  /** Auto-rotates labels 45° when they would overlap. Default true for X axes. */
  autoRotate?: boolean;
  /** Tick line length in px. Default 6. */
  tickSize?: number;
  /** Hide the axis baseline. Default false. */
  hideLine?: boolean;
  /** Hide tick lines but keep labels. Default false. */
  hideTickLines?: boolean;
  /** Hide tick labels. Default false. */
  hideLabels?: boolean;
}

const LABEL_OFFSET = 8;

export const Axis = forwardRef<SVGGElement, AxisProps>(function Axis(
  {
    orientation,
    scale: scaleProp,
    ticks: tickCount,
    format,
    label,
    autoRotate,
    tickSize = 6,
    hideLine,
    hideTickLines,
    hideLabels,
    className,
    ...props
  },
  ref
) {
  const ctx = useChart();
  const isX = orientation === "bottom" || orientation === "top";
  const scale = scaleProp ?? (isX ? ctx.xScale : ctx.yScale);
  if (!scale) {
    throw new Error(
      `<Axis orientation="${orientation}"> requires a scale (passed via prop or ChartFrame's ${isX ? "xScale" : "yScale"} prop).`
    );
  }

  const options = useMemo<TickOptions>(
    () => ({
      count: tickCount,
      format: format as ((v: unknown) => string) | undefined,
    }),
    [tickCount, format]
  );
  const tickList: Tick<unknown>[] = useMemo(
    () => generateTicks(scale, options),
    [scale, options]
  );

  const rotate = autoRotate ?? isX;
  const { innerWidth, innerHeight } = ctx;

  // Axis baseline geometry.
  let baselineX1 = 0;
  let baselineY1 = 0;
  let baselineX2 = 0;
  let baselineY2 = 0;
  if (orientation === "bottom") {
    baselineY1 = innerHeight;
    baselineY2 = innerHeight;
    baselineX2 = innerWidth;
  } else if (orientation === "top") {
    baselineX2 = innerWidth;
  } else if (orientation === "left") {
    baselineY2 = innerHeight;
  } else {
    baselineX1 = innerWidth;
    baselineX2 = innerWidth;
    baselineY2 = innerHeight;
  }

  // Determine whether labels need rotation. For X axes, rotate when tick
  // density exceeds a rough width budget; for Y axes, rotate when density
  // exceeds a rough height budget.
  const shouldRotate =
    rotate &&
    tickList.length > 0 &&
    (isX
      ? innerWidth / tickList.length < 44
      : innerHeight / tickList.length < 18);

  return (
    <g
      ref={ref}
      className={cx(
        "vf-chart-axis",
        `vf-chart-axis--${orientation}`,
        className
      )}
      {...props}
    >
      {!hideLine && (
        <line
          className="vf-chart-axis__line"
          x1={baselineX1}
          y1={baselineY1}
          x2={baselineX2}
          y2={baselineY2}
        />
      )}
      {tickList.map((tick, i) => {
        let tx = 0;
        let ty = 0;
        let lx1 = 0;
        let ly1 = 0;
        let lx2 = 0;
        let ly2 = 0;
        let textX = 0;
        let textY = 0;
        let textAnchor: "start" | "middle" | "end" = "middle";
        let dominantBaseline: "hanging" | "central" | "alphabetic" =
          "alphabetic";

        if (orientation === "bottom") {
          tx = tick.position;
          ty = innerHeight;
          ly2 = tickSize;
          textY = tickSize + LABEL_OFFSET;
          dominantBaseline = "hanging";
          textAnchor = shouldRotate ? "end" : "middle";
        } else if (orientation === "top") {
          tx = tick.position;
          ty = 0;
          ly2 = -tickSize;
          textY = -(tickSize + LABEL_OFFSET);
          textAnchor = shouldRotate ? "end" : "middle";
        } else if (orientation === "left") {
          tx = 0;
          ty = tick.position;
          lx2 = -tickSize;
          textX = -(tickSize + LABEL_OFFSET);
          textAnchor = "end";
          dominantBaseline = "central";
        } else {
          tx = innerWidth;
          ty = tick.position;
          lx2 = tickSize;
          textX = tickSize + LABEL_OFFSET;
          textAnchor = "start";
          dominantBaseline = "central";
        }

        return (
          <g
            key={i}
            className="vf-chart-axis__tick"
            transform={`translate(${tx}, ${ty})`}
          >
            {!hideTickLines && (
              <line
                className="vf-chart-axis__tick-line"
                x1={lx1}
                y1={ly1}
                x2={lx2}
                y2={ly2}
              />
            )}
            {!hideLabels && (
              <text
                className="vf-chart-axis__label"
                x={textX}
                y={textY}
                textAnchor={textAnchor}
                dominantBaseline={dominantBaseline}
                transform={
                  shouldRotate
                    ? `rotate(${isX ? -45 : -30}, ${textX}, ${textY})`
                    : undefined
                }
              >
                {tick.label}
              </text>
            )}
          </g>
        );
      })}
      {label && (
        <text
          className="vf-chart-axis__title"
          x={orientation === "bottom" ? innerWidth / 2 : orientation === "top" ? innerWidth / 2 : orientation === "left" ? 0 : innerWidth}
          y={orientation === "bottom" ? innerHeight + 36 : orientation === "top" ? -28 : innerHeight / 2}
          textAnchor={
            orientation === "left"
              ? "end"
              : orientation === "right"
                ? "start"
                : "middle"
          }
          dominantBaseline={orientation === "bottom" ? "hanging" : undefined}
          transform={
            !isX
              ? `rotate(${orientation === "left" ? -90 : 90}, ${orientation === "left" ? -40 : innerWidth + 40}, ${innerHeight / 2})`
              : undefined
          }
        >
          {label}
        </text>
      )}
    </g>
  );
});
Axis.displayName = "Axis";
