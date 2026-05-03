export interface BreakingChange {
  component: string;
  description: string;
  before: string;
  after: string;
}

export interface MigrationGuide {
  id: string;
  fromVersion: string;
  toVersion: string;
  date?: string;
  breakingChanges: BreakingChange[];
  newFeatures: string[];
  deprecations: string[];
}

export const migrations: MigrationGuide[] = [
  {
    id: "v1-to-v1.1",
    fromVersion: "1.0",
    toVersion: "1.1",
    breakingChanges: [
      {
        component: "Drawer",
        description:
          "`<Drawer>` is deprecated in favour of the compound `<DrawerV2>`. The old API still works in 1.x but emits a dev warning; the removal target is now 1.2 (slipped from 1.1, since 1.1 is intentionally additive). `DrawerV2` is a superset — same props plus `DrawerV2.Header`, `DrawerV2.Body`, `DrawerV2.Footer` subparts.",
        before: `<Drawer open={open} onClose={close} title="Details">\n  <p>…</p>\n</Drawer>`,
        after: `<DrawerV2 open={open} onOpenChange={setOpen}>\n  <DrawerV2.Header>Details</DrawerV2.Header>\n  <DrawerV2.Body>\n    <p>…</p>\n  </DrawerV2.Body>\n</DrawerV2>`,
      },
      {
        component: "Button",
        description:
          "The `primary` boolean prop on `<Button>` is deprecated. Use `variant=\"accent\"` instead. ESLint's `no-deprecated-props` auto-flags the old usage.",
        before: `<Button primary>Save</Button>`,
        after: `<Button variant="accent">Save</Button>`,
      },
    ],
    newFeatures: [
      "`<DrawerV2>` compound API with scoped header / body / footer.",
    ],
    deprecations: [
      "`<Drawer>` (use `<DrawerV2>`).",
      "`<Button primary>` (use `variant=\"accent\"`).",
    ],
  },
  {
    id: "pre-1.0-readiness",
    fromVersion: "0.x",
    toVersion: "1.0",
    breakingChanges: [
      {
        component: "Package",
        description:
          "The npm package has been renamed from `voidframe` to `voidframe-ui`. Update every import source and the stylesheet subpath. The subpaths (`/charts`, `/dev`, `/tokens`, `/testing`, `/theme-script.js`) moved with the package.",
        before: `import { Button } from "voidframe";\nimport "voidframe/styles.css";\nimport { BarChart } from "voidframe/charts";`,
        after: `import { Button } from "voidframe-ui";\nimport "voidframe-ui/styles.css";\nimport { BarChart } from "voidframe-ui/charts";`,
      },
      {
        component: "Dialog",
        description:
          "`Dialog.Cancel` and `Dialog.Action` now accept an `asChild` prop so you can project into your own `<Button>` without nesting interactive elements.",
        before: `<Dialog.Action>\n  <Button variant="solid">Delete</Button>\n</Dialog.Action>`,
        after: `<Dialog.Action asChild>\n  <Button variant="solid">Delete</Button>\n</Dialog.Action>`,
      },
      {
        component: "ReactionPicker",
        description:
          "`onReact` has been renamed to `onPick` on `<ReactionPicker>` to distinguish it from `<ReactionBar>` (which still emits `onReact`). The payload also changes from the emoji character to the `Reaction.id`.",
        before: `<ReactionPicker reactions={reactions} onReact={(emoji) => addReaction(emoji)} />`,
        after: `<ReactionPicker reactions={reactions} onPick={(id) => addReaction(id)} />`,
      },
      {
        component: "ContextMenu",
        description:
          "Clicking a `<ContextMenu>` item now dismisses the menu (previously click events were stopped before reaching the open-close registry). If you relied on the menu staying open after a click, move that branch into a submenu or capture the event earlier.",
        before: `<ContextMenu.Item onSelect={run} />  // menu stayed open`,
        after: `<ContextMenu.Item onSelect={run} />  // menu now closes on click`,
      },
      {
        component: "MenuBar",
        description:
          "`<MenuBar>` triggers now render with `role=\"menuitem\"` instead of `button`. Update any screen-reader snapshots / a11y assertions that match on the trigger role. Sibling menus also close when one opens via a shared activeId registry.",
        before: `expect(trigger).toHaveAttribute("role", "button");`,
        after: `expect(trigger).toHaveAttribute("role", "menuitem");`,
      },
      {
        component: "Toolbar",
        description:
          "`<Toolbar>` now implements WAI-ARIA toolbar roving-tabindex — arrow keys move focus between child controls. Existing keyboard flows that relied on Tab to cycle within the toolbar should still work, but arrow keys are no longer inert.",
        before: `// Arrow keys did nothing inside <Toolbar>`,
        after: `// ArrowLeft / ArrowRight / Home / End now move focus`,
      },
      {
        component: "Callout",
        description:
          "The `<Callout>` root element changed from `<aside>` to `<div>`, so it is no longer a `complementary` landmark. If you relied on landmark navigation to jump to callouts, wrap them in your own `<aside>` at the page level.",
        before: `<aside class="vf-callout" role="note">`,
        after: `<div class="vf-callout" role="note">`,
      },
    ],
    newFeatures: [
      "`Dialog.Cancel` / `Dialog.Action` support `asChild` for projection.",
      "`<Toolbar>` roving-tabindex arrow-key navigation.",
      "`<MenuBar>` sibling auto-close via shared activeId registry.",
      "`<Menu>` auto-focuses the first item when opened.",
      "`<ResizableHandle>` exposes `aria-valuenow/min/max/text` (percentage).",
      "`<CommandPalette>` full combobox semantics (`role=\"combobox\"` + `aria-controls`/`aria-owns` → listbox; `Group` is `role=\"presentation\"`).",
      "`<Avatar>` status dot span now carries `role=\"img\"` for screen-reader labelling.",
    ],
    deprecations: [
      "`voidframe` package name (use `voidframe-ui`).",
      "`ReactionPicker`'s `onReact` (use `onPick`).",
    ],
  },
  {
    id: "v1-to-v2",
    fromVersion: "1.x",
    toVersion: "2.0",
    breakingChanges: [],
    newFeatures: [],
    deprecations: [],
  },
];
