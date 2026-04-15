"use client";

// Standard tooltip layout used by every chart. Keeps every chart's hover
// readout visually consistent — bold title on top, one line per metric, an
// optional footer (e.g., the breadcrumb path in hierarchy charts).

import type { ReactNode } from "react";

export interface TooltipMetric {
  label: string;
  /** Fully-formatted display string. */
  value: ReactNode;
  /** Optional series color — rendered as a square swatch next to the label. */
  color?: string;
  /** Optional secondary line (e.g., percent of total). */
  hint?: ReactNode;
}

export interface ChartTooltipBodyProps {
  title: ReactNode;
  metrics: TooltipMetric[];
  /** Rendered in small muted text below the metrics. */
  footer?: ReactNode;
}

/**
 * Uniform layout for every chart's hover readout.
 */
export function ChartTooltipBody({
  title,
  metrics,
  footer,
}: ChartTooltipBodyProps) {
  return (
    <div className="vf-chart-tooltip__body">
      <div className="vf-chart-tooltip__title">{title}</div>
      {metrics.length > 0 && (
        <div className="vf-chart-tooltip__metrics">
          {metrics.map((m, i) => (
            <div key={i} className="vf-chart-tooltip__row">
              {m.color && (
                <span
                  className="vf-chart-tooltip__swatch"
                  aria-hidden="true"
                  style={{ background: m.color }}
                />
              )}
              <span className="vf-chart-tooltip__label">{m.label}</span>
              <span className="vf-chart-tooltip__value">{m.value}</span>
              {m.hint && (
                <span className="vf-chart-tooltip__hint">{m.hint}</span>
              )}
            </div>
          ))}
        </div>
      )}
      {footer && <div className="vf-chart-tooltip__footer">{footer}</div>}
    </div>
  );
}
