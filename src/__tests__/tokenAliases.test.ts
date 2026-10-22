// The semantic alias tokens exist once, globally, and point at the tiers.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const css = readFileSync(resolve(__dirname, "../css/tokens.css"), "utf8");

describe("semantic alias tokens", () => {
  it.each([
    ["--vf-text-muted", "var(--vf-text-3)"],
    ["--vf-text-subtle", "var(--vf-text-4)"],
    ["--vf-border", "var(--vf-border-1)"],
    ["--vf-border-strong", "var(--vf-border-3)"],
    ["--vf-accent-success", "var(--vf-success)"],
    ["--vf-accent-warning", "var(--vf-warning)"],
    ["--vf-accent-danger", "var(--vf-danger)"],
    ["--vf-accent-info", "var(--vf-info)"],
    ["--vf-surface-1", "var(--vf-bg-1)"],
  ])("%s → %s", (name, value) => {
    expect(css).toContain(`${name}: ${value};`);
  });

  it("defines a translucent surface and the scrim tokens", () => {
    expect(css).toMatch(/--vf-surface-translucent: color-mix\(in srgb, var\(--vf-bg-1\) \d+%, transparent\);/);
    expect(css).toContain("--vf-scrim:");
    expect(css).toContain("--vf-scrim-strong:");
  });

  it("declares the aliases exactly once, in a :root block", () => {
    expect(css.match(/--vf-text-muted:/g)?.length).toBe(1);
    const i = css.indexOf("--vf-text-muted:");
    const block = css.lastIndexOf(":root {", i);
    expect(block).toBeGreaterThan(-1);
  });
});
