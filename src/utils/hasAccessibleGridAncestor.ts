// ═══════════════════════════════════════════════════════════════
// hasAccessibleGridAncestor — grid-row-cell a11y ancestor check
// ═══════════════════════════════════════════════════════════════
//
// Voidframe form controls warn when rendered without an accessible
// name (label, aria-label, aria-labelledby). That's the right default
// — but it produces noisy false positives in data-dense matrix UIs
// (tier-routing grids, 6xN cells, toolbar filters) where the column
// header or row context IS the structural affordance.
//
// Form-control warning emitters should skip the warning when an
// ancestor element carries a grid/row/gridcell/table role — in those
// layouts assistive tech surfaces the structural context and an
// adjacent <label> would be redundant.

const GRID_ANCESTOR_ROLES = new Set([
  "grid",
  "row",
  "gridcell",
  "rowheader",
  "columnheader",
  "table",
  "treegrid",
  "listbox", // inline options inside a controlled listbox
]);

/**
 * Returns true if `el` has an ancestor (itself or up) carrying a
 * structural grid/row/table role. Used to suppress missing-label
 * a11y warnings when the role-based context makes the label
 * redundant.
 */
export function hasAccessibleGridAncestor(el: Element | null | undefined): boolean {
  if (!el) return false;
  let node: Element | null = el;
  while (node) {
    const role = node.getAttribute("role");
    if (role && GRID_ANCESTOR_ROLES.has(role)) return true;
    const tag = node.tagName;
    if (tag === "TABLE" || tag === "TR" || tag === "TH" || tag === "TD") return true;
    node = node.parentElement;
  }
  return false;
}
