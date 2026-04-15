"use client";

// Crosshair overlay for Cartesian charts. Renders a vertical and/or horizontal
// guide line at `(x, y)` in plot-space coordinates, with an optional dot.

import { forwardRef } from "react";
import { cx } from "../../utils/cx";
import { useChart } from "./ChartContext";

export interface CrosshairProps
  extends Omit<React.SVGAttributes<SVGGElement>, "mode"> {
  /** Position in plot-space (after ChartFrame margins). */
  x?: number;
  y?: number;
  mode?: "x" | "y" | "both";
  /** Render a dot at `(x, y)` when mode is `"both"` and both are provided. */
  showPoint?: boolean;
  /** Dashed strokes instead of solid. Default true. */
  dashed?: boolean;
}

export const Crosshair = forwardRef<SVGGElement, CrosshairProps>(
  function Crosshair(
    {
      x,
      y,
      mode = "both",
      showPoint = true,
      dashed = true,
      className,
      ...props
    },
    ref
  ) {
    const { innerWidth, innerHeight } = useChart();
    const drawX = (mode === "x" || mode === "both") && typeof x === "number";
    const drawY = (mode === "y" || mode === "both") && typeof y === "number";

    if (!drawX && !drawY) return null;

    return (
      <g
        ref={ref}
        className={cx(
          "vf-chart-crosshair",
          dashed && "vf-chart-crosshair--dashed",
          className
        )}
        pointerEvents="none"
        {...props}
      >
        {drawX && (
          <line
            className="vf-chart-crosshair__line vf-chart-crosshair__line--x"
            x1={x}
            y1={0}
            x2={x}
            y2={innerHeight}
          />
        )}
        {drawY && (
          <line
            className="vf-chart-crosshair__line vf-chart-crosshair__line--y"
            x1={0}
            y1={y}
            x2={innerWidth}
            y2={y}
          />
        )}
        {showPoint && drawX && drawY && (
          <circle
            className="vf-chart-crosshair__point"
            cx={x}
            cy={y}
            r={3}
          />
        )}
      </g>
    );
  }
);
Crosshair.displayName = "Crosshair";
