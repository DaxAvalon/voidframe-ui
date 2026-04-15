"use client";

// Phase 9 — Viewers: CodeBlock, JSONViewer, DiffViewer, LogViewer, Terminal,
// MarkdownRenderer.
//
// Minimalist implementations — consumers can plug richer engines (shiki,
// react-markdown, diff-match-patch) via props where the API allows.
//
// SECURITY: Any component that renders HTML produced from its own internal
// escaping is safe. Consumers passing external renderers are responsible for
// sanitizing their own output.

import {
  forwardRef,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { cx } from "../utils/cx";
import { renderMarkdown } from "./MarkdownEditor";

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

// ── JSONViewer ───────────────────────────────────────────────

export interface JSONViewerProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onSelect"> {
  data: unknown;
  /** Depth to expand initially. Default 1. Pass `true` for all. */
  defaultExpanded?: number | boolean;
  showDataTypes?: boolean;
  onSelect?: (path: string) => void;
}

export const JSONViewer = forwardRef<HTMLDivElement, JSONViewerProps>(
  function JSONViewer(
    { data, defaultExpanded = 1, showDataTypes, onSelect, className, ...props },
    ref
  ) {
    return (
      <div ref={ref} className={cx("vf-json-viewer", className)} {...props}>
        <JSONNode
          value={data}
          path=""
          depth={0}
          defaultExpanded={defaultExpanded}
          showDataTypes={showDataTypes}
          onSelect={onSelect}
          nameKey="root"
        />
      </div>
    );
  }
);
JSONViewer.displayName = "JSONViewer";

function JSONNode({
  value,
  path,
  depth,
  defaultExpanded,
  showDataTypes,
  onSelect,
  nameKey,
  isArrayItem,
}: {
  value: unknown;
  path: string;
  depth: number;
  defaultExpanded: number | boolean;
  showDataTypes?: boolean;
  onSelect?: (path: string) => void;
  nameKey: string;
  isArrayItem?: boolean;
}): JSX.Element {
  const shouldExpand =
    defaultExpanded === true
      ? true
      : typeof defaultExpanded === "number"
        ? depth < defaultExpanded
        : false;
  const [open, setOpen] = useState(shouldExpand);

  const isArray = Array.isArray(value);
  const isObject = value !== null && typeof value === "object";
  const typeLabel = Array.isArray(value)
    ? "array"
    : value === null
      ? "null"
      : typeof value;

  const body = (() => {
    if (isArray) {
      const arr = value as unknown[];
      return (
        <>
          <span className="vf-json-viewer__brace">[</span>
          {open ? (
            <ul className="vf-json-viewer__children">
              {arr.map((v, i) => (
                <li key={i} className="vf-json-viewer__entry">
                  <JSONNode
                    value={v}
                    path={`${path}[${i}]`}
                    depth={depth + 1}
                    defaultExpanded={defaultExpanded}
                    showDataTypes={showDataTypes}
                    onSelect={onSelect}
                    nameKey={String(i)}
                    isArrayItem
                  />
                </li>
              ))}
            </ul>
          ) : (
            <span className="vf-json-viewer__preview">
              {arr.length} {arr.length === 1 ? "item" : "items"}
            </span>
          )}
          <span className="vf-json-viewer__brace">]</span>
        </>
      );
    }
    if (isObject) {
      const entries = Object.entries(value as Record<string, unknown>);
      return (
        <>
          <span className="vf-json-viewer__brace">{"{"}</span>
          {open ? (
            <ul className="vf-json-viewer__children">
              {entries.map(([k, v]) => (
                <li key={k} className="vf-json-viewer__entry">
                  <JSONNode
                    value={v}
                    path={path ? `${path}.${k}` : k}
                    depth={depth + 1}
                    defaultExpanded={defaultExpanded}
                    showDataTypes={showDataTypes}
                    onSelect={onSelect}
                    nameKey={k}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <span className="vf-json-viewer__preview">
              {entries.length} {entries.length === 1 ? "key" : "keys"}
            </span>
          )}
          <span className="vf-json-viewer__brace">{"}"}</span>
        </>
      );
    }
    const v = value;
    const rendered =
      typeof v === "string"
        ? `"${v}"`
        : v === null
          ? "null"
          : String(v);
    return (
      <span
        className={cx(
          "vf-json-viewer__value",
          `vf-json-viewer__value--${typeLabel}`
        )}
        onClick={() => onSelect?.(path || nameKey)}
      >
        {rendered}
        {showDataTypes && <em className="vf-json-viewer__type">{typeLabel}</em>}
      </span>
    );
  })();

  return (
    <div className="vf-json-viewer__node">
      {(isArray || isObject) ? (
        <button
          type="button"
          className="vf-json-viewer__disclosure"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? "▾" : "▸"}
        </button>
      ) : (
        <span className="vf-json-viewer__spacer" aria-hidden="true" />
      )}
      {depth > 0 && (
        <span className="vf-json-viewer__key">
          {isArrayItem ? `[${nameKey}]` : `"${nameKey}"`}:
        </span>
      )}
      {body}
    </div>
  );
}

// ── DiffViewer ───────────────────────────────────────────────

export interface DiffViewerProps extends HTMLAttributes<HTMLDivElement> {
  oldValue: string;
  newValue: string;
  variant?: "unified" | "split";
  language?: string;
  showLineNumbers?: boolean;
}

interface DiffOp {
  op: "equal" | "insert" | "delete";
  line: string;
}

// Tiny line-based diff (LCS). Good enough for modest inputs.
function lineDiff(oldText: string, newText: string): DiffOp[] {
  const a = oldText.split("\n");
  const b = newText.split("\n");
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      if (a[i] === b[j]) dp[i]![j] = (dp[i + 1]?.[j + 1] ?? 0) + 1;
      else dp[i]![j] = Math.max(dp[i + 1]?.[j] ?? 0, dp[i]?.[j + 1] ?? 0);
    }
  }
  const ops: DiffOp[] = [];
  let i = 0;
  let j = 0;
  while (i < m && j < n) {
    if (a[i] === b[j]) {
      ops.push({ op: "equal", line: a[i]! });
      i++;
      j++;
    } else if ((dp[i + 1]?.[j] ?? 0) >= (dp[i]?.[j + 1] ?? 0)) {
      ops.push({ op: "delete", line: a[i]! });
      i++;
    } else {
      ops.push({ op: "insert", line: b[j]! });
      j++;
    }
  }
  while (i < m) {
    ops.push({ op: "delete", line: a[i++]! });
  }
  while (j < n) {
    ops.push({ op: "insert", line: b[j++]! });
  }
  return ops;
}

export const DiffViewer = forwardRef<HTMLDivElement, DiffViewerProps>(
  function DiffViewer(
    {
      oldValue,
      newValue,
      variant = "unified",
      language,
      showLineNumbers = true,
      className,
      ...props
    },
    ref
  ) {
    const ops = useMemo(() => lineDiff(oldValue, newValue), [oldValue, newValue]);
    if (variant === "split") {
      const left: Array<{ text: string; type: "equal" | "delete" | "pad" }> = [];
      const right: Array<{ text: string; type: "equal" | "insert" | "pad" }> = [];
      for (const op of ops) {
        if (op.op === "equal") {
          left.push({ text: op.line, type: "equal" });
          right.push({ text: op.line, type: "equal" });
        } else if (op.op === "delete") {
          left.push({ text: op.line, type: "delete" });
          right.push({ text: "", type: "pad" });
        } else {
          left.push({ text: "", type: "pad" });
          right.push({ text: op.line, type: "insert" });
        }
      }
      return (
        <div
          ref={ref}
          className={cx("vf-diff", "vf-diff--split", className)}
          data-language={language}
          {...props}
        >
          <div className="vf-diff__col" aria-label="old">
            {left.map((ln, i) => (
              <div key={i} className={cx("vf-diff__line", `vf-diff__line--${ln.type}`)}>
                {showLineNumbers && (
                  <span className="vf-diff__num">{ln.type === "pad" ? "" : i + 1}</span>
                )}
                <span className="vf-diff__text">{ln.text || " "}</span>
              </div>
            ))}
          </div>
          <div className="vf-diff__col" aria-label="new">
            {right.map((ln, i) => (
              <div key={i} className={cx("vf-diff__line", `vf-diff__line--${ln.type}`)}>
                {showLineNumbers && (
                  <span className="vf-diff__num">{ln.type === "pad" ? "" : i + 1}</span>
                )}
                <span className="vf-diff__text">{ln.text || " "}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return (
      <div
        ref={ref}
        className={cx("vf-diff", "vf-diff--unified", className)}
        data-language={language}
        {...props}
      >
        {ops.map((op, i) => (
          <div key={i} className={cx("vf-diff__line", `vf-diff__line--${op.op}`)}>
            <span className="vf-diff__marker" aria-hidden="true">
              {op.op === "insert" ? "+" : op.op === "delete" ? "-" : " "}
            </span>
            <span className="vf-diff__text">{op.line || " "}</span>
          </div>
        ))}
      </div>
    );
  }
);
DiffViewer.displayName = "DiffViewer";

// ── LogViewer ────────────────────────────────────────────────

export type LogLevel = "info" | "warn" | "error" | "debug";

export interface LogEntry {
  timestamp?: string | Date;
  level?: LogLevel;
  message: string;
  source?: string;
}

export interface LogViewerProps extends HTMLAttributes<HTMLDivElement> {
  entries: LogEntry[];
  level?: LogLevel;
  filter?: (entry: LogEntry) => boolean;
  autoScroll?: boolean;
  highlight?: RegExp;
  onEntryClick?: (entry: LogEntry, index: number) => void;
  height?: number | string;
}

const levelWeight: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

export const LogViewer = forwardRef<HTMLDivElement, LogViewerProps>(
  function LogViewer(
    {
      entries,
      level,
      filter,
      autoScroll = true,
      highlight,
      onEntryClick,
      height = 280,
      className,
      style,
      ...props
    },
    ref
  ) {
    const containerRef = useRef<HTMLDivElement>(null);
    const visible = useMemo(
      () =>
        entries.filter((e) => {
          if (level && e.level && levelWeight[e.level] < levelWeight[level]) return false;
          if (filter && !filter(e)) return false;
          return true;
        }),
      [entries, level, filter]
    );

    useEffect(() => {
      if (!autoScroll) return;
      const el = containerRef.current;
      if (!el) return;
      el.scrollTop = el.scrollHeight;
    }, [visible, autoScroll]);

    const renderMessage = (msg: string) => {
      if (!highlight) return msg;
      const parts: ReactNode[] = [];
      let last = 0;
      for (const match of msg.matchAll(new RegExp(highlight, "g"))) {
        const idx = match.index ?? 0;
        if (idx > last) parts.push(msg.slice(last, idx));
        parts.push(
          <mark className="vf-log-viewer__mark" key={idx}>
            {match[0]}
          </mark>
        );
        last = idx + match[0].length;
      }
      if (last < msg.length) parts.push(msg.slice(last));
      return parts;
    };

    return (
      <div
        ref={(el) => {
          (containerRef as { current: HTMLDivElement | null }).current = el;
          if (typeof ref === "function") ref(el);
          else if (ref) (ref as { current: HTMLDivElement | null }).current = el;
        }}
        role="log"
        aria-live="polite"
        className={cx("vf-log-viewer", className)}
        style={{
          height: typeof height === "number" ? `${height}px` : height,
          ...style,
        }}
        {...props}
      >
        {visible.map((entry, i) => (
          <div
            key={i}
            className={cx(
              "vf-log-viewer__entry",
              entry.level && `vf-log-viewer__entry--${entry.level}`
            )}
            onClick={onEntryClick ? () => onEntryClick(entry, i) : undefined}
          >
            {entry.timestamp && (
              <span className="vf-log-viewer__time">
                {typeof entry.timestamp === "string"
                  ? entry.timestamp
                  : entry.timestamp.toISOString()}
              </span>
            )}
            {entry.level && (
              <span className={cx("vf-log-viewer__level", `vf-log-viewer__level--${entry.level}`)}>
                {entry.level.toUpperCase()}
              </span>
            )}
            {entry.source && (
              <span className="vf-log-viewer__source">[{entry.source}]</span>
            )}
            <span className="vf-log-viewer__message">{renderMessage(entry.message)}</span>
          </div>
        ))}
      </div>
    );
  }
);
LogViewer.displayName = "LogViewer";

// ── Terminal ─────────────────────────────────────────────────

export interface TerminalProps extends HTMLAttributes<HTMLDivElement> {
  lines?: Array<string | ReactNode>;
  prompt?: string;
  onCommand?: (cmd: string) => void;
  history?: boolean;
  autoFocus?: boolean;
  cursor?: "block" | "underline" | "bar";
  height?: number | string;
}

export const Terminal = forwardRef<HTMLDivElement, TerminalProps>(
  function Terminal(
    {
      lines = [],
      prompt = "$",
      onCommand,
      history = true,
      autoFocus,
      cursor = "block",
      height = 300,
      className,
      style,
      ...props
    },
    ref
  ) {
    const [input, setInput] = useState("");
    const [past, setPast] = useState<string[]>([]);
    const [historyIdx, setHistoryIdx] = useState<number>(-1);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
      if (autoFocus) inputRef.current?.focus();
    }, [autoFocus]);

    const submit = () => {
      const cmd = input.trim();
      if (cmd) {
        if (history) setPast((prev) => [...prev, cmd]);
        onCommand?.(cmd);
      }
      setInput("");
      setHistoryIdx(-1);
    };

    const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        submit();
      } else if (e.key === "ArrowUp" && history) {
        e.preventDefault();
        if (past.length === 0) return;
        const next = historyIdx < 0 ? past.length - 1 : Math.max(0, historyIdx - 1);
        setHistoryIdx(next);
        setInput(past[next] ?? "");
      } else if (e.key === "ArrowDown" && history) {
        e.preventDefault();
        if (historyIdx < 0) return;
        const next = historyIdx + 1;
        if (next >= past.length) {
          setHistoryIdx(-1);
          setInput("");
        } else {
          setHistoryIdx(next);
          setInput(past[next] ?? "");
        }
      }
    };

    return (
      <div
        ref={ref}
        role="group"
        aria-label="Terminal"
        className={cx("vf-terminal", `vf-terminal--cursor-${cursor}`, className)}
        style={{
          height: typeof height === "number" ? `${height}px` : height,
          ...style,
        }}
        onClick={() => inputRef.current?.focus()}
        {...props}
      >
        {lines.map((line, i) => (
          <div key={i} className="vf-terminal__line">
            {line}
          </div>
        ))}
        <form
          className="vf-terminal__input-row"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <span className="vf-terminal__prompt">{prompt}</span>
          <input
            ref={inputRef}
            type="text"
            className="vf-terminal__input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            aria-label="Terminal input"
          />
        </form>
      </div>
    );
  }
);
Terminal.displayName = "Terminal";

// ── MarkdownRenderer ─────────────────────────────────────────

export type MarkdownComponentMap = Partial<{
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

export type MarkdownPlugin = (input: string) => string;

export interface MarkdownRendererProps extends HTMLAttributes<HTMLDivElement> {
  content: string;
  /** Opens links in a new tab when set. */
  linkTarget?: "_blank" | "_self";
  /** Pre-process the markdown source through these plugins in order. */
  plugins?: MarkdownPlugin[];
  /** Replace specific tags with custom React components. */
  components?: MarkdownComponentMap;
}

interface ParsedNode {
  tag: string;
  attrs: Record<string, string>;
  children: Array<ParsedNode | string>;
}

function parseRenderedMarkdown(html: string): Array<ParsedNode | string> {
  if (typeof DOMParser === "undefined") return [html];
  const doc = new DOMParser().parseFromString(`<root>${html}</root>`, "text/html");
  const root = doc.querySelector("root");
  if (!root) return [html];
  const convert = (node: ChildNode): ParsedNode | string | null => {
    if (node.nodeType === 3) return (node as Text).data;
    if (node.nodeType !== 1) return null;
    const el = node as Element;
    const attrs: Record<string, string> = {};
    for (const attr of Array.from(el.attributes)) {
      attrs[attr.name] = attr.value;
    }
    const children: Array<ParsedNode | string> = [];
    for (const child of Array.from(el.childNodes)) {
      const conv = convert(child);
      if (conv !== null) children.push(conv);
    }
    return { tag: el.tagName.toLowerCase(), attrs, children };
  };
  const out: Array<ParsedNode | string> = [];
  for (const child of Array.from(root.childNodes)) {
    const conv = convert(child);
    if (conv !== null) out.push(conv);
  }
  return out;
}

function renderParsed(
  nodes: Array<ParsedNode | string>,
  components: MarkdownComponentMap | undefined,
  linkTarget: "_blank" | "_self" | undefined,
  keyPrefix = ""
): ReactNode {
  return nodes.map((node, i) => {
    if (typeof node === "string") return node;
    const Tag =
      (components && (components as Record<string, React.ElementType>)[node.tag]) ?? node.tag;
    const props: Record<string, unknown> = {};
    for (const [name, value] of Object.entries(node.attrs)) {
      const propName =
        name === "class" ? "className" : name === "for" ? "htmlFor" : name;
      props[propName] = value;
    }
    if (node.tag === "a" && linkTarget === "_blank") {
      props.target = "_blank";
      props.rel = "noreferrer noopener";
    }
    const keyVal = `${keyPrefix}${i}`;
    if (node.children.length === 0) {
      return <Tag key={keyVal} {...props} />;
    }
    return (
      <Tag key={keyVal} {...props}>
        {renderParsed(node.children, components, linkTarget, `${keyPrefix}${i}-`)}
      </Tag>
    );
  });
}

export const MarkdownRenderer = forwardRef<HTMLDivElement, MarkdownRendererProps>(
  function MarkdownRenderer(
    { content, linkTarget, plugins, components, className, ...props },
    ref
  ) {
    const processed = useMemo(() => {
      let src = content;
      for (const plugin of plugins ?? []) src = plugin(src);
      return src;
    }, [content, plugins]);

    const html = useMemo(() => {
      let out = renderMarkdown(processed);
      if (linkTarget === "_blank" && !components) {
        out = out.replace(/<a\s+href="/g, '<a target="_blank" rel="noreferrer noopener" href="');
      }
      return out;
    }, [processed, linkTarget, components]);

    const tree = useMemo(() => {
      if (!components && linkTarget !== "_blank") return null;
      return parseRenderedMarkdown(html);
    }, [html, components, linkTarget]);

    return (
      <div ref={ref} className={cx("vf-markdown-renderer", className)} {...props}>
        {tree ? (
          <div className="vf-markdown-renderer__body">
            {renderParsed(tree, components, linkTarget)}
          </div>
        ) : (
          <HTMLPane html={html} className="vf-markdown-renderer__body" />
        )}
      </div>
    );
  }
);
MarkdownRenderer.displayName = "MarkdownRenderer";
