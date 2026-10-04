import { describe, expect, it } from "vitest";
import { THEME_NAMES } from "../index";
import { boothTheme } from "../booth";
import { darkTheme } from "../dark";
import { contrastRatio } from "../../utils/color";

describe("booth theme", () => {
  it("is a built-in theme name", () => {
    expect(THEME_NAMES).toContain("booth");
  });

  it("keeps the dark ground and accents", () => {
    expect(boothTheme.bg1).toBe(darkTheme.bg1);
    expect(boothTheme.green).toBe(darkTheme.green);
    expect(boothTheme.red).toBe(darkTheme.red);
    expect(boothTheme.amber).toBe(darkTheme.amber);
    expect(boothTheme.radius).toBe(0);
  });

  it("every text tier used for words measures at least 7:1 on the ground and the next surface", () => {
    for (const tier of [boothTheme.text0, boothTheme.text1, boothTheme.text2, boothTheme.text3]) {
      expect(contrastRatio(tier, boothTheme.bg1), `${tier} on bg1`).toBeGreaterThanOrEqual(7);
      expect(contrastRatio(tier, boothTheme.bg2), `${tier} on bg2`).toBeGreaterThanOrEqual(7);
    }
  });

  it("the strongest border meets 3:1 on the ground for focus and separators", () => {
    expect(contrastRatio(boothTheme.border4, boothTheme.bg1)).toBeGreaterThanOrEqual(3);
  });

  it("raises the type scale for reading at arm's length", () => {
    expect(boothTheme.fontMd).toBeGreaterThanOrEqual(18);
    expect(boothTheme.fontXl).toBeGreaterThanOrEqual(32);
    expect(boothTheme.font3xl).toBeGreaterThanOrEqual(48);
    expect(boothTheme.fontMd).toBeGreaterThan(darkTheme.fontMd);
    expect(boothTheme.lineHeight).toBeLessThan(darkTheme.lineHeight);
  });
});
