import { RuleTester } from "@typescript-eslint/rule-tester";
import { afterAll, describe, it } from "vitest";
import rule from "../rules/exhaustive-kind-variant";

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

ruleTester.run("exhaustive-kind-variant", rule, {
  valid: [
    {
      name: "string literal variant",
      code: `const X = () => <Button variant="accent">x</Button>;`,
    },
    {
      name: "conditional with literal branches",
      code: `const X = ({ ok }) => <Badge tone={ok ? "success" : "danger"}>x</Badge>;`,
    },
    {
      name: "non-voidframe component is ignored",
      code: `const X = ({ v }) => <MyThing variant={v} />;`,
    },
  ],
  invalid: [
    {
      name: "Identifier variant on Button",
      code: `const X = ({ v }) => <Button variant={v}>x</Button>;`,
      errors: [{ messageId: "nonLiteralVariant" }],
    },
    {
      name: "MemberExpression tone on Badge",
      code: `const X = (props) => <Badge tone={props.tone}>x</Badge>;`,
      errors: [{ messageId: "nonLiteralVariant" }],
    },
    {
      name: "CallExpression variant on Alert",
      code: `const X = () => <Alert variant={computeVariant()}>x</Alert>;`,
      errors: [{ messageId: "nonLiteralVariant" }],
    },
  ],
});
