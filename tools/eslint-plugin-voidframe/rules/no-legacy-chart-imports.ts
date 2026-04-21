import { ESLintUtils } from "@typescript-eslint/utils";

const createRule = ESLintUtils.RuleCreator(
  (name) => `https://voidframe.github.io/ui/eslint-plugin#${name}`
);

// Names removed in Phase 22 when the legacy chart surface was replaced.
// Consumers should import from the new charts surface (same package, same
// top-level `voidframe` entry) and drop the compatibility names.
const LEGACY_NAMES: Record<string, string> = {
  ChartContainer: "Use ChartFrame from voidframe (same import entry).",
  // Sparkline and Heatmap names are reused by the new surface but with
  // incompatible props — we flag legacy *imports* only when paired with the
  // legacy path. Name-only flagging would be too noisy.
};

// Module specifiers that are obviously the old legacy path. The current
// surface re-exports everything from `voidframe`.
const LEGACY_MODULES = new Set([
  "voidframe/dist/components/Charts",
  "voidframe/src/components/Charts",
  "voidframe/components/Charts",
]);

export default createRule({
  name: "no-legacy-chart-imports",
  meta: {
    type: "problem",
    docs: {
      description:
        "Reject imports of the legacy voidframe chart surface (Phase 22 replacement).",
    },
    messages: {
      legacyModule:
        'Module "{{module}}" is the legacy chart path. Import from "voidframe-ui" instead.',
      legacyName:
        'Legacy voidframe export "{{name}}". {{hint}}',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      ImportDeclaration(node) {
        const source = node.source.value;
        if (typeof source !== "string") return;
        if (LEGACY_MODULES.has(source)) {
          context.report({
            node: node.source,
            messageId: "legacyModule",
            data: { module: source },
          });
          return;
        }
        if (source !== "voidframe-ui") return;
        for (const spec of node.specifiers) {
          if (spec.type !== "ImportSpecifier") continue;
          const imported = spec.imported;
          if (imported.type !== "Identifier") continue;
          const hint = LEGACY_NAMES[imported.name];
          if (!hint) continue;
          context.report({
            node: spec,
            messageId: "legacyName",
            data: { name: imported.name, hint },
          });
        }
      },
    };
  },
});
