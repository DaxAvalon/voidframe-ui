import { describe, expect, it } from "vitest";
import { codemodCommand } from "../commands/codemod.mjs";

describe("codemod command", () => {
  const silent = (errs: string[]) => ({
    log: () => {},
    error: (m: string) => errs.push(m),
  });

  it("rejects a missing codemod name with code 2", async () => {
    const errs: string[] = [];
    const code = await codemodCommand({
      name: undefined,
      paths: ["foo.tsx"],
      log: silent(errs),
    });
    expect(code).toBe(2);
    expect(errs[0]).toMatch(/Missing codemod name/);
  });

  it("rejects an empty-string codemod name with code 2", async () => {
    const errs: string[] = [];
    const code = await codemodCommand({
      name: "",
      paths: ["foo.tsx"],
      log: silent(errs),
    });
    expect(code).toBe(2);
  });

  it("rejects an unknown codemod name with code 2", async () => {
    const errs: string[] = [];
    const code = await codemodCommand({
      name: "definitely-not-a-real-transform",
      paths: ["foo.tsx"],
      log: silent(errs),
    });
    expect(code).toBe(2);
    expect(errs[0]).toMatch(/Unknown codemod/);
  });

  it("rejects missing paths array with code 2", async () => {
    const errs: string[] = [];
    const code = await codemodCommand({
      name: "legacy-charts-to-v2",
      paths: undefined,
      log: silent(errs),
    });
    expect(code).toBe(2);
    expect(errs[0]).toMatch(/No paths/);
  });

  it("rejects empty paths array with code 2", async () => {
    const errs: string[] = [];
    const code = await codemodCommand({
      name: "legacy-charts-to-v2",
      paths: [],
      log: silent(errs),
    });
    expect(code).toBe(2);
    expect(errs[0]).toMatch(/No paths/);
  });

  it("error suggestion lists the known codemod names", async () => {
    const errs: string[] = [];
    await codemodCommand({ name: undefined, paths: [], log: silent(errs) });
    expect(errs[0]).toContain("legacy-charts-to-v2");
    expect(errs[0]).toContain("tokens-from-hex");
  });
});
