// Per-category tree-shaking subpath. Re-exports a focused slice of the
// main library so consumers can `import { DataGrid } from "voidframe-ui/data"`
// and drop every non-Data component from their bundle.
//
// Source of truth: docs/taxonomy.ts Data category.
//
// Note: the legacy `Viewers.tsx` monolith was split into a directory
// with a barrel, so `../components/Viewers` resolves to that barrel and
// surfaces CodeBlock / DiffViewer / JSONViewer / LogViewer /
// MarkdownRenderer in one star-export.

export * from "../components/Data";
export * from "../components/DataExtended";
export * from "../components/DataList";
export * from "../components/DataGrid";
export * from "../components/TreeView";
export * from "../components/TreeTable";
export * from "../components/Virtualization";
export * from "../components/Viewers";
export * from "../components/Metrics";
export * from "../components/NotificationBadge";
export * from "../components/SkeletonComposites";
export * from "../components/HorizontalTimeline";
export * from "../components/Descriptions";
export * from "../components/MultiProgress";
export * from "../components/CSVViewer";
export * from "../components/ConfidenceMeter";
export * from "../components/AsyncData";
