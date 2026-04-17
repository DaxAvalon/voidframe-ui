import { describe, expect, it, beforeAll, afterAll } from "vitest";
import { execFileSync } from "child_process";
import { existsSync, readFileSync, rmSync, mkdirSync } from "fs";
import { resolve } from "path";

const outDir = resolve("dist/tokens");
const script = resolve("scripts/export-tokens.mjs");

describe("export-tokens", () => {
  beforeAll(() => {
    // Clean output
    if (existsSync(outDir)) rmSync(outDir, { recursive: true });
  });

  afterAll(() => {
    // Clean up
    if (existsSync(outDir)) rmSync(outDir, { recursive: true });
  });

  it("generates JSON with all token categories", () => {
    execFileSync("node", [script, "--format", "json"]);
    const json = JSON.parse(readFileSync(resolve(outDir, "tokens.json"), "utf-8"));
    expect(json).toHaveProperty("color");
    expect(json).toHaveProperty("spacing");
    expect(json).toHaveProperty("typography");
    expect(json.color).toHaveProperty("surface");
    expect(json.color).toHaveProperty("accent");
  });

  it("JSON values are Style Dictionary compatible (have value + type)", () => {
    const json = JSON.parse(readFileSync(resolve(outDir, "tokens.json"), "utf-8"));
    expect(json.color.surface.bg0).toHaveProperty("value");
    expect(json.color.surface.bg0).toHaveProperty("type");
    expect(json.color.surface.bg0.type).toBe("color");
  });

  it("generates SCSS with $vf- variables", () => {
    execFileSync("node", [script, "--format", "scss"]);
    const scss = readFileSync(resolve(outDir, "tokens.scss"), "utf-8");
    expect(scss).toContain("$vf-bg0:");
    expect(scss).toContain("$vf-green:");
    expect(scss).toContain("$vf-sp1:");
  });

  it("generates CSS with --vf- properties", () => {
    execFileSync("node", [script, "--format", "css"]);
    const css = readFileSync(resolve(outDir, "tokens.css"), "utf-8");
    expect(css).toContain("--vf-bg-0:");
    expect(css).toContain('[data-vf-theme="dark"]');
    expect(css).toContain('[data-vf-theme="light"]');
  });

  it("generates Figma variables with all themes", () => {
    execFileSync("node", [script, "--format", "figma"]);
    const figma = JSON.parse(readFileSync(resolve(outDir, "figma-variables.json"), "utf-8"));
    expect(figma.variableCollections).toHaveLength(1);
    expect(figma.variableCollections[0].modes).toHaveLength(2); // dark + light
    expect(figma.variableCollections[0].variables.length).toBeGreaterThan(0);
  });

  it("--format all generates all 4 files", () => {
    if (existsSync(outDir)) rmSync(outDir, { recursive: true });
    execFileSync("node", [script, "--format", "all"]);
    expect(existsSync(resolve(outDir, "tokens.json"))).toBe(true);
    expect(existsSync(resolve(outDir, "tokens.scss"))).toBe(true);
    expect(existsSync(resolve(outDir, "tokens.css"))).toBe(true);
    expect(existsSync(resolve(outDir, "figma-variables.json"))).toBe(true);
  });

  it("Figma variables have RGBA values", () => {
    const figma = JSON.parse(readFileSync(resolve(outDir, "figma-variables.json"), "utf-8"));
    const firstVar = figma.variableCollections[0].variables[0];
    const darkValue = firstVar.valuesByMode.dark;
    expect(darkValue).toHaveProperty("r");
    expect(darkValue).toHaveProperty("g");
    expect(darkValue).toHaveProperty("b");
    expect(darkValue).toHaveProperty("a");
  });
});
