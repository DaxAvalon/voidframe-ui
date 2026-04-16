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
}

function escapeHTML(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

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
      className,
      style,
      ...props
    },
    ref
  ) {
    const [copied, setCopied] = useState(false);
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
              {lines.map((line, i) => (
                <div
                  key={i}
                  className={cx(
                    "vf-codeblock__line",
                    highlightSet.has(i + 1) && "vf-codeblock__line--highlight"
                  )}
                >
                  {lineNumbers && (
                    <span className="vf-codeblock__linenum" aria-hidden="true">
                      {i + 1}
                    </span>
                  )}
                  <span className="vf-codeblock__linecontent">{line || " "}</span>
                </div>
              ))}
            </code>
          )}
        </pre>
      </div>
    );
  }
);
CodeBlock.displayName = "CodeBlock";

export { escapeHTML as escapeCodeHTML };
