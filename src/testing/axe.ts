// Phase 19 — Exported a11y helper.
//
// Thin wrapper around jest-axe that throws a human-readable error with
// a violation summary. Avoids the matcher-signature incompatibilities
// that `toHaveNoViolations` has with vitest.
//
// `jest-axe` is an optional peer. It is loaded lazily inside the helper so
// that importing `voidframe-ui/testing` (for renderWithVoidframe, the mocks,
// installMatchMedia…) works in projects that do not install it.

type AxeModule = typeof import("jest-axe");
type AxeResults = Awaited<ReturnType<AxeModule["axe"]>>;

async function loadAxe(): Promise<AxeModule["axe"]> {
  try {
    const mod = (await import("jest-axe")) as AxeModule;
    return mod.axe;
  } catch (err) {
    throw new Error(
      "expectNoA11yViolations needs the optional peer `jest-axe`. " +
        "Install it (`npm install -D jest-axe`) or drop the assertion. " +
        `Original error: ${err instanceof Error ? err.message : String(err)}`
    );
  }
}

export async function expectNoA11yViolations(
  container: Element
): Promise<AxeResults> {
  const axe = await loadAxe();
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
