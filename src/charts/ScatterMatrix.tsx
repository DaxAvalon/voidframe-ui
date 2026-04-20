"use client";

// ScatterMatrix (SPLOM) — N × N grid of scatter plots, one for each pair of
// numeric dimensions. The diagonal shows the dimension name. Built on top of
// SmallMultiples + ScatterPlot.

import {
  forwardRef,
  useMemo,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { ScatterPlot, type ScatterDatum } from "./ScatterPlot";
import { cx } from "../utils/cx";

export interface ScatterMatrixDatum {
  id: string | number;
  values: Record<string, number>;
  series?: string;
  label?: string;
}

export interface ScatterMatrixProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  data: ScatterMatrixDatum[];
  dimensions: string[];
  /** Height of each facet (px). Default 160. */
  facetHeight?: number;
  title?: ReactNode;
  description?: ReactNode;
  showAxes?: boolean;
  accessibleLabel?: string;
  /** Optional color per series key. */
  series?: { key: string; label?: string; color?: string }[];
}

interface CellProps {
  data: ScatterMatrixDatum[];
  xKey: string;
  yKey: string;
  height: number;
  showAxes: boolean;
  series: ScatterMatrixProps["series"];
}

function Cell({ data, xKey, yKey, height, showAxes, series }: CellProps) {
  const points: ScatterDatum[] = useMemo(() => {
    const out: ScatterDatum[] = [];
    for (const d of data) {
      const x = d.values[xKey];
      const y = d.values[yKey];
      if (x === undefined || y === undefined) continue;
      out.push({
        x,
        y,
        series: d.series,
        label: `${d.label ?? String(d.id)} · ${xKey}/${yKey}`,
      });
    }
    return out;
  }, [data, xKey, yKey]);
  return (
    <ScatterPlot
      data={points}
      series={series}
      height={height}
      showLegend={false}
      showGrid={false}
      shape="circle"
      xTicks={showAxes ? 3 : 2}
      yTicks={showAxes ? 3 : 2}
      margins={{ top: 6, right: 10, bottom: 22, left: 34 }}
    />
  );
}

/**
 * Scatterplot matrix: small-multiples grid pairing every dimension against
 * every other.
 */
export const ScatterMatrix = forwardRef<HTMLDivElement, ScatterMatrixProps>(
  function ScatterMatrix(
    {
      data,
      dimensions,
      facetHeight = 160,
      title,
      description,
      showAxes = false,
      accessibleLabel,
      series,
      className,
      ...props
    },
    ref
  ) {
    return (
      <div
        ref={ref}
        className={cx("vf-chart-splom", className)}
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
        <div
          className="vf-chart-splom__grid"
          role="img"
          aria-label={accessibleLabel ?? "Scatter matrix"}
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${dimensions.length}, minmax(0, 1fr))`,
            gap: "var(--vf-sp-2)",
          }}
        >
          {dimensions.map((yKey) =>
            dimensions.map((xKey) => {
              if (xKey === yKey) {
                return (
                  <div
                    key={`${xKey}-${yKey}`}
                    className="vf-chart-splom__diagonal"
                    style={{ height: facetHeight }}
                  >
                    <span>{xKey}</span>
                  </div>
                );
              }
              return (
                <div
                  key={`${xKey}-${yKey}`}
                  className="vf-chart-splom__cell"
                >
                  <Cell
                    data={data}
                    xKey={xKey}
                    yKey={yKey}
                    height={facetHeight}
                    showAxes={showAxes}
                    series={series}
                  />
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  }
);
ScatterMatrix.displayName = "ScatterMatrix";
