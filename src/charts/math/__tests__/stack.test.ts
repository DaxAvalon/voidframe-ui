import { describe, expect, it } from "vitest";
import { stackSeries } from "../stack";

interface Row {
  month: string;
  mobile: number;
  desktop: number;
  tablet: number;
  [key: string]: unknown;
}

const data: Row[] = [
  { month: "jan", mobile: 30, desktop: 70, tablet: 10 },
  { month: "feb", mobile: 50, desktop: 60, tablet: 20 },
];

describe("stackSeries", () => {
  it("none offset stacks values bottom-up from 0", () => {
    const series = stackSeries<Row>({
      data,
      keys: ["mobile", "desktop", "tablet"],
    });
    expect(series).toHaveLength(3);
    expect(series[0]!.key).toBe("mobile");
    expect(series[0]!.values[0]!.y0).toBe(0);
    expect(series[0]!.values[0]!.y1).toBe(30);
    expect(series[1]!.values[0]!.y0).toBe(30);
    expect(series[1]!.values[0]!.y1).toBe(100);
    expect(series[2]!.values[0]!.y1).toBe(110);
  });

  it("expand offset normalizes each datum to [0, 1]", () => {
    const series = stackSeries<Row>({
      data,
      keys: ["mobile", "desktop", "tablet"],
      offset: "expand",
    });
    // Top of the top-most series should always be 1.
    for (let i = 0; i < data.length; i++) {
      expect(series[series.length - 1]!.values[i]!.y1).toBeCloseTo(1, 6);
    }
  });

  it("silhouette offset centers the stack around 0", () => {
    const series = stackSeries<Row>({
      data,
      keys: ["mobile", "desktop", "tablet"],
      offset: "silhouette",
    });
    // For silhouette, the sum of y0 and y1 extrema should be symmetric.
    const bottom = series[0]!.values[0]!.y0;
    const top = series[series.length - 1]!.values[0]!.y1;
    expect(Math.abs(bottom + top)).toBeLessThan(0.01);
  });

  it("accepts a custom value accessor", () => {
    const series = stackSeries<Row>({
      data,
      keys: ["mobile", "desktop"],
      value: (d, key) => Number(d[key]) * 2,
    });
    expect(series[0]!.values[0]!.y1).toBe(60);
  });
});
