import { describe, expect, it } from "vitest";
// @ts-expect-error — ESM .mjs has no declarations; import for runtime only.
import { buildProgram } from "../bin/voidframe.mjs";

describe("voidframe CLI bin", () => {
  it("buildProgram returns a commander program", () => {
    const program = buildProgram({ exit: false });
    expect(program).toBeDefined();
    expect(typeof (program as { parseAsync: unknown }).parseAsync).toBe(
      "function"
    );
  });

  it("registers the five top-level subcommands", () => {
    const program = buildProgram({ exit: false }) as unknown as {
      commands: Array<{ name: () => string }>;
    };
    const names = program.commands.map((c) => c.name()).sort();
    expect(names).toEqual(["codemod", "doctor", "init", "test", "theme"]);
  });

  it("help output mentions the program name and every subcommand", () => {
    const program = buildProgram({ exit: false }) as unknown as {
      helpInformation: () => string;
    };
    const help = program.helpInformation();
    expect(help.toLowerCase()).toContain("voidframe");
    expect(help).toMatch(/\binit\b/);
    expect(help).toMatch(/\btheme\b/);
    expect(help).toMatch(/\bcodemod\b/);
    expect(help).toMatch(/\bdoctor\b/);
    expect(help).toMatch(/\btest\b/);
  });

  it("version info reports a semver-like string", () => {
    const program = buildProgram({ exit: false }) as unknown as {
      version: () => string;
    };
    expect(program.version()).toMatch(/\d+\.\d+\.\d+/);
  });

  it("rejects an unknown command when asked to parse", async () => {
    const program = buildProgram({ exit: false }) as unknown as {
      parseAsync: (argv: string[], opts: { from: string }) => Promise<unknown>;
    };
    await expect(
      program.parseAsync(["nonsense-command"], { from: "user" })
    ).rejects.toThrow();
  });

  it("rejects unknown options when asked to parse", async () => {
    const program = buildProgram({ exit: false }) as unknown as {
      parseAsync: (argv: string[], opts: { from: string }) => Promise<unknown>;
    };
    await expect(
      program.parseAsync(["--definitely-not-a-flag"], { from: "user" })
    ).rejects.toThrow();
  });
});
