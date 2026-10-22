"use client";

// voidframe-ui/charts/lazy — React.lazy wrappers for every chart.
//
// Each wrapper defers the chart's chunk (and any d3 peer it pulls in)
// until the chart first mounts. Pair with <Suspense> and a <ChartSkeleton>
// sized like the chart so the layout does not jump:
//
//   import { Suspense } from "react";
//   import { LazyLineChart, ChartSkeleton } from "voidframe-ui/charts/lazy";
//
//   <Suspense fallback={<ChartSkeleton height={240} />}>
//     <LazyLineChart data={rows} series={series} height={240} />
//   </Suspense>
//
// Wrappers keep the chart's own props, including `ref`. This entry imports
// nothing from d3 itself, so it is safe to reach from a route that may
// never render a chart.

import { lazy } from "react";

export { ChartSkeleton } from "./primitives/ChartSkeleton";
export type { ChartSkeletonProps } from "./primitives/ChartSkeleton";
export { MissingPeerDependencyError } from "./peer";

// ── Core charts (d3-scale / d3-shape / d3-array) ───────────
export const LazyBarChart = lazy(() =>
  import("./BarChart").then((m) => ({ default: m.BarChart }))
);
export const LazyLineChart = lazy(() =>
  import("./LineChart").then((m) => ({ default: m.LineChart }))
);
export const LazyAreaChart = lazy(() =>
  import("./AreaChart").then((m) => ({ default: m.AreaChart }))
);
export const LazyScatterPlot = lazy(() =>
  import("./ScatterPlot").then((m) => ({ default: m.ScatterPlot }))
);
export const LazyBubbleChart = lazy(() =>
  import("./ScatterPlot").then((m) => ({ default: m.BubbleChart }))
);
export const LazyComposedChart = lazy(() =>
  import("./ComposedChart").then((m) => ({ default: m.ComposedChart }))
);
export const LazyPieChart = lazy(() =>
  import("./PieChart").then((m) => ({ default: m.PieChart }))
);
export const LazyDonutChart = lazy(() =>
  import("./PieChart").then((m) => ({ default: m.DonutChart }))
);
export const LazyRadarChart = lazy(() =>
  import("./RadarChart").then((m) => ({ default: m.RadarChart }))
);
export const LazyHistogram = lazy(() =>
  import("./Histogram").then((m) => ({ default: m.Histogram }))
);
export const LazyCalendarHeatmap = lazy(() =>
  import("./CalendarHeatmap").then((m) => ({ default: m.CalendarHeatmap }))
);
export const LazySparkline = lazy(() =>
  import("./Sparkline").then((m) => ({ default: m.Sparkline }))
);
export const LazyHeatmap = lazy(() =>
  import("./Heatmap").then((m) => ({ default: m.Heatmap }))
);

// ── Advanced layouts ───────────────────────────────────────
export const LazySmallMultiples = lazy(() =>
  import("./SmallMultiples").then((m) => ({ default: m.SmallMultiples }))
);
export const LazyTreeMap = lazy(() =>
  import("./TreeMap").then((m) => ({ default: m.TreeMap }))
);
export const LazySunburst = lazy(() =>
  import("./Sunburst").then((m) => ({ default: m.Sunburst }))
);
export const LazyFunnelChart = lazy(() =>
  import("./FunnelChart").then((m) => ({ default: m.FunnelChart }))
);
export const LazyWaterfallChart = lazy(() =>
  import("./WaterfallChart").then((m) => ({ default: m.WaterfallChart }))
);
export const LazyBoxPlot = lazy(() =>
  import("./BoxPlot").then((m) => ({ default: m.BoxPlot }))
);
export const LazyViolinPlot = lazy(() =>
  import("./ViolinPlot").then((m) => ({ default: m.ViolinPlot }))
);
export const LazyCandlestickChart = lazy(() =>
  import("./CandlestickChart").then((m) => ({ default: m.CandlestickChart }))
);
export const LazyOHLCChart = lazy(() =>
  import("./CandlestickChart").then((m) => ({ default: m.OHLCChart }))
);
export const LazyStreamGraph = lazy(() =>
  import("./StreamGraph").then((m) => ({ default: m.StreamGraph }))
);
export const LazyHorizonChart = lazy(() =>
  import("./HorizonChart").then((m) => ({ default: m.HorizonChart }))
);
export const LazySankey = lazy(() =>
  import("./Sankey").then((m) => ({ default: m.Sankey }))
);
export const LazyChordDiagram = lazy(() =>
  import("./ChordDiagram").then((m) => ({ default: m.ChordDiagram }))
);
export const LazyParallelCoordinates = lazy(() =>
  import("./ParallelCoordinates").then((m) => ({
    default: m.ParallelCoordinates,
  }))
);
export const LazyScatterMatrix = lazy(() =>
  import("./ScatterMatrix").then((m) => ({ default: m.ScatterMatrix }))
);

// ── Geospatial + network ───────────────────────────────────
export const LazyNetworkGraph = lazy(() =>
  import("./NetworkGraph").then((m) => ({ default: m.NetworkGraph }))
);
export const LazyDependencyGraph = lazy(() =>
  import("./DependencyGraph").then((m) => ({ default: m.DependencyGraph }))
);
export const LazyChoroplethMap = lazy(() =>
  import("./ChoroplethMap").then((m) => ({ default: m.ChoroplethMap }))
);
export const LazyBubbleMap = lazy(() =>
  import("./BubbleMap").then((m) => ({ default: m.BubbleMap }))
);
export const LazyTileGridMap = lazy(() =>
  import("./TileGridMap").then((m) => ({ default: m.TileGridMap }))
);
export const LazyOrgChart = lazy(() =>
  import("./OrgChart").then((m) => ({ default: m.OrgChart }))
);
