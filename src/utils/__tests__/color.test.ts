import { describe, expect, it } from "vitest";
import {
  hexToRgb,
  rgbToHex,
  hexToHsl,
  hslToHex,
  rgbToHsl,
  hslToRgb,
  lighten,
  darken,
  setAlpha,
  mix,
  luminance,
  contrastRatio,
  isAccessible,
  mostReadable,
  parseColor,
  isValidColor,
} from "../color";

// ── hexToRgb ──────────────────────────────────────────────────

describe("hexToRgb", () => {
  it("parses 6-digit hex", () => {
    expect(hexToRgb("#ff0000")).toEqual({ r: 255, g: 0, b: 0 });
  });

  it("parses 3-digit hex", () => {
    expect(hexToRgb("#f00")).toEqual({ r: 255, g: 0, b: 0 });
  });

  it("parses without hash prefix", () => {
    expect(hexToRgb("00ff00")).toEqual({ r: 0, g: 255, b: 0 });
  });

  it("returns null for invalid hex", () => {
    expect(hexToRgb("nope")).toBeNull();
    expect(hexToRgb("#gggggg")).toBeNull();
  });
});

// ── rgbToHex ──────────────────────────────────────────────────

describe("rgbToHex", () => {
  it("converts RGB to hex", () => {
    expect(rgbToHex(255, 0, 0)).toBe("#ff0000");
  });

  it("pads single-digit values", () => {
    expect(rgbToHex(0, 0, 0)).toBe("#000000");
  });

  it("clamps out-of-range values", () => {
    expect(rgbToHex(300, -10, 128)).toBe("#ff0080");
  });
});

// ── Roundtrip conversions ─────────────────────────────────────

describe("hexToHsl / hslToHex roundtrip", () => {
  it("roundtrips pure red", () => {
    const hsl = hexToHsl("#ff0000");
    expect(hsl).toEqual({ h: 0, s: 100, l: 50 });
    expect(hslToHex(hsl!.h, hsl!.s, hsl!.l)).toBe("#ff0000");
  });

  it("roundtrips pure blue", () => {
    const hsl = hexToHsl("#0000ff");
    expect(hsl).toEqual({ h: 240, s: 100, l: 50 });
    expect(hslToHex(hsl!.h, hsl!.s, hsl!.l)).toBe("#0000ff");
  });

  it("returns null for invalid hex", () => {
    expect(hexToHsl("invalid")).toBeNull();
  });
});

describe("rgbToHsl / hslToRgb roundtrip", () => {
  it("converts white", () => {
    expect(rgbToHsl(255, 255, 255)).toEqual({ h: 0, s: 0, l: 100 });
  });

  it("converts black", () => {
    expect(rgbToHsl(0, 0, 0)).toEqual({ h: 0, s: 0, l: 0 });
  });

  it("roundtrips grayscale", () => {
    const hsl = rgbToHsl(128, 128, 128);
    expect(hsl.s).toBe(0);
    const rgb = hslToRgb(hsl.h, hsl.s, hsl.l);
    expect(rgb.r).toBe(rgb.g);
    expect(rgb.g).toBe(rgb.b);
  });

  it("converts green", () => {
    const hsl = rgbToHsl(0, 255, 0);
    expect(hsl.h).toBe(120);
    expect(hsl.s).toBe(100);
    expect(hsl.l).toBe(50);
  });

  it("hslToRgb handles s=0 grayscale", () => {
    const rgb = hslToRgb(0, 0, 50);
    expect(rgb).toEqual({ r: 128, g: 128, b: 128 });
  });
});

// ── Manipulation ──────────────────────────────────────────────

describe("lighten", () => {
  it("lightens a dark color", () => {
    const result = lighten("#333333", 0.2);
    const hsl = hexToHsl(result);
    expect(hsl!.l).toBeGreaterThan(20);
  });
});

describe("darken", () => {
  it("darkens a light color", () => {
    const result = darken("#cccccc", 0.2);
    const hsl = hexToHsl(result);
    expect(hsl!.l).toBeLessThan(80);
  });
});

describe("setAlpha", () => {
  it("appends alpha hex digits", () => {
    const result = setAlpha("#ff0000", 0.5);
    expect(result).toMatch(/^#ff000080$/);
  });

  it("clamps alpha to 0-1", () => {
    const full = setAlpha("#ff0000", 1);
    expect(full).toBe("#ff0000ff");
    const zero = setAlpha("#ff0000", 0);
    expect(zero).toBe("#ff000000");
  });
});

describe("mix", () => {
  it("mixes 50/50 black and white to gray", () => {
    const result = mix("#000000", "#ffffff", 0.5);
    const rgb = hexToRgb(result);
    // Should be close to 128
    expect(rgb!.r).toBeGreaterThan(120);
    expect(rgb!.r).toBeLessThan(136);
  });

  it("weight 1 returns first color", () => {
    expect(mix("#ff0000", "#0000ff", 1)).toBe("#ff0000");
  });

  it("weight 0 returns second color", () => {
    expect(mix("#ff0000", "#0000ff", 0)).toBe("#0000ff");
  });
});

// ── Analysis ──────────────────────────────────────────────────

describe("luminance", () => {
  it("returns 1 for white", () => {
    expect(luminance("#ffffff")).toBeCloseTo(1, 2);
  });

  it("returns 0 for black", () => {
    expect(luminance("#000000")).toBeCloseTo(0, 2);
  });
});

describe("contrastRatio", () => {
  it("returns 21 for black on white", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 0);
  });

  it("returns 1 for same colors", () => {
    expect(contrastRatio("#ff0000", "#ff0000")).toBeCloseTo(1, 1);
  });
});

describe("isAccessible", () => {
  it("AA normal — black on white passes", () => {
    expect(isAccessible("#000000", "#ffffff", "AA", "normal")).toBe(true);
  });

  it("AA normal — low contrast fails", () => {
    expect(isAccessible("#777777", "#888888", "AA", "normal")).toBe(false);
  });

  it("AA large has lower threshold", () => {
    // 3:1 is enough for large text
    expect(isAccessible("#000000", "#ffffff", "AA", "large")).toBe(true);
  });

  it("AAA normal requires 7:1", () => {
    expect(isAccessible("#000000", "#ffffff", "AAA", "normal")).toBe(true);
  });

  it("AAA large requires 4.5:1", () => {
    expect(isAccessible("#000000", "#ffffff", "AAA", "large")).toBe(true);
  });
});

describe("mostReadable", () => {
  it("picks the highest contrast candidate", () => {
    const result = mostReadable("#ffffff", ["#000000", "#cccccc", "#888888"]);
    expect(result).toBe("#000000");
  });

  it("returns first candidate if only one", () => {
    expect(mostReadable("#ffffff", ["#ff0000"])).toBe("#ff0000");
  });
});

// ── Parsing ───────────────────────────────────────────────────

describe("parseColor", () => {
  it("parses 6-digit hex", () => {
    expect(parseColor("#ff0000")).toEqual({ r: 255, g: 0, b: 0, a: 1 });
  });

  it("parses 3-digit hex", () => {
    expect(parseColor("#f00")).toEqual({ r: 255, g: 0, b: 0, a: 1 });
  });

  it("parses 8-digit hex with alpha", () => {
    const result = parseColor("#ff000080");
    expect(result?.r).toBe(255);
    expect(result?.a).toBeCloseTo(0.502, 1);
  });

  it("parses rgb()", () => {
    expect(parseColor("rgb(255, 0, 0)")).toEqual({ r: 255, g: 0, b: 0, a: 1 });
  });

  it("parses rgba()", () => {
    expect(parseColor("rgba(255, 0, 0, 0.5)")).toEqual({
      r: 255,
      g: 0,
      b: 0,
      a: 0.5,
    });
  });

  it("parses hsl()", () => {
    const result = parseColor("hsl(0, 100%, 50%)");
    expect(result).not.toBeNull();
    expect(result!.r).toBe(255);
    expect(result!.a).toBe(1);
  });

  it("returns null for invalid input", () => {
    expect(parseColor("not-a-color")).toBeNull();
  });
});

describe("isValidColor", () => {
  it("returns true for valid hex", () => {
    expect(isValidColor("#ff0000")).toBe(true);
  });

  it("returns true for valid rgb()", () => {
    expect(isValidColor("rgb(0, 0, 0)")).toBe(true);
  });

  it("returns false for invalid input", () => {
    expect(isValidColor("banana")).toBe(false);
  });
});
