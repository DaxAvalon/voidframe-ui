"use client";

// Phase 13 — Dev tools: CommitGraph, NetworkInspector, ConsoleOutput,
// DebugTree, KeyValueEditor, QueryBuilder, ShortcutEditor.

import {
  forwardRef,
  useEffect,
  useMemo,
  useState,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { cx } from "../utils/cx";
import { JSONViewer } from "./Viewers";

// ── CommitGraph ─────────────────────────────────────────────
// Renders a compact, text-native "graph" of commits with parent lines.
// No SVG — just monospace grid characters that match the brutalist tone.

export interface CommitNode {
  id: string;
  message: ReactNode;
  author?: ReactNode;
  timestamp?: ReactNode;
  branch?: string;
  parents?: string[];
  tone?: "neutral" | "info" | "success" | "warning" | "danger";
}

export interface CommitGraphProps extends HTMLAttributes<HTMLDivElement> {
  commits: CommitNode[];
  onCommitClick?: (id: string) => void;
  activeId?: string;
}

export const CommitGraph = forwardRef<HTMLDivElement, CommitGraphProps>(
  function CommitGraph({ commits, onCommitClick, activeId, className, ...props }, ref) {
    return (
      <div
        ref={ref}
        role="list"
        aria-label="Commit history"
        className={cx("vf-commit-graph", className)}
        {...props}
      >
        {commits.map((commit, i) => {
          const isLast = i === commits.length - 1;
          const isActive = activeId === commit.id;
          return (
            <button
              key={commit.id}
              type="button"
              role="listitem"
              aria-current={isActive ? "true" : undefined}
              className={cx(
                "vf-commit-graph__row",
                isActive && "vf-commit-graph__row--active",
                commit.tone && `vf-commit-graph__row--${commit.tone}`
              )}
              onClick={() => onCommitClick?.(commit.id)}
              disabled={!onCommitClick}
            >
              <span className="vf-commit-graph__rail" aria-hidden="true">
                <span className="vf-commit-graph__node">●</span>
                {!isLast && <span className="vf-commit-graph__line">│</span>}
              </span>
              <span className="vf-commit-graph__body">
                <span className="vf-commit-graph__head">
                  <span className="vf-commit-graph__id">
                    {commit.id.slice(0, 7)}
                  </span>
                  {commit.branch && (
                    <span className="vf-commit-graph__branch">
                      {commit.branch}
                    </span>
                  )}
                  {commit.timestamp && (
                    <span className="vf-commit-graph__time">
                      {commit.timestamp}
                    </span>
                  )}
                </span>
                <span className="vf-commit-graph__message">
                  {commit.message}
                </span>
                {commit.author && (
                  <span className="vf-commit-graph__author">
                    {commit.author}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    );
  }
);
CommitGraph.displayName = "CommitGraph";

// ── NetworkInspector ────────────────────────────────────────

export type NetworkRequestStatus =
  | "pending"
  | "complete"
  | "error"
  | "aborted";

export interface NetworkRequest {
  id: string;
  method: string;
  url: string;
  status?: number;
  statusText?: string;
  duration?: number;
  size?: number;
  type?: string;
  startedAt?: number;
  state?: NetworkRequestStatus;
  requestHeaders?: Record<string, string>;
  responseHeaders?: Record<string, string>;
  requestBody?: unknown;
  responseBody?: unknown;
}

export interface NetworkInspectorProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onSelect"> {
  requests: NetworkRequest[];
  filter?: string;
  onFilterChange?: (next: string) => void;
  selectedId?: string;
  onSelect?: (id: string) => void;
  /** Show the request detail pane (bottom) when an item is selected. */
  showDetail?: boolean;
}

export const NetworkInspector = forwardRef<
  HTMLDivElement,
  NetworkInspectorProps
>(function NetworkInspector(
  {
    requests,
    filter = "",
    onFilterChange,
    selectedId,
    onSelect,
    showDetail = true,
    className,
    ...props
  },
  ref
) {
  const [internalFilter, setInternalFilter] = useState(filter);
  const q = (onFilterChange ? filter : internalFilter).trim().toLowerCase();
  const filtered = useMemo(
    () =>
      q
        ? requests.filter(
            (r) =>
              r.url.toLowerCase().includes(q) ||
              r.method.toLowerCase().includes(q) ||
              String(r.status ?? "").includes(q) ||
              (r.type ?? "").toLowerCase().includes(q)
          )
        : requests,
    [requests, q]
  );
  const selected = selectedId
    ? filtered.find((r) => r.id === selectedId) ??
      requests.find((r) => r.id === selectedId)
    : undefined;

  const setFilter = (next: string) => {
    if (onFilterChange) onFilterChange(next);
    else setInternalFilter(next);
  };

  return (
    <div
      ref={ref}
      className={cx("vf-network-inspector", className)}
      {...props}
    >
      <header className="vf-network-inspector__bar">
        <input
          type="search"
          value={onFilterChange ? filter : internalFilter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter requests…"
          className="vf-network-inspector__search"
          aria-label="Filter network requests"
        />
        <span className="vf-network-inspector__count">
          {filtered.length} / {requests.length}
        </span>
      </header>
      <table className="vf-network-inspector__table">
        <thead>
          <tr>
            <th>Method</th>
            <th>Status</th>
            <th>URL</th>
            <th>Type</th>
            <th>Size</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((r) => {
            const isActive = r.id === selectedId;
            return (
              <tr
                key={r.id}
                data-state={r.state}
                className={cx(
                  "vf-network-inspector__row",
                  isActive && "vf-network-inspector__row--active",
                  r.state === "error" && "vf-network-inspector__row--error"
                )}
                onClick={() => onSelect?.(r.id)}
              >
                <td>{r.method}</td>
                <td>
                  {r.status !== undefined ? (
                    <span
                      className={cx(
                        "vf-network-inspector__status",
                        statusTone(r.status)
                      )}
                    >
                      {r.status}
                    </span>
                  ) : (
                    <span className="vf-network-inspector__pending">…</span>
                  )}
                </td>
                <td className="vf-network-inspector__url">{r.url}</td>
                <td>{r.type ?? "—"}</td>
                <td>{r.size !== undefined ? formatBytes(r.size) : "—"}</td>
                <td>
                  {r.duration !== undefined ? formatDuration(r.duration) : "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {showDetail && selected && (
        <section className="vf-network-inspector__detail">
          <header className="vf-network-inspector__detail-head">
            <span className="vf-network-inspector__detail-method">
              {selected.method}
            </span>
            <span className="vf-network-inspector__detail-url">
              {selected.url}
            </span>
          </header>
          {selected.requestHeaders && (
            <DetailSection title="Request headers">
              <JSONViewer data={selected.requestHeaders} defaultExpanded={1} />
            </DetailSection>
          )}
          {selected.requestBody !== undefined && (
            <DetailSection title="Request body">
              <JSONViewer data={selected.requestBody} defaultExpanded={1} />
            </DetailSection>
          )}
          {selected.responseHeaders && (
            <DetailSection title="Response headers">
              <JSONViewer data={selected.responseHeaders} defaultExpanded={1} />
            </DetailSection>
          )}
          {selected.responseBody !== undefined && (
            <DetailSection title="Response body">
              <JSONViewer data={selected.responseBody} defaultExpanded={1} />
            </DetailSection>
          )}
        </section>
      )}
    </div>
  );
});
NetworkInspector.displayName = "NetworkInspector";

function DetailSection({
  title,
  children,
}: {
  title: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="vf-network-inspector__section">
      <header className="vf-network-inspector__section-title">{title}</header>
      {children}
    </section>
  );
}

function statusTone(status: number): string {
  if (status >= 500) return "vf-network-inspector__status--danger";
  if (status >= 400) return "vf-network-inspector__status--warning";
  if (status >= 300) return "vf-network-inspector__status--info";
  return "vf-network-inspector__status--success";
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}K`;
  return `${(bytes / 1024 / 1024).toFixed(1)}M`;
}

function formatDuration(ms: number): string {
  if (ms < 1) return "<1ms";
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

// ── ConsoleOutput ───────────────────────────────────────────

export type ConsoleLevel = "log" | "warn" | "error" | "info" | "debug";

export interface ConsoleEntry {
  id?: string;
  level: ConsoleLevel;
  message: ReactNode;
  timestamp?: number | Date;
  source?: ReactNode;
}

export interface ConsoleOutputProps extends HTMLAttributes<HTMLDivElement> {
  entries: ConsoleEntry[];
  /**
   * Filter syntax: single level ("warn"), or minimum level ("warn+") meaning
   * warn OR higher severity.
   */
  filter?: string;
  showTimestamps?: boolean;
}

const LEVEL_ORDER: ConsoleLevel[] = ["debug", "log", "info", "warn", "error"];

export const ConsoleOutput = forwardRef<HTMLDivElement, ConsoleOutputProps>(
  function ConsoleOutput(
    { entries, filter, showTimestamps = true, className, ...props },
    ref
  ) {
    const filtered = useMemo(() => {
      if (!filter) return entries;
      const f = filter.trim().toLowerCase();
      if (!f) return entries;
      const plus = f.endsWith("+");
      const base = plus ? f.slice(0, -1) : f;
      const idx = LEVEL_ORDER.indexOf(base as ConsoleLevel);
      if (idx === -1) return entries;
      return entries.filter((entry) => {
        const ei = LEVEL_ORDER.indexOf(entry.level);
        return plus ? ei >= idx : ei === idx;
      });
    }, [entries, filter]);

    return (
      <div
        ref={ref}
        role="log"
        aria-label="Console output"
        className={cx("vf-console-output", className)}
        {...props}
      >
        {filtered.map((entry, i) => (
          <div
            key={String(entry.id ?? i)}
            data-level={entry.level}
            className={cx(
              "vf-console-output__line",
              `vf-console-output__line--${entry.level}`
            )}
          >
            <span className="vf-console-output__level" aria-hidden="true">
              {levelGlyph(entry.level)}
            </span>
            {showTimestamps && entry.timestamp !== undefined && (
              <span className="vf-console-output__time">
                {formatTime(entry.timestamp)}
              </span>
            )}
            {entry.source && (
              <span className="vf-console-output__source">{entry.source}</span>
            )}
            <span className="vf-console-output__message">{entry.message}</span>
          </div>
        ))}
      </div>
    );
  }
);
ConsoleOutput.displayName = "ConsoleOutput";

function levelGlyph(level: ConsoleLevel): string {
  if (level === "error") return "✕";
  if (level === "warn") return "▲";
  if (level === "info") return "ⓘ";
  if (level === "debug") return "⋯";
  return "›";
}

function formatTime(value: number | Date): string {
  const date = value instanceof Date ? value : new Date(value);
  return date.toLocaleTimeString(undefined, { hour12: false });
}

// ── DebugTree ───────────────────────────────────────────────

export type DebugTreeFormat = "json" | "yaml";

export interface DebugTreeProps extends HTMLAttributes<HTMLDivElement> {
  data: unknown;
  /** Serialization format. Default `"json"` (uses the collapsible viewer). */
  format?: DebugTreeFormat;
  /** Depth to expand initially. Default 1. `true` expands all. Ignored for YAML. */
  defaultExpanded?: number | boolean;
  rootLabel?: ReactNode;
}

export const DebugTree = forwardRef<HTMLDivElement, DebugTreeProps>(
  function DebugTree(
    {
      data,
      format = "json",
      defaultExpanded = 2,
      rootLabel,
      className,
      ...props
    },
    ref
  ) {
    return (
      <div
        ref={ref}
        className={cx("vf-debug-tree", `vf-debug-tree--${format}`, className)}
        data-format={format}
        {...props}
      >
        {rootLabel && (
          <header className="vf-debug-tree__label">{rootLabel}</header>
        )}
        {format === "yaml" ? (
          <pre className="vf-debug-tree__yaml">{toYaml(data)}</pre>
        ) : (
          <JSONViewer data={data} defaultExpanded={defaultExpanded} />
        )}
      </div>
    );
  }
);
DebugTree.displayName = "DebugTree";

/**
 * Minimal YAML serializer. Handles strings, numbers, booleans, null, arrays,
 * plain objects. Non-safe keys / multi-line strings fall back to quoted form.
 *
 * Not a full YAML implementation — intended for debug/inspector display.
 */
export function toYaml(value: unknown, indent = 0): string {
  const pad = "  ".repeat(indent);
  if (value === null || value === undefined) return "null";
  if (typeof value === "string") return yamlString(value);
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) {
    if (value.length === 0) return "[]";
    return value
      .map((item) => {
        if (isScalar(item)) return `${pad}- ${toYaml(item, 0)}`;
        const rendered = toYaml(item, indent + 1);
        // Place first line after the dash; indent remaining lines.
        const lines = rendered.split("\n");
        const firstTrimmed = lines[0]!.replace(/^ +/, "");
        const rest = lines.slice(1).join("\n");
        return `${pad}- ${firstTrimmed}${rest ? "\n" + rest : ""}`;
      })
      .join("\n");
  }
  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) return "{}";
    return entries
      .map(([k, v]) => {
        const key = yamlKey(k);
        if (isScalar(v)) return `${pad}${key}: ${toYaml(v, 0)}`;
        if (Array.isArray(v) && v.length === 0) return `${pad}${key}: []`;
        if (v && typeof v === "object" && Object.keys(v).length === 0) return `${pad}${key}: {}`;
        return `${pad}${key}:\n${toYaml(v, indent + 1)}`;
      })
      .join("\n");
  }
  return String(value);
}

function isScalar(v: unknown): boolean {
  return (
    v === null ||
    v === undefined ||
    typeof v === "string" ||
    typeof v === "number" ||
    typeof v === "boolean"
  );
}

function yamlKey(key: string): string {
  return /^[A-Za-z_][A-Za-z0-9_\-]*$/.test(key) ? key : JSON.stringify(key);
}

function yamlString(s: string): string {
  if (s === "") return '""';
  if (/[:\-#?&*!|>'"%@`\n\t]/.test(s) || /^\s|\s$/.test(s) || /^(true|false|null|yes|no|~)$/i.test(s)) {
    return JSON.stringify(s);
  }
  return s;
}

// ── KeyValueEditor ──────────────────────────────────────────

export interface KeyValuePair {
  key: string;
  value: string;
  disabled?: boolean;
  id?: string;
}

export interface KeyValueEditorProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  value: KeyValuePair[];
  onValueChange: (next: KeyValuePair[]) => void;
  keyPlaceholder?: string;
  valuePlaceholder?: string;
  addLabel?: ReactNode;
  allowDisable?: boolean;
}

export const KeyValueEditor = forwardRef<HTMLDivElement, KeyValueEditorProps>(
  function KeyValueEditor(
    {
      value: entries,
      onValueChange,
      keyPlaceholder = "Key",
      valuePlaceholder = "Value",
      addLabel = "Add",
      allowDisable = true,
      className,
      ...props
    },
    ref
  ) {
    const update = (i: number, patch: Partial<KeyValuePair>) => {
      onValueChange(entries.map((e, idx) => (idx === i ? { ...e, ...patch } : e)));
    };
    const remove = (i: number) => {
      onValueChange(entries.filter((_, idx) => idx !== i));
    };
    const add = () => {
      onValueChange([
        ...entries,
        { key: "", value: "", id: `kv-${Date.now().toString(36)}` },
      ]);
    };
    return (
      <div
        ref={ref}
        className={cx("vf-kv-editor", className)}
        role="group"
        aria-label="Key value editor"
        {...props}
      >
        <ol className="vf-kv-editor__list">
          {entries.map((entry, i) => (
            <li
              key={entry.id ?? `${i}-${entry.key}`}
              className={cx(
                "vf-kv-editor__row",
                entry.disabled && "vf-kv-editor__row--disabled"
              )}
            >
              {allowDisable && (
                <input
                  type="checkbox"
                  className="vf-kv-editor__enabled"
                  checked={!entry.disabled}
                  onChange={(e) => update(i, { disabled: !e.target.checked })}
                  aria-label={
                    entry.disabled ? "Enable entry" : "Disable entry"
                  }
                />
              )}
              <input
                type="text"
                className="vf-kv-editor__input vf-kv-editor__input--key"
                placeholder={keyPlaceholder}
                value={entry.key}
                disabled={entry.disabled}
                onChange={(e) => update(i, { key: e.target.value })}
                aria-label="Key"
              />
              <input
                type="text"
                className="vf-kv-editor__input vf-kv-editor__input--value"
                placeholder={valuePlaceholder}
                value={entry.value}
                disabled={entry.disabled}
                onChange={(e) => update(i, { value: e.target.value })}
                aria-label="Value"
              />
              <button
                type="button"
                className="vf-kv-editor__remove"
                aria-label="Remove"
                onClick={() => remove(i)}
              >
                ✕
              </button>
            </li>
          ))}
        </ol>
        <button type="button" className="vf-kv-editor__add" onClick={add}>
          + {addLabel}
        </button>
      </div>
    );
  }
);
KeyValueEditor.displayName = "KeyValueEditor";

// ── QueryBuilder ────────────────────────────────────────────

export type QueryOperator =
  | "="
  | "!="
  | ">"
  | "<"
  | ">="
  | "<="
  | "contains"
  | "startsWith"
  | "endsWith"
  | "in";

export interface QueryFieldDef {
  id: string;
  label: string;
  type?: "string" | "number" | "boolean" | "date";
  operators?: QueryOperator[];
}

export interface QueryRule {
  id: string;
  field: string;
  operator: QueryOperator;
  value: string;
}

export interface QueryGroup {
  id: string;
  combinator: "AND" | "OR";
  rules: (QueryRule | QueryGroup)[];
}

export interface QueryBuilderProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  fields: QueryFieldDef[];
  operators?: QueryOperator[];
  value: QueryGroup;
  onValueChange: (next: QueryGroup) => void;
}

const DEFAULT_OPERATORS: QueryOperator[] = [
  "=",
  "!=",
  ">",
  "<",
  "contains",
];

function isGroup(node: QueryRule | QueryGroup): node is QueryGroup {
  return (node as QueryGroup).rules !== undefined;
}

function nextId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.floor(Math.random() * 1000)}`;
}

export const QueryBuilder = forwardRef<HTMLDivElement, QueryBuilderProps>(
  function QueryBuilder(
    { fields, operators = DEFAULT_OPERATORS, value, onValueChange, className, ...props },
    ref
  ) {
    const update = (next: QueryGroup) => onValueChange(next);

    const replaceIn = (
      root: QueryGroup,
      id: string,
      fn: (node: QueryRule | QueryGroup) => QueryRule | QueryGroup | null
    ): QueryGroup => {
      const rules: (QueryRule | QueryGroup)[] = [];
      for (const rule of root.rules) {
        if (rule.id === id) {
          const next = fn(rule);
          if (next) rules.push(next);
          continue;
        }
        if (isGroup(rule)) {
          rules.push(replaceIn(rule, id, fn));
        } else {
          rules.push(rule);
        }
      }
      return { ...root, rules };
    };

    const addRule = (groupId: string) => {
      const newRule: QueryRule = {
        id: nextId("r"),
        field: fields[0]?.id ?? "",
        operator: operators[0] ?? "=",
        value: "",
      };
      if (value.id === groupId) {
        update({ ...value, rules: [...value.rules, newRule] });
        return;
      }
      update(
        replaceIn(value, groupId, (node) =>
          isGroup(node)
            ? { ...node, rules: [...node.rules, newRule] }
            : node
        )
      );
    };

    const addGroup = (groupId: string) => {
      const group: QueryGroup = {
        id: nextId("g"),
        combinator: "AND",
        rules: [],
      };
      if (value.id === groupId) {
        update({ ...value, rules: [...value.rules, group] });
        return;
      }
      update(
        replaceIn(value, groupId, (node) =>
          isGroup(node)
            ? { ...node, rules: [...node.rules, group] }
            : node
        )
      );
    };

    const removeRule = (id: string) => {
      update(replaceIn(value, id, () => null));
    };

    const updateRule = (id: string, patch: Partial<QueryRule>) => {
      update(
        replaceIn(value, id, (node) =>
          isGroup(node) ? node : { ...node, ...patch }
        )
      );
    };

    const updateCombinator = (groupId: string, combinator: "AND" | "OR") => {
      if (value.id === groupId) {
        update({ ...value, combinator });
        return;
      }
      update(
        replaceIn(value, groupId, (node) =>
          isGroup(node) ? { ...node, combinator } : node
        )
      );
    };

    return (
      <div
        ref={ref}
        className={cx("vf-query-builder", className)}
        {...props}
      >
        <Group
          group={value}
          fields={fields}
          operators={operators}
          onCombinatorChange={updateCombinator}
          onRuleChange={updateRule}
          onRuleRemove={removeRule}
          onAddRule={addRule}
          onAddGroup={addGroup}
          root
        />
      </div>
    );
  }
);
QueryBuilder.displayName = "QueryBuilder";

function Group(props: {
  group: QueryGroup;
  fields: QueryFieldDef[];
  operators: QueryOperator[];
  onCombinatorChange: (groupId: string, next: "AND" | "OR") => void;
  onRuleChange: (id: string, patch: Partial<QueryRule>) => void;
  onRuleRemove: (id: string) => void;
  onAddRule: (groupId: string) => void;
  onAddGroup: (groupId: string) => void;
  root?: boolean;
}) {
  const {
    group,
    fields,
    operators,
    onCombinatorChange,
    onRuleChange,
    onRuleRemove,
    onAddRule,
    onAddGroup,
    root,
  } = props;
  return (
    <div
      className={cx(
        "vf-query-builder__group",
        root && "vf-query-builder__group--root"
      )}
    >
      <header className="vf-query-builder__group-head">
        <select
          className="vf-query-builder__combinator"
          value={group.combinator}
          onChange={(e) =>
            onCombinatorChange(group.id, e.target.value as "AND" | "OR")
          }
          aria-label="Combinator"
        >
          <option value="AND">AND</option>
          <option value="OR">OR</option>
        </select>
        <button
          type="button"
          className="vf-query-builder__action"
          onClick={() => onAddRule(group.id)}
        >
          + Rule
        </button>
        <button
          type="button"
          className="vf-query-builder__action"
          onClick={() => onAddGroup(group.id)}
        >
          + Group
        </button>
      </header>
      <ol className="vf-query-builder__rules">
        {group.rules.map((rule) => (
          <li key={rule.id} className="vf-query-builder__item">
            {isGroup(rule) ? (
              <Group
                group={rule}
                fields={fields}
                operators={operators}
                onCombinatorChange={onCombinatorChange}
                onRuleChange={onRuleChange}
                onRuleRemove={onRuleRemove}
                onAddRule={onAddRule}
                onAddGroup={onAddGroup}
              />
            ) : (
              <Rule
                rule={rule}
                fields={fields}
                operators={operators}
                onChange={(patch) => onRuleChange(rule.id, patch)}
                onRemove={() => onRuleRemove(rule.id)}
              />
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}

function Rule(props: {
  rule: QueryRule;
  fields: QueryFieldDef[];
  operators: QueryOperator[];
  onChange: (patch: Partial<QueryRule>) => void;
  onRemove: () => void;
}) {
  const { rule, fields, operators, onChange, onRemove } = props;
  return (
    <div className="vf-query-builder__rule">
      <select
        className="vf-query-builder__field"
        value={rule.field}
        onChange={(e) => onChange({ field: e.target.value })}
        aria-label="Field"
      >
        {fields.map((f) => (
          <option key={f.id} value={f.id}>
            {f.label}
          </option>
        ))}
      </select>
      <select
        className="vf-query-builder__op"
        value={rule.operator}
        onChange={(e) =>
          onChange({ operator: e.target.value as QueryOperator })
        }
        aria-label="Operator"
      >
        {operators.map((op) => (
          <option key={op} value={op}>
            {op}
          </option>
        ))}
      </select>
      <input
        type="text"
        className="vf-query-builder__value"
        value={rule.value}
        onChange={(e) => onChange({ value: e.target.value })}
        aria-label="Value"
        placeholder="value"
      />
      <button
        type="button"
        className="vf-query-builder__remove"
        aria-label="Remove rule"
        onClick={onRemove}
      >
        ✕
      </button>
    </div>
  );
}

// ── ShortcutEditor ──────────────────────────────────────────

export interface ShortcutEditorProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (next: string) => void;
  conflicts?: string[];
  placeholder?: ReactNode;
  label?: ReactNode;
}

export const ShortcutEditor = forwardRef<HTMLDivElement, ShortcutEditorProps>(
  function ShortcutEditor(
    {
      value,
      defaultValue = "",
      onValueChange,
      conflicts = [],
      placeholder = "Press a key combination…",
      label = "Shortcut",
      className,
      ...props
    },
    ref
  ) {
    const [internal, setInternal] = useState(defaultValue);
    const current = value ?? internal;
    const [listening, setListening] = useState(false);
    const set = (next: string) => {
      if (value === undefined) setInternal(next);
      onValueChange?.(next);
    };
    const conflict = conflicts.includes(current);

    const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
      if (!listening) return;
      e.preventDefault();
      if (e.key === "Escape") {
        setListening(false);
        return;
      }
      const parts: string[] = [];
      if (e.metaKey || e.ctrlKey) parts.push("mod");
      if (e.altKey) parts.push("alt");
      if (e.shiftKey) parts.push("shift");
      const key = normalizeKey(e.key);
      if (!key || ["Meta", "Control", "Alt", "Shift"].includes(e.key)) return;
      parts.push(key);
      set(parts.join("+"));
      setListening(false);
    };

    return (
      <div
        ref={ref}
        className={cx(
          "vf-shortcut-editor",
          listening && "vf-shortcut-editor--listening",
          conflict && "vf-shortcut-editor--conflict",
          className
        )}
        {...props}
      >
        {label && (
          <span className="vf-shortcut-editor__label">{label}</span>
        )}
        <button
          type="button"
          className="vf-shortcut-editor__capture"
          onClick={() => setListening(true)}
          onKeyDown={onKeyDown}
          onBlur={() => setListening(false)}
          aria-label="Edit shortcut"
          aria-describedby={conflict ? "vf-shortcut-conflict" : undefined}
        >
          {listening ? (
            <span className="vf-shortcut-editor__prompt">{placeholder}</span>
          ) : current ? (
            <span className="vf-shortcut-editor__chord">{current}</span>
          ) : (
            <span className="vf-shortcut-editor__empty">unassigned</span>
          )}
        </button>
        {current && !listening && (
          <button
            type="button"
            className="vf-shortcut-editor__clear"
            onClick={() => set("")}
            aria-label="Clear shortcut"
          >
            ✕
          </button>
        )}
        {conflict && (
          <span
            id="vf-shortcut-conflict"
            className="vf-shortcut-editor__conflict"
          >
            Already assigned
          </span>
        )}
      </div>
    );
  }
);
ShortcutEditor.displayName = "ShortcutEditor";

function normalizeKey(key: string): string | null {
  if (!key) return null;
  if (key.length === 1) return key.toLowerCase();
  // Normalize common named keys.
  const map: Record<string, string> = {
    ArrowUp: "up",
    ArrowDown: "down",
    ArrowLeft: "left",
    ArrowRight: "right",
    " ": "space",
    Escape: "esc",
  };
  return map[key] ?? key.toLowerCase();
}
