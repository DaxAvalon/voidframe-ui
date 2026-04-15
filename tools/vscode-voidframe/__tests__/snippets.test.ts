import { describe, expect, it } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

// The generator writes this file whenever `scripts/generate-vscode-snippets.mjs`
// runs. The test verifies the file's shape and that at least a handful of
// well-known components round-tripped into it.
const SNIPPET_PATH = join(
  __dirname,
  "..",
  "snippets",
  "voidframe.code-snippets"
);

describe("generated VS Code snippets", () => {
  it("exists on disk", () => {
    expect(existsSync(SNIPPET_PATH)).toBe(true);
  });

  it("contains entries for canonical components", () => {
    const raw = JSON.parse(readFileSync(SNIPPET_PATH, "utf-8"));
    for (const name of ["Button", "Badge", "Tabs", "Select", "Dialog"]) {
      expect(raw[name]).toBeDefined();
      expect(Array.isArray(raw[name].prefix)).toBe(true);
      expect(raw[name].prefix).toContain(`vf-${name.toLowerCase()}`);
      expect(raw[name].prefix).toContain(name);
    }
  });

  it("all snippets have a body array", () => {
    const raw = JSON.parse(readFileSync(SNIPPET_PATH, "utf-8"));
    const entries = Object.values(raw) as Array<{ body: string[] }>;
    expect(entries.length).toBeGreaterThan(100);
    for (const entry of entries) {
      expect(Array.isArray(entry.body)).toBe(true);
      expect(entry.body.length).toBeGreaterThan(0);
    }
  });

  it("bodies open and close the component tag", () => {
    const raw = JSON.parse(readFileSync(SNIPPET_PATH, "utf-8"));
    const joined = raw.Button.body.join("\n");
    expect(joined).toContain("<Button");
    // Button has children, so closing tag should appear.
    expect(joined).toMatch(/<\/Button>|<Button[\s\S]*\/>/);
  });

  it("scope field targets TS/TSX/JS/JSX languages", () => {
    const raw = JSON.parse(readFileSync(SNIPPET_PATH, "utf-8"));
    const button = raw.Button;
    expect(button.scope).toContain("typescriptreact");
    expect(button.scope).toContain("javascriptreact");
  });
});
