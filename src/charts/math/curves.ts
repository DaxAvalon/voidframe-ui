// Named re-exports of d3-shape curve factories with a small picker helper.
// Charts pass a `curve` string prop; this module resolves it to a factory.

import {
  curveBasis,
  curveCatmullRom,
  curveLinear,
  curveMonotoneX,
  curveNatural,
  curveStep,
  curveStepAfter,
  curveStepBefore,
  type CurveFactory,
} from "d3-shape";

export type CurveKind =
  | "linear"
  | "step"
  | "stepBefore"
  | "stepAfter"
  | "monotone"
  | "basis"
  | "catmullRom"
  | "natural";

const CURVE_MAP: Record<CurveKind, CurveFactory> = {
  linear: curveLinear,
  step: curveStep,
  stepBefore: curveStepBefore,
  stepAfter: curveStepAfter,
  monotone: curveMonotoneX,
  basis: curveBasis,
  catmullRom: curveCatmullRom,
  natural: curveNatural,
};

export function resolveCurve(kind: CurveKind): CurveFactory {
  return CURVE_MAP[kind] ?? curveLinear;
}
