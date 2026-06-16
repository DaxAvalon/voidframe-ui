import { describe, expect, it } from "vitest";
import { loadCatalog } from "../lib/catalog.mjs";
import { TOOL_DEFINITIONS, runTool } from "../lib/tools.mjs";

const catalog = loadCatalog();

describe("tools", () => {
  it("every tool definition has a name, description, and object schema", () => {
    for (const t of TOOL_DEFINITIONS) {
      expect(t.name).toBeTruthy();
      expect(t.description.length).toBeGreaterThan(10);
      expect(t.inputSchema.type).toBe("object");
    }
  });

  it("list_components filters by kind", () => {
    const res = runTool("list_components", { kind: "primitive", limit: 100 }, catalog);
    expect(res.count).toBeGreaterThan(0);
    expect(res.components.every((c: any) => c.kind === "primitive")).toBe(true);
  });

  it("get_component returns full props for a known component", () => {
    const res = runTool("get_component", { name: "AccessibleIcon" }, catalog);
    expect(res.name).toBe("AccessibleIcon");
    expect(Array.isArray(res.props)).toBe(true);
  });

  it("get_component returns a helpful error for an unknown name", () => {
    const res = runTool("get_component", { name: "Nope" }, catalog);
    expect(res.error).toMatch(/No component named/);
  });

  it("get_hook and get_util resolve known names", () => {
    const hookName = catalog.hooks[0].name;
    const utilName = catalog.utils[0].name;
    expect(runTool("get_hook", { name: hookName }, catalog).name).toBe(hookName);
    expect(runTool("get_util", { name: utilName }, catalog).name).toBe(utilName);
  });

  it("search spans all three categories", () => {
    const res = runTool("search", { query: "use", limit: 5 }, catalog);
    expect(res).toHaveProperty("components");
    expect(res).toHaveProperty("hooks");
    expect(res).toHaveProperty("utils");
  });

  it("throws on an unknown tool", () => {
    expect(() => runTool("frobnicate", {}, catalog)).toThrow(/Unknown tool/);
  });
});
