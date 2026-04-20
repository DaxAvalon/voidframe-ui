/* eslint-disable @typescript-eslint/no-explicit-any */

const SUGGESTIONS: Record<string, string> = {
  Modal: "Dialog",
  Drawer: "DrawerV2",
  Popover: "PopoverV2",
};

const rule = {
  meta: {
    type: "suggestion" as const,
    docs: {
      description: "Prefer compound component variants over simple ones",
      url: "https://voidframe.github.io/ui/eslint-plugin#prefer-compound-pattern",
    },
    messages: {
      preferCompound: "Consider using <{{suggested}}> instead of <{{original}}> for richer accessibility and composition.",
    },
    schema: [],
  },
  create(context: any) {
    return {
      JSXOpeningElement(node: any) {
        const name = node.name?.name;
        if (name && SUGGESTIONS[name]) {
          context.report({
            node,
            messageId: "preferCompound",
            data: { original: name, suggested: SUGGESTIONS[name] },
          });
        }
      },
    };
  },
};
export default rule;
