"use client";

// HorizonChart — compact single-axis area chart that splits the domain into
// N "bands" of increasing color intensity, and folds negative values back as
// an inverted (offset) color. Great for small-multiples.

import {
  forwardRef,
  useMemo,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { area as d3Area } from "d3-shape";
import { linearScale, pointScale, timeScale, type PointScale } from "./math/scales";
import { resolveCurve, type CurveKind } from "./math/curves";
import { cx } from "../utils/cx";

export interface HorizonPoint {
  x: number | Date | string;
  y: number;
}

export interface HorizonChartProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  data: HorizonPoint[];
  xKind?: "linear" | "time" | "category";
  /** Number of horizon bands (also = color intensity steps). Default 3. */
  bands?: number;
  width?: number;
  height?: number;
  curve?: CurveKind;
  /** Color for positive values. Default `var(--vf-green)`. */
  positiveColor?: string;
  /** Color for negative values. Default `var(--vf-red)`. */
  negativeColor?: string;
  title?: ReactNode;
  description?: ReactNode;
  accessibleLabel?: string;
}

export const HorizonChart = forwardRef<HTMLDivElement, HorizonChartProps>(
  function HorizonChart(
    {
      data,
      xKind = "linear",
      bands = 3,
      width = 400,
      height = 60,
      curve = "monotone",
      positiveColor = "var(--vf-green)",
      negativeColor = "var(--vf-red)",
      title,
      description,
      accessibleLabel,
      className,
      style,
      ...props
    },
    ref
  ) {
    const xScale = useMemo(() => {
      if (xKind === "time") {
        const dates = data.map((d) =>
          d.x instanceof Date ? d.x : new Date(d.x as string | number)
        );
        const min = new Date(Math.min(...dates.map((d) => d.getTime())));
        const max = new Date(Math.max(...dates.map((d) => d.getTime())));
        return timeScale({ domain: [min, max], range: [0, width] });
      }
      if (xKind === "category") {
        return pointScale({
          domain: data.map((d) => String(d.x)),
          range: [0, width],
        }) as PointScale;
      }
      const nums = data.map((d) => Number(d.x));
      return linearScale({
        domain: [Math.min(...nums), Math.max(...nums)],
        range: [0, width],
      });
    }, [data, xKind, width]);

    const xAt = (x: HorizonPoint["x"]) => {
      if (xKind === "time") {
        const d = x instanceof Date ? x : new Date(x as string | number);
        return (xScale as ReturnType<typeof timeScale>)(d);
      }
      if (xKind === "category")
        return (xScale as PointScale)(String(x)) ?? 0;
      return (xScale as ReturnType<typeof linearScale>)(Number(x));
    };

    const absMax = useMemo(() => {
      let hi = 0;
      for (const d of data) if (Math.abs(d.y) > hi) hi = Math.abs(d.y);
      return hi || 1;
    }, [data]);

    const bandSize = absMax / bands;

    return (
      <div
        ref={ref}
        className={cx("vf-chart-horizon", className)}
        style={style}
        {...props}
      >
        {(title || description) && (
          <div className="vf-chart-frame__header">
            {title && <h4 className="vf-chart-frame__title">{title}</h4>}
            {description && (
              <p className="vf-chart-frame__description">{description}</p>
            )}
          </div>
        )}
        <svg
          className="vf-chart-horizon__svg"
          role="img"
          aria-label={accessibleLabel ?? "Horizon chart"}
          width={width}
          height={height}
        >
          <defs>
            <clipPath id="vf-horizon-clip">
              <rect x={0} y={0} width={width} height={height} />
            </clipPath>
          </defs>
          <g clipPath="url(#vf-horizon-clip)">
            {Array.from({ length: bands }).map((_, i) => {
              // Each band `i` renders the portion above i * bandSize, scaled
              // to occupy the full chart height. Bands are layered with
              // increasing color opacity.
              const yScale = linearScale({
                domain: [i * bandSize, (i + 1) * bandSize],
                range: [height, 0],
                clamp: true,
              });
              const posArea = d3Area<HorizonPoint>()
                .x((d) => xAt(d.x) as number)
                .y0(height)
                .y1((d) => yScale(Math.max(0, d.y)))
                .curve(resolveCurve(curve))(data);
              const negArea = d3Area<HorizonPoint>()
                .x((d) => xAt(d.x) as number)
                .y0(height)
                .y1((d) => yScale(Math.max(0, -d.y)))
                .curve(resolveCurve(curve))(data);
              const opacity = (i + 1) / bands;
              return (
                <g key={i}>
                  {posArea && (
                    <path
                      d={posArea}
                      fill={positiveColor}
                      fillOpacity={opacity}
                    />
                  )}
                  {negArea && (
                    <path
                      d={negArea}
                      fill={negativeColor}
                      fillOpacity={opacity}
                    />
                  )}
                </g>
              );
            })}
            <line
              className="vf-chart-horizon__baseline"
              x1={0}
              y1={height}
              x2={width}
              y2={height}
            />
          </g>
        </svg>
      </div>
    );
  }
);
HorizonChart.displayName = "HorizonChart";
