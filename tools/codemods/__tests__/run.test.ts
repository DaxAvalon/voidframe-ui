import { describe, expect, it, vi } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
// @ts-expect-error — ESM .mjs has no declarations; runtime import only.
import { runCodemod, resolveTransform, TRANSFORMS } from "../run.mjs";

const ROOT = resolve(__dirname, "..", "..", "..");
const RUNNER = resolve(ROOT, "tools", "codemods", "run.mjs");

describe("tools/codemods/run.mjs", () => {
  it("script exists and has the expected shebang + dispatcher contents", () => {
    expect(existsSync(RUNNER)).toBe(true);
    const src = readFileSync(RUNNER, "utf-8");
    expect(src).toMatch(/^#!\/usr\/bin\/env node/);
    expect(src).toContain("jscodeshift");
  });

  it("TRANSFORMS enumerates the two shipped codemods", () => {
    expect(TRANSFORMS).toEqual(["legacy-charts-to-v2", "tokens-from-hex"]);
  });

  it("resolveTransform returns a path for known names and null for unknown", () => {
    expect(resolveTransform("legacy-charts-to-v2")).toBeTruthy();
    expect(resolveTransform("tokens-from-hex")).toBeTruthy();
    expect(resolveTransform("definitely-not-a-real-transform")).toBeNull();
  });

  it("runCodemod returns 2 with usage when transform is missing", () => {
    const errors: string[] = [];
    const code = runCodemod({
      transform: undefined,
      targets: [],
      log: { log: () => {}, error: (m: string) => errors.push(m) },
    });
    expect(code).toBe(2);
    expect(errors[0]).toMatch(/Usage:/);
    expect(errors[0]).toMatch(/legacy-charts-to-v2/);
  });

  it("runCodemod returns 2 when targets are empty", () => {
    const errors: string[] = [];
    const code = runCodemod({
      transform: "legacy-charts-to-v2",
      targets: [],
      log: { log: () => {}, error: (m: string) => errors.push(m) },
    });
    expect(code).toBe(2);
  });

  it("runCodemod returns 2 for an unknown transform with a useful message", () => {
    const errors: string[] = [];
    const code = runCodemod({
      transform: "definitely-not-a-real-transform",
      targets: ["foo.ts"],
      log: { log: () => {}, error: (m: string) => errors.push(m) },
    });
    expect(code).toBe(2);
    expect(errors[0]).toMatch(/Unknown transform/);
  });

  it("runCodemod invokes jscodeshift via the injected runner for valid inputs", () => {
    const runner = vi.fn().mockReturnValue({ status: 0 });
    const code = runCodemod({
      transform: "legacy-charts-to-v2",
      targets: ["src/x.tsx"],
      runner,
      log: { log: () => {}, error: () => {} },
    });
    expect(code).toBe(0);
    expect(runner).toHaveBeenCalledOnce();
    const args = runner.mock.calls[0];
    expect(args[0]).toBe("npx");
    expect(args[1][0]).toBe("jscodeshift");
    expect(args[1]).toContain("--parser=tsx");
    expect(args[1]).toContain("-t");
    expect(args[1][args[1].length - 1]).toBe("src/x.tsx");
  });

  it("runCodemod forwards a non-zero exit code from the runner", () => {
    const runner = vi.fn().mockReturnValue({ status: 5 });
    const code = runCodemod({
      transform: "tokens-from-hex",
      targets: ["src/x.tsx"],
      runner,
      log: { log: () => {}, error: () => {} },
    });
    expect(code).toBe(5);
  });

  it("runCodemod defaults a null runner status to exit code 1", () => {
    const runner = vi.fn().mockReturnValue({ status: null });
    const code = runCodemod({
      transform: "tokens-from-hex",
      targets: ["src/x.tsx"],
      runner,
      log: { log: () => {}, error: () => {} },
    });
    expect(code).toBe(1);
  });
});
