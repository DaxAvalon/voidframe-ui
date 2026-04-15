"use client";

import { useCallback, useState, type CSSProperties } from "react";
import { LiveProvider, LiveEditor, LiveError, LivePreview } from "react-live";
import { cx } from "../utils/cx";

export interface PlaygroundProps {
  /** Initial source snippet. May be a bare JSX expression or a full `render(<...>)` call. */
  code: string;
  /** Identifiers available to the snippet. Typically voidframe exports. */
  scope?: Record<string, unknown>;
  /** className for the wrapper. */
  className?: string;
  /** Height of the code and preview panes. Default: "auto". */
  paneHeight?: string | number;
  /** Label above the playground. */
  title?: string;
  /** When true, the snippet is treated as an expression; otherwise it's a full block ending with `render(...)`. */
  noInline?: boolean;
}

export function Playground({
  code: initialCode,
  scope,
  className,
  paneHeight = 220,
  title = "Playground",
  noInline = false,
}: PlaygroundProps) {
  const [code, setCode] = useState(initialCode);
  const reset = useCallback(() => setCode(initialCode), [initialCode]);

  const paneStyle: CSSProperties = {
    height: typeof paneHeight === "number" ? `${paneHeight}px` : paneHeight,
  };

  return (
    <div className={cx("vf-playground", className)}>
      <div className="vf-playground__head">
        <span className="vf-playground__title">{title}</span>
        <button
          type="button"
          className="vf-playground__reset"
          onClick={reset}
        >
          Reset
        </button>
      </div>
      <LiveProvider code={code} scope={scope} noInline={noInline}>
        <div className="vf-playground__body">
          <div className="vf-playground__pane vf-playground__pane--code">
            <label className="vf-playground__label">CODE</label>
            <div className="vf-playground__editor" style={paneStyle}>
              <LiveEditor
                onChange={setCode}
                style={{
                  fontFamily: "var(--vf-font-family)",
                  fontSize: "var(--vf-fs-1, 12px)",
                  background: "var(--vf-bg-0)",
                  color: "var(--vf-text-0)",
                  height: "100%",
                  overflow: "auto",
                }}
              />
            </div>
          </div>
          <div className="vf-playground__pane vf-playground__pane--preview">
            <label className="vf-playground__label">PREVIEW</label>
            <div className="vf-playground__preview" style={paneStyle}>
              <LivePreview />
            </div>
            <LiveError className="vf-playground__error" />
          </div>
        </div>
      </LiveProvider>
    </div>
  );
}
Playground.displayName = "Playground";
