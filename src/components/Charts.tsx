"use client";

// Phase 9 — Charts: Sparkline, Heatmap, ChartContainer
//
// Lightweight SVG-based primitives. No dep on a charting library.
// ChartContainer is a wrapper for integrating 3rd-party chart libs with
// consistent chrome (title, legend, tooltip styling handed to consumers).

import {
  forwardRef,
  useId,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { cx } from "../utils/cx";
import { Label } from "./Text";

// ── Sparkline ────────────────────────────────────────────────

export interface SparklineProps extends HTMLAttributes<HTMLDivElement> {
  data: number[];
  width?: number;
  height?: number;
  stroke?: string;
  fill?: string;
  showArea?: boolean;
  showPoints?: boolean;
  showTrend?: boolean;
}

export const Sparkline = forwardRef<HTMLDivElement, SparklineProps>(
  function Sparkline(
    {
      data,
      width = 100,
      height = 28,
      stroke,
      fill,
      showArea,
      showPoints,
      showTrend,
      className,
      ...props
    },
    ref
  ) {
    if (data.length === 0) {
      return <div ref={ref} className={cx("vf-sparkline", className)} {...props} />;
    }
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const step = data.length > 1 ? width / (data.length - 1) : 0;
    const points = data.map((v, i) => ({
      x: i * step,
      y: height - ((v - min) / range) * height,
    }));
    const path = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
    const areaPath = `${path} L ${width} ${height} L 0 ${height} Z`;
    const last = data[data.length - 1]!;
    const first = data[0]!;
    const trendUp = last >= first;

    return (
      <div
        ref={ref}
        className={cx(
          "vf-sparkline",
          showTrend && (trendUp ? "vf-sparkline--up" : "vf-sparkline--down"),
          className
        )}
        style={{ width, height, display: "inline-block" }}
        {...props}
      >
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
          {showArea && (
            <path
              d={areaPath}
              fill={fill ?? "currentColor"}
              opacity={0.15}
              stroke="none"
            />
          )}
          <path
            d={path}
            fill="none"
            stroke={stroke ?? "currentColor"}
            strokeWidth={1.5}
          />
          {showPoints &&
            points.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r={1.5} fill={stroke ?? "currentColor"} />
            ))}
        </svg>
      </div>
    );
  }
);
Sparkline.displayName = "Sparkline";

// ── Heatmap ──────────────────────────────────────────────────

export interface HeatmapCell {
  x: string;
  y: string;
  value: number;
}

export interface HeatmapProps extends HTMLAttributes<HTMLDivElement> {
  data: HeatmapCell[];
  rows: string[];
  columns: string[];
  /** Return a CSS color for a given value. Defaults to a neutral gradient. */
  colorScale?: (value: number) => string;
  cellSize?: number;
  onCellClick?: (cell: HeatmapCell) => void;
  showAxes?: boolean;
  /** Render a hover tooltip with the cell value. Default true. */
  showTooltip?: boolean;
  /** Custom tooltip content. */
  renderTooltip?: (cell: HeatmapCell) => ReactNode;
}

function defaultScale(min: number, max: number): (v: number) => string {
  const range = max - min || 1;
  return (v) => {
    const t = (v - min) / range;
    const alpha = 0.1 + t * 0.85;
    return `rgba(100, 200, 120, ${alpha.toFixed(2)})`;
  };
}

export const Heatmap = forwardRef<HTMLDivElement, HeatmapProps>(function Heatmap(
  {
    data,
    rows,
    columns,
    colorScale,
    cellSize = 18,
    onCellClick,
    showAxes = true,
    showTooltip = true,
    renderTooltip,
    className,
    ...props
  },
  ref
) {
  const [hover, setHover] = useState<{
    cell: HeatmapCell;
    x: number;
    y: number;
  } | null>(null);
  const min = data.reduce((m, d) => Math.min(m, d.value), Infinity);
  const max = data.reduce((m, d) => Math.max(m, d.value), -Infinity);
  const scale = colorScale ?? defaultScale(isFinite(min) ? min : 0, isFinite(max) ? max : 1);
  const byCoord = new Map<string, HeatmapCell>();
  for (const d of data) byCoord.set(`${d.x}::${d.y}`, d);

  return (
    <div
      ref={ref}
      className={cx("vf-heatmap", className)}
      role="grid"
      aria-label="Heatmap"
      onMouseLeave={() => setHover(null)}
      style={{ position: "relative" }}
      {...props}
    >
      {showAxes && (
        <div
          className="vf-heatmap__columns"
          style={{ gridTemplateColumns: `auto repeat(${columns.length}, ${cellSize}px)` }}
        >
          <div />
          {columns.map((c) => (
            <div key={c} className="vf-heatmap__col-label">
              {c}
            </div>
          ))}
        </div>
      )}
      {hover && (
        <div
          role="tooltip"
          className="vf-heatmap__tooltip"
          style={{ left: hover.x, top: hover.y }}
        >
          {renderTooltip
            ? renderTooltip(hover.cell)
            : `${hover.cell.y} × ${hover.cell.x}: ${hover.cell.value}`}
        </div>
      )}
      {rows.map((r) => (
        <div
          key={r}
          className="vf-heatmap__row"
          role="row"
          style={{ gridTemplateColumns: `auto repeat(${columns.length}, ${cellSize}px)` }}
        >
          {showAxes && <div className="vf-heatmap__row-label">{r}</div>}
          {columns.map((c) => {
            const cell = byCoord.get(`${c}::${r}`);
            return (
              <button
                key={c}
                type="button"
                role="gridcell"
                aria-label={`${r} × ${c}: ${cell?.value ?? "—"}`}
                className="vf-heatmap__cell"
                style={{
                  width: cellSize,
                  height: cellSize,
                  background: cell ? scale(cell.value) : "transparent",
                }}
                onClick={cell ? () => onCellClick?.(cell) : undefined}
                onMouseEnter={(e) => {
                  if (!cell || !showTooltip) return;
                  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                  const parent =
                    (e.currentTarget as HTMLElement).closest(".vf-heatmap")?.getBoundingClientRect() ??
                    rect;
                  setHover({
                    cell,
                    x: rect.left + rect.width / 2 - parent.left,
                    y: rect.top - parent.top,
                  });
                }}
                onFocus={(e) => {
                  if (!cell || !showTooltip) return;
                  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                  const parent =
                    (e.currentTarget as HTMLElement).closest(".vf-heatmap")?.getBoundingClientRect() ??
                    rect;
                  setHover({
                    cell,
                    x: rect.left + rect.width / 2 - parent.left,
                    y: rect.top - parent.top,
                  });
                }}
                onBlur={() => setHover(null)}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
});
Heatmap.displayName = "Heatmap";

// ── ChartContainer ───────────────────────────────────────────

export interface ChartContainerProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  title?: ReactNode;
  description?: ReactNode;
  legend?: ReactNode;
  toolbar?: ReactNode;
  height?: number | string;
  loading?: boolean;
  emptyState?: ReactNode;
  children?: ReactNode;
  style?: CSSProperties;
}

export const ChartContainer = forwardRef<HTMLDivElement, ChartContainerProps>(
  function ChartContainer(
    {
      title,
      description,
      legend,
      toolbar,
      height,
      loading,
      emptyState,
      className,
      style,
      children,
      ...props
    },
    ref
  ) {
    const headingId = useId();
    return (
      <section
        ref={ref}
        aria-labelledby={title ? headingId : undefined}
        className={cx("vf-chart", className)}
        style={{
          ...(height !== undefined && {
            minHeight: typeof height === "number" ? `${height}px` : height,
          }),
          ...style,
        }}
        {...props}
      >
        {(title || toolbar) && (
          <header className="vf-chart__head">
            <div className="vf-chart__title-block">
              {title && (
                <Label as="span" id={headingId} className="vf-chart__title">
                  {title}
                </Label>
              )}
              {description && (
                <span className="vf-chart__description">{description}</span>
              )}
            </div>
            {toolbar && <div className="vf-chart__toolbar">{toolbar}</div>}
          </header>
        )}
        <div
          className="vf-chart__body"
          style={
            height !== undefined
              ? { height: typeof height === "number" ? `${height}px` : height }
              : undefined
          }
        >
          {loading ? (
            <div className="vf-chart__status">Loading…</div>
          ) : emptyState ? (
            <div className="vf-chart__status">{emptyState}</div>
          ) : (
            children
          )}
        </div>
        {legend && <footer className="vf-chart__legend">{legend}</footer>}
      </section>
    );
  }
);
ChartContainer.displayName = "ChartContainer";
