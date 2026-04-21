import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { mkdtempSync, rmSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { doctorCommand } from "../commands/doctor.mjs";

function pkg(cwd: string, deps: Record<string, string>, devDeps: Record<string, string> = {}) {
  writeFileSync(
    join(cwd, "package.json"),
    JSON.stringify({ name: "t", dependencies: deps, devDependencies: devDeps }, null, 2)
  );
}

describe("doctor command", () => {
  let cwd: string;
  beforeEach(() => {
    cwd = mkdtempSync(join(tmpdir(), "vf-doctor-"));
  });
  afterEach(() => {
    rmSync(cwd, { recursive: true, force: true });
  });

  it("passes when everything is in order", async () => {
    pkg(cwd, {
      "voidframe-ui": "^1.0.0",
      react: "^18.2.0",
      "react-dom": "^18.2.0",
    });
    mkdirSync(join(cwd, "src"));
    writeFileSync(
      join(cwd, "src", "main.tsx"),
      `import "voidframe-ui/styles.css";`
    );
    const code = await doctorCommand({
      cwd,
      log: { log: () => {}, error: () => {} },
    });
    expect(code).toBe(0);
  });

  it("fails when voidframe-ui is missing", async () => {
    pkg(cwd, { react: "^18.2.0", "react-dom": "^18.2.0" });
    const errors: string[] = [];
    const code = await doctorCommand({
      cwd,
      log: { log: () => {}, error: (m: string) => errors.push(m) },
    });
    expect(code).toBe(1);
    expect(errors.some((e) => /voidframe-ui installed/.test(e))).toBe(true);
  });

  it("fails when react is below 18", async () => {
    pkg(cwd, {
      "voidframe-ui": "^1.0.0",
      react: "^17.0.0",
      "react-dom": "^17.0.0",
    });
    const errors: string[] = [];
    const code = await doctorCommand({
      cwd,
      log: { log: () => {}, error: (m: string) => errors.push(m) },
    });
    expect(code).toBe(1);
    expect(errors.some((e) => /react >= 18/.test(e))).toBe(true);
  });

  it("flags missing voidframe-ui/styles.css import", async () => {
    pkg(cwd, {
      "voidframe-ui": "^1.0.0",
      react: "^18.2.0",
      "react-dom": "^18.2.0",
    });
    const errors: string[] = [];
    const code = await doctorCommand({
      cwd,
      log: { log: () => {}, error: (m: string) => errors.push(m) },
    });
    expect(code).toBe(1);
    expect(errors.some((e) => /voidframe-ui\/styles\.css/.test(e))).toBe(true);
  });
});
