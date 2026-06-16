import { describe, expect, it } from "vitest";
import { defaultTokens } from "../../tokens";
import {
  THEME_NAMES,
  softTheme,
  softLightTheme,
  tokensToCssVars,
} from "../index";

describe("soft / soft-light themes", () => {
  it("are registered as built-in theme names", () => {
    expect(THEME_NAMES).toContain("soft");
    expect(THEME_NAMES).toContain("soft-light");
  });

  it("are complete token sets (every contract key present)", () => {
    for (const theme of [softTheme, softLightTheme]) {
      for (const key of Object.keys(defaultTokens)) {
        expect(theme).toHaveProperty(key);
      }
    }
  });

  it("round the corners (the soft signature)", () => {
    expect(softTheme.radius).toBe(6);
    expect(softLightTheme.radius).toBe(6);
    expect(softTheme.radius).toBeGreaterThan(defaultTokens.radius);
  });

  it("emit radius with a px unit so non-zero radii apply", () => {
    // Regression guard for removing `radius` from UNITLESS_KEYS.
    expect(tokensToCssVars(softTheme)["--vf-radius"]).toBe("6px");
    expect(tokensToCssVars(defaultTokens)["--vf-radius"]).toBe("0px");
  });

  it("keep accent opacity ramps consistent with their base hue", () => {
    expect(softTheme.green20.startsWith(softTheme.green)).toBe(true);
    expect(softLightTheme.blue40.startsWith(softLightTheme.blue)).toBe(true);
  });
});
