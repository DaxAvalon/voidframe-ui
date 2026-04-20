"use client";

// SmallMultiples<T> — lays out N child charts in a responsive CSS grid with a
// shared title and optional common legend. Used directly for grouped views
// and as the engine behind ScatterMatrix.

import {
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { cx } from "../utils/cx";

export interface SmallMultiplesProps<T>
  extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  items: T[];
  /** Max columns in the responsive grid. Default auto-fit at min 240px. */
  columns?: number;
  /** Minimum column width when `columns` is not set. Default 240px. */
  minItemWidth?: number;
  gap?: number | string;
  title?: ReactNode;
  description?: ReactNode;
  /** Renderer for each facet. Receives the item + its index. */
  renderItem: (item: T, index: number) => ReactNode;
  /** Per-facet label placed above each child. Optional. */
  facetLabel?: (item: T, index: number) => ReactNode;
  /** Rendered once below the grid; consumers usually pass a `<ChartLegend>`. */
  sharedLegend?: ReactNode;
}

function SmallMultiplesInner<T>(
  {
    items,
    columns,
    minItemWidth = 240,
    gap = "var(--vf-sp-4)",
    title,
    description,
    renderItem,
    facetLabel,
    sharedLegend,
    className,
    style,
    ...props
  }: SmallMultiplesProps<T>,
  ref: React.ForwardedRef<HTMLDivElement>
) {
  const gridTemplateColumns = columns
    ? `repeat(${columns}, minmax(0, 1fr))`
    : `repeat(auto-fit, minmax(${minItemWidth}px, 1fr))`;
  return (
    <div
      ref={ref}
      className={cx("vf-chart-multiples", className)}
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
      <div
        className="vf-chart-multiples__grid"
        style={{
          display: "grid",
          gridTemplateColumns,
          gap: typeof gap === "number" ? `${gap}px` : gap,
        }}
      >
        {items.map((item, i) => (
          <div key={i} className="vf-chart-multiples__facet">
            {facetLabel && (
              <div className="vf-chart-multiples__facet-label">
                {facetLabel(item, i)}
              </div>
            )}
            {renderItem(item, i)}
          </div>
        ))}
      </div>
      {sharedLegend && (
        <div className="vf-chart-multiples__legend">{sharedLegend}</div>
      )}
    </div>
  );
}

/**
 * Grid of small charts sharing encoding / scale. Good for comparing many
 * categories at once.
 */
export const SmallMultiples = forwardRef(SmallMultiplesInner) as <T>(
  props: SmallMultiplesProps<T> & { ref?: React.Ref<HTMLDivElement> }
) => ReturnType<typeof SmallMultiplesInner>;
(SmallMultiples as unknown as { displayName: string }).displayName =
  "SmallMultiples";
