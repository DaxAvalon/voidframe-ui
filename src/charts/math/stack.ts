// Stacking math for bar / area / stream charts. Delegates to d3-shape.stack
// with our preferred offset + order aliases.

import {
  stack as d3Stack,
  stackOffsetExpand,
  stackOffsetNone,
  stackOffsetSilhouette,
  stackOffsetWiggle,
  stackOrderAscending,
  stackOrderInsideOut,
  stackOrderNone,
  stackOrderReverse,
} from "d3-shape";

export type StackOffset = "none" | "expand" | "silhouette" | "wiggle";
export type StackOrder = "none" | "ascending" | "reverse" | "inside-out";

const OFFSET_MAP = {
  none: stackOffsetNone,
  expand: stackOffsetExpand,
  silhouette: stackOffsetSilhouette,
  wiggle: stackOffsetWiggle,
};
const ORDER_MAP = {
  none: stackOrderNone,
  ascending: stackOrderAscending,
  reverse: stackOrderReverse,
  "inside-out": stackOrderInsideOut,
};

export interface StackSeries<Datum> {
  key: string;
  values: Array<{
    data: Datum;
    y0: number;
    y1: number;
  }>;
}

export interface StackOptions<Datum> {
  data: Datum[];
  keys: string[];
  offset?: StackOffset;
  order?: StackOrder;
  /** How to read a value for series `key` from a datum. Default `datum[key]`. */
  value?: (datum: Datum, key: string) => number;
}

export function stackSeries<Datum extends Record<string, unknown>>(
  options: StackOptions<Datum>
): StackSeries<Datum>[] {
  const { data, keys, offset = "none", order = "none" } = options;
  const accessor =
    options.value ??
    ((datum: Datum, key: string) => Number(datum[key] ?? 0));
  const stacker = d3Stack<Datum, string>()
    .keys(keys)
    .offset(OFFSET_MAP[offset])
    .order(ORDER_MAP[order])
    .value((d, key) => accessor(d, key));
  const series = stacker(data);
  return series.map((s) => ({
    key: s.key,
    values: s.map((point) => ({
      data: point.data,
      y0: point[0],
      y1: point[1],
    })),
  }));
}
