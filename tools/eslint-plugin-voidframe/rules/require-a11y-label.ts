/* eslint-disable @typescript-eslint/no-explicit-any */

const rule = {
  meta: {
    type: "suggestion" as const,
    docs: {
      description: "Require aria-label on IconButton components",
    },
    messages: {
      missingLabel: "IconButton must have an aria-label prop for accessibility.",
    },
    schema: [],
  },
  create(context: any) {
    return {
      JSXOpeningElement(node: any) {
        const name = node.name?.name;
        if (name !== "IconButton") return;
        const hasAriaLabel = node.attributes?.some(
          (attr: any) =>
            attr.type === "JSXAttribute" &&
            (attr.name?.name === "aria-label" || attr.name?.name === "ariaLabel")
        );
        if (!hasAriaLabel) {
          context.report({ node, messageId: "missingLabel" });
        }
      },
    };
  },
};
export default rule;
