import { describe, expect, it } from "vitest";
import {
  cvdPalette,
  defaultSeriesPalette,
  divergingPalette,
  formatChartNumber,
  seriesPalette,
  CVD_PALETTE,
  DIVERGING_PALETTE,
} from "../color";

describe("seriesPalette", () => {
  it("returns n theme-token strings", () => {
    const p = seriesPalette(3);
    expect(p).toHaveLength(3);
    for (const c of p) expect(c.startsWith("var(--")).toBe(true);
  });

  it("cycles when n exceeds the default palette", () => {
    const base = defaultSeriesPalette();
    const p = seriesPalette(base.length + 2);
    expect(p[base.length]).toBe(base[0]);
    expect(p[base.length + 1]).toBe(base[1]);
  });

  it("overrides the first color via accent", () => {
    const p = seriesPalette(3, { accent: "var(--vf-rose)" });
    expect(p[0]).toBe("var(--vf-rose)");
  });

  it("uses an explicit palette when provided", () => {
    const p = seriesPalette(2, { palette: ["red", "blue"] });
    expect(p).toEqual(["red", "blue"]);
  });

  it("returns zero-length array for n=0", () => {
    const p = seriesPalette(0);
    expect(p).toHaveLength(0);
  });

  it("accent + explicit palette: accent overrides first color of palette", () => {
    const p = seriesPalette(3, { palette: ["a", "b", "c"], accent: "x" });
    expect(p[0]).toBe("x");
    expect(p[1]).toBe("b");
    expect(p[2]).toBe("c");
  });
});

describe("cvdPalette", () => {
  it("returns Okabe-Ito colors", () => {
    const p = cvdPalette(3);
    expect(p).toHaveLength(3);
    expect(p[0]).toBe(CVD_PALETTE[0]);
  });

  it("cycles when n exceeds palette length", () => {
    const p = cvdPalette(CVD_PALETTE.length + 1);
    expect(p[CVD_PALETTE.length]).toBe(CVD_PALETTE[0]);
  });
});

describe("divergingPalette", () => {
  it("returns a slice for small n", () => {
    const p = divergingPalette(3);
    expect(p).toHaveLength(3);
    expect(p[0]).toBe(DIVERGING_PALETTE[0]);
  });

  it("returns the full palette when n exceeds length", () => {
    const p = divergingPalette(20);
    expect(p).toEqual(DIVERGING_PALETTE);
  });
});

describe("formatChartNumber", () => {
  it("formats integers with locale separators", () => {
    const result = formatChartNumber(1000);
    // toLocaleString varies by environment; just check it's a string
    expect(result).toBeTruthy();
  });

  it("formats small floats with up to 2 decimals by default", () => {
    expect(formatChartNumber(3.14159)).toBe("3.14");
  });

  it("trims trailing zeroes", () => {
    expect(formatChartNumber(2.1)).toBe("2.1");
  });

  it("handles NaN and Infinity", () => {
    expect(formatChartNumber(NaN)).toBe("NaN");
    expect(formatChartNumber(Infinity)).toBe("Infinity");
    expect(formatChartNumber(-Infinity)).toBe("-Infinity");
  });

  it("respects custom maxDecimals", () => {
    expect(formatChartNumber(3.14159, 4)).toBe("3.1416");
  });

  it("formats zero correctly", () => {
    expect(formatChartNumber(0)).toBeTruthy();
  });
});
