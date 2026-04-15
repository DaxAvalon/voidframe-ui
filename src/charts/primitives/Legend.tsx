"use client";

// ChartLegend primitive. Renders one row per series with a colored swatch + label.
// Interactive when `onToggle` is provided — clicking a swatch calls back with
// the series key; use `disabled` to dim series that are currently hidden.

import { forwardRef, type HTMLAttributes } from "react";
import { cx } from "../../utils/cx";

export interface ChartLegendItem {
  key: string;
  label: string;
  color: string;
  /** Dimmed / crossed-out when true. Does not itself affect toggling. */
  disabled?: boolean;
  /** Optional tone class appended to the swatch (e.g. "success"). */
  tone?: "success" | "warning" | "danger" | "info" | "neutral";
  /** SVG glyph kind. Default `"square"`. */
  glyph?: "square" | "circle" | "line";
}

export interface ChartLegendProps extends HTMLAttributes<HTMLDivElement> {
  items: ChartLegendItem[];
  orientation?: "horizontal" | "vertical";
  onToggle?: (key: string) => void;
  /** Alignment within the parent. Default `"start"`. */
  align?: "start" | "center" | "end";
}

export const ChartLegend = forwardRef<HTMLDivElement, ChartLegendProps>(function ChartLegend(
  {
    items,
    orientation = "horizontal",
    onToggle,
    align = "start",
    className,
    style,
    ...props
  },
  ref
) {
  return (
    <div
      ref={ref}
      className={cx(
        "vf-chart-legend",
        `vf-chart-legend--${orientation}`,
        `vf-chart-legend--align-${align}`,
        className
      )}
      style={style}
      role={onToggle ? "listbox" : undefined}
      aria-label={onToggle ? "Toggle series visibility" : undefined}
      {...props}
    >
      {items.map((item) => {
        const Swatch = item.glyph === "line" ? LineSwatch : SquareSwatch;
        const interactive = !!onToggle;
        const Tag = interactive ? "button" : "span";
        return (
          <Tag
            key={item.key}
            type={interactive ? "button" : undefined}
            className={cx(
              "vf-chart-legend__item",
              item.disabled && "vf-chart-legend__item--disabled",
              item.tone && `vf-chart-legend__item--${item.tone}`
            )}
            onClick={interactive ? () => onToggle?.(item.key) : undefined}
            role={interactive ? "option" : undefined}
            aria-selected={interactive ? !item.disabled : undefined}
          >
            <Swatch color={item.color} glyph={item.glyph} />
            <span className="vf-chart-legend__label">{item.label}</span>
          </Tag>
        );
      })}
    </div>
  );
});
ChartLegend.displayName = "ChartLegend";

function SquareSwatch({ color, glyph }: { color: string; glyph?: "square" | "circle" | "line" }) {
  if (glyph === "circle") {
    return (
      <svg width={12} height={12} viewBox="0 0 12 12" aria-hidden="true">
        <circle cx={6} cy={6} r={5} fill={color} />
      </svg>
    );
  }
  return (
    <span
      className="vf-chart-legend__swatch vf-chart-legend__swatch--square"
      aria-hidden="true"
      style={{ background: color }}
    />
  );
}

function LineSwatch({ color }: { color: string; glyph?: "square" | "circle" | "line" }) {
  return (
    <svg width={16} height={12} viewBox="0 0 16 12" aria-hidden="true">
      <line
        x1={0}
        y1={6}
        x2={16}
        y2={6}
        stroke={color}
        strokeWidth={2}
      />
    </svg>
  );
}
