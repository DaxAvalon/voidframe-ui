"use client";

// ParallelCoordinates — one vertical axis per numeric dimension, rows become
// polylines across axes. Each axis uses its own linear scale.

import {
  forwardRef,
  useMemo,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { ChartFrame } from "./primitives/ChartFrame";
import { useChart, type ChartMargins } from "./primitives/ChartContext";
import { ChartTooltip } from "./primitives/ChartTooltip";
import {
  ChartTooltipBody,
  type TooltipMetric,
} from "./primitives/ChartTooltipBody";
import { formatChartNumber } from "./math/color";
import { ChartLegend, type ChartLegendItem } from "./primitives/Legend";
import { Axis } from "./primitives/Axis";
import { linearScale } from "./math/scales";
import { seriesPalette } from "./math/color";
import { cx } from "../utils/cx";

export interface ParallelDatum {
  /** Stable id — used for React keys and tooltips. */
  id: string | number;
  /** Numeric values keyed by axis. */
  values: Record<string, number>;
  /** Optional series key, used to color rows. */
  series?: string;
  label?: string;
}

export interface ParallelAxis {
  key: string;
  label?: string;
  domain?: [number, number];
  format?: (v: number) => string;
}

export interface ParallelSeries {
  key: string;
  label?: string;
  color?: string;
}

export interface ParallelCoordinatesProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  data: ParallelDatum[];
  axes: ParallelAxis[];
  series?: ParallelSeries[];
  width?: number;
  height?: number;
  margins?: Partial<ChartMargins>;
  title?: ReactNode;
  description?: ReactNode;
  showLegend?: boolean;
  accessibleLabel?: string;
  /** Per-row opacity. Default 0.55. */
  strokeOpacity?: number;
}

/**
 * Parallel-coordinates chart for high-dimensional data. One vertical axis
 * per dimension; polylines connect a record's values.
 */
export const ParallelCoordinates = forwardRef<
  HTMLDivElement,
  ParallelCoordinatesProps
>(function ParallelCoordinates(
  {
    data,
    axes,
    series,
    width,
    height = 340,
    margins,
    title,
    description,
    showLegend = true,
    accessibleLabel,
    strokeOpacity = 0.55,
    className,
    ...props
  },
  ref
) {
  const resolvedSeries = series ?? [{ key: "default", label: "Rows" }];
  const colors = useMemo(() => {
    const palette = seriesPalette(resolvedSeries.length);
    return resolvedSeries.map((s, i) => s.color ?? palette[i]!);
  }, [resolvedSeries]);

  const [hover, setHover] = useState<{
    datum: ParallelDatum;
    x: number;
    y: number;
  } | null>(null);

  return (
    <div
      ref={ref}
      className={cx("vf-chart-parallel", className)}
      {...props}
    >
      <ChartFrame
        width={width}
        height={height}
        margins={margins}
        title={title}
        description={description}
        accessibleLabel={accessibleLabel ?? "Parallel coordinates"}
      >
        <ParallelInner
          data={data}
          axes={axes}
          series={resolvedSeries}
          colors={colors}
          strokeOpacity={strokeOpacity}
          onHover={setHover}
        />
      </ChartFrame>
      {showLegend && resolvedSeries.length > 1 && (
        <ChartLegend
          className="vf-chart-parallel__legend"
          items={resolvedSeries.map<ChartLegendItem>((s, i) => ({
            key: s.key,
            label: s.label ?? s.key,
            color: colors[i]!,
            glyph: "line",
          }))}
        />
      )}
      <ChartTooltip active={!!hover} x={hover?.x ?? 0} y={hover?.y ?? 0}>
        {hover ? (
          <ChartTooltipBody
            title={hover.datum.label ?? String(hover.datum.id)}
            metrics={axes.reduce<TooltipMetric[]>((acc, ax) => {
              const v = hover.datum.values[ax.key];
              if (v === undefined) return acc;
              acc.push({
                label: ax.label ?? ax.key,
                value: ax.format
                  ? ax.format(v)
                  : formatChartNumber(v),
              });
              return acc;
            }, [])}
          />
        ) : null}
      </ChartTooltip>
    </div>
  );
});
ParallelCoordinates.displayName = "ParallelCoordinates";

interface ParallelInnerProps {
  data: ParallelDatum[];
  axes: ParallelAxis[];
  series: ParallelSeries[];
  colors: string[];
  strokeOpacity: number;
  onHover: (
    h: { datum: ParallelDatum; x: number; y: number } | null
  ) => void;
}

function ParallelInner({
  data,
  axes,
  series,
  colors,
  strokeOpacity,
  onHover,
}: ParallelInnerProps) {
  const { innerWidth, innerHeight } = useChart();
  const axisScales = useMemo(
    () =>
      axes.map((ax) => {
        let lo = ax.domain?.[0];
        let hi = ax.domain?.[1];
        if (lo === undefined || hi === undefined) {
          let minV = Infinity;
          let maxV = -Infinity;
          for (const d of data) {
            const v = d.values[ax.key];
            if (v === undefined || !Number.isFinite(v)) continue;
            if (v < minV) minV = v;
            if (v > maxV) maxV = v;
          }
          if (!Number.isFinite(minV)) minV = 0;
          if (!Number.isFinite(maxV)) maxV = 1;
          if (minV === maxV) maxV = minV + 1;
          lo = minV;
          hi = maxV;
        }
        return {
          ax,
          scale: linearScale({
            domain: [lo, hi],
            range: [innerHeight, 0],
            nice: true,
          }),
        };
      }),
    [axes, data, innerHeight]
  );

  const axisX = (i: number) =>
    axes.length === 1 ? innerWidth / 2 : (innerWidth / (axes.length - 1)) * i;

  const seriesByKey = new Map(series.map((s, i) => [s.key, colors[i]!]));
  const defaultColor = colors[0]!;

  return (
    <g className="vf-chart-parallel__inner">
      {/* polylines per row */}
      {data.map((row) => {
        const pts: string[] = [];
        axisScales.forEach(({ ax, scale }, i) => {
          const v = row.values[ax.key];
          if (v === undefined || !Number.isFinite(v)) return;
          pts.push(`${axisX(i)},${scale(v)}`);
        });
        if (pts.length < 2) return null;
        const stroke = row.series
          ? seriesByKey.get(row.series) ?? defaultColor
          : defaultColor;
        return (
          <polyline
            key={row.id}
            className="vf-chart-parallel__row"
            points={pts.join(" ")}
            fill="none"
            stroke={stroke}
            strokeWidth={1.2}
            strokeOpacity={strokeOpacity}
            onPointerMove={(e) =>
              onHover({ datum: row, x: e.clientX, y: e.clientY })
            }
            onPointerLeave={() => onHover(null)}
          />
        );
      })}
      {/* axes */}
      {axisScales.map(({ ax, scale }, i) => (
        <g key={ax.key} transform={`translate(${axisX(i)}, 0)`}>
          <line
            className="vf-chart-parallel__axis-line"
            x1={0}
            y1={0}
            x2={0}
            y2={innerHeight}
          />
          <Axis
            orientation="left"
            scale={scale}
            ticks={5}
            format={(v) =>
              ax.format ? ax.format(v as number) : String(v)
            }
          />
          <text
            className="vf-chart-parallel__axis-label"
            x={0}
            y={-6}
            textAnchor="middle"
          >
            {ax.label ?? ax.key}
          </text>
        </g>
      ))}
    </g>
  );
}
