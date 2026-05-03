"use client";

// shadcn-shaped Select — flat named exports backed by voidframe's
// compound `Select.*` (shipped in v1.1 Phase C1). DOM + behavior
// identical to voidframe; just a flat naming pattern.

import {
  Select as VFSelect,
  SelectRoot,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../../components/Form";

// Voidframe ships both the prop-based `Select` and the compound
// `Select.Root` / `.Trigger` / etc. shadcn migrators expect the
// compound shape — re-export from the named exports so vite-plugin-dts
// can resolve subcomponent types in this subpath.
export const Select = SelectRoot ?? VFSelect;
export { SelectTrigger, SelectValue, SelectContent, SelectItem };
