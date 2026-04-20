/* eslint-disable @typescript-eslint/no-explicit-any */

const rule = {
  meta: {
    type: "suggestion" as const,
    docs: {
      description: "Require aria-label on IconButton components",
      url: "https://voidframe.github.io/ui/eslint-plugin#require-a11y-label",
    },
    messages: {
      missingLabel:
        "<IconButton> must declare `aria-label` (or `aria-labelledby`) so screen readers can announce the action. See the Accessibility guide at /docs/guides/accessibility.",
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
