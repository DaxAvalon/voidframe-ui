"use client";

import {
  forwardRef,
  useEffect,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { cx } from "../../utils/cx";

const HTML_PROP = "innerHTML" as const;
function writeHTML(el: HTMLElement, html: string): void {
  (el as unknown as Record<string, string>)[HTML_PROP] = html;
}

// Shared helper that writes HTML through an imperative ref rather than the
// React attribute pattern — keeps us on one render path.
function HTMLPane({
  html,
  className,
  role,
  "aria-label": ariaLabel,
}: {
  html: string;
  className?: string;
  role?: string;
  "aria-label"?: string;
}): JSX.Element {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    writeHTML(el, html);
  }, [html]);
  return <div ref={ref} className={className} role={role} aria-label={ariaLabel} />;
}

// ── CodeBlock ────────────────────────────────────────────────

export interface CodeBlockProps extends HTMLAttributes<HTMLDivElement> {
  code: string;
  language?: string;
  theme?: string;
  lineNumbers?: boolean;
  highlightLines?: number[];
  copyable?: boolean;
  fileName?: ReactNode;
  maxHeight?: number | string;
  /**
   * Optional highlight function. Must return safe HTML (escapes its input)
   * OR ReactNode. When given a string, the CodeBlock writes through the
   * HTMLPane; callers are expected to sanitize.
   */
  highlight?: (code: string, language?: string) => string | ReactNode;
  /** Show a search bar above the code. Default false. */
  searchable?: boolean;
  /** Show a download button. Default false. */
  downloadable?: boolean;
  /** Filename for download. Defaults to "code.txt". */
  downloadFilename?: string;
  /**
   * Inline annotations attached to specific lines. Each entry pins a
   * `ReactNode` (typically an error message, lint note, or doc snippet)
   * directly below the matched 1-based line number. When `highlight` /
   * pre-rendered HTML is in use the annotations render after the matched
   * line by adding a sibling annotation block with the line-specific
   * content.
   */
  lineAnnotations?: Record<number, ReactNode>;
}

function escapeHTML(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Fenced code block with optional language-aware syntax highlighting, copy
 * button, and line numbers.
 */
export const CodeBlock = forwardRef<HTMLDivElement, CodeBlockProps>(
  function CodeBlock(
    {
      code,
      language,
      theme,
      lineNumbers = true,
      highlightLines,
      copyable,
      fileName,
      maxHeight,
      highlight,
      searchable = false,
      downloadable = false,
      downloadFilename = "code.txt",
      lineAnnotations,
      className,
      style,
      ...props
    },
    ref
  ) {
    const [copied, setCopied] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const lines = useMemo(() => code.split("\n"), [code]);
    const highlightSet = useMemo(
      () => new Set(highlightLines ?? []),
      [highlightLines]
    );

    const highlighted = useMemo(() => {
      if (!highlight) return null;
      return highlight(code, language);
    }, [highlight, code, language]);

    const copy = async () => {
      try {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      } catch {
        /* noop */
      }
    };

    const download = () => {
      const blob = new Blob([code], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = downloadFilename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    };

    /** Render line text with search matches highlighted. */
    const renderLineContent = (text: string): ReactNode => {
      if (!searchQuery || !text) return text || " ";
      const parts: ReactNode[] = [];
      let last = 0;
      const lower = text.toLowerCase();
      const q = searchQuery.toLowerCase();
      let idx = lower.indexOf(q, last);
      while (idx !== -1) {
        if (idx > last) parts.push(text.slice(last, idx));
        parts.push(<mark key={idx} className="vf-code-block__match">{text.slice(idx, idx + q.length)}</mark>);
        last = idx + q.length;
        idx = lower.indexOf(q, last);
      }
      if (last < text.length) parts.push(text.slice(last));
      return parts.length > 0 ? parts : (text || " ");
    };

    const showToolbar = searchable || downloadable;

    return (
      <div
        ref={ref}
        className={cx("vf-codeblock", className)}
        data-language={language}
        data-theme={theme}
        style={{
          ...(maxHeight !== undefined && {
            maxHeight: typeof maxHeight === "number" ? `${maxHeight}px` : maxHeight,
          }),
          ...style,
        }}
        {...props}
      >
        {(fileName || copyable) && (
          <div className="vf-codeblock__head">
            {fileName && <span className="vf-codeblock__filename">{fileName}</span>}
            {copyable && (
              <button
                type="button"
                className="vf-codeblock__copy"
                onClick={copy}
                aria-label="Copy code"
              >
                {copied ? "Copied" : "Copy"}
              </button>
            )}
          </div>
        )}
        {showToolbar && (
          <div className="vf-code-block__toolbar">
            {searchable && (
              <input
                type="text"
                className="vf-code-block__search"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search in code"
              />
            )}
            {downloadable && (
              <button
                type="button"
                className="vf-codeblock__download"
                onClick={download}
                aria-label="Download code"
              >
                Download
              </button>
            )}
          </div>
        )}
        <pre className="vf-codeblock__pre">
          {typeof highlighted === "string" ? (
            <HTMLPane
              className="vf-codeblock__highlight"
              html={highlighted}
              role="presentation"
            />
          ) : highlighted ? (
            <code>{highlighted}</code>
          ) : (
            <code>
              {lines.flatMap((line, i) => {
                const lineNo = i + 1;
                const annotation = lineAnnotations?.[lineNo];
                const lineEl = (
                  <div
                    key={`line-${i}`}
                    data-line-number={lineNo}
                    className={cx(
                      "vf-codeblock__line",
                      highlightSet.has(lineNo) && "vf-codeblock__line--highlight"
                    )}
                  >
                    {lineNumbers && (
                      <span className="vf-codeblock__linenum" aria-hidden="true">
                        {lineNo}
                      </span>
                    )}
                    <span className="vf-codeblock__linecontent">{renderLineContent(line)}</span>
                  </div>
                );
                if (annotation === undefined) return [lineEl];
                return [
                  lineEl,
                  <div
                    key={`anno-${i}`}
                    data-line-annotation={lineNo}
                    className="vf-codeblock__annotation"
                  >
                    {annotation}
                  </div>,
                ];
              })}
            </code>
          )}
        </pre>
      </div>
    );
  }
);
CodeBlock.displayName = "CodeBlock";

export { escapeHTML as escapeCodeHTML };
