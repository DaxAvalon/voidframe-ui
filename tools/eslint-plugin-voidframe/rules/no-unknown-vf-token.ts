import { ESLintUtils, type TSESTree } from "@typescript-eslint/utils";
import { VF_TOKEN_NAMES } from "./vf-token-names";

const createRule = ESLintUtils.RuleCreator(
  (name) => `https://voidframe.github.io/ui/eslint-plugin#${name}`
);

type Options = [
  {
    /** Extra token names, or prefixes ending in `-`, the project defines itself. */
    allow?: string[];
  },
];
type MessageIds = "unknownToken";

// `var(--vf-x` references and `--vf-x` used as a style-object key.
const TOKEN_REF = /(?:var\(\s*|^\s*)(--vf-[\w-]+)/g;

// The aliases most often guessed wrong, with the name that exists.
const HINTS: Record<string, string> = {
  "--vf-text-primary": "--vf-text-0",
  "--vf-text-secondary": "--vf-text-2",
  "--vf-text-tertiary": "--vf-text-3",
  "--vf-bg": "--vf-bg-0",
  "--vf-surface": "--vf-surface-1",
  "--vf-border-color": "--vf-border",
  "--vf-primary": "--vf-accent",
  "--vf-error": "--vf-danger",
  "--vf-font-size": "--vf-font-md",
  "--vf-space-1": "--vf-sp-1",
  "--vf-spacing-1": "--vf-sp-1",
};

function nearest(name: string, known: Set<string>): string | undefined {
  if (HINTS[name]) return HINTS[name];
  // Same name minus a trailing tier digit, or with "-1" appended.
  const base = name.replace(/-\d+$/, "");
  for (const cand of [`${base}-1`, `${base}-0`, base]) if (known.has(cand)) return cand;
  return undefined;
}

export default createRule<Options, MessageIds>({
  name: "no-unknown-vf-token",
  meta: {
    type: "problem",
    docs: {
      description:
        "Flag var(--vf-*) references and --vf-* style keys that name a token voidframe does not define; an unknown custom property fails silently.",
    },
    messages: {
      unknownToken:
        '"{{name}}" is not a voidframe token; the reference resolves to nothing (a border shorthand with it disappears, a color inherits).{{hint}}',
    },
    schema: [
      {
        type: "object",
        properties: {
          allow: { type: "array", items: { type: "string" } },
        },
        additionalProperties: false,
      },
    ],
  },
  defaultOptions: [{}],
  create(context, [options]) {
    const known = new Set<string>(VF_TOKEN_NAMES);
    const allowExact = new Set<string>();
    const allowPrefixes: string[] = [];
    for (const a of options.allow ?? []) {
      if (a.endsWith("-")) allowPrefixes.push(a);
      else allowExact.add(a);
    }
    const isKnown = (name: string) =>
      known.has(name) || allowExact.has(name) || allowPrefixes.some((p) => name.startsWith(p));

    function check(node: TSESTree.Node, text: string): void {
      for (const m of text.matchAll(TOKEN_REF)) {
        const name = m[1]!;
        if (isKnown(name)) continue;
        const hint = nearest(name, known);
        context.report({
          node,
          messageId: "unknownToken",
          data: { name, hint: hint ? ` Did you mean "${hint}"?` : "" },
        });
      }
    }

    return {
      Literal(node) {
        if (typeof node.value === "string" && node.value.includes("--vf-")) check(node, node.value);
      },
      TemplateElement(node) {
        if (node.value.cooked && node.value.cooked.includes("--vf-")) check(node, node.value.cooked);
      },
    };
  },
});
