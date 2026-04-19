"use client";

// Phase 7.4 — CodeEditor (textarea wrapper with optional line numbers and
// syntax-highlighted overlay).
//
// This is intentionally a wrapper, not an engine. For a real engine (Monaco,
// CodeMirror, etc.) use their native components — this component shines when
// you want a lightweight, controlled code input with a consistent chrome.

import {
  forwardRef,
  useCallback,
  useMemo,
  useRef,
  type ChangeEvent,
  type CSSProperties,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { useControllableState } from "../hooks/useControllableState";
import { useId } from "../hooks/useId";
import { useMergedRefs } from "../hooks/useMergedRefs";
import { cx } from "../utils/cx";
import { Label } from "./Text";

export interface CodeEditorProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (code: string) => void;
  label?: string;
  placeholder?: string;
  language?: string;
  /** Provide your own highlighter. Must return HTML-safe markup. */
  highlight?: (code: string, language?: string) => ReactNode;
  /** Show a line-number gutter. */
  showLineNumbers?: boolean;
  /** Width of a single indent in spaces. Default 2. */
  tabSize?: number;
  disabled?: boolean;
  readOnly?: boolean;
  minHeight?: number | string;
  id?: string;
  style?: CSSProperties;
}

export const CodeEditor = forwardRef<HTMLDivElement, CodeEditorProps>(
  function CodeEditor(
    {
      value,
      defaultValue,
      onValueChange,
      label,
      placeholder = "Type code…",
      language,
      highlight,
      showLineNumbers = true,
      tabSize = 2,
      disabled,
      readOnly,
      minHeight = 200,
      id,
      className,
      style,
      ...props
    },
    ref
  ) {
    const [code, setCode] = useControllableState<string>({
      value,
      defaultValue: defaultValue ?? "",
      onChange: onValueChange,
      componentName: "CodeEditor",
    });

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const textareaId = useId(id);
    const containerRef = useMergedRefs(ref);

    const handleChange = useCallback(
      (e: ChangeEvent<HTMLTextAreaElement>) => setCode(e.target.value),
      [setCode]
    );

    const handleKey = useCallback(
      (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Tab") {
          e.preventDefault();
          const ta = e.currentTarget;
          const { selectionStart, selectionEnd, value: v } = ta;
          const indent = " ".repeat(tabSize);
          const next =
            v.slice(0, selectionStart) + indent + v.slice(selectionEnd);
          ta.value = next;
          ta.selectionStart = ta.selectionEnd = selectionStart + indent.length;
          setCode(next);
        }
      },
      [tabSize, setCode]
    );

    const lineCount = useMemo(() => Math.max(1, code.split("\n").length), [code]);

    const highlighted = useMemo<ReactNode | null>(
      () => (highlight ? highlight(code, language) : null),
      [highlight, code, language]
    );

    return (
      <div
        ref={containerRef}
        className={cx("vf-code-editor", className)}
        style={style}
        {...props}
      >
        {label && (
          <Label as="label" htmlFor={textareaId}>
            {label}
          </Label>
        )}
        <div className="vf-code-editor__frame" style={{ minHeight }}>
          {showLineNumbers && (
            <div aria-hidden="true" className="vf-code-editor__gutter">
              {Array.from({ length: lineCount }).map((_, i) => (
                <div key={i} className="vf-code-editor__line-num">
                  {i + 1}
                </div>
              ))}
            </div>
          )}
          <div className="vf-code-editor__body">
            {highlighted && (
              <pre aria-hidden="true" className="vf-code-editor__highlight">
                <code>{highlighted}</code>
              </pre>
            )}
            <textarea
              ref={textareaRef}
              id={textareaId}
              className={cx(
                "vf-code-editor__textarea",
                highlighted && "vf-code-editor__textarea--overlay"
              )}
              value={code}
              onChange={handleChange}
              onKeyDown={handleKey}
              placeholder={placeholder}
              disabled={disabled}
              readOnly={readOnly}
              aria-label={label ?? "Code editor"}
              spellCheck={false}
              autoCapitalize="off"
              autoCorrect="off"
              data-language={language || undefined}
            />
          </div>
        </div>
      </div>
    );
  }
);
CodeEditor.displayName = "CodeEditor";
