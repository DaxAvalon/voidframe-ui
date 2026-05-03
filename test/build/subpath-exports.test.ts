/**
 * Verify that every subpath entry barrel exports at least one symbol.
 * This catches empty or broken re-export files before they reach dist.
 */
import { describe, it, expect } from "vitest";

const subpaths: Record<string, () => Promise<Record<string, unknown>>> = {
  "src/index.ts": () => import("../../src/index"),
  "src/charts/index.ts": () => import("../../src/charts/index"),
  "src/dev/index.ts": () => import("../../src/dev/index"),
  "src/tokens.ts": () => import("../../src/tokens"),
  "src/testing/index.ts": () => import("../../src/testing/index"),
  "src/subpaths/primitives.ts": () => import("../../src/subpaths/primitives"),
  "src/subpaths/core.ts": () => import("../../src/subpaths/core"),
  "src/subpaths/layout.ts": () => import("../../src/subpaths/layout"),
  "src/subpaths/navigation.ts": () => import("../../src/subpaths/navigation"),
  "src/subpaths/forms.ts": () => import("../../src/subpaths/forms"),
  "src/subpaths/data.ts": () => import("../../src/subpaths/data"),
  "src/subpaths/activity.ts": () => import("../../src/subpaths/activity"),
  "src/subpaths/overlays.ts": () => import("../../src/subpaths/overlays"),
  "src/subpaths/media.ts": () => import("../../src/subpaths/media"),
  "src/subpaths/animation.ts": () => import("../../src/subpaths/animation"),
  "src/subpaths/icons.ts": () => import("../../src/subpaths/icons"),
  "src/subpaths/chat.ts": () => import("../../src/subpaths/chat"),
  "src/subpaths/specialty.ts": () => import("../../src/subpaths/specialty"),
  "src/subpaths/interactive.ts": () => import("../../src/subpaths/interactive"),
  "src/subpaths/reactflow.ts": () => import("../../src/subpaths/reactflow"),
  "src/subpaths/compat-shadcn.ts": () =>
    import("../../src/subpaths/compat-shadcn"),
};

describe("subpath exports", () => {
  for (const [path, load] of Object.entries(subpaths)) {
    it(`${path} exports at least one symbol`, async () => {
      const mod = await load();
      const keys = Object.keys(mod);
      expect(keys.length).toBeGreaterThan(0);
    });
  }
});
