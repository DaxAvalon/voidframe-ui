// Voidframe chart library — Phase 21 Foundations.
//
// Stage 1 exposes the primitive + math layer. Stages 2–4 add concrete
// chart families on top. All charts are rendered pure SVG, themed via
// --vf-* CSS tokens, zero animation.

export { ChartFrame } from "./primitives/ChartFrame";
export type { ChartFrameProps } from "./primitives/ChartFrame";

export {
  ChartContext,
  useChart,
  useOptionalChart,
  DEFAULT_MARGINS,
} from "./primitives/ChartContext";
export type {
  ChartContextValue,
  ChartMargins,
} from "./primitives/ChartContext";

export { Axis } from "./primitives/Axis";
export type { AxisOrientation, AxisProps } from "./primitives/Axis";

export { Gridlines } from "./primitives/Gridlines";
export type { GridlinesProps } from "./primitives/Gridlines";

export { ChartLegend } from "./primitives/Legend";
export type {
  ChartLegendItem,
  ChartLegendProps,
} from "./primitives/Legend";

export { ChartTooltip } from "./primitives/ChartTooltip";
export type { ChartTooltipProps } from "./primitives/ChartTooltip";

export { ChartTooltipBody } from "./primitives/ChartTooltipBody";
export type {
  ChartTooltipBodyProps,
  TooltipMetric,
} from "./primitives/ChartTooltipBody";

export { Crosshair } from "./primitives/Crosshair";
export type { CrosshairProps } from "./primitives/Crosshair";

export { Brush } from "./primitives/Brush";
export type { BrushProps, BrushSelection } from "./primitives/Brush";

// ── Math layer ──────────────────────────────────────────────
export {
  linearScale,
  logScale,
  sqrtScale,
  timeScale,
  bandScale,
  pointScale,
  quantizeScale,
  bandCenter,
} from "./math/scales";
export type {
  LinearScale,
  LogScale,
  SqrtScale,
  TimeScale,
  BandScale,
  PointScale,
  QuantizeScale,
  ContinuousScale,
  AxisScaleOptions,
  BandScaleOptions,
  QuantizeOptions,
} from "./math/scales";

export {
  generateTicks,
  defaultNumericFormat,
} from "./math/ticks";
export type { AxisTickScale, Tick, TickOptions } from "./math/ticks";

export { stackSeries } from "./math/stack";
export type {
  StackOffset,
  StackOrder,
  StackOptions,
  StackSeries,
} from "./math/stack";

export { resolveCurve } from "./math/curves";
export type { CurveKind } from "./math/curves";

export { bisectNearest, scanNearest } from "./math/bisector";
export type { NearestResult } from "./math/bisector";

export {
  seriesPalette,
  defaultSeriesPalette,
  formatChartNumber,
} from "./math/color";
export type { SeriesPaletteOptions } from "./math/color";

// ── Phase 22: core charts ──────────────────────────────────
export { BarChart } from "./BarChart";
export type {
  BarChartDatum,
  BarChartMode,
  BarChartOrientation,
  BarChartProps,
  BarChartSeries,
} from "./BarChart";

export { LineChart } from "./LineChart";
export type {
  LineChartDatum,
  LineChartProps,
  LineChartSeries,
  LineChartXKind,
} from "./LineChart";

export { AreaChart } from "./AreaChart";
export type {
  AreaChartDatum,
  AreaChartMode,
  AreaChartProps,
  AreaChartSeries,
} from "./AreaChart";

export { ScatterPlot, BubbleChart } from "./ScatterPlot";
export type {
  ScatterDatum,
  ScatterPlotProps,
  ScatterSeries,
} from "./ScatterPlot";

export { ComposedChart } from "./ComposedChart";
export type {
  ComposedChartDatum,
  ComposedChartProps,
  ComposedChartSeries,
  ComposedSeriesType,
  ComposedXKind,
} from "./ComposedChart";

export { PieChart, DonutChart } from "./PieChart";
export type { PieChartDatum, PieChartProps } from "./PieChart";

export { RadarChart } from "./RadarChart";
export type { RadarChartProps, RadarSeries } from "./RadarChart";

export { Histogram } from "./Histogram";
export type { HistogramProps } from "./Histogram";

export { CalendarHeatmap } from "./CalendarHeatmap";
export type {
  CalendarHeatmapCell,
  CalendarHeatmapProps,
} from "./CalendarHeatmap";

export { Sparkline } from "./Sparkline";
export type { SparklineProps } from "./Sparkline";

export { Heatmap } from "./Heatmap";
export type { HeatmapCellData, HeatmapProps } from "./Heatmap";

// ── Phase 23: advanced layouts ─────────────────────────────
export { SmallMultiples } from "./SmallMultiples";
export type { SmallMultiplesProps } from "./SmallMultiples";

export { TreeMap } from "./TreeMap";
export type { TreeMapNode, TreeMapProps, TreeMapTile } from "./TreeMap";

export { Sunburst } from "./Sunburst";
export type { SunburstNode, SunburstProps } from "./Sunburst";

export { FunnelChart } from "./FunnelChart";
export type { FunnelChartProps, FunnelChartStep } from "./FunnelChart";

export { WaterfallChart } from "./WaterfallChart";
export type {
  WaterfallChartProps,
  WaterfallStep,
} from "./WaterfallChart";

export { BoxPlot, computeBoxStats } from "./BoxPlot";
export type { BoxPlotGroup, BoxPlotProps, BoxPlotStats } from "./BoxPlot";

export { ViolinPlot } from "./ViolinPlot";
export type { ViolinPlotGroup, ViolinPlotProps } from "./ViolinPlot";

export { CandlestickChart, OHLCChart } from "./CandlestickChart";
export type {
  CandleChartStyle,
  CandleDatum,
  CandlestickChartProps,
} from "./CandlestickChart";

export { StreamGraph } from "./StreamGraph";
export type {
  StreamGraphDatum,
  StreamGraphProps,
  StreamGraphSeries,
} from "./StreamGraph";

export { HorizonChart } from "./HorizonChart";
export type { HorizonChartProps, HorizonPoint } from "./HorizonChart";

export { Sankey } from "./Sankey";
export type {
  SankeyAlign,
  SankeyLink,
  SankeyNode,
  SankeyProps,
} from "./Sankey";

export { ChordDiagram } from "./ChordDiagram";
export type { ChordDiagramProps, ChordGroup } from "./ChordDiagram";

export { ParallelCoordinates } from "./ParallelCoordinates";
export type {
  ParallelAxis,
  ParallelCoordinatesProps,
  ParallelDatum,
  ParallelSeries,
} from "./ParallelCoordinates";

export { ScatterMatrix } from "./ScatterMatrix";
export type {
  ScatterMatrixDatum,
  ScatterMatrixProps,
} from "./ScatterMatrix";
