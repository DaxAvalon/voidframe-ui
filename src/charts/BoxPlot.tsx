"use client";

// BoxPlot — min / Q1 / median / Q3 / max per group, with whiskers + outlier
// markers. Outliers are values beyond 1.5 × IQR from Q1/Q3.

import {
  forwardRef,
  useMemo,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { quantileSorted } from "d3-array";
import { Axis } from "./primitives/Axis";
import { ChartFrame } from "./primitives/ChartFrame";
import { useChart, type ChartMargins } from "./primitives/ChartContext";
import { ChartTooltip } from "./primitives/ChartTooltip";
import { Gridlines } from "./primitives/Gridlines";
import { bandScale, linearScale } from "./math/scales";
import { seriesPalette } from "./math/color";
import { cx } from "../utils/cx";

export interface BoxPlotGroup {
  key: string;
  label?: string;
  values: number[];
  color?: string;
}

export interface BoxPlotStats {
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
  outliers: number[];
}

export interface BoxPlotProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  groups: BoxPlotGroup[];
  width?: number;
  height?: number;
  margins?: Partial<ChartMargins>;
  title?: ReactNode;
  description?: ReactNode;
  valueTicks?: number;
  valueFormat?: (v: number) => string;
  accessibleLabel?: string;
  padding?: number;
  showGrid?: boolean;
  /** IQR whisker multiplier. Default 1.5. */
  whiskerK?: number;
}

export function computeBoxStats(
  rawValues: number[],
  whiskerK = 1.5
): BoxPlotStats {
  const values = rawValues.slice().sort((a, b) => a - b);
  const q1 = quantileSorted(values, 0.25) ?? 0;
  const median = quantileSorted(values, 0.5) ?? 0;
  const q3 = quantileSorted(values, 0.75) ?? 0;
  const iqr = q3 - q1;
  const lower = q1 - whiskerK * iqr;
  const upper = q3 + whiskerK * iqr;
  const inliers = values.filter((v) => v >= lower && v <= upper);
  const outliers = values.filter((v) => v < lower || v > upper);
  return {
    min: inliers[0] ?? q1,
    max: inliers[inliers.length - 1] ?? q3,
    q1,
    median,
    q3,
    outliers,
  };
}

export const BoxPlot = forwardRef<HTMLDivElement, BoxPlotProps>(
  function BoxPlot(
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
      showGrid = true,
      whiskerK = 1.5,
      className,
      ...props
    },
    ref
  ) {
    const stats = useMemo(
      () =>
        groups.map((g) => ({
          group: g,
          stats: computeBoxStats(g.values, whiskerK),
        })),
      [groups, whiskerK]
    );
    const [hover, setHover] = useState<{
      group: BoxPlotGroup;
      stats: BoxPlotStats;
      x: number;
      y: number;
    } | null>(null);

    return (
      <div
        ref={ref}
        className={cx("vf-chart-boxplot", className)}
        {...props}
      >
        <ChartFrame
          width={width}
          height={height}
          margins={margins}
          title={title}
          description={description}
          accessibleLabel={accessibleLabel ?? "Box plot"}
        >
          <BoxPlotInner
            stats={stats}
            valueTicks={valueTicks}
            valueFormat={valueFormat}
            padding={padding}
            showGrid={showGrid}
            onHover={setHover}
          />
        </ChartFrame>
        <ChartTooltip active={!!hover} x={hover?.x ?? 0} y={hover?.y ?? 0}>
          {hover ? (
            <>
              <div>
                <strong>{hover.group.label ?? hover.group.key}</strong>
              </div>
              <div>min: {valueFormat(hover.stats.min)}</div>
              <div>Q1: {valueFormat(hover.stats.q1)}</div>
              <div>median: {valueFormat(hover.stats.median)}</div>
              <div>Q3: {valueFormat(hover.stats.q3)}</div>
              <div>max: {valueFormat(hover.stats.max)}</div>
              {hover.stats.outliers.length > 0 && (
                <div>outliers: {hover.stats.outliers.length}</div>
              )}
            </>
          ) : null}
        </ChartTooltip>
      </div>
    );
  }
);
BoxPlot.displayName = "BoxPlot";

interface BoxPlotInnerProps {
  stats: Array<{ group: BoxPlotGroup; stats: BoxPlotStats }>;
  valueTicks: number;
  valueFormat: (v: number) => string;
  padding: number;
  showGrid: boolean;
  onHover: (
    h: {
      group: BoxPlotGroup;
      stats: BoxPlotStats;
      x: number;
      y: number;
    } | null
  ) => void;
}

function BoxPlotInner({
  stats,
  valueTicks,
  valueFormat,
  padding,
  showGrid,
  onHover,
}: BoxPlotInnerProps) {
  const { innerWidth, innerHeight } = useChart();
  const band = bandScale({
    domain: stats.map((s) => s.group.key),
    range: [0, innerWidth],
    padding,
  });
  const yExtent: [number, number] = useMemo(() => {
    let lo = Infinity;
    let hi = -Infinity;
    for (const { stats: s } of stats) {
      const candidates = [s.min, s.max, ...s.outliers];
      for (const v of candidates) {
        if (v < lo) lo = v;
        if (v > hi) hi = v;
      }
    }
    if (!Number.isFinite(lo)) lo = 0;
    if (!Number.isFinite(hi)) hi = 1;
    if (lo === hi) hi = lo + 1;
    return [lo, hi];
  }, [stats]);
  const y = linearScale({
    domain: yExtent,
    range: [innerHeight, 0],
    nice: true,
  });
  const palette = seriesPalette(stats.length);
  const bw = band.bandwidth();
  const midOffset = bw / 2;

  return (
    <g>
      {showGrid && <Gridlines mode="y" ticks={valueTicks} />}
      <Axis
        orientation="bottom"
        scale={band}
        format={(v) =>
          stats.find((s) => s.group.key === v)?.group.label ?? String(v)
        }
      />
      <Axis
        orientation="left"
        scale={y}
        ticks={valueTicks}
        format={(v) => valueFormat(v as number)}
      />
      {stats.map(({ group, stats: s }, i) => {
        const x0 = band(group.key) ?? 0;
        const mid = x0 + midOffset;
        const color = group.color ?? palette[i]!;
        const boxTop = y(s.q3);
        const boxBottom = y(s.q1);
        return (
          <g
            key={group.key}
            onPointerMove={(e) =>
              onHover({
                group,
                stats: s,
                x: e.clientX,
                y: e.clientY,
              })
            }
            onPointerLeave={() => onHover(null)}
          >
            {/* whisker (min → max) */}
            <line
              className="vf-chart-boxplot__whisker"
              x1={mid}
              y1={y(s.min)}
              x2={mid}
              y2={y(s.max)}
              stroke={color}
            />
            <line
              className="vf-chart-boxplot__cap"
              x1={x0 + bw * 0.25}
              y1={y(s.min)}
              x2={x0 + bw * 0.75}
              y2={y(s.min)}
              stroke={color}
            />
            <line
              className="vf-chart-boxplot__cap"
              x1={x0 + bw * 0.25}
              y1={y(s.max)}
              x2={x0 + bw * 0.75}
              y2={y(s.max)}
              stroke={color}
            />
            {/* box (Q1 → Q3) */}
            <rect
              className="vf-chart-boxplot__box"
              x={x0}
              y={boxTop}
              width={bw}
              height={boxBottom - boxTop}
              fill={color}
              fillOpacity={0.4}
              stroke={color}
            />
            {/* median */}
            <line
              className="vf-chart-boxplot__median"
              x1={x0}
              y1={y(s.median)}
              x2={x0 + bw}
              y2={y(s.median)}
              stroke={color}
              strokeWidth={2}
            />
            {/* outliers */}
            {s.outliers.map((v, j) => (
              <circle
                key={j}
                className="vf-chart-boxplot__outlier"
                cx={mid}
                cy={y(v)}
                r={2.5}
                fill="none"
                stroke={color}
              />
            ))}
          </g>
        );
      })}
    </g>
  );
}
