import { describe, expect, it } from "vitest";
import { RuleTester } from "eslint";
import requireA11yLabel from "../rules/require-a11y-label";
import preferCompound from "../rules/prefer-compound-pattern";
import noDeprecatedProps from "../rules/no-deprecated-props";

// ESLint RuleTester needs parser options for JSX
const tester = new RuleTester({
  parserOptions: { ecmaVersion: 2020, ecmaFeatures: { jsx: true }, sourceType: "module" },
});

describe("require-a11y-label", () => {
  it("passes valid cases", () => {
    tester.run("require-a11y-label", requireA11yLabel, {
      valid: [
        { code: '<IconButton aria-label="Close" onClick={fn} />' },
        { code: '<Button onClick={fn}>Text</Button>' },
      ],
      invalid: [
        {
          code: '<IconButton onClick={fn}><CloseIcon /></IconButton>',
          errors: [{ messageId: "missingLabel" }],
        },
      ],
    });
  });
});

describe("prefer-compound-pattern", () => {
  it("suggests compound variants", () => {
    tester.run("prefer-compound-pattern", preferCompound, {
      valid: [
        { code: '<Dialog open={open}>Content</Dialog>' },
        { code: '<DrawerV2 open={open}>Content</DrawerV2>' },
      ],
      invalid: [
        {
          code: '<Modal open={open}>Content</Modal>',
          errors: [{ messageId: "preferCompound" }],
        },
        {
          code: '<Drawer open={open}>Content</Drawer>',
          errors: [{ messageId: "preferCompound" }],
        },
      ],
    });
  });
});

describe("no-deprecated-props", () => {
  it("flags deprecated props", () => {
    tester.run("no-deprecated-props", noDeprecatedProps, {
      valid: [
        { code: '<Button variant="accent">OK</Button>' },
      ],
      invalid: [
        {
          code: '<Button primary>OK</Button>',
          errors: [{ messageId: "deprecated" }],
        },
      ],
    });
  });
});
