import { RuleTester } from "@typescript-eslint/rule-tester";
import { afterAll, describe, it } from "vitest";
import rule from "../rules/require-voidframe-provider";

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

ruleTester.run("require-voidframe-provider", rule, {
  valid: [
    {
      name: "file with provider and root import",
      code: `import { Button, VoidframeProvider } from "voidframe-ui";\nexport const App = () => <VoidframeProvider><Button>ok</Button></VoidframeProvider>;`,
    },
    {
      name: "subpath import with provider present",
      code: `import { Button } from "voidframe-ui/core";\nimport { VoidframeProvider } from "voidframe-ui";\nexport const App = () => <VoidframeProvider><Button/></VoidframeProvider>;`,
    },
    {
      name: "no voidframe-ui import at all",
      code: `import { Thing } from "other-lib";\nexport const X = () => <Thing />;`,
    },
  ],
  invalid: [
    {
      name: "root import, no provider",
      code: `import { Button } from "voidframe-ui";\nexport const X = () => <Button />;`,
      errors: [{ messageId: "missingProvider" }],
    },
    {
      name: "subpath import, no provider",
      code: `import { Input } from "voidframe-ui/forms";\nexport const X = () => <Input />;`,
      errors: [{ messageId: "missingProvider" }],
    },
    {
      name: "multiple vf imports, reports only the first",
      code: `import { Button } from "voidframe-ui/core";\nimport { Input } from "voidframe-ui/forms";\nexport const X = () => <><Button/><Input/></>;`,
      errors: [{ messageId: "missingProvider" }],
    },
  ],
});
