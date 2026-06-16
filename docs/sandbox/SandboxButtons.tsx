// Docs-only toolbar dropped into each Playground's header via its `actions`
// slot. Receives the current (possibly edited) snippet and opens it as a full
// project in StackBlitz or CodeSandbox.

import { openInStackBlitz, openInCodeSandbox } from "./index";

export interface SandboxButtonsProps {
  code: string;
  title?: string;
}

export function SandboxButtons({ code, title }: SandboxButtonsProps) {
  // Derive noInline from the live snippet so it tracks edits in the editor,
  // matching how a `render(...)` call is detected elsewhere in the docs.
  const opts = { noInline: /\brender\s*\(/.test(code), title };
  return (
    <>
      <button
        type="button"
        className="vf-playground__reset"
        title="Open this example in StackBlitz"
        onClick={() => openInStackBlitz(code, opts)}
      >
        StackBlitz ↗
      </button>
      <button
        type="button"
        className="vf-playground__reset"
        title="Open this example in CodeSandbox"
        onClick={() => openInCodeSandbox(code, opts)}
      >
        CodeSandbox ↗
      </button>
    </>
  );
}
