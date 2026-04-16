import { describe, expect, it, vi } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
// @ts-expect-error — ESM .mjs, no declarations.
import { packageExtension, step, paths } from "../package-vscode.mjs";

// scripts/package-vscode.mjs shells out to `vsce`, which is a heavy
// devDep we don't want to invoke during unit tests. Instead we exercise
// the exported packager with injected runners to cover each step.
const ROOT = resolve(__dirname, "..", "..");
const SCRIPT = resolve(ROOT, "scripts", "package-vscode.mjs");

describe("scripts/package-vscode.mjs", () => {
  it("exists with a node shebang", () => {
    expect(existsSync(SCRIPT)).toBe(true);
    const src = readFileSync(SCRIPT, "utf-8");
    expect(src).toMatch(/^#!\/usr\/bin\/env node/);
  });

  it("uses ESM imports (type: module compatible)", () => {
    const src = readFileSync(SCRIPT, "utf-8");
    expect(src).toMatch(/import\s+\{[^}]+\}\s+from\s+"node:/);
    expect(src).not.toMatch(/^require\(/m);
  });

  it("exports the repo + extension paths", () => {
    expect(paths.repoRoot).toBe(ROOT);
    expect(paths.extDir).toContain("vscode-voidframe");
  });

  it("step() logs the label and runs the callback", () => {
    const calls: string[] = [];
    const fn = vi.fn();
    step(
      "sample",
      fn,
      { log: (m: string) => calls.push(m) } as unknown as Console
    );
    expect(fn).toHaveBeenCalledOnce();
    expect(calls[0]).toContain("[sample]");
  });

  it("packageExtension walks all three steps with the injected runner", () => {
    const logs: string[] = [];
    const runner = vi.fn().mockReturnValue({ status: 0 });
    const copy = vi.fn();
    const ensureDir = vi.fn();
    packageExtension({
      runner,
      copy,
      ensureDir,
      log: { log: (m: string) => logs.push(m) } as unknown as Console,
      exit: () => {
        throw new Error("should not exit on 0 status");
      },
    });
    expect(runner).toHaveBeenCalledTimes(2); // snippets + vsce
    expect(copy).toHaveBeenCalledOnce();
    expect(ensureDir).toHaveBeenCalledOnce();
    const combined = logs.join("\n");
    expect(combined).toContain("regenerate snippets");
    expect(combined).toContain("bundle props.json");
    expect(combined).toContain("package .vsix");
  });

  it("packageExtension calls exit when a step fails", () => {
    const runner = vi.fn().mockReturnValueOnce({ status: 5 });
    const exit = vi.fn((code: number) => {
      // Simulate process.exit by throwing — the real one halts execution.
      throw new Error(`__exit__${code}`);
    });
    expect(() =>
      packageExtension({
        runner,
        copy: vi.fn(),
        ensureDir: vi.fn(),
        log: { log: () => {} } as unknown as Console,
        exit,
      })
    ).toThrow(/__exit__5/);
    expect(exit).toHaveBeenCalledWith(5);
  });
});
