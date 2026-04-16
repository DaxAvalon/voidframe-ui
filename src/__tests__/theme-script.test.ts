import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import vm from "node:vm";

const SCRIPT_PATH = resolve(__dirname, "..", "..", "theme-script.js");
const SCRIPT_SRC = readFileSync(SCRIPT_PATH, "utf-8");

function runScriptIn(env: {
  localStorage?: Storage | { getItem: (k: string) => string | null };
  matchMedia?: (q: string) => { matches: boolean };
  documentElement?: { setAttribute: (k: string, v: string) => void };
}) {
  const documentElement =
    env.documentElement ?? {
      _attrs: {} as Record<string, string>,
      setAttribute(k: string, v: string) {
        (this as unknown as { _attrs: Record<string, string> })._attrs[k] = v;
      },
    };
  const win = {
    localStorage: env.localStorage,
    matchMedia: env.matchMedia,
    document: { documentElement },
  };
  const ctx = vm.createContext({
    window: win,
    localStorage: env.localStorage,
    document: win.document,
  });
  vm.runInContext(SCRIPT_SRC, ctx);
  return documentElement as unknown as { _attrs: Record<string, string> };
}

describe("theme-script.js", () => {
  let originalDataset: string | null;

  beforeEach(() => {
    originalDataset = document.documentElement.getAttribute("data-vf-theme");
    document.documentElement.removeAttribute("data-vf-theme");
  });
  afterEach(() => {
    if (originalDataset === null)
      document.documentElement.removeAttribute("data-vf-theme");
    else document.documentElement.setAttribute("data-vf-theme", originalDataset);
  });

  it("file is wrapped in an IIFE named voidframeThemeScript", () => {
    expect(SCRIPT_SRC).toMatch(/\(function voidframeThemeScript\(\)\s*\{/);
    expect(SCRIPT_SRC).toMatch(/\}\)\(\);/);
  });

  it("references the voidframe-theme localStorage key", () => {
    expect(SCRIPT_SRC).toContain('"voidframe-theme"');
  });

  it("wraps body in try/catch so blocked storage doesn't throw", () => {
    expect(SCRIPT_SRC).toMatch(/try\s*\{[\s\S]*\}\s*catch/);
  });

  it("applies the stored theme verbatim when present", () => {
    const el = runScriptIn({
      localStorage: { getItem: () => "midnight" },
      matchMedia: () => ({ matches: false }),
    });
    expect(el._attrs["data-vf-theme"]).toBe("midnight");
  });

  it("resolves system → light when prefers-color-scheme: light matches", () => {
    const el = runScriptIn({
      localStorage: { getItem: () => "system" },
      matchMedia: (q: string) => ({ matches: q.includes("light") }),
    });
    expect(el._attrs["data-vf-theme"]).toBe("light");
  });

  it("resolves system → dark when no light preference", () => {
    const el = runScriptIn({
      localStorage: { getItem: () => "system" },
      matchMedia: () => ({ matches: false }),
    });
    expect(el._attrs["data-vf-theme"]).toBe("dark");
  });

  it("falls back to OS preference when no stored value", () => {
    const elLight = runScriptIn({
      localStorage: { getItem: () => null },
      matchMedia: (q: string) => ({ matches: q.includes("light") }),
    });
    expect(elLight._attrs["data-vf-theme"]).toBe("light");

    const elDark = runScriptIn({
      localStorage: { getItem: () => null },
      matchMedia: () => ({ matches: false }),
    });
    expect(elDark._attrs["data-vf-theme"]).toBe("dark");
  });

  it("does not throw when localStorage is unavailable", () => {
    expect(() =>
      runScriptIn({
        // Accessing .getItem will throw because localStorage is undefined.
        localStorage: undefined,
        matchMedia: () => ({ matches: false }),
      })
    ).not.toThrow();
  });

  it("does not throw when matchMedia is missing and no stored value", () => {
    expect(() =>
      runScriptIn({
        localStorage: { getItem: () => null },
        matchMedia: undefined,
      })
    ).not.toThrow();
  });

  it("executes end-to-end in the happy-dom test environment", async () => {
    // Import the script so its IIFE runs once in the real test globals.
    // Gives the module function-coverage data that `vm.runInContext`
    // can't provide.
    window.localStorage.setItem("voidframe-theme", "grey");
    try {
      // @ts-expect-error — .js with no declaration
      await import("../../theme-script.js");
      expect(document.documentElement.getAttribute("data-vf-theme")).toBe(
        "grey"
      );
    } finally {
      window.localStorage.removeItem("voidframe-theme");
    }
  });
});
