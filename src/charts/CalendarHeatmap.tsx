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
import { useMessages } from "../i18n/MessagesProvider";

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
  /** 0 = Sunday … 6 = Saturday. Default: the provider's `firstDayOfWeek`. */
  firstDayOfWeek?: number;
  /** BCP-47 tag for day and month labels. Default: the provider's locale. */
  locale?: string;
  /** Override the day-of-week labels (one per row, starting at `firstDayOfWeek`; empty strings hide a row). */
  dayLabels?: string[];
  /** Click or Enter/Space on a day. Cells become focusable buttons. */
  onCellClick?: (day: { date: Date; value: number; cell?: CalendarHeatmapCell }) => void;
  /** Outline today's cell. Default false. */
  highlightToday?: boolean;
  /** "Now", for `highlightToday`. Default `new Date()`. */
  today?: Date;
}

/** Short weekday names starting at `firstDayOfWeek`, in `locale`. */
export function weekdayLabels(locale: string, firstDayOfWeek: number): string[] {
  const fmt = new Intl.DateTimeFormat(locale, { weekday: "short" });
  // 2023-01-01 was a Sunday.
  const base = new Date(2023, 0, 1);
  return Array.from({ length: 7 }, (_, i) => fmt.format(addDays(base, (firstDayOfWeek + i) % 7)));
}

const DEFAULT_COLORS = [
  "var(--vf-bg-3)",
  "color-mix(in srgb, var(--vf-green) 35%, var(--vf-bg-3))",
  "color-mix(in srgb, var(--vf-green) 55%, transparent)",
  "color-mix(in srgb, var(--vf-green) 75%, transparent)",
  "var(--vf-green)",
];

/** Rows that carry a day label (every second row, like the GitHub graph). */
const LABEL_ROWS = [1, 3, 5];

/**
 * GitHub-style calendar heatmap. Bins values per day and shades cells by
 * intensity; supports weekly or monthly layout.
 */
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
      firstDayOfWeek: firstDayOfWeekProp,
      locale: localeProp,
      dayLabels,
      onCellClick,
      highlightToday = false,
      today,
      className,
      style,
      ...props
    },
    ref
  ) {
    const i18n = useMessages();
    const firstDayOfWeek = ((firstDayOfWeekProp ?? i18n.firstDayOfWeek) % 7 + 7) % 7;
    const locale = localeProp ?? i18n.locale;
    const todayKey = highlightToday ? startOfDay(today ?? new Date()).toDateString() : null;
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
      // Anchor to the previous week start so each column is a full week.
      const offset = (s.getDay() - firstDayOfWeek + 7) % 7;
      let cursor = addDays(s, -offset);
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
    }, [start, end, valueMap, firstDayOfWeek]);

    const gridWidth = weeks.length * (cellSize + cellGap);
    const gridHeight = 7 * (cellSize + cellGap);
    const leftPad = showDayLabels ? 28 : 0;
    const topPad = showMonthLabels ? 18 : 0;

    const monthFormat = useMemo(() => new Intl.DateTimeFormat(locale, { month: "short" }), [locale]);
    const monthTicks = useMemo(() => {
      const ticks: { weekIdx: number; label: string }[] = [];
      let lastMonth = -1;
      weeks.forEach((week, i) => {
        const first = week[0]!.date;
        if (first.getMonth() !== lastMonth) {
          ticks.push({ weekIdx: i, label: monthFormat.format(first) });
          lastMonth = first.getMonth();
        }
      });
      return ticks;
    }, [weeks, monthFormat]);
    const rowLabels = useMemo(
      () => dayLabels ?? weekdayLabels(locale, firstDayOfWeek),
      [dayLabels, locale, firstDayOfWeek]
    );
    const dateFormat = useMemo(() => new Intl.DateTimeFormat(locale, { dateStyle: "medium" }), [locale]);

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
            (dayLabels ? rowLabels.map((_, i) => i) : LABEL_ROWS).map((rowIdx) => {
              const lbl = rowLabels[rowIdx];
              if (!lbl) return null;
              return (
                <text
                  key={rowIdx}
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
              const isToday = todayKey !== null && d.date.toDateString() === todayKey;
              const interactive = Boolean(onCellClick);
              return (
                <rect
                  key={d.date.toDateString()}
                  className={cx(
                    "vf-chart-calheat__cell",
                    isToday && "vf-chart-calheat__cell--today",
                    interactive && "vf-chart-calheat__cell--interactive"
                  )}
                  data-today={isToday || undefined}
                  data-date={d.date.toISOString().slice(0, 10)}
                  role={interactive ? "button" : undefined}
                  tabIndex={interactive ? 0 : undefined}
                  aria-label={
                    interactive ? `${dateFormat.format(d.date)}: ${d.cell?.label ?? valueFormat(d.value)}` : undefined
                  }
                  onClick={interactive ? () => onCellClick?.({ date: d.date, value: d.value, cell: d.cell }) : undefined}
                  onKeyDown={
                    interactive
                      ? (e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            onCellClick?.({ date: d.date, value: d.value, cell: d.cell });
                          }
                        }
                      : undefined
                  }
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
                    ? `${valueFormat(maxValue)}+`
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
