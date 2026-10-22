import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { darkTheme, lightTheme, midnightTheme, greyTheme, softTheme, softLightTheme, boothTheme, THEME_NAMES } from "../index";
import { highContrastDarkOverrides, highContrastLightOverrides, withHighContrast } from "../highContrast";
import { expectThemeContrast, themeContrastReport } from "../../testing/contrast";

const THEMES = {
  dark: darkTheme,
  light: lightTheme,
  midnight: midnightTheme,
  grey: greyTheme,
  soft: softTheme,
  "soft-light": softLightTheme,
  booth: boothTheme,
} as const;

describe("built-in theme contrast", () => {
  it("covers every built-in theme name", () => {
    expect(Object.keys(THEMES).sort()).toEqual([...THEME_NAMES].sort());
  });

  for (const [name, tokens] of Object.entries(THEMES)) {
    it(`${name}: text0–text2 meet AA (4.5:1) on bg0–bg2`, () => {
      expectThemeContrast(tokens);
    });
    it(`${name}: text0–text2 meet 7:1 under high contrast`, () => {
      expectThemeContrast(withHighContrast(tokens, name), { min: 7 });
    });
  }

  it("the report lists failing pairs with ratios", () => {
    const report = themeContrastReport({ text0: "#777777", bg0: "#888888" }, { tiers: ["text0"], surfaces: ["bg0"] });
    expect(report).toHaveLength(1);
    expect(report[0]!.ratio).toBeLessThan(2);
    expect(() => expectThemeContrast({ text0: "#777777", bg0: "#888888" }, { tiers: ["text0"], surfaces: ["bg0"] })).toThrow(/below 4.5:1/);
  });

  it("the JS high-contrast overrides match tokens.css", () => {
    const css = readFileSync(new URL("../../css/tokens.css", import.meta.url), "utf8");
    const dark = css.slice(css.indexOf('[data-vf-contrast="high"] {'), css.indexOf('[data-vf-theme="light"][data-vf-contrast="high"]'));
    const light = css.slice(css.indexOf('[data-vf-theme="light"][data-vf-contrast="high"]'));
    for (const [key, value] of Object.entries(highContrastDarkOverrides)) {
      const prop = `--vf-${key.replace(/(\d)$/, "-$1")}: ${value}`;
      expect(dark, prop).toContain(prop);
    }
    for (const [key, value] of Object.entries(highContrastLightOverrides)) {
      const prop = `--vf-${key.replace(/(\d)$/, "-$1")}: ${value}`;
      expect(light, prop).toContain(prop);
    }
  });
});
