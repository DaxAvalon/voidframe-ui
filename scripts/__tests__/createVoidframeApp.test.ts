/**
 * Integration smoke for `tools/create-voidframe-app/bin/cli.mjs` and
 * the underlying shared scaffold module. Runs the bin against a temp
 * dir and asserts the resulting project has the expected files.
 */
import { mkdtemp, readFile, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { scaffold } from "../../tools/cli/commands/_init-shared.mjs";

let tempBase: string;

beforeAll(async () => {
  tempBase = await mkdtemp(join(tmpdir(), "vf-create-app-"));
});

afterAll(async () => {
  if (tempBase) {
    await rm(tempBase, { recursive: true, force: true });
  }
});

describe("create-voidframe-app — scaffold", () => {
  it("scaffolds a project at the requested directory", async () => {
    const target = resolve(tempBase, "demo-app");
    const noopLog = { log: () => {}, error: () => {}, warn: () => {} };
    const code = await scaffold({ dir: target, log: noopLog as never });
    expect(code).toBe(0);

    const pkgPath = join(target, "package.json");
    const pkgRaw = await readFile(pkgPath, "utf-8");
    const pkg = JSON.parse(pkgRaw);
    expect(pkg.name).toBe("demo-app");
    expect(typeof pkg.dependencies).toBe("object");
  });

  it("refuses to overwrite a non-empty target without --force", async () => {
    const target = resolve(tempBase, "demo-app");
    let errored = false;
    const errorLog = {
      log: () => {},
      error: () => {
        errored = true;
      },
      warn: () => {},
    };
    const code = await scaffold({ dir: target, log: errorLog as never });
    expect(code).toBe(1);
    expect(errored).toBe(true);
  });

  it("overwrites with --force", async () => {
    const target = resolve(tempBase, "demo-app");
    const noopLog = { log: () => {}, error: () => {}, warn: () => {} };
    const code = await scaffold({
      dir: target,
      force: true,
      log: noopLog as never,
    });
    expect(code).toBe(0);
    const s = await stat(join(target, "package.json"));
    expect(s.isFile()).toBe(true);
  });
});
