"use client";

// Phase 15 — ThemeSelector
//
// Segmented, dropdown or vertical-list chooser with optional icon per
// theme. Controlled (value + onValueChange), uncontrolled, or `connected`
// to the provider through `useTheme()`. Defaults to `THEME_OPTIONS`.

import {
  forwardRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { cx } from "../utils/cx";
import { THEME_OPTIONS } from "../themes/options";
import { useTheme } from "../provider/VoidframeProvider";

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
  onValueChange?: (next: string) => void;
  /** Options to offer. Default: `THEME_OPTIONS` (every built-in plus "system"). */
  themes?: readonly ThemeSelectorOption[];
  /**
   * `segmented` (default) and `dropdown` are compact; `list` is a vertical
   * radio list with each option's description, for settings pages.
   */
  kind?: "segmented" | "dropdown" | "list";
  label?: ReactNode;
  size?: "sm" | "md";
  /**
   * Bind to the enclosing `VoidframeProvider`: the current value is
   * `useTheme().themeName` and choosing calls `setThemeName`. `value` and
   * `onValueChange` still take precedence when given.
   */
  connected?: boolean;
}

/**
 * Segmented control, dropdown or descriptive list for picking the active
 * theme. Pairs with `useThemePersistence` and `useTheme()`.
 */
export const ThemeSelector = forwardRef<HTMLDivElement, ThemeSelectorProps>(
  function ThemeSelector(
    {
      value,
      defaultValue,
      onValueChange,
      themes = THEME_OPTIONS as readonly ThemeSelectorOption[],
      kind = "segmented",
      label = "Theme",
      size = "md",
      connected = false,
      className,
      ...props
    },
    ref
  ) {
    const control = useTheme();
    const [internal, setInternal] = useState(
      defaultValue ?? themes[0]?.id ?? ""
    );
    const current =
      value ?? (connected ? String(control.themeName) : internal);
    const set = (next: string) => {
      if (value === undefined && !connected) setInternal(next);
      if (connected) control.setThemeName(next);
      onValueChange?.(next);
    };

    if (kind === "list") {
      return (
        <div
          ref={ref}
          role="radiogroup"
          aria-label={typeof label === "string" ? label : "Theme"}
          className={cx(
            "vf-theme-selector",
            "vf-theme-selector--list",
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
                  "vf-theme-selector__item",
                  selected && "vf-theme-selector__item--selected"
                )}
                onClick={() => set(theme.id)}
              >
                <span className="vf-theme-selector__radio" aria-hidden="true" />
                {theme.icon && (
                  <span className="vf-theme-selector__icon" aria-hidden="true">
                    {theme.icon}
                  </span>
                )}
                <span className="vf-theme-selector__body">
                  <span className="vf-theme-selector__text">{theme.label}</span>
                  {theme.description && (
                    <span className="vf-theme-selector__description">
                      {theme.description}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      );
    }

    if (kind === "dropdown") {
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
