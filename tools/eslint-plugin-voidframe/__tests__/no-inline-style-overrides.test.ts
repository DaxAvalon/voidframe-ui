import { RuleTester } from "@typescript-eslint/rule-tester";
import { afterAll, describe, it } from "vitest";
import rule from "../rules/no-inline-style-overrides";

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

ruleTester.run("no-inline-style-overrides", rule, {
  valid: [
    {
      name: "CSS custom property override is fine",
      code: `const X = () => <Button style={{ "--vf-accent": "#4ade80" }} />;`,
    },
    {
      name: "non-color property is fine",
      code: `const X = () => <Button style={{ padding: 8 }} />;`,
    },
    {
      name: "lowercase HTML element not flagged",
      code: `const X = () => <div style={{ background: "#fff" }} />;`,
    },
  ],
  invalid: [
    {
      name: "hex background on PascalCase component",
      code: `const X = () => <Button style={{ background: "#ff0000" }} />;`,
      errors: [{ messageId: "inlineStyleColor" }],
    },
    {
      name: "rgb color on component",
      code: `const X = () => <Card style={{ color: "rgb(255, 0, 0)" }} />;`,
      errors: [{ messageId: "inlineStyleColor" }],
    },
    {
      name: "hsla borderColor",
      code: `const X = () => <Badge style={{ borderColor: "hsla(0, 100%, 50%, 0.5)" }} />;`,
      errors: [{ messageId: "inlineStyleColor" }],
    },
  ],
});
