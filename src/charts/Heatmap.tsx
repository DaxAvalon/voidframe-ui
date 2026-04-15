"use client";

// Heatmap — grid of colored cells keyed to a row + column category. Value is
// mapped to a color via a quantize scale. Unlike CalendarHeatmap this is
// generic: any 2D categorical matrix.

import {
  forwardRef,
  useMemo,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { ChartTooltip } from "./primitives/ChartTooltip";
import { ChartLegend, type ChartLegendItem } from "./primitives/Legend";
import { quantizeScale } from "./math/scales";
import { cx } from "../utils/cx";

export interface HeatmapCellData {
  x: string;
  y: string;
  value: number;
  label?: string;
}

export interface HeatmapProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  rows: string[];
  columns: string[];
  data: HeatmapCellData[];
  /** Color buckets low→high. Default 5 blues. */
  colors?: string[];
  cellSize?: number;
  cellGap?: number;
  title?: ReactNode;
  description?: ReactNode;
  showRowLabels?: boolean;
  showColumnLabels?: boolean;
  valueFormat?: (v: number) => string;
  accessibleLabel?: string;
  showLegend?: boolean;
}

const DEFAULT_COLORS = [
  "var(--vf-bg-3)",
  "color-mix(in srgb, var(--vf-blue) 35%, var(--vf-bg-3))",
  "color-mix(in srgb, var(--vf-blue) 55%, transparent)",
  "color-mix(in srgb, var(--vf-blue) 75%, transparent)",
  "var(--vf-blue)",
];

export const Heatmap = forwardRef<HTMLDivElement, HeatmapProps>(
  function Heatmap(
    {
      rows,
      columns,
      data,
      colors = DEFAULT_COLORS,
      cellSize = 22,
      cellGap = 2,
      title,
      description,
      showRowLabels = true,
      showColumnLabels = true,
      valueFormat = (v) => String(v),
      accessibleLabel,
      showLegend = true,
      className,
      ...props
    },
    ref
  ) {
    const { lookup, max } = useMemo(() => {
      const m = new Map<string, HeatmapCellData>();
      let hi = 0;
      for (const c of data) {
        m.set(`${c.y}|${c.x}`, c);
        if (c.value > hi) hi = c.value;
      }
      return { lookup: m, max: hi || 1 };
    }, [data]);

    const colorScale = useMemo(
      () => quantizeScale<string>({ domain: [0, max], range: colors }),
      [max, colors]
    );

    const leftPad = showRowLabels ? 64 : 0;
    const topPad = showColumnLabels ? 22 : 0;
    const gridWidth = columns.length * (cellSize + cellGap);
    const gridHeight = rows.length * (cellSize + cellGap);

    const [hover, setHover] = useState<{
      cell: HeatmapCellData | undefined;
      row: string;
      col: string;
      x: number;
      y: number;
    } | null>(null);

    return (
      <div ref={ref} className={cx("vf-chart-heatmap", className)} {...props}>
        {(title || description) && (
          <div className="vf-chart-frame__header">
            {title && <h4 className="vf-chart-frame__title">{title}</h4>}
            {description && (
              <p className="vf-chart-frame__description">{description}</p>
            )}
          </div>
        )}
        <svg
          className="vf-chart-heatmap__svg"
          role="img"
          aria-label={accessibleLabel ?? "Heatmap"}
          width={leftPad + gridWidth}
          height={topPad + gridHeight}
        >
          {showColumnLabels &&
            columns.map((c, i) => (
              <text
                key={c}
                className="vf-chart-heatmap__col-label"
                x={leftPad + i * (cellSize + cellGap) + cellSize / 2}
                y={topPad - 6}
                textAnchor="middle"
              >
                {c}
              </text>
            ))}
          {showRowLabels &&
            rows.map((r, i) => (
              <text
                key={r}
                className="vf-chart-heatmap__row-label"
                x={leftPad - 8}
                y={topPad + i * (cellSize + cellGap) + cellSize / 2}
                textAnchor="end"
                dominantBaseline="middle"
              >
                {r}
              </text>
            ))}
          {rows.map((r, rIdx) =>
            columns.map((c, cIdx) => {
              const cell = lookup.get(`${r}|${c}`);
              const fill = cell ? colorScale(cell.value) : "var(--vf-bg-3)";
              return (
                <rect
                  key={`${r}|${c}`}
                  className="vf-chart-heatmap__cell"
                  x={leftPad + cIdx * (cellSize + cellGap)}
                  y={topPad + rIdx * (cellSize + cellGap)}
                  width={cellSize}
                  height={cellSize}
                  fill={fill}
                  shapeRendering="crispEdges"
                  onPointerMove={(e) =>
                    setHover({
                      cell,
                      row: r,
                      col: c,
                      x: e.clientX,
                      y: e.clientY,
                    })
                  }
                  onPointerLeave={() => setHover(null)}
                />
              );
            })
          )}
        </svg>
        {showLegend && (
          <ChartLegend
            className="vf-chart-heatmap__legend"
            items={colors.map<ChartLegendItem>((color, i) => ({
              key: `b${i}`,
              label:
                i === 0
                  ? "Low"
                  : i === colors.length - 1
                    ? `${Math.round(max)}+`
                    : "",
              color,
              glyph: "square",
            }))}
          />
        )}
        <ChartTooltip active={!!hover} x={hover?.x ?? 0} y={hover?.y ?? 0}>
          {hover ? (
            <>
              <div>
                <strong>
                  {hover.row} · {hover.col}
                </strong>
              </div>
              <div>
                {hover.cell
                  ? valueFormat(hover.cell.value)
                  : "No data"}
              </div>
              {hover.cell?.label && <div>{hover.cell.label}</div>}
            </>
          ) : null}
        </ChartTooltip>
      </div>
    );
  }
);
Heatmap.displayName = "Heatmap";
