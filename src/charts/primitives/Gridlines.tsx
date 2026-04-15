"use client";

// Gridline overlay — draws 1px background lines keyed to tick positions on
// one or both axes. Reads scales from ChartContext.

import { forwardRef, useMemo } from "react";
import { cx } from "../../utils/cx";
import { generateTicks } from "../math/ticks";
import { useChart } from "./ChartContext";

export interface GridlinesProps
  extends Omit<React.SVGAttributes<SVGGElement>, "orientation"> {
  /** Which axes to draw gridlines for. Default `"both"`. */
  mode?: "x" | "y" | "both";
  /** Target tick count (continuous scales only). Default 5. */
  ticks?: number;
  /** Render dashed gridlines instead of solid. Default false. */
  dashed?: boolean;
}

export const Gridlines = forwardRef<SVGGElement, GridlinesProps>(
  function Gridlines(
    { mode = "both", ticks: tickCount = 5, dashed, className, ...props },
    ref
  ) {
    const ctx = useChart();
    const { innerWidth, innerHeight, xScale, yScale } = ctx;

    const xTicks = useMemo(
      () =>
        mode !== "y" && xScale
          ? generateTicks(xScale, { count: tickCount })
          : [],
      [mode, xScale, tickCount]
    );
    const yTicks = useMemo(
      () =>
        mode !== "x" && yScale
          ? generateTicks(yScale, { count: tickCount })
          : [],
      [mode, yScale, tickCount]
    );

    return (
      <g
        ref={ref}
        className={cx(
          "vf-chart-gridlines",
          dashed && "vf-chart-gridlines--dashed",
          className
        )}
        {...props}
      >
        {xTicks.map((tick, i) => (
          <line
            key={`x-${i}`}
            className="vf-chart-gridlines__line vf-chart-gridlines__line--x"
            x1={tick.position}
            y1={0}
            x2={tick.position}
            y2={innerHeight}
          />
        ))}
        {yTicks.map((tick, i) => (
          <line
            key={`y-${i}`}
            className="vf-chart-gridlines__line vf-chart-gridlines__line--y"
            x1={0}
            y1={tick.position}
            x2={innerWidth}
            y2={tick.position}
          />
        ))}
      </g>
    );
  }
);
Gridlines.displayName = "Gridlines";
