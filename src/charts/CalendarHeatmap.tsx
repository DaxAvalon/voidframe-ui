"use client";

// CalendarHeatmap — GitHub contribution-graph style: one cell per day across
// a year (or any date range), colored by value via a quantized scale.

import {
  forwardRef,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { ChartLegend, type ChartLegendItem } from "./primitives/Legend";
import { ChartTooltip } from "./primitives/ChartTooltip";
import { ChartTooltipBody } from "./primitives/ChartTooltipBody";
import { formatChartNumber } from "./math/color";
import { quantizeScale } from "./math/scales";
import { cx } from "../utils/cx";
import { useElementSize } from "../hooks/useElementSize";
import { addDays, startOfDay } from "../utils/date";

export interface CalendarHeatmapCell {
  date: Date;
  value: number;
  label?: string;
}

export interface CalendarHeatmapProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  start: Date;
  end: Date;
  data: CalendarHeatmapCell[];
  /** Color buckets low→high. Default 5 greens. */
  colors?: string[];
  cellSize?: number;
  cellGap?: number;
  title?: ReactNode;
  description?: ReactNode;
  /** Display the day-of-week labels down the left edge. Default true. */
  showDayLabels?: boolean;
  /** Display month labels above the grid. Default true. */
  showMonthLabels?: boolean;
  valueFormat?: (v: number) => string;
  accessibleLabel?: string;
  showLegend?: boolean;
}

const DEFAULT_COLORS = [
  "var(--vf-bg-3)",
  "color-mix(in srgb, var(--vf-green) 35%, var(--vf-bg-3))",
  "color-mix(in srgb, var(--vf-green) 55%, transparent)",
  "color-mix(in srgb, var(--vf-green) 75%, transparent)",
  "var(--vf-green)",
];

const WEEKDAY_LABELS = ["Mon", "Wed", "Fri"];
const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export const CalendarHeatmap = forwardRef<HTMLDivElement, CalendarHeatmapProps>(
  function CalendarHeatmap(
    {
      start,
      end,
      data,
      colors = DEFAULT_COLORS,
      cellSize = 12,
      cellGap = 2,
      title,
      description,
      showDayLabels = true,
      showMonthLabels = true,
      valueFormat = (v) => formatChartNumber(v),
      accessibleLabel,
      showLegend = true,
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
    useElementSize(containerRef);

    const valueMap = useMemo(() => {
      const map = new Map<string, CalendarHeatmapCell>();
      for (const c of data) map.set(startOfDay(c.date).toDateString(), c);
      return map;
    }, [data]);

    const maxValue = useMemo(() => {
      let hi = 0;
      for (const c of data) if (c.value > hi) hi = c.value;
      return hi || 1;
    }, [data]);

    const colorScale = useMemo(
      () => quantizeScale<string>({ domain: [0, maxValue], range: colors }),
      [maxValue, colors]
    );

    // Compute weeks: each week is a column, each day in the week is a row.
    const weeks = useMemo(() => {
      const out: { date: Date; value: number; cell?: CalendarHeatmapCell }[][] = [];
      const s = startOfDay(start);
      const e = startOfDay(end);
      // Anchor to previous Sunday so each column is a full week.
      const firstSunday = addDays(s, -s.getDay());
      let cursor = firstSunday;
      let week: typeof out[number] = [];
      while (cursor <= e || week.length !== 0) {
        const inRange = cursor >= s && cursor <= e;
        const cell = valueMap.get(cursor.toDateString());
        week.push({
          date: cursor,
          value: inRange ? cell?.value ?? 0 : Number.NaN,
          cell,
        });
        cursor = addDays(cursor, 1);
        if (week.length === 7) {
          out.push(week);
          week = [];
        }
        if (cursor > e && week.length === 0) break;
      }
      if (week.length > 0) out.push(week);
      return out;
    }, [start, end, valueMap]);

    const gridWidth = weeks.length * (cellSize + cellGap);
    const gridHeight = 7 * (cellSize + cellGap);
    const leftPad = showDayLabels ? 28 : 0;
    const topPad = showMonthLabels ? 18 : 0;

    const monthTicks = useMemo(() => {
      const ticks: { weekIdx: number; label: string }[] = [];
      let lastMonth = -1;
      weeks.forEach((week, i) => {
        const first = week[0]!.date;
        if (first.getMonth() !== lastMonth) {
          ticks.push({ weekIdx: i, label: MONTHS[first.getMonth()]! });
          lastMonth = first.getMonth();
        }
      });
      return ticks;
    }, [weeks]);

    const [hover, setHover] = useState<{
      date: Date;
      value: number;
      cell?: CalendarHeatmapCell;
      x: number;
      y: number;
    } | null>(null);

    return (
      <div
        ref={mergedRef}
        className={cx("vf-chart-calheat", className)}
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
          className="vf-chart-calheat__svg"
          role="img"
          aria-label={accessibleLabel ?? "Calendar heatmap"}
          width={gridWidth + leftPad}
          height={gridHeight + topPad}
        >
          {showMonthLabels &&
            monthTicks.map((t, i) => (
              <text
                key={i}
                className="vf-chart-calheat__month"
                x={leftPad + t.weekIdx * (cellSize + cellGap)}
                y={12}
              >
                {t.label}
              </text>
            ))}
          {showDayLabels &&
            WEEKDAY_LABELS.map((lbl, i) => {
              const rowIdx = i * 2 + 1;
              return (
                <text
                  key={lbl}
                  className="vf-chart-calheat__day"
                  x={0}
                  y={topPad + rowIdx * (cellSize + cellGap) + cellSize - 2}
                  dominantBaseline="middle"
                >
                  {lbl}
                </text>
              );
            })}
          {weeks.map((week, wIdx) =>
            week.map((d, dIdx) => {
              if (Number.isNaN(d.value)) return null;
              const x = leftPad + wIdx * (cellSize + cellGap);
              const y = topPad + dIdx * (cellSize + cellGap);
              return (
                <rect
                  key={d.date.toDateString()}
                  className="vf-chart-calheat__cell"
                  x={x}
                  y={y}
                  width={cellSize}
                  height={cellSize}
                  fill={colorScale(d.value)}
                  shapeRendering="crispEdges"
                  onPointerMove={(e) =>
                    setHover({
                      date: d.date,
                      value: d.value,
                      cell: d.cell,
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
            className="vf-chart-calheat__legend"
            items={colors.map<ChartLegendItem>((c, i) => ({
              key: `b${i}`,
              label:
                i === 0
                  ? "None"
                  : i === colors.length - 1
                    ? `${Math.round(maxValue)}+`
                    : "",
              color: c,
              glyph: "square",
            }))}
          />
        )}
        <ChartTooltip active={!!hover} x={hover?.x ?? 0} y={hover?.y ?? 0}>
          {hover ? (
            <ChartTooltipBody
              title={hover.date.toDateString()}
              metrics={[{ label: "value", value: valueFormat(hover.value) }]}
              footer={hover.cell?.label}
            />
          ) : null}
        </ChartTooltip>
      </div>
    );
  }
);
CalendarHeatmap.displayName = "CalendarHeatmap";
