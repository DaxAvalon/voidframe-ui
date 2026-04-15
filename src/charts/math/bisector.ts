// Nearest-point lookup for tooltip / crosshair interaction. Falls through to
// d3-array's bisector for sorted input; provides a linear fallback for
// unsorted.

import { bisector } from "d3-array";

export interface NearestResult<T> {
  index: number;
  datum: T;
  distance: number;
}

/**
 * Find the datum nearest to `target` on a sorted array (ascending by x).
 *
 * Returns both the index and the datum; distance is the absolute delta so
 * callers can filter by a threshold.
 */
export function bisectNearest<T>(
  data: T[],
  target: number,
  accessor: (d: T) => number
): NearestResult<T> | null {
  if (data.length === 0) return null;
  const b = bisector<T, number>(accessor).left;
  const i = b(data, target);
  // Compare the two candidates bracketing the target.
  const left = data[i - 1];
  const right = data[i];
  if (left === undefined && right === undefined) return null;
  if (left === undefined) {
    return {
      index: i,
      datum: right!,
      distance: Math.abs(accessor(right!) - target),
    };
  }
  if (right === undefined) {
    return {
      index: i - 1,
      datum: left,
      distance: Math.abs(accessor(left) - target),
    };
  }
  const leftDist = Math.abs(accessor(left) - target);
  const rightDist = Math.abs(accessor(right) - target);
  return leftDist <= rightDist
    ? { index: i - 1, datum: left, distance: leftDist }
    : { index: i, datum: right, distance: rightDist };
}

/**
 * Linear-scan variant for unsorted data. O(n). Fine up to ~2k points.
 */
export function scanNearest<T>(
  data: T[],
  target: number,
  accessor: (d: T) => number
): NearestResult<T> | null {
  if (data.length === 0) return null;
  let best = 0;
  let bestDist = Infinity;
  for (let i = 0; i < data.length; i++) {
    const dist = Math.abs(accessor(data[i]!) - target);
    if (dist < bestDist) {
      bestDist = dist;
      best = i;
    }
  }
  return { index: best, datum: data[best]!, distance: bestDist };
}
