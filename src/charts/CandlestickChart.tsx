"use client";

// CandlestickChart + OHLC — price visualization over a time/category axis.
// Up and down candles take different tone colors. `style="candle"` renders
// filled bodies with wicks; `style="ohlc"` renders tick marks for open/close.

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
import { ChartTooltipBody } from "./primitives/ChartTooltipBody";
import { formatChartNumber } from "./math/color";
import { Gridlines } from "./primitives/Gridlines";
import { bandScale, linearScale } from "./math/scales";
import { cx } from "../utils/cx";

export interface CandleDatum {
  /** Typically a date string, label, or ISO timestamp. */
  x: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

export type CandleChartStyle = "candle" | "ohlc";

export interface CandlestickChartProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  data: CandleDatum[];
  /** `"candle"` (default) draws filled bodies, `"ohlc"` draws tick marks. */
  variant?: CandleChartStyle;
  width?: number;
  height?: number;
  margins?: Partial<ChartMargins>;
  title?: ReactNode;
  description?: ReactNode;
  valueTicks?: number;
  valueFormat?: (v: number) => string;
  xTicks?: number;
  xFormat?: (v: string) => string;
  accessibleLabel?: string;
  padding?: number;
  showGrid?: boolean;
  /** Up tone (close > open). Default `var(--vf-green)`. */
  upColor?: string;
  /** Down tone (close < open). Default `var(--vf-red)`. */
  downColor?: string;
}

export const CandlestickChart = forwardRef<
  HTMLDivElement,
  CandlestickChartProps
>(function CandlestickChart(
  {
    data,
    variant = "candle",
    width,
    height = 320,
    margins,
    title,
    description,
    valueTicks = 5,
    valueFormat = (v) => formatChartNumber(v),
    xTicks = 6,
    xFormat,
    accessibleLabel,
    padding = 0.25,
    showGrid = true,
    upColor = "var(--vf-green)",
    downColor = "var(--vf-red)",
    className,
    ...props
  },
  ref
) {
  const [hover, setHover] = useState<{
    datum: CandleDatum;
    x: number;
    y: number;
  } | null>(null);

  return (
    <div
      ref={ref}
      className={cx("vf-chart-candle", className)}
      {...props}
    >
      <ChartFrame
        width={width}
        height={height}
        margins={margins}
        title={title}
        description={description}
        accessibleLabel={accessibleLabel ?? "Candlestick chart"}
      >
        <CandleInner
          data={data}
          variant={variant}
          valueTicks={valueTicks}
          valueFormat={valueFormat}
          xTicks={xTicks}
          xFormat={xFormat}
          padding={padding}
          showGrid={showGrid}
          upColor={upColor}
          downColor={downColor}
          onHover={setHover}
        />
      </ChartFrame>
      <ChartTooltip active={!!hover} x={hover?.x ?? 0} y={hover?.y ?? 0}>
        {hover ? (
          <ChartTooltipBody
            title={xFormat ? xFormat(hover.datum.x) : hover.datum.x}
            metrics={(() => {
              const up = hover.datum.close >= hover.datum.open;
              const tone = up ? upColor : downColor;
              return [
                {
                  label: "open",
                  value: valueFormat(hover.datum.open),
                },
                { label: "high", value: valueFormat(hover.datum.high) },
                { label: "low", value: valueFormat(hover.datum.low) },
                {
                  label: "close",
                  value: valueFormat(hover.datum.close),
                  color: tone,
                  hint: `${up ? "▲" : "▼"} ${formatChartNumber(((hover.datum.close - hover.datum.open) / hover.datum.open) * 100)}%`,
                },
              ];
            })()}
          />
        ) : null}
      </ChartTooltip>
    </div>
  );
});
CandlestickChart.displayName = "CandlestickChart";

/** Alias — OHLC is the tick-style variant. */
export const OHLCChart = forwardRef<HTMLDivElement, CandlestickChartProps>(
  function OHLCChart(props, ref) {
    return <CandlestickChart ref={ref} {...props} variant={props.variant ?? "ohlc"} />;
  }
);
OHLCChart.displayName = "OHLCChart";

interface CandleInnerProps {
  data: CandleDatum[];
  variant: CandleChartStyle;
  valueTicks: number;
  valueFormat: (v: number) => string;
  xTicks: number;
  xFormat?: (v: string) => string;
  padding: number;
  showGrid: boolean;
  upColor: string;
  downColor: string;
  onHover: (h: { datum: CandleDatum; x: number; y: number } | null) => void;
}

function CandleInner({
  data,
  variant,
  valueTicks,
  valueFormat,
  xTicks,
  xFormat,
  padding,
  showGrid,
  upColor,
  downColor,
  onHover,
}: CandleInnerProps) {
  const { innerWidth, innerHeight } = useChart();
  const band = bandScale({
    domain: data.map((d) => d.x),
    range: [0, innerWidth],
    padding,
  });
  const extent = useMemo<[number, number]>(() => {
    let lo = Infinity;
    let hi = -Infinity;
    for (const d of data) {
      if (d.low < lo) lo = d.low;
      if (d.high > hi) hi = d.high;
    }
    if (!Number.isFinite(lo)) lo = 0;
    if (!Number.isFinite(hi)) hi = 1;
    if (lo === hi) hi = lo + 1;
    return [lo, hi];
  }, [data]);
  const y = linearScale({
    domain: extent,
    range: [innerHeight, 0],
    nice: true,
  });
  const bw = band.bandwidth();

  return (
    <g>
      {showGrid && <Gridlines mode="y" ticks={valueTicks} />}
      <Axis
        orientation="bottom"
        scale={band}
        ticks={xTicks}
        format={xFormat ? (v) => xFormat(v as string) : undefined}
      />
      <Axis
        orientation="left"
        scale={y}
        ticks={valueTicks}
        format={(v) => valueFormat(v as number)}
      />
      {data.map((d) => {
        const x0 = band(d.x) ?? 0;
        const mid = x0 + bw / 2;
        const up = d.close >= d.open;
        const color = up ? upColor : downColor;
        if (variant === "ohlc") {
          return (
            <g
              key={d.x}
              onPointerMove={(e) =>
                onHover({ datum: d, x: e.clientX, y: e.clientY })
              }
              onPointerLeave={() => onHover(null)}
            >
              <line
                className="vf-chart-candle__wick"
                x1={mid}
                y1={y(d.high)}
                x2={mid}
                y2={y(d.low)}
                stroke={color}
              />
              <line
                className="vf-chart-candle__tick"
                x1={x0}
                y1={y(d.open)}
                x2={mid}
                y2={y(d.open)}
                stroke={color}
              />
              <line
                className="vf-chart-candle__tick"
                x1={mid}
                y1={y(d.close)}
                x2={x0 + bw}
                y2={y(d.close)}
                stroke={color}
              />
            </g>
          );
        }
        const top = y(Math.max(d.open, d.close));
        const bottom = y(Math.min(d.open, d.close));
        return (
          <g
            key={d.x}
            onPointerMove={(e) =>
              onHover({ datum: d, x: e.clientX, y: e.clientY })
            }
            onPointerLeave={() => onHover(null)}
          >
            <line
              className="vf-chart-candle__wick"
              x1={mid}
              y1={y(d.high)}
              x2={mid}
              y2={y(d.low)}
              stroke={color}
            />
            <rect
              className="vf-chart-candle__body"
              x={x0}
              y={top}
              width={bw}
              height={Math.max(1, bottom - top)}
              fill={up ? color : "transparent"}
              stroke={color}
              strokeWidth={1}
              shapeRendering="crispEdges"
            />
          </g>
        );
      })}
    </g>
  );
}
