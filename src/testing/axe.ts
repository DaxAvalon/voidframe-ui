// Phase 19 — Exported a11y helper.
//
// Thin wrapper around jest-axe that throws a human-readable error with
// a violation summary. Avoids the matcher-signature incompatibilities
// that `toHaveNoViolations` has with vitest.

import { axe } from "jest-axe";

type AxeResults = Awaited<ReturnType<typeof axe>>;

export async function expectNoA11yViolations(
  container: Element
): Promise<AxeResults> {
  const results = await axe(container);
  if (results.violations.length > 0) {
    const summary = results.violations
      .map(
        (v) =>
          `  [${v.impact ?? "unknown"}] ${v.id}: ${v.description}\n    nodes: ${v.nodes.length}`
      )
      .join("\n");
    throw new Error(
      `Found ${results.violations.length} a11y violation(s):\n${summary}`
    );
  }
  return results;
}
