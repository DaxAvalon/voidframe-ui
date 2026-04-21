// Per-category tree-shaking subpath. Re-exports a focused slice of the
// main library so consumers can `import { FadeIn } from "voidframe-ui/animation"`
// and drop every non-Animation component from their bundle.
//
// Source of truth: docs/taxonomy.ts Animation category.

export * from "../components/Animations";
