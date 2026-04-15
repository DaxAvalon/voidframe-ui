import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { mkdtempSync, rmSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { themeCommand } from "../commands/theme.mjs";

describe("theme command", () => {
  let dir: string;
  const silentLog = { log: () => {}, error: () => {} };

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), "vf-theme-"));
  });
  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it("writes a theme override file referencing the base theme", async () => {
    const out = join(dir, "voidframe.theme.ts");
    const code = await themeCommand({ name: "dark", out, log: silentLog });
    expect(code).toBe(0);
    expect(existsSync(out)).toBe(true);
    const contents = readFileSync(out, "utf-8");
    expect(contents).toContain("darkTheme");
    expect(contents).toContain("ThemeOverrides");
  });

  it("accepts each known theme name", async () => {
    for (const name of ["dark", "light", "midnight", "grey"]) {
      const out = join(dir, `${name}.ts`);
      const code = await themeCommand({ name, out, log: silentLog });
      expect(code).toBe(0);
      expect(readFileSync(out, "utf-8")).toContain(`${name}Theme`);
    }
  });

  it("rejects an unknown theme name", async () => {
    const errors: string[] = [];
    const code = await themeCommand({
      name: "obsidian",
      out: join(dir, "x.ts"),
      log: { log: () => {}, error: (m: string) => errors.push(m) },
    });
    expect(code).toBe(2);
    expect(errors[0]).toMatch(/Unknown theme/);
  });
});
