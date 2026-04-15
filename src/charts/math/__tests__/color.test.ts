import { describe, expect, it } from "vitest";
import { defaultSeriesPalette, seriesPalette } from "../color";

describe("seriesPalette", () => {
  it("returns n theme-token strings", () => {
    const p = seriesPalette(3);
    expect(p).toHaveLength(3);
    for (const c of p) expect(c.startsWith("var(--")).toBe(true);
  });

  it("cycles when n exceeds the default palette", () => {
    const base = defaultSeriesPalette();
    const p = seriesPalette(base.length + 2);
    expect(p[base.length]).toBe(base[0]);
    expect(p[base.length + 1]).toBe(base[1]);
  });

  it("overrides the first color via accent", () => {
    const p = seriesPalette(3, { accent: "var(--vf-rose)" });
    expect(p[0]).toBe("var(--vf-rose)");
  });

  it("uses an explicit palette when provided", () => {
    const p = seriesPalette(2, { palette: ["red", "blue"] });
    expect(p).toEqual(["red", "blue"]);
  });
});
