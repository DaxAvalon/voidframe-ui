import { describe, expect, it } from "vitest";
import { defaultTokens, createTheme, lightTheme, tint } from "../tokens";

describe("defaultTokens", () => {
  it("has 6 surface layers (bg0–bg5)", () => {
    expect(defaultTokens.bg0).toBe("#050505");
    expect(defaultTokens.bg5).toBe("#1a1a1a");
  });

  it("has semantic aliases matching accent palette", () => {
    expect(defaultTokens.success).toBe(defaultTokens.green);
    expect(defaultTokens.danger).toBe(defaultTokens.red);
    expect(defaultTokens.warning).toBe(defaultTokens.amber);
    expect(defaultTokens.info).toBe(defaultTokens.blue);
  });

  it("enforces brutalist geometry (radius: 0)", () => {
    expect(defaultTokens.radius).toBe(0);
  });

  it("uses monospace font family", () => {
    expect(defaultTokens.fontFamily).toMatch(/Courier|mono/i);
  });

  it("has 12 spacing steps", () => {
    for (let i = 1; i <= 12; i++) {
      expect(defaultTokens[`sp${i}` as keyof typeof defaultTokens]).toBeTypeOf(
        "number"
      );
    }
  });
});

describe("createTheme", () => {
  it("returns default tokens when called with no args", () => {
    expect(createTheme()).toEqual(defaultTokens);
  });

  it("merges overrides over defaults", () => {
    const custom = createTheme({ green: "#86efac" });
    expect(custom.green).toBe("#86efac");
    expect(custom.bg0).toBe(defaultTokens.bg0);
    expect(custom.fontFamily).toBe(defaultTokens.fontFamily);
  });

  it("does not mutate defaultTokens", () => {
    const original = defaultTokens.green;
    createTheme({ green: "#000000" });
    expect(defaultTokens.green).toBe(original);
  });
});

describe("lightTheme", () => {
  it("inverts the surface hierarchy", () => {
    expect(lightTheme.bg0).not.toBe(defaultTokens.bg0);
    expect(lightTheme.text0).not.toBe(defaultTokens.text0);
  });

  it("preserves brutalist geometry", () => {
    expect(lightTheme.radius).toBe(0);
  });
});

describe("tint", () => {
  it("appends default opacity suffix when none given", () => {
    expect(tint("#4ade80")).toBe("#4ade8012");
  });

  it("appends custom opacity", () => {
    expect(tint("#4ade80", "44")).toBe("#4ade8044");
  });
});
