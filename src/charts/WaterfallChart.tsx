"use client";

// WaterfallChart — running-sum visualization where each bar starts at the
// previous cumulative total. Tones encode positive / negative / total bars.

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
import { formatChartNumber } from "./math/color";
import { Gridlines } from "./primitives/Gridlines";
import { bandScale, linearScale } from "./math/scales";
import { Bar } from "./series/Bar";
import { cx } from "../utils/cx";

export interface WaterfallStep {
  key: string;
  label: string;
  /** Positive = increase, negative = decrease, `"total"` = subtotal pillar. */
  value: number | "total";
}

export interface WaterfallChartProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  steps: WaterfallStep[];
  width?: number;
  height?: number;
  margins?: Partial<ChartMargins>;
  title?: ReactNode;
  description?: ReactNode;
  valueFormat?: (v: number) => string;
  accessibleLabel?: string;
  /** Colors — [positive, negative, total]. Default theme tokens. */
  colors?: [string, string, string];
  showGrid?: boolean;
  valueTicks?: number;
  padding?: number;
}

type ResolvedStep = {
  key: string;
  label: string;
  kind: "increase" | "decrease" | "total";
  magnitude: number;
  start: number;
  end: number;
};

/**
 * Waterfall chart showing running totals with positive/negative
 * contributions. Axes: band x linear.
 */
export const WaterfallChart = forwardRef<HTMLDivElement, WaterfallChartProps>(
  function WaterfallChart(
    {
      steps,
      width,
      height = 300,
      margins,
      title,
      description,
      valueFormat = (v) => formatChartNumber(v),
      accessibleLabel,
      colors = [
        "var(--vf-green)",
        "var(--vf-red)",
        "var(--vf-text-2)",
      ],
      showGrid = true,
      valueTicks = 5,
      padding = 0.25,
      className,
      ...props
    },
    ref
  ) {
    const resolved = useMemo<ResolvedStep[]>(() => {
      let cumulative = 0;
      return steps.map((s) => {
        if (s.value === "total") {
          const start = 0;
          const end = cumulative;
          return {
            key: s.key,
            label: s.label,
            kind: "total" as const,
            magnitude: cumulative,
            start,
            end,
          };
        }
        const start = cumulative;
        const end = cumulative + s.value;
        cumulative = end;
        return {
          key: s.key,
          label: s.label,
          kind: (s.value >= 0 ? "increase" : "decrease") as
            | "increase"
            | "decrease",
          magnitude: s.value,
          start,
          end,
        };
      });
    }, [steps]);

    const extent = useMemo<[number, number]>(() => {
      let lo = 0;
      let hi = 0;
      for (const r of resolved) {
        if (r.start < lo) lo = r.start;
        if (r.end < lo) lo = r.end;
        if (r.start > hi) hi = r.start;
        if (r.end > hi) hi = r.end;
      }
      if (lo === hi) hi = lo + 1;
      return [lo, hi];
    }, [resolved]);

    const [hover, setHover] = useState<{
      step: ResolvedStep;
      x: number;
      y: number;
    } | null>(null);

    return (
      <div ref={ref} className={cx("vf-chart-waterfall", className)} {...props}>
        <ChartFrame
          width={width}
          height={height}
          margins={margins}
          title={title}
          description={description}
          accessibleLabel={accessibleLabel ?? "Waterfall chart"}
        >
          <WaterfallInner
            resolved={resolved}
            extent={extent}
            colors={colors}
            showGrid={showGrid}
            valueTicks={valueTicks}
            valueFormat={valueFormat}
            padding={padding}
            onHover={setHover}
          />
        </ChartFrame>
        <ChartTooltip active={!!hover} x={hover?.x ?? 0} y={hover?.y ?? 0}>
          {hover ? (
            <ChartTooltipBody
              title={hover.step.label}
              metrics={
                hover.step.kind === "total"
                  ? [
                      {
                        label: "total",
                        value: valueFormat(hover.step.end),
                        color: colors[2],
                      },
                    ]
                  : [
                      {
                        label: "delta",
                        value: `${hover.step.magnitude > 0 ? "+" : ""}${valueFormat(hover.step.magnitude)}`,
                        color:
                          hover.step.kind === "increase"
                            ? colors[0]
                            : colors[1],
                      },
                      {
                        label: "running total",
                        value: valueFormat(hover.step.end),
                      },
                    ]
              }
            />
          ) : null}
        </ChartTooltip>
      </div>
    );
  }
);
WaterfallChart.displayName = "WaterfallChart";

interface WaterfallInnerProps {
  resolved: ResolvedStep[];
  extent: [number, number];
  colors: [string, string, string];
  showGrid: boolean;
  valueTicks: number;
  valueFormat: (v: number) => string;
  padding: number;
  onHover: (h: { step: ResolvedStep; x: number; y: number } | null) => void;
}

function WaterfallInner({
  resolved,
  extent,
  colors,
  showGrid,
  valueTicks,
  valueFormat,
  padding,
  onHover,
}: WaterfallInnerProps) {
  const { innerWidth, innerHeight } = useChart();
  const band = bandScale({
    domain: resolved.map((r) => r.key),
    range: [0, innerWidth],
    padding,
  });
  const y = linearScale({
    domain: extent,
    range: [innerHeight, 0],
    nice: true,
  });
  const barWidth = band.bandwidth();
  return (
    <ChartScales xScale={band as never} yScale={y as never}>
    <g className="vf-chart-waterfall__inner">
      {showGrid && <Gridlines mode="y" ticks={valueTicks} />}
      <Axis
        orientation="bottom"
        scale={band}
        format={(v) =>
          resolved.find((r) => r.key === v)?.label ?? String(v)
        }
      />
      <Axis
        orientation="left"
        scale={y}
        ticks={valueTicks}
        format={(v) => valueFormat(v as number)}
      />
      <Bar
        data={resolved.map((r) => {
          const x = band(r.key) ?? 0;
          const top = y(Math.max(r.start, r.end));
          const bottom = y(Math.min(r.start, r.end));
          return { x, y: top, width: barWidth, height: bottom - top };
        })}
        fillFor={(_d, i) => {
          const r = resolved[i]!;
          return r.kind === "increase"
            ? colors[0]
            : r.kind === "decrease"
              ? colors[1]
              : colors[2];
        }}
        onBarHover={(d, i, e) =>
          onHover(
            d
              ? { step: resolved[i]!, x: e.clientX, y: e.clientY }
              : null
          )
        }
      />
      {/* connector lines between successive steps */}
      {resolved.map((r, i) => {
        const next = resolved[i + 1];
        if (!next || next.kind === "total") return null;
        const xEnd = (band(r.key) ?? 0) + barWidth;
        const xStart = band(next.key) ?? 0;
        const yLine = y(r.end);
        return (
          <line
            key={`c${i}`}
            className="vf-chart-waterfall__connector"
            x1={xEnd}
            y1={yLine}
            x2={xStart}
            y2={yLine}
          />
        );
      })}
    </g>
    </ChartScales>
  );
}
