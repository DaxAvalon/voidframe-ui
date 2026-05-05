"use client";

// Phase 7.1 form additions:
//   Switch, CheckboxGroup, SegmentedControl, PasswordInput, PinInput, TagInput

import {
  forwardRef,
  useRef,
  useState,
  type ChangeEvent,
  type ClipboardEvent,
  type CSSProperties,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { useControllableState } from "../hooks/useControllableState";
import { useId } from "../hooks/useId";
import { useMergedRefs } from "../hooks/useMergedRefs";
import { cx } from "../utils/cx";
import { warnOnce } from "../utils/warn";
import { buttonDisabledAttrs } from "../utils/buttonDisabledAttrs";
import { Checkbox } from "./FormExtended";
import { Toggle, type ToggleProps } from "./Form";
import { Label } from "./Text";

// ── Switch — semantic alias of Toggle ────────────────────────
// Exported separately so `<Switch>` reads naturally in code that models
// a boolean capability (vs. a generic toggle of visibility).

export type SwitchProps = ToggleProps;
/**
 * Two-state switch control. Re-export of `Toggle`; controllable via
 * `checked` / `onValueChange`; keyboard Space / Enter toggles.
 */
export const Switch = forwardRef<HTMLDivElement, SwitchProps>(function Switch(
  props,
  ref
) {
  return <Toggle ref={ref} {...props} />;
});
Switch.displayName = "Switch";

// ── CheckboxGroup — parity with RadioGroup ────────────────────

export interface CheckboxGroupOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface CheckboxGroupProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  options: CheckboxGroupOption[];
  /** Controlled selected values. */
  value?: string[];
  /** Uncontrolled initial values. */
  defaultValue?: string[];
  onValueChange?: (values: string[]) => void;
  label?: string;
  accent?: string;
  direction?: "horizontal" | "vertical";
  style?: CSSProperties;
}

/**
 * Group of related checkboxes sharing a label. Emits an array of selected
 * values; keyboard navigation is standard.
 */
export const CheckboxGroup = forwardRef<HTMLDivElement, CheckboxGroupProps>(
  function CheckboxGroup(
    {
      options,
      value,
      defaultValue,
      onValueChange,
      label,
      accent,
      direction = "vertical",
      className,
      style,
      ...props
    },
    ref
  ) {
    const [current, setCurrent] = useControllableState<string[]>({
      value,
      defaultValue: defaultValue ?? [],
      onChange: onValueChange,
      componentName: "CheckboxGroup",
    });
    const labelId = useId();

    const toggle = (val: string) => {
      const next = current.includes(val)
        ? current.filter((v) => v !== val)
        : [...current, val];
      setCurrent(next);
    };

    return (
      <div
        ref={ref}
        className={cx("vf-field", className)}
        style={style}
        role="group"
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
            <Checkbox
              key={o.value}
              checked={current.includes(o.value)}
              onValueChange={() => toggle(o.value)}
              label={o.label}
              accent={accent}
              disabled={o.disabled}
            />
          ))}
        </div>
      </div>
    );
  }
);
CheckboxGroup.displayName = "CheckboxGroup";

// ── SegmentedControl — role=radiogroup, arrow-key nav ─────────

export interface SegmentedOption {
  value: string;
  label: string;
  icon?: ReactNode;
  disabled?: boolean;
}

export interface SegmentedControlProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  options: SegmentedOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Accent color (sets `--vf-accent`). */
  accent?: string;
  size?: "sm" | "md" | "lg";
  style?: CSSProperties;
}

/**
 * Pill group of mutually-exclusive options (like iOS segmented control).
 * Controllable via `value` / `onValueChange`.
 */
export const SegmentedControl = forwardRef<HTMLDivElement, SegmentedControlProps>(
  function SegmentedControl(
    { options, value, defaultValue, onValueChange, accent, size = "md", className, style, ...props },
    ref
  ) {
    const [current, setCurrent] = useControllableState<string>({
      value,
      defaultValue: defaultValue ?? options[0]?.value ?? "",
      onChange: onValueChange,
      componentName: "SegmentedControl",
    });

    const handleKey = (e: KeyboardEvent<HTMLDivElement>) => {
      const activeIdx = options.findIndex((o) => o.value === current);
      if (activeIdx === -1) return;
      const move = (delta: number) => {
        // Skip disabled options.
        let next = activeIdx;
        for (let i = 0; i < options.length; i++) {
          next = (next + delta + options.length) % options.length;
          if (!options[next]?.disabled) break;
        }
        const nextVal = options[next]?.value;
        if (nextVal) setCurrent(nextVal);
      };
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        move(1);
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        move(-1);
      } else if (e.key === "Home") {
        e.preventDefault();
        const first = options.find((o) => !o.disabled);
        if (first) setCurrent(first.value);
      } else if (e.key === "End") {
        e.preventDefault();
        const last = [...options].reverse().find((o) => !o.disabled);
        if (last) setCurrent(last.value);
      }
    };

    const composedStyle: CSSProperties = accent
      ? ({ "--vf-accent": accent, ...style } as CSSProperties)
      : (style ?? {});

    return (
      <div
        ref={ref}
        className={cx("vf-segmented", `vf-segmented--${size}`, className)}
        style={composedStyle}
        role="radiogroup"
        onKeyDown={handleKey}
        {...props}
      >
        {options.map((o) => {
          const selected = current === o.value;
          return (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={o.label}
              tabIndex={selected ? 0 : -1}
              {...buttonDisabledAttrs(o.disabled)}
              className={cx("vf-segmented__item")}
              data-active={selected ? "true" : undefined}
              onClick={() => !o.disabled && setCurrent(o.value)}
            >
              {o.icon && (
                <span aria-hidden="true" className="vf-segmented__icon">
                  {o.icon}
                </span>
              )}
              {o.label}
            </button>
          );
        })}
      </div>
    );
  }
);
SegmentedControl.displayName = "SegmentedControl";

// ── PasswordInput — visibility toggle ────────────────────────

export interface PasswordInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "onChange" | "defaultValue" | "value" | "type"
  > {
  value?: string;
  defaultValue?: string;
  /** Raw event handler — kept for backward compatibility. Prefer `onValueChange`. */
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  /** Value-emit handler — matches the convention used by every other voidframe form component. */
  onValueChange?: (value: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  autoComplete?: string;
  name?: string;
  id?: string;
  /** Show/hide toggle button. Default true. */
  visibilityToggle?: boolean;
  /** Start with password revealed. */
  defaultVisible?: boolean;
  /** Show a strength meter bar below the input. */
  showStrength?: boolean;
  /**
   * Custom strength scoring function. Receives the current value and must
   * return a number from 0 (weakest) to 4 (strongest). When omitted a
   * built-in heuristic is used (+1 for length >= 8, +1 uppercase, +1
   * lowercase, +1 digit, +1 symbol, mapped from 0-5 to 0-4).
   */
  strengthFn?: (value: string) => number;
  style?: CSSProperties;
  /**
   * Attributes for the outer wrapper `<div>` (container that holds the
   * input plus the visibility toggle button). Rest-spread (`{...props}`)
   * lands on the inner native `<input>` so `data-testid`/`aria-*` forward
   * to the control as consumers expect.
   */
  wrapperProps?: HTMLAttributes<HTMLDivElement>;
}

/**
 * Password field with show/hide toggle and optional strength meter.
 */
export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  function PasswordInput(
    {
      value,
      defaultValue,
      onChange,
      onValueChange,
      placeholder,
      label,
      required,
      disabled,
      readOnly,
      autoComplete = "current-password",
      name,
      id,
      visibilityToggle = true,
      defaultVisible = false,
      showStrength,
      strengthFn,
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
      componentName: "PasswordInput",
    });
    const [visible, setVisible] = useState(defaultVisible);
    const inputId = useId(id);
    return (
      <div className="vf-field">
        {label && (
          <Label as="label" htmlFor={inputId}>
            {label}
          </Label>
        )}
        <div
          className={cx("vf-password-input", className)}
          style={style}
          {...wrapperProps}
        >
          <input
            ref={ref}
            id={inputId}
            type={visible ? "text" : "password"}
            value={current}
            onChange={(e) => {
              onChange?.(e);
              setCurrent(e.target.value);
            }}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            readOnly={readOnly}
            autoComplete={autoComplete}
            name={name}
            aria-label={label}
            className="vf-input vf-password-input__field"
            {...inputProps}
          />
          {visibilityToggle && (
            <button
              type="button"
              className="vf-password-input__toggle"
              aria-label={visible ? "Hide password" : "Show password"}
              aria-pressed={visible}
              onClick={() => setVisible((v) => !v)}
              disabled={disabled}
            >
              {visible ? "◉" : "○"}
            </button>
          )}
        </div>
        {showStrength && (() => {
          const level = strengthFn
            ? strengthFn(current)
            : defaultPasswordStrength(current);
          return (
            <div className="vf-password__strength">
              <div
                className="vf-password__strength-bar"
                data-level={level}
                style={{ width: `${(level / 4) * 100}%` }}
              />
              <span className="vf-password__strength-label">
                {(["Weak", "Fair", "Good", "Strong"] as const)[Math.min(level, 3)]}
              </span>
            </div>
          );
        })()}
      </div>
    );
  }
);
PasswordInput.displayName = "PasswordInput";

/**
 * Default password strength scorer. Awards one point each for length >= 8,
 * containing uppercase, lowercase, digit, and symbol characters. The raw
 * 0-5 score is mapped to 0-4 for display.
 */
function defaultPasswordStrength(value: string): number {
  let score = 0;
  if (value.length >= 8) score++;
  if (/[A-Z]/.test(value)) score++;
  if (/[a-z]/.test(value)) score++;
  if (/\d/.test(value)) score++;
  if (/[^A-Za-z0-9]/.test(value)) score++;
  // Map 0-5 → 0-4.
  return Math.min(4, Math.round((score / 5) * 4));
}

// ── PinInput — N-box OTP with auto-advance + paste split ─────

export interface PinInputProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  length?: number;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  onComplete?: (value: string) => void;
  /** "numeric" | "alphanumeric" | "alpha" — filters allowed input. */
  type?: "numeric" | "alphanumeric" | "alpha";
  mask?: boolean;
  autoFocus?: boolean;
  disabled?: boolean;
  label?: string;
  style?: CSSProperties;
}

const PIN_PATTERNS: Record<NonNullable<PinInputProps["type"]>, RegExp> = {
  numeric: /^[0-9]$/,
  alphanumeric: /^[a-zA-Z0-9]$/,
  alpha: /^[a-zA-Z]$/,
};

/**
 * Segmented OTP-style input for short numeric/alphanumeric codes.
 * Auto-advances focus.
 */
export const PinInput = forwardRef<HTMLDivElement, PinInputProps>(
  function PinInput(
    {
      length = 6,
      value,
      defaultValue = "",
      onValueChange,
      onComplete,
      type = "numeric",
      mask,
      autoFocus,
      disabled,
      label,
      className,
      style,
      ...props
    },
    ref
  ) {
    const [current, setCurrent] = useControllableState<string>({
      value,
      defaultValue,
      onChange: onValueChange,
      componentName: "PinInput",
    });
    const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
    const completeFiredFor = useRef<string | null>(null);
    const allowed = PIN_PATTERNS[type];

    // Pad/truncate current to length — never read past `length`.
    const chars = Array.from({ length }, (_, i) => current[i] ?? "");

    const update = (next: string) => {
      const trimmed = next.slice(0, length);
      setCurrent(trimmed);
      if (
        trimmed.length === length &&
        completeFiredFor.current !== trimmed
      ) {
        completeFiredFor.current = trimmed;
        onComplete?.(trimmed);
      }
      if (trimmed.length < length) {
        completeFiredFor.current = null;
      }
    };

    const handleChange = (i: number, raw: string) => {
      // Last-typed character wins (handles re-typing over a filled slot).
      const char = raw.slice(-1);
      if (char && !allowed.test(char)) return;
      const next = chars.slice();
      next[i] = char;
      update(next.join("").replace(/\s+$/, ""));
      if (char && i < length - 1) {
        inputsRef.current[i + 1]?.focus();
      }
    };

    const handleKeyDown = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Backspace") {
        if (!chars[i] && i > 0) {
          e.preventDefault();
          inputsRef.current[i - 1]?.focus();
          const next = chars.slice();
          next[i - 1] = "";
          update(next.join("").replace(/\s+$/, ""));
        }
      } else if (e.key === "ArrowLeft" && i > 0) {
        e.preventDefault();
        inputsRef.current[i - 1]?.focus();
      } else if (e.key === "ArrowRight" && i < length - 1) {
        e.preventDefault();
        inputsRef.current[i + 1]?.focus();
      }
    };

    const handlePaste = (i: number, e: ClipboardEvent<HTMLInputElement>) => {
      const pasted = e.clipboardData.getData("text") ?? "";
      const filtered = Array.from(pasted)
        .filter((ch) => allowed.test(ch))
        .slice(0, length - i)
        .join("");
      if (!filtered) return;
      e.preventDefault();
      const next = chars.slice();
      for (let j = 0; j < filtered.length; j++) {
        next[i + j] = filtered[j]!;
      }
      const joined = next.join("").replace(/\s+$/, "");
      update(joined);
      const focusTarget = Math.min(i + filtered.length, length - 1);
      inputsRef.current[focusTarget]?.focus();
    };

    return (
      <div className="vf-field">
        {label && <Label>{label}</Label>}
        <div
          ref={ref}
          role="group"
          aria-label={label ?? "PIN entry"}
          className={cx("vf-pin-input", className)}
          style={style}
          {...props}
        >
          {chars.map((char, i) => (
            <input
              key={i}
              ref={(el) => {
                inputsRef.current[i] = el;
              }}
              type={mask ? "password" : "text"}
              inputMode={type === "numeric" ? "numeric" : "text"}
              autoComplete={i === 0 ? "one-time-code" : "off"}
              maxLength={2}
              disabled={disabled}
              aria-label={`Digit ${i + 1} of ${length}`}
              className="vf-pin-input__slot"
              value={char}
              autoFocus={autoFocus && i === 0}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onPaste={(e) => handlePaste(i, e)}
              onFocus={(e) => e.currentTarget.select()}
            />
          ))}
        </div>
      </div>
    );
  }
);
PinInput.displayName = "PinInput";

// ── TagInput — chip multi-entry with keyboard nav ────────────

export interface TagInputProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (tags: string[]) => void;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  /** KeyboardEvent.key values that commit the typed text as a tag. */
  delimiters?: string[];
  /** Reject duplicate entries (case-insensitive). Default true. */
  dedupe?: boolean;
  /** Cap on how many tags may be present. */
  maxTags?: number;
  /** Return `true` to accept, `false` (or a string) to reject. Strings surface as dev warnings. */
  validate?: (tag: string) => boolean | string;
  style?: CSSProperties;
  /**
   * Props forwarded to the inner text `<input>` that drafts new tags. Use for
   * `data-testid`, `aria-*`, or other attributes consumers want on the
   * actual text entry field.
   */
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
}

/**
 * Text input that collects tags on Enter/comma. Emits the current array of
 * tags on change.
 */
export const TagInput = forwardRef<HTMLDivElement, TagInputProps>(
  function TagInput(
    {
      value,
      defaultValue = [],
      onValueChange,
      placeholder = "Type and press Enter…",
      label,
      disabled,
      delimiters = ["Enter", ","],
      dedupe = true,
      maxTags,
      validate,
      className,
      style,
      inputProps,
      ...props
    },
    ref
  ) {
    const [tags, setTags] = useControllableState<string[]>({
      value,
      defaultValue,
      onChange: onValueChange,
      componentName: "TagInput",
    });
    const [draft, setDraft] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const mergedRef = useMergedRefs(ref, containerRef);

    const commit = (raw: string) => {
      const tag = raw.trim();
      if (!tag) return;
      if (maxTags !== undefined && tags.length >= maxTags) return;
      if (dedupe && tags.some((t) => t.toLowerCase() === tag.toLowerCase())) return;
      if (validate) {
        const result = validate(tag);
        if (result === false || typeof result === "string") {
          if (typeof result === "string") {
            warnOnce(
              `TagInput:validate:${result}`,
              `<TagInput validate> rejected tag "${tag}": ${result}`
            );
          }
          return;
        }
      }
      setTags([...tags, tag]);
      setDraft("");
    };

    const remove = (i: number) => {
      setTags(tags.filter((_, idx) => idx !== i));
      inputRef.current?.focus();
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
      if (delimiters.includes(e.key)) {
        e.preventDefault();
        commit(draft);
      } else if (e.key === "Backspace" && !draft && tags.length > 0) {
        e.preventDefault();
        remove(tags.length - 1);
      }
    };

    const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
      const text = e.clipboardData.getData("text");
      if (!text) return;
      // Split on comma/newline/tab/semicolon — common multi-item paste sources.
      const parts = text
        .split(/[,\n\t;]/)
        .map((s) => s.trim())
        .filter(Boolean);
      if (parts.length <= 1) return; // single-item paste falls through to default.
      e.preventDefault();
      let next = tags.slice();
      for (const p of parts) {
        if (maxTags !== undefined && next.length >= maxTags) break;
        if (dedupe && next.some((t) => t.toLowerCase() === p.toLowerCase())) continue;
        if (validate) {
          const result = validate(p);
          if (result === false || typeof result === "string") {
            if (typeof result === "string") {
              warnOnce(
                `TagInput:validate:${result}`,
                `<TagInput validate> rejected tag "${p}": ${result}`
              );
            }
            continue;
          }
        }
        next.push(p);
      }
      setTags(next);
      setDraft("");
    };

    const focusInput = () => inputRef.current?.focus();

    return (
      <div className="vf-field">
        {label && <Label>{label}</Label>}
        <div
          ref={mergedRef}
          className={cx("vf-tag-input", className)}
          style={style}
          onClick={focusInput}
          data-disabled={disabled ? "true" : undefined}
          {...props}
        >
          {tags.map((tag, i) => (
            <span key={`${tag}-${i}`} className="vf-tag-input__chip">
              {tag}
              {!disabled && (
                <button
                  type="button"
                  className="vf-tag-input__remove"
                  aria-label={`Remove ${tag}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    remove(i);
                  }}
                >
                  ×
                </button>
              )}
            </span>
          ))}
          <input
            ref={inputRef}
            type="text"
            className="vf-tag-input__field"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder={tags.length === 0 ? placeholder : undefined}
            disabled={disabled}
            aria-label={label ?? "Tag entry"}
            {...inputProps}
          />
        </div>
      </div>
    );
  }
);
TagInput.displayName = "TagInput";
