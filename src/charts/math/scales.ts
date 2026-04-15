// Thin, uniform wrappers around d3-scale. Every chart component composes
// through this module rather than importing d3-scale directly, so the shape
// of scales is consistent and future swaps are contained.

import {
  scaleBand,
  scaleLinear,
  scaleLog,
  scalePoint,
  scaleQuantize,
  scaleSqrt,
  scaleTime,
  type ScaleBand,
  type ScaleContinuousNumeric,
  type ScaleLinear,
  type ScaleLogarithmic,
  type ScalePoint,
  type ScalePower,
  type ScaleQuantize,
  type ScaleTime,
} from "d3-scale";

export type LinearScale = ScaleLinear<number, number>;
export type LogScale = ScaleLogarithmic<number, number>;
export type TimeScale = ScaleTime<number, number>;
export type BandScale = ScaleBand<string>;
export type PointScale = ScalePoint<string>;
export type QuantizeScale<Out> = ScaleQuantize<Out>;
export type SqrtScale = ScalePower<number, number>;
export type ContinuousScale = ScaleContinuousNumeric<number, number>;

export interface AxisScaleOptions<Domain extends number | Date | string> {
  domain: [Domain, Domain] | Domain[];
  range: [number, number];
  /** `true` rounds the domain outward to the next "nice" value. */
  nice?: boolean | number;
  /** Clamps output to the range. Default false. */
  clamp?: boolean;
}

export function linearScale(opts: AxisScaleOptions<number>): LinearScale {
  const s = scaleLinear()
    .domain(opts.domain as [number, number])
    .range(opts.range);
  if (opts.nice) s.nice(typeof opts.nice === "number" ? opts.nice : undefined);
  if (opts.clamp) s.clamp(true);
  return s;
}

export function logScale(
  opts: AxisScaleOptions<number> & { base?: number }
): LogScale {
  const s = scaleLog()
    .domain(opts.domain as [number, number])
    .range(opts.range);
  if (opts.base) s.base(opts.base);
  if (opts.nice) s.nice();
  if (opts.clamp) s.clamp(true);
  return s;
}

export function sqrtScale(opts: AxisScaleOptions<number>): SqrtScale {
  const s = scaleSqrt()
    .domain(opts.domain as [number, number])
    .range(opts.range);
  if (opts.nice) s.nice(typeof opts.nice === "number" ? opts.nice : undefined);
  if (opts.clamp) s.clamp(true);
  return s;
}

export function timeScale(opts: AxisScaleOptions<Date>): TimeScale {
  const s = scaleTime()
    .domain(opts.domain as [Date, Date])
    .range(opts.range);
  if (opts.nice) s.nice(typeof opts.nice === "number" ? opts.nice : undefined);
  if (opts.clamp) s.clamp(true);
  return s;
}

export interface BandScaleOptions {
  domain: string[];
  range: [number, number];
  /** Gap between bands as a fraction of band width (0..1). Default 0.1. */
  padding?: number;
  /** Outer padding as a fraction (0..1). Default same as `padding`. */
  paddingOuter?: number;
  align?: number;
}

export function bandScale(opts: BandScaleOptions): BandScale {
  const s = scaleBand<string>().domain(opts.domain).range(opts.range);
  if (opts.padding !== undefined) s.padding(opts.padding);
  if (opts.paddingOuter !== undefined) s.paddingOuter(opts.paddingOuter);
  if (opts.align !== undefined) s.align(opts.align);
  return s;
}

export function pointScale(opts: BandScaleOptions): PointScale {
  const s = scalePoint<string>().domain(opts.domain).range(opts.range);
  if (opts.padding !== undefined) s.padding(opts.padding);
  if (opts.align !== undefined) s.align(opts.align);
  return s;
}

export interface QuantizeOptions<Out> {
  domain: [number, number];
  range: Out[];
}

export function quantizeScale<Out>(
  opts: QuantizeOptions<Out>
): QuantizeScale<Out> {
  return scaleQuantize<Out>().domain(opts.domain).range(opts.range);
}

/** Band center — useful when placing a point/label in the middle of a band. */
export function bandCenter(scale: BandScale, key: string): number {
  const start = scale(key);
  if (start === undefined) return NaN;
  return start + scale.bandwidth() / 2;
}
