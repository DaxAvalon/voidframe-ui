"use client";

// RadarChart — each datum has one axis per dimension; series become polygons
// over the same radial axis set.

import {
  forwardRef,
  useMemo,
  useRef,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { ChartLegend, type ChartLegendItem } from "./primitives/Legend";
import { seriesPalette } from "./math/color";
import { linearScale } from "./math/scales";
import { cx } from "../utils/cx";
import { useElementSize } from "../hooks/useElementSize";

export interface RadarSeries {
  key: string;
  label?: string;
  color?: string;
  values: number[];
}

export interface RadarChartProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  /** Axis labels, one per dimension. */
  axes: string[];
  series: RadarSeries[];
  /** Max radius domain. Defaults to the max value across all series. */
  maxValue?: number;
  /** Axis ring count. Default 5. */
  rings?: number;
  size?: number;
  title?: ReactNode;
  description?: ReactNode;
  showLegend?: boolean;
  accessibleLabel?: string;
  /** Fill opacity. Default 0.25. */
  fillOpacity?: number;
}

export const RadarChart = forwardRef<HTMLDivElement, RadarChartProps>(
  function RadarChart(
    {
      axes,
      series,
      maxValue,
      rings = 5,
      size: sizeProp,
      title,
      description,
      showLegend = true,
      accessibleLabel,
      fillOpacity = 0.25,
      className,
      style,
      ...props
    },
    ref
  ) {
    const containerRef = useRef<HTMLDivElement>(null);
    const mergedRef = (node: HTMLDivElement | null) => {
      (containerRef as { current: HTMLDivElement | null }).current = node;
      if (typeof ref === "function") ref(node);
      else if (ref)
        (ref as { current: HTMLDivElement | null }).current = node;
    };
    const measured = useElementSize(containerRef);
    const size = sizeProp ?? measured.width ?? 300;
    const radius = Math.max(20, size / 2 - 24);

    const colors = useMemo(() => {
      const palette = seriesPalette(series.length);
      return series.map((s, i) => s.color ?? palette[i]!);
    }, [series]);

    const computedMax = useMemo(() => {
      if (maxValue !== undefined) return maxValue;
      let hi = 0;
      for (const s of series) {
        for (const v of s.values) if (v > hi) hi = v;
      }
      return hi || 1;
    }, [maxValue, series]);

    const rScale = linearScale({
      domain: [0, computedMax],
      range: [0, radius],
      nice: true,
    });

    const angleFor = (i: number) =>
      (i / axes.length) * Math.PI * 2 - Math.PI / 2;

    const pointFor = (value: number, idx: number) => {
      const r = rScale(value);
      const a = angleFor(idx);
      return { x: Math.cos(a) * r, y: Math.sin(a) * r };
    };

    return (
      <div
        ref={mergedRef}
        className={cx("vf-chart-radar", className)}
        style={{ width: sizeProp ?? "100%", ...style }}
        {...props}
      >
        {(title || description) && (
          <div className="vf-chart-frame__header">
            {title && <h4 className="vf-chart-frame__title">{title}</h4>}
            {description && (
              <p className="vf-chart-frame__description">{description}</p>
            )}
          </div>
        )}
        <svg
          className="vf-chart-radar__svg"
          role="img"
          aria-label={accessibleLabel ?? "Radar chart"}
          width={size}
          height={size}
          viewBox={`${-size / 2} ${-size / 2} ${size} ${size}`}
        >
          {/* rings */}
          {Array.from({ length: rings }).map((_, i) => {
            const r = (radius * (i + 1)) / rings;
            const pts = axes
              .map((_, j) => {
                const a = angleFor(j);
                return `${Math.cos(a) * r},${Math.sin(a) * r}`;
              })
              .join(" ");
            return (
              <polygon
                key={i}
                className="vf-chart-radar__ring"
                points={pts}
                fill="none"
              />
            );
          })}
          {/* axis spokes + labels */}
          {axes.map((label, i) => {
            const a = angleFor(i);
            const x = Math.cos(a) * radius;
            const y = Math.sin(a) * radius;
            return (
              <g key={label}>
                <line
                  className="vf-chart-radar__axis"
                  x1={0}
                  y1={0}
                  x2={x}
                  y2={y}
                />
                <text
                  className="vf-chart-radar__label"
                  x={Math.cos(a) * (radius + 12)}
                  y={Math.sin(a) * (radius + 12)}
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  {label}
                </text>
              </g>
            );
          })}
          {/* series polygons */}
          {series.map((s, sIdx) => {
            const pts = s.values
              .map((v, i) => {
                const p = pointFor(v, i);
                return `${p.x},${p.y}`;
              })
              .join(" ");
            return (
              <g key={s.key} className="vf-chart-radar__series">
                <polygon
                  points={pts}
                  fill={colors[sIdx]}
                  fillOpacity={fillOpacity}
                  stroke={colors[sIdx]}
                  strokeWidth={1.5}
                />
                {s.values.map((v, i) => {
                  const p = pointFor(v, i);
                  return (
                    <rect
                      key={i}
                      x={p.x - 2}
                      y={p.y - 2}
                      width={4}
                      height={4}
                      fill={colors[sIdx]}
                    />
                  );
                })}
              </g>
            );
          })}
        </svg>
        {showLegend && series.length > 1 && (
          <ChartLegend
            className="vf-chart-radar__legend"
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
RadarChart.displayName = "RadarChart";
