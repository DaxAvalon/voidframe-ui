"use client";

// TileGridMap — render a value-keyed grid of tiles for either US states
// or a custom region grid the consumer provides. Each region occupies
// one cell on a fixed integer grid so the visualization is clean and
// equal-area, regardless of geographic projection.

import {
  forwardRef,
  useMemo,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { ChartTooltip } from "./primitives/ChartTooltip";
import { ChartTooltipBody } from "./primitives/ChartTooltipBody";
import { ChartLegend, type ChartLegendItem } from "./primitives/Legend";
import { quantizeScale } from "./math/scales";
import { formatChartNumber } from "./math/color";
import { cx } from "../utils/cx";

export interface TileGridCell {
  /** Region key (matches `values[id]`). */
  id: string;
  /** Optional label displayed inside the tile. Default = id. */
  label?: string;
  /** Grid column (0-based). */
  col: number;
  /** Grid row (0-based). */
  row: number;
}

export interface TileGridMapProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  cells: TileGridCell[];
  values: Record<string, number>;
  /** Tile pixel side. Default 44. */
  tileSize?: number;
  /** Pixel gap between tiles. Default 4. */
  gap?: number;
  /** Color buckets low→high. Default 5 greens. */
  colors?: string[];
  title?: ReactNode;
  description?: ReactNode;
  showLegend?: boolean;
  showLabels?: boolean;
  accessibleLabel?: string;
  valueFormat?: (v: number) => string;
}

const DEFAULT_COLORS = [
  "var(--vf-bg-3)",
  "color-mix(in srgb, var(--vf-green) 30%, var(--vf-bg-3))",
  "color-mix(in srgb, var(--vf-green) 55%, transparent)",
  "color-mix(in srgb, var(--vf-green) 75%, transparent)",
  "var(--vf-green)",
];

/**
 * Built-in US-states layout (postal code keys). Source: standard
 * "tile grid" arrangement used by FiveThirtyEight / Bloomberg.
 */
export const US_STATES_GRID: TileGridCell[] = (() => {
  // Each row left→right, top→bottom. AK and HI placed at the bottom
  // left as commonly done.
  const rows: Array<Array<string | null>> = [
    ["AK", null, null, null, null, null, null, null, null, null, "ME"],
    [null, null, null, null, null, null, null, null, null, "VT", "NH"],
    [null, "WA", "ID", "MT", "ND", "MN", "IL", "WI", "MI", "NY", "MA"],
    [null, "OR", "UT", "WY", "SD", "IA", "IN", "OH", "PA", "NJ", "CT"],
    [null, "CA", "NV", "CO", "NE", "MO", "KY", "WV", "VA", "MD", "RI"],
    [null, null, "AZ", "NM", "KS", "AR", "TN", "SC", "NC", "DC", "DE"],
    [null, null, null, null, "OK", "LA", "MS", "AL", "GA", null, null],
    ["HI", null, null, null, "TX", null, null, null, null, "FL", null],
  ];
  const out: TileGridCell[] = [];
  rows.forEach((row, r) =>
    row.forEach((id, c) => {
      if (id) out.push({ id, label: id, col: c, row: r });
    })
  );
  return out;
})();

/**
 * Equal-area cartogram — each region occupies one tile on an integer grid,
 * coloured by its quantized value. Avoids projection bias for US state / EU
 * country visualizations. Supply a custom `cells` map for arbitrary regions;
 * falls back to the built-in US-states layout.
 */
export const TileGridMap = forwardRef<HTMLDivElement, TileGridMapProps>(
  function TileGridMap(
    {
      cells,
      values,
      tileSize = 44,
      gap = 4,
      colors = DEFAULT_COLORS,
      title,
      description,
      showLegend = true,
      showLabels = true,
      accessibleLabel,
      valueFormat = (v) => formatChartNumber(v),
      className,
      style,
      ...props
    },
    ref
  ) {
    const max = useMemo(() => {
      let hi = 0;
      for (const v of Object.values(values)) if (v > hi) hi = v;
      return hi || 1;
    }, [values]);

    const colorScale = useMemo(
      () => quantizeScale<string>({ domain: [0, max], range: colors }),
      [max, colors]
    );

    const dims = useMemo(() => {
      const cols =
        cells.reduce((m, c) => Math.max(m, c.col), 0) + 1;
      const rows =
        cells.reduce((m, c) => Math.max(m, c.row), 0) + 1;
      return {
        cols,
        rows,
        width: cols * tileSize + (cols - 1) * gap,
        height: rows * tileSize + (rows - 1) * gap,
      };
    }, [cells, tileSize, gap]);

    const [hover, setHover] = useState<{
      cell: TileGridCell;
      value: number | null;
      x: number;
      y: number;
    } | null>(null);

    return (
      <div
        ref={ref}
        className={cx("vf-chart-tile-map", className)}
        style={style}
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
          className="vf-chart-tile-map__svg"
          role="img"
          aria-label={accessibleLabel ?? "Tile grid map"}
          width={dims.width}
          height={dims.height}
        >
          {cells.map((cell) => {
            const v = values[cell.id];
            const fill = v === undefined ? "var(--vf-bg-3)" : colorScale(v);
            const x = cell.col * (tileSize + gap);
            const y = cell.row * (tileSize + gap);
            return (
              <g
                key={cell.id}
                transform={`translate(${x}, ${y})`}
                onPointerMove={(e) =>
                  setHover({
                    cell,
                    value: v ?? null,
                    x: e.clientX,
                    y: e.clientY,
                  })
                }
                onPointerLeave={() => setHover(null)}
              >
                <rect
                  className="vf-chart-tile-map__cell"
                  width={tileSize}
                  height={tileSize}
                  fill={fill}
                  stroke="var(--vf-bg-1)"
                  strokeWidth={1}
                  shapeRendering="crispEdges"
                />
                {showLabels && (
                  <text
                    className="vf-chart-tile-map__label"
                    x={tileSize / 2}
                    y={tileSize / 2 + 4}
                    textAnchor="middle"
                  >
                    {cell.label ?? cell.id}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
        {showLegend && (
          <ChartLegend
            className="vf-chart-tile-map__legend"
            items={colors.map<ChartLegendItem>((c, i) => ({
              key: `b${i}`,
              label:
                i === 0
                  ? "0"
                  : i === colors.length - 1
                    ? `${formatChartNumber(max)}+`
                    : "",
              color: c,
              glyph: "square",
            }))}
          />
        )}
        <ChartTooltip active={!!hover} x={hover?.x ?? 0} y={hover?.y ?? 0}>
          {hover ? (
            <ChartTooltipBody
              title={hover.cell.label ?? hover.cell.id}
              metrics={[
                {
                  label: "value",
                  value:
                    hover.value === null ? "—" : valueFormat(hover.value),
                },
              ]}
            />
          ) : null}
        </ChartTooltip>
      </div>
    );
  }
);
TileGridMap.displayName = "TileGridMap";
