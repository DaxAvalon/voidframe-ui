"use client";

// Phase 15 — ThemeSelector
//
// SegmentedControl-style chooser with optional icon per theme. Works as
// controlled (value + onChange) or uncontrolled.

import {
  forwardRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { cx } from "../utils/cx";

export interface ThemeSelectorOption {
  id: string;
  label: ReactNode;
  icon?: ReactNode;
  description?: ReactNode;
}

export interface ThemeSelectorProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  value?: string;
  defaultValue?: string;
  onChange?: (next: string) => void;
  themes: ThemeSelectorOption[];
  variant?: "segmented" | "dropdown";
  label?: ReactNode;
  size?: "sm" | "md";
}

export const ThemeSelector = forwardRef<HTMLDivElement, ThemeSelectorProps>(
  function ThemeSelector(
    {
      value,
      defaultValue,
      onChange,
      themes,
      variant = "segmented",
      label = "Theme",
      size = "md",
      className,
      ...props
    },
    ref
  ) {
    const [internal, setInternal] = useState(
      defaultValue ?? themes[0]?.id ?? ""
    );
    const current = value ?? internal;
    const set = (next: string) => {
      if (value === undefined) setInternal(next);
      onChange?.(next);
    };

    if (variant === "dropdown") {
      return (
        <div
          ref={ref}
          className={cx(
            "vf-theme-selector",
            "vf-theme-selector--dropdown",
            className
          )}
          {...props}
        >
          <label className="vf-theme-selector__label">
            {label && (
              <span className="vf-theme-selector__label-text">{label}</span>
            )}
            <select
              className="vf-theme-selector__select"
              value={current}
              onChange={(e) => set(e.target.value)}
              aria-label={typeof label === "string" ? label : "Theme"}
            >
              {themes.map((theme) => (
                <option key={theme.id} value={theme.id}>
                  {typeof theme.label === "string" ? theme.label : theme.id}
                </option>
              ))}
            </select>
          </label>
        </div>
      );
    }

    return (
      <div
        ref={ref}
        role="radiogroup"
        aria-label={typeof label === "string" ? label : "Theme"}
        className={cx(
          "vf-theme-selector",
          "vf-theme-selector--segmented",
          `vf-theme-selector--${size}`,
          className
        )}
        {...props}
      >
        {themes.map((theme) => {
          const selected = theme.id === current;
          return (
            <button
              key={theme.id}
              type="button"
              role="radio"
              aria-checked={selected}
              className={cx(
                "vf-theme-selector__option",
                selected && "vf-theme-selector__option--selected"
              )}
              onClick={() => set(theme.id)}
              title={
                typeof theme.description === "string"
                  ? theme.description
                  : undefined
              }
            >
              {theme.icon && (
                <span className="vf-theme-selector__icon" aria-hidden="true">
                  {theme.icon}
                </span>
              )}
              <span className="vf-theme-selector__text">{theme.label}</span>
            </button>
          );
        })}
      </div>
    );
  }
);
ThemeSelector.displayName = "ThemeSelector";
