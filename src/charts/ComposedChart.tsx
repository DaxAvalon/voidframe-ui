"use client";

// ComposedChart — mix bar + line + area series over a shared x / y space.
// Caller describes series by `type` and we render the right shape.

import {
  forwardRef,
  useMemo,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { Axis } from "./primitives/Axis";
import { ChartFrame } from "./primitives/ChartFrame";
import {
  ChartScales,
  useChart,
  type ChartMargins,
} from "./primitives/ChartContext";
import { ChartTooltip } from "./primitives/ChartTooltip";
import { ChartLegend, type ChartLegendItem } from "./primitives/Legend";
import { Gridlines } from "./primitives/Gridlines";
import { formatChartNumber, seriesPalette } from "./math/color";
import {
  bandScale,
  linearScale,
  pointScale,
  timeScale,
  type PointScale,
} from "./math/scales";
import type { CurveKind } from "./math/curves";
import { Bar } from "./series/Bar";
import { Line } from "./series/Line";
import { Area } from "./series/Area";
import { Point } from "./series/Point";
import { cx } from "../utils/cx";

export type ComposedSeriesType = "bar" | "line" | "area" | "scatter";
export type ComposedXKind = "linear" | "time" | "category";

export interface ComposedChartDatum {
  x: number | Date | string;
  [seriesKey: string]: number | Date | string | null | undefined;
}

export interface ComposedChartSeries {
  key: string;
  type: ComposedSeriesType;
  label?: string;
  color?: string;
  curve?: CurveKind;
  dashed?: boolean;
}

export interface ComposedChartProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  data: ComposedChartDatum[];
  series: ComposedChartSeries[];
  xKind?: ComposedXKind;
  width?: number;
  height?: number;
  margins?: Partial<ChartMargins>;
  title?: ReactNode;
  description?: ReactNode;
  showLegend?: boolean;
  showGrid?: boolean;
  valueTicks?: number;
  xTicks?: number;
  valueFormat?: (v: number) => string;
  xFormat?: (v: number | Date | string) => string;
  accessibleLabel?: string;
  /** Band padding for any bar series (0..1). Default 0.2. */
  padding?: number;
}

/**
 * Composition chart — combine bars, lines, areas, and reference layers over
 * shared axes. Axes: linear / time (X), linear (Y).
 */
export const ComposedChart = forwardRef<HTMLDivElement, ComposedChartProps>(
  function ComposedChart(
    {
      data,
      series,
      xKind = "linear",
      width,
      height = 320,
      margins,
      title,
      description,
      showLegend = true,
      showGrid = true,
      valueTicks = 5,
      xTicks = 6,
      valueFormat = (v: number) => formatChartNumber(v),
      xFormat,
      accessibleLabel,
      padding = 0.2,
      className,
      ...props
    },
    ref
  ) {
    const colors = useMemo(() => {
      const palette = seriesPalette(series.length);
      return series.map((s, i) => s.color ?? palette[i]!);
    }, [series]);

    const [hover, setHover] = useState<{
      datum: ComposedChartDatum;
      seriesKey: string;
      value: number;
      x: number;
      y: number;
    } | null>(null);

    return (
      <div ref={ref} className={cx("vf-chart-composed", className)} {...props}>
        <ChartFrame
          width={width}
          height={height}
          margins={margins}
          title={title}
          description={description}
          accessibleLabel={accessibleLabel ?? "Composed chart"}
        >
          <ComposedInner
            data={data}
            series={series}
            xKind={xKind}
            valueTicks={valueTicks}
            xTicks={xTicks}
            valueFormat={valueFormat}
            xFormat={xFormat}
            colors={colors}
            showGrid={showGrid}
            padding={padding}
            onHover={setHover}
          />
        </ChartFrame>
        {showLegend && (
          <ChartLegend
            className="vf-chart-composed__legend"
            items={series.map<ChartLegendItem>((s, i) => ({
              key: s.key,
              label: s.label ?? s.key,
              color: colors[i]!,
              glyph:
                s.type === "line" ? "line" : s.type === "scatter" ? "circle" : "square",
            }))}
          />
        )}
        <ChartTooltip active={!!hover} x={hover?.x ?? 0} y={hover?.y ?? 0}>
          {hover ? (
            <>
              <div>
                <strong>
                  {xFormat
                    ? xFormat(hover.datum.x)
                    : String(hover.datum.x instanceof Date
                        ? hover.datum.x.toDateString()
                        : hover.datum.x)}
                </strong>
              </div>
              <div>
                {hover.seriesKey}: {valueFormat(hover.value)}
              </div>
            </>
          ) : null}
        </ChartTooltip>
      </div>
    );
  }
);
ComposedChart.displayName = "ComposedChart";

interface ComposedInnerProps {
  data: ComposedChartDatum[];
  series: ComposedChartSeries[];
  xKind: ComposedXKind;
  valueTicks: number;
  xTicks: number;
  valueFormat: (v: number) => string;
  xFormat?: (v: number | Date | string) => string;
  colors: string[];
  showGrid: boolean;
  padding: number;
  onHover: (
    h: {
      datum: ComposedChartDatum;
      seriesKey: string;
      value: number;
      x: number;
      y: number;
    } | null
  ) => void;
}

function ComposedInner({
  data,
  series,
  xKind,
  valueTicks,
  xTicks,
  valueFormat,
  xFormat,
  colors,
  showGrid,
  padding,
  onHover,
}: ComposedInnerProps) {
  const { innerWidth, innerHeight } = useChart();
  const hasBars = series.some((s) => s.type === "bar");
  const xValuesRaw = data.map((d) => d.x);

  const xScale = useMemo(() => {
    if (hasBars || xKind === "category") {
      return bandScale({
        domain: xValuesRaw.map(String),
        range: [0, innerWidth],
        padding,
      });
    }
    if (xKind === "time") {
      const dates = xValuesRaw.map((v) =>
        v instanceof Date ? v : new Date(v as string | number)
      );
      const min = new Date(Math.min(...dates.map((d) => d.getTime())));
      const max = new Date(Math.max(...dates.map((d) => d.getTime())));
      return timeScale({ domain: [min, max], range: [0, innerWidth] });
    }
    const nums = xValuesRaw.map((v) => Number(v));
    return linearScale({
      domain: [Math.min(...nums), Math.max(...nums)],
      range: [0, innerWidth],
    });
  }, [hasBars, xKind, xValuesRaw, innerWidth, padding]);

  const xAt = (x: ComposedChartDatum["x"]) => {
    if (hasBars || xKind === "category") {
      const bs = xScale as ReturnType<typeof bandScale>;
      const pos = bs(String(x)) ?? 0;
      return pos + bs.bandwidth() / 2;
    }
    if (xKind === "time") {
      const d = x instanceof Date ? x : new Date(x as string | number);
      return (xScale as ReturnType<typeof timeScale>)(d);
    }
    return (xScale as ReturnType<typeof linearScale>)(Number(x));
  };

  const [yMin, yMax] = useMemo<[number, number]>(() => {
    let lo = 0;
    let hi = 0;
    for (const row of data) {
      for (const s of series) {
        const v = Number(row[s.key]);
        if (!Number.isFinite(v)) continue;
        if (v < lo) lo = v;
        if (v > hi) hi = v;
      }
    }
    if (lo === hi) hi = lo + 1;
    return [lo, hi];
  }, [data, series]);

  const yScale = linearScale({
    domain: [yMin, yMax],
    range: [innerHeight, 0],
    nice: true,
  });

  return (
    <ChartScales xScale={xScale as never} yScale={yScale as never}>
    <g className="vf-chart-composed__inner">
      {showGrid && <Gridlines mode="both" ticks={valueTicks} />}
      <Axis
        orientation="bottom"
        scale={xScale}
        ticks={xTicks}
        format={xFormat ? (v) => xFormat(v as number | Date | string) : undefined}
      />
      <Axis
        orientation="left"
        scale={yScale}
        ticks={valueTicks}
        format={(v) => valueFormat(v as number)}
      />
      {series.map((s, sIdx) => {
        if (s.type === "bar") {
          const bs = xScale as ReturnType<typeof bandScale>;
          return (
            <Bar
              key={s.key}
              data={data.map((row) => {
                const pos = bs(String(row.x)) ?? 0;
                const value = Number(row[s.key] ?? 0);
                const y = yScale(Math.max(0, value));
                const yBase = yScale(0);
                return {
                  x: pos,
                  y: Math.min(y, yBase),
                  width: bs.bandwidth(),
                  height: Math.abs(yBase - y),
                };
              })}
              fill={colors[sIdx]}
              onBarHover={(d, i, e) =>
                onHover(
                  d
                    ? {
                        datum: data[i]!,
                        seriesKey: s.key,
                        value: Number(data[i]![s.key] ?? 0),
                        x: e.clientX,
                        y: e.clientY,
                      }
                    : null
                )
              }
            />
          );
        }
        const pts = data
          .map((d) => {
            const v = Number(d[s.key]);
            if (!Number.isFinite(v)) return null;
            return { x: xAt(d.x) as number, y: yScale(v) };
          })
          .filter((p): p is { x: number; y: number } => p !== null);
        if (s.type === "area") {
          return (
            <g key={s.key}>
              <Area
                data={pts.map((p) => ({ x: p.x, y0: yScale(0), y1: p.y }))}
                fill={colors[sIdx]}
                fillOpacity={0.35}
                curve={s.curve}
              />
              <Line
                data={pts}
                stroke={colors[sIdx]}
                strokeWidth={1.5}
                curve={s.curve}
                dashed={s.dashed}
              />
            </g>
          );
        }
        if (s.type === "line") {
          return (
            <Line
              key={s.key}
              data={pts}
              stroke={colors[sIdx]}
              strokeWidth={1.5}
              curve={s.curve}
              dashed={s.dashed}
            />
          );
        }
        // scatter
        return (
          <Point
            key={s.key}
            data={pts}
            shape="square"
            size={5}
            fill={colors[sIdx]}
          />
        );
      })}
    </g>
    </ChartScales>
  );
}
