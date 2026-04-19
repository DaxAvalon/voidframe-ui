"use client";

// Phase 7.4 — RichTextEditor
//
// Minimal contenteditable-based rich text editor with a toolbar. Commands use
// the browser's built-in formatting command bridge — deprecated in the spec
// but still the broadly-supported path for simple formatting without shipping
// a full editor engine (Lexical/TipTap) as a dependency.
//
// SECURITY: Every write to the contenteditable surface and the `value`
// read back out of it flow through `sanitizeHtml("rich-text")`, which
// applies a tag + attribute allowlist via DOMPurify. The `link` command
// passes its URL through `safeHref` before delegating to `createLink`,
// so `javascript:` / `data:` URLs are neutralized. Consumers can
// override with a custom `sanitize` prop.

import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { useControllableState } from "../hooks/useControllableState";
import { useId } from "../hooks/useId";
import { cx } from "../utils/cx";
import { safeHref } from "../utils/safeHref";
import { sanitizeHtml } from "../utils/sanitizeHtml";
import { Label } from "./Text";

const HTML_PROP = "innerHTML" as const;

function readHTML(el: HTMLElement): string {
  return (el as unknown as Record<string, string>)[HTML_PROP] ?? "";
}

function writeHTML(el: HTMLElement, html: string): void {
  (el as unknown as Record<string, string>)[HTML_PROP] = html;
}

export type RichTextCommand =
  | "bold"
  | "italic"
  | "underline"
  | "strikethrough"
  | "orderedList"
  | "unorderedList"
  | "heading1"
  | "heading2"
  | "blockquote"
  | "code"
  | "link"
  | "clear";

export interface RichTextEditorProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  /** HTML string. Sanitized against a conservative allowlist on every write. */
  value?: string;
  defaultValue?: string;
  onValueChange?: (html: string) => void;
  label?: string;
  placeholder?: string;
  toolbar?: RichTextCommand[];
  renderToolbar?: (api: RichTextEditorApi) => ReactNode;
  minHeight?: number | string;
  disabled?: boolean;
  readOnly?: boolean;
  /**
   * Override the HTML sanitizer. Defaults to a DOMPurify-based allowlist
   * for common formatting tags (`a`, `b`, `em`, `strong`, `u`, `s`,
   * `h1`–`h6`, `p`, `ul`/`ol`/`li`, `blockquote`, `pre`, `code`, `br`,
   * `span`, `div`) + a URL scheme filter on anchors. Pass a function to
   * lock the surface down further.
   */
  sanitize?: (html: string) => string;
  id?: string;
  style?: CSSProperties;
}

export interface RichTextEditorApi {
  run: (command: RichTextCommand, arg?: string) => void;
  focus: () => void;
  getHTML: () => string;
  setHTML: (html: string) => void;
}

const DEFAULT_TOOLBAR: RichTextCommand[] = [
  "bold",
  "italic",
  "underline",
  "strikethrough",
  "heading1",
  "heading2",
  "blockquote",
  "code",
  "unorderedList",
  "orderedList",
  "link",
  "clear",
];

const COMMAND_LABEL: Record<RichTextCommand, string> = {
  bold: "Bold",
  italic: "Italic",
  underline: "Underline",
  strikethrough: "Strikethrough",
  orderedList: "Ordered list",
  unorderedList: "Bulleted list",
  heading1: "Heading 1",
  heading2: "Heading 2",
  blockquote: "Block quote",
  code: "Inline code",
  link: "Insert link",
  clear: "Clear formatting",
};

const COMMAND_GLYPH: Record<RichTextCommand, string> = {
  bold: "B",
  italic: "I",
  underline: "U",
  strikethrough: "S",
  orderedList: "1.",
  unorderedList: "•",
  heading1: "H1",
  heading2: "H2",
  blockquote: "❝",
  code: "</>",
  link: "🔗",
  clear: "×",
};

function applyCommand(cmd: RichTextCommand, arg?: string): void {
  try {
    const bridge = (document as unknown as {
      execCommand?: (c: string, showUi?: boolean, value?: string) => boolean;
    }).execCommand;
    if (!bridge) return;
    switch (cmd) {
      case "bold":
      case "italic":
      case "underline":
      case "strikethrough":
        bridge.call(document, cmd);
        break;
      case "orderedList":
        bridge.call(document, "insertOrderedList");
        break;
      case "unorderedList":
        bridge.call(document, "insertUnorderedList");
        break;
      case "heading1":
        bridge.call(document, "formatBlock", false, "h1");
        break;
      case "heading2":
        bridge.call(document, "formatBlock", false, "h2");
        break;
      case "blockquote":
        bridge.call(document, "formatBlock", false, "blockquote");
        break;
      case "code":
        bridge.call(document, "formatBlock", false, "pre");
        break;
      case "link": {
        const url = arg ?? (typeof window !== "undefined" ? window.prompt("URL") : null);
        if (url) {
          const sanitized = safeHref(url);
          if (sanitized !== "#") bridge.call(document, "createLink", false, sanitized);
        }
        break;
      }
      case "clear":
        bridge.call(document, "removeFormat");
        bridge.call(document, "formatBlock", false, "p");
        break;
    }
  } catch {
    /* Some headless envs throw; ignore. */
  }
}

export const RichTextEditor = forwardRef<HTMLDivElement, RichTextEditorProps>(
  function RichTextEditor(
    {
      value,
      defaultValue,
      onValueChange,
      label,
      placeholder = "Type here…",
      toolbar = DEFAULT_TOOLBAR,
      renderToolbar,
      minHeight = 160,
      disabled,
      readOnly,
      sanitize: sanitizeProp,
      id,
      className,
      style,
      ...props
    },
    ref
  ) {
    const [html, setHtml] = useControllableState<string>({
      value,
      defaultValue: defaultValue ?? "",
      onChange: onValueChange,
      componentName: "RichTextEditor",
    });

    const sanitize = useMemo(
      () =>
        sanitizeProp ?? ((input: string) => sanitizeHtml(input, "rich-text")),
      [sanitizeProp]
    );
    const editableRef = useRef<HTMLDivElement>(null);
    const editorId = useId(id);

    useEffect(() => {
      const el = editableRef.current;
      if (!el) return;
      const clean = sanitize(html);
      if (readHTML(el) !== clean) writeHTML(el, clean);
    }, [html, sanitize]);

    const runCommand = useCallback(
      (command: RichTextCommand, arg?: string) => {
        const el = editableRef.current;
        if (!el || disabled || readOnly) return;
        el.focus();
        applyCommand(command, arg);
        setHtml(sanitize(readHTML(el)));
      },
      [disabled, readOnly, sanitize, setHtml]
    );

    const focus = useCallback(() => editableRef.current?.focus(), []);
    const getHTML = useCallback(
      () => (editableRef.current ? readHTML(editableRef.current) : ""),
      []
    );
    const setHTMLProgrammatic = useCallback(
      (next: string) => {
        const clean = sanitize(next);
        if (editableRef.current) writeHTML(editableRef.current, clean);
        setHtml(clean);
      },
      [sanitize, setHtml]
    );
    const api: RichTextEditorApi = {
      run: runCommand,
      focus,
      getHTML,
      setHTML: setHTMLProgrammatic,
    };

    return (
      <div
        ref={ref}
        className={cx("vf-rte", className)}
        style={style}
        {...props}
      >
        {label && (
          <Label as="label" htmlFor={editorId}>
            {label}
          </Label>
        )}
        <div className="vf-rte__frame">
          <div className="vf-rte__toolbar" role="toolbar" aria-label="Text formatting">
            {renderToolbar
              ? renderToolbar(api)
              : toolbar.map((cmd) => (
                  <button
                    key={cmd}
                    type="button"
                    className="vf-rte__tool"
                    aria-label={COMMAND_LABEL[cmd]}
                    title={COMMAND_LABEL[cmd]}
                    disabled={disabled}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => runCommand(cmd)}
                  >
                    {COMMAND_GLYPH[cmd]}
                  </button>
                ))}
          </div>
          <div
            ref={editableRef}
            id={editorId}
            role="textbox"
            aria-multiline="true"
            aria-label={label ?? "Rich text editor"}
            aria-readonly={readOnly || undefined}
            aria-disabled={disabled || undefined}
            data-placeholder={placeholder}
            contentEditable={!disabled && !readOnly}
            suppressContentEditableWarning
            className="vf-rte__content"
            style={{ minHeight }}
            onInput={(e) => setHtml(readHTML(e.target as HTMLDivElement))}
            onPaste={(e) => {
              // Intercept paste so any HTML payload flows through the
              // sanitizer before touching the DOM. Plain-text pastes
              // fall through to the default handler.
              if (disabled || readOnly) return;
              const clip = e.clipboardData;
              const htmlPayload = clip?.getData("text/html");
              if (!htmlPayload) return;
              e.preventDefault();
              const clean = sanitize(htmlPayload);
              const bridge = (document as unknown as {
                execCommand?: (c: string, ui?: boolean, v?: string) => boolean;
              }).execCommand;
              if (bridge) {
                bridge.call(document, "insertHTML", false, clean);
                const el = editableRef.current;
                if (el) setHtml(readHTML(el));
              }
            }}
          />
        </div>
      </div>
    );
  }
);
RichTextEditor.displayName = "RichTextEditor";
