"use client";

// FunnelChart — drop-off visualization. Each step is a trapezoid narrowing
// proportionally to its value.

import {
  forwardRef,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { ChartTooltip } from "./primitives/ChartTooltip";
import { ChartTooltipBody } from "./primitives/ChartTooltipBody";
import { formatChartNumber, seriesPalette } from "./math/color";
import { cx } from "../utils/cx";
import { useElementSize } from "../hooks/useElementSize";

export interface FunnelChartStep {
  key: string;
  label: string;
  value: number;
  color?: string;
}

export interface FunnelChartProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  steps: FunnelChartStep[];
  width?: number;
  height?: number;
  title?: ReactNode;
  description?: ReactNode;
  valueFormat?: (v: number) => string;
  accessibleLabel?: string;
  /** Gap between steps. Default 4. */
  gap?: number;
  /** Orientation. Default `"vertical"` (top→bottom narrowing). */
  orientation?: "vertical" | "horizontal";
  /** Show a percent-of-top label inside each step. Default true. */
  showPercent?: boolean;
}

export const FunnelChart = forwardRef<HTMLDivElement, FunnelChartProps>(
  function FunnelChart(
    {
      steps,
      width: widthProp,
      height = 360,
      title,
      description,
      valueFormat = (v) => formatChartNumber(v),
      accessibleLabel,
      gap = 4,
      orientation = "vertical",
      showPercent = true,
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
    const width = widthProp ?? measured.width ?? 420;

    const colors = useMemo(() => {
      const palette = seriesPalette(steps.length);
      return steps.map((s, i) => s.color ?? palette[i]!);
    }, [steps]);

    const topValue = steps[0]?.value ?? 1;
    const maxValue = Math.max(...steps.map((s) => s.value), 1);

    const isVertical = orientation === "vertical";
    const majorAxis = isVertical ? height : width;
    const minorAxis = isVertical ? width : height;
    const stepMajor =
      (majorAxis - gap * (steps.length - 1)) / Math.max(1, steps.length);

    const [hover, setHover] = useState<{
      step: FunnelChartStep;
      x: number;
      y: number;
    } | null>(null);

    return (
      <div
        ref={mergedRef}
        className={cx("vf-chart-funnel", className)}
        style={{ width: widthProp ?? "100%", ...style }}
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
          className="vf-chart-funnel__svg"
          role="img"
          aria-label={accessibleLabel ?? "Funnel chart"}
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
        >
          {steps.map((step, i) => {
            const next = steps[i + 1];
            const topWidth = (step.value / maxValue) * minorAxis;
            const bottomWidth = next
              ? (next.value / maxValue) * minorAxis
              : topWidth * 0.2;
            const start = i * (stepMajor + gap);
            const end = start + stepMajor;
            let points: string;
            if (isVertical) {
              const topLeft = (width - topWidth) / 2;
              const topRight = topLeft + topWidth;
              const bottomLeft = (width - bottomWidth) / 2;
              const bottomRight = bottomLeft + bottomWidth;
              points = `${topLeft},${start} ${topRight},${start} ${bottomRight},${end} ${bottomLeft},${end}`;
            } else {
              const topTop = (height - topWidth) / 2;
              const topBottom = topTop + topWidth;
              const bottomTop = (height - bottomWidth) / 2;
              const bottomBottom = bottomTop + bottomWidth;
              points = `${start},${topTop} ${start},${topBottom} ${end},${bottomBottom} ${end},${bottomTop}`;
            }
            const percent = topValue > 0 ? step.value / topValue : 0;
            const midMajor = start + stepMajor / 2;
            return (
              <g
                key={step.key}
                onPointerMove={(e) =>
                  setHover({ step, x: e.clientX, y: e.clientY })
                }
                onPointerLeave={() => setHover(null)}
              >
                <polygon
                  className="vf-chart-funnel__step"
                  points={points}
                  fill={colors[i]}
                  shapeRendering="crispEdges"
                />
                <text
                  className="vf-chart-funnel__label"
                  x={isVertical ? width / 2 : midMajor}
                  y={isVertical ? midMajor : height / 2}
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  {step.label}
                </text>
                {showPercent && (
                  <text
                    className="vf-chart-funnel__percent"
                    x={isVertical ? width / 2 : midMajor}
                    y={isVertical ? midMajor + 14 : height / 2 + 14}
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    {valueFormat(step.value)}
                    {" · "}
                    {Math.round(percent * 100)}%
                  </text>
                )}
              </g>
            );
          })}
        </svg>
        <ChartTooltip active={!!hover} x={hover?.x ?? 0} y={hover?.y ?? 0}>
          {hover ? (
            <ChartTooltipBody
              title={hover.step.label}
              metrics={(() => {
                const top = steps[0]?.value ?? 0;
                const idx = steps.findIndex((s) => s.key === hover.step.key);
                return [
                  {
                    label: "value",
                    value: valueFormat(hover.step.value),
                    color: colors[idx],
                    hint:
                      top > 0
                        ? `${formatChartNumber((hover.step.value / top) * 100)}% of top`
                        : undefined,
                  },
                ];
              })()}
            />
          ) : null}
        </ChartTooltip>
      </div>
    );
  }
);
FunnelChart.displayName = "FunnelChart";
