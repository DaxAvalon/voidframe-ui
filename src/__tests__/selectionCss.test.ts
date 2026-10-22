// The page-wide ::selection rule must be token-driven and must not reach
// into embedded editors that paint their own selection layer.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const read = (p: string) => readFileSync(resolve(__dirname, "..", p), "utf8");

describe("::selection contract", () => {
  it("uses the selection tokens and excludes editors", () => {
    const base = read("css/base.css");
    const rule = base.match(/\.vf-root\s+:where\(:not\(([^)]*)\)\)::selection\s*\{([^}]*)\}/);
    expect(rule, "selection rule present").not.toBeNull();
    const excluded = rule![1]!;
    expect(excluded).toContain(".cm-editor *");
    expect(excluded).toContain(".monaco-editor *");
    expect(excluded).toContain('[data-vf-selection="native"] *');
    expect(rule![2]).toContain("var(--vf-selection-bg)");
    expect(rule![2]).toContain("var(--vf-selection-fg)");
    expect(base).not.toMatch(/\.vf-root ::selection/);
  });

  it("defines the selection tokens", () => {
    const tokens = read("css/tokens.css");
    expect(tokens).toMatch(/--vf-selection-bg:\s*var\(--vf-text-1\)/);
    expect(tokens).toMatch(/--vf-selection-fg:\s*var\(--vf-bg-0\)/);
  });
});
