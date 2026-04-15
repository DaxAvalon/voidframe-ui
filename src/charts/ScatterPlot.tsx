"use client";

// ScatterPlot — numeric x + y, optional size via `sizeKey` (then it's a
// BubbleChart). Supports multiple series via different colors.

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
import { ChartLegend, type ChartLegendItem } from "./primitives/Legend";
import { Gridlines } from "./primitives/Gridlines";
import { seriesPalette } from "./math/color";
import { linearScale, sqrtScale } from "./math/scales";
import { Point, type PointShape } from "./series/Point";
import { cx } from "../utils/cx";

export interface ScatterDatum {
  x: number;
  y: number;
  size?: number;
  series?: string;
  label?: string;
}

export interface ScatterSeries {
  key: string;
  label?: string;
  color?: string;
  shape?: PointShape;
}

export interface ScatterPlotProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  data: ScatterDatum[];
  /** Optional series definitions. When omitted, all points share defaults. */
  series?: ScatterSeries[];
  width?: number;
  height?: number;
  margins?: Partial<ChartMargins>;
  /** Map point size values to pixel radius range. Default `[3, 18]`. */
  sizeRange?: [number, number];
  title?: ReactNode;
  description?: ReactNode;
  showLegend?: boolean;
  showGrid?: boolean;
  xTicks?: number;
  yTicks?: number;
  xFormat?: (value: number) => string;
  yFormat?: (value: number) => string;
  accessibleLabel?: string;
  /** Use a circle glyph instead of the brutalist square. Default square. */
  shape?: PointShape;
}

export const ScatterPlot = forwardRef<HTMLDivElement, ScatterPlotProps>(
  function ScatterPlot(
    {
      data,
      series,
      width,
      height = 320,
      margins,
      sizeRange = [3, 18],
      title,
      description,
      showLegend = true,
      showGrid = true,
      xTicks = 5,
      yTicks = 5,
      xFormat = String,
      yFormat = String,
      accessibleLabel,
      className,
      shape = "square",
      ...props
    },
    ref
  ) {
    const resolvedSeries = series ?? [{ key: "default", label: "Data" }];
    const colors = useMemo(() => {
      const palette = seriesPalette(resolvedSeries.length);
      return resolvedSeries.map((s, i) => s.color ?? palette[i]!);
    }, [resolvedSeries]);

    const [hover, setHover] = useState<{
      datum: ScatterDatum;
      x: number;
      y: number;
    } | null>(null);

    return (
      <div ref={ref} className={cx("vf-chart-scatter", className)} {...props}>
        <ChartFrame
          width={width}
          height={height}
          margins={margins}
          title={title}
          description={description}
          accessibleLabel={accessibleLabel ?? "Scatter plot"}
        >
          <ScatterInner
            data={data}
            series={resolvedSeries}
            colors={colors}
            sizeRange={sizeRange}
            xTicks={xTicks}
            yTicks={yTicks}
            xFormat={xFormat}
            yFormat={yFormat}
            showGrid={showGrid}
            shape={shape}
            onHover={setHover}
          />
        </ChartFrame>
        {showLegend && resolvedSeries.length > 1 && (
          <ChartLegend
            className="vf-chart-scatter__legend"
            items={resolvedSeries.map<ChartLegendItem>((s, i) => ({
              key: s.key,
              label: s.label ?? s.key,
              color: colors[i]!,
              glyph: "circle",
            }))}
          />
        )}
        <ChartTooltip active={!!hover} x={hover?.x ?? 0} y={hover?.y ?? 0}>
          {hover ? (
            <>
              {hover.datum.label && (
                <div>
                  <strong>{hover.datum.label}</strong>
                </div>
              )}
              <div>
                {xFormat(hover.datum.x)}, {yFormat(hover.datum.y)}
              </div>
              {hover.datum.size !== undefined && (
                <div>size: {hover.datum.size}</div>
              )}
            </>
          ) : null}
        </ChartTooltip>
      </div>
    );
  }
);
ScatterPlot.displayName = "ScatterPlot";

/** Alias — "BubbleChart" is just ScatterPlot with sizeRange used. */
export const BubbleChart = ScatterPlot;
(BubbleChart as unknown as { displayName: string }).displayName = "BubbleChart";

interface ScatterInnerProps {
  data: ScatterDatum[];
  series: ScatterSeries[];
  colors: string[];
  sizeRange: [number, number];
  xTicks: number;
  yTicks: number;
  xFormat: (v: number) => string;
  yFormat: (v: number) => string;
  showGrid: boolean;
  shape: PointShape;
  onHover: (h: { datum: ScatterDatum; x: number; y: number } | null) => void;
}

function ScatterInner({
  data,
  series,
  colors,
  sizeRange,
  xTicks,
  yTicks,
  xFormat,
  yFormat,
  showGrid,
  shape,
  onHover,
}: ScatterInnerProps) {
  const { innerWidth, innerHeight } = useChart();
  const xExtent: [number, number] = useMemo(() => {
    let lo = Infinity;
    let hi = -Infinity;
    for (const p of data) {
      if (p.x < lo) lo = p.x;
      if (p.x > hi) hi = p.x;
    }
    if (!Number.isFinite(lo) || !Number.isFinite(hi) || lo === hi)
      return [0, 1];
    return [lo, hi];
  }, [data]);
  const yExtent: [number, number] = useMemo(() => {
    let lo = Infinity;
    let hi = -Infinity;
    for (const p of data) {
      if (p.y < lo) lo = p.y;
      if (p.y > hi) hi = p.y;
    }
    if (!Number.isFinite(lo) || !Number.isFinite(hi) || lo === hi)
      return [0, 1];
    return [lo, hi];
  }, [data]);
  const sizeExtent: [number, number] = useMemo(() => {
    let lo = Infinity;
    let hi = -Infinity;
    for (const p of data) {
      if (p.size === undefined) continue;
      if (p.size < lo) lo = p.size;
      if (p.size > hi) hi = p.size;
    }
    if (!Number.isFinite(lo)) return [0, 1];
    if (lo === hi) hi = lo + 1;
    return [lo, hi];
  }, [data]);

  const xScale = linearScale({
    domain: xExtent,
    range: [0, innerWidth],
    nice: true,
  });
  const yScale = linearScale({
    domain: yExtent,
    range: [innerHeight, 0],
    nice: true,
  });
  const sScale = sqrtScale({ domain: sizeExtent, range: sizeRange });

  const bySeries = new Map<string, ScatterDatum[]>();
  for (const p of data) {
    const key = p.series ?? series[0]!.key;
    const list = bySeries.get(key) ?? [];
    list.push(p);
    bySeries.set(key, list);
  }

  return (
    <g className="vf-chart-scatter__inner">
      {showGrid && <Gridlines mode="both" ticks={yTicks} />}
      <Axis
        orientation="bottom"
        scale={xScale}
        ticks={xTicks}
        format={(v) => xFormat(v as number)}
      />
      <Axis
        orientation="left"
        scale={yScale}
        ticks={yTicks}
        format={(v) => yFormat(v as number)}
      />
      {series.map((s, sIdx) => {
        const points = (bySeries.get(s.key) ?? []).map((d) => ({
          x: xScale(d.x),
          y: yScale(d.y),
          size: d.size !== undefined ? sScale(d.size) * 2 : 8,
        }));
        return (
          <Point
            key={s.key}
            data={points}
            shape={s.shape ?? shape}
            fill={colors[sIdx]}
            stroke={colors[sIdx]}
            strokeWidth={1}
            onPointHover={(d, i, e) =>
              onHover(
                d
                  ? {
                      datum:
                        (bySeries.get(s.key) ?? [])[i] ?? ({} as ScatterDatum),
                      x: e.clientX,
                      y: e.clientY,
                    }
                  : null
              )
            }
          />
        );
      })}
    </g>
  );
}
