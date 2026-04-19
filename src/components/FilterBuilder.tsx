"use client";

import { forwardRef, memo, useCallback } from "react";
import type { HTMLAttributes } from "react";
import { useControllableState } from "../hooks/useControllableState";
import { cx } from "../utils/cx";

export type FilterOperator =
  | "equals"
  | "not_equals"
  | "contains"
  | "not_contains"
  | "greater_than"
  | "less_than"
  | "between"
  | "is_empty"
  | "is_not_empty";

export interface FilterField {
  key: string;
  label: string;
  type: "string" | "number" | "date" | "boolean" | "enum";
  operators?: FilterOperator[];
  enumValues?: { value: string; label: string }[];
}

export interface FilterRule {
  id: string;
  field: string;
  operator: FilterOperator;
  value: unknown;
}

export interface FilterBuilderProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  fields: FilterField[];
  value?: FilterRule[];
  defaultValue?: FilterRule[];
  onValueChange?: (rules: FilterRule[]) => void;
  maxRules?: number;
  size?: "sm" | "md";
  disabled?: boolean;
  addLabel?: string;
  showClearAll?: boolean;
}

const DEFAULT_OPERATORS: Record<FilterField["type"], FilterOperator[]> = {
  string: ["equals", "not_equals", "contains", "not_contains", "is_empty", "is_not_empty"],
  number: ["equals", "not_equals", "greater_than", "less_than", "between", "is_empty", "is_not_empty"],
  date: ["equals", "not_equals", "greater_than", "less_than", "between", "is_empty", "is_not_empty"],
  boolean: ["equals", "not_equals"],
  enum: ["equals", "not_equals", "is_empty", "is_not_empty"],
};

const OPERATOR_LABELS: Record<FilterOperator, string> = {
  equals: "Equals",
  not_equals: "Not equals",
  contains: "Contains",
  not_contains: "Not contains",
  greater_than: "Greater than",
  less_than: "Less than",
  between: "Between",
  is_empty: "Is empty",
  is_not_empty: "Is not empty",
};

let ruleCounter = 0;
function generateId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `rule-${++ruleCounter}`;
}

const FilterBuilderImpl = forwardRef<HTMLDivElement, FilterBuilderProps>(
  function FilterBuilder(
    {
      fields,
      value,
      defaultValue,
      onValueChange,
      maxRules,
      size = "md",
      disabled = false,
      addLabel = "Add filter",
      showClearAll = true,
      className,
      style,
      ...props
    },
    ref
  ) {
    const [rules, setRules] = useControllableState<FilterRule[]>({
      value,
      defaultValue: defaultValue ?? [],
      onChange: onValueChange,
      componentName: "FilterBuilder",
    });

    const addRule = useCallback(() => {
      if (maxRules !== undefined && rules.length >= maxRules) return;
      const firstField = fields[0];
      if (!firstField) return;
      const ops = firstField.operators ?? DEFAULT_OPERATORS[firstField.type];
      setRules([
        ...rules,
        {
          id: generateId(),
          field: firstField.key,
          operator: ops[0] ?? "equals",
          value: "",
        },
      ]);
    }, [rules, setRules, fields, maxRules]);

    const removeRule = useCallback(
      (id: string) => {
        setRules(rules.filter((r) => r.id !== id));
      },
      [rules, setRules]
    );

    const updateRule = useCallback(
      (id: string, patch: Partial<FilterRule>) => {
        setRules(
          rules.map((r) => (r.id === id ? { ...r, ...patch } : r))
        );
      },
      [rules, setRules]
    );

    const clearAll = useCallback(() => {
      setRules([]);
    }, [setRules]);

    const getFieldDef = (key: string): FilterField | undefined =>
      fields.find((f) => f.key === key);

    const renderValueInput = (rule: FilterRule, fieldDef: FilterField) => {
      if (rule.operator === "is_empty" || rule.operator === "is_not_empty") {
        return null;
      }

      if (rule.operator === "between") {
        const inputType = fieldDef.type === "date" ? "date" : "number";
        const tuple = Array.isArray(rule.value) ? rule.value : ["", ""];
        const [lo, hi] = [tuple[0] ?? "", tuple[1] ?? ""];
        return (
          <span className="vf-filter-builder__value-range">
            <input
              type={inputType}
              className="vf-filter-builder__value-input"
              value={String(lo ?? "")}
              disabled={disabled}
              aria-label="Filter value lower bound"
              onChange={(e) =>
                updateRule(rule.id, { value: [e.target.value, hi] })
              }
            />
            <span aria-hidden="true" className="vf-filter-builder__range-sep">
              –
            </span>
            <input
              type={inputType}
              className="vf-filter-builder__value-input"
              value={String(hi ?? "")}
              disabled={disabled}
              aria-label="Filter value upper bound"
              onChange={(e) =>
                updateRule(rule.id, { value: [lo, e.target.value] })
              }
            />
          </span>
        );
      }

      if (fieldDef.type === "boolean") {
        return (
          <select
            className="vf-filter-builder__value-input"
            value={String(rule.value ?? "true")}
            disabled={disabled}
            aria-label="Filter value"
            onChange={(e) =>
              updateRule(rule.id, { value: e.target.value === "true" })
            }
          >
            <option value="true">True</option>
            <option value="false">False</option>
          </select>
        );
      }

      if (fieldDef.type === "enum" && fieldDef.enumValues) {
        return (
          <select
            className="vf-filter-builder__value-input"
            value={String(rule.value ?? "")}
            disabled={disabled}
            aria-label="Filter value"
            onChange={(e) => updateRule(rule.id, { value: e.target.value })}
          >
            <option value="">Select...</option>
            {fieldDef.enumValues.map((ev) => (
              <option key={ev.value} value={ev.value}>
                {ev.label}
              </option>
            ))}
          </select>
        );
      }

      const inputType =
        fieldDef.type === "number"
          ? "number"
          : fieldDef.type === "date"
            ? "date"
            : "text";

      return (
        <input
          type={inputType}
          className="vf-filter-builder__value-input"
          value={String(rule.value ?? "")}
          disabled={disabled}
          aria-label="Filter value"
          onChange={(e) => updateRule(rule.id, { value: e.target.value })}
        />
      );
    };

    return (
      <div
        ref={ref}
        className={cx(
          "vf-filter-builder",
          `vf-filter-builder--${size}`,
          className
        )}
        style={style}
        {...props}
      >
        <div className="vf-filter-builder__rules">
          {rules.map((rule) => {
            const fieldDef = getFieldDef(rule.field);
            const ops = fieldDef
              ? fieldDef.operators ?? DEFAULT_OPERATORS[fieldDef.type]
              : [];

            return (
              <div key={rule.id} className="vf-filter-builder__rule">
                <select
                  className="vf-filter-builder__field-select"
                  value={rule.field}
                  disabled={disabled}
                  aria-label="Filter field"
                  onChange={(e) => {
                    const newField = getFieldDef(e.target.value);
                    const newOps = newField
                      ? newField.operators ?? DEFAULT_OPERATORS[newField.type]
                      : [];
                    updateRule(rule.id, {
                      field: e.target.value,
                      operator: newOps[0] ?? "equals",
                      value: "",
                    });
                  }}
                >
                  {fields.map((f) => (
                    <option key={f.key} value={f.key}>
                      {f.label}
                    </option>
                  ))}
                </select>

                <select
                  className="vf-filter-builder__operator-select"
                  value={rule.operator}
                  disabled={disabled}
                  aria-label="Filter operator"
                  onChange={(e) => {
                    const nextOp = e.target.value as FilterOperator;
                    // Shape of `value` depends on operator: `between` needs a
                    // 2-tuple, `is_empty`/`is_not_empty` take no value, everything
                    // else is a scalar. Reset to a compatible shape when the
                    // operator changes so consumers don't see a stale mismatch.
                    const patch: Partial<FilterRule> = { operator: nextOp };
                    if (nextOp === "between") {
                      if (!Array.isArray(rule.value)) patch.value = ["", ""];
                    } else if (Array.isArray(rule.value)) {
                      patch.value = "";
                    }
                    updateRule(rule.id, patch);
                  }}
                >
                  {ops.map((op) => (
                    <option key={op} value={op}>
                      {OPERATOR_LABELS[op]}
                    </option>
                  ))}
                </select>

                {fieldDef && renderValueInput(rule, fieldDef)}

                <button
                  type="button"
                  className="vf-filter-builder__remove"
                  disabled={disabled}
                  aria-label="Remove filter"
                  onClick={() => removeRule(rule.id)}
                >
                  &times;
                </button>
              </div>
            );
          })}
        </div>

        <div className="vf-filter-builder__actions">
          <button
            type="button"
            className="vf-filter-builder__add"
            disabled={
              disabled || (maxRules !== undefined && rules.length >= maxRules)
            }
            onClick={addRule}
          >
            {addLabel}
          </button>
          {showClearAll && rules.length > 0 && (
            <button
              type="button"
              className="vf-filter-builder__clear"
              disabled={disabled}
              onClick={clearAll}
            >
              Clear all
            </button>
          )}
        </div>
      </div>
    );
  }
);
FilterBuilderImpl.displayName = "FilterBuilder";
export const FilterBuilder = memo(FilterBuilderImpl);
(FilterBuilder as unknown as { displayName: string }).displayName =
  "FilterBuilder";
