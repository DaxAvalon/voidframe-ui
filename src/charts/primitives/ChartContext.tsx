"use client";

// React context exposing chart-wide layout + scale state to descendants.
// All primitive components (Axis, Gridlines, ChartTooltip, Crosshair, Brush)
// and chart families (BarChart, LineChart, etc.) read from this context
// instead of threading props through every level.

import { createContext, useContext } from "react";
import type { AxisTickScale } from "../math/ticks";

export interface ChartMargins {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface ChartContextValue {
  /** Outer SVG width (px). */
  width: number;
  /** Outer SVG height (px). */
  height: number;
  /** Width of the plot region after margins. */
  innerWidth: number;
  /** Height of the plot region after margins. */
  innerHeight: number;
  margins: ChartMargins;
  /** Active X axis scale, if a horizontal axis is configured. */
  xScale?: AxisTickScale;
  /** Active Y axis scale, if a vertical axis is configured. */
  yScale?: AxisTickScale;
}

export const ChartContext = createContext<ChartContextValue | null>(null);

export function useChart(): ChartContextValue {
  const ctx = useContext(ChartContext);
  if (!ctx) {
    throw new Error(
      "Chart primitives must be rendered inside a <ChartFrame>."
    );
  }
  return ctx;
}

/** Optional variant — returns null instead of throwing. */
export function useOptionalChart(): ChartContextValue | null {
  return useContext(ChartContext);
}

export const DEFAULT_MARGINS: ChartMargins = {
  top: 12,
  right: 16,
  bottom: 32,
  left: 44,
};
