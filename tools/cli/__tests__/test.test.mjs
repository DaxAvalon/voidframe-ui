import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { existsSync, unlinkSync, readFileSync, mkdirSync } from "fs";
import { resolve } from "path";
import { generateTest } from "../commands/test.mjs";

describe("generateTest", () => {
  const cleanup = [];

  afterEach(() => {
    for (const f of cleanup) {
      if (existsSync(f)) unlinkSync(f);
    }
    cleanup.length = 0;
  });

  it("generates component test for existing component", () => {
    const { testPath } = generateTest("Button", { force: true });
    cleanup.push(testPath);
    expect(existsSync(testPath)).toBe(true);
    const content = readFileSync(testPath, "utf-8");
    expect(content).toContain("import { Button }");
    expect(content).toContain("renderWithTheme");
    expect(content).toContain("expectNoA11yViolations");
  });

  it("detects variant prop and generates it.each", () => {
    const { testPath } = generateTest("Button", { force: true });
    cleanup.push(testPath);
    const content = readFileSync(testPath, "utf-8");
    expect(content).toContain("it.each");
    expect(content).toContain("variant");
  });

  it("generates hook test", () => {
    const { testPath } = generateTest("useEscapeKey", { type: "hook", force: true });
    cleanup.push(testPath);
    const content = readFileSync(testPath, "utf-8");
    expect(content).toContain("renderHook");
    expect(content).toContain("useEscapeKey");
  });

  it("generates util test", () => {
    const { testPath } = generateTest("cx", { type: "util", force: true });
    cleanup.push(testPath);
    const content = readFileSync(testPath, "utf-8");
    expect(content).toContain("import { cx }");
  });

  it("throws when source not found", () => {
    expect(() => generateTest("NonExistent")).toThrow("Source file not found");
  });

  it("throws when test exists without --force", () => {
    // Button.test.tsx already exists
    expect(() => generateTest("Button")).toThrow("already exists");
  });

  it("--force overwrites existing", () => {
    const { testPath } = generateTest("Button", { force: true });
    cleanup.push(testPath);
    expect(existsSync(testPath)).toBe(true);
  });
});
