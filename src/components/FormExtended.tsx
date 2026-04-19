"use client";

import { forwardRef, useRef, useState } from "react";
import type {
  ChangeEvent,
  CSSProperties,
  DragEvent,
  HTMLAttributes,
  KeyboardEvent,
  ReactNode,
} from "react";
import { useControllableState } from "../hooks/useControllableState";
import { useId } from "../hooks/useId";
import { cx } from "../utils/cx";
import { warnOnce } from "../utils/warn";
import { Label } from "./Text";

// ── Checkbox ──────────────────────────────────────────────────

export interface CheckboxProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
  accent?: string;
  disabled?: boolean;
  style?: CSSProperties;
}

/**
 * WAI-ARIA checkbox with controlled/uncontrolled duality. Pass `checked` +
 * `onChange(next)` controlled, or `defaultChecked` uncontrolled. Custom
 * brutalist glyph; Space and Enter toggle. Optional `label` and `accent`.
 */
export const Checkbox = forwardRef<HTMLDivElement, CheckboxProps>(function Checkbox(
  { checked, defaultChecked, onChange, label, accent, disabled, className, style, ...props },
  ref
) {
  const [value, setValue] = useControllableState<boolean>({
    value: checked,
    defaultValue: defaultChecked ?? false,
    onChange,
    componentName: "Checkbox",
  });
  const handleKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!disabled && (e.key === " " || e.key === "Enter")) {
      e.preventDefault();
      setValue(!value);
    }
  };
  const composedStyle: CSSProperties = accent
    ? ({ "--vf-accent": accent, ...style } as CSSProperties)
    : (style ?? {});
  return (
    <div
      ref={ref}
      className={cx("vf-checkbox", className)}
      style={composedStyle}
      data-disabled={disabled ? "true" : undefined}
      onClick={() => !disabled && setValue(!value)}
      role="checkbox"
      aria-checked={value}
      tabIndex={0}
      onKeyDown={handleKey}
      {...props}
    >
      <div className="vf-checkbox__box">
        {value && <span className="vf-checkbox__check">✓</span>}
      </div>
      {label && <Label>{label}</Label>}
    </div>
  );
});
Checkbox.displayName = "Checkbox";

// ── Radio ─────────────────────────────────────────────────────

export interface RadioProps extends HTMLAttributes<HTMLDivElement> {
  checked: boolean;
  onChange: () => void;
  label?: string;
  accent?: string;
  disabled?: boolean;
  style?: CSSProperties;
}

export const Radio = forwardRef<HTMLDivElement, RadioProps>(function Radio(
  { checked, onChange, label, accent, disabled, className, style, ...props },
  ref
) {
  const handleKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!disabled && (e.key === " " || e.key === "Enter")) {
      e.preventDefault();
      onChange();
    }
  };
  const composedStyle: CSSProperties = accent
    ? ({ "--vf-accent": accent, ...style } as CSSProperties)
    : (style ?? {});
  return (
    <div
      ref={ref}
      className={cx("vf-radio", className)}
      style={composedStyle}
      data-disabled={disabled ? "true" : undefined}
      onClick={() => !disabled && onChange()}
      role="radio"
      aria-checked={checked}
      tabIndex={0}
      onKeyDown={handleKey}
      {...props}
    >
      <div className="vf-radio__box">{checked && <div className="vf-radio__pip" />}</div>
      {label && <Label>{label}</Label>}
    </div>
  );
});
Radio.displayName = "Radio";

// ── RadioGroup ────────────────────────────────────────────────

export interface RadioGroupOption {
  value: string;
  label: string;
}

export interface RadioGroupProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  options: RadioGroupOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  label?: string;
  accent?: string;
  direction?: "horizontal" | "vertical";
  style?: CSSProperties;
}

/**
 * WAI-ARIA radio group with controlled/uncontrolled duality. Accepts an
 * `options` array and `value` + `onChange(value)` or `defaultValue`.
 * Renders label + radios in a `horizontal` or `vertical` `direction`.
 */
export const RadioGroup = forwardRef<HTMLDivElement, RadioGroupProps>(
  function RadioGroup(
    { options, value, defaultValue, onChange, label, accent, direction = "vertical", className, style, ...props },
    ref
  ) {
    const [current, setCurrent] = useControllableState<string>({
      value,
      defaultValue: defaultValue ?? options[0]?.value ?? "",
      onChange,
      componentName: "RadioGroup",
    });
    const labelId = useId();
    if (options.length === 0) {
      warnOnce(
        "RadioGroup:empty-options",
        "RadioGroup: `options` is empty — the group will render nothing. Supply at least one option."
      );
    } else {
      const seen = new Set<string>();
      for (const o of options) {
        if (seen.has(o.value)) {
          warnOnce(
            `RadioGroup:duplicate:${o.value}`,
            `RadioGroup: duplicate option value "${o.value}" — each option must have a unique \`value\`.`
          );
        }
        seen.add(o.value);
      }
    }
    return (
      <div
        ref={ref}
        className={cx("vf-field", className)}
        style={style}
        role="radiogroup"
        aria-labelledby={label ? labelId : undefined}
        {...props}
      >
        {label && <Label id={labelId}>{label}</Label>}
        <div
          className={cx(
            "vf-radio-group__items",
            direction === "horizontal" && "vf-radio-group__items--horizontal"
          )}
        >
          {options.map((o) => (
            <Radio
              key={o.value}
              checked={current === o.value}
              onChange={() => setCurrent(o.value)}
              label={o.label}
              accent={accent}
            />
          ))}
        </div>
      </div>
    );
  }
);
RadioGroup.displayName = "RadioGroup";

// ── Slider ────────────────────────────────────────────────────

export interface SliderProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  accent?: string;
  showValue?: boolean;
  style?: CSSProperties;
}

export const Slider = forwardRef<HTMLDivElement, SliderProps>(function Slider(
  { value, onChange, min = 0, max = 100, step = 1, label, accent, showValue, className, style, ...props },
  ref
) {
  const pct = ((value - min) / (max - min)) * 100;
  const composedStyle: CSSProperties = accent
    ? ({ "--vf-accent": accent, ...style } as CSSProperties)
    : (style ?? {});
  return (
    <div ref={ref} className={cx("vf-slider", className)} style={composedStyle} {...props}>
      {(label || showValue) && (
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          {label && <Label>{label}</Label>}
          {showValue && <Label style={{ color: "var(--vf-accent, var(--vf-green))" }}>{value}</Label>}
        </div>
      )}
      <div className="vf-slider__track-wrap">
        <div className="vf-slider__rail">
          <div className="vf-slider__fill" style={{ width: `${pct}%` }} />
        </div>
        <input
          className="vf-slider__input"
          type="range"
          aria-label={label}
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
        />
        <div className="vf-slider__thumb" style={{ left: `calc(${pct}% - 6px)` }} />
      </div>
    </div>
  );
});
Slider.displayName = "Slider";

// ── NumberInput ───────────────────────────────────────────────

export interface NumberInputProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  width?: number | string;
  style?: CSSProperties;
}

export const NumberInput = forwardRef<HTMLDivElement, NumberInputProps>(
  function NumberInput(
    { value, onChange, min, max, step = 1, label, width, className, style, ...props },
    ref
  ) {
    const clamp = (v: number | string): number => {
      let n = Number(v);
      if (isNaN(n)) n = 0;
      if (min !== undefined) n = Math.max(min, n);
      if (max !== undefined) n = Math.min(max, n);
      return n;
    };
    return (
      <div
        ref={ref}
        className={cx("vf-number-input", className)}
        style={style}
        {...props}
      >
        {label && <Label>{label}</Label>}
        <div
          className="vf-number-input__row"
          style={{ width: width ?? 120 }}
        >
          <button
            type="button"
            aria-label="Decrement"
            className="vf-number-input__btn vf-number-input__btn--minus"
            onClick={() => onChange(clamp(value - step))}
          >
            −
          </button>
          <input
            className="vf-number-input__field"
            type="number"
            aria-label={label}
            value={value}
            onChange={(e) => onChange(clamp(e.target.value))}
          />
          <button
            type="button"
            aria-label="Increment"
            className="vf-number-input__btn vf-number-input__btn--plus"
            onClick={() => onChange(clamp(value + step))}
          >
            +
          </button>
        </div>
      </div>
    );
  }
);
NumberInput.displayName = "NumberInput";

// ── SearchInput ───────────────────────────────────────────────

export interface SearchInputProps {
  value: string;
  /** Raw event handler — kept for backward compatibility. Prefer `onValueChange`. */
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  /** Value-emit handler — matches the convention used by every other voidframe form component. */
  onValueChange?: (value: string) => void;
  placeholder?: string;
  onClear?: () => void;
  readOnly?: boolean;
  width?: string | number;
  className?: string;
  style?: CSSProperties;
}

export const SearchInput = forwardRef<HTMLDivElement, SearchInputProps>(
  function SearchInput(
    { value, onChange, onValueChange, placeholder = "Search...", onClear, readOnly, width, className, style },
    ref
  ) {
    const handleClear = () => {
      if (onClear) onClear();
      else {
        onChange?.({ target: { value: "" } } as ChangeEvent<HTMLInputElement>);
        onValueChange?.("");
      }
    };
    const inline: CSSProperties = width !== undefined ? { width, ...style } : (style ?? {});
    return (
      <div ref={ref} className={cx("vf-search-input", className)} style={inline}>
        <span className="vf-search-input__icon">⌕</span>
        <input
          className="vf-search-input__field"
          type="text"
          value={value}
          readOnly={readOnly}
          onChange={(e) => {
            onChange?.(e);
            onValueChange?.(e.target.value);
          }}
          placeholder={placeholder}
        />
        {value && (
          <button
            type="button"
            className="vf-search-input__clear"
            onClick={handleClear}
          >
            ×
          </button>
        )}
      </div>
    );
  }
);
SearchInput.displayName = "SearchInput";

// ── FormField ─────────────────────────────────────────────────

export interface FormFieldProps extends HTMLAttributes<HTMLDivElement> {
  label?: string;
  error?: string;
  help?: string;
  required?: boolean;
  children?: ReactNode;
  style?: CSSProperties;
}

/**
 * Wrapper for form controls that renders an optional `label`, `required`
 * asterisk, and either an `error` message or `help` text below the input.
 * Warns in dev when `required` is set without a label or when both `error`
 * and `help` are provided.
 */
export const FormField = forwardRef<HTMLDivElement, FormFieldProps>(
  function FormField({ label, error, help, required, children, className, style, ...props }, ref) {
    if (required && !label) {
      warnOnce(
        "FormField:required-without-label",
        "FormField: `required` is set but `label` is missing — the asterisk will not render. Provide a `label` or drop `required`."
      );
    }
    if (error && help) {
      warnOnce(
        "FormField:error-with-help",
        "FormField: both `error` and `help` provided — only `error` renders. Consider combining them if the help text is relevant during errors."
      );
    }
    return (
      <div ref={ref} className={cx("vf-field", className)} style={style} {...props}>
        {label && (
          <Label>
            {label}
            {required && <span className="vf-form-field__required">*</span>}
          </Label>
        )}
        {children}
        {error && <span className="vf-form-field__error">{error}</span>}
        {!error && help && <span className="vf-form-field__help">{help}</span>}
      </div>
    );
  }
);
FormField.displayName = "FormField";

// ── DropZone ──────────────────────────────────────────────────

export interface DropZoneProps extends HTMLAttributes<HTMLDivElement> {
  onFiles?: (files: File[]) => void;
  accept?: string;
  label?: string;
  style?: CSSProperties;
}

export const DropZone = forwardRef<HTMLDivElement, DropZoneProps>(function DropZone(
  { onFiles, accept, label, className, style, ...props },
  ref
) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    onFiles?.(Array.from(e.dataTransfer.files));
  };
  const labelText = label ?? "DROP FILES HERE OR CLICK TO BROWSE";
  const activate = () => inputRef.current?.click();
  const handleKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      activate();
    }
  };
  return (
    <div
      ref={ref}
      className={cx("vf-drop-zone", className)}
      style={style}
      role="button"
      tabIndex={0}
      aria-label={labelText}
      data-drag-over={dragOver ? "true" : undefined}
      onClick={activate}
      onKeyDown={handleKey}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      {...props}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple
        className="vf-visually-hidden"
        onChange={(e) => {
          const files = e.target.files;
          if (files) onFiles?.(Array.from(files));
        }}
      />
      <Label>{labelText}</Label>
    </div>
  );
});
DropZone.displayName = "DropZone";
