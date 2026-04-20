/* eslint-disable @typescript-eslint/no-explicit-any */

const DEPRECATED: Record<string, Record<string, string>> = {
  Button: { primary: "Use variant=\"accent\" instead of the primary prop" },
  // Add more as needed
};

const rule = {
  meta: {
    type: "problem" as const,
    docs: {
      description: "Disallow deprecated component props",
      url: "https://voidframe.github.io/ui/eslint-plugin#no-deprecated-props",
    },
    messages: {
      deprecated: "Prop '{{prop}}' on <{{component}}>: {{message}}",
    },
    schema: [],
  },
  create(context: any) {
    return {
      JSXOpeningElement(node: any) {
        const name = node.name?.name;
        if (!name || !DEPRECATED[name]) return;
        const deprecatedProps = DEPRECATED[name]!;
        for (const attr of node.attributes ?? []) {
          if (attr.type === "JSXAttribute" && deprecatedProps[attr.name?.name]) {
            context.report({
              node: attr,
              messageId: "deprecated",
              data: {
                prop: attr.name.name,
                component: name,
                message: deprecatedProps[attr.name.name],
              },
            });
          }
        }
      },
    };
  },
};
export default rule;
