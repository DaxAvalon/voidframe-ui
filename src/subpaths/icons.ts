// Per-category tree-shaking subpath. Re-exports a focused slice of the
// main library so consumers can `import { Icon } from "voidframe-ui/icons"`
// and drop every non-Icons component from their bundle.
//
// Source of truth: docs/taxonomy.ts Icons prefix rule (src/icons/).

export * from "../icons";
