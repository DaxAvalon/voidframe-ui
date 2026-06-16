import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { mkdtempSync, rmSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { initCommand } from "../commands/init.mjs";

describe("init command", () => {
  let dir: string;
  const silentLog = {
    log: () => {},
    error: () => {},
  };

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), "vf-init-"));
  });
  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it("scaffolds package.json, index.html, src/", async () => {
    const code = await initCommand({ dir, force: true, log: silentLog });
    expect(code).toBe(0);
    expect(existsSync(join(dir, "package.json"))).toBe(true);
    expect(existsSync(join(dir, "index.html"))).toBe(true);
    expect(existsSync(join(dir, "src", "App.tsx"))).toBe(true);
    expect(existsSync(join(dir, "src", "main.tsx"))).toBe(true);
  });

  it("sets package.json name from directory basename", async () => {
    await initCommand({ dir, force: true, log: silentLog });
    const pkg = JSON.parse(readFileSync(join(dir, "package.json"), "utf-8"));
    expect(pkg.name).toMatch(/^vf-init-/);
  });

  it("wires voidframe-ui, react, react-dom deps", async () => {
    await initCommand({ dir, force: true, log: silentLog });
    const pkg = JSON.parse(readFileSync(join(dir, "package.json"), "utf-8"));
    expect(pkg.dependencies).toHaveProperty("voidframe-ui");
    expect(pkg.dependencies).toHaveProperty("react");
    expect(pkg.dependencies).toHaveProperty("react-dom");
  });

  it("main.tsx imports voidframe-ui/styles.css", async () => {
    await initCommand({ dir, force: true, log: silentLog });
    const main = readFileSync(join(dir, "src", "main.tsx"), "utf-8");
    expect(main).toContain("voidframe-ui/styles.css");
  });

  it("scaffolds the Next.js (App Router) template with --template next", async () => {
    const code = await initCommand({
      dir,
      force: true,
      template: "next",
      log: silentLog,
    });
    expect(code).toBe(0);
    expect(existsSync(join(dir, "package.json"))).toBe(true);
    expect(existsSync(join(dir, "next.config.mjs"))).toBe(true);
    expect(existsSync(join(dir, "app", "layout.tsx"))).toBe(true);
    expect(existsSync(join(dir, "app", "page.tsx"))).toBe(true);
    // No Vite SPA entrypoints in a Next project.
    expect(existsSync(join(dir, "src", "main.tsx"))).toBe(false);
  });

  it("the Next template wires next + voidframe deps and SSR theme handling", async () => {
    await initCommand({ dir, force: true, template: "next", log: silentLog });
    const pkg = JSON.parse(readFileSync(join(dir, "package.json"), "utf-8"));
    expect(pkg.dependencies).toHaveProperty("next");
    expect(pkg.dependencies).toHaveProperty("voidframe-ui");
    const layout = readFileSync(join(dir, "app", "layout.tsx"), "utf-8");
    expect(layout).toContain("voidframe-ui/styles.css");
    expect(layout).toContain("VoidframeProvider");
    // Pre-hydration theme script + suppressed hydration warning.
    expect(layout).toContain("data-vf-theme");
    expect(layout).toContain("suppressHydrationWarning");
  });

  it("rejects an unknown template", async () => {
    const errors: string[] = [];
    const code = await initCommand({
      dir,
      force: true,
      template: "svelte",
      log: { log: () => {}, error: (m: string) => errors.push(m) },
    });
    expect(code).toBe(1);
    expect(errors[0]).toMatch(/Unknown template/);
  });

  it("defaults to the Vite (app) template when none is given", async () => {
    await initCommand({ dir, force: true, log: silentLog });
    expect(existsSync(join(dir, "src", "main.tsx"))).toBe(true);
    expect(existsSync(join(dir, "app", "layout.tsx"))).toBe(false);
  });

  it("refuses to overwrite a non-empty directory without --force", async () => {
    const { writeFileSync } = await import("node:fs");
    writeFileSync(join(dir, "existing.txt"), "hi");
    const errors: string[] = [];
    const code = await initCommand({
      dir,
      force: false,
      log: { log: () => {}, error: (m: string) => errors.push(m) },
    });
    expect(code).toBe(1);
    expect(errors[0]).toMatch(/already exists/);
  });
});
