"use client";

// ChartSkeleton — a sized placeholder for a chart that has not rendered
// yet: a `React.lazy` chunk still loading, an optional d3 peer still
// importing, or data not yet fetched. Reserves the chart's footprint so
// the layout does not jump when the chart arrives.

import { forwardRef, type HTMLAttributes } from "react";
import { cx } from "../../utils/cx";

export interface ChartSkeletonProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /** Height of the reserved area. Default 240. */
  height?: number | string;
  /** Width of the reserved area. Default `"100%"`. */
  width?: number | string;
  /** Accessible status text. Default "Loading chart". */
  label?: string;
  /** Pulse the placeholder. Default true; honours reduced motion. */
  animate?: boolean;
}

export const ChartSkeleton = forwardRef<HTMLDivElement, ChartSkeletonProps>(
  function ChartSkeleton(
    {
      height = 240,
      width = "100%",
      label = "Loading chart",
      animate = true,
      className,
      style,
      ...props
    },
    ref
  ) {
    return (
      <div
        ref={ref}
        role="status"
        aria-busy="true"
        aria-label={label}
        className={cx(
          "vf-chart-skeleton",
          animate && "vf-chart-skeleton--animate",
          className
        )}
        style={{ height, width, ...style }}
        {...props}
      />
    );
  }
);
ChartSkeleton.displayName = "ChartSkeleton";
