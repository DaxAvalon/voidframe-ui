import { describe, expect, it } from "vitest";
import plugin, { rules, configs } from "../index";

describe("eslint-plugin-voidframe barrel", () => {
  it("exports all three rules under their kebab-case names", () => {
    expect(Object.keys(rules).sort()).toEqual([
      "no-deprecated-props",
      "no-legacy-chart-imports",
      "no-raw-hex-colors",
      "prefer-compound-pattern",
      "require-a11y-label",
      "require-use-client",
    ]);
  });

  it("each rule object has create + meta", () => {
    for (const [name, rule] of Object.entries(rules)) {
      expect(rule, `rule ${name}`).toBeDefined();
      // ESLint rule modules expose a create() function and a meta object.
      expect(typeof (rule as { create: unknown }).create, `${name}.create`).toBe(
        "function"
      );
      expect((rule as { meta: unknown }).meta, `${name}.meta`).toBeDefined();
    }
  });

  it("recommended config registers the plugin", () => {
    expect(configs.recommended.plugins).toContain("voidframe-ui");
  });

  it("recommended config wires every exported rule", () => {
    const ruleEntries = Object.keys(configs.recommended.rules);
    for (const name of Object.keys(rules)) {
      expect(ruleEntries).toContain(`voidframe-ui/${name}`);
    }
  });

  it("recommended config severities are valid eslint values", () => {
    for (const value of Object.values(configs.recommended.rules)) {
      expect(["off", "warn", "error", 0, 1, 2]).toContain(value as never);
    }
  });

  it("default export mirrors the named exports", () => {
    expect(plugin.rules).toBe(rules);
    expect(plugin.configs).toBe(configs);
  });

  it("default export is shaped as an ESLint plugin", () => {
    expect(plugin).toHaveProperty("rules");
    expect(plugin).toHaveProperty("configs");
    expect(plugin.configs).toHaveProperty("recommended");
  });
});
