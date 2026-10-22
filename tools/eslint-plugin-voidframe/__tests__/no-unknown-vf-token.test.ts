import { RuleTester } from "@typescript-eslint/rule-tester";
import { afterAll, describe, expect, it } from "vitest";
import { execFileSync } from "node:child_process";
import rule from "../rules/no-unknown-vf-token";
import { VF_TOKEN_NAMES } from "../rules/vf-token-names";

RuleTester.afterAll = afterAll;
RuleTester.it = it;
RuleTester.itOnly = it.only;
RuleTester.describe = describe;

const ruleTester = new RuleTester({
  parser: "@typescript-eslint/parser",
  parserOptions: { ecmaFeatures: { jsx: true }, ecmaVersion: "latest", sourceType: "module" },
});

ruleTester.run("no-unknown-vf-token", rule, {
  valid: [
    { name: "known tier token", code: `const s = { color: "var(--vf-text-0)" };` },
    { name: "new semantic alias", code: `const s = { color: "var(--vf-text-muted)", border: "1px solid var(--vf-border)" };` },
    { name: "accent alias", code: `const s = { color: "var(--vf-accent-success)" };` },
    { name: "surface alias", code: `const s = { background: "var(--vf-surface-1)" };` },
    { name: "template literal", code: "const s = `1px solid var(--vf-border-1)`;" },
    { name: "style key for a defined token", code: `const s = { "--vf-accent": "red" };` },
    { name: "allowed project prefix", code: `const s = { color: "var(--vf-app-brand)" };`, options: [{ allow: ["--vf-app-"] }] },
    { name: "allowed exact name", code: `const s = { color: "var(--vf-brand)" };`, options: [{ allow: ["--vf-brand"] }] },
    { name: "not a token reference", code: `const s = "text about --vf-nothing";`.replace("--vf-nothing", "vf-nothing") },
  ],
  invalid: [
    {
      name: "unknown alias with hint",
      code: `const s = { color: "var(--vf-text-primary)" };`,
      errors: [{ messageId: "unknownToken", data: { name: "--vf-text-primary", hint: ' Did you mean "--vf-text-0"?' } }],
    },
    {
      name: "unknown without hint",
      code: `const s = { color: "var(--vf-definitely-made-up)" };`,
      errors: [{ messageId: "unknownToken", data: { name: "--vf-definitely-made-up", hint: "" } }],
    },
    {
      name: "template literal",
      code: "const s = `var(--vf-border-colour)`;",
      errors: [{ messageId: "unknownToken" }],
    },
    {
      name: "two unknown names in one string",
      code: `const s = { border: "1px solid var(--vf-bordr)", color: "var(--vf-txt)" };`,
      errors: [{ messageId: "unknownToken" }, { messageId: "unknownToken" }],
    },
  ],
});

describe("vf-token-names registry", () => {
  it("contains the tiers and the semantic aliases", () => {
    for (const n of ["--vf-text-0", "--vf-bg-5", "--vf-border-1", "--vf-text-muted", "--vf-text-subtle", "--vf-border", "--vf-accent-success", "--vf-accent-danger", "--vf-surface-1", "--vf-surface-translucent", "--vf-scrim"]) {
      expect(VF_TOKEN_NAMES, n).toContain(n);
    }
  });

  it("is up to date with src/css (run `npm run tokens:names` if this fails)", () => {
    execFileSync("node", ["scripts/export-token-names.mjs", "--check"], { stdio: "pipe" });
  });
});
