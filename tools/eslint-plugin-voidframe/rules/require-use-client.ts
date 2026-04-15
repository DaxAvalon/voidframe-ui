import { ESLintUtils, type TSESTree } from "@typescript-eslint/utils";

const createRule = ESLintUtils.RuleCreator(
  (name) => `https://voidframe.dev/docs/eslint-plugin#${name}`
);

// Components that use client-only APIs (state, effects, portals, refs) and
// therefore require `"use client"` in consumer files under the Next.js /
// RSC model. This list is deliberately conservative — only components that
// *cannot* render on the server.
const CLIENT_COMPONENTS = new Set([
  "Button",
  "Combobox",
  "CommandPalette",
  "DatePicker",
  "DateTimePicker",
  "Dialog",
  "Drawer",
  "DrawerV2",
  "Form",
  "HoverCard",
  "MultiSelect",
  "Modal",
  "Menu",
  "Popover",
  "PopoverV2",
  "Select",
  "Sheet",
  "Sidebar",
  "Tabs",
  "Toast",
  "Tooltip",
  "TooltipV2",
  "VoidframeProvider",
]);

export default createRule({
  name: "require-use-client",
  meta: {
    type: "problem",
    docs: {
      description:
        'Warn when a file imports a client-only voidframe component but is missing the "use client" directive at the top.',
    },
    messages: {
      missingDirective:
        'File imports client-only voidframe component "{{name}}" but is missing a top-level "use client" directive. Add "use client"; as the first statement if this file is in a React Server Components tree.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const sourceCode =
      (context as unknown as { sourceCode?: { ast: TSESTree.Program } })
        .sourceCode ?? context.getSourceCode();
    const program = sourceCode.ast;
    const firstStmt = program.body[0];
    const hasDirective =
      firstStmt &&
      firstStmt.type === "ExpressionStatement" &&
      firstStmt.expression.type === "Literal" &&
      firstStmt.expression.value === "use client";
    if (hasDirective) return {};
    return {
      ImportDeclaration(node) {
        const source = node.source.value;
        if (source !== "voidframe") return;
        for (const spec of node.specifiers) {
          if (spec.type !== "ImportSpecifier") continue;
          if (spec.imported.type !== "Identifier") continue;
          const name = spec.imported.name;
          if (!CLIENT_COMPONENTS.has(name)) continue;
          context.report({
            node: spec,
            messageId: "missingDirective",
            data: { name },
          });
          return; // one warning per file is enough
        }
      },
    };
  },
});
