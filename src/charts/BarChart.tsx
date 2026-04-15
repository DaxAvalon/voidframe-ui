"use client";

// BarChart — vertical or horizontal, with optional grouping (side-by-side
// series) or stacking (single bar per category). All computations flow
// through stage-1 scales + stack primitives.

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
import { Gridlines } from "./primitives/Gridlines";
import { bandScale, linearScale, type BandScale } from "./math/scales";
import { formatChartNumber, seriesPalette } from "./math/color";
import { stackSeries, type StackOffset } from "./math/stack";
import { Bar } from "./series/Bar";
import { cx } from "../utils/cx";

export type BarChartOrientation = "vertical" | "horizontal";
export type BarChartMode = "grouped" | "stacked" | "100%-stacked";

export interface BarChartDatum {
  /** Category label (displayed on the band axis). */
  category: string;
  /** Keyed numeric values for each configured series. */
  [seriesKey: string]: string | number;
}

export interface BarChartSeries {
  key: string;
  label?: string;
  color?: string;
  tone?: "success" | "warning" | "danger" | "info" | "neutral";
}

export interface BarChartHoverPayload {
  datum: BarChartDatum;
  seriesKey: string;
  value: number;
  x: number;
  y: number;
}

export interface BarChartProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onClick" | "title"> {
  data: BarChartDatum[];
  series: BarChartSeries[];
  orientation?: BarChartOrientation;
  /** `"grouped"` (default) renders side-by-side bars; other modes stack. */
  mode?: BarChartMode;
  width?: number;
  height?: number;
  margins?: Partial<ChartMargins>;
  /** Band padding 0..1. Default 0.2. */
  padding?: number;
  /** Padding between sub-bars within a group (grouped mode). Default 0.1. */
  innerPadding?: number;
  title?: ReactNode;
  description?: ReactNode;
  showLegend?: boolean;
  showGrid?: boolean;
  /** Custom value tick count for the continuous axis. Default 5. */
  valueTicks?: number;
  valueFormat?: (value: number) => string;
  accessibleLabel?: string;
  onBarClick?: (payload: {
    datum: BarChartDatum;
    seriesKey: string;
    value: number;
  }) => void;
}

const fmtDefault = (v: number) => formatChartNumber(v);

export const BarChart = forwardRef<HTMLDivElement, BarChartProps>(
  function BarChart(
    {
      data,
      series,
      orientation = "vertical",
      mode = "grouped",
      width,
      height = 320,
      margins,
      padding = 0.2,
      innerPadding = 0.1,
      title,
      description,
      showLegend = true,
      showGrid = true,
      valueTicks = 5,
      valueFormat = fmtDefault,
      accessibleLabel,
      className,
      onBarClick,
      ...props
    },
    ref
  ) {
    const colors = useMemo(() => {
      const palette = seriesPalette(series.length);
      return series.map((s, i) => s.color ?? palette[i]!);
    }, [series]);

    const [hover, setHover] = useState<BarChartHoverPayload | null>(null);

    return (
      <div ref={ref} className={cx("vf-chart-bar-chart", className)} {...props}>
        <ChartFrame
          width={width}
          height={height}
          margins={margins}
          title={title}
          description={description}
          accessibleLabel={accessibleLabel ?? "Bar chart"}
        >
          <BarChartInner
            data={data}
            series={series}
            orientation={orientation}
            mode={mode}
            padding={padding}
            innerPadding={innerPadding}
            valueTicks={valueTicks}
            valueFormat={valueFormat}
            colors={colors}
            showGrid={showGrid}
            onHover={setHover}
            onBarClick={onBarClick}
          />
        </ChartFrame>
        {showLegend && series.length > 1 && (
          <ChartLegend
            className="vf-chart-bar-chart__legend"
            items={series.map<ChartLegendItem>((s, i) => ({
              key: s.key,
              label: s.label ?? s.key,
              color: colors[i]!,
              tone: s.tone,
              glyph: "square",
            }))}
          />
        )}
        <ChartTooltip active={!!hover} x={hover?.x ?? 0} y={hover?.y ?? 0}>
          {hover ? (
            <ChartTooltipBody
              title={hover.datum.category}
              metrics={(() => {
                const total = mode === "100%-stacked"
                  ? series.reduce(
                      (acc, s) => acc + Number(hover.datum[s.key] ?? 0),
                      0
                    )
                  : 0;
                const seriesDef = series.find((s) => s.key === hover.seriesKey);
                const idx = series.findIndex((s) => s.key === hover.seriesKey);
                const metric: TooltipMetric = {
                  label: seriesDef?.label ?? hover.seriesKey,
                  value: valueFormat(hover.value),
                  color: colors[idx],
                };
                if (mode === "100%-stacked" && total > 0) {
                  metric.hint = `${formatChartNumber((hover.value / total) * 100)}% of total`;
                }
                return [metric];
              })()}
            />
          ) : null}
        </ChartTooltip>
      </div>
    );
  }
);
BarChart.displayName = "BarChart";

interface BarChartInnerProps {
  data: BarChartDatum[];
  series: BarChartSeries[];
  orientation: BarChartOrientation;
  mode: BarChartMode;
  padding: number;
  innerPadding: number;
  valueTicks: number;
  valueFormat: (v: number) => string;
  colors: string[];
  showGrid: boolean;
  onHover: (payload: BarChartHoverPayload | null) => void;
  onBarClick?: BarChartProps["onBarClick"];
}

function BarChartInner({
  data,
  series,
  orientation,
  mode,
  padding,
  innerPadding,
  valueTicks,
  valueFormat,
  colors,
  showGrid,
  onHover,
  onBarClick,
}: BarChartInnerProps) {
  const { innerWidth, innerHeight } = useChart();
  const isVertical = orientation === "vertical";
  const stacked = mode !== "grouped";
  const categories = data.map((d) => d.category);

  const stackedResult = useMemo(() => {
    if (!stacked) return null;
    return stackSeries<BarChartDatum>({
      data,
      keys: series.map((s) => s.key),
      offset: (mode === "100%-stacked" ? "expand" : "none") as StackOffset,
      value: (d, k) => Number(d[k] ?? 0),
    });
  }, [data, series, mode, stacked]);

  const valueExtent = useMemo<[number, number]>(() => {
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
    return [lo, hi];
  }, [data, series, stackedResult]);

  const bandScaleInst: BandScale = useMemo(
    () =>
      bandScale({
        domain: categories,
        range: isVertical ? [0, innerWidth] : [0, innerHeight],
        padding,
      }),
    [categories, isVertical, innerWidth, innerHeight, padding]
  );

  const valueRange: [number, number] = isVertical
    ? [innerHeight, 0]
    : [0, innerWidth];
  const valueScale = useMemo(
    () =>
      linearScale({
        domain: valueExtent,
        range: valueRange,
        nice: true,
      }),
    [valueExtent, valueRange[0], valueRange[1]]
  );

  const subBand = useMemo(
    () =>
      bandScale({
        domain: series.map((s) => s.key),
        range: [0, bandScaleInst.bandwidth()],
        padding: innerPadding,
      }),
    [series, bandScaleInst, innerPadding]
  );

  return (
    <g className="vf-chart-bar-chart__inner">
      {showGrid && (
        <Gridlines mode={isVertical ? "y" : "x"} ticks={valueTicks} />
      )}
      <Axis
        orientation={isVertical ? "bottom" : "left"}
        scale={bandScaleInst}
      />
      <Axis
        orientation={isVertical ? "left" : "bottom"}
        scale={valueScale}
        ticks={valueTicks}
        format={(v) =>
          mode === "100%-stacked"
            ? `${Math.round((v as number) * 100)}%`
            : valueFormat(v as number)
        }
      />
      {stackedResult
        ? stackedResult.map((s, sIdx) => (
            <Bar
              key={s.key}
              data={s.values.map((pt) => {
                const bandPos = bandScaleInst(pt.data.category) ?? 0;
                if (isVertical) {
                  const y = valueScale(pt.y1);
                  const yBase = valueScale(pt.y0);
                  return {
                    x: bandPos,
                    y,
                    width: bandScaleInst.bandwidth(),
                    height: yBase - y,
                  };
                }
                const x = valueScale(pt.y0);
                const xEnd = valueScale(pt.y1);
                return {
                  x,
                  y: bandPos,
                  width: xEnd - x,
                  height: bandScaleInst.bandwidth(),
                };
              })}
              fill={colors[sIdx]}
              onBarClick={(_d, i) =>
                onBarClick?.({
                  datum: data[i]!,
                  seriesKey: s.key,
                  value: Number(data[i]![s.key] ?? 0),
                })
              }
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
          ))
        : series.map((s, sIdx) => (
            <Bar
              key={s.key}
              data={data.map((row) => {
                const bandPos = bandScaleInst(row.category) ?? 0;
                const subPos = subBand(s.key) ?? 0;
                const value = Number(row[s.key] ?? 0);
                if (isVertical) {
                  const y = valueScale(Math.max(0, value));
                  const yBase = valueScale(0);
                  return {
                    x: bandPos + subPos,
                    y: Math.min(y, yBase),
                    width: subBand.bandwidth(),
                    height: Math.abs(yBase - y),
                  };
                }
                const xStart = valueScale(Math.min(0, value));
                const xEnd = valueScale(Math.max(0, value));
                return {
                  x: xStart,
                  y: bandPos + subPos,
                  width: xEnd - xStart,
                  height: subBand.bandwidth(),
                };
              })}
              fill={colors[sIdx]}
              onBarClick={(_d, i) =>
                onBarClick?.({
                  datum: data[i]!,
                  seriesKey: s.key,
                  value: Number(data[i]![s.key] ?? 0),
                })
              }
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
          ))}
    </g>
  );
}
