"use client";

// AreaChart — filled area variant of LineChart. Supports single-series,
// stacked, and 100%-stacked (expand). The area is drawn between successive
// series y0/y1 bands.

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
import { ChartLegend, type ChartLegendItem } from "./primitives/Legend";
import { ChartTooltip } from "./primitives/ChartTooltip";
import {
  ChartTooltipBody,
  type TooltipMetric,
} from "./primitives/ChartTooltipBody";
import { Crosshair } from "./primitives/Crosshair";
import { Gridlines } from "./primitives/Gridlines";
import { bisectNearest } from "./math/bisector";
import { formatChartNumber, seriesPalette } from "./math/color";
import {
  linearScale,
  logScale,
  sqrtScale,
  pointScale,
  timeScale,
  type PointScale,
} from "./math/scales";
import { stackSeries } from "./math/stack";
import type { CurveKind } from "./math/curves";
import { Area } from "./series/Area";
import { Line } from "./series/Line";
import { cx } from "../utils/cx";

export type AreaChartMode = "single" | "stacked" | "100%-stacked";

export interface AreaChartDatum {
  x: number | Date | string;
  [seriesKey: string]: number | Date | string | null | undefined;
}

export interface AreaChartSeries {
  key: string;
  label?: string;
  color?: string;
  curve?: CurveKind;
}

export interface AreaChartProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onClick" | "title"> {
  data: AreaChartDatum[];
  series: AreaChartSeries[];
  mode?: AreaChartMode;
  xKind?: "linear" | "time" | "category";
  width?: number;
  height?: number;
  margins?: Partial<ChartMargins>;
  title?: ReactNode;
  description?: ReactNode;
  showLegend?: boolean;
  showGrid?: boolean;
  showStroke?: boolean;
  valueTicks?: number;
  xTicks?: number;
  valueFormat?: (value: number) => string;
  xFormat?: (value: number | Date | string) => string;
  accessibleLabel?: string;
  /** Y-axis scale kind. Default "linear". */
  scaleKind?: "linear" | "log" | "sqrt";
  /** Series keys to hide (for interactive legend toggling). */
  hiddenKeys?: string[];
}

/**
 * Area chart over a shared X axis. Axes: linear or time (X), linear (Y).
 * Interactions: hover crosshair, tooltip, legend toggle. Accepts `data` as
 * `{ x: number|Date; [series: string]: number }[]`.
 */
export const AreaChart = forwardRef<HTMLDivElement, AreaChartProps>(
  function AreaChart(
    {
      data,
      series,
      mode = "single",
      xKind = "linear",
      width,
      height = 320,
      margins,
      title,
      description,
      showLegend = true,
      showGrid = true,
      showStroke = true,
      valueTicks = 5,
      xTicks = 6,
      valueFormat = (v) => formatChartNumber(v),
      xFormat,
      accessibleLabel,
      scaleKind = "linear",
      hiddenKeys: hiddenKeysProp,
      className,
      ...props
    },
    ref
  ) {
    const colors = useMemo(() => {
      const palette = seriesPalette(series.length);
      return series.map((s, i) => s.color ?? palette[i]!);
    }, [series]);
    const [hiddenKeysInternal, setHiddenKeysInternal] = useState<string[]>([]);
    const hiddenKeys = hiddenKeysProp ?? hiddenKeysInternal;
    const visibleSeries = useMemo(
      () => series.filter((s) => !hiddenKeys.includes(s.key)),
      [series, hiddenKeys]
    );
    const [hover, setHover] = useState<{
      datum: AreaChartDatum;
      clientX: number;
      clientY: number;
    } | null>(null);

    return (
      <div ref={ref} className={cx("vf-chart-area-chart", className)} {...props}>
        <ChartFrame
          width={width}
          height={height}
          margins={margins}
          title={title}
          description={description}
          accessibleLabel={accessibleLabel ?? "Area chart"}
        >
          <AreaChartInner
            data={data}
            series={visibleSeries}
            mode={mode}
            xKind={xKind}
            valueTicks={valueTicks}
            xTicks={xTicks}
            valueFormat={valueFormat}
            xFormat={xFormat}
            colors={visibleSeries.map(
              (s) => colors[series.findIndex((orig) => orig.key === s.key)]!
            )}
            showGrid={showGrid}
            showStroke={showStroke}
            scaleKind={scaleKind}
            onHover={setHover}
          />
        </ChartFrame>
        {showLegend && series.length > 1 && (
          <ChartLegend
            className="vf-chart-area-chart__legend"
            items={series.map<ChartLegendItem>((s, i) => ({
              key: s.key,
              label: s.label ?? s.key,
              color: colors[i]!,
              glyph: "square",
              disabled: hiddenKeys.includes(s.key),
            }))}
            onToggle={(key) => {
              if (hiddenKeysProp !== undefined) return;
              setHiddenKeysInternal((prev) =>
                prev.includes(key)
                  ? prev.filter((k) => k !== key)
                  : [...prev, key]
              );
            }}
          />
        )}
        <ChartTooltip
          active={!!hover}
          x={hover?.clientX ?? 0}
          y={hover?.clientY ?? 0}
        >
          {hover ? (
            <ChartTooltipBody
              title={
                xFormat
                  ? xFormat(hover.datum.x)
                  : String(
                      hover.datum.x instanceof Date
                        ? hover.datum.x.toDateString()
                        : hover.datum.x
                    )
              }
              metrics={series.reduce<TooltipMetric[]>((acc, s, i) => {
                const v = Number(hover.datum[s.key]);
                if (!Number.isFinite(v)) return acc;
                acc.push({
                  label: s.label ?? s.key,
                  value: valueFormat(v),
                  color: colors[i],
                });
                return acc;
              }, [])}
            />
          ) : null}
        </ChartTooltip>
      </div>
    );
  }
);
AreaChart.displayName = "AreaChart";

interface AreaChartInnerProps {
  data: AreaChartDatum[];
  series: AreaChartSeries[];
  mode: AreaChartMode;
  xKind: "linear" | "time" | "category";
  valueTicks: number;
  xTicks: number;
  valueFormat: (v: number) => string;
  xFormat?: (v: number | Date | string) => string;
  colors: string[];
  showGrid: boolean;
  showStroke: boolean;
  scaleKind: "linear" | "log" | "sqrt";
  onHover: (
    h: { datum: AreaChartDatum; clientX: number; clientY: number } | null
  ) => void;
}

function AreaChartInner({
  data,
  series,
  mode,
  xKind,
  valueTicks,
  xTicks,
  valueFormat,
  xFormat,
  colors,
  showGrid,
  showStroke,
  scaleKind,
  onHover,
}: AreaChartInnerProps) {
  const { innerWidth, innerHeight } = useChart();
  const [crosshair, setCrosshair] = useState<number | null>(null);
  const xValuesRaw = data.map((d) => d.x);

  const xScale = useMemo(() => {
    if (xKind === "time") {
      const dates = xValuesRaw.map((v) =>
        v instanceof Date ? v : new Date(v as string | number)
      );
      const min = new Date(Math.min(...dates.map((d) => d.getTime())));
      const max = new Date(Math.max(...dates.map((d) => d.getTime())));
      return timeScale({ domain: [min, max], range: [0, innerWidth] });
    }
    if (xKind === "category") {
      return pointScale({
        domain: xValuesRaw.map(String),
        range: [0, innerWidth],
      }) as PointScale;
    }
    const nums = xValuesRaw.map((v) => Number(v));
    return linearScale({
      domain: [Math.min(...nums), Math.max(...nums)],
      range: [0, innerWidth],
    });
  }, [xKind, xValuesRaw, innerWidth]);

  const xAt = (x: AreaChartDatum["x"]) => {
    if (xKind === "time") {
      const d = x instanceof Date ? x : new Date(x as string | number);
      return (xScale as ReturnType<typeof timeScale>)(d);
    }
    if (xKind === "category") {
      return (xScale as PointScale)(String(x)) ?? 0;
    }
    return (xScale as ReturnType<typeof linearScale>)(Number(x));
  };

  const stacked = mode !== "single";
  const stackedResult = useMemo(() => {
    if (!stacked) return null;
    return stackSeries<AreaChartDatum>({
      data,
      keys: series.map((s) => s.key),
      offset: mode === "100%-stacked" ? "expand" : "none",
      value: (d, k) => Number(d[k] ?? 0),
    });
  }, [data, series, mode, stacked]);

  const [yMin, yMax] = useMemo<[number, number]>(() => {
    if (stackedResult) {
      let lo = 0;
      let hi = 0;
      for (const s of stackedResult) {
        for (const pt of s.values) {
          if (pt.y0 < lo) lo = pt.y0;
          if (pt.y1 > hi) hi = pt.y1;
        }
      }
      return [lo, hi];
    }
    let lo = 0;
    let hi = 0;
    for (const row of data) {
      for (const s of series) {
        const v = Number(row[s.key] ?? 0);
        if (v < lo) lo = v;
        if (v > hi) hi = v;
      }
    }
    if (lo === hi) hi = lo + 1;
    return [lo, hi];
  }, [data, series, stackedResult]);

  const yScale = useMemo(() => {
    const opts = {
      domain: [yMin, yMax] as [number, number],
      range: [innerHeight, 0] as [number, number],
      nice: true as const,
    };
    if (scaleKind === "log") return logScale(opts);
    if (scaleKind === "sqrt") return sqrtScale(opts);
    return linearScale(opts);
  }, [yMin, yMax, innerHeight, scaleKind]);

  return (
    <ChartScales xScale={xScale as never} yScale={yScale as never}>
    <g className="vf-chart-area-chart__inner">
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
      {stackedResult
        ? stackedResult.map((s, sIdx) => {
            const areaPoints = s.values.map((pt) => ({
              x: xAt(pt.data.x) as number,
              y0: yScale(pt.y0),
              y1: yScale(pt.y1),
            }));
            return (
              <g key={s.key}>
                <Area
                  data={areaPoints}
                  curve={series[sIdx]?.curve ?? "linear"}
                  fill={colors[sIdx]}
                  fillOpacity={0.45}
                />
                {showStroke && (
                  <Line
                    data={areaPoints.map((p) => ({ x: p.x, y: p.y1 }))}
                    stroke={colors[sIdx]}
                    strokeWidth={1.2}
                    curve={series[sIdx]?.curve ?? "linear"}
                  />
                )}
              </g>
            );
          })
        : series.map((s, sIdx) => {
            const areaPoints = data
              .map((d) => {
                const value = Number(d[s.key]);
                if (!Number.isFinite(value)) return null;
                return {
                  x: xAt(d.x) as number,
                  y0: yScale(0),
                  y1: yScale(value),
                };
              })
              .filter(
                (p): p is { x: number; y0: number; y1: number } => p !== null
              );
            return (
              <g key={s.key}>
                <Area
                  data={areaPoints}
                  curve={s.curve ?? "linear"}
                  fill={colors[sIdx]}
                  fillOpacity={0.35}
                />
                {showStroke && (
                  <Line
                    data={areaPoints.map((p) => ({ x: p.x, y: p.y1 }))}
                    stroke={colors[sIdx]}
                    strokeWidth={1.5}
                    curve={s.curve ?? "linear"}
                  />
                )}
              </g>
            );
          })}
      {crosshair !== null && (
        <Crosshair x={crosshair} mode="x" />
      )}
      <rect
        x={0}
        y={0}
        width={innerWidth}
        height={innerHeight}
        fill="transparent"
        onPointerMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const localX = e.clientX - rect.left;
          const nearest = bisectNearest(
            data,
            localX,
            (d) => xAt(d.x) as number
          );
          if (!nearest) return;
          setCrosshair(xAt(nearest.datum.x) as number);
          onHover({
            datum: nearest.datum,
            clientX: e.clientX,
            clientY: e.clientY,
          });
        }}
        onPointerLeave={() => {
          setCrosshair(null);
          onHover(null);
        }}
      />
    </g>
    </ChartScales>
  );
}
