import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { darkTheme, lightTheme, midnightTheme, greyTheme, softTheme, softLightTheme, boothTheme, THEME_NAMES } from "../index";
import { highContrastDarkOverrides, highContrastGreyOverrides, highContrastLightOverrides, withHighContrast } from "../highContrast";
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
    const css = readFileSync(resolve(process.cwd(), "src/css/tokens.css"), "utf8");
    const block = (selector: string) => {
      const start = css.indexOf(`${selector} {`);
      expect(start, selector).toBeGreaterThan(-1);
      return css.slice(start, css.indexOf("}", start));
    };
    const prop = (key: string, value: string) => `--vf-${key.replace(/(\d)$/, "-$1")}: ${value}`;
    const dark = block('[data-vf-contrast="high"]');
    for (const [key, value] of Object.entries(highContrastDarkOverrides)) expect(dark, key).toContain(prop(key, value as string));
    const light = block('[data-vf-theme="light"][data-vf-contrast="high"]');
    for (const [key, value] of Object.entries(highContrastLightOverrides)) expect(light, key).toContain(prop(key, value as string));
    const grey = block('[data-vf-theme="grey"][data-vf-contrast="high"]');
    expect(grey).toContain(prop("text2", highContrastGreyOverrides.text2 as string));
  });
});
