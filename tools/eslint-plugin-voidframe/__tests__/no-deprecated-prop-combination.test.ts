import { RuleTester } from "@typescript-eslint/rule-tester";
import { afterAll, describe, it } from "vitest";
import rule from "../rules/no-deprecated-prop-combination";

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

ruleTester.run("no-deprecated-prop-combination", rule, {
  valid: [
    {
      name: "Button with only variant",
      code: `const X = () => <Button variant="accent">ok</Button>;`,
    },
    {
      name: "Dialog controlled without defaultOpen",
      code: `const X = () => <Dialog open={open} onOpenChange={setOpen} />;`,
    },
    {
      name: "Badge with tone='success'",
      code: `const X = () => <Badge tone="success">ok</Badge>;`,
    },
  ],
  invalid: [
    {
      name: "Button with conflicting variant + kind",
      code: `const X = () => <Button variant="accent" kind="primary">ok</Button>;`,
      errors: [{ messageId: "badCombo" }],
    },
    {
      name: "Badge with legacy variant='success'",
      code: `const X = () => <Badge variant="success">ok</Badge>;`,
      errors: [{ messageId: "badCombo" }],
    },
    {
      name: "Dialog with open + defaultOpen",
      code: `const X = () => <Dialog open={true} defaultOpen={true} />;`,
      errors: [{ messageId: "badCombo" }],
    },
  ],
});
