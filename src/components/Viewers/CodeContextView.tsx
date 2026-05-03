"use client";

// CodeContextView — minimal "error at line N with surrounding context" primitive.
//
// Standalone alternative to `LogViewer` for the common CI / lint / compile
// failure summary pattern: a single error message attached to a specific
// file + line, with N lines of surrounding code rendered dimmed for
// orientation. LogViewer's per-entry `context` prop covers the same need
// inline; this component covers the "I just want one error block" use
// case without the LogViewer chrome.

import { forwardRef } from "react";
import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { cx } from "../../utils/cx";
import { toneAttrs } from "../../utils/toneAttrs";

export interface CodeContextViewProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * The file/source identifier shown in the header. Optional — omit when
   * the surrounding UI already says where the error is.
   */
  source?: ReactNode;
  /**
   * The 1-based line number being highlighted. Used as the visual anchor
   * inside `before`/`after`/`message`.
   */
  line?: number;
  /** Lines of code rendered dimmed BEFORE the error line. */
  before?: string[];
  /** The line that has the error. Rendered un-dimmed with the tone color. */
  errorLine?: string;
  /** Lines rendered dimmed AFTER the error line. */
  after?: string[];
  /** The error / warning message itself. */
  message?: ReactNode;
  /** Tone — default `"danger"`. Mirrors AlertV2/Badge tones. */
  tone?: "neutral" | "info" | "success" | "warning" | "danger";
  /** When true, renders a compact one-line variant (just message + line ref). */
  compact?: boolean;
  style?: CSSProperties;
}

/**
 * "Error at line N" block with `before`/`after` context. Use when CI failure
 * summaries, linter output, or stack-trace-style errors need to render with
 * surrounding code for orientation. For full streaming logs use `LogViewer`
 * with `LogEntry.context`.
 */
export const CodeContextView = forwardRef<HTMLDivElement, CodeContextViewProps>(
  function CodeContextView(
    {
      source,
      line,
      before,
      errorLine,
      after,
      message,
      tone = "danger",
      compact,
      className,
      style,
      ...props
    },
    ref
  ) {
    const ta = toneAttrs("vf-code-context", { tone });
    if (compact) {
      return (
        <div
          ref={ref}
          className={cx(ta.className, "vf-code-context--compact", className)}
          style={style}
          {...ta.attrs}
          {...props}
        >
          {source && <span className="vf-code-context__source">{source}</span>}
          {line !== undefined && (
            <span className="vf-code-context__line">:{line}</span>
          )}
          {message && <span className="vf-code-context__message">{message}</span>}
        </div>
      );
    }
    return (
      <div
        ref={ref}
        className={cx(ta.className, className)}
        style={style}
        {...ta.attrs}
        {...props}
      >
        {(source || line !== undefined) && (
          <header className="vf-code-context__header">
            {source && <span className="vf-code-context__source">{source}</span>}
            {line !== undefined && (
              <span className="vf-code-context__line">line {line}</span>
            )}
          </header>
        )}
        <pre className="vf-code-context__pre">
          {before?.length ? (
            <div className="vf-code-context__before">
              {before.map((b, i) => (
                <div key={`b${i}`} className="vf-code-context__context-line">
                  {b}
                </div>
              ))}
            </div>
          ) : null}
          {errorLine !== undefined && (
            <div className="vf-code-context__error-line">{errorLine}</div>
          )}
          {after?.length ? (
            <div className="vf-code-context__after">
              {after.map((a, i) => (
                <div key={`a${i}`} className="vf-code-context__context-line">
                  {a}
                </div>
              ))}
            </div>
          ) : null}
        </pre>
        {message && (
          <div className="vf-code-context__message">{message}</div>
        )}
      </div>
    );
  }
);
CodeContextView.displayName = "CodeContextView";
