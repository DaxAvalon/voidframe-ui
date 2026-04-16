"use client";

// LineChart — one or more series over a shared X (linear / time / point)
// domain. Crosshair + nearest-point tooltip optional.

import {
  forwardRef,
  useMemo,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { Axis } from "./primitives/Axis";
import { ChartFrame } from "./primitives/ChartFrame";
import { useChart, type ChartMargins } from "./primitives/ChartContext";
import { ChartTooltip } from "./primitives/ChartTooltip";
import {
  ChartTooltipBody,
  type TooltipMetric,
} from "./primitives/ChartTooltipBody";
import { ChartLegend, type ChartLegendItem } from "./primitives/Legend";
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
import type { CurveKind } from "./math/curves";
import { Line } from "./series/Line";
import { Point } from "./series/Point";
import { cx } from "../utils/cx";

export type LineChartXKind = "linear" | "time" | "category";

export interface LineChartDatum {
  x: number | Date | string;
  [seriesKey: string]: number | Date | string | null | undefined;
}

export interface LineChartSeries {
  key: string;
  label?: string;
  color?: string;
  curve?: CurveKind;
  dashed?: boolean;
  showPoints?: boolean;
}

export interface LineChartProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onClick" | "title"> {
  data: LineChartDatum[];
  series: LineChartSeries[];
  xKind?: LineChartXKind;
  width?: number;
  height?: number;
  margins?: Partial<ChartMargins>;
  title?: ReactNode;
  description?: ReactNode;
  showLegend?: boolean;
  showGrid?: boolean;
  showCrosshair?: boolean;
  valueTicks?: number;
  xTicks?: number;
  valueFormat?: (value: number) => string;
  xFormat?: (value: number | Date | string) => string;
  accessibleLabel?: string;
  /** Y-axis scale kind. Default "linear". */
  scaleKind?: "linear" | "log" | "sqrt";
  /** Series keys to hide (for interactive legend toggling). */
  hiddenKeys?: string[];
  /** When true, null / undefined values are skipped and surrounding points connect. Default false. */
  connectNulls?: boolean;
}

const fmtDefault = (v: number) => formatChartNumber(v);

export const LineChart = forwardRef<HTMLDivElement, LineChartProps>(
  function LineChart(
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
      showCrosshair = true,
      valueTicks = 5,
      xTicks = 6,
      valueFormat = fmtDefault,
      xFormat,
      accessibleLabel,
      scaleKind = "linear",
      hiddenKeys: hiddenKeysProp,
      connectNulls = false,
      className,
      ...props
    },
    ref
  ) {
    const [hiddenKeysInternal, setHiddenKeysInternal] = useState<string[]>([]);
    const hiddenKeys = hiddenKeysProp ?? hiddenKeysInternal;
    const visibleSeries = useMemo(
      () => series.filter((s) => !hiddenKeys.includes(s.key)),
      [series, hiddenKeys]
    );
    const colors = useMemo(() => {
      const palette = seriesPalette(series.length);
      return series.map((s, i) => s.color ?? palette[i]!);
    }, [series]);

    const [hover, setHover] = useState<{
      datum: LineChartDatum;
      clientX: number;
      clientY: number;
    } | null>(null);

    return (
      <div ref={ref} className={cx("vf-chart-line-chart", className)} {...props}>
        <ChartFrame
          width={width}
          height={height}
          margins={margins}
          title={title}
          description={description}
          accessibleLabel={accessibleLabel ?? "Line chart"}
        >
          <LineChartInner
            data={data}
            series={visibleSeries}
            xKind={xKind}
            valueTicks={valueTicks}
            xTicks={xTicks}
            valueFormat={valueFormat}
            xFormat={xFormat}
            colors={visibleSeries.map(
              (s) => colors[series.findIndex((orig) => orig.key === s.key)]!
            )}
            showGrid={showGrid}
            showCrosshair={showCrosshair}
            scaleKind={scaleKind}
            connectNulls={connectNulls}
            onHover={setHover}
          />
        </ChartFrame>
        {showLegend && series.length > 0 && (
          <ChartLegend
            className="vf-chart-line-chart__legend"
            items={series.map<ChartLegendItem>((s, i) => ({
              key: s.key,
              label: s.label ?? s.key,
              color: colors[i]!,
              glyph: "line",
              disabled: hiddenKeys.includes(s.key),
            }))}
            onToggle={(key) => {
              if (hiddenKeysProp !== undefined) return; // controlled externally
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
LineChart.displayName = "LineChart";

interface LineChartInnerProps {
  data: LineChartDatum[];
  series: LineChartSeries[];
  xKind: LineChartXKind;
  valueTicks: number;
  xTicks: number;
  valueFormat: (v: number) => string;
  xFormat?: (value: number | Date | string) => string;
  colors: string[];
  showGrid: boolean;
  showCrosshair: boolean;
  scaleKind: "linear" | "log" | "sqrt";
  connectNulls: boolean;
  onHover: (h: LineChartInnerHover | null) => void;
}

interface LineChartInnerHover {
  datum: LineChartDatum;
  clientX: number;
  clientY: number;
}

function LineChartInner({
  data,
  series,
  xKind,
  valueTicks,
  xTicks,
  valueFormat,
  xFormat,
  colors,
  showGrid,
  showCrosshair,
  scaleKind,
  connectNulls,
  onHover,
}: LineChartInnerProps) {
  const { innerWidth, innerHeight } = useChart();

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

  const xAt = (x: LineChartDatum["x"]) => {
    if (xKind === "time") {
      const d = x instanceof Date ? x : new Date(x as string | number);
      return (xScale as ReturnType<typeof timeScale>)(d);
    }
    if (xKind === "category") {
      return (xScale as PointScale)(String(x)) ?? 0;
    }
    return (xScale as ReturnType<typeof linearScale>)(Number(x));
  };

  const [valueMin, valueMax] = useMemo(() => {
    let lo = Infinity;
    let hi = -Infinity;
    for (const row of data) {
      for (const s of series) {
        const v = Number(row[s.key]);
        if (Number.isFinite(v)) {
          if (v < lo) lo = v;
          if (v > hi) hi = v;
        }
      }
    }
    if (!Number.isFinite(lo)) lo = 0;
    if (!Number.isFinite(hi)) hi = 1;
    if (lo === hi) hi = lo + 1;
    return [lo, hi];
  }, [data, series]);

  const yScale = useMemo(() => {
    const opts = {
      domain: [valueMin, valueMax] as [number, number],
      range: [innerHeight, 0] as [number, number],
      nice: true as const,
    };
    if (scaleKind === "log") return logScale(opts);
    if (scaleKind === "sqrt") return sqrtScale(opts);
    return linearScale(opts);
  }, [valueMin, valueMax, innerHeight, scaleKind]);

  const [crosshair, setCrosshair] = useState<{
    x: number;
  } | null>(null);

  const handlePointerMove = (e: React.PointerEvent<SVGRectElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const localX = e.clientX - rect.left;
    // Find the nearest datum index by X in plot space.
    const nearest = bisectNearest(
      data,
      localX,
      (d) => xAt(d.x) as number
    );
    if (!nearest) return;
    const datum = nearest.datum;
    const dx = xAt(datum.x) as number;
    setCrosshair({ x: dx });
    onHover({
      datum,
      clientX: e.clientX,
      clientY: e.clientY,
    });
  };
  const handlePointerLeave = () => {
    setCrosshair(null);
    onHover(null);
  };

  return (
    <g className="vf-chart-line-chart__inner">
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
        const rawPoints = data.map((d) => {
          const value = Number(d[s.key]);
          const valid = Number.isFinite(value);
          return {
            x: xAt(d.x) as number,
            y: valid ? yScale(value) : 0,
            defined: valid,
          };
        });
        // When connectNulls is true, remove undefined points so the line connects.
        // When false, keep them with defined=false so the Line primitive gaps.
        const linePoints = connectNulls
          ? rawPoints.filter((p) => p.defined)
          : rawPoints;
        const visiblePoints = rawPoints.filter((p) => p.defined);
        return (
          <g key={s.key}>
            <Line
              data={linePoints}
              stroke={colors[sIdx]}
              strokeWidth={1.5}
              curve={s.curve ?? "linear"}
              dashed={s.dashed}
            />
            {s.showPoints !== false && (
              <Point
                data={visiblePoints}
                shape="square"
                size={4}
                fill={colors[sIdx]}
              />
            )}
          </g>
        );
      })}
      {showCrosshair && crosshair && (
        <Crosshair x={crosshair.x} mode="x" />
      )}
      {/* Transparent hover catcher spanning the plot. */}
      <rect
        x={0}
        y={0}
        width={innerWidth}
        height={innerHeight}
        fill="transparent"
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
      />
    </g>
  );
}
