"use client";

import {
  forwardRef,
  useEffect,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { cx } from "../../utils/cx";

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
