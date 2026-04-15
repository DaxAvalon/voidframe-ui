import { describe, expect, it } from "vitest";
import { bisectNearest, scanNearest } from "../bisector";

interface P {
  x: number;
  y: number;
}

const sorted: P[] = [
  { x: 0, y: 1 },
  { x: 10, y: 4 },
  { x: 20, y: 2 },
  { x: 30, y: 8 },
  { x: 40, y: 5 },
];

describe("bisectNearest", () => {
  it("finds the nearest datum by x", () => {
    const result = bisectNearest(sorted, 22, (d) => d.x);
    expect(result!.index).toBe(2);
    expect(result!.datum.x).toBe(20);
    expect(result!.distance).toBe(2);
  });

  it("handles the left edge (target before first)", () => {
    const result = bisectNearest(sorted, -5, (d) => d.x);
    expect(result!.index).toBe(0);
    expect(result!.distance).toBe(5);
  });

  it("handles the right edge (target after last)", () => {
    const result = bisectNearest(sorted, 100, (d) => d.x);
    expect(result!.index).toBe(4);
  });

  it("ties break toward the left neighbor", () => {
    const result = bisectNearest(sorted, 25, (d) => d.x);
    expect(result!.index).toBe(2); // x=20 is left neighbor; 5 == 5 ties → left
  });

  it("returns null on empty input", () => {
    expect(bisectNearest<P>([], 0, (d) => d.x)).toBeNull();
  });
});

describe("scanNearest", () => {
  it("works on unsorted input", () => {
    const unsorted: P[] = [
      { x: 40, y: 1 },
      { x: 0, y: 2 },
      { x: 18, y: 3 },
      { x: 30, y: 4 },
    ];
    const result = scanNearest(unsorted, 20, (d) => d.x);
    expect(result!.datum.x).toBe(18);
  });

  it("returns null on empty input", () => {
    expect(scanNearest<P>([], 0, (d) => d.x)).toBeNull();
  });
});
