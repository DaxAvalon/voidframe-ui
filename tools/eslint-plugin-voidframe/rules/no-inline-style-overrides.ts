/* eslint-disable @typescript-eslint/no-explicit-any */

// Color-valued style properties we discourage overriding inline — a
// theme-switch event won't reach these values.
const COLOR_PROPS = new Set([
  "background",
  "backgroundColor",
  "color",
  "borderColor",
  "border",
]);

// Matches literal color strings: #rgb, #rgba, #rrggbb, #rrggbbaa,
// rgb(...), rgba(...), hsl(...), hsla(...).
const COLOR_VALUE = /^#[0-9a-f]{3,8}$|^rgba?\(|^hsla?\(/i;

function isPascalCase(name: string): boolean {
  return /^[A-Z][A-Za-z0-9]*$/.test(name);
}

const rule = {
  meta: {
    type: "suggestion" as const,
    docs: {
      description:
        "Discourage literal color values in inline `style` on voidframe components. Prefer CSS variable overrides so theme switching still applies.",
      url: "https://daxavalon.github.io/voidframe-ui/eslint-plugin#no-inline-style-overrides",
    },
    messages: {
      inlineStyleColor:
        "Prefer CSS variable overrides (`style={{ '--vf-accent': '{{value}}' }}`) over direct `{{property}}` style overrides — keeps theme switching intact.",
    },
    schema: [],
  },
  create(context: any) {
    return {
      JSXOpeningElement(node: any) {
        // Match voidframe-like components by PascalCase convention —
        // this intentionally also matches consumer components; the
        // false-positive rate on colored inline styles is low enough to
        // justify the broader signal.
        const nameNode = node.name;
        let tag: string | null = null;
        if (nameNode?.type === "JSXIdentifier") tag = nameNode.name;
        else if (nameNode?.type === "JSXMemberExpression")
          tag = nameNode.object?.name ?? null;
        if (!tag || !isPascalCase(tag)) return;

        for (const attr of node.attributes ?? []) {
          if (attr.type !== "JSXAttribute") continue;
          if (attr.name?.name !== "style") continue;
          const value = attr.value;
          if (!value || value.type !== "JSXExpressionContainer") continue;
          const expr = value.expression;
          if (!expr || expr.type !== "ObjectExpression") continue;

          for (const prop of expr.properties) {
            if (prop.type !== "Property") continue;
            let key: string | null = null;
            if (prop.key.type === "Identifier") key = prop.key.name;
            else if (prop.key.type === "Literal" && typeof prop.key.value === "string")
              key = prop.key.value;
            if (!key || !COLOR_PROPS.has(key)) continue;
            if (prop.value.type !== "Literal") continue;
            if (typeof prop.value.value !== "string") continue;
            const v = prop.value.value.trim();
            if (!COLOR_VALUE.test(v)) continue;
            context.report({
              node: prop,
              messageId: "inlineStyleColor",
              data: { value: v, property: key },
            });
          }
        }
      },
    };
  },
};
export default rule;
