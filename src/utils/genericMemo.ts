// ═══════════════════════════════════════════════════════════════
// genericMemo — React.memo that preserves generic type parameters
// ═══════════════════════════════════════════════════════════════
//
// React's `memo` collapses generics on the wrapped component because
// its return type is `React.MemoExoticComponent<typeof X>` — a
// non-generic constructor. This wrapper restores the generic by
// casting back to the original component's type signature, mirroring
// the pattern in `genericForwardRef` for `Table<T>` and `Combobox<T>`.
//
// Usage:
//
//   const TableImpl = genericForwardRef(function Table<T>(props, ref) { ... });
//   export const Table = genericMemo(TableImpl);

import { memo } from "react";

export function genericMemo<T extends object>(component: T): T {
  // memo's return type isn't generic-aware. Cast through `unknown` to
  // preserve the original signature so consumers still get
  // `<Table<User> data={users} />` autocomplete.
  return memo(component as never) as unknown as T;
}
