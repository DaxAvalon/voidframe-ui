"use client";

import { forwardRef, memo, useCallback, useMemo, useState } from "react";
import type { HTMLAttributes } from "react";
import { cx } from "../utils/cx";

export interface EnvVar {
  key: string;
  value: string;
  secret?: boolean;
  type?: "string" | "number" | "boolean" | "json" | "url";
  description?: string;
  group?: string;
  inherited?: boolean;
}

export interface EnvironmentVarsProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  value: EnvVar[];
  onValueChange?: (variables: EnvVar[]) => void;
  onAdd?: (variable: EnvVar) => void;
  onRemove?: (key: string) => void;
  readOnly?: boolean;
  searchable?: boolean;
  groupBy?: "group" | "type" | "none";
  showTypes?: boolean;
  size?: "sm" | "md";
  addable?: boolean;
  copyable?: boolean;
}

const EnvironmentVarsImpl = forwardRef<HTMLDivElement, EnvironmentVarsProps>(
  function EnvironmentVars(
    {
      value: variables,
      onValueChange,
      onAdd,
      onRemove,
      readOnly = false,
      searchable = false,
      groupBy = "none",
      showTypes = false,
      size = "md",
      addable = true,
      copyable = true,
      className,
      style,
      ...props
    },
    ref
  ) {
    const [search, setSearch] = useState("");
    const [revealedKeys, setRevealedKeys] = useState<Set<string>>(new Set());
    const [editingKey, setEditingKey] = useState<string | null>(null);
    const [editValue, setEditValue] = useState("");
    const [newKey, setNewKey] = useState("");
    const [newValue, setNewValue] = useState("");

    const filtered = useMemo(() => {
      if (!search) return variables;
      const q = search.toLowerCase();
      return variables.filter((v) => v.key.toLowerCase().includes(q));
    }, [variables, search]);

    const grouped = useMemo(() => {
      if (groupBy === "none") return { "": filtered };
      const groups: Record<string, EnvVar[]> = {};
      for (const v of filtered) {
        const gk = groupBy === "group" ? (v.group ?? "") : (v.type ?? "string");
        if (!groups[gk]) groups[gk] = [];
        groups[gk]!.push(v);
      }
      return groups;
    }, [filtered, groupBy]);

    const toggleReveal = useCallback((key: string) => {
      setRevealedKeys((prev) => {
        const next = new Set(prev);
        if (next.has(key)) next.delete(key);
        else next.add(key);
        return next;
      });
    }, []);

    const handleCopy = useCallback(async (value: string) => {
      try {
        await navigator.clipboard.writeText(value);
      } catch {
        // Fallback: noop
      }
    }, []);

    const startEdit = useCallback((v: EnvVar) => {
      setEditingKey(v.key);
      setEditValue(v.value);
    }, []);

    const commitEdit = useCallback(() => {
      if (!editingKey || !onValueChange) return;
      const updated = variables.map((v) =>
        v.key === editingKey ? { ...v, value: editValue } : v
      );
      onValueChange(updated);
      setEditingKey(null);
    }, [editingKey, editValue, onValueChange, variables]);

    const handleAdd = useCallback(() => {
      if (!newKey.trim()) return;
      const newVar: EnvVar = { key: newKey.trim(), value: newValue };
      onAdd?.(newVar);
      setNewKey("");
      setNewValue("");
    }, [newKey, newValue, onAdd]);

    const renderRow = (v: EnvVar) => {
      const isRevealed = revealedKeys.has(v.key);
      const isEditing = editingKey === v.key;
      const isSecret = v.secret === true;

      return (
        <div
          key={v.key}
          className={cx(
            "vf-env-vars__row",
            v.inherited && "vf-env-vars__row--inherited"
          )}
          data-inherited={v.inherited ? "true" : undefined}
        >
          <span className="vf-env-vars__key">{v.key}</span>
          <span
            className={cx(
              "vf-env-vars__value",
              isSecret && !isRevealed && "vf-env-vars__value--masked"
            )}
          >
            {isEditing && !readOnly && !v.inherited ? (
              <input
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={commitEdit}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commitEdit();
                  if (e.key === "Escape") setEditingKey(null);
                }}
                autoFocus
                aria-label={`Edit value for ${v.key}`}
              />
            ) : (
              <span
                onClick={() => {
                  if (!readOnly && !v.inherited) startEdit(v);
                }}
                role={!readOnly && !v.inherited ? "button" : undefined}
                tabIndex={!readOnly && !v.inherited ? 0 : undefined}
                onKeyDown={(e) => {
                  if (
                    !readOnly &&
                    !v.inherited &&
                    (e.key === "Enter" || e.key === " ")
                  ) {
                    startEdit(v);
                  }
                }}
              >
                {isSecret && !isRevealed
                  ? "\u2022\u2022\u2022\u2022\u2022"
                  : v.value}
              </span>
            )}
          </span>
          {showTypes && v.type && (
            <span className="vf-env-vars__type-badge" data-type={v.type}>
              {v.type}
            </span>
          )}
          <span className="vf-env-vars__actions">
            {isSecret && (
              <button
                type="button"
                aria-label={isRevealed ? "Hide value" : "Reveal value"}
                onClick={() => toggleReveal(v.key)}
              >
                {isRevealed ? "\u25C9" : "\u25CB"}
              </button>
            )}
            {copyable && (
              <button
                type="button"
                aria-label={`Copy ${v.key}`}
                onClick={() => handleCopy(v.value)}
              >
                Copy
              </button>
            )}
            {!readOnly && !v.inherited && onRemove && (
              <button
                type="button"
                aria-label={`Remove ${v.key}`}
                onClick={() => onRemove(v.key)}
              >
                Remove
              </button>
            )}
          </span>
        </div>
      );
    };

    return (
      <div
        ref={ref}
        className={cx("vf-env-vars", `vf-env-vars--${size}`, className)}
        style={style}
        {...props}
      >
        {searchable && (
          <div className="vf-env-vars__header">
            <input
              type="text"
              className="vf-env-vars__search"
              placeholder="Search variables..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search variables"
            />
          </div>
        )}

        {Object.entries(grouped).map(([groupName, vars]) => (
          <div key={groupName} className="vf-env-vars__group">
            {groupName && groupBy !== "none" && (
              <div className="vf-env-vars__group-header">{groupName}</div>
            )}
            {vars.map(renderRow)}
          </div>
        ))}

        {!readOnly && addable && (
          <div className="vf-env-vars__add-row">
            <input
              type="text"
              placeholder="KEY"
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              aria-label="New variable key"
            />
            <input
              type="text"
              placeholder="Value"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              aria-label="New variable value"
            />
            <button type="button" onClick={handleAdd} aria-label="Add variable">
              Add
            </button>
          </div>
        )}
      </div>
    );
  }
);
EnvironmentVarsImpl.displayName = "EnvironmentVars";
/**
 * Editor for key/value environment variable pairs. Masks values by default;
 * supports import/export.
 */
export const EnvironmentVars = memo(EnvironmentVarsImpl);
(EnvironmentVars as unknown as { displayName: string }).displayName =
  "EnvironmentVars";
