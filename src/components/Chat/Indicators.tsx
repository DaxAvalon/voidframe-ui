"use client";

import {
  forwardRef,
  useId,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { cx } from "../../utils/cx";

// ── ThinkingIndicator ───────────────────────────────────────

export interface ThinkingIndicatorProps extends HTMLAttributes<HTMLDivElement> {
  message?: ReactNode;
  /** Elapsed time in ms, displayed as "thought for Xs". */
  duration?: number;
  variant?: "dots" | "shimmer";
}

export const ThinkingIndicator = forwardRef<HTMLDivElement, ThinkingIndicatorProps>(
  function ThinkingIndicator(
    { message = "Thinking", duration, variant = "dots", className, ...props },
    ref
  ) {
    return (
      <div
        ref={ref}
        role="status"
        aria-live="polite"
        className={cx(
          "vf-thinking-indicator",
          `vf-thinking-indicator--${variant}`,
          className
        )}
        {...props}
      >
        <span className="vf-thinking-indicator__message">{message}</span>
        {variant === "dots" && (
          <span className="vf-thinking-indicator__dots" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
        )}
        {variant === "shimmer" && (
          <span className="vf-thinking-indicator__shimmer" aria-hidden="true" />
        )}
        {duration !== undefined && (
          <span className="vf-thinking-indicator__duration">
            {formatDuration(duration)}
          </span>
        )}
      </div>
    );
  }
);
ThinkingIndicator.displayName = "ThinkingIndicator";

function formatDuration(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

// ── ReasoningTrace ──────────────────────────────────────────

export interface ReasoningTraceProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "content" | "title"> {
  content: ReactNode;
  streaming?: boolean;
  defaultExpanded?: boolean;
  expanded?: boolean;
  onExpandedChange?: (next: boolean) => void;
  /** Elapsed time in ms; renders a "thought for Xs" pill. */
  duration?: number;
  title?: ReactNode;
}

export const ReasoningTrace = forwardRef<HTMLDivElement, ReasoningTraceProps>(
  function ReasoningTrace(
    {
      content,
      streaming,
      defaultExpanded = false,
      expanded,
      onExpandedChange,
      duration,
      title = "Reasoning",
      className,
      ...props
    },
    ref
  ) {
    const [internal, setInternal] = useState(defaultExpanded);
    const isOpen = expanded ?? internal;
    const setOpen = (next: boolean) => {
      if (expanded === undefined) setInternal(next);
      onExpandedChange?.(next);
    };
    const baseId = useId();
    const contentId = `${baseId}-content`;

    return (
      <div
        ref={ref}
        className={cx(
          "vf-reasoning-trace",
          isOpen && "vf-reasoning-trace--open",
          streaming && "vf-reasoning-trace--streaming",
          className
        )}
        {...props}
      >
        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls={contentId}
          className="vf-reasoning-trace__trigger"
          onClick={() => setOpen(!isOpen)}
        >
          <span aria-hidden="true" className="vf-reasoning-trace__caret">
            {isOpen ? "▾" : "▸"}
          </span>
          <span className="vf-reasoning-trace__title">{title}</span>
          {duration !== undefined && (
            <span className="vf-reasoning-trace__duration">
              thought for {formatDuration(duration)}
            </span>
          )}
          {streaming && (
            <span className="vf-reasoning-trace__streaming-dot" aria-hidden="true" />
          )}
        </button>
        {isOpen && (
          <div id={contentId} className="vf-reasoning-trace__content">
            {content}
          </div>
        )}
      </div>
    );
  }
);
ReasoningTrace.displayName = "ReasoningTrace";
