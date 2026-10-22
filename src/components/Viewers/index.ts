"use client";

// ── Viewers barrel ────────────────────────────────────────────
// Re-exports every public component and type from the Viewers module.

export { CodeBlock, escapeCodeHTML } from "./CodeBlock";
export type { CodeBlockProps } from "./CodeBlock";

export { CodeContextView } from "./CodeContextView";
export type { CodeContextViewProps } from "./CodeContextView";

export { JSONViewer } from "./JSONViewer";
export type { JSONViewerProps } from "./JSONViewer";

export { DiffViewer, lineDiff, wordDiff } from "./DiffViewer";
export type { DiffViewerProps, DiffOp, WordSpan } from "./DiffViewer";

export { LogViewer, Terminal } from "./LogViewer";
export type {
  LogLevel,
  LogEntry,
  LogViewerProps,
  TerminalProps,
} from "./LogViewer";

export { MarkdownRenderer } from "./MarkdownRenderer";
export type {
  MarkdownComponentMap,
  MarkdownPlugin,
  MarkdownRendererProps,
} from "./MarkdownRenderer";
