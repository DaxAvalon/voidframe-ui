import { RuleTester } from "@typescript-eslint/rule-tester";
import { afterAll, describe, it } from "vitest";
import rule from "../rules/prefer-subpath-import";

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

ruleTester.run("prefer-subpath-import", rule, {
  valid: [
    {
      name: "already-subpath import",
      code: `import { Button } from "voidframe-ui/core";`,
    },
    {
      name: "root import but only root-only names",
      code: `import { VoidframeProvider, useTokens, createTheme } from "voidframe-ui";`,
    },
    {
      name: "unrelated package",
      code: `import { Button } from "other-lib";`,
    },
  ],
  invalid: [
    {
      name: "single subpath group autofixes the source",
      code: `import { Button, Badge } from "voidframe-ui";`,
      output: `import { Button, Badge } from "voidframe-ui/core";`,
      errors: [
        { messageId: "preferSubpath" },
        { messageId: "preferSubpath" },
      ],
    },
    {
      name: "mixed subpaths produce one mixedSubpaths warning, no autofix",
      code: `import { Button, Input } from "voidframe-ui";`,
      output: null,
      errors: [{ messageId: "mixedSubpaths" }],
    },
    {
      name: "icons fallback via *Icon suffix",
      code: `import { SearchIcon, CheckIcon } from "voidframe-ui";`,
      output: `import { SearchIcon, CheckIcon } from "voidframe-ui/icons";`,
      errors: [
        { messageId: "preferSubpath" },
        { messageId: "preferSubpath" },
      ],
    },
  ],
});
