"use client";

// Phase 12 — Tool calls, agent steps, traces, plans

import {
  forwardRef,
  useId,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { JSONViewer } from "./Viewers";
import { cx } from "../utils/cx";

export type ToolStatus = "running" | "complete" | "error" | "pending";

export interface ToolCallProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  name: ReactNode;
  status?: ToolStatus;
  args?: unknown;
  result?: unknown;
  duration?: number;
  defaultExpanded?: boolean;
  expanded?: boolean;
  onExpandedChange?: (next: boolean) => void;
  onRetry?: () => void;
  onCancel?: () => void;
  errorMessage?: ReactNode;
}

export const ToolCall = forwardRef<HTMLDivElement, ToolCallProps>(
  function ToolCall(
    {
      name,
      status = "running",
      args,
      result,
      duration,
      defaultExpanded = false,
      expanded,
      onExpandedChange,
      onRetry,
      onCancel,
      errorMessage,
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
    const bodyId = `${baseId}-body`;

    return (
      <div
        ref={ref}
        data-status={status}
        className={cx(
          "vf-tool-call",
          `vf-tool-call--${status}`,
          isOpen && "vf-tool-call--open",
          className
        )}
        {...props}
      >
        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls={bodyId}
          className="vf-tool-call__header"
          onClick={() => setOpen(!isOpen)}
        >
          <span aria-hidden="true" className="vf-tool-call__caret">
            {isOpen ? "▾" : "▸"}
          </span>
          <StatusBadge status={status} />
          <span className="vf-tool-call__name">{name}</span>
          {duration !== undefined && (
            <span className="vf-tool-call__duration">
              {formatDuration(duration)}
            </span>
          )}
        </button>
        {isOpen && (
          <div id={bodyId} className="vf-tool-call__body">
            {args !== undefined && (
              <section className="vf-tool-call__section">
                <h4 className="vf-tool-call__section-title">Arguments</h4>
                <JSONViewer data={args} />
              </section>
            )}
            {status === "error" && errorMessage && (
              <section className="vf-tool-call__section">
                <h4 className="vf-tool-call__section-title">Error</h4>
                <div className="vf-tool-call__error">{errorMessage}</div>
              </section>
            )}
            {result !== undefined && (
              <section className="vf-tool-call__section">
                <h4 className="vf-tool-call__section-title">Result</h4>
                {typeof result === "string" ? (
                  <pre className="vf-tool-call__result-text">{result}</pre>
                ) : (
                  <JSONViewer data={result} />
                )}
              </section>
            )}
          </div>
        )}
        {(onRetry || onCancel) && (
          <footer className="vf-tool-call__footer">
            {status === "running" && onCancel && (
              <button
                type="button"
                className="vf-tool-call__action"
                onClick={onCancel}
              >
                Cancel
              </button>
            )}
            {status === "error" && onRetry && (
              <button
                type="button"
                className="vf-tool-call__action"
                onClick={onRetry}
              >
                Retry
              </button>
            )}
          </footer>
        )}
      </div>
    );
  }
);
ToolCall.displayName = "ToolCall";

function StatusBadge({ status }: { status: ToolStatus }) {
  const glyph: Record<ToolStatus, string> = {
    pending: "◌",
    running: "◐",
    complete: "✓",
    error: "✕",
  };
  return (
    <span
      className={cx("vf-tool-call__status", `vf-tool-call__status--${status}`)}
      aria-label={status}
    >
      {glyph[status]}
    </span>
  );
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

// ── ToolCallGroup ───────────────────────────────────────────

export interface ToolCallGroupProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  title?: ReactNode;
  status?: ToolStatus;
  children?: ReactNode;
}

export const ToolCallGroup = forwardRef<HTMLDivElement, ToolCallGroupProps>(
  function ToolCallGroup({ title, status, className, children, ...props }, ref) {
    return (
      <section
        ref={ref}
        data-status={status}
        className={cx(
          "vf-tool-call-group",
          status && `vf-tool-call-group--${status}`,
          className
        )}
        {...props}
      >
        {(title || status) && (
          <header className="vf-tool-call-group__header">
            {status && <StatusBadge status={status} />}
            {title && (
              <span className="vf-tool-call-group__title">{title}</span>
            )}
          </header>
        )}
        <div className="vf-tool-call-group__body">{children}</div>
      </section>
    );
  }
);
ToolCallGroup.displayName = "ToolCallGroup";

// ── AgentStep ───────────────────────────────────────────────

export interface AgentStepProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  number?: ReactNode;
  title: ReactNode;
  status?: ToolStatus;
  toolCalls?: ReactNode;
  output?: ReactNode;
  duration?: number;
  defaultExpanded?: boolean;
  expanded?: boolean;
  onExpandedChange?: (next: boolean) => void;
  children?: ReactNode;
}

export const AgentStep = forwardRef<HTMLDivElement, AgentStepProps>(
  function AgentStep(
    {
      number,
      title,
      status = "complete",
      toolCalls,
      output,
      duration,
      defaultExpanded = false,
      expanded,
      onExpandedChange,
      className,
      children,
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
    const bodyId = `${baseId}-body`;

    return (
      <div
        ref={ref}
        data-status={status}
        className={cx(
          "vf-agent-step",
          `vf-agent-step--${status}`,
          isOpen && "vf-agent-step--open",
          className
        )}
        {...props}
      >
        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls={bodyId}
          className="vf-agent-step__header"
          onClick={() => setOpen(!isOpen)}
        >
          {number !== undefined && (
            <span className="vf-agent-step__number" aria-hidden="true">
              {number}
            </span>
          )}
          <StatusBadge status={status} />
          <span className="vf-agent-step__title">{title}</span>
          {duration !== undefined && (
            <span className="vf-agent-step__duration">
              {formatDuration(duration)}
            </span>
          )}
          <span className="vf-agent-step__caret" aria-hidden="true">
            {isOpen ? "▾" : "▸"}
          </span>
        </button>
        {isOpen && (
          <div id={bodyId} className="vf-agent-step__body">
            {toolCalls && (
              <div className="vf-agent-step__tool-calls">{toolCalls}</div>
            )}
            {output !== undefined && (
              <div className="vf-agent-step__output">
                {typeof output === "string" ? (
                  <p>{output}</p>
                ) : (
                  output
                )}
              </div>
            )}
            {children}
          </div>
        )}
      </div>
    );
  }
);
AgentStep.displayName = "AgentStep";

// ── AgentTrace ──────────────────────────────────────────────

export interface AgentTraceTokens {
  input?: number;
  output?: number;
  total?: number;
}

export interface AgentTraceProps extends HTMLAttributes<HTMLDivElement> {
  steps?: ReactNode;
  tokens?: AgentTraceTokens;
  cost?: ReactNode;
  duration?: number;
  status?: ToolStatus;
  /** Called when the user clicks the stop button during a running/streaming agent. */
  onStop?: () => void;
  children?: ReactNode;
}

export const AgentTrace = forwardRef<HTMLDivElement, AgentTraceProps>(
  function AgentTrace(
    {
      steps,
      tokens,
      cost,
      duration,
      status,
      onStop,
      className,
      children,
      ...props
    },
    ref
  ) {
    return (
      <section
        ref={ref}
        data-status={status}
        className={cx(
          "vf-agent-trace",
          status && `vf-agent-trace--${status}`,
          className
        )}
        {...props}
      >
        {(tokens || cost !== undefined || duration !== undefined) && (
          <header className="vf-agent-trace__header" role="group" aria-label="Run summary">
            {tokens && (
              <span className="vf-agent-trace__metric">
                <span className="vf-agent-trace__metric-label">Tokens</span>
                <span className="vf-agent-trace__metric-value">
                  {tokens.total ?? (tokens.input ?? 0) + (tokens.output ?? 0)}
                </span>
              </span>
            )}
            {cost !== undefined && (
              <span className="vf-agent-trace__metric">
                <span className="vf-agent-trace__metric-label">Cost</span>
                <span className="vf-agent-trace__metric-value">{cost}</span>
              </span>
            )}
            {duration !== undefined && (
              <span className="vf-agent-trace__metric">
                <span className="vf-agent-trace__metric-label">Duration</span>
                <span className="vf-agent-trace__metric-value">
                  {formatDuration(duration)}
                </span>
              </span>
            )}
          </header>
        )}
        {onStop && status === "running" && (
          <button
            type="button"
            className="vf-agent__stop-btn"
            onClick={onStop}
          >
            Stop
          </button>
        )}
        <div className="vf-agent-trace__steps">
          {steps}
          {children}
        </div>
      </section>
    );
  }
);
AgentTrace.displayName = "AgentTrace";

// ── PlanDisplay ─────────────────────────────────────────────

export type PlanStepStatus = "pending" | "active" | "done" | "failed";

export interface PlanStep {
  id: string;
  title: ReactNode;
  status?: PlanStepStatus;
  description?: ReactNode;
}

export interface PlanDisplayProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  steps: PlanStep[];
  onStepClick?: (stepId: string) => void;
  title?: ReactNode;
}

export const PlanDisplay = forwardRef<HTMLDivElement, PlanDisplayProps>(
  function PlanDisplay(
    { steps, onStepClick, title, className, ...props },
    ref
  ) {
    return (
      <div
        ref={ref}
        className={cx("vf-plan-display", className)}
        {...props}
      >
        {title && <header className="vf-plan-display__title">{title}</header>}
        <ol className="vf-plan-display__list" role="list">
          {steps.map((step) => {
            const status = step.status ?? "pending";
            return (
              <li
                key={step.id}
                data-status={status}
                className={cx(
                  "vf-plan-display__item",
                  `vf-plan-display__item--${status}`
                )}
              >
                <button
                  type="button"
                  className="vf-plan-display__btn"
                  onClick={() => onStepClick?.(step.id)}
                  disabled={!onStepClick}
                  aria-current={status === "active" ? "step" : undefined}
                >
                  <span
                    className={cx(
                      "vf-plan-display__marker",
                      `vf-plan-display__marker--${status}`
                    )}
                    aria-hidden="true"
                  >
                    {markerGlyph(status)}
                  </span>
                  <span className="vf-plan-display__content">
                    <span className="vf-plan-display__item-title">
                      {step.title}
                    </span>
                    {step.description && (
                      <span className="vf-plan-display__item-desc">
                        {step.description}
                      </span>
                    )}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>
    );
  }
);
PlanDisplay.displayName = "PlanDisplay";

function markerGlyph(status: PlanStepStatus): string {
  if (status === "done") return "✓";
  if (status === "active") return "◐";
  if (status === "failed") return "✕";
  return "◯";
}
