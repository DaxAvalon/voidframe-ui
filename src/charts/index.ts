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

export { seriesPalette, defaultSeriesPalette } from "./math/color";
export type { SeriesPaletteOptions } from "./math/color";
