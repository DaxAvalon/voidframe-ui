"use client";

// Layout + semantic structure for forms: FormActions, InputGroup, FieldSet.

import {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  type CSSProperties,
  type FieldsetHTMLAttributes,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
} from "react";
import { cx } from "../utils/cx";

// ── FormActions ───────────────────────────────────────────────

export interface FormActionsProps extends HTMLAttributes<HTMLDivElement> {
  /** Alignment — default `end` (right-justified for LTR). */
  align?: "start" | "end" | "center" | "between";
  children?: ReactNode;
  style?: CSSProperties;
}

/**
 * Right-aligned footer for submit/cancel buttons. Flex container with
 * consistent gap. Respects LTR/RTL via `justify-content: flex-end` (maps
 * to end of the inline axis).
 */
export const FormActions = forwardRef<HTMLDivElement, FormActionsProps>(
  function FormActions({ align = "end", children, className, style, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cx("vf-form-actions", `vf-form-actions--${align}`, className)}
        style={style}
        {...props}
      >
        {children}
      </div>
    );
  }
);
FormActions.displayName = "FormActions";

// ── InputGroup ────────────────────────────────────────────────

export interface InputGroupProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  style?: CSSProperties;
}

/**
 * Visually joins an Input with addon prefixes/suffixes.
 * Removes adjacent borders so the group reads as a single control.
 *
 * @example
 * <InputGroup>
 *   <InputGroup.Addon>https://</InputGroup.Addon>
 *   <Input placeholder="example.com" />
 *   <InputGroup.Addon>.dev</InputGroup.Addon>
 * </InputGroup>
 */
const InputGroupRoot = forwardRef<HTMLDivElement, InputGroupProps>(
  function InputGroup({ children, className, style, ...props }, ref) {
    // Tag each child with positional data attributes so CSS can
    // flatten the inner borders between adjacent members.
    const array = Children.toArray(children).filter(isValidElement);
    const total = array.length;
    const stamped = array.map((child, i) =>
      cloneElement(child as ReactElement<{ "data-vf-group-pos"?: string }>, {
        "data-vf-group-pos":
          total === 1
            ? "single"
            : i === 0
              ? "first"
              : i === total - 1
                ? "last"
                : "middle",
      } as never)
    );
    return (
      <div
        ref={ref}
        className={cx("vf-input-group", className)}
        style={style}
        {...props}
      >
        {stamped}
      </div>
    );
  }
);
InputGroupRoot.displayName = "InputGroup";

// ── InputGroup.Addon ──────────────────────────────────────────

export interface InputGroupAddonProps extends HTMLAttributes<HTMLSpanElement> {
  children?: ReactNode;
  style?: CSSProperties;
}

/**
 * Non-interactive addon slot for `InputGroup` (e.g. a leading currency sign
 * or trailing unit).
 */
export const InputGroupAddon = forwardRef<HTMLSpanElement, InputGroupAddonProps>(
  function InputGroupAddon({ children, className, style, ...props }, ref) {
    return (
      <span
        ref={ref}
        className={cx("vf-input-group__addon", className)}
        style={style}
        {...props}
      >
        {children}
      </span>
    );
  }
);
InputGroupAddon.displayName = "InputGroup.Addon";

// Attach compound subcomponent and re-export with the correct compound type.
type InputGroupCompound = typeof InputGroupRoot & {
  /**
   * Non-interactive addon slot for `InputGroup` (e.g. a leading currency
   * sign or trailing unit).
   */
  Addon: typeof InputGroupAddon;
};
(InputGroupRoot as unknown as InputGroupCompound).Addon = InputGroupAddon;
export const InputGroup = InputGroupRoot as InputGroupCompound;

// ── FieldSet + Legend ─────────────────────────────────────────

export interface FieldSetProps extends FieldsetHTMLAttributes<HTMLFieldSetElement> {
  children?: ReactNode;
  style?: CSSProperties;
}

/** Native `<fieldset>` with Voidframe styling. Use with `<Legend>` inside. */
export const FieldSet = forwardRef<HTMLFieldSetElement, FieldSetProps>(
  function FieldSet({ children, className, style, disabled, ...props }, ref) {
    return (
      <fieldset
        ref={ref}
        className={cx("vf-fieldset", className)}
        style={style}
        disabled={disabled}
        {...props}
      >
        {children}
      </fieldset>
    );
  }
);
FieldSet.displayName = "FieldSet";

export interface LegendProps extends HTMLAttributes<HTMLLegendElement> {
  children?: ReactNode;
  style?: CSSProperties;
}

/** Native `<legend>` with Voidframe styling. */
export const Legend = forwardRef<HTMLLegendElement, LegendProps>(
  function Legend({ children, className, style, ...props }, ref) {
    return (
      <legend
        ref={ref}
        className={cx("vf-legend", className)}
        style={style}
        {...props}
      >
        {children}
      </legend>
    );
  }
);
Legend.displayName = "Legend";
