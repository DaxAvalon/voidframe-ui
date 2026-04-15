"use client";

// PieChart + DonutChart — share the same rendering, differ only in inner
// radius.

import {
  forwardRef,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { pie as d3Pie } from "d3-shape";
import { ChartLegend, type ChartLegendItem } from "./primitives/Legend";
import { ChartTooltip } from "./primitives/ChartTooltip";
import {
  ChartTooltipBody,
  type TooltipMetric,
} from "./primitives/ChartTooltipBody";
import { formatChartNumber, seriesPalette } from "./math/color";
import { Arc } from "./series/Arc";
import { cx } from "../utils/cx";
import { useElementSize } from "../hooks/useElementSize";

export interface PieChartDatum {
  key: string;
  value: number;
  label?: string;
  color?: string;
}

export interface PieChartProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  data: PieChartDatum[];
  /** Inner radius as a fraction of outer radius (0..1). 0 = pie, 0.6 = donut. */
  innerRatio?: number;
  padAngle?: number;
  cornerRadius?: number;
  /** Start angle in radians. Default `-Math.PI / 2` (12 o'clock). */
  startAngle?: number;
  endAngle?: number;
  /** Side length of the chart (width === height). Default 280. */
  size?: number;
  title?: ReactNode;
  description?: ReactNode;
  showLegend?: boolean;
  accessibleLabel?: string;
  valueFormat?: (v: number) => string;
}

function PieChartImpl(
  {
    data,
    innerRatio = 0,
    padAngle = 0,
    cornerRadius = 0,
    startAngle = -Math.PI / 2,
    endAngle,
    size: sizeProp,
    title,
    description,
    showLegend = true,
    accessibleLabel,
    valueFormat = (v) => formatChartNumber(v),
    className,
    style,
    ...props
  }: PieChartProps,
  ref: React.ForwardedRef<HTMLDivElement>
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mergedRef = (node: HTMLDivElement | null) => {
    (containerRef as { current: HTMLDivElement | null }).current = node;
    if (typeof ref === "function") ref(node);
    else if (ref)
      (ref as { current: HTMLDivElement | null }).current = node;
  };
  const measured = useElementSize(containerRef);
  const size = sizeProp ?? measured.width ?? 280;

  const total = data.reduce((acc, d) => acc + d.value, 0);
  const pieData = useMemo(() => {
    const pieLayout = d3Pie<PieChartDatum>()
      .sort(null)
      .startAngle(startAngle)
      .endAngle(endAngle ?? startAngle + Math.PI * 2)
      .padAngle(padAngle)
      .value((d) => d.value);
    return pieLayout(data);
  }, [data, padAngle, startAngle, endAngle]);

  const colors = useMemo(() => {
    const palette = seriesPalette(data.length);
    return data.map((d, i) => d.color ?? palette[i]!);
  }, [data]);

  const outerR = Math.max(20, size / 2 - 8);
  const innerR = outerR * innerRatio;

  const [hover, setHover] = useState<{
    datum: PieChartDatum;
    x: number;
    y: number;
  } | null>(null);

  return (
    <div
      ref={mergedRef}
      className={cx("vf-chart-pie", className)}
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
        className="vf-chart-pie__svg"
        role="img"
        aria-label={accessibleLabel ?? "Pie chart"}
        width={size}
        height={size}
        viewBox={`${-size / 2} ${-size / 2} ${size} ${size}`}
      >
        <Arc
          data={pieData.map((p, i) => ({
            startAngle: p.startAngle,
            endAngle: p.endAngle,
            padAngle: p.padAngle,
            key: data[i]!.key,
          }))}
          innerRadius={innerR}
          outerRadius={outerR}
          cornerRadius={cornerRadius}
          fillFor={(_d, i) => colors[i]!}
          stroke="var(--vf-bg-1)"
          strokeWidth={1}
          onArcHover={(d, i, e) =>
            setHover(
              d
                ? {
                    datum: data[i]!,
                    x: e.clientX,
                    y: e.clientY,
                  }
                : null
            )
          }
        />
      </svg>
      {showLegend && (
        <ChartLegend
          className="vf-chart-pie__legend"
          items={data.map<ChartLegendItem>((d, i) => ({
            key: d.key,
            label: d.label ?? d.key,
            color: colors[i]!,
            glyph: "square",
          }))}
        />
      )}
      <ChartTooltip active={!!hover} x={hover?.x ?? 0} y={hover?.y ?? 0}>
        {hover ? (
          <ChartTooltipBody
            title={hover.datum.label ?? hover.datum.key}
            metrics={[
              {
                label: "value",
                value: valueFormat(hover.datum.value),
                color:
                  data.findIndex((d) => d.key === hover.datum.key) >= 0
                    ? colors[
                        data.findIndex((d) => d.key === hover.datum.key)
                      ]
                    : undefined,
                hint:
                  total > 0
                    ? `${formatChartNumber((hover.datum.value / total) * 100)}% of total`
                    : undefined,
              },
            ]}
          />
        ) : null}
      </ChartTooltip>
    </div>
  );
}

export const PieChart = forwardRef<HTMLDivElement, PieChartProps>(PieChartImpl);
PieChart.displayName = "PieChart";

export const DonutChart = forwardRef<HTMLDivElement, PieChartProps>(
  function DonutChart(props, ref) {
    return <PieChart ref={ref} innerRatio={props.innerRatio ?? 0.6} {...props} />;
  }
);
DonutChart.displayName = "DonutChart";
