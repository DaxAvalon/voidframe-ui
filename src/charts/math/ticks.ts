// Tick generation + formatting — delegates to d3's nice-num + nice-time
// algorithms but exposes a single uniform interface to axes.

import type {
  BandScale,
  ContinuousScale,
  LinearScale,
  LogScale,
  PointScale,
  TimeScale,
} from "./scales";

export type AxisTickScale =
  | LinearScale
  | LogScale
  | TimeScale
  | BandScale
  | PointScale
  | ContinuousScale;

export interface Tick<T> {
  value: T;
  label: string;
  position: number;
}

export interface TickOptions<T = number | Date | string> {
  /** Approximate tick count. Ignored for band/point scales. Default 5. */
  count?: number;
  /** Custom label formatter. Overrides the default. */
  format?: (value: T) => string;
}

function isBandLike(
  scale: AxisTickScale
): scale is BandScale | PointScale {
  return (
    typeof (scale as BandScale).bandwidth === "function" ||
    typeof (scale as PointScale).step === "function"
  );
}

function isTimeLike(scale: AxisTickScale): scale is TimeScale {
  const domain = (scale as TimeScale).domain?.();
  return Array.isArray(domain) && domain[0] instanceof Date;
}

/**
 * Generate ticks for any supported axis scale.
 *
 * - Band / point scales: one tick per domain entry at its band center (band)
 *   or step position (point).
 * - Linear / log / time scales: d3 nice-ticks using the target count.
 */
export function generateTicks<T extends number | Date | string>(
  scale: AxisTickScale,
  options: TickOptions<T> = {}
): Tick<T>[] {
  const count = options.count ?? 5;
  if (isBandLike(scale)) {
    const band = scale as BandScale;
    const bandwidth = band.bandwidth?.() ?? 0;
    return band.domain().map((value) => {
      const start = band(value) ?? 0;
      const position = start + bandwidth / 2;
      return {
        value: value as unknown as T,
        label:
          options.format?.(value as unknown as T) ?? String(value),
        position,
      };
    });
  }

  if (isTimeLike(scale)) {
    const t = scale as TimeScale;
    const values = t.ticks(count);
    const userFmt = options.format as ((v: Date) => string) | undefined;
    const fmt: (v: Date) => string =
      userFmt ??
      (t.tickFormat?.(count) ?? ((x: Date) => x.toISOString()));
    return values.map((value) => ({
      value: value as unknown as T,
      label: fmt(value),
      position: t(value),
    }));
  }

  const c = scale as ContinuousScale & {
    tickFormat?: (count?: number) => (v: number) => string;
  };
  const values = c.ticks?.(count) ?? [];
  const defaultFmt =
    c.tickFormat?.(count) ?? ((v: number) => String(v));
  return values.map((value) => ({
    value: value as unknown as T,
    label:
      options.format?.(value as unknown as T) ??
      defaultFmt(value as number),
    position: c(value),
  }));
}

/**
 * Default label formatter for a continuous scale. Used when the consumer
 * does not provide `format`, but wants the formatter early (e.g. to measure).
 */
export function defaultNumericFormat(
  scale: ContinuousScale,
  count = 5
): (v: number) => string {
  const c = scale as ContinuousScale & {
    tickFormat?: (count?: number) => (v: number) => string;
  };
  return c.tickFormat?.(count) ?? ((v: number) => String(v));
}
