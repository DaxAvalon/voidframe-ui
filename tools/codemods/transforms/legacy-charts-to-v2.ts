/**
 * legacy-charts-to-v2
 *
 * Rewrites imports that still reference the legacy voidframe chart
 * surface (src/components/Charts) onto the top-level "voidframe" entry
 * that now exposes the Phase 22 chart surface.
 *
 * Covers:
 *   - `from "voidframe/dist/components/Charts"`  → `from "voidframe"`
 *   - `from "voidframe/src/components/Charts"`   → `from "voidframe"`
 *   - `from "voidframe/components/Charts"`       → `from "voidframe"`
 *
 * Does NOT attempt to rename identifiers (Sparkline → Sparkline is a
 * no-op; the new one has different props). Authors still need to review
 * call sites after this transform runs.
 */
import type {
  API,
  FileInfo,
  Options,
} from "jscodeshift";

const LEGACY_SOURCES = new Set([
  "voidframe/dist/components/Charts",
  "voidframe/src/components/Charts",
  "voidframe/components/Charts",
]);

export default function transform(
  file: FileInfo,
  api: API,
  _options: Options
): string {
  const j = api.jscodeshift;
  const root = j(file.source);
  let changed = false;

  root
    .find(j.ImportDeclaration)
    .filter((p) => {
      const s = p.node.source.value;
      return typeof s === "string" && LEGACY_SOURCES.has(s);
    })
    .forEach((p) => {
      p.node.source = j.literal("voidframe");
      changed = true;
    });

  return changed ? root.toSource({ quote: "double" }) : file.source;
}
