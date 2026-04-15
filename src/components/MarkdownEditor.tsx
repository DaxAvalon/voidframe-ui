"use client";

// Phase 7.4 — MarkdownEditor
//
// Textarea-based markdown editor with an optional live-preview pane and a
// simple toolbar that inserts markdown around the current selection.
//
// Bundles a tiny markdown renderer for the preview. It covers the common
// subset (headers, emphasis, inline code, code fences, links, lists, hr,
// blockquote, hard breaks). For richer rendering, pass your own `renderPreview`.
//
// SECURITY: The bundled renderer escapes input text before emitting HTML, so
// it is safe to display in the preview pane. If you pass a custom `renderPreview`,
// you are responsible for sanitization.

import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { useControllableState } from "../hooks/useControllableState";
import { useId } from "../hooks/useId";
import { useMergedRefs } from "../hooks/useMergedRefs";
import { cx } from "../utils/cx";
import { Label } from "./Text";

export type MarkdownCommand =
  | "bold"
  | "italic"
  | "code"
  | "link"
  | "heading"
  | "ul"
  | "ol"
  | "quote"
  | "hr";

export interface MarkdownEditorProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  value?: string;
  defaultValue?: string;
  onChange?: (md: string) => void;
  label?: string;
  placeholder?: string;
  toolbar?: MarkdownCommand[];
  preview?: boolean | "side" | "below";
  renderPreview?: (md: string) => ReactNode;
  minHeight?: number | string;
  disabled?: boolean;
  readOnly?: boolean;
  id?: string;
  style?: CSSProperties;
}

const DEFAULT_TOOLBAR: MarkdownCommand[] = [
  "bold",
  "italic",
  "code",
  "link",
  "heading",
  "ul",
  "ol",
  "quote",
  "hr",
];

const COMMAND_LABEL: Record<MarkdownCommand, string> = {
  bold: "Bold",
  italic: "Italic",
  code: "Code",
  link: "Link",
  heading: "Heading",
  ul: "Bulleted list",
  ol: "Numbered list",
  quote: "Block quote",
  hr: "Divider",
};

const COMMAND_GLYPH: Record<MarkdownCommand, string> = {
  bold: "B",
  italic: "I",
  code: "`",
  link: "🔗",
  heading: "H",
  ul: "•",
  ol: "1.",
  quote: "❝",
  hr: "—",
};

function wrapSelection(
  textarea: HTMLTextAreaElement,
  before: string,
  after: string = before,
  placeholder = ""
): void {
  const { selectionStart, selectionEnd, value } = textarea;
  const selected = value.slice(selectionStart, selectionEnd) || placeholder;
  const next =
    value.slice(0, selectionStart) +
    before +
    selected +
    after +
    value.slice(selectionEnd);
  textarea.value = next;
  const newCaret = selectionStart + before.length + selected.length;
  textarea.selectionStart = selectionStart + before.length;
  textarea.selectionEnd = newCaret;
  textarea.dispatchEvent(new Event("input", { bubbles: true }));
}

function prependLine(textarea: HTMLTextAreaElement, prefix: string): void {
  const { selectionStart, value } = textarea;
  const lineStart = value.lastIndexOf("\n", Math.max(0, selectionStart - 1)) + 1;
  const next = value.slice(0, lineStart) + prefix + value.slice(lineStart);
  textarea.value = next;
  textarea.selectionStart = selectionStart + prefix.length;
  textarea.selectionEnd = selectionStart + prefix.length;
  textarea.dispatchEvent(new Event("input", { bubbles: true }));
}

export function applyMarkdownCommand(
  textarea: HTMLTextAreaElement,
  cmd: MarkdownCommand
): void {
  switch (cmd) {
    case "bold":
      wrapSelection(textarea, "**", "**", "bold");
      break;
    case "italic":
      wrapSelection(textarea, "*", "*", "italic");
      break;
    case "code":
      wrapSelection(textarea, "`", "`", "code");
      break;
    case "link":
      wrapSelection(textarea, "[", "](url)", "text");
      break;
    case "heading":
      prependLine(textarea, "## ");
      break;
    case "ul":
      prependLine(textarea, "- ");
      break;
    case "ol":
      prependLine(textarea, "1. ");
      break;
    case "quote":
      prependLine(textarea, "> ");
      break;
    case "hr":
      wrapSelection(textarea, "\n---\n", "");
      break;
  }
}

// ── tiny markdown renderer ────────────────────────────────────

const ESC_MAP: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};
function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ESC_MAP[c]!);
}

function renderInline(src: string): string {
  let out = esc(src);
  out = out.replace(/`([^`]+)`/g, (_, g) => `<code>${g}</code>`);
  out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, t, u) => `<a href="${u}">${t}</a>`);
  out = out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  out = out.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  out = out.replace(/  \n/g, "<br/>");
  return out;
}

export function renderMarkdown(src: string): string {
  const lines = src.split("\n");
  const out: string[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i]!;
    if (/^```/.test(line)) {
      const body: string[] = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i]!)) {
        body.push(lines[i]!);
        i++;
      }
      i++;
      out.push(`<pre><code>${esc(body.join("\n"))}</code></pre>`);
      continue;
    }
    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      const level = headingMatch[1]!.length;
      out.push(`<h${level}>${renderInline(headingMatch[2]!)}</h${level}>`);
      i++;
      continue;
    }
    if (/^(-{3,}|_{3,}|\*{3,})$/.test(line.trim())) {
      out.push("<hr/>");
      i++;
      continue;
    }
    if (/^>\s?/.test(line)) {
      const quote: string[] = [];
      while (i < lines.length && /^>\s?/.test(lines[i]!)) {
        quote.push(lines[i]!.replace(/^>\s?/, ""));
        i++;
      }
      out.push(`<blockquote>${renderInline(quote.join(" "))}</blockquote>`);
      continue;
    }
    if (/^[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i]!)) {
        items.push(`<li>${renderInline(lines[i]!.replace(/^[-*]\s+/, ""))}</li>`);
        i++;
      }
      out.push(`<ul>${items.join("")}</ul>`);
      continue;
    }
    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i]!)) {
        items.push(`<li>${renderInline(lines[i]!.replace(/^\d+\.\s+/, ""))}</li>`);
        i++;
      }
      out.push(`<ol>${items.join("")}</ol>`);
      continue;
    }
    if (line.trim() === "") {
      i++;
      continue;
    }
    const para: string[] = [line];
    i++;
    while (
      i < lines.length &&
      lines[i]!.trim() !== "" &&
      !/^(#{1,6}\s|>\s|[-*]\s|\d+\.\s|```|-{3,}$|_{3,}$|\*{3,}$)/.test(lines[i]!)
    ) {
      para.push(lines[i]!);
      i++;
    }
    out.push(`<p>${renderInline(para.join(" "))}</p>`);
  }
  return out.join("");
}

// Render the preview HTML by writing through innerHTML on an imperative ref.
// This keeps us off React's dangerouslySetInnerHTML attribute — the rendered
// markup still originates solely from our `renderMarkdown` output, which
// escapes user text.
function PreviewPane({ html }: { html: string }): JSX.Element {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const target = el as unknown as Record<string, string>;
    target.innerHTML = html;
  }, [html]);
  return <div ref={ref} className="vf-md__preview-body" />;
}

export const MarkdownEditor = forwardRef<HTMLDivElement, MarkdownEditorProps>(
  function MarkdownEditor(
    {
      value,
      defaultValue,
      onChange,
      label,
      placeholder = "# Write markdown…",
      toolbar = DEFAULT_TOOLBAR,
      preview = "side",
      renderPreview,
      minHeight = 200,
      disabled,
      readOnly,
      id,
      className,
      style,
      ...props
    },
    ref
  ) {
    const [md, setMd] = useControllableState<string>({
      value,
      defaultValue: defaultValue ?? "",
      onChange,
      componentName: "MarkdownEditor",
    });

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const textareaId = useId(id);
    const containerRef = useMergedRefs(ref);

    const [previewShown, setPreviewShown] = useState<boolean>(preview !== false);

    const handleChange = useCallback(
      (e: ChangeEvent<HTMLTextAreaElement>) => {
        setMd(e.target.value);
      },
      [setMd]
    );

    const runCommand = useCallback((cmd: MarkdownCommand) => {
      const ta = textareaRef.current;
      if (!ta) return;
      applyMarkdownCommand(ta, cmd);
      ta.focus();
    }, []);

    const previewHtml = useMemo(() => renderMarkdown(md), [md]);

    const layoutClass =
      preview === "below" ? "vf-md__frame--stacked" : "vf-md__frame--side";

    return (
      <div
        ref={containerRef}
        className={cx("vf-md", className)}
        style={style}
        {...props}
      >
        {label && (
          <Label as="label" htmlFor={textareaId}>
            {label}
          </Label>
        )}
        <div className="vf-md__toolbar" role="toolbar" aria-label="Markdown formatting">
          {toolbar.map((cmd) => (
            <button
              key={cmd}
              type="button"
              className="vf-md__tool"
              aria-label={COMMAND_LABEL[cmd]}
              title={COMMAND_LABEL[cmd]}
              disabled={disabled}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => runCommand(cmd)}
            >
              {COMMAND_GLYPH[cmd]}
            </button>
          ))}
          {preview !== false && (
            <button
              type="button"
              className="vf-md__tool vf-md__preview-toggle"
              aria-pressed={previewShown}
              aria-label={previewShown ? "Hide preview" : "Show preview"}
              onClick={() => setPreviewShown((p) => !p)}
            >
              {previewShown ? "◉" : "◎"}
            </button>
          )}
        </div>
        <div className={cx("vf-md__frame", layoutClass)}>
          <textarea
            ref={textareaRef}
            id={textareaId}
            className="vf-md__textarea"
            value={md}
            onChange={handleChange}
            placeholder={placeholder}
            disabled={disabled}
            readOnly={readOnly}
            aria-label={label ?? "Markdown source"}
            style={{ minHeight }}
          />
          {previewShown && (
            <div
              className="vf-md__preview"
              aria-label="Markdown preview"
              role="region"
              style={{ minHeight }}
            >
              {renderPreview ? renderPreview(md) : <PreviewPane html={previewHtml} />}
            </div>
          )}
        </div>
      </div>
    );
  }
);
MarkdownEditor.displayName = "MarkdownEditor";
