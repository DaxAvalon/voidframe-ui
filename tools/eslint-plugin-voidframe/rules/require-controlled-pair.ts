/* eslint-disable @typescript-eslint/no-explicit-any */

type Pair = {
  valueProp: string;
  // Primary onChange name, plus any legacy alternates that also satisfy
  // the pair.
  onChangeProps: string[];
  // Component filter: if `undefined`, apply to every voidframe-like tag.
  // If set, restrict to these tag names (supports `Ns.Member` form).
  components?: Set<string>;
};

const PAIRS: Pair[] = [
  { valueProp: "value", onChangeProps: ["onValueChange", "onChange"] },
  { valueProp: "open", onChangeProps: ["onOpenChange"] },
  { valueProp: "checked", onChangeProps: ["onCheckedChange", "onChange"] },
  {
    valueProp: "current",
    onChangeProps: ["onValueChange", "onCurrentChange"],
    components: new Set(["Stepper", "Wizard"]),
  },
  {
    valueProp: "index",
    onChangeProps: ["onSlideChange", "onIndexChange"],
    components: new Set(["Carousel"]),
  },
];

function attrByName(attrs: any[], name: string): any | undefined {
  return attrs.find(
    (a: any) => a.type === "JSXAttribute" && a.name?.name === name
  );
}

function hasAttr(attrs: any[], name: string): boolean {
  return !!attrByName(attrs, name);
}

function hasSpread(attrs: any[]): boolean {
  return attrs.some((a: any) => a.type === "JSXSpreadAttribute");
}

function attrIsUndefined(attr: any): boolean {
  if (!attr) return false;
  const v = attr.value;
  // Shorthand `foo` with no `=` is effectively `true`, not undefined.
  if (v == null) return false;
  if (v.type === "JSXExpressionContainer") {
    const e = v.expression;
    if (!e) return false;
    if (e.type === "Identifier" && e.name === "undefined") return true;
    if (e.type === "Literal" && e.value === null) return true;
  }
  return false;
}

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

function capitalize(s: string): string {
  return s.length === 0 ? s : s[0]!.toUpperCase() + s.slice(1);
}

const rule = {
  meta: {
    type: "suggestion" as const,
    docs: {
      description:
        "Warn when a component receives a controlled value without its matching onChange, making the component effectively read-only.",
      url: "https://daxavalon.github.io/voidframe-ui/eslint-plugin#require-controlled-pair",
    },
    messages: {
      missingUpdater:
        "`<{{component}}>` has `{{valueProp}}` set but no `{{onChangeProp}}`; the component is effectively read-only. Add `{{onChangeProp}}` or use the uncontrolled `default{{Capitalized}}` variant.",
    },
    schema: [],
  },
  create(context: any) {
    return {
      JSXOpeningElement(node: any) {
        const tag = tagName(node);
        if (!tag) return;
        // Only PascalCase / compound tags — skip raw HTML like <input>.
        const first = tag[0]!;
        if (first !== first.toUpperCase()) return;

        const attrs = node.attributes ?? [];
        // Bail if any spread or read-only escape hatches are present.
        if (hasSpread(attrs)) return;
        if (hasAttr(attrs, "readOnly") || hasAttr(attrs, "disabled")) return;

        for (const pair of PAIRS) {
          if (pair.components && !pair.components.has(tag)) continue;
          const valueAttr = attrByName(attrs, pair.valueProp);
          if (!valueAttr) continue;
          if (attrIsUndefined(valueAttr)) continue;
          const hasUpdater = pair.onChangeProps.some((n) => hasAttr(attrs, n));
          if (hasUpdater) continue;
          context.report({
            node: valueAttr,
            messageId: "missingUpdater",
            data: {
              component: tag,
              valueProp: pair.valueProp,
              onChangeProp: pair.onChangeProps[0]!,
              Capitalized: capitalize(pair.valueProp),
            },
          });
        }
      },
    };
  },
};
export default rule;
