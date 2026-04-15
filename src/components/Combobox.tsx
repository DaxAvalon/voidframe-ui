"use client";

// Phase 7.3 — Combobox + MultiSelect
//
// Combobox is a searchable single-select: an input filters a listbox popover.
// MultiSelect is the same shape but supports multiple selections, rendering
// chip tags inside the control.
//
// Both follow the WAI-ARIA 1.2 combobox pattern:
//   - input[role="combobox"] with aria-expanded + aria-controls + aria-activedescendant
//   - ul[role="listbox"] with li[role="option"] children
//   - ArrowDown/Up cycles the highlighted option
//   - Enter commits, Escape closes

import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { useClickOutside, useId, useMergedRefs } from "../hooks";
import { useControllableState } from "../hooks/useControllableState";
import { cx } from "../utils/cx";
import { Label } from "./Text";

// ── shared option type ────────────────────────────────────────

export interface ComboboxOption {
  value: string;
  label: string;
  disabled?: boolean;
  /** Optional group label; adjacent options with the same group are rendered together. */
  group?: string;
}

function defaultFilter(query: string, option: ComboboxOption): boolean {
  if (!query) return true;
  return option.label.toLowerCase().includes(query.toLowerCase());
}

// ── Combobox (single) ─────────────────────────────────────────

export interface ComboboxProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  options: ComboboxOption[];
  value?: string | null;
  defaultValue?: string | null;
  onChange?: (value: string | null) => void;
  label?: string;
  placeholder?: string;
  /** Custom predicate. Defaults to case-insensitive substring match on `label`. */
  filter?: (query: string, option: ComboboxOption) => boolean;
  /** Allow values that don't exist in options (emits the typed string). */
  allowCustomValue?: boolean;
  /** Custom option renderer. */
  renderOption?: (opt: ComboboxOption, state: { highlighted: boolean; selected: boolean }) => ReactNode;
  emptyMessage?: ReactNode;
  disabled?: boolean;
  id?: string;
  style?: CSSProperties;
}

export const Combobox = forwardRef<HTMLDivElement, ComboboxProps>(
  function Combobox(
    {
      options,
      value,
      defaultValue,
      onChange,
      label,
      placeholder = "Search…",
      filter = defaultFilter,
      allowCustomValue,
      renderOption,
      emptyMessage = "No results",
      disabled,
      id,
      className,
      style,
      ...props
    },
    ref
  ) {
    const [current, setCurrent] = useControllableState<string | null>({
      value,
      defaultValue: defaultValue ?? null,
      onChange,
      componentName: "Combobox",
    });

    const selectedOption = useMemo(
      () => options.find((o) => o.value === current) ?? null,
      [options, current]
    );

    const [query, setQuery] = useState<string>(selectedOption?.label ?? "");
    const [open, setOpen] = useState(false);
    const [highlighted, setHighlighted] = useState(-1);

    useEffect(() => {
      setQuery(selectedOption?.label ?? (allowCustomValue ? current ?? "" : ""));
    }, [selectedOption, allowCustomValue, current]);

    const filtered = useMemo(() => {
      const q = open ? query : "";
      // Only filter when the user is typing (query differs from selected label).
      const isSearching = open && (!selectedOption || query !== selectedOption.label);
      return isSearching ? options.filter((o) => filter(q, o)) : options;
    }, [open, query, options, selectedOption, filter]);

    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const clickOutsideRef = useClickOutside<HTMLDivElement>(() => setOpen(false));
    const mergedRef = useMergedRefs(ref, containerRef, clickOutsideRef);

    const inputId = useId(id);
    const listboxId = useId();

    const commit = useCallback(
      (opt: ComboboxOption | null) => {
        if (opt) {
          if (opt.disabled) return;
          setCurrent(opt.value);
          setQuery(opt.label);
        } else {
          setCurrent(null);
          setQuery("");
        }
        setOpen(false);
      },
      [setCurrent]
    );

    const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (!open) {
          setOpen(true);
          return;
        }
        setHighlighted((i) => Math.min(filtered.length - 1, Math.max(0, i + 1)));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (!open) {
          setOpen(true);
          return;
        }
        setHighlighted((i) => Math.max(0, i - 1));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (open && highlighted >= 0 && filtered[highlighted]) {
          commit(filtered[highlighted]!);
        } else if (allowCustomValue && query) {
          setCurrent(query);
          setOpen(false);
        }
      } else if (e.key === "Escape") {
        if (open) {
          e.preventDefault();
          setOpen(false);
          setQuery(selectedOption?.label ?? "");
        }
      } else if (e.key === "Home") {
        if (open) {
          e.preventDefault();
          setHighlighted(0);
        }
      } else if (e.key === "End") {
        if (open) {
          e.preventDefault();
          setHighlighted(Math.max(0, filtered.length - 1));
        }
      }
    };

    useEffect(() => {
      setHighlighted(-1);
    }, [query, open]);

    const handleBlur = () => {
      if (!allowCustomValue) return;
      // Only commit custom value on blur if there's no matching option.
      if (query && !options.some((o) => o.label === query || o.value === query)) {
        setCurrent(query);
      }
    };

    return (
      <div
        ref={mergedRef}
        className={cx("vf-combobox", className)}
        style={style}
        {...props}
      >
        {label && (
          <Label as="label" htmlFor={inputId}>
            {label}
          </Label>
        )}
        <input
          ref={inputRef}
          id={inputId}
          type="text"
          role="combobox"
          className="vf-input vf-combobox__input"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={handleBlur}
          onKeyDown={handleKey}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="off"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-activedescendant={
            open && filtered[highlighted]
              ? `${listboxId}-${filtered[highlighted]!.value}`
              : undefined
          }
        />
        {open && (
          <ul
            id={listboxId}
            role="listbox"
            className="vf-combobox__list"
            aria-label={label ?? "Options"}
          >
            {filtered.length === 0 && (
              <li className="vf-combobox__empty" aria-disabled="true">
                {emptyMessage}
              </li>
            )}
            {filtered.map((opt, idx) => {
              const isHighlighted = idx === highlighted;
              const isSelected = opt.value === current;
              return (
                <li
                  key={opt.value}
                  id={`${listboxId}-${opt.value}`}
                  role="option"
                  aria-selected={isSelected}
                  aria-disabled={opt.disabled || undefined}
                  className={cx(
                    "vf-combobox__option",
                    isHighlighted && "vf-combobox__option--highlighted",
                    isSelected && "vf-combobox__option--selected",
                    opt.disabled && "vf-combobox__option--disabled"
                  )}
                  onMouseDown={(e) => {
                    // Prevent blur-close before the click commits.
                    e.preventDefault();
                    commit(opt);
                  }}
                  onMouseEnter={() => setHighlighted(idx)}
                >
                  {renderOption
                    ? renderOption(opt, {
                        highlighted: isHighlighted,
                        selected: isSelected,
                      })
                    : opt.label}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    );
  }
);
Combobox.displayName = "Combobox";

// ── MultiSelect ───────────────────────────────────────────────

export interface MultiSelectProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  options: ComboboxOption[];
  value?: string[];
  defaultValue?: string[];
  onChange?: (values: string[]) => void;
  label?: string;
  placeholder?: string;
  filter?: (query: string, option: ComboboxOption) => boolean;
  emptyMessage?: ReactNode;
  /** Hard cap on number of simultaneously selected values. */
  maxSelected?: number;
  disabled?: boolean;
  id?: string;
  style?: CSSProperties;
}

export const MultiSelect = forwardRef<HTMLDivElement, MultiSelectProps>(
  function MultiSelect(
    {
      options,
      value,
      defaultValue,
      onChange,
      label,
      placeholder = "Search…",
      filter = defaultFilter,
      emptyMessage = "No results",
      maxSelected,
      disabled,
      id,
      className,
      style,
      ...props
    },
    ref
  ) {
    const [current, setCurrent] = useControllableState<string[]>({
      value,
      defaultValue: defaultValue ?? [],
      onChange,
      componentName: "MultiSelect",
    });

    const [query, setQuery] = useState("");
    const [open, setOpen] = useState(false);
    const [highlighted, setHighlighted] = useState(-1);

    const filtered = useMemo(
      () => options.filter((o) => filter(query, o)),
      [options, query, filter]
    );

    const containerRef = useRef<HTMLDivElement>(null);
    const clickOutsideRef = useClickOutside<HTMLDivElement>(() => setOpen(false));
    const mergedRef = useMergedRefs(ref, containerRef, clickOutsideRef);

    const inputId = useId(id);
    const listboxId = useId();

    const toggle = useCallback(
      (opt: ComboboxOption) => {
        if (opt.disabled) return;
        const isSelected = current.includes(opt.value);
        if (isSelected) {
          setCurrent(current.filter((v) => v !== opt.value));
        } else {
          if (maxSelected && current.length >= maxSelected) return;
          setCurrent([...current, opt.value]);
        }
        setQuery("");
        setHighlighted(-1);
      },
      [current, setCurrent, maxSelected]
    );

    const remove = useCallback(
      (val: string) => {
        setCurrent(current.filter((v) => v !== val));
      },
      [current, setCurrent]
    );

    const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (!open) {
          setOpen(true);
          return;
        }
        setHighlighted((i) => Math.min(filtered.length - 1, Math.max(0, i + 1)));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (!open) {
          setOpen(true);
          return;
        }
        setHighlighted((i) => Math.max(0, i - 1));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (open && highlighted >= 0 && filtered[highlighted]) {
          toggle(filtered[highlighted]!);
        }
      } else if (e.key === "Escape") {
        if (open) {
          e.preventDefault();
          setOpen(false);
        }
      } else if (e.key === "Backspace" && query === "" && current.length > 0) {
        e.preventDefault();
        setCurrent(current.slice(0, -1));
      }
    };

    useEffect(() => {
      setHighlighted(-1);
    }, [query, open]);

    const selectedOptions = current
      .map((v) => options.find((o) => o.value === v))
      .filter((o): o is ComboboxOption => !!o);

    return (
      <div
        ref={mergedRef}
        className={cx("vf-combobox", "vf-multi-select", className)}
        style={style}
        {...props}
      >
        {label && (
          <Label as="label" htmlFor={inputId}>
            {label}
          </Label>
        )}
        <div
          className="vf-multi-select__control"
          onClick={() => !disabled && (document.getElementById(inputId) as HTMLInputElement)?.focus()}
        >
          {selectedOptions.map((opt) => (
            <span key={opt.value} className="vf-multi-select__tag">
              <span className="vf-multi-select__tag-label">{opt.label}</span>
              <button
                type="button"
                aria-label={`Remove ${opt.label}`}
                className="vf-multi-select__tag-remove"
                onClick={(e) => {
                  e.stopPropagation();
                  remove(opt.value);
                }}
                disabled={disabled}
              >
                ×
              </button>
            </span>
          ))}
          <input
            id={inputId}
            type="text"
            role="combobox"
            className="vf-multi-select__input"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={handleKey}
            placeholder={selectedOptions.length === 0 ? placeholder : ""}
            disabled={disabled}
            autoComplete="off"
            aria-expanded={open}
            aria-controls={listboxId}
            aria-autocomplete="list"
            aria-activedescendant={
              open && filtered[highlighted]
                ? `${listboxId}-${filtered[highlighted]!.value}`
                : undefined
            }
          />
        </div>
        {open && (
          <ul
            id={listboxId}
            role="listbox"
            aria-multiselectable="true"
            aria-label={label ?? "Options"}
            className="vf-combobox__list"
          >
            {filtered.length === 0 && (
              <li className="vf-combobox__empty" aria-disabled="true">
                {emptyMessage}
              </li>
            )}
            {filtered.map((opt, idx) => {
              const isHighlighted = idx === highlighted;
              const isSelected = current.includes(opt.value);
              const atCap = !!maxSelected && current.length >= maxSelected && !isSelected;
              return (
                <li
                  key={opt.value}
                  id={`${listboxId}-${opt.value}`}
                  role="option"
                  aria-selected={isSelected}
                  aria-disabled={(opt.disabled || atCap) || undefined}
                  className={cx(
                    "vf-combobox__option",
                    isHighlighted && "vf-combobox__option--highlighted",
                    isSelected && "vf-combobox__option--selected",
                    (opt.disabled || atCap) && "vf-combobox__option--disabled"
                  )}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    if (!atCap) toggle(opt);
                  }}
                  onMouseEnter={() => setHighlighted(idx)}
                >
                  <span className="vf-combobox__check" aria-hidden="true">
                    {isSelected ? "✓" : ""}
                  </span>
                  {opt.label}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    );
  }
);
MultiSelect.displayName = "MultiSelect";
