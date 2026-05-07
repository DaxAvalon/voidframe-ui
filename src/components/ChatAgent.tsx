"use client";

// Phase 12 — Tool calls, agent steps, traces, plans

import {
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useId,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { useControllableState } from "../hooks/useControllableState";
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

/**
 * Chat transcript block representing a single tool invocation: name,
 * arguments, result, status.
 */
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
  expanded?: boolean;
  defaultExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  children?: ReactNode;
}

/**
 * Groups consecutive `ToolCall`s from the same turn with a collapsed
 * summary. Controllable/uncontrolled via `expanded` / `defaultExpanded` /
 * `onExpandedChange`.
 */
export const ToolCallGroup = forwardRef<HTMLDivElement, ToolCallGroupProps>(
  function ToolCallGroup(
    {
      title,
      status,
      expanded: expandedProp,
      defaultExpanded,
      onExpandedChange,
      className,
      children,
      ...props
    },
    ref
  ) {
    const [isExpanded, setExpanded] = useControllableState<boolean>({
      value: expandedProp,
      defaultValue: defaultExpanded ?? true,
      onChange: onExpandedChange,
      componentName: "ToolCallGroup",
    });
    const baseId = useId();
    const bodyId = `${baseId}-body`;

    const childCount = Array.isArray(children)
      ? children.filter(Boolean).length
      : children
        ? 1
        : 0;

    return (
      <section
        ref={ref}
        data-status={status}
        className={cx(
          "vf-tool-call-group",
          status && `vf-tool-call-group--${status}`,
          isExpanded && "vf-tool-call-group--expanded",
          className
        )}
        {...props}
      >
        <header className="vf-tool-call-group__header">
          {status && <StatusBadge status={status} />}
          {title && (
            <span className="vf-tool-call-group__title">{title}</span>
          )}
          {!isExpanded && (
            <span className="vf-tool-call-group__summary">
              {childCount} tool call{childCount !== 1 ? "s" : ""}
            </span>
          )}
          <button
            type="button"
            className="vf-tool-call-group__toggle"
            aria-expanded={isExpanded}
            aria-controls={bodyId}
            onClick={() => setExpanded(!isExpanded)}
          >
            {isExpanded ? "▾" : "▸"}
          </button>
        </header>
        {isExpanded && (
          <div id={bodyId} className="vf-tool-call-group__body">
            {children}
          </div>
        )}
      </section>
    );
  }
);
ToolCallGroup.displayName = "ToolCallGroup";

// ── AgentTraceContext ───────────────────────────────────────

const AgentTraceContext = createContext<{ expandAll: boolean | null }>({
  expandAll: null,
});

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

/**
 * Single step in an agent trace: a numbered card with title, status pill,
 * optional tool calls, output, and elapsed time. Controllable/uncontrolled
 * via `expanded` / `defaultExpanded` / `onExpandedChange`. Responds to
 * `AgentTraceContext.expandAll` for bulk expand/collapse.
 *
 * @remarks When using the `toolCalls` slot, pass individual `ToolCall`
 * components directly — not wrapped in `ToolCallGroup`. AgentStep
 * provides its own expand/collapse header, so nesting another collapsible
 * wrapper creates redundant double-headers.
 */
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

    const traceCtx = useContext(AgentTraceContext);
    useEffect(() => {
      if (traceCtx.expandAll !== null) {
        setOpen(traceCtx.expandAll);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [traceCtx.expandAll]);

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

/**
 * Full trace view for an agent run — wraps a list of `AgentStep`s with
 * status summary and expand-all controls. Provides `AgentTraceContext` so
 * child `AgentStep`s can respond to bulk expand/collapse.
 */
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
    const [expandAll, setExpandAll] = useState<boolean | null>(null);

    return (
      <AgentTraceContext.Provider value={{ expandAll }}>
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
            <button
              type="button"
              className="vf-agent-trace__expand-all"
              onClick={() =>
                setExpandAll((prev) => (prev === null || !prev ? true : false))
              }
            >
              {expandAll ? "Collapse all" : "Expand all"}
            </button>
          </header>
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
      </AgentTraceContext.Provider>
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

/**
 * Agent plan stepper: renders a list of steps with status indicators
 * (pending/active/done/failed). Click a step to navigate. Tracks
 * `aria-current="step"` for the active step.
 */
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
