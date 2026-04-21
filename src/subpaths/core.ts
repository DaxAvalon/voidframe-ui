// Per-category tree-shaking subpath. Re-exports a focused slice of the
// main library so consumers can `import { Button } from "voidframe-ui/core"`
// and drop every non-Core component from their bundle.
//
// Source of truth: docs/taxonomy.ts Core category.

export * from "../components/Button";
export * from "../components/Badge";
export * from "../components/Card";
export * from "../components/Text";
export * from "../components/Loading";
export * from "../components/SplitButton";
export * from "../components/CopyButton";
export * from "../components/Result";
