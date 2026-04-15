import { RuleTester } from "@typescript-eslint/rule-tester";
import { afterAll, describe, it } from "vitest";
import rule from "../rules/require-use-client";

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

ruleTester.run("require-use-client", rule, {
  valid: [
    {
      name: "has use client directive",
      code: `"use client";\nimport { Button } from "voidframe";`,
    },
    {
      name: "only imports non-client components",
      code: `import { Text, Label } from "voidframe";`,
    },
    {
      name: "imports from different package",
      code: `import { Button } from "other-lib";`,
    },
  ],
  invalid: [
    {
      name: "Button without directive",
      code: `import { Button } from "voidframe";`,
      errors: [{ messageId: "missingDirective" }],
    },
    {
      name: "Tabs without directive",
      code: `import { Text, Tabs } from "voidframe";`,
      errors: [{ messageId: "missingDirective" }],
    },
    {
      name: "mixed imports reports once",
      code: `import { Button, Select, Dialog } from "voidframe";`,
      errors: [{ messageId: "missingDirective" }],
    },
  ],
});
