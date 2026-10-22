import { describe, expect, it, vi } from "vitest";
import { resolveHighlightTags, voidframeEditorTheme, voidframeEditorThemeSpec } from "../theme";

describe("voidframeEditorThemeSpec", () => {
  it("uses token references for every colour and the mono font", () => {
    const spec = voidframeEditorThemeSpec();
    expect(spec.dark).toBe(true);
    expect(spec.styles["&"]!.fontFamily).toBe("var(--vf-font-mono)");
    expect(spec.styles[".cm-gutters"]!.color).toBe("var(--vf-text-3)");
    expect(JSON.stringify(spec)).not.toMatch(/#[0-9a-f]{3,8}\b/i);
    expect(spec.highlight.find((h) => h.tag.startsWith("string"))?.color).toBe("var(--vf-green)");
    const light = voidframeEditorThemeSpec({ dark: false, overrides: { ".cm-content": { padding: "0" } } });
    expect(light.dark).toBe(false);
    expect(light.styles[".cm-content"]).toEqual({ padding: "0" });
  });
});

describe("voidframeEditorTheme", () => {
  it("resolves lezer tags including modifiers and builds the extensions from injected modules", () => {
    const tags = {
      keyword: "T_keyword",
      string: "T_string",
      variableName: "T_var",
      propertyName: "T_prop",
      function: (t: unknown) => `fn(${String(t)})`,
      definition: (t: unknown) => `def(${String(t)})`,
      special: (t: unknown) => `special(${String(t)})`,
    };
    expect(resolveHighlightTags("keyword,string", tags)).toEqual(["T_keyword", "T_string"]);
    expect(resolveHighlightTags("function(variableName),function(propertyName)", tags)).toEqual(["fn(T_var)", "fn(T_prop)"]);
    expect(resolveHighlightTags("unknownTag", tags)).toEqual([]);
    const EditorView = { theme: vi.fn(() => "THEME") };
    const HighlightStyle = { define: vi.fn(() => "HL") };
    const syntaxHighlighting = vi.fn(() => "SYNTAX");
    const out = voidframeEditorTheme({ EditorView, HighlightStyle, syntaxHighlighting, tags }, { dark: false });
    expect(out).toEqual(["THEME", "SYNTAX"]);
    expect(EditorView.theme).toHaveBeenCalledWith(expect.objectContaining({ "&": expect.any(Object) }), { dark: false });
    const defs = HighlightStyle.define.mock.calls[0]![0] as Array<Record<string, unknown>>;
    expect(defs.find((d) => d.tag === "T_string")).toMatchObject({ color: "var(--vf-green)" });
    expect(defs.some((d) => Array.isArray(d.tag) && (d.tag as string[]).includes("fn(T_var)"))).toBe(true);
    expect(defs.every((d) => d.tag !== undefined)).toBe(true);
    expect(syntaxHighlighting).toHaveBeenCalledWith("HL", { fallback: true });
  });
});
