/* eslint-disable @typescript-eslint/no-explicit-any */

// Minimal, inlined set of voidframe component names. We intentionally use
// a set of common tagged PascalCase names here rather than re-importing the
// monster table from `prefer-subpath-import`; the set only needs to cover
// components that have variant/tone props today. Maintained locally.
const VF_COMPONENTS = new Set([
  "Button",
  "IconButton",
  "Badge",
  "Alert",
  "AlertV2",
  "BannerAlert",
  "Callout",
  "Card",
  "Tag",
  "Chip",
  "Toast",
  "Snackbar",
  "Link",
  "Anchor",
  "Progress",
  "Stat",
  "Kbd",
]);

const VARIANT_PROPS = new Set(["variant", "tone"]);

function isAllStringLiteralBranches(node: any): boolean {
  // true when every branch of a ConditionalExpression (and its nested
  // conditionals) is a string literal. Non-conditional literals also count.
  if (!node) return false;
  if (node.type === "Literal" && typeof node.value === "string") return true;
  if (node.type === "TemplateLiteral" && node.expressions.length === 0)
    return true;
  if (node.type === "ConditionalExpression") {
    return (
      isAllStringLiteralBranches(node.consequent) &&
      isAllStringLiteralBranches(node.alternate)
    );
  }
  return false;
}

const rule = {
  meta: {
    type: "suggestion" as const,
    docs: {
      description:
        "Warn when variant/tone on a voidframe component is a non-literal — the type may have widened to `string` and lost the union constraint.",
      url: "https://daxavalon.github.io/voidframe-ui/eslint-plugin#exhaustive-kind-variant",
    },
    messages: {
      nonLiteralVariant:
        "`{{prop}}` on `<{{component}}>` uses a non-literal value; ensure the variable type is narrowed to the component's variant union (e.g., `ButtonVariant`) so invalid values fail at compile time.",
    },
    schema: [],
  },
  create(context: any) {
    return {
      JSXAttribute(node: any) {
        const propName = node.name?.name;
        if (typeof propName !== "string" || !VARIANT_PROPS.has(propName)) return;
        const parent = node.parent; // JSXOpeningElement
        const tag = parent?.name?.name;
        if (!tag || !VF_COMPONENTS.has(tag)) return;

        const value = node.value;
        if (!value) return; // shorthand `variant` without `=` — skip
        if (value.type === "Literal") return; // string literal, fine
        if (value.type !== "JSXExpressionContainer") return;
        const expr = value.expression;
        if (!expr) return;

        // Literal expressions are fine.
        if (expr.type === "Literal" && typeof expr.value === "string") return;
        if (expr.type === "TemplateLiteral" && expr.expressions.length === 0)
          return;
        // Conditional where every branch is a literal string is fine.
        if (expr.type === "ConditionalExpression" && isAllStringLiteralBranches(expr))
          return;

        // Flag only the risky non-literal forms listed in the spec.
        const risky =
          expr.type === "Identifier" ||
          expr.type === "MemberExpression" ||
          expr.type === "CallExpression";
        if (!risky) return;

        context.report({
          node,
          messageId: "nonLiteralVariant",
          data: { prop: propName, component: tag },
        });
      },
    };
  },
};
export default rule;
