"use client";

// React context exposing chart-wide layout + scale state to descendants.
// All primitive components (Axis, Gridlines, ChartTooltip, Crosshair, Brush)
// and chart families (BarChart, LineChart, etc.) read from this context
// instead of threading props through every level.

import { createContext, useContext, useMemo, type ReactNode } from "react";
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

/**
 * Re-publishes ChartContext with the provided scales merged in. Inner-chart
 * components (AreaChartInner, BarChartInner, etc.) wrap their rendered SVG
 * tree in `<ChartScales xScale={xScale} yScale={yScale}>` so descendants
 * like `<Gridlines>`, `<ReferenceLine>`, and `<ReferenceBand>` — which read
 * scales from context — actually see the computed values.
 *
 * Without this, scales are computed inside the inner component (they depend
 * on `innerWidth` / `innerHeight` from the context), but never propagated
 * back through a provider, leaving sibling primitives with undefined scales.
 */
export function ChartScales({
  xScale,
  yScale,
  children,
}: {
  xScale?: AxisTickScale;
  yScale?: AxisTickScale;
  children: ReactNode;
}) {
  const parent = useChart();
  const value = useMemo<ChartContextValue>(
    () => ({ ...parent, xScale, yScale }),
    [parent, xScale, yScale]
  );
  return (
    <ChartContext.Provider value={value}>{children}</ChartContext.Provider>
  );
}
