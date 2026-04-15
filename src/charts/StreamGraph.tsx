"use client";

// StreamGraph — stacked area with a "wiggle" baseline (minimum total area
// variance). Useful for showing how composition shifts over time without
// anchoring to zero.

import {
  forwardRef,
  useMemo,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { Axis } from "./primitives/Axis";
import { ChartFrame } from "./primitives/ChartFrame";
import { useChart, type ChartMargins } from "./primitives/ChartContext";
import { ChartLegend, type ChartLegendItem } from "./primitives/Legend";
import { seriesPalette } from "./math/color";
import {
  linearScale,
  pointScale,
  timeScale,
  type PointScale,
} from "./math/scales";
import { stackSeries } from "./math/stack";
import type { CurveKind } from "./math/curves";
import { Area } from "./series/Area";
import { cx } from "../utils/cx";

export interface StreamGraphDatum {
  x: number | Date | string;
  [seriesKey: string]: number | Date | string | null | undefined;
}

export interface StreamGraphSeries {
  key: string;
  label?: string;
  color?: string;
}

export interface StreamGraphProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  data: StreamGraphDatum[];
  series: StreamGraphSeries[];
  xKind?: "linear" | "time" | "category";
  curve?: CurveKind;
  width?: number;
  height?: number;
  margins?: Partial<ChartMargins>;
  title?: ReactNode;
  description?: ReactNode;
  showLegend?: boolean;
  accessibleLabel?: string;
}

export const StreamGraph = forwardRef<HTMLDivElement, StreamGraphProps>(
  function StreamGraph(
    {
      data,
      series,
      xKind = "linear",
      curve = "monotone",
      width,
      height = 280,
      margins,
      title,
      description,
      showLegend = true,
      accessibleLabel,
      className,
      ...props
    },
    ref
  ) {
    const colors = useMemo(() => {
      const palette = seriesPalette(series.length);
      return series.map((s, i) => s.color ?? palette[i]!);
    }, [series]);
    return (
      <div
        ref={ref}
        className={cx("vf-chart-stream", className)}
        {...props}
      >
        <ChartFrame
          width={width}
          height={height}
          margins={margins}
          title={title}
          description={description}
          accessibleLabel={accessibleLabel ?? "Stream graph"}
        >
          <StreamInner
            data={data}
            series={series}
            xKind={xKind}
            curve={curve}
            colors={colors}
          />
        </ChartFrame>
        {showLegend && (
          <ChartLegend
            className="vf-chart-stream__legend"
            items={series.map<ChartLegendItem>((s, i) => ({
              key: s.key,
              label: s.label ?? s.key,
              color: colors[i]!,
              glyph: "square",
            }))}
          />
        )}
      </div>
    );
  }
);
StreamGraph.displayName = "StreamGraph";

interface StreamInnerProps {
  data: StreamGraphDatum[];
  series: StreamGraphSeries[];
  xKind: "linear" | "time" | "category";
  curve: CurveKind;
  colors: string[];
}

function StreamInner({
  data,
  series,
  xKind,
  curve,
  colors,
}: StreamInnerProps) {
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

  const xAt = (x: StreamGraphDatum["x"]) => {
    if (xKind === "time") {
      const d = x instanceof Date ? x : new Date(x as string | number);
      return (xScale as ReturnType<typeof timeScale>)(d);
    }
    if (xKind === "category") {
      return (xScale as PointScale)(String(x)) ?? 0;
    }
    return (xScale as ReturnType<typeof linearScale>)(Number(x));
  };

  const stacked = useMemo(
    () =>
      stackSeries<StreamGraphDatum>({
        data,
        keys: series.map((s) => s.key),
        offset: "wiggle",
        order: "inside-out",
        value: (d, k) => Number(d[k] ?? 0),
      }),
    [data, series]
  );

  const [yMin, yMax] = useMemo<[number, number]>(() => {
    let lo = Infinity;
    let hi = -Infinity;
    for (const s of stacked) {
      for (const pt of s.values) {
        if (pt.y0 < lo) lo = pt.y0;
        if (pt.y1 > hi) hi = pt.y1;
      }
    }
    if (!Number.isFinite(lo) || lo === hi) return [-1, 1];
    return [lo, hi];
  }, [stacked]);

  const y = linearScale({
    domain: [yMin, yMax],
    range: [innerHeight, 0],
  });

  return (
    <g>
      <Axis orientation="bottom" scale={xScale} />
      {stacked.map((s, sIdx) => {
        const areaPoints = s.values.map((pt) => ({
          x: xAt(pt.data.x) as number,
          y0: y(pt.y0),
          y1: y(pt.y1),
        }));
        return (
          <Area
            key={s.key}
            data={areaPoints}
            curve={curve}
            fill={colors[sIdx]}
            fillOpacity={0.75}
          />
        );
      })}
    </g>
  );
}
