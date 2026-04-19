"use client";

// Phase 12 — Model selector, system prompt, token/context/cost displays,
// latency, debug panel, trace viewer, unread badge, layout patterns.

import {
  forwardRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { cx } from "../utils/cx";

// ── ModelSelector ──────────────────────────────────────────

export interface ChatModelOption {
  id: string;
  name: ReactNode;
  provider?: ReactNode;
  contextWindow?: number;
  capabilities?: string[];
  description?: ReactNode;
}

export interface ModelSelectorProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  models: ChatModelOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (next: string) => void;
  showCapabilities?: boolean;
  label?: ReactNode;
}

export const ModelSelector = forwardRef<HTMLDivElement, ModelSelectorProps>(
  function ModelSelector(
    {
      models,
      value,
      defaultValue,
      onValueChange,
      showCapabilities = false,
      label = "Model",
      className,
      ...props
    },
    ref
  ) {
    const [internal, setInternal] = useState(
      defaultValue ?? models[0]?.id ?? ""
    );
    const current = value ?? internal;
    const set = (next: string) => {
      if (value === undefined) setInternal(next);
      onValueChange?.(next);
    };
    const selected = models.find((m) => m.id === current);
    return (
      <div
        ref={ref}
        className={cx("vf-model-selector", className)}
        {...props}
      >
        <label className="vf-model-selector__label">
          <span className="vf-model-selector__label-text">{label}</span>
          <select
            className="vf-model-selector__select"
            value={current}
            onChange={(e) => set(e.target.value)}
          >
            {models.map((m) => (
              <option key={m.id} value={m.id}>
                {modelSummary(m)}
              </option>
            ))}
          </select>
        </label>
        {showCapabilities && selected && (
          <div className="vf-model-selector__caps">
            {selected.contextWindow && (
              <span className="vf-model-selector__cap">
                {formatContextWindow(selected.contextWindow)} context
              </span>
            )}
            {selected.capabilities?.map((c) => (
              <span key={c} className="vf-model-selector__cap">
                {c}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  }
);
ModelSelector.displayName = "ModelSelector";

function modelSummary(m: ChatModelOption): string {
  const name = typeof m.name === "string" ? m.name : m.id;
  const prov = typeof m.provider === "string" ? ` · ${m.provider}` : "";
  return `${name}${prov}`;
}

function formatContextWindow(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return String(n);
}

// ── SystemPromptEditor ──────────────────────────────────────

export interface SystemPromptTemplate {
  id: string;
  title: string;
  body: string;
}

export interface SystemPromptEditorProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (next: string) => void;
  templates?: SystemPromptTemplate[];
  onTemplateSelect?: (template: SystemPromptTemplate) => void;
  placeholder?: string;
  label?: ReactNode;
  rows?: number;
}

export const SystemPromptEditor = forwardRef<
  HTMLDivElement,
  SystemPromptEditorProps
>(function SystemPromptEditor(
  {
    value,
    defaultValue = "",
    onValueChange,
    templates,
    onTemplateSelect,
    placeholder,
    label = "System prompt",
    rows = 6,
    className,
    ...props
  },
  ref
) {
  const [internal, setInternal] = useState(defaultValue);
  const current = value ?? internal;
  const set = (next: string) => {
    if (value === undefined) setInternal(next);
    onValueChange?.(next);
  };
  return (
    <div
      ref={ref}
      className={cx("vf-system-prompt-editor", className)}
      {...props}
    >
      <label className="vf-system-prompt-editor__label">
        <span className="vf-system-prompt-editor__label-text">{label}</span>
        <textarea
          className="vf-system-prompt-editor__textarea"
          value={current}
          onChange={(e) => set(e.target.value)}
          rows={rows}
          placeholder={placeholder}
        />
      </label>
      {templates && templates.length > 0 && (
        <div className="vf-system-prompt-editor__templates">
          <span className="vf-system-prompt-editor__templates-label">
            Templates
          </span>
          {templates.map((t) => (
            <button
              key={t.id}
              type="button"
              className="vf-system-prompt-editor__template"
              onClick={() => {
                set(t.body);
                onTemplateSelect?.(t);
              }}
            >
              {t.title}
            </button>
          ))}
        </div>
      )}
    </div>
  );
});
SystemPromptEditor.displayName = "SystemPromptEditor";

// ── TokenCounter ────────────────────────────────────────────

export interface TokenCounterProps extends HTMLAttributes<HTMLDivElement> {
  input?: number;
  output?: number;
  total?: number;
  max?: number;
  kind?: "compact" | "detailed";
}

export const TokenCounter = forwardRef<HTMLDivElement, TokenCounterProps>(
  function TokenCounter(
    { input, output, total, max, kind = "compact", className, ...props },
    ref
  ) {
    const sum = total ?? (input ?? 0) + (output ?? 0);
    const pct = max ? Math.min(100, (sum / max) * 100) : 0;
    return (
      <div
        ref={ref}
        role="status"
        aria-label="Token count"
        className={cx(
          "vf-token-counter",
          `vf-token-counter--${kind}`,
          className
        )}
        {...props}
      >
        {kind === "detailed" && (
          <span className="vf-token-counter__parts">
            {input !== undefined && (
              <span className="vf-token-counter__part">
                <span className="vf-token-counter__part-label">in</span>{" "}
                {formatNumber(input)}
              </span>
            )}
            {output !== undefined && (
              <span className="vf-token-counter__part">
                <span className="vf-token-counter__part-label">out</span>{" "}
                {formatNumber(output)}
              </span>
            )}
          </span>
        )}
        <span className="vf-token-counter__total">
          {formatNumber(sum)}
          {max !== undefined && <> / {formatNumber(max)}</>}
        </span>
        {max !== undefined && (
          <span
            className="vf-token-counter__bar"
            aria-hidden="true"
          >
            <span
              className="vf-token-counter__bar-fill"
              style={{ width: `${pct}%` }}
            />
          </span>
        )}
      </div>
    );
  }
);
TokenCounter.displayName = "TokenCounter";

function formatNumber(n: number): string {
  return n.toLocaleString();
}

// ── ContextWindow — used vs available bar ───────────────────

export interface ContextWindowProps extends HTMLAttributes<HTMLDivElement> {
  used: number;
  max: number;
  label?: ReactNode;
}

export const ContextWindow = forwardRef<HTMLDivElement, ContextWindowProps>(
  function ContextWindow({ used, max, label = "Context", className, ...props }, ref) {
    const pct = Math.min(100, Math.max(0, (used / max) * 100));
    return (
      <div
        ref={ref}
        className={cx("vf-context-window", className)}
        role="progressbar"
        aria-label={typeof label === "string" ? label : undefined}
        aria-valuenow={used}
        aria-valuemin={0}
        aria-valuemax={max}
        {...props}
      >
        <div className="vf-context-window__header">
          <span className="vf-context-window__label">{label}</span>
          <span className="vf-context-window__values">
            {formatNumber(used)} / {formatNumber(max)}
          </span>
        </div>
        <div className="vf-context-window__bar">
          <div
            className={cx(
              "vf-context-window__bar-fill",
              pct > 90 && "vf-context-window__bar-fill--warn",
              pct > 98 && "vf-context-window__bar-fill--danger"
            )}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    );
  }
);
ContextWindow.displayName = "ContextWindow";

// ── CostDisplay ─────────────────────────────────────────────

export interface CostDisplayProps extends HTMLAttributes<HTMLDivElement> {
  input?: number;
  output?: number;
  total?: number;
  currency?: string;
  kind?: "compact" | "detailed";
  /** Fraction digits. Default 4. */
  precision?: number;
}

export const CostDisplay = forwardRef<HTMLDivElement, CostDisplayProps>(
  function CostDisplay(
    {
      input,
      output,
      total,
      currency = "$",
      kind = "compact",
      precision = 4,
      className,
      ...props
    },
    ref
  ) {
    const sum = total ?? (input ?? 0) + (output ?? 0);
    return (
      <div
        ref={ref}
        role="status"
        aria-label="Cost"
        className={cx(
          "vf-cost-display",
          `vf-cost-display--${kind}`,
          className
        )}
        {...props}
      >
        {kind === "detailed" && (
          <>
            {input !== undefined && (
              <span className="vf-cost-display__part">
                in {currency}
                {input.toFixed(precision)}
              </span>
            )}
            {output !== undefined && (
              <span className="vf-cost-display__part">
                out {currency}
                {output.toFixed(precision)}
              </span>
            )}
          </>
        )}
        <span className="vf-cost-display__total">
          {currency}
          {sum.toFixed(precision)}
        </span>
      </div>
    );
  }
);
CostDisplay.displayName = "CostDisplay";

// ── LatencyIndicator ───────────────────────────────────────

export interface LatencyIndicatorProps extends HTMLAttributes<HTMLSpanElement> {
  /** Latency in ms. */
  value: number;
  label?: ReactNode;
}

export const LatencyIndicator = forwardRef<
  HTMLSpanElement,
  LatencyIndicatorProps
>(function LatencyIndicator({ value, label, className, ...props }, ref) {
  const tone =
    value < 500 ? "good" : value < 2000 ? "warn" : value < 5000 ? "slow" : "bad";
  return (
    <span
      ref={ref}
      className={cx(
        "vf-latency",
        `vf-latency--${tone}`,
        className
      )}
      title={`${value}ms`}
      {...props}
    >
      {label && <span className="vf-latency__label">{label}</span>}
      <span className="vf-latency__value">{formatMs(value)}</span>
    </span>
  );
});
LatencyIndicator.displayName = "LatencyIndicator";

function formatMs(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

// ── DebugPanel — side drawer (minimal shell, consumer fills body) ──

export interface DebugEvent {
  id?: string;
  timestamp?: number | Date;
  type: string;
  message?: ReactNode;
  data?: unknown;
}

export interface DebugPanelProps
  extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  open?: boolean;
  onDismiss?: () => void;
  events?: DebugEvent[];
  title?: ReactNode;
  children?: ReactNode;
}

export const DebugPanel = forwardRef<HTMLElement, DebugPanelProps>(
  function DebugPanel(
    { open = true, onDismiss, events, title = "Debug", className, children, ...props },
    ref
  ) {
    if (!open) return null;
    return (
      <aside
        ref={ref}
        role="complementary"
        aria-label="Debug panel"
        className={cx("vf-debug-panel", className)}
        {...props}
      >
        <header className="vf-debug-panel__header">
          <span className="vf-debug-panel__title">{title}</span>
          {onDismiss && (
            <button
              type="button"
              className="vf-debug-panel__close"
              onClick={onDismiss}
              aria-label="Close debug panel"
            >
              ✕
            </button>
          )}
        </header>
        <div className="vf-debug-panel__body">
          {events && events.length > 0 && (
            <ol className="vf-debug-panel__events" role="list">
              {events.map((e, i) => (
                <li
                  key={String(e.id ?? i)}
                  className="vf-debug-panel__event"
                  data-type={e.type}
                >
                  <span className="vf-debug-panel__event-type">{e.type}</span>
                  {e.timestamp !== undefined && (
                    <span className="vf-debug-panel__event-time">
                      {formatTimestamp(e.timestamp)}
                    </span>
                  )}
                  {e.message && (
                    <span className="vf-debug-panel__event-message">
                      {e.message}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          )}
          {children}
        </div>
      </aside>
    );
  }
);
DebugPanel.displayName = "DebugPanel";

function formatTimestamp(value: number | Date): string {
  const date = value instanceof Date ? value : new Date(value);
  return date.toLocaleTimeString();
}

// ── TraceViewer — minimal timeline ───────────────────────────

export interface TraceSpan {
  id: string;
  name: ReactNode;
  startMs: number;
  durationMs: number;
  status?: "ok" | "error";
  children?: TraceSpan[];
}

export interface TraceViewerProps extends HTMLAttributes<HTMLDivElement> {
  spans: TraceSpan[];
  totalMs?: number;
}

export const TraceViewer = forwardRef<HTMLDivElement, TraceViewerProps>(
  function TraceViewer({ spans, totalMs, className, ...props }, ref) {
    const total = totalMs ?? computeTotal(spans);
    return (
      <div
        ref={ref}
        className={cx("vf-trace-viewer", className)}
        {...props}
      >
        <ol className="vf-trace-viewer__list" role="list">
          {flatten(spans, 0).map((span) => (
            <li
              key={span.id}
              className={cx(
                "vf-trace-viewer__span",
                span.status === "error" && "vf-trace-viewer__span--error"
              )}
              style={{ paddingLeft: span.depth * 12 }}
            >
              <span className="vf-trace-viewer__span-name">{span.name}</span>
              <span className="vf-trace-viewer__span-bar" aria-hidden="true">
                <span
                  className="vf-trace-viewer__span-fill"
                  style={{
                    left: `${(span.startMs / total) * 100}%`,
                    width: `${Math.max(
                      0.5,
                      (span.durationMs / total) * 100
                    )}%`,
                  }}
                />
              </span>
              <span className="vf-trace-viewer__span-duration">
                {formatMs(span.durationMs)}
              </span>
            </li>
          ))}
        </ol>
      </div>
    );
  }
);
TraceViewer.displayName = "TraceViewer";

function computeTotal(spans: TraceSpan[]): number {
  let max = 0;
  const walk = (list: TraceSpan[]) => {
    for (const s of list) {
      max = Math.max(max, s.startMs + s.durationMs);
      if (s.children) walk(s.children);
    }
  };
  walk(spans);
  return max || 1;
}

function flatten(
  spans: TraceSpan[],
  depth: number
): (TraceSpan & { depth: number })[] {
  const out: (TraceSpan & { depth: number })[] = [];
  for (const s of spans) {
    out.push({ ...s, depth });
    if (s.children) out.push(...flatten(s.children, depth + 1));
  }
  return out;
}

// ── UnreadBadge ─────────────────────────────────────────────

export interface UnreadBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  count?: number;
  max?: number;
  dot?: boolean;
  label?: string;
}

export const UnreadBadge = forwardRef<HTMLSpanElement, UnreadBadgeProps>(
  function UnreadBadge(
    { count, max = 99, dot, label = "Unread", className, ...props },
    ref
  ) {
    if (dot || count === undefined) {
      return (
        <span
          ref={ref}
          role="status"
          aria-label={label}
          className={cx("vf-unread-badge", "vf-unread-badge--dot", className)}
          {...props}
        />
      );
    }
    if (count <= 0) return null;
    const display = count > max ? `${max}+` : String(count);
    return (
      <span
        ref={ref}
        role="status"
        aria-label={`${count} ${label}`}
        className={cx("vf-unread-badge", className)}
        {...props}
      >
        {display}
      </span>
    );
  }
);
UnreadBadge.displayName = "UnreadBadge";

// ── Layout patterns ─────────────────────────────────────────

export interface ChatLayoutProps extends HTMLAttributes<HTMLDivElement> {
  sidebar?: ReactNode;
  conversation: ReactNode;
  inspector?: ReactNode;
  /** Hide sidebar / inspector responsively. Consumer-driven. */
  hideSidebar?: boolean;
  hideInspector?: boolean;
}

export const ChatLayout = forwardRef<HTMLDivElement, ChatLayoutProps>(
  function ChatLayout(
    {
      sidebar,
      conversation,
      inspector,
      hideSidebar,
      hideInspector,
      className,
      ...props
    },
    ref
  ) {
    return (
      <div
        ref={ref}
        className={cx(
          "vf-chat-layout",
          sidebar && !hideSidebar && "vf-chat-layout--with-sidebar",
          inspector && !hideInspector && "vf-chat-layout--with-inspector",
          className
        )}
        {...props}
      >
        {sidebar && !hideSidebar && (
          <aside className="vf-chat-layout__sidebar">{sidebar}</aside>
        )}
        <main className="vf-chat-layout__main">{conversation}</main>
        {inspector && !hideInspector && (
          <aside className="vf-chat-layout__inspector">{inspector}</aside>
        )}
      </div>
    );
  }
);
ChatLayout.displayName = "ChatLayout";

export interface SimpleChatProps extends HTMLAttributes<HTMLDivElement> {
  conversation: ReactNode;
  header?: ReactNode;
}

export const SimpleChat = forwardRef<HTMLDivElement, SimpleChatProps>(
  function SimpleChat({ conversation, header, className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cx("vf-simple-chat", className)}
        {...props}
      >
        {header && <header className="vf-simple-chat__header">{header}</header>}
        <main className="vf-simple-chat__main">{conversation}</main>
      </div>
    );
  }
);
SimpleChat.displayName = "SimpleChat";

// ── ModelPicker — simple themed dropdown ───────────────────

export interface ModelPickerOption {
  id: string;
  name: string;
  description?: string;
  disabled?: boolean;
}

export interface ModelPickerProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  models: ModelPickerOption[];
  value: string;
  onValueChange: (modelId: string) => void;
  label?: string;
}

export const ModelPicker = forwardRef<HTMLDivElement, ModelPickerProps>(
  function ModelPicker(
    { models, value, onValueChange, label, className, ...props },
    ref
  ) {
    return (
      <div
        ref={ref}
        className={cx("vf-model-picker", className)}
        {...props}
      >
        {label && <span className="vf-model-picker__label">{label}</span>}
        <select
          className="vf-model-picker__select"
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
        >
          {models.map((m) => (
            <option key={m.id} value={m.id} disabled={m.disabled}>
              {m.name}{m.description ? ` — ${m.description}` : ""}
            </option>
          ))}
        </select>
      </div>
    );
  }
);
ModelPicker.displayName = "ModelPicker";

export interface AgentRunnerProps extends HTMLAttributes<HTMLDivElement> {
  conversation: ReactNode;
  plan?: ReactNode;
  trace?: ReactNode;
  header?: ReactNode;
}

export const AgentRunner = forwardRef<HTMLDivElement, AgentRunnerProps>(
  function AgentRunner(
    { conversation, plan, trace, header, className, ...props },
    ref
  ) {
    return (
      <div
        ref={ref}
        className={cx("vf-agent-runner", className)}
        {...props}
      >
        {header && <header className="vf-agent-runner__header">{header}</header>}
        <div className="vf-agent-runner__body">
          <main className="vf-agent-runner__conversation">{conversation}</main>
          {(plan || trace) && (
            <aside className="vf-agent-runner__side">
              {plan && (
                <section className="vf-agent-runner__plan">{plan}</section>
              )}
              {trace && (
                <section className="vf-agent-runner__trace">{trace}</section>
              )}
            </aside>
          )}
        </div>
      </div>
    );
  }
);
AgentRunner.displayName = "AgentRunner";
