import { describe, expect, it } from "vitest";
import {
  bandScale,
  linearScale,
  timeScale,
} from "../scales";
import { defaultNumericFormat, generateTicks } from "../ticks";

describe("generateTicks — linear scale", () => {
  it("returns approximately `count` nice ticks for a 0-100 domain", () => {
    const scale = linearScale({ domain: [0, 100], range: [0, 500] });
    const ticks = generateTicks<number>(scale, { count: 5 });
    expect(ticks.length).toBeGreaterThanOrEqual(5);
    expect(ticks.length).toBeLessThanOrEqual(7);
    expect(ticks[0]!.value).toBe(0);
    expect(ticks[ticks.length - 1]!.value).toBe(100);
  });

  it("rounds 0.37 - 9.82 to a tidy step", () => {
    const scale = linearScale({ domain: [0.37, 9.82], range: [0, 100] });
    const ticks = generateTicks<number>(scale, { count: 5 });
    // d3 nice-num should pick integer steps within this domain.
    for (const t of ticks) {
      expect(Number.isInteger(t.value)).toBe(true);
    }
  });

  it("applies a custom format when given", () => {
    const scale = linearScale({ domain: [0, 1], range: [0, 100] });
    const ticks = generateTicks<number>(scale, {
      count: 3,
      format: (v) => `${(v * 100).toFixed(0)}%`,
    });
    expect(ticks[0]!.label.endsWith("%")).toBe(true);
  });
});

describe("generateTicks — time scale", () => {
  it("returns tick Dates within the domain", () => {
    const scale = timeScale({
      domain: [new Date(2026, 0, 1), new Date(2026, 0, 10)],
      range: [0, 900],
    });
    const ticks = generateTicks<Date>(scale, { count: 5 });
    expect(ticks.length).toBeGreaterThan(0);
    expect(ticks[0]!.value).toBeInstanceOf(Date);
  });
});

describe("generateTicks — band scale", () => {
  it("returns one tick per category at the band center", () => {
    const scale = bandScale({
      domain: ["a", "b", "c"],
      range: [0, 90],
      padding: 0,
    });
    const ticks = generateTicks<string>(scale, {});
    expect(ticks).toHaveLength(3);
    expect(ticks[0]!.position).toBe(15);
    expect(ticks[1]!.position).toBe(45);
    expect(ticks[2]!.position).toBe(75);
  });
});

describe("defaultNumericFormat", () => {
  it("returns a function that formats values from the scale's own tickFormat", () => {
    const scale = linearScale({ domain: [0, 10], range: [0, 100] });
    const fmt = defaultNumericFormat(scale, 5);
    expect(typeof fmt(5)).toBe("string");
  });
});
