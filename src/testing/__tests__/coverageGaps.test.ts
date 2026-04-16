// Coverage-gap tests for testing utilities:
//   - mocks.ts: installMatchMedia restore, reuse of existing MQL objects
//   - axe.ts: violation reporting path

import { describe, expect, it, vi } from "vitest";
import { installMatchMedia, createMockStorage } from "../mocks";

// ── installMatchMedia: additional coverage ───────────────

describe("installMatchMedia — additional coverage", () => {
  it("reuses existing MQL object for same query", () => {
    const ctl = installMatchMedia(800);
    const mql1 = window.matchMedia("(min-width: 768px)");
    const mql2 = window.matchMedia("(min-width: 768px)");
    expect(mql1).toBe(mql2);
    ctl.restore();
  });

  it("restore puts back previous matchMedia", () => {
    const prev = window.matchMedia;
    const ctl = installMatchMedia(320);
    expect(window.matchMedia).not.toBe(prev);
    ctl.restore();
    expect(window.matchMedia).toBe(prev);
  });

  it("does not fire listener when match state does not change", () => {
    const ctl = installMatchMedia(1000);
    const mql = window.matchMedia("(min-width: 768px)");
    expect(mql.matches).toBe(true);
    let fired = 0;
    mql.addEventListener("change", () => { fired++; });
    // Change from 1000 to 900 — still >= 768, so no change
    ctl.setWidth(900);
    expect(fired).toBe(0);
    ctl.restore();
  });

  it("removeEventListener works", () => {
    const ctl = installMatchMedia(320);
    const mql = window.matchMedia("(min-width: 768px)");
    let fired = 0;
    const cb = () => { fired++; };
    mql.addEventListener("change", cb);
    mql.removeEventListener("change", cb);
    ctl.setWidth(1000);
    expect(fired).toBe(0);
    ctl.restore();
  });

  it("handles query without min-width (always matches)", () => {
    const ctl = installMatchMedia(320);
    const mql = window.matchMedia("(max-width: 600px)");
    // Our mock only handles min-width, so parseMinPx returns 0
    // which means it always matches (width >= 0)
    expect(mql.matches).toBe(true);
    ctl.restore();
  });

  it("accepts a custom target object", () => {
    const target = { matchMedia: undefined } as unknown as Pick<Window, "matchMedia"> & Record<string, unknown>;
    const ctl = installMatchMedia(500, target);
    const mql = (target.matchMedia as typeof window.matchMedia)("(min-width: 400px)");
    expect(mql.matches).toBe(true);
    ctl.restore();
  });
});

// ── createMockStorage: additional coverage ───────────────

describe("createMockStorage — additional coverage", () => {
  it("creates empty storage when no seed", () => {
    const s = createMockStorage();
    expect(s.get("anything")).toBeNull();
    expect(s.store.size).toBe(0);
  });

  it("set overwrites existing values", () => {
    const s = createMockStorage({ key: "old" });
    s.set("key", "new");
    expect(s.get("key")).toBe("new");
  });

  it("remove is idempotent on missing keys", () => {
    const s = createMockStorage();
    expect(() => s.remove?.("nonexistent")).not.toThrow();
  });
});
