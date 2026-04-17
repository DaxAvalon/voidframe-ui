import { describe, expect, it } from "vitest";
import { defaultTokens, createTheme, lightTheme, greyTheme, tint } from "../tokens";

const COLORS = ["green", "red", "amber", "blue", "purple", "cyan", "rose"] as const;
const OPACITIES = [5, 10, 20, 40, 60] as const;
const HEX_SUFFIXES: Record<number, string> = { 5: "0d", 10: "1a", 20: "33", 40: "66", 60: "99" };

describe("opacity tokens", () => {
  it("all 35 opacity tokens exist in defaultTokens", () => {
    for (const color of COLORS) {
      for (const opacity of OPACITIES) {
        const key = `${color}${opacity}` as keyof typeof defaultTokens;
        expect(defaultTokens[key], `missing ${key}`).toBeDefined();
        expect(typeof defaultTokens[key]).toBe("string");
      }
    }
  });

  it("opacity tokens end with correct hex alpha suffixes", () => {
    for (const color of COLORS) {
      for (const opacity of OPACITIES) {
        const key = `${color}${opacity}` as keyof typeof defaultTokens;
        const value = defaultTokens[key] as string;
        const expectedSuffix = HEX_SUFFIXES[opacity];
        expect(value.endsWith(expectedSuffix), `${key}=${value} should end with ${expectedSuffix}`).toBe(true);
      }
    }
  });

  it("opacity tokens derive from their base accent color", () => {
    for (const color of COLORS) {
      const base = defaultTokens[color] as string;
      for (const opacity of OPACITIES) {
        const key = `${color}${opacity}` as keyof typeof defaultTokens;
        const value = defaultTokens[key] as string;
        expect(value.startsWith(base), `${key}=${value} should start with base ${base}`).toBe(true);
      }
    }
  });

  it("all 4 themes have opacity tokens", () => {
    const midnightTheme = createTheme({});
    const themes = [
      { name: "default", theme: defaultTokens },
      { name: "light", theme: lightTheme },
      { name: "grey", theme: greyTheme },
      { name: "midnight (default)", theme: midnightTheme },
    ];

    for (const { name, theme } of themes) {
      for (const color of COLORS) {
        for (const opacity of OPACITIES) {
          const key = `${color}${opacity}` as keyof typeof theme;
          expect(theme[key], `${name} missing ${key}`).toBeDefined();
          expect(typeof theme[key], `${name}.${key} should be string`).toBe("string");
        }
      }
    }
  });

  it("lightTheme opacity tokens use light accent colors", () => {
    expect(lightTheme.green5).toBe(`${lightTheme.green}0d`);
    expect(lightTheme.red60).toBe(`${lightTheme.red}99`);
    expect(lightTheme.blue20).toBe(`${lightTheme.blue}33`);
  });

  it("greyTheme opacity tokens use grey accent colors", () => {
    expect(greyTheme.green5).toBe(`${greyTheme.green}0d`);
    expect(greyTheme.red60).toBe(`${greyTheme.red}99`);
    expect(greyTheme.blue20).toBe(`${greyTheme.blue}33`);
  });
});

describe("borderWidth tokens", () => {
  it("all borderWidth tokens exist with correct values", () => {
    expect(defaultTokens.borderWidth0).toBe(0);
    expect(defaultTokens.borderWidth1).toBe(1);
    expect(defaultTokens.borderWidth2).toBe(2);
    expect(defaultTokens.borderWidth3).toBe(3);
    expect(defaultTokens.borderWidth4).toBe(4);
  });

  it("borderWidth tokens are numbers", () => {
    for (let i = 0; i <= 4; i++) {
      const key = `borderWidth${i}` as keyof typeof defaultTokens;
      expect(typeof defaultTokens[key]).toBe("number");
    }
  });

  it("lightTheme has borderWidth tokens", () => {
    expect(lightTheme.borderWidth0).toBe(0);
    expect(lightTheme.borderWidth1).toBe(1);
    expect(lightTheme.borderWidth2).toBe(2);
    expect(lightTheme.borderWidth3).toBe(3);
    expect(lightTheme.borderWidth4).toBe(4);
  });

  it("greyTheme has borderWidth tokens", () => {
    expect(greyTheme.borderWidth0).toBe(0);
    expect(greyTheme.borderWidth1).toBe(1);
    expect(greyTheme.borderWidth2).toBe(2);
    expect(greyTheme.borderWidth3).toBe(3);
    expect(greyTheme.borderWidth4).toBe(4);
  });
});

describe("tint() matches opacity tokens", () => {
  it("tint() output matches token values for default theme", () => {
    expect(tint(defaultTokens.green, "0d")).toBe(defaultTokens.green5);
    expect(tint(defaultTokens.green, "1a")).toBe(defaultTokens.green10);
    expect(tint(defaultTokens.green, "33")).toBe(defaultTokens.green20);
    expect(tint(defaultTokens.green, "66")).toBe(defaultTokens.green40);
    expect(tint(defaultTokens.green, "99")).toBe(defaultTokens.green60);
  });

  it("tint() output matches token values for all colors", () => {
    for (const color of COLORS) {
      const base = defaultTokens[color] as string;
      for (const opacity of OPACITIES) {
        const key = `${color}${opacity}` as keyof typeof defaultTokens;
        const suffix = HEX_SUFFIXES[opacity];
        expect(tint(base, suffix)).toBe(defaultTokens[key]);
      }
    }
  });
});
