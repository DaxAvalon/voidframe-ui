"use client";

import { forwardRef } from "react";
import type {
  ChangeEvent,
  CSSProperties,
  HTMLAttributes,
  InputHTMLAttributes,
  KeyboardEvent,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { useControllableState } from "../hooks/useControllableState";
import { useId } from "../hooks/useId";
import { cx } from "../utils/cx";
import { warn, warnOnce } from "../utils/warn";
import { Label } from "./Text";

/**
 * True when at least one of the accessible-name inputs is present.
 * Expected: `label` prop, `aria-label`, or `aria-labelledby`.
 */
function hasAccessibleName(
  label: string | undefined,
  rest: Record<string, unknown>
): boolean {
  return Boolean(
    label ||
      (typeof rest["aria-label"] === "string" && rest["aria-label"]) ||
      rest["aria-labelledby"]
  );
}

type InputBaseProps = Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "type">;

export interface InputProps extends InputBaseProps {
  value?: string | number | readonly string[];
  /** Raw event handler — kept for backward compatibility. Prefer `onValueChange`. */
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  /** Value-emit handler — matches the convention used by every other voidframe form component. */
  onValueChange?: (value: string) => void;
  placeholder?: string;
  label?: string;
  type?: string;
  width?: string | number;
  style?: CSSProperties;
}

/**
 * A single-line text field with optional label and standard HTML input types.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { value, onChange, onValueChange, placeholder, label, type = "text", width, className, style, id, ...props },
  ref
) {
  warn(
    hasAccessibleName(label, props as Record<string, unknown>),
    "<Input> requires `label`, `aria-label`, or `aria-labelledby` for screen readers."
  );
  const inputId = useId(id);
  const inline: CSSProperties = width !== undefined ? { width, ...style } : (style ?? {});
  return (
    <div className="vf-field">
      {label && (
        <Label as="label" htmlFor={inputId}>
          {label}
        </Label>
      )}
      <input
        ref={ref}
        id={inputId}
        type={type}
        value={value}
        onChange={(e) => {
          onChange?.(e);
          onValueChange?.(e.target.value);
        }}
        placeholder={placeholder}
        className={cx("vf-input", className)}
        style={inline}
        {...props}
      />
    </div>
  );
});
Input.displayName = "Input";

type TextareaBaseProps = Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  "value" | "onChange"
>;

export interface TextareaProps extends TextareaBaseProps {
  value?: string | number | readonly string[];
  /** Raw event handler — kept for backward compatibility. Prefer `onValueChange`. */
  onChange?: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  /** Value-emit handler — matches the convention used by every other voidframe form component. */
  onValueChange?: (value: string) => void;
  label?: string;
  rows?: number;
  style?: CSSProperties;
}

/**
 * A multi-line text field for longer free-form input, with configurable rows and optional label.
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea(
    { value, onChange, onValueChange, placeholder, label, rows = 3, className, style, id, ...props },
    ref
  ) {
    warn(
      hasAccessibleName(label, props as Record<string, unknown>),
      "<Textarea> requires `label`, `aria-label`, or `aria-labelledby` for screen readers."
    );
    const textareaId = useId(id);
    return (
      <div className="vf-field">
        {label && (
          <Label as="label" htmlFor={textareaId}>
            {label}
          </Label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          value={value}
          onChange={(e) => {
            onChange?.(e);
            onValueChange?.(e.target.value);
          }}
          placeholder={placeholder}
          rows={rows}
          className={cx("vf-textarea", className)}
          style={style}
          {...props}
        />
      </div>
    );
  }
);
Textarea.displayName = "Textarea";

export interface ToggleProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
  /** Active color (sets `--vf-accent`). */
  accent?: string;
  readOnly?: boolean;
  style?: CSSProperties;
}

/**
 * Binary on/off switch with WAI-ARIA `role="switch"` and
 * controlled/uncontrolled duality. Pass `checked` + `onChange(next)` or
 * `defaultChecked`. Space and Enter toggle; `readOnly` suppresses
 * changes. Requires `label`, `aria-label`, or `aria-labelledby`.
 */
export const Toggle = forwardRef<HTMLDivElement, ToggleProps>(function Toggle(
  { checked, defaultChecked, onChange, label, accent, readOnly, className, style, ...props },
  ref
) {
  warn(
    hasAccessibleName(label, props as Record<string, unknown>),
    "<Toggle> requires `label`, `aria-label`, or `aria-labelledby` for screen readers."
  );
  const [value, setValue] = useControllableState<boolean>({
    value: checked,
    defaultValue: defaultChecked ?? false,
    onChange,
    componentName: "Toggle",
  });
  const toggle = () => { if (!readOnly) setValue(!value); };
  const handleKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      toggle();
    }
  };
  const composedStyle: CSSProperties = accent
    ? ({ "--vf-accent": accent, ...style } as CSSProperties)
    : (style ?? {});
  return (
    <div
      ref={ref}
      className={cx("vf-toggle", className)}
      style={composedStyle}
      onClick={toggle}
      role="switch"
      aria-checked={value}
      aria-readonly={readOnly || undefined}
      tabIndex={0}
      onKeyDown={handleKey}
      {...props}
    >
      <div className="vf-toggle__track">
        <div className="vf-toggle__thumb" />
      </div>
      {label && <Label>{label}</Label>}
    </div>
  );
});
Toggle.displayName = "Toggle";

export interface SelectOption {
  value: string;
  label: string;
}

type SelectBaseProps = Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  "value" | "onChange"
>;

export interface SelectProps extends SelectBaseProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  width?: string | number;
  style?: CSSProperties;
}

/**
 * A native dropdown for choosing one value from a fixed list of options.
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { options, value, onChange, label, width, className, style, id, ...props },
  ref
) {
  warn(
    hasAccessibleName(label, props as Record<string, unknown>),
    "<Select> requires `label`, `aria-label`, or `aria-labelledby` for screen readers."
  );
  if (options.length === 0) {
    warnOnce(
      "Select:empty-options",
      "Select: `options` is empty — the field will render an empty dropdown."
    );
  } else {
    const seenVals = new Set<string>();
    for (const o of options) {
      if (seenVals.has(o.value)) {
        warnOnce(
          `Select:duplicate:${o.value}`,
          `Select: duplicate option value "${o.value}" — each option must have a unique \`value\`.`
        );
      }
      seenVals.add(o.value);
    }
    if (value !== "" && !seenVals.has(value)) {
      warnOnce(
        `Select:unknown-value:${value}`,
        `Select: controlled \`value\` is "${value}" but no option has that value. The native select will display the first option until \`value\` matches an option.`
      );
    }
  }
  const selectId = useId(id);
  const inline: CSSProperties = width !== undefined ? { width, ...style } : (style ?? {});
  return (
    <div className="vf-field">
      {label && (
        <Label as="label" htmlFor={selectId}>
          {label}
        </Label>
      )}
      <select
        ref={ref}
        id={selectId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cx("vf-select", className)}
        style={inline}
        {...props}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
});
Select.displayName = "Select";
