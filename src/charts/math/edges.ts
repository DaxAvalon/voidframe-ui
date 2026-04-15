// Geometry helpers shared by NetworkGraph and DependencyGraph for edge
// trimming + obstruction detection.

export interface Point {
  x: number;
  y: number;
}

export interface CircleObstacle extends Point {
  r: number;
}

/**
 * Trim a line segment from `(ax, ay) → (bx, by)` so each endpoint sits
 * on the surface of a circle of radius `rA` / `rB` centred at the
 * respective endpoint. Returns the new endpoints.
 */
export function trimSegmentToCircles(
  ax: number,
  ay: number,
  bx: number,
  by: number,
  rA: number,
  rB: number
): { ax: number; ay: number; bx: number; by: number } {
  const dx = bx - ax;
  const dy = by - ay;
  const len = Math.hypot(dx, dy);
  if (len === 0) return { ax, ay, bx, by };
  const ux = dx / len;
  const uy = dy / len;
  return {
    ax: ax + ux * rA,
    ay: ay + uy * rA,
    bx: bx - ux * rB,
    by: by - uy * rB,
  };
}

/**
 * Intersect parametrised segment `P(t) = A + t*(B-A), t ∈ [0,1]` with a
 * circle. Returns `[tEntry, tExit]` clipped to `[0, 1]`, or `null` when
 * the segment never enters the circle.
 */
export function intersectSegmentCircle(
  ax: number,
  ay: number,
  bx: number,
  by: number,
  cx: number,
  cy: number,
  r: number
): [number, number] | null {
  const dx = bx - ax;
  const dy = by - ay;
  const ex = ax - cx;
  const ey = ay - cy;
  const a = dx * dx + dy * dy;
  if (a === 0) return null;
  const b = 2 * (dx * ex + dy * ey);
  const c = ex * ex + ey * ey - r * r;
  const disc = b * b - 4 * a * c;
  if (disc < 0) return null;
  const sq = Math.sqrt(disc);
  const t1 = (-b - sq) / (2 * a);
  const t2 = (-b + sq) / (2 * a);
  const tIn = Math.max(0, Math.min(1, t1));
  const tOut = Math.max(0, Math.min(1, t2));
  if (tIn >= tOut) return null;
  return [tIn, tOut];
}

/**
 * Split a segment into runs of "visible" vs "obstructed" by the listed
 * circles. Used to draw dashed overlays where edges pass under
 * unrelated nodes in the network graph.
 */
export interface SegmentRun {
  /** Start parameter `t ∈ [0, 1]` along the segment. */
  start: number;
  end: number;
  obstructed: boolean;
}

export function splitSegmentByObstacles(
  ax: number,
  ay: number,
  bx: number,
  by: number,
  obstacles: CircleObstacle[]
): SegmentRun[] {
  // Collect every entry/exit `t` per obstacle.
  const events: Array<{ t: number; delta: number }> = [
    { t: 0, delta: 0 },
    { t: 1, delta: 0 },
  ];
  for (const o of obstacles) {
    const range = intersectSegmentCircle(ax, ay, bx, by, o.x, o.y, o.r);
    if (!range) continue;
    events.push({ t: range[0], delta: +1 });
    events.push({ t: range[1], delta: -1 });
  }
  events.sort((a, b) => a.t - b.t);

  const runs: SegmentRun[] = [];
  let depth = 0;
  let cursor = 0;
  for (let i = 0; i < events.length; i++) {
    const ev = events[i]!;
    if (ev.t > cursor) {
      runs.push({
        start: cursor,
        end: ev.t,
        obstructed: depth > 0,
      });
      cursor = ev.t;
    }
    depth += ev.delta;
  }
  // Merge adjacent runs with the same obstruction state.
  const merged: SegmentRun[] = [];
  for (const r of runs) {
    if (merged.length && merged[merged.length - 1]!.obstructed === r.obstructed) {
      merged[merged.length - 1]!.end = r.end;
    } else {
      merged.push({ ...r });
    }
  }
  return merged.filter((r) => r.end > r.start);
}

/** Linear interpolation between two points along the segment. */
export function interpolatePoint(
  ax: number,
  ay: number,
  bx: number,
  by: number,
  t: number
): Point {
  return { x: ax + (bx - ax) * t, y: ay + (by - ay) * t };
}

export interface RectObstacle {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * Intersect a segment with an axis-aligned rectangle using the
 * Liang–Barsky parametric clip. Returns `[tEntry, tExit]` clipped to
 * `[0, 1]`, or `null` when the segment never enters the rectangle.
 */
export function intersectSegmentRect(
  ax: number,
  ay: number,
  bx: number,
  by: number,
  rx: number,
  ry: number,
  rw: number,
  rh: number
): [number, number] | null {
  let t0 = 0;
  let t1 = 1;
  const dx = bx - ax;
  const dy = by - ay;
  const clip = (p: number, q: number): boolean => {
    if (p === 0) {
      if (q < 0) return false;
      return true;
    }
    const r = q / p;
    if (p < 0) {
      if (r > t1) return false;
      if (r > t0) t0 = r;
    } else {
      if (r < t0) return false;
      if (r < t1) t1 = r;
    }
    return true;
  };
  if (!clip(-dx, ax - rx)) return null;
  if (!clip(dx, rx + rw - ax)) return null;
  if (!clip(-dy, ay - ry)) return null;
  if (!clip(dy, ry + rh - ay)) return null;
  if (t0 >= t1) return null;
  return [t0, t1];
}

/** True if the segment passes through any of the listed rectangles. */
export function segmentCrossesAnyRect(
  ax: number,
  ay: number,
  bx: number,
  by: number,
  obstacles: RectObstacle[]
): boolean {
  for (const o of obstacles) {
    if (intersectSegmentRect(ax, ay, bx, by, o.x, o.y, o.w, o.h)) return true;
  }
  return false;
}

/**
 * Split a segment into runs of "visible" vs "obstructed" by rectangles.
 * Used for graphs whose nodes are rectangles (DependencyGraph).
 */
export function splitSegmentByRectObstacles(
  ax: number,
  ay: number,
  bx: number,
  by: number,
  obstacles: RectObstacle[]
): SegmentRun[] {
  const events: Array<{ t: number; delta: number }> = [
    { t: 0, delta: 0 },
    { t: 1, delta: 0 },
  ];
  for (const o of obstacles) {
    const range = intersectSegmentRect(ax, ay, bx, by, o.x, o.y, o.w, o.h);
    if (!range) continue;
    events.push({ t: range[0], delta: +1 });
    events.push({ t: range[1], delta: -1 });
  }
  events.sort((a, b) => a.t - b.t);

  const runs: SegmentRun[] = [];
  let depth = 0;
  let cursor = 0;
  for (let i = 0; i < events.length; i++) {
    const ev = events[i]!;
    if (ev.t > cursor) {
      runs.push({ start: cursor, end: ev.t, obstructed: depth > 0 });
      cursor = ev.t;
    }
    depth += ev.delta;
  }
  const merged: SegmentRun[] = [];
  for (const r of runs) {
    if (merged.length && merged[merged.length - 1]!.obstructed === r.obstructed) {
      merged[merged.length - 1]!.end = r.end;
    } else {
      merged.push({ ...r });
    }
  }
  return merged.filter((r) => r.end > r.start);
}
