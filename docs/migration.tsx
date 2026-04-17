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

// Placeholder — no breaking changes yet at v1.0
export const migrations: MigrationGuide[] = [
  {
    id: "v1-to-v2",
    fromVersion: "1.x",
    toVersion: "2.0",
    breakingChanges: [],
    newFeatures: [
      "This is a placeholder for the v2 migration guide.",
      "Breaking changes will be documented here as they are introduced.",
    ],
    deprecations: [],
  },
];
