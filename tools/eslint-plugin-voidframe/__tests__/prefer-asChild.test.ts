import { RuleTester } from "@typescript-eslint/rule-tester";
import { afterAll, describe, it } from "vitest";
import rule from "../rules/prefer-asChild";

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

ruleTester.run("prefer-asChild", rule, {
  valid: [
    {
      name: "Trigger already has asChild",
      code: `const X = () => <Dialog.Trigger asChild><Button>Open</Button></Dialog.Trigger>;`,
    },
    {
      name: "Trigger wraps plain text, not an interactive child",
      code: `const X = () => <Dialog.Trigger>Open</Dialog.Trigger>;`,
    },
    {
      name: "Trigger wraps a non-interactive element",
      code: `const X = () => <Dialog.Trigger><span>Open</span></Dialog.Trigger>;`,
    },
  ],
  invalid: [
    {
      name: "Dialog.Trigger wraps Button",
      code: `const X = () => <Dialog.Trigger><Button>Open</Button></Dialog.Trigger>;`,
      output: `const X = () => <Dialog.Trigger asChild><Button>Open</Button></Dialog.Trigger>;`,
      errors: [{ messageId: "preferAsChild" }],
    },
    {
      name: "Tooltip wraps IconButton",
      code: `const X = () => <Tooltip><IconButton aria-label="q"/></Tooltip>;`,
      output: `const X = () => <Tooltip asChild><IconButton aria-label="q"/></Tooltip>;`,
      errors: [{ messageId: "preferAsChild" }],
    },
    {
      name: "Popover.Trigger wraps raw <a>",
      code: `const X = () => <Popover.Trigger><a href="#">x</a></Popover.Trigger>;`,
      output: `const X = () => <Popover.Trigger asChild><a href="#">x</a></Popover.Trigger>;`,
      errors: [{ messageId: "preferAsChild" }],
    },
  ],
});
