import { RuleTester } from "@typescript-eslint/rule-tester";
import { afterAll, describe, it } from "vitest";
import rule from "../rules/no-raw-hex-colors";

// Wire the TS-ESLint rule tester to vitest.
RuleTester.afterAll = afterAll;
RuleTester.it = it;
RuleTester.itOnly = it.only;
RuleTester.describe = describe;

const ruleTester = new RuleTester({
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaFeatures: { jsx: true },
    ecmaVersion: "latest",
    sourceType: "module",
  },
});

ruleTester.run("no-raw-hex-colors", rule, {
  valid: [
    {
      name: "theme token for color",
      code: `const x = <div style={{ color: "var(--vf-text-0)" }} />`,
    },
    {
      name: "no style prop",
      code: `const x = <div className="a" />`,
    },
    {
      name: "non-color property with hex value",
      code: `const x = <div style={{ content: "#abc" }} />`,
    },
    {
      name: "variable reference",
      code: `const c = "#fff"; const x = <div style={{ color: c }} />`,
    },
  ],
  invalid: [
    {
      name: "hex in color",
      code: `const x = <div style={{ color: "#fff" }} />`,
      errors: [{ messageId: "rawColor" }],
    },
    {
      name: "rgb in background",
      code: `const x = <div style={{ background: "rgb(10, 20, 30)" }} />`,
      errors: [{ messageId: "rawColor" }],
    },
    {
      name: "hex in borderColor with string key",
      code: `const x = <div style={{ "borderColor": "#abc" }} />`,
      errors: [{ messageId: "rawColor" }],
    },
    {
      name: "multiple color props",
      code: `const x = <div style={{ color: "#000", backgroundColor: "#fff" }} />`,
      errors: [{ messageId: "rawColor" }, { messageId: "rawColor" }],
    },
  ],
});
