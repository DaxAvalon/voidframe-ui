import { describe, expect, it } from "vitest";
import {
  intersectSegmentCircle,
  intersectSegmentRect,
  splitSegmentByObstacles,
  splitSegmentByRectObstacles,
  trimSegmentToCircles,
} from "../edges";

describe("trimSegmentToCircles", () => {
  it("pulls each endpoint inward by the matching radius", () => {
    const r = trimSegmentToCircles(0, 0, 100, 0, 5, 7);
    expect(r.ax).toBe(5);
    expect(r.ay).toBe(0);
    expect(r.bx).toBe(93);
    expect(r.by).toBe(0);
  });

  it("returns the original endpoints for a zero-length segment", () => {
    const r = trimSegmentToCircles(10, 20, 10, 20, 5, 5);
    expect(r).toEqual({ ax: 10, ay: 20, bx: 10, by: 20 });
  });
});

describe("intersectSegmentCircle", () => {
  it("returns null when the segment misses the circle", () => {
    const r = intersectSegmentCircle(0, 0, 100, 0, 50, 100, 10);
    expect(r).toBeNull();
  });

  it("returns clipped t-range when the segment passes through", () => {
    // Segment along x-axis from (0,0)→(100,0), circle at (50,0) r=10.
    const r = intersectSegmentCircle(0, 0, 100, 0, 50, 0, 10);
    expect(r).not.toBeNull();
    expect(r![0]).toBeCloseTo(0.4, 5);
    expect(r![1]).toBeCloseTo(0.6, 5);
  });
});

describe("splitSegmentByObstacles", () => {
  it("returns a single visible run when no obstacles intersect", () => {
    const runs = splitSegmentByObstacles(0, 0, 100, 0, [
      { x: 0, y: 50, r: 10 },
    ]);
    expect(runs).toHaveLength(1);
    expect(runs[0]!.obstructed).toBe(false);
  });

  it("splits a segment that passes through one obstacle into 3 runs", () => {
    const runs = splitSegmentByObstacles(0, 0, 100, 0, [
      { x: 50, y: 0, r: 10 },
    ]);
    expect(runs).toHaveLength(3);
    expect(runs[0]!.obstructed).toBe(false);
    expect(runs[1]!.obstructed).toBe(true);
    expect(runs[2]!.obstructed).toBe(false);
    expect(runs[1]!.start).toBeCloseTo(0.4);
    expect(runs[1]!.end).toBeCloseTo(0.6);
  });

  it("merges overlapping obstacles into one continuous obstructed run", () => {
    const runs = splitSegmentByObstacles(0, 0, 100, 0, [
      { x: 40, y: 0, r: 15 },
      { x: 55, y: 0, r: 15 },
    ]);
    const obstructed = runs.filter((r) => r.obstructed);
    expect(obstructed).toHaveLength(1);
  });
});

describe("intersectSegmentRect (Liang–Barsky)", () => {
  it("returns null when the segment misses the rectangle", () => {
    expect(intersectSegmentRect(0, 0, 100, 0, 0, 50, 100, 20)).toBeNull();
  });

  it("returns the entry/exit t for a segment that crosses the rect", () => {
    const r = intersectSegmentRect(0, 50, 100, 50, 40, 0, 20, 100);
    expect(r).not.toBeNull();
    expect(r![0]).toBeCloseTo(0.4, 5);
    expect(r![1]).toBeCloseTo(0.6, 5);
  });
});

describe("splitSegmentByRectObstacles", () => {
  it("yields a single visible run when no rect obstructs", () => {
    const runs = splitSegmentByRectObstacles(0, 0, 100, 0, [
      { x: 0, y: 50, w: 20, h: 20 },
    ]);
    expect(runs).toHaveLength(1);
    expect(runs[0]!.obstructed).toBe(false);
  });

  it("splits into 3 runs when crossing one obstacle rectangle", () => {
    const runs = splitSegmentByRectObstacles(0, 50, 100, 50, [
      { x: 40, y: 0, w: 20, h: 100 },
    ]);
    expect(runs).toHaveLength(3);
    expect(runs[1]!.obstructed).toBe(true);
    expect(runs[1]!.start).toBeCloseTo(0.4);
    expect(runs[1]!.end).toBeCloseTo(0.6);
  });
});
