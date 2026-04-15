import { describe, expect, it } from "vitest";
import {
  bandCenter,
  bandScale,
  linearScale,
  logScale,
  pointScale,
  quantizeScale,
  sqrtScale,
  timeScale,
} from "../scales";

describe("linearScale", () => {
  it("maps domain to range", () => {
    const s = linearScale({ domain: [0, 100], range: [0, 200] });
    expect(s(0)).toBe(0);
    expect(s(50)).toBe(100);
    expect(s(100)).toBe(200);
  });

  it("inverts range back to domain", () => {
    const s = linearScale({ domain: [0, 10], range: [0, 100] });
    expect(s.invert(50)).toBe(5);
  });

  it("nice expands the domain outward", () => {
    const s = linearScale({ domain: [0.37, 9.82], range: [0, 100], nice: true });
    expect(s.domain()).toEqual([0, 10]);
  });

  it("clamp prevents range overflow", () => {
    const s = linearScale({
      domain: [0, 10],
      range: [0, 100],
      clamp: true,
    });
    expect(s(-5)).toBe(0);
    expect(s(15)).toBe(100);
  });
});

describe("logScale", () => {
  it("maps a log domain", () => {
    const s = logScale({ domain: [1, 1000], range: [0, 300] });
    expect(s(1)).toBe(0);
    expect(s(10)).toBeCloseTo(100, 4);
    expect(s(100)).toBeCloseTo(200, 4);
    expect(s(1000)).toBe(300);
  });
});

describe("sqrtScale", () => {
  it("applies sqrt transform", () => {
    const s = sqrtScale({ domain: [0, 100], range: [0, 10] });
    expect(s(0)).toBe(0);
    expect(s(100)).toBe(10);
    expect(s(25)).toBe(5);
  });
});

describe("timeScale", () => {
  it("maps a time domain", () => {
    const start = new Date(2026, 0, 1);
    const end = new Date(2026, 0, 11);
    const s = timeScale({ domain: [start, end], range: [0, 100] });
    expect(s(start)).toBe(0);
    expect(s(end)).toBe(100);
    const mid = new Date(2026, 0, 6);
    expect(s(mid)).toBe(50);
  });
});

describe("bandScale", () => {
  it("assigns equal bands with no padding", () => {
    const s = bandScale({
      domain: ["a", "b", "c"],
      range: [0, 90],
      padding: 0,
    });
    expect(s.bandwidth()).toBe(30);
    expect(s("a")).toBe(0);
    expect(s("b")).toBe(30);
    expect(s("c")).toBe(60);
  });

  it("respects padding between bands", () => {
    const s = bandScale({
      domain: ["a", "b"],
      range: [0, 100],
      padding: 0.5,
    });
    // Padding halves the band width.
    expect(s.bandwidth()).toBeLessThan(50);
  });

  it("bandCenter returns the middle of a band", () => {
    const s = bandScale({
      domain: ["a", "b"],
      range: [0, 100],
      padding: 0,
    });
    expect(bandCenter(s, "a")).toBe(25);
    expect(bandCenter(s, "b")).toBe(75);
  });
});

describe("pointScale", () => {
  it("assigns evenly spaced points", () => {
    const s = pointScale({
      domain: ["a", "b", "c"],
      range: [0, 100],
      padding: 0,
    });
    expect(s("a")).toBe(0);
    expect(s("c")).toBe(100);
  });
});

describe("quantizeScale", () => {
  it("buckets continuous domain into categorical output", () => {
    const s = quantizeScale<string>({
      domain: [0, 100],
      range: ["low", "mid", "high"],
    });
    expect(s(0)).toBe("low");
    expect(s(50)).toBe("mid");
    expect(s(100)).toBe("high");
  });
});
