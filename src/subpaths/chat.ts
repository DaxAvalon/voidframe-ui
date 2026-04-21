// Per-category tree-shaking subpath. Re-exports a focused slice of the
// main library so consumers can `import { Conversation } from "voidframe-ui/chat"`
// and drop every non-Chat component from their bundle.
//
// Source of truth: docs/taxonomy.ts "Chat & AI" category.
//
// Note: the legacy `Chat.tsx` monolith was split into a directory with
// a barrel, so `../components/Chat` resolves to that barrel and surfaces
// Conversation / Message / Indicators / Actions / Reactions / Edit in
// one star-export.

export * from "../components/Chat";
export * from "../components/ChatAgent";
export * from "../components/ChatAttachments";
export * from "../components/ChatCitations";
export * from "../components/ChatComposer";
export * from "../components/ChatModel";
export * from "../components/ChatSession";
export * from "../components/ModelCompare";
export * from "../components/TokenVisualizer";
