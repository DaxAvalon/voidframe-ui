/* eslint-disable @typescript-eslint/no-explicit-any */

function attrByName(attrs: any[], name: string): any | undefined {
  return attrs.find(
    (a: any) => a.type === "JSXAttribute" && a.name?.name === name
  );
}

function attrLiteralString(attr: any): string | null {
  if (!attr) return null;
  const v = attr.value;
  if (!v) return null;
  if (v.type === "Literal" && typeof v.value === "string") return v.value;
  if (v.type === "JSXExpressionContainer" && v.expression.type === "Literal" && typeof v.expression.value === "string")
    return v.expression.value;
  return null;
}

type Combo = {
  description: string;
  predicate: (attrs: any[]) => boolean;
};

// Known-bad prop combinations. Each combination produces a single report on
// the JSXOpeningElement, keyed by component name.
const COMBOS: Record<string, Combo[]> = {
  Button: [
    {
      description:
        "`Button` has both `variant` and `kind` set to different values — they conflict; `kind` is the legacy prop. Drop `kind` and keep `variant`.",
      predicate: (attrs) => {
        const variant = attrLiteralString(attrByName(attrs, "variant"));
        const kind = attrLiteralString(attrByName(attrs, "kind"));
        if (variant == null || kind == null) return false;
        return variant !== kind;
      },
    },
  ],
  Badge: [
    {
      description:
        "`Badge` uses `variant=\"success\"` or `variant=\"danger\"` — those values migrated to the `tone` prop. Use `tone=\"success\"` / `tone=\"danger\"` instead.",
      predicate: (attrs) => {
        const variant = attrLiteralString(attrByName(attrs, "variant"));
        return variant === "success" || variant === "danger";
      },
    },
  ],
  Dialog: [
    {
      description:
        "`Dialog` has both `open` and `defaultOpen` set — controllable-state violation. Pick controlled (`open` + `onOpenChange`) or uncontrolled (`defaultOpen`).",
      predicate: (attrs) =>
        !!attrByName(attrs, "open") && !!attrByName(attrs, "defaultOpen"),
    },
  ],
  "Tabs.Root": [
    {
      description:
        "`Tabs.Root` has both `value` and `defaultValue` set — controllable-state violation. Pick controlled or uncontrolled, not both.",
      predicate: (attrs) =>
        !!attrByName(attrs, "value") && !!attrByName(attrs, "defaultValue"),
    },
  ],
};

function tagName(node: any): string | null {
  const n = node?.name;
  if (!n) return null;
  if (n.type === "JSXIdentifier") return n.name;
  if (n.type === "JSXMemberExpression") {
    const obj = n.object?.name;
    const prop = n.property?.name;
    if (obj && prop) return `${obj}.${prop}`;
  }
  return null;
}

const rule = {
  meta: {
    type: "problem" as const,
    docs: {
      description:
        "Flag forbidden combinations of props on voidframe components (e.g., `open` + `defaultOpen`) that compile but have undefined behavior.",
      url: "https://daxavalon.github.io/voidframe-ui/eslint-plugin#no-deprecated-prop-combination",
    },
    messages: {
      badCombo: "{{message}}",
    },
    schema: [],
  },
  create(context: any) {
    return {
      JSXOpeningElement(node: any) {
        const tag = tagName(node);
        if (!tag) return;
        const combos = COMBOS[tag];
        if (!combos) return;
        const attrs = node.attributes ?? [];
        for (const combo of combos) {
          if (combo.predicate(attrs)) {
            context.report({
              node,
              messageId: "badCombo",
              data: { message: combo.description },
            });
          }
        }
      },
    };
  },
};
export default rule;
