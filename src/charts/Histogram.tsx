"use client";

// Histogram — auto-bins a numeric sample and renders the bin counts as bars.
// Delegates binning to d3-array.bin.

import {
  forwardRef,
  useMemo,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { bin as d3Bin } from "d3-array";
import { Axis } from "./primitives/Axis";
import { ChartFrame } from "./primitives/ChartFrame";
import { useChart, type ChartMargins } from "./primitives/ChartContext";
import { ChartTooltip } from "./primitives/ChartTooltip";
import { Gridlines } from "./primitives/Gridlines";
import { seriesPalette } from "./math/color";
import { linearScale } from "./math/scales";
import { Bar } from "./series/Bar";
import { cx } from "../utils/cx";

export interface HistogramProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  values: number[];
  /** Approximate bin count. Default 20. */
  bins?: number;
  width?: number;
  height?: number;
  margins?: Partial<ChartMargins>;
  title?: ReactNode;
  description?: ReactNode;
  showGrid?: boolean;
  color?: string;
  accessibleLabel?: string;
  xTicks?: number;
  yTicks?: number;
}

export const Histogram = forwardRef<HTMLDivElement, HistogramProps>(
  function Histogram(
    {
      values,
      bins = 20,
      width,
      height = 280,
      margins,
      title,
      description,
      showGrid = true,
      color,
      accessibleLabel,
      xTicks = 6,
      yTicks = 5,
      className,
      ...props
    },
    ref
  ) {
    const resolvedColor = color ?? seriesPalette(1)[0]!;
    const [hover, setHover] = useState<{
      lo: number;
      hi: number;
      count: number;
      x: number;
      y: number;
    } | null>(null);
    return (
      <div
        ref={ref}
        className={cx("vf-chart-histogram", className)}
        {...props}
      >
        <ChartFrame
          width={width}
          height={height}
          margins={margins}
          title={title}
          description={description}
          accessibleLabel={accessibleLabel ?? "Histogram"}
        >
          <HistogramInner
            values={values}
            bins={bins}
            xTicks={xTicks}
            yTicks={yTicks}
            color={resolvedColor}
            showGrid={showGrid}
            onHover={setHover}
          />
        </ChartFrame>
        <ChartTooltip active={!!hover} x={hover?.x ?? 0} y={hover?.y ?? 0}>
          {hover ? (
            <>
              <div>
                <strong>
                  [{hover.lo.toFixed(2)}, {hover.hi.toFixed(2)})
                </strong>
              </div>
              <div>count: {hover.count}</div>
            </>
          ) : null}
        </ChartTooltip>
      </div>
    );
  }
);
Histogram.displayName = "Histogram";

interface HistogramInnerProps {
  values: number[];
  bins: number;
  xTicks: number;
  yTicks: number;
  color: string;
  showGrid: boolean;
  onHover: (
    h: { lo: number; hi: number; count: number; x: number; y: number } | null
  ) => void;
}

function HistogramInner({
  values,
  bins,
  xTicks,
  yTicks,
  color,
  showGrid,
  onHover,
}: HistogramInnerProps) {
  const { innerWidth, innerHeight } = useChart();
  const extent = useMemo<[number, number]>(() => {
    let lo = Infinity;
    let hi = -Infinity;
    for (const v of values) {
      if (v < lo) lo = v;
      if (v > hi) hi = v;
    }
    if (!Number.isFinite(lo)) return [0, 1];
    if (lo === hi) hi = lo + 1;
    return [lo, hi];
  }, [values]);

  const xScale = linearScale({
    domain: extent,
    range: [0, innerWidth],
    nice: true,
  });

  const binned = useMemo(() => {
    const binFn = d3Bin<number, number>()
      .domain(xScale.domain() as [number, number])
      .thresholds(bins);
    return binFn(values);
  }, [values, bins, xScale]);

  const maxCount = Math.max(1, ...binned.map((b) => b.length));
  const yScale = linearScale({
    domain: [0, maxCount],
    range: [innerHeight, 0],
    nice: true,
  });

  return (
    <g className="vf-chart-histogram__inner">
      {showGrid && <Gridlines mode="y" ticks={yTicks} />}
      <Axis orientation="bottom" scale={xScale} ticks={xTicks} />
      <Axis orientation="left" scale={yScale} ticks={yTicks} />
      <Bar
        data={binned.map((b) => {
          const x0 = b.x0 ?? 0;
          const x1 = b.x1 ?? 0;
          const x = xScale(x0);
          const w = xScale(x1) - xScale(x0);
          const y = yScale(b.length);
          return {
            x,
            y,
            width: Math.max(0, w - 1),
            height: innerHeight - y,
          };
        })}
        fill={color}
        onBarHover={(d, i, e) => {
          const bin = binned[i];
          onHover(
            d && bin
              ? {
                  lo: bin.x0 ?? 0,
                  hi: bin.x1 ?? 0,
                  count: bin.length,
                  x: e.clientX,
                  y: e.clientY,
                }
              : null
          );
        }}
      />
    </g>
  );
}
