// ═══════════════════════════════════════════════════════════════
// genericForwardRef — forwardRef that preserves generics
// React's `forwardRef` collapses generics (returns a non-generic
// component). This wrapper restores them for `Table<T>`, `Combobox<T>`, etc.
// ═══════════════════════════════════════════════════════════════

import { forwardRef } from "react";
import type { ForwardedRef, ReactElement } from "react";

/**
 * `forwardRef` that preserves generic type parameters.
 *
 * @example
 * const Table = genericForwardRef(function Table<T>(
 *   props: TableProps<T>,
 *   ref: Ref<HTMLDivElement>
 * ) {
 *   return <div ref={ref}>...</div>;
 * });
 *
 * <Table<User> data={users} columns={cols} />
 */
export function genericForwardRef<T, P = Record<string, unknown>>(
  render: (props: P, ref: ForwardedRef<T>) => ReactElement | null
): (props: P & { ref?: ForwardedRef<T> }) => ReactElement | null {
  // forwardRef's typing is too narrow for generics — cast intentionally.
  return forwardRef(render as never) as never;
}
