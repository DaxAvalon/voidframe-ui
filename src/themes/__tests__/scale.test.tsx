import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { createTheme, defaultTokens } from "../../tokens";
import { TYPE_SCALES, scaleTokens, scaledOverrides, roundHalf, boothPalette, boothScale, boothTheme, midnightTheme } from "../index";
import { VoidframeProvider } from "../../provider/VoidframeProvider";
import { ThemeScope } from "../../provider/ThemeScope";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("scaleTokens", () => {
  it("multiplies fonts and spacing with half-pixel rounding and leaves the rest", () => {
    const t = scaleTokens(defaultTokens, 1.25);
    expect(t.fontMd).toBe(15);          // 12 × 1.25
    expect(t.fontXs).toBe(11.5);        // 9 × 1.25 = 11.25 → 11.5
    expect(t.sp3).toBe(7.5);            // 6 × 1.25
    expect(t.readingSize).toBe(17.5);   // 14 × 1.25
    expect(t.lineHeight).toBe(defaultTokens.lineHeight);
    expect(t.bg0).toBe(defaultTokens.bg0);
    expect(defaultTokens.fontMd).toBe(12);
    expect(roundHalf(11.26)).toBe(11.5);
  });

  it("returns the same object for a factor of 1 or an invalid factor", () => {
    expect(scaleTokens(defaultTokens, 1)).toBe(defaultTokens);
    expect(scaleTokens(defaultTokens, 0)).toBe(defaultTokens);
    expect(scaleTokens(defaultTokens, NaN)).toBe(defaultTokens);
  });

  it("applies a named preset to fonts, line height and reading size only", () => {
    const t = scaleTokens(midnightTheme, "booth");
    expect(t.fontMd).toBe(TYPE_SCALES.booth.fontMd);
    expect(t.lineHeight).toBe(1.4);
    expect(t.readingSize).toBe(22);
    expect(t.sp4).toBe(midnightTheme.sp4);
    expect(t.bg0).toBe(midnightTheme.bg0);
  });

  it("applies a TypeScale object partially", () => {
    const t = scaleTokens(defaultTokens, { ...TYPE_SCALES.default, fontMd: 13 });
    expect(t.fontMd).toBe(13);
    expect(t.fontLg).toBe(14);
  });

  it("scaledOverrides lists only what changed", () => {
    const o = scaledOverrides(defaultTokens, "booth");
    expect(Object.keys(o).sort()).toEqual(
      ["font3xl", "fontLg", "fontMd", "fontSm", "fontXl", "fontXs", "fontXxl", "fontXxs", "lineHeight", "readingSize"].sort()
    );
    expect(scaledOverrides(defaultTokens, 1)).toEqual({});
  });
});

describe("booth = palette + scale", () => {
  it("boothTheme composes boothPalette and boothScale; the scale is TYPE_SCALES.booth", () => {
    expect(boothScale).toEqual(TYPE_SCALES.booth);
    expect(boothTheme).toEqual(createTheme({ ...boothPalette, ...boothScale, radius: 0 }));
    expect(boothPalette.fontMd).toBeUndefined();
    expect(boothTheme.readingMeasure).toBe("60ch");
  });

  it("the booth scale on another palette is one call", () => {
    const t = scaleTokens(midnightTheme, "booth");
    expect(t.bg0).toBe(midnightTheme.bg0);
    expect(t.font3xl).toBe(48);
  });
});

describe("reading tokens", () => {
  it("have defaults, derive the colour from text1, and reach the stylesheet", () => {
    expect(defaultTokens.readingSize).toBe(14);
    expect(defaultTokens.readingMeasure).toBe("65ch");
    expect(defaultTokens.readingColor).toBe(defaultTokens.text1);
    expect(createTheme({ text1: "#abcdef" }).readingColor).toBe("#abcdef");
    const css = readFileSync(resolve(__dirname, "../../css/tokens.css"), "utf8");
    expect(css).toContain("--vf-reading-size: 14px;");
    expect(css).toContain("--vf-reading-measure: 65ch;");
    expect(css).toContain("--vf-reading-color: var(--vf-text-1);");
    const text = readFileSync(resolve(__dirname, "../../css/components/text.css"), "utf8");
    expect(text).toMatch(/\.vf-reading \{[^}]*font-size: var\(--vf-reading-size\);/);
  });
});

describe("scale on the provider and ThemeScope", () => {
  it("provider emits scaled vars inline and for portals, and marks data-vf-scale", () => {
    render(
      <VoidframeProvider themeName="midnight" scale="booth">
        <span>x</span>
      </VoidframeProvider>
    );
    const root = document.querySelector(".vf-root") as HTMLElement;
    expect(root.getAttribute("data-vf-scale")).toBe("booth");
    expect(root.style.getPropertyValue("--vf-font-md")).toBe("18px");
    expect(root.style.getPropertyValue("--vf-line-height")).toBe("1.4");
    expect(root.style.getPropertyValue("--vf-bg-0")).toBe("");
    const el = document.head.querySelector('style[data-vf-theme-vars="midnight"]');
    expect(el?.textContent).toContain("--vf-font-md:18px;");
    el?.remove();
  });

  it("a numeric scale rounds to half pixels and combines with theme overrides", () => {
    render(
      <VoidframeProvider scale={1.5} theme={{ bg1: "#123456" }} scope="root">
        <span>x</span>
      </VoidframeProvider>
    );
    const root = document.querySelectorAll(".vf-root");
    const el = root[root.length - 1] as HTMLElement;
    expect(el.getAttribute("data-vf-scale")).toBe("1.5");
    expect(el.style.getPropertyValue("--vf-font-xs")).toBe("13.5px");
    expect(el.style.getPropertyValue("--vf-sp-1")).toBe("3px");
    expect(el.style.getPropertyValue("--vf-bg-1")).toBe("#123456");
  });

  it("ThemeScope scales its subtree only", () => {
    render(
      <VoidframeProvider scope="root">
        <ThemeScope scale="booth" data-testid="scope">
          <span>y</span>
        </ThemeScope>
      </VoidframeProvider>
    );
    const scope = document.querySelector("[data-testid='scope']") as HTMLElement;
    expect(scope.getAttribute("data-vf-scale")).toBe("booth");
    expect(scope.style.getPropertyValue("--vf-font-3xl")).toBe("48px");
  });
});
