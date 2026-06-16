import { describe, expect, it } from "vitest";
import {
  loadCatalog,
  searchList,
  shortDescription,
  componentSummary,
} from "../lib/catalog.mjs";

const catalog = loadCatalog();

describe("catalog", () => {
  it("loads components, hooks, and utils with name indexes", () => {
    expect(catalog.components.length).toBeGreaterThan(100);
    expect(catalog.hooks.length).toBeGreaterThan(10);
    expect(catalog.utils.length).toBeGreaterThan(10);
    expect(catalog.byName.component.get("AccessibleIcon")).toBeTruthy();
  });

  it("shortDescription collapses to the first sentence/line", () => {
    expect(shortDescription("First line.\nSecond line.")).toBe("First line.");
    expect(shortDescription("One sentence. Two sentence.")).toBe("One sentence.");
    expect(shortDescription("")).toBe("");
  });

  it("searchList ranks exact and prefix name matches first", () => {
    const results = searchList(catalog.components, "button", 10);
    expect(results.length).toBeGreaterThan(0);
    // An exact "Button" (if present) or a Button* prefix should lead.
    expect(results[0].name.toLowerCase()).toContain("button");
  });

  it("searchList with no query returns a name-sorted slice", () => {
    const results = searchList(catalog.components, "", 5);
    expect(results).toHaveLength(5);
    const names = results.map((r) => r.name);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
  });

  it("componentSummary omits the props array", () => {
    const c = catalog.byName.component.get("AccessibleIcon")!;
    const summary = componentSummary(c);
    expect(summary).toHaveProperty("kind");
    expect(summary).not.toHaveProperty("props");
  });
});
