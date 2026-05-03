// ═══════════════════════════════════════════════════════════════
// useItemKey — normalize per-row / per-item key emission
// ═══════════════════════════════════════════════════════════════
//
// Table / DataGrid / DataList / TreeView / Virtualization etc. all
// accept a `rowKey` (or equivalent) that's used internally for React
// keys. Historically voidframe didn't forward the derived value to
// the DOM, so test suites that query rows by ID (`getByTestId`) had
// to inject test markers inside a column's render function.
//
// `useItemKey` normalizes the rowKey result to a string and produces
// a consistent `data-row-key` / `data-item-key` attribute every
// collection-rendering component emits. Consumer tests now work
// with `[data-row-key="id-123"]` selectors uniformly.

export type ItemKey<T> = keyof T | ((item: T) => string | number | symbol);

/**
 * Resolve a rowKey/itemKey prop against an item and return the
 * stringified value. Symbol keys are coerced via `String(...)` —
 * rare, but avoids throwing on unusual shapes.
 */
export function resolveItemKey<T>(key: ItemKey<T> | undefined, item: T): string {
  if (key === undefined) return "";
  if (typeof key === "function") {
    const r = (key as (item: T) => string | number | symbol)(item);
    return typeof r === "symbol" ? String(r) : String(r);
  }
  const r = (item as Record<string, unknown>)[key as string];
  return r === undefined || r === null ? "" : String(r);
}

/**
 * Produce the standard `data-row-key` / `data-item-key` attribute
 * pair for a given resolved key string. Components should prefer
 * this over hand-rolling the attribute name so tests can rely on
 * a single convention.
 */
export function itemKeyAttrs(
  kind: "row" | "item" | "node",
  resolved: string
): { "data-row-key"?: string; "data-item-key"?: string; "data-node-key"?: string } {
  if (!resolved) return {};
  if (kind === "row") return { "data-row-key": resolved };
  if (kind === "item") return { "data-item-key": resolved };
  return { "data-node-key": resolved };
}
