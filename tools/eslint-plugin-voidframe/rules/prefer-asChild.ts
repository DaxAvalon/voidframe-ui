/* eslint-disable @typescript-eslint/no-explicit-any */

// Trigger / slot components whose wrapped single interactive child would
// produce a nested-interactive a11y violation without `asChild`.
const TRIGGERS = new Set([
  "Dialog.Trigger",
  "Popover.Trigger",
  "HoverCard.Trigger",
  "Tooltip",
  "Menu.Trigger",
  "MenuBar.Trigger",
  "DropdownMenu.Trigger",
  "Popconfirm.Trigger",
  "DrawerV2.Trigger",
  "Sheet.Trigger",
  "AlertDialog.Trigger",
  "ContextMenu.Trigger",
  "Dialog.Close",
  "Dialog.Cancel",
  "Dialog.Action",
]);

const INTERACTIVE_CHILDREN = new Set(["Button", "IconButton", "a", "button"]);

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
    type: "suggestion" as const,
    fixable: "code" as const,
    docs: {
      description:
        "Suggest `asChild` on voidframe trigger/slot components that wrap a single interactive child to avoid nested-interactive a11y issues.",
      url: "https://daxavalon.github.io/voidframe-ui/eslint-plugin#prefer-asChild",
    },
    messages: {
      preferAsChild:
        "`<{{trigger}}>` wraps a single `<{{child}}>`; add `asChild` to avoid nested interactive elements (a11y: `nested-interactive`).",
    },
    schema: [],
  },
  create(context: any) {
    return {
      JSXElement(node: any) {
        const opening = node.openingElement;
        const triggerName = tagName(opening);
        if (!triggerName || !TRIGGERS.has(triggerName)) return;

        const hasAsChild = (opening.attributes ?? []).some(
          (a: any) => a.type === "JSXAttribute" && a.name?.name === "asChild"
        );
        if (hasAsChild) return;

        // Find the single interactive child element (ignore whitespace-
        // only text / empty expression containers).
        const meaningful = (node.children ?? []).filter((c: any) => {
          if (c.type === "JSXText") return c.value.trim().length > 0;
          if (c.type === "JSXExpressionContainer" && c.expression?.type === "JSXEmptyExpression")
            return false;
          return true;
        });
        if (meaningful.length !== 1) return;
        const child = meaningful[0];
        if (child.type !== "JSXElement") return;
        const childName = tagName(child.openingElement);
        if (!childName || !INTERACTIVE_CHILDREN.has(childName)) return;

        context.report({
          node: opening,
          messageId: "preferAsChild",
          data: { trigger: triggerName, child: childName },
          fix(fixer: any) {
            // Insert `asChild` right after the opening tag name. Using
            // the name node's range keeps whitespace tidy.
            const after = opening.name.range[1];
            return fixer.insertTextAfterRange([after, after], " asChild");
          },
        });
      },
    };
  },
};
export default rule;
