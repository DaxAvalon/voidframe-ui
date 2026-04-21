/**
 * legacy-charts-to-v2
 *
 * Rewrites imports that still reference the legacy voidframe chart
 * surface (src/components/Charts) onto the top-level "voidframe-ui" entry
 * that now exposes the Phase 22 chart surface.
 *
 * Covers:
 *   - `from "voidframe-ui/dist/components/Charts"` → `from "voidframe-ui"`
 *   - `from "voidframe-ui/src/components/Charts"`  → `from "voidframe-ui"`
 *   - `from "voidframe-ui/components/Charts"`      → `from "voidframe-ui"`
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
  // Pre-rename variants (voidframe package name from phase 22).
  "voidframe/dist/components/Charts",
  "voidframe/src/components/Charts",
  "voidframe/components/Charts",
  // Post-rename variants (voidframe-ui package name from v1.0).
  "voidframe-ui/dist/components/Charts",
  "voidframe-ui/src/components/Charts",
  "voidframe-ui/components/Charts",
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
      p.node.source = j.literal("voidframe-ui");
      changed = true;
    });

  return changed ? root.toSource({ quote: "double" }) : file.source;
}
