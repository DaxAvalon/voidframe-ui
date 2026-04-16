import { describe, expect, it } from "vitest";
import { existsSync, readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";
// @ts-expect-error — ESM .mjs, no declarations.
import { tsFilter, tsxFilter } from "../extract-props.mjs";

// scripts/extract-props.mjs writes three JSON files into docs/data.
// A full run takes >5s and pulls in the TypeScript compiler. Instead of
// re-running the script for every test, assert that the script source
// parses and the most recent committed run produced healthy outputs.
const ROOT = resolve(__dirname, "..", "..");
const SCRIPT = resolve(ROOT, "scripts", "extract-props.mjs");
const PROPS = resolve(ROOT, "docs", "data", "props.json");
const HOOKS = resolve(ROOT, "docs", "data", "hooks.json");
const UTILS = resolve(ROOT, "docs", "data", "utils.json");

describe("scripts/extract-props.mjs", () => {
  it("script source exists and references its dependencies", () => {
    expect(existsSync(SCRIPT)).toBe(true);
    const src = readFileSync(SCRIPT, "utf-8");
    expect(src).toMatch(/^#!\/usr\/bin\/env node/);
    expect(src).toMatch(/import\s+/);
    expect(src).toContain("react-docgen-typescript");
    expect(src).toContain("typescript");
  });

  it("declares write targets for props/hooks/utils JSON", () => {
    const src = readFileSync(SCRIPT, "utf-8");
    expect(src).toContain("props.json");
    expect(src).toContain("hooks.json");
    expect(src).toContain("utils.json");
  });

  it("emits docs/data/props.json with >100 components", () => {
    expect(existsSync(PROPS)).toBe(true);
    const raw = JSON.parse(readFileSync(PROPS, "utf-8"));
    expect(Array.isArray(raw)).toBe(true);
    expect(raw.length).toBeGreaterThan(100);
  });

  it("each component entry has name, file, and props array", () => {
    const raw = JSON.parse(readFileSync(PROPS, "utf-8"));
    for (const comp of raw.slice(0, 25)) {
      expect(typeof comp.name).toBe("string");
      expect(comp.name.length).toBeGreaterThan(0);
      expect(typeof comp.file).toBe("string");
      expect(Array.isArray(comp.props)).toBe(true);
    }
  });

  it("component list is alphabetically sorted", () => {
    const raw = JSON.parse(readFileSync(PROPS, "utf-8"));
    const names: string[] = raw.map((c: { name: string }) => c.name);
    const sorted = [...names].sort((a, b) => a.localeCompare(b));
    expect(names).toEqual(sorted);
  });

  it("emits hooks.json with use-prefixed entries", () => {
    expect(existsSync(HOOKS)).toBe(true);
    const raw = JSON.parse(readFileSync(HOOKS, "utf-8"));
    expect(Array.isArray(raw)).toBe(true);
    for (const h of raw) {
      expect(
        h.name.startsWith("use") || h.name === "ShortcutProvider",
        `unexpected hook export: ${h.name}`
      ).toBe(true);
    }
  });

  it("emits utils.json", () => {
    expect(existsSync(UTILS)).toBe(true);
    const raw = JSON.parse(readFileSync(UTILS, "utf-8"));
    expect(Array.isArray(raw)).toBe(true);
  });

  it("output files are non-empty", () => {
    expect(statSync(PROPS).size).toBeGreaterThan(1024);
    expect(statSync(HOOKS).size).toBeGreaterThan(2);
    expect(statSync(UTILS).size).toBeGreaterThan(2);
  });

  it("tsxFilter accepts .tsx, rejects .test/.spec/non-tsx", () => {
    expect(tsxFilter("Foo.tsx")).toBe(true);
    expect(tsxFilter("Foo.test.tsx")).toBe(false);
    expect(tsxFilter("Foo.spec.tsx")).toBe(false);
    expect(tsxFilter("Foo.ts")).toBe(false);
    expect(tsxFilter("readme.md")).toBe(false);
  });

  it("tsFilter accepts .ts/.tsx, rejects .d.ts + tests", () => {
    expect(tsFilter("useThing.ts")).toBe(true);
    expect(tsFilter("useThing.tsx")).toBe(true);
    expect(tsFilter("useThing.d.ts")).toBe(false);
    expect(tsFilter("useThing.test.ts")).toBe(false);
    expect(tsFilter("useThing.spec.ts")).toBe(false);
  });

  it("main() runs the full pipeline end-to-end", async () => {
    // Expensive (~60-180s under coverage instrumentation) but the only
    // way to exercise the walk / docgen / AST paths and keep function
    // coverage healthy. Generous timeout because coverage instrumentation
    // roughly doubles the runtime and CI can be slow.
    // @ts-expect-error — ESM .mjs, no declarations.
    const { main } = await import("../extract-props.mjs");
    const result = await main();
    expect(result.components.length).toBeGreaterThan(100);
    expect(result.hooks.length).toBeGreaterThan(20);
    expect(result.utils.length).toBeGreaterThan(5);
  }, 300_000);
});
