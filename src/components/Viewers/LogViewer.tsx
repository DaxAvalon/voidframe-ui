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

// Catastrophic-backtracking self-DoS guard for user-typed filter/highlight
// patterns. LogViewer compiles on every keystroke across every log row.
const MAX_FILTER_PATTERN_LENGTH = 200;

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
  /** Show pause/resume button. Default true. */
  pausable?: boolean;
  /** Show regex filter input. Default true. */
  filterable?: boolean;
}

const levelWeight: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

/**
 * Terminal-style log viewer with level filters, timestamp toggle, search,
 * and auto-scroll-to-bottom.
 */
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
      pausable = true,
      filterable = true,
      className,
      style,
      ...props
    },
    ref
  ) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [paused, setPaused] = useState(false);
    const [filterText, setFilterText] = useState("");
    const bufferRef = useRef<LogEntry[]>([]);
    const [displayEntries, setDisplayEntries] = useState<LogEntry[]>(entries);
    const lastEntriesRef = useRef(entries);

    // Track incoming entries and buffer when paused.
    useEffect(() => {
      if (entries === lastEntriesRef.current) return;
      const prevLen = lastEntriesRef.current.length;
      lastEntriesRef.current = entries;
      if (paused) {
        // Buffer new entries (ones beyond what we had before).
        const newOnes = entries.slice(prevLen);
        if (newOnes.length > 0) {
          bufferRef.current = [...bufferRef.current, ...newOnes];
        }
      } else {
        setDisplayEntries(entries);
      }
    }, [entries, paused]);

    const handleResume = () => {
      setPaused(false);
      // Merge buffer into display.
      const merged = [...displayEntries, ...bufferRef.current];
      bufferRef.current = [];
      setDisplayEntries(merged);
    };

    const handlePause = () => {
      setPaused(true);
      setDisplayEntries(lastEntriesRef.current);
    };

    // Build regex filter. Cap user-typed pattern length as a
    // catastrophic-backtracking self-DoS guard — the filter compiles on every
    // keystroke against every visible log line.
    const filterRegex = useMemo(() => {
      if (!filterText) return null;
      if (filterText.length > MAX_FILTER_PATTERN_LENGTH) return null;
      try { return new RegExp(filterText, "i"); } catch { return null; }
    }, [filterText]);

    const visible = useMemo(
      () =>
        displayEntries.filter((e) => {
          if (level && e.level && levelWeight[e.level] < levelWeight[level]) return false;
          if (filter && !filter(e)) return false;
          if (filterText) {
            if (filterRegex) {
              if (!filterRegex.test(e.message)) return false;
            } else {
              if (!e.message.includes(filterText)) return false;
            }
          }
          return true;
        }),
      [displayEntries, level, filter, filterText, filterRegex]
    );

    useEffect(() => {
      if (!autoScroll || paused) return;
      const el = containerRef.current;
      if (!el) return;
      el.scrollTop = el.scrollHeight;
    }, [visible, autoScroll, paused]);

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

    const showControls = pausable || filterable;

    return (
      <div className={cx("vf-log-viewer__wrapper", className)} style={style}>
        {showControls && (
          <div className="vf-log-viewer__controls">
            {pausable && (
              <button
                type="button"
                className="vf-log-viewer__pause-btn"
                onClick={paused ? handleResume : handlePause}
              >
                {paused ? "\u25B6 Resume" : "\u23F8 Pause"}
                {paused && bufferRef.current.length > 0 && ` (${bufferRef.current.length})`}
              </button>
            )}
            {filterable && (
              <input
                type="text"
                className="vf-log-viewer__filter-input"
                placeholder="Filter (regex)..."
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                aria-label="Filter log entries"
              />
            )}
          </div>
        )}
        <div
          ref={(el) => {
            (containerRef as { current: HTMLDivElement | null }).current = el;
            if (typeof ref === "function") ref(el);
            else if (ref) (ref as { current: HTMLDivElement | null }).current = el;
          }}
          role="log"
          aria-live="polite"
          className="vf-log-viewer"
          style={{
            height: typeof height === "number" ? `${height}px` : height,
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

/**
 * Interactive terminal emulator surface. Emits user input lines; host app
 * supplies output.
 */
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
