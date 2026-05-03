"use client";

import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
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
import { toneAttrs } from "../utils/toneAttrs";
import { warn, warnOnce } from "../utils/warn";
import { hasAccessibleGridAncestor } from "../utils/hasAccessibleGridAncestor";
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

type InputBaseProps = Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "type" | "size">;

export type InputSize = "sm" | "md" | "lg";

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
  /**
   * Voidframe-native size variant. The native `size` attribute (visible-
   * character count) is exposed as `lengthSize` so both axes are
   * independently controllable.
   */
  size?: InputSize;
  /** Native `HTMLInputElement.size` — visible character count. */
  lengthSize?: number;
  /**
   * Accessible-name escape hatch. When set, emits as `aria-label` and
   * suppresses the missing-name warning. Use for inline controls inside
   * data-dense UIs where a visible label would be redundant.
   */
  asAriaLabel?: string;
  /** Internal escape hatch for voidframe-composed parents. */
  suppressA11yWarning?: boolean;
}

/**
 * A single-line text field with optional label and standard HTML input types.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    value,
    onChange,
    onValueChange,
    placeholder,
    label,
    type = "text",
    width,
    className,
    style,
    id,
    size = "md",
    lengthSize,
    asAriaLabel,
    suppressA11yWarning,
    ...props
  },
  ref
) {
  const gridRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    if (suppressA11yWarning || asAriaLabel) return;
    if (hasAccessibleName(label, props as Record<string, unknown>)) return;
    if (hasAccessibleGridAncestor(gridRef.current)) return;
    warnOnce(
      `Input:missing-label:${id ?? "anon"}`,
      "<Input> requires `label`, `aria-label`, or `aria-labelledby` for screen readers. " +
        "Wrap the control in `<Field>`, use `<VisuallyHidden>`, or pass `asAriaLabel=\"…\"` for deliberately-unlabeled inline inputs inside a grid."
    );
  }, [label, props, id, asAriaLabel, suppressA11yWarning]);
  const inputId = useId(id);
  const inline: CSSProperties = width !== undefined ? { width, ...style } : (style ?? {});
  const ta = toneAttrs("vf-input", { size });
  return (
    <div className="vf-field">
      {label && (
        <Label as="label" htmlFor={inputId}>
          {label}
        </Label>
      )}
      <input
        ref={(el) => {
          gridRef.current = el;
          if (typeof ref === "function") ref(el);
          else if (ref) (ref as React.MutableRefObject<HTMLInputElement | null>).current = el;
        }}
        id={inputId}
        type={type}
        value={value}
        onChange={(e) => {
          onChange?.(e);
          onValueChange?.(e.target.value);
        }}
        placeholder={placeholder}
        className={cx(ta.className, className)}
        style={inline}
        size={lengthSize}
        aria-label={asAriaLabel ?? (props as Record<string, unknown>)["aria-label"] as string | undefined}
        {...ta.attrs}
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
  /** Voidframe-native size variant. Mirrors Input.size. */
  size?: InputSize;
  /** Accessible-name escape hatch. */
  asAriaLabel?: string;
  /** Internal escape hatch for voidframe-composed parents. */
  suppressA11yWarning?: boolean;
  style?: CSSProperties;
}

/**
 * A multi-line text field for longer free-form input, with configurable rows and optional label.
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea(
    {
      value,
      onChange,
      onValueChange,
      placeholder,
      label,
      rows = 3,
      size = "md",
      asAriaLabel,
      suppressA11yWarning,
      className,
      style,
      id,
      ...props
    },
    ref
  ) {
    const gridRef = useRef<HTMLTextAreaElement | null>(null);
    useEffect(() => {
      if (suppressA11yWarning || asAriaLabel) return;
      if (hasAccessibleName(label, props as Record<string, unknown>)) return;
      if (hasAccessibleGridAncestor(gridRef.current)) return;
      warnOnce(
        `Textarea:missing-label:${id ?? "anon"}`,
        "<Textarea> requires `label`, `aria-label`, or `aria-labelledby` for screen readers. " +
          "Wrap the control in `<Field>`, use `<VisuallyHidden>`, or pass `asAriaLabel=\"…\"` for deliberately-unlabeled inline textareas."
      );
    }, [label, props, id, asAriaLabel, suppressA11yWarning]);
    const textareaId = useId(id);
    const ta = toneAttrs("vf-textarea", { size });
    return (
      <div className="vf-field">
        {label && (
          <Label as="label" htmlFor={textareaId}>
            {label}
          </Label>
        )}
        <textarea
          ref={(el) => {
            gridRef.current = el;
            if (typeof ref === "function") ref(el);
            else if (ref) (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current = el;
          }}
          id={textareaId}
          value={value}
          onChange={(e) => {
            onChange?.(e);
            onValueChange?.(e.target.value);
          }}
          placeholder={placeholder}
          rows={rows}
          className={cx(ta.className, className)}
          style={style}
          aria-label={asAriaLabel ?? (props as Record<string, unknown>)["aria-label"] as string | undefined}
          {...ta.attrs}
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
  onValueChange?: (checked: boolean) => void;
  label?: string;
  /** Active color (sets `--vf-accent`). */
  accent?: string;
  readOnly?: boolean;
  /** Accessible-name escape hatch — mirrors Input/Textarea. */
  asAriaLabel?: string;
  /** Internal escape hatch for voidframe-composed parents. */
  suppressA11yWarning?: boolean;
  style?: CSSProperties;
}

/**
 * Binary on/off switch with WAI-ARIA `role="switch"` and
 * controlled/uncontrolled duality. Pass `checked` + `onValueChange(next)` or
 * `defaultChecked`. Space and Enter toggle; `readOnly` suppresses
 * changes. Requires `label`, `aria-label`, or `aria-labelledby`.
 */
export const Toggle = forwardRef<HTMLDivElement, ToggleProps>(function Toggle(
  {
    checked,
    defaultChecked,
    onValueChange,
    label,
    accent,
    readOnly,
    asAriaLabel,
    suppressA11yWarning,
    className,
    style,
    ...props
  },
  ref
) {
  const gridRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (suppressA11yWarning || asAriaLabel) return;
    if (hasAccessibleName(label, props as Record<string, unknown>)) return;
    if (hasAccessibleGridAncestor(gridRef.current)) return;
    warnOnce(
      `Toggle:missing-label`,
      "<Toggle> requires `label`, `aria-label`, or `aria-labelledby` for screen readers."
    );
  }, [label, props, asAriaLabel, suppressA11yWarning]);
  const [value, setValue] = useControllableState<boolean>({
    value: checked,
    defaultValue: defaultChecked ?? false,
    onChange: onValueChange,
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
      ref={(el) => {
        gridRef.current = el;
        if (typeof ref === "function") ref(el);
        else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = el;
      }}
      className={cx("vf-toggle", className)}
      style={composedStyle}
      onClick={toggle}
      role="switch"
      aria-checked={value}
      aria-readonly={readOnly || undefined}
      aria-label={asAriaLabel ?? (props as Record<string, unknown>)["aria-label"] as string | undefined}
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
  "value" | "onChange" | "size"
>;

export type SelectSize = "sm" | "md" | "lg";

export interface SelectProps extends SelectBaseProps {
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  label?: string;
  width?: string | number;
  style?: CSSProperties;
  /**
   * Visual size variant. Voidframe-native — the native HTMLSelectElement
   * `size` attribute (row count for open listbox) is exposed as `listSize`
   * below so both axes are controllable without type collision.
   */
  size?: SelectSize;
  /**
   * Native `HTMLSelectElement.size` (number of rows when displayed as a list
   * box). Renamed from `size` to free that prop for the voidframe variant.
   */
  listSize?: number;
  /**
   * Accessible-name escape hatch for deliberately-unlabeled selects in
   * data-dense matrix UIs (e.g. tier-routing grids). When set, the value is
   * emitted as `aria-label` and the "requires label/aria-label/aria-labelledby"
   * warning is suppressed. Matches the `TooltipV2.asAriaLabel` pattern.
   */
  asAriaLabel?: string;
  /**
   * Internal escape hatch for voidframe components that know they render
   * Selects inside a structurally-labeled grid/row/gridcell. Prefer
   * `asAriaLabel` in consumer code.
   */
  suppressA11yWarning?: boolean;
}

/**
 * A native dropdown for choosing one value from a fixed list of options.
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  {
    options,
    value,
    defaultValue,
    onValueChange,
    label,
    width,
    className,
    style,
    id,
    size = "md",
    listSize,
    asAriaLabel,
    suppressA11yWarning,
    ...props
  },
  ref
) {
  const [current, setCurrent] = useControllableState<string>({
    value,
    defaultValue: defaultValue ?? options[0]?.value ?? "",
    onChange: onValueChange,
    componentName: "Select",
  });
  // Post-mount a11y-warn check: if the Select has no accessible name AND it
  // isn't inside a role="grid"/row/gridcell context, warn. Grid ancestors are
  // the common deliberate-unlabeled case (matrix cells, data-dense toolbars).
  const gridCheckRef = useRef<HTMLSelectElement | null>(null);
  useEffect(() => {
    if (suppressA11yWarning) return;
    if (asAriaLabel) return;
    const effectiveProps = props as Record<string, unknown>;
    if (hasAccessibleName(label, effectiveProps)) return;
    if (hasAccessibleGridAncestor(gridCheckRef.current)) return;
    warnOnce(
      `Select:missing-label:${id ?? "anon"}`,
      "<Select> requires `label`, `aria-label`, or `aria-labelledby` for screen readers. " +
        "Wrap the control in `<Field>`, use `<VisuallyHidden>`, or pass `asAriaLabel=\"…\"` for deliberately-unlabeled inline selects inside a grid."
    );
  }, [label, props, id, asAriaLabel, suppressA11yWarning]);
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
    if (current !== "" && !seenVals.has(current)) {
      warnOnce(
        `Select:unknown-value:${current}`,
        `Select: \`value\` is "${current}" but no option has that value. The native select will display the first option until \`value\` matches an option.`
      );
    }
  }
  const selectId = useId(id);
  const selectTa = toneAttrs("vf-select", { size });
  const inline: CSSProperties = width !== undefined ? { width, ...style } : (style ?? {});
  return (
    <div className="vf-field">
      {label && (
        <Label as="label" htmlFor={selectId}>
          {label}
        </Label>
      )}
      <select
        ref={(el) => {
          gridCheckRef.current = el;
          if (typeof ref === "function") ref(el);
          else if (ref) (ref as React.MutableRefObject<HTMLSelectElement | null>).current = el;
        }}
        id={selectId}
        value={current}
        onChange={(e) => setCurrent(e.target.value)}
        className={cx(selectTa.className, className)}
        style={inline}
        size={listSize}
        aria-label={asAriaLabel ?? (props as Record<string, unknown>)["aria-label"] as string | undefined}
        {...selectTa.attrs}
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
// Re-attach compound subcomponents (Select.Root / Trigger / Value / Content /
// Item) for shadcn/Radix-shape parity. The existing prop-based `<Select
// options=…>` API stays untouched. See bottom of file.

// ── Select compound (Radix-shape parity) ──────────────────────────
//
// Additive layer on top of the existing prop-based `<Select options=…>`
// component. Lets shadcn/Radix migrators write call sites in their familiar
// shape:
//
//   <Select.Root value={v} onValueChange={setV}>
//     <Select.Trigger><Select.Value placeholder="Pick…" /></Select.Trigger>
//     <Select.Content>
//       <Select.Item value="a">Option A</Select.Item>
//       <Select.Item value="b">Option B</Select.Item>
//     </Select.Content>
//   </Select.Root>
//
// The native `<select>` API still works via `<Select options={…} />`. Both
// coexist; pick whichever is ergonomic for the call site.

interface SelectCompoundContextValue {
  open: boolean;
  setOpen: (next: boolean) => void;
  value: string | undefined;
  setValue: (v: string) => void;
  triggerId: string;
  contentId: string;
}

const SelectCompoundContext = createContext<SelectCompoundContextValue | null>(null);

function useSelectCompoundContext(): SelectCompoundContextValue {
  const ctx = useContext(SelectCompoundContext);
  if (!ctx) throw new Error("Select.* must be used inside a <Select.Root>");
  return ctx;
}

export interface SelectRootProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  children?: ReactNode;
}

function SelectRoot({ value, defaultValue, onValueChange, children }: SelectRootProps) {
  const [open, setOpen] = useState(false);
  const [internal, setInternal] = useState<string | undefined>(defaultValue);
  const current = value !== undefined ? value : internal;
  const setValue = useCallback(
    (v: string) => {
      if (value === undefined) setInternal(v);
      onValueChange?.(v);
      setOpen(false);
    },
    [value, onValueChange]
  );
  const triggerId = useId();
  const contentId = useId();
  const ctx = useMemo<SelectCompoundContextValue>(
    () => ({ open, setOpen, value: current, setValue, triggerId, contentId }),
    [open, current, setValue, triggerId, contentId]
  );
  return (
    <SelectCompoundContext.Provider value={ctx}>
      <div className="vf-select-compound" style={{ position: "relative", display: "inline-block" }}>
        {children}
      </div>
    </SelectCompoundContext.Provider>
  );
}

export interface SelectTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode;
}

const SelectTrigger = forwardRef<HTMLButtonElement, SelectTriggerProps>(
  function SelectTrigger({ className, children, onClick, ...props }, ref) {
    const ctx = useSelectCompoundContext();
    return (
      <button
        ref={ref}
        type="button"
        id={ctx.triggerId}
        aria-haspopup="listbox"
        aria-expanded={ctx.open}
        aria-controls={ctx.contentId}
        className={cx("vf-select", "vf-select-compound__trigger", className)}
        onClick={(e) => {
          ctx.setOpen(!ctx.open);
          onClick?.(e);
        }}
        {...props}
      >
        {children}
      </button>
    );
  }
);
SelectTrigger.displayName = "Select.Trigger";

export interface SelectValueProps extends HTMLAttributes<HTMLSpanElement> {
  /** Text shown when nothing is selected. */
  placeholder?: string;
}

const SelectValue = forwardRef<HTMLSpanElement, SelectValueProps>(
  function SelectValue({ placeholder, className, ...props }, ref) {
    const ctx = useSelectCompoundContext();
    return (
      <span
        ref={ref}
        className={cx("vf-select-compound__value", className)}
        {...props}
      >
        {ctx.value ?? placeholder ?? ""}
      </span>
    );
  }
);
SelectValue.displayName = "Select.Value";

export interface SelectContentProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

const SelectContent = forwardRef<HTMLDivElement, SelectContentProps>(
  function SelectContent({ className, children, ...props }, ref) {
    const ctx = useSelectCompoundContext();
    if (!ctx.open) return null;
    return (
      <div
        ref={ref}
        role="listbox"
        id={ctx.contentId}
        aria-labelledby={ctx.triggerId}
        className={cx("vf-select-compound__content", className)}
        style={{
          position: "absolute",
          top: "100%",
          left: 0,
          zIndex: 100,
          background: "var(--vf-bg-3)",
          border: "1px solid var(--vf-border-1)",
          minWidth: "100%",
          ...((props as { style?: CSSProperties }).style ?? {}),
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);
SelectContent.displayName = "Select.Content";

export interface SelectItemProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
  disabled?: boolean;
  children?: ReactNode;
}

const SelectItem = forwardRef<HTMLDivElement, SelectItemProps>(
  function SelectItem({ value, disabled, children, className, onClick, ...props }, ref) {
    const ctx = useSelectCompoundContext();
    const isSelected = ctx.value === value;
    return (
      <div
        ref={ref}
        role="option"
        aria-selected={isSelected}
        aria-disabled={disabled || undefined}
        tabIndex={disabled ? -1 : 0}
        data-value={value}
        className={cx(
          "vf-select-compound__item",
          isSelected && "vf-select-compound__item--selected",
          disabled && "vf-select-compound__item--disabled",
          className
        )}
        onClick={(e) => {
          if (!disabled) ctx.setValue(value);
          onClick?.(e);
        }}
        onKeyDown={(e) => {
          if (!disabled && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            ctx.setValue(value);
          }
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);
SelectItem.displayName = "Select.Item";

// Attach compound subcomponents to `Select` so consumers can write
// `Select.Root` / `Select.Trigger` / etc. The existing prop-based `Select`
// remains the default callable.
(Select as unknown as Record<string, unknown>).Root = SelectRoot;
(Select as unknown as Record<string, unknown>).Trigger = SelectTrigger;
(Select as unknown as Record<string, unknown>).Value = SelectValue;
(Select as unknown as Record<string, unknown>).Content = SelectContent;
(Select as unknown as Record<string, unknown>).Item = SelectItem;

// Re-export compound subcomponents as named exports too, for consumers
// that prefer flat imports.
export { SelectRoot, SelectTrigger, SelectValue, SelectContent, SelectItem };

Select.displayName = "Select";
