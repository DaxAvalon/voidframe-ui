import { ESLintUtils, type TSESTree } from "@typescript-eslint/utils";

const createRule = ESLintUtils.RuleCreator(
  (name) =>
    `https://git.ahadley.local/aeryn/VoidFrame/src/branch/main/tools/eslint-plugin-voidframe/rules/${name}.ts`
);

// Common color-valued CSS properties. Background-image is excluded because
// values there are typically url()/gradient() and the rule doesn't know.
const COLOR_PROPS = new Set([
  "color",
  "background",
  "backgroundColor",
  "borderColor",
  "borderTopColor",
  "borderRightColor",
  "borderBottomColor",
  "borderLeftColor",
  "outlineColor",
  "fill",
  "stroke",
  "caretColor",
  "accentColor",
  "textDecorationColor",
  "columnRuleColor",
]);

// Matches #rgb, #rrggbb, #rrggbbaa, rgb(...), rgba(...), hsl(...), hsla(...).
const RAW_COLOR = /^(?:#[0-9a-f]{3,8}|(?:rgb|rgba|hsl|hsla)\()/i;

export default createRule({
  name: "no-raw-hex-colors",
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Prefer var(--vf-*) theme tokens over raw hex/rgb/hsl color literals in JSX style props.",
    },
    messages: {
      rawColor:
        'Raw color "{{value}}" in style.{{prop}}. Use a var(--vf-*) theme token instead so the value tracks light/dark/contrast themes.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    function checkObjectExpression(obj: TSESTree.ObjectExpression): void {
      for (const prop of obj.properties) {
        if (prop.type !== "Property") continue;
        let key: string | null = null;
        if (prop.key.type === "Identifier") key = prop.key.name;
        else if (prop.key.type === "Literal" && typeof prop.key.value === "string")
          key = prop.key.value;
        if (!key || !COLOR_PROPS.has(key)) continue;
        if (prop.value.type !== "Literal") continue;
        if (typeof prop.value.value !== "string") continue;
        const v = prop.value.value.trim();
        if (!RAW_COLOR.test(v)) continue;
        context.report({
          node: prop.value,
          messageId: "rawColor",
          data: { value: v, prop: key },
        });
      }
    }
    return {
      JSXAttribute(node) {
        if (node.name.type !== "JSXIdentifier" || node.name.name !== "style")
          return;
        if (!node.value || node.value.type !== "JSXExpressionContainer") return;
        const expr = node.value.expression;
        if (expr.type !== "ObjectExpression") return;
        checkObjectExpression(expr);
      },
    };
  },
});
