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
// SECURITY: The bundled renderer emits React elements — never innerHTML
// strings — and validates link URLs through `safeHref`. User input can
// never escape into a script context because React automatically escapes
// text and attribute values. If you pass a custom `renderPreview`, you
// are responsible for sanitization.

import {
  Fragment,
  forwardRef,
  useCallback,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
} from "react";
import { useControllableState } from "../hooks/useControllableState";
import { useId } from "../hooks/useId";
import { useMergedRefs } from "../hooks/useMergedRefs";
import { cx } from "../utils/cx";
import { safeHref } from "../utils/safeHref";
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
  onValueChange?: (md: string) => void;
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

// ── Safe markdown renderer ────────────────────────────────────
//
// Emits React elements directly — user text lives inside text-node
// children or attribute values that React escapes, so no innerHTML,
// no regex-chain composition, no attribute injection. Links pass
// through `safeHref` which rejects `javascript:`, `data:`,
// `vbscript:` etc.

type InlineToken =
  | { type: "text"; value: string }
  | { type: "strong"; children: InlineToken[] }
  | { type: "em"; children: InlineToken[] }
  | { type: "code"; value: string }
  | { type: "link"; href: string; children: InlineToken[] }
  | { type: "br" };

/**
 * Tokenize an inline-level markdown string. The tokenizer walks the
 * source once without chaining regex `replace` calls, so later stages
 * can never re-match already-emitted markup (the previous regex
 * pipeline was vulnerable to that class of bug).
 */
function tokenizeInline(src: string): InlineToken[] {
  const tokens: InlineToken[] = [];
  let buffer = "";
  let i = 0;
  const flush = () => {
    if (buffer) {
      tokens.push({ type: "text", value: buffer });
      buffer = "";
    }
  };
  while (i < src.length) {
    const ch = src[i]!;

    // Hard break: "  \n"
    if (ch === " " && src[i + 1] === " " && src[i + 2] === "\n") {
      flush();
      tokens.push({ type: "br" });
      i += 3;
      continue;
    }

    // Inline code: `...`
    if (ch === "`") {
      const end = src.indexOf("`", i + 1);
      if (end !== -1) {
        flush();
        tokens.push({ type: "code", value: src.slice(i + 1, end) });
        i = end + 1;
        continue;
      }
    }

    // Link: [text](href)
    if (ch === "[") {
      const close = src.indexOf("]", i + 1);
      if (close !== -1 && src[close + 1] === "(") {
        const paren = src.indexOf(")", close + 2);
        if (paren !== -1) {
          flush();
          const label = src.slice(i + 1, close);
          const href = src.slice(close + 2, paren);
          tokens.push({
            type: "link",
            href,
            children: tokenizeInline(label),
          });
          i = paren + 1;
          continue;
        }
      }
    }

    // Bold: **...**
    if (ch === "*" && src[i + 1] === "*") {
      const end = src.indexOf("**", i + 2);
      if (end !== -1) {
        flush();
        tokens.push({
          type: "strong",
          children: tokenizeInline(src.slice(i + 2, end)),
        });
        i = end + 2;
        continue;
      }
    }

    // Emphasis: *...*
    if (ch === "*") {
      const end = src.indexOf("*", i + 1);
      if (end !== -1 && end > i + 1) {
        flush();
        tokens.push({
          type: "em",
          children: tokenizeInline(src.slice(i + 1, end)),
        });
        i = end + 1;
        continue;
      }
    }

    buffer += ch;
    i++;
  }
  flush();
  return tokens;
}

/** Element overrides for the safe markdown renderer. Any omitted tag
 *  falls back to the built-in element. */
export type MarkdownComponents = Partial<{
  h1: React.ElementType;
  h2: React.ElementType;
  h3: React.ElementType;
  h4: React.ElementType;
  h5: React.ElementType;
  h6: React.ElementType;
  p: React.ElementType;
  a: React.ElementType;
  code: React.ElementType;
  pre: React.ElementType;
  ul: React.ElementType;
  ol: React.ElementType;
  li: React.ElementType;
  blockquote: React.ElementType;
  hr: React.ElementType;
  strong: React.ElementType;
  em: React.ElementType;
  br: React.ElementType;
}>;

export interface RenderMarkdownOptions {
  /** Replace specific tags with custom React components. */
  components?: MarkdownComponents;
  /** Opens links in a new tab when set. Default: `"_blank"` (+noopener+noreferrer). */
  linkTarget?: "_blank" | "_self";
}

function resolveTag(
  tag: keyof MarkdownComponents,
  components: MarkdownComponents | undefined
): React.ElementType {
  return (components?.[tag] ?? tag) as React.ElementType;
}

function renderInlineTokens(
  tokens: InlineToken[],
  key: string,
  opts: RenderMarkdownOptions
): ReactNode[] {
  const Code = resolveTag("code", opts.components);
  const Strong = resolveTag("strong", opts.components);
  const Em = resolveTag("em", opts.components);
  const Br = resolveTag("br", opts.components);
  const A = resolveTag("a", opts.components);
  const linkTarget = opts.linkTarget ?? "_blank";
  return tokens.map((tok, idx) => {
    const k = `${key}-${idx}`;
    switch (tok.type) {
      case "text":
        // React will HTML-escape this automatically.
        return <Fragment key={k}>{tok.value}</Fragment>;
      case "code":
        return <Code key={k}>{tok.value}</Code>;
      case "strong":
        return <Strong key={k}>{renderInlineTokens(tok.children, k, opts)}</Strong>;
      case "em":
        return <Em key={k}>{renderInlineTokens(tok.children, k, opts)}</Em>;
      case "br":
        return <Br key={k} />;
      case "link": {
        // `safeHref` rejects `javascript:`, `data:`, etc. — the
        // resulting attribute value is a plain URL, and React escapes
        // it into the `href` attribute.
        const href = safeHref(tok.href);
        const targetProps =
          linkTarget === "_blank"
            ? { target: "_blank", rel: "noreferrer noopener" as const }
            : {};
        return (
          <A key={k} href={href} {...targetProps}>
            {renderInlineTokens(tok.children, k, opts)}
          </A>
        );
      }
    }
  });
}

/**
 * Public: render a markdown string to a React element tree. Intended
 * for use inside JSX — no `innerHTML`, no `dangerouslySetInnerHTML`,
 * no HTML string output to sanitize. Safe with arbitrary user input.
 */
export function renderMarkdownBlocks(
  src: string,
  options: RenderMarkdownOptions = {}
): ReactElement {
  const lines = src.split("\n");
  const blocks: ReactElement[] = [];
  let i = 0;
  const inline = (text: string, key: string) =>
    renderInlineTokens(tokenizeInline(text), key, options);
  const Pre = resolveTag("pre", options.components);
  const CodeTag = resolveTag("code", options.components);
  const Blockquote = resolveTag("blockquote", options.components);
  const Ul = resolveTag("ul", options.components);
  const Ol = resolveTag("ol", options.components);
  const Li = resolveTag("li", options.components);
  const Hr = resolveTag("hr", options.components);
  const P = resolveTag("p", options.components);
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
      blocks.push(
        <Pre key={`p-${blocks.length}`}>
          <CodeTag>{body.join("\n")}</CodeTag>
        </Pre>
      );
      continue;
    }
    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      const level = headingMatch[1]!.length;
      const key = `h-${blocks.length}`;
      const children = inline(headingMatch[2]!, key);
      const tagName = `h${level}` as keyof MarkdownComponents;
      const H = resolveTag(tagName, options.components);
      blocks.push(<H key={key}>{children}</H>);
      i++;
      continue;
    }
    if (/^(-{3,}|_{3,}|\*{3,})$/.test(line.trim())) {
      blocks.push(<Hr key={`hr-${blocks.length}`} />);
      i++;
      continue;
    }
    if (/^>\s?/.test(line)) {
      const quote: string[] = [];
      while (i < lines.length && /^>\s?/.test(lines[i]!)) {
        quote.push(lines[i]!.replace(/^>\s?/, ""));
        i++;
      }
      const key = `q-${blocks.length}`;
      blocks.push(<Blockquote key={key}>{inline(quote.join(" "), key)}</Blockquote>);
      continue;
    }
    if (/^[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i]!)) {
        items.push(lines[i]!.replace(/^[-*]\s+/, ""));
        i++;
      }
      const key = `ul-${blocks.length}`;
      blocks.push(
        <Ul key={key}>
          {items.map((it, idx) => (
            <Li key={`${key}-${idx}`}>{inline(it, `${key}-${idx}`)}</Li>
          ))}
        </Ul>
      );
      continue;
    }
    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i]!)) {
        items.push(lines[i]!.replace(/^\d+\.\s+/, ""));
        i++;
      }
      const key = `ol-${blocks.length}`;
      blocks.push(
        <Ol key={key}>
          {items.map((it, idx) => (
            <Li key={`${key}-${idx}`}>{inline(it, `${key}-${idx}`)}</Li>
          ))}
        </Ol>
      );
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
    const key = `para-${blocks.length}`;
    blocks.push(<P key={key}>{inline(para.join(" "), key)}</P>);
  }
  return <>{blocks}</>;
}

export const MarkdownEditor = forwardRef<HTMLDivElement, MarkdownEditorProps>(
  function MarkdownEditor(
    {
      value,
      defaultValue,
      onValueChange,
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
      onChange: onValueChange,
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

    const previewNode = useMemo(() => renderMarkdownBlocks(md), [md]);

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
              <div className="vf-md__preview-body">
                {renderPreview ? renderPreview(md) : previewNode}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
);
MarkdownEditor.displayName = "MarkdownEditor";
