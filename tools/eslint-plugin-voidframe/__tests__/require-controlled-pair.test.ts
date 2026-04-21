import { RuleTester } from "@typescript-eslint/rule-tester";
import { afterAll, describe, it } from "vitest";
import rule from "../rules/require-controlled-pair";

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

ruleTester.run("require-controlled-pair", rule, {
  valid: [
    {
      name: "value + onValueChange",
      code: `const X = () => <Select value={v} onValueChange={setV} />;`,
    },
    {
      name: "readOnly escape hatch",
      code: `const X = () => <Input value={v} readOnly />;`,
    },
    {
      name: "spread attributes bail the check",
      code: `const X = (props) => <Select value={v} {...props} />;`,
    },
  ],
  invalid: [
    {
      name: "value without onValueChange",
      code: `const X = () => <Select value={v} />;`,
      errors: [{ messageId: "missingUpdater" }],
    },
    {
      name: "open without onOpenChange",
      code: `const X = () => <Dialog open={isOpen} />;`,
      errors: [{ messageId: "missingUpdater" }],
    },
    {
      name: "checked without onCheckedChange or onChange",
      code: `const X = () => <Checkbox checked={on} />;`,
      errors: [{ messageId: "missingUpdater" }],
    },
  ],
});
