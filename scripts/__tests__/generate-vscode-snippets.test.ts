import { describe, expect, it } from "vitest";
import { existsSync, readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";
// @ts-expect-error — ESM .mjs, no declarations.
import {
  buildSnippets,
  main,
  shortDescription,
} from "../generate-vscode-snippets.mjs";

const ROOT = resolve(__dirname, "..", "..");
const SCRIPT = resolve(ROOT, "scripts", "generate-vscode-snippets.mjs");
const OUT = resolve(
  ROOT,
  "tools",
  "vscode-voidframe",
  "snippets",
  "voidframe.code-snippets"
);

describe("scripts/generate-vscode-snippets.mjs", () => {
  it("script exists with shebang and references props.json", () => {
    expect(existsSync(SCRIPT)).toBe(true);
    const src = readFileSync(SCRIPT, "utf-8");
    expect(src).toMatch(/^#!\/usr\/bin\/env node/);
    expect(src).toContain("props.json");
    expect(src).toContain("voidframe.code-snippets");
  });

  it("buildSnippets skips entries without a capitalized name or props array", () => {
    const { snippets, count } = buildSnippets([
      { name: "Button", description: "a button", props: [] },
      { name: "lowerCase", description: "skipped", props: [] },
      { name: "NoProps", description: "skipped" },
      { name: "", description: "skipped", props: [] },
    ]);
    expect(count).toBe(1);
    expect(Object.keys(snippets)).toEqual(["Button"]);
  });

  it("buildSnippets produces prefix tuple + body array + scope for every entry", () => {
    const { snippets } = buildSnippets([
      { name: "Card", description: "c", props: [] },
      {
        name: "Foo",
        description: "f",
        props: [{ name: "bar", type: "string", required: true }],
      },
    ]);
    expect(snippets.Card.prefix).toEqual(["vf-card", "Card"]);
    expect(Array.isArray(snippets.Card.body)).toBe(true);
    expect(snippets.Card.scope).toContain("typescriptreact");
    expect(snippets.Foo.body.join("\n")).toContain("<Foo");
  });

  it("shortDescription truncates long descriptions to <=160 chars", () => {
    const long = "x".repeat(300);
    const out = shortDescription(long);
    expect(out && out.length).toBeLessThanOrEqual(160);
  });

  it("shortDescription trims to the first paragraph break", () => {
    const out = shortDescription("First line.\n\nSecond paragraph.");
    expect(out).toBe("First line.");
  });

  it("running main() writes a non-empty snippet file", () => {
    const before = existsSync(OUT) ? statSync(OUT).mtimeMs : 0;
    main();
    expect(existsSync(OUT)).toBe(true);
    const after = statSync(OUT).mtimeMs;
    expect(after).toBeGreaterThanOrEqual(before);
    expect(statSync(OUT).size).toBeGreaterThan(1024);
  });

  it("committed output is valid JSON with snippet shape", () => {
    const raw = JSON.parse(readFileSync(OUT, "utf-8"));
    const entries = Object.entries(raw) as Array<
      [string, { prefix: string[]; body: string[]; scope: string }]
    >;
    expect(entries.length).toBeGreaterThan(100);
    for (const [name, snippet] of entries.slice(0, 10)) {
      expect(typeof name).toBe("string");
      expect(Array.isArray(snippet.prefix)).toBe(true);
      expect(snippet.prefix).toContain(`vf-${name.toLowerCase()}`);
      expect(snippet.prefix).toContain(name);
      expect(Array.isArray(snippet.body)).toBe(true);
      expect(snippet.body.length).toBeGreaterThan(0);
      expect(snippet.scope).toContain("typescriptreact");
    }
  });
});
