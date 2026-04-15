import { describe, expect, it } from "vitest";
// @ts-expect-error — plain CJS module, no types.
import { loadIndex, buildHoverMarkdown, formatProps } from "../src/docs.js";

const fixture = [
  {
    name: "Button",
    description: "Clickable button.",
    props: [
      { name: "variant", type: '"default" | "primary"', defaultValue: '"default"' },
      { name: "onClick", type: "() => void", required: true },
    ],
  },
  {
    name: "Badge",
    description: "Inline label.",
    props: [],
  },
];

describe("vscode-voidframe docs helpers", () => {
  it("loadIndex returns a Map keyed by name", () => {
    const idx = loadIndex(fixture);
    expect(idx.has("Button")).toBe(true);
    expect(idx.has("Badge")).toBe(true);
    expect(idx.has("Unknown")).toBe(false);
  });

  it("loadIndex handles non-array input", () => {
    expect(loadIndex(null).size).toBe(0);
    expect(loadIndex(undefined).size).toBe(0);
    expect(loadIndex({}).size).toBe(0);
  });

  it("buildHoverMarkdown includes the description and prop table", () => {
    const idx = loadIndex(fixture);
    const md = buildHoverMarkdown(idx, "Button");
    expect(md).toContain("voidframe · Button");
    expect(md).toContain("Clickable button.");
    expect(md).toContain("Required props");
    expect(md).toContain("`onClick`");
    expect(md).toContain("Optional props");
    expect(md).toContain("`variant`");
  });

  it("buildHoverMarkdown returns null for unknown names", () => {
    const idx = loadIndex(fixture);
    expect(buildHoverMarkdown(idx, "DoesNotExist")).toBeNull();
  });

  it("formatProps handles the empty case", () => {
    const out = formatProps([]);
    expect(out).toContain("No documented props");
  });

  it("formatProps truncates long optional lists", () => {
    const many = Array.from({ length: 20 }, (_, i) => ({
      name: `p${i}`,
      type: "string",
    }));
    const out = formatProps(many);
    expect(out).toContain("…and 8 more");
  });
});
