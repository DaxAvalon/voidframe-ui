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
          "`<Drawer>` is deprecated in favour of the compound `<DrawerV2>`. The old API still works in 1.x but emits a dev warning; it will be removed in 1.1. `DrawerV2` is a superset — same props plus `DrawerV2.Header`, `DrawerV2.Body`, `DrawerV2.Footer` subparts.",
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
    id: "v1-to-v2",
    fromVersion: "1.x",
    toVersion: "2.0",
    breakingChanges: [],
    newFeatures: [],
    deprecations: [],
  },
];
