import { RuleTester } from "@typescript-eslint/rule-tester";
import { afterAll, describe, it } from "vitest";
import rule from "../rules/no-legacy-chart-imports";

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

ruleTester.run("no-legacy-chart-imports", rule, {
  valid: [
    {
      name: "new ChartFrame import",
      code: `import { ChartFrame, BarChart } from "voidframe-ui";`,
    },
    {
      name: "unrelated package",
      code: `import { something } from "other-package/components/Charts";`,
    },
    {
      name: "non-legacy voidframe names",
      code: `import { Button, Tabs } from "voidframe-ui";`,
    },
  ],
  invalid: [
    {
      name: "legacy module path",
      code: `import { Sparkline } from "voidframe/dist/components/Charts";`,
      errors: [{ messageId: "legacyModule" }],
    },
    {
      name: "legacy ChartContainer name",
      code: `import { ChartContainer } from "voidframe-ui";`,
      errors: [{ messageId: "legacyName" }],
    },
    {
      name: "src path variant",
      code: `import { X } from "voidframe/src/components/Charts";`,
      errors: [{ messageId: "legacyModule" }],
    },
  ],
});
