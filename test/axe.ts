import { axe, type AxeResults } from "jest-axe";

/**
 * Run axe and assert zero violations. Works seamlessly with vitest's `expect`
 * without the jest-axe custom matcher (which has compatibility issues with
 * vitest's expect.extend signature).
 */
export async function expectNoA11yViolations(container: Element): Promise<AxeResults> {
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
