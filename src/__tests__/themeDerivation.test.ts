// createTheme derivations, defineTheme output and the new brand/interaction
// tokens reaching CSS.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { createTheme, defaultTokens, defineTheme, tokensToCssDeclarations, withAccentAlphas } from "../tokens";
import { themeToCss, tokensToCssVars, lightTheme, darkTheme, softLightTheme, greyTheme, boothTheme } from "../themes";

const css = (rel: string) => readFileSync(resolve(__dirname, "../css", rel), "utf8");

describe("withAccentAlphas / createTheme derivations", () => {
  it("derives the five alpha steps from a hex hue and keeps explicit ones", () => {
    const t = withAccentAlphas({ green: "#112233", green20: "#custom" });
    expect(t.green5).toBe("#1122330d");
    expect(t.green10).toBe("#1122331a");
    expect(t.green20).toBe("#custom");
    expect(t.green40).toBe("#11223366");
    expect(t.green60).toBe("#11223399");
    expect(t.red5).toBeUndefined();
  });

  it("leaves non-hex hues alone", () => {
    expect(withAccentAlphas({ blue: "rgb(1,2,3)" }).blue5).toBeUndefined();
  });

  it("createTheme derives semantic aliases, accent, onAccent and colorScheme", () => {
    const t = createTheme({ bg0: "#fafafa", blue: "#1d4ed8", red: "#b91c1c" });
    expect(t.info).toBe("#1d4ed8");
    expect(t.danger).toBe("#b91c1c");
    expect(t.success).toBe(defaultTokens.success);
    expect(t.accent).toBe("#1d4ed8");
    expect(t.blue20).toBe("#1d4ed833");
    expect(t.onAccent).toBe("#fafafa");
    expect(t.colorScheme).toBe("light");
    expect(createTheme({ bg0: "#101010" }).colorScheme).toBe("dark");
  });

  it("explicit values win over derivations", () => {
    const t = createTheme({ blue: "#1d4ed8", accent: "#ff00aa", onAccent: "#ffffff", colorScheme: "dark", bg0: "#ffffff" });
    expect(t.accent).toBe("#ff00aa");
    expect(t.onAccent).toBe("#ffffff");
    expect(t.colorScheme).toBe("dark");
  });

  it("defaults preserve today's rendering", () => {
    expect(defaultTokens.accent).toBe(defaultTokens.blue);
    expect(defaultTokens.onAccent).toBe(defaultTokens.bg0);
    expect(defaultTokens.labelCase).toBe("uppercase");
    expect(defaultTokens.focusRing).toBe("2px solid var(--vf-text-0)");
    expect(defaultTokens.colorScheme).toBe("dark");
    expect(darkTheme.colorScheme).toBe("dark");
    expect(lightTheme.colorScheme).toBe("light");
    expect(softLightTheme.colorScheme).toBe("light");
    expect(greyTheme.colorScheme).toBe("dark light");
    expect(boothTheme.colorScheme).toBe("dark");
    expect(lightTheme.accent).toBe(lightTheme.blue);
  });
});

describe("tokensToCssVars / themeToCss with the new tokens", () => {
  it("emits the brand and interaction tokens and a real color-scheme", () => {
    const vars = tokensToCssVars(createTheme({ bg0: "#ffffff", accent: "#ff00aa", labelCase: "none", focusOffset: 2 })) as Record<string, string>;
    expect(vars["--vf-accent"]).toBe("#ff00aa");
    expect(vars["--vf-on-accent"]).toBe("#ffffff");
    expect(vars["--vf-label-case"]).toBe("none");
    expect(vars["--vf-focus-offset"]).toBe("2px");
    expect(vars["--vf-selection-bg"]).toBe("var(--vf-text-1)");
    expect(vars["--vf-color-scheme"]).toBe("light");
    expect(vars.colorScheme).toBe("light");
    expect(themeToCss("x", { colorScheme: "light", accent: "#f00" })).toBe('html[data-vf-theme="x"]{color-scheme:light;--vf-color-scheme:light;--vf-accent:#f00;}');
  });
});

describe("defineTheme", () => {
  it("returns tokens, cascade css, provider props and a picker option", () => {
    const t = defineTheme({
      id: "brand dark!",
      label: "Brand",
      description: "Company palette.",
      tokens: { bg0: "#0b1020", blue: "#6ea8ff" },
      density: "compact",
    });
    expect(t.id).toBe("branddark");
    expect(t.tokens.accent).toBe("#6ea8ff");
    expect(t.css.startsWith('[data-vf-theme="branddark"]{')).toBe(true);
    expect(t.css).toContain("--vf-accent:#6ea8ff;");
    expect(t.css).toContain("--vf-on-accent:#0b1020;");
    expect(t.css).toContain("--vf-font-md:12px;");
    expect(t.css).toContain("--vf-line-height:1.6;");
    expect(t.css.endsWith("color-scheme:dark;}")).toBe(true);
    expect(t.providerProps).toEqual({ themeName: "branddark", theme: t.tokens, density: "compact" });
    expect(t.option).toEqual({ id: "branddark", label: "Brand", description: "Company palette.", scheme: "dark" });
  });

  it("tokensToCssDeclarations maps colorScheme to --vf-color-scheme only", () => {
    expect(tokensToCssDeclarations({ colorScheme: "light", radius: 4 })).toBe("--vf-color-scheme:light;--vf-radius:4px;");
  });
});

describe("stylesheet consumes the new tokens", () => {
  it("defines --vf-on-accent and --vf-label-case in :root", () => {
    const t = css("tokens.css");
    expect(t).toContain("--vf-on-accent: var(--vf-bg-0);");
    expect(t).toContain("--vf-label-case: uppercase;");
  });
  it("solid buttons and badges use --vf-on-accent; labels use --vf-label-case", () => {
    expect(css("components/button.css")).toMatch(/\.vf-button--solid \{[^}]*color: var\(--vf-on-accent\);/);
    expect(css("components/data-display.css")).toContain(".vf-badge--success.vf-badge--solid { background: var(--vf-green); color: var(--vf-on-accent); }");
    expect(css("components/text.css")).toMatch(/\.vf-label \{[^}]*text-transform: var\(--vf-label-case, uppercase\);/);
  });
});
