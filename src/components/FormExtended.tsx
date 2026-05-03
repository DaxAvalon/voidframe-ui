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
  onValueChange?: (checked: boolean) => void;
  label?: string;
  accent?: string;
  disabled?: boolean;
  style?: CSSProperties;
}

/**
 * WAI-ARIA checkbox with controlled/uncontrolled duality. Pass `checked` +
 * `onValueChange(next)` controlled, or `defaultChecked` uncontrolled. Custom
 * brutalist glyph; Space and Enter toggle. Optional `label` and `accent`.
 */
export const Checkbox = forwardRef<HTMLDivElement, CheckboxProps>(function Checkbox(
  { checked, defaultChecked, onValueChange, label, accent, disabled, className, style, ...props },
  ref
) {
  const [value, setValue] = useControllableState<boolean>({
    value: checked,
    defaultValue: defaultChecked ?? false,
    onChange: onValueChange,
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
      aria-disabled={disabled || undefined}
      onClick={() => !disabled && setValue(!value)}
      role="checkbox"
      aria-checked={value}
      tabIndex={disabled ? -1 : 0}
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

export interface RadioProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** Controlled checked state. When provided, `defaultChecked` is ignored. */
  checked?: boolean;
  /** Uncontrolled initial checked state. Defaults to `false`. */
  defaultChecked?: boolean;
  /** Fires whenever the checked state changes (controlled or uncontrolled). */
  onValueChange?: (checked: boolean) => void;
  label?: string;
  accent?: string;
  disabled?: boolean;
  style?: CSSProperties;
}

/**
 * Single radio input with label. Supports both controlled (`checked` +
 * `onValueChange`) and uncontrolled (`defaultChecked`) usage. For groups
 * use `RadioGroup`.
 */
export const Radio = forwardRef<HTMLDivElement, RadioProps>(function Radio(
  {
    checked,
    defaultChecked,
    onValueChange,
    label,
    accent,
    disabled,
    className,
    style,
    ...props
  },
  ref
) {
  const [value, setValue] = useControllableState<boolean>({
    value: checked,
    defaultValue: defaultChecked ?? false,
    onChange: onValueChange,
    componentName: "Radio",
  });
  const toggle = () => {
    if (disabled) return;
    setValue(!value);
  };
  const handleKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!disabled && (e.key === " " || e.key === "Enter")) {
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
      className={cx("vf-radio", className)}
      style={composedStyle}
      data-disabled={disabled ? "true" : undefined}
      aria-disabled={disabled || undefined}
      onClick={toggle}
      role="radio"
      aria-checked={value}
      tabIndex={disabled ? -1 : 0}
      onKeyDown={handleKey}
      {...props}
    >
      <div className="vf-radio__box">{value && <div className="vf-radio__pip" />}</div>
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
  onValueChange?: (value: string) => void;
  label?: string;
  accent?: string;
  direction?: "horizontal" | "vertical";
  style?: CSSProperties;
}

/**
 * WAI-ARIA radio group with controlled/uncontrolled duality. Accepts an
 * `options` array and `value` + `onValueChange(value)` or `defaultValue`.
 * Renders label + radios in a `horizontal` or `vertical` `direction`.
 */
export const RadioGroup = forwardRef<HTMLDivElement, RadioGroupProps>(
  function RadioGroup(
    { options, value, defaultValue, onValueChange, label, accent, direction = "vertical", className, style, ...props },
    ref
  ) {
    const [current, setCurrent] = useControllableState<string>({
      value,
      defaultValue: defaultValue ?? options[0]?.value ?? "",
      onChange: onValueChange,
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
              onValueChange={() => setCurrent(o.value)}
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

export interface SliderProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "defaultValue" | "value"> {
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  accent?: string;
  showValue?: boolean;
  style?: CSSProperties;
  /**
   * Attributes for the outer wrapper `<div>`. Use for container-level
   * `data-*` hooks. Rest-spread (`{...props}`) lands on the inner native
   * `<input type="range">` so `data-testid`/`aria-*` forward to the control.
   */
  wrapperProps?: HTMLAttributes<HTMLDivElement>;
}

/**
 * Range slider for numeric values. Controllable via `value` /
 * `onValueChange`; supports one or two thumbs.
 *
 * Accessibility / test ergonomics: rest-spread props (including `data-testid`
 * and `aria-*`) are forwarded to the inner native `<input type="range">` so
 * `getByTestId(id)` returns the actual control and `.value` reads work. Use
 * `wrapperProps` for attributes that genuinely belong on the outer div.
 */
export const Slider = forwardRef<HTMLInputElement, SliderProps>(function Slider(
  { value, defaultValue, onValueChange, min = 0, max = 100, step = 1, label, accent, showValue, className, style, wrapperProps, ...inputProps },
  ref
) {
  const [current, setCurrent] = useControllableState<number>({
    value,
    defaultValue: defaultValue ?? min,
    onChange: onValueChange,
    componentName: "Slider",
  });
  const pct = ((current - min) / (max - min)) * 100;
  const composedStyle: CSSProperties = accent
    ? ({ "--vf-accent": accent, ...style } as CSSProperties)
    : (style ?? {});
  return (
    <div className={cx("vf-slider", className)} style={composedStyle} {...wrapperProps}>
      {(label || showValue) && (
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          {label && <Label>{label}</Label>}
          {showValue && <Label style={{ color: "var(--vf-accent, var(--vf-green))" }}>{current}</Label>}
        </div>
      )}
      <div className="vf-slider__track-wrap">
        <div className="vf-slider__rail">
          <div className="vf-slider__fill" style={{ width: `${pct}%` }} />
        </div>
        <input
          ref={ref}
          className="vf-slider__input"
          type="range"
          aria-label={label}
          min={min}
          max={max}
          step={step}
          value={current}
          onChange={(e) => setCurrent(Number(e.target.value))}
          {...inputProps}
        />
        <div className="vf-slider__thumb" style={{ left: `calc(${pct}% - 6px)` }} />
      </div>
    </div>
  );
});
Slider.displayName = "Slider";

// ── NumberInput ───────────────────────────────────────────────

/**
 * `NumberInput.value` union. Previously `number | undefined` — forms commonly
 * need a representable "empty, user hasn't entered anything yet" state
 * distinct from `0`. Empty string and `null` now flow through cleanly.
 */
export type NumberInputValue = number | "" | null;

export interface NumberInputProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  value?: NumberInputValue;
  defaultValue?: NumberInputValue;
  onValueChange?: (value: NumberInputValue) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  width?: number | string;
  style?: CSSProperties;
  /**
   * Voidframe-native size variant. Mirrors Input/Textarea/Select so forms
   * read consistently at any density. Applied to the inner `<input>` via the
   * `.vf-input--{size}` class pattern.
   */
  size?: "sm" | "md" | "lg";
  /**
   * When true, the uncontrolled default is `""` (empty) instead of `min ?? 0`.
   * Use for forms where "no entry yet" should remain distinguishable from
   * `0` until the user types.
   */
  defaultBlank?: boolean;
  /**
   * Props to apply to the outer wrapper `<div>`. Use this when a consumer
   * needs to attach a `data-*` attribute or ref to the container rather
   * than the inner numeric `<input>`. Rest-spread (`{...props}`) lands on
   * the native `<input>` element so `data-testid`, `aria-*`, and any other
   * HTMLAttributes are forwarded to the control as consumers expect.
   */
  wrapperProps?: HTMLAttributes<HTMLDivElement>;
}

/**
 * Numeric text input with min/max/step, keyboard increment/decrement, and
 * locale parsing.
 *
 * Accessibility / test ergonomics: rest-spread props (including `data-testid`
 * and `aria-*`) are forwarded to the inner native `<input type="number">` so
 * `getByTestId(id)` returns the actual control and `.value` reads work. Use
 * `wrapperProps` for attributes that genuinely belong on the outer div.
 */
export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  function NumberInput(
    {
      value,
      defaultValue,
      onValueChange,
      min,
      max,
      step = 1,
      label,
      width,
      className,
      style,
      size = "md",
      defaultBlank,
      wrapperProps,
      ...inputProps
    },
    ref
  ) {
    const [current, setCurrent] = useControllableState<NumberInputValue>({
      value,
      defaultValue: defaultValue ?? (defaultBlank ? "" : (min ?? 0)),
      onChange: onValueChange,
      componentName: "NumberInput",
    });
    const clamp = (v: number | string): number => {
      let n = Number(v);
      if (isNaN(n)) n = 0;
      if (min !== undefined) n = Math.max(min, n);
      if (max !== undefined) n = Math.min(max, n);
      return n;
    };
    const isEmpty = current === "" || current === null;
    const numeric = isEmpty ? (min ?? 0) : (current as number);
    return (
      <div
        className={cx("vf-number-input", className)}
        style={style}
        {...wrapperProps}
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
            onClick={() => setCurrent(clamp(numeric - step))}
          >
            −
          </button>
          <input
            ref={ref}
            className={cx(
              "vf-number-input__field",
              "vf-input",
              `vf-input--${size}`
            )}
            data-size={size}
            type="number"
            aria-label={label}
            value={isEmpty ? "" : numeric}
            onChange={(e) => {
              // Empty field → emit "" so consumers can distinguish from 0.
              if (e.target.value === "") setCurrent("");
              else setCurrent(clamp(e.target.value));
            }}
            {...inputProps}
          />
          <button
            type="button"
            aria-label="Increment"
            className="vf-number-input__btn vf-number-input__btn--plus"
            onClick={() => setCurrent(clamp(numeric + step))}
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

export interface SearchInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value" | "defaultValue"> {
  value?: string;
  defaultValue?: string;
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
  /**
   * Attributes for the outer wrapper `<div>`. Rest-spread (`{...props}`)
   * lands on the inner native `<input>` so `data-testid`/`aria-*` forward
   * to the control as consumers expect.
   */
  wrapperProps?: HTMLAttributes<HTMLDivElement>;
}

/**
 * Input tuned for search: leading search icon, clear-on-escape, debounce via
 * `debounce` prop. Rest-spread props land on the inner native `<input>` so
 * `data-testid`/`aria-*` forward to the control.
 */
export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  function SearchInput(
    {
      value,
      defaultValue,
      onChange,
      onValueChange,
      placeholder = "Search...",
      onClear,
      readOnly,
      width,
      className,
      style,
      wrapperProps,
      ...inputProps
    },
    ref
  ) {
    const [current, setCurrent] = useControllableState<string>({
      value,
      defaultValue: defaultValue ?? "",
      onChange: onValueChange,
      componentName: "SearchInput",
    });
    const handleClear = () => {
      if (onClear) onClear();
      else {
        onChange?.({ target: { value: "" } } as ChangeEvent<HTMLInputElement>);
        setCurrent("");
      }
    };
    const inline: CSSProperties = width !== undefined ? { width, ...style } : (style ?? {});
    return (
      <div className={cx("vf-search-input", className)} style={inline} {...wrapperProps}>
        <span className="vf-search-input__icon">⌕</span>
        <input
          ref={ref}
          className="vf-search-input__field"
          type="text"
          value={current}
          readOnly={readOnly}
          onChange={(e) => {
            onChange?.(e);
            setCurrent(e.target.value);
          }}
          placeholder={placeholder}
          {...inputProps}
        />
        {current && (
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

/**
 * File drop target with visual affordance and keyboard fallback (click to
 * open file picker). Emits `onFiles(files)`.
 */
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
