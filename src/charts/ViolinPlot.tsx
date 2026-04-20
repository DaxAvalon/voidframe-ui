"use client";

// ViolinPlot — kernel-density estimate (Gaussian kernel) rendered as a
// symmetrical area around each group's median. Falls back to a standard
// BoxPlot-style rect when the sample is too small to estimate usefully.

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
import { ChartTooltipBody } from "./primitives/ChartTooltipBody";
import { Gridlines } from "./primitives/Gridlines";
import { bandScale, linearScale } from "./math/scales";
import { seriesPalette } from "./math/color";
import { cx } from "../utils/cx";

export interface ViolinPlotGroup {
  key: string;
  label?: string;
  values: number[];
  color?: string;
}

export interface ViolinPlotProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  groups: ViolinPlotGroup[];
  width?: number;
  height?: number;
  margins?: Partial<ChartMargins>;
  title?: ReactNode;
  description?: ReactNode;
  valueTicks?: number;
  valueFormat?: (v: number) => string;
  accessibleLabel?: string;
  padding?: number;
  /** KDE resolution — number of sample points. Default 32. */
  resolution?: number;
  /** Bandwidth for the Gaussian kernel. Default `auto` (Silverman). */
  bandwidth?: number | "auto";
  /** Below this sample size, fall back to a box-like rect. Default 10. */
  minSampleForKde?: number;
  showGrid?: boolean;
}

function silvermanBandwidth(values: number[]): number {
  if (values.length === 0) return 1;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance =
    values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length;
  const sd = Math.sqrt(variance);
  return 1.06 * sd * values.length ** (-1 / 5) || 1;
}

function gaussianKernel(u: number): number {
  return Math.exp(-0.5 * u * u) / Math.sqrt(2 * Math.PI);
}

function kde(values: number[], sample: number[], h: number): number[] {
  const n = values.length || 1;
  return sample.map((x) => {
    let sum = 0;
    for (const v of values) sum += gaussianKernel((x - v) / h);
    return sum / (n * h);
  });
}

/**
 * Violin plot (density + box combined). Axes: band x linear.
 */
export const ViolinPlot = forwardRef<HTMLDivElement, ViolinPlotProps>(
  function ViolinPlot(
    {
      groups,
      width,
      height = 320,
      margins,
      title,
      description,
      valueTicks = 5,
      valueFormat = (v) => String(v),
      accessibleLabel,
      padding = 0.3,
      resolution = 32,
      bandwidth = "auto",
      minSampleForKde = 10,
      showGrid = true,
      className,
      ...props
    },
    ref
  ) {
    const [hover, setHover] = useState<{
      group: ViolinPlotGroup;
      count: number;
      x: number;
      y: number;
    } | null>(null);

    return (
      <div
        ref={ref}
        className={cx("vf-chart-violin", className)}
        {...props}
      >
        <ChartFrame
          width={width}
          height={height}
          margins={margins}
          title={title}
          description={description}
          accessibleLabel={accessibleLabel ?? "Violin plot"}
        >
          <ViolinInner
            groups={groups}
            resolution={resolution}
            bandwidth={bandwidth}
            minSampleForKde={minSampleForKde}
            valueTicks={valueTicks}
            valueFormat={valueFormat}
            padding={padding}
            showGrid={showGrid}
            onHover={setHover}
          />
        </ChartFrame>
        <ChartTooltip active={!!hover} x={hover?.x ?? 0} y={hover?.y ?? 0}>
          {hover ? (
            <ChartTooltipBody
              title={hover.group.label ?? hover.group.key}
              metrics={[{ label: "samples", value: String(hover.count) }]}
            />
          ) : null}
        </ChartTooltip>
      </div>
    );
  }
);
ViolinPlot.displayName = "ViolinPlot";

interface ViolinInnerProps {
  groups: ViolinPlotGroup[];
  resolution: number;
  bandwidth: number | "auto";
  minSampleForKde: number;
  valueTicks: number;
  valueFormat: (v: number) => string;
  padding: number;
  showGrid: boolean;
  onHover: (
    h:
      | { group: ViolinPlotGroup; count: number; x: number; y: number }
      | null
  ) => void;
}

function ViolinInner({
  groups,
  resolution,
  bandwidth,
  minSampleForKde,
  valueTicks,
  valueFormat,
  padding,
  showGrid,
  onHover,
}: ViolinInnerProps) {
  const { innerWidth, innerHeight } = useChart();
  const band = bandScale({
    domain: groups.map((g) => g.key),
    range: [0, innerWidth],
    padding,
  });
  const extent = useMemo<[number, number]>(() => {
    let lo = Infinity;
    let hi = -Infinity;
    for (const g of groups) {
      for (const v of g.values) {
        if (v < lo) lo = v;
        if (v > hi) hi = v;
      }
    }
    if (!Number.isFinite(lo)) lo = 0;
    if (!Number.isFinite(hi)) hi = 1;
    if (lo === hi) hi = lo + 1;
    return [lo, hi];
  }, [groups]);

  const y = linearScale({
    domain: extent,
    range: [innerHeight, 0],
    nice: true,
  });

  const palette = seriesPalette(groups.length);
  const bw = band.bandwidth();
  const half = bw / 2;

  return (
    <ChartScales xScale={band as never} yScale={y as never}>
    <g>
      {showGrid && <Gridlines mode="y" ticks={valueTicks} />}
      <Axis
        orientation="bottom"
        scale={band}
        format={(v) =>
          groups.find((g) => g.key === v)?.label ?? String(v)
        }
      />
      <Axis
        orientation="left"
        scale={y}
        ticks={valueTicks}
        format={(v) => valueFormat(v as number)}
      />
      {groups.map((g, i) => {
        const x0 = band(g.key) ?? 0;
        const mid = x0 + half;
        const color = g.color ?? palette[i]!;
        if (g.values.length < minSampleForKde) {
          // Fallback: plain quantile box when the sample is too small.
          const sorted = g.values.slice().sort((a, b) => a - b);
          const min = sorted[0] ?? 0;
          const max = sorted[sorted.length - 1] ?? 0;
          return (
            <g
              key={g.key}
              onPointerMove={(e) =>
                onHover({
                  group: g,
                  count: g.values.length,
                  x: e.clientX,
                  y: e.clientY,
                })
              }
              onPointerLeave={() => onHover(null)}
            >
              <rect
                className="vf-chart-violin__fallback"
                x={mid - half * 0.4}
                y={y(max)}
                width={half * 0.8}
                height={y(min) - y(max)}
                fill={color}
                fillOpacity={0.4}
                stroke={color}
              />
            </g>
          );
        }
        const h =
          bandwidth === "auto" ? silvermanBandwidth(g.values) : bandwidth;
        const sample: number[] = [];
        for (let k = 0; k < resolution; k++) {
          const t = k / (resolution - 1);
          sample.push(extent[0] + t * (extent[1] - extent[0]));
        }
        const densities = kde(g.values, sample, h);
        const maxDensity = Math.max(1e-9, ...densities);
        // Build a symmetrical polygon — left + right mirror.
        const left = sample
          .map((v, k) => {
            const d = (densities[k]! / maxDensity) * half;
            return `${mid - d},${y(v)}`;
          })
          .join(" ");
        const right = sample
          .map((v, k) => {
            const d = (densities[k]! / maxDensity) * half;
            return `${mid + d},${y(v)}`;
          })
          .reverse()
          .join(" ");
        const points = `${left} ${right}`;
        return (
          <g
            key={g.key}
            onPointerMove={(e) =>
              onHover({
                group: g,
                count: g.values.length,
                x: e.clientX,
                y: e.clientY,
              })
            }
            onPointerLeave={() => onHover(null)}
          >
            <polygon
              className="vf-chart-violin__shape"
              points={points}
              fill={color}
              fillOpacity={0.35}
              stroke={color}
              strokeWidth={1.2}
            />
          </g>
        );
      })}
    </g>
    </ChartScales>
  );
}
