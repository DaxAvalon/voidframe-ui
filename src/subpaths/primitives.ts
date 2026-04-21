// Per-category tree-shaking subpath. Re-exports a focused slice of the
// main library so consumers can `import { Slot } from "voidframe-ui/primitives"`
// and drop every non-Primitives component from their bundle.
//
// Source of truth: docs/taxonomy.ts Primitives prefix rule (src/primitives/).

export * from "../primitives";
