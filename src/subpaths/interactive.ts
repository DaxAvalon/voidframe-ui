// Per-category tree-shaking subpath. Re-exports a focused slice of the
// main library so consumers can `import { Accordion } from "voidframe-ui/interactive"`
// and drop every non-Interactive component from their bundle.
//
// Source of truth: docs/taxonomy.ts Interactive category.

export * from "../components/Interactive";
export * from "../components/Gestures";
export * from "../components/DragDrop";
export * from "../components/Accordion";
export * from "../components/FilterBuilder";
