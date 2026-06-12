/**
 * Component "kind" resolution for the docs site.
 *
 * Every props.json entry gets a kind so the docs can list honestly:
 *
 *   - "element"      — a visual component; gets a live playground.
 *   - "layout"       — invisible arrangement utility (VStack, Box…);
 *                      documented code-only under Primitives & Utilities.
 *   - "primitive"    — behavioral building block (Portal, FocusScope…);
 *                      documented code-only under Primitives & Utilities.
 *   - "provider"     — context/provider surface (VoidframeProvider…);
 *                      documented code-only under Providers.
 *   - "subcomponent" — compound part (Dialog.Trigger, MenuItem…);
 *                      folded into its parent's page.
 *   - "compat"       — shadcn-compat alias; grouped on the compat page.
 *
 * Resolution precedence (applied in scripts/extract-props.mjs):
 *   1. JSDoc `@docsKind` / `@docsParent` on the component.
 *   2. KIND_OVERRIDES below (hand-curated for existing components).
 *   3. Heuristics: dotted names are subcomponents of their prefix;
 *      source path prefixes map primitives/providers/compat/icons/charts.
 *   4. Default: "element".
 *
 * Plain .mjs with no imports so both node scripts and vitest can load it.
 */

export const KINDS = [
  "element",
  "layout",
  "primitive",
  "provider",
  "subcomponent",
  "compat",
];

/**
 * Hand-curated kinds for components whose kind can't be derived from
 * their path or name. Add new components here (or use `@docsKind` in
 * the component's JSDoc) — the docs kinds test fails if neither covers
 * a new export.
 */
export const KIND_OVERRIDES = {
  // ── Layout utilities (src/components/Layout*.tsx, Text.tsx) ─────
  AspectRatio: { kind: "layout" },
  Box: { kind: "layout" },
  Center: { kind: "layout" },
  Container: { kind: "layout" },
  EmptyLayout: { kind: "layout" },
  Flex: { kind: "layout" },
  Grid: { kind: "layout" },
  GridItem: { kind: "layout" },
  HStack: { kind: "layout" },
  SafeArea: { kind: "layout" },
  Section: { kind: "layout" },
  Spacer: { kind: "layout" },
  SplitView: { kind: "layout" },
  Stack: { kind: "layout" },
  Sticky: { kind: "layout" },
  Stretch: { kind: "layout" },
  VStack: { kind: "layout" },
  // Responsive visibility wrappers render nothing of their own.
  Hide: { kind: "layout" },
  Show: { kind: "layout" },
  ResponsiveBox: { kind: "layout" },

  // ── Providers outside src/provider/ ──────────────────────────────
  MessagesProvider: { kind: "provider" },
  ShortcutProvider: { kind: "provider" },
  ConfirmProvider: { kind: "provider" },
  TooltipProvider: { kind: "provider" },
  // Theme bridge for an optional external library (@xyflow/react);
  // can't render standalone and exists to provide styling context.
  VoidframeReactFlowTheme: { kind: "provider" },

  // ── Chart internals not exported from the charts barrel ──────────
  ChartScales: { kind: "primitive" },

  // ── Compound sub-components exported flat from src/components ────
  ConversationHeader: { kind: "subcomponent", parent: "Conversation" },
  DialogAction: { kind: "subcomponent", parent: "Dialog" },
  DialogBody: { kind: "subcomponent", parent: "Dialog" },
  DialogClose: { kind: "subcomponent", parent: "Dialog" },
  DialogContent: { kind: "subcomponent", parent: "Dialog" },
  DialogDescription: { kind: "subcomponent", parent: "Dialog" },
  DialogFooter: { kind: "subcomponent", parent: "Dialog" },
  DialogHeader: { kind: "subcomponent", parent: "Dialog" },
  DialogTitle: { kind: "subcomponent", parent: "Dialog" },
  DialogTrigger: { kind: "subcomponent", parent: "Dialog" },
  DrawerBody: { kind: "subcomponent", parent: "Drawer" },
  DrawerClose: { kind: "subcomponent", parent: "Drawer" },
  DrawerFooter: { kind: "subcomponent", parent: "Drawer" },
  DrawerHeader: { kind: "subcomponent", parent: "Drawer" },
  DrawerV2Content: { kind: "subcomponent", parent: "DrawerV2" },
  DrawerV2Title: { kind: "subcomponent", parent: "DrawerV2" },
  DrawerV2Trigger: { kind: "subcomponent", parent: "DrawerV2" },
  MenuContent: { kind: "subcomponent", parent: "Menu" },
  MenuItem: { kind: "subcomponent", parent: "Menu" },
  MenuLabel: { kind: "subcomponent", parent: "Menu" },
  MenuSeparator: { kind: "subcomponent", parent: "Menu" },
  MenuSubContent: { kind: "subcomponent", parent: "Menu" },
  MenuTrigger: { kind: "subcomponent", parent: "Menu" },
  MessageContent: { kind: "subcomponent", parent: "Message" },
  MessageMarkdown: { kind: "subcomponent", parent: "Message" },
  PopoverContent: { kind: "subcomponent", parent: "Popover" },
  PopoverTrigger: { kind: "subcomponent", parent: "Popover" },
  ResizableHandle: { kind: "subcomponent", parent: "ResizableGroup" },
  ResizablePanel: { kind: "subcomponent", parent: "ResizableGroup" },
  ComposerAttachment: { kind: "subcomponent", parent: "Composer" },
  ComposerMicButton: { kind: "subcomponent", parent: "Composer" },
  SessionListItem: { kind: "subcomponent", parent: "SessionList" },
};

/**
 * Resolve a component's docs kind.
 *
 * @param {string} name      Component display name (may be dotted).
 * @param {string} file      Repo-relative source path.
 * @param {Record<string,string>} [tags]  JSDoc tags from react-docgen.
 * @returns {{ kind: string, parent?: string }}
 */
export function resolveKind(name, file, tags = {}) {
  // 1. JSDoc wins — authoring-time control for new components.
  if (tags.docsKind && KINDS.includes(tags.docsKind)) {
    return tags.docsParent
      ? { kind: tags.docsKind, parent: tags.docsParent }
      : { kind: tags.docsKind };
  }

  // 2. Hand-curated overrides.
  const override = KIND_OVERRIDES[name];
  if (override) return override;

  // 3a. Dotted names are compound parts of their prefix (Select.Item…).
  const dot = name.indexOf(".");
  if (dot > 0) {
    return { kind: "subcomponent", parent: name.slice(0, dot) };
  }

  // 3b. Source-path heuristics.
  if (file.startsWith("src/compat/")) {
    // src/compat/shadcn/AlertDialog.tsx → parent AlertDialog (the
    // compat root); the root itself carries no parent.
    const base = file.split("/").pop().replace(/\.tsx?$/, "");
    return name === base ? { kind: "compat" } : { kind: "compat", parent: base };
  }
  if (file.startsWith("src/primitives/")) return { kind: "primitive" };
  if (file.startsWith("src/provider/") || file.startsWith("src/i18n/")) {
    return { kind: "provider" };
  }

  // 4. Everything else is a visual element (icons, charts, components).
  return { kind: "element" };
}
