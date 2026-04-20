"use client";

import { cloneElement, forwardRef, isValidElement, memo } from "react";
import type { ReactElement } from "react";
import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from "react";
import { Slot } from "../primitives/Slot";
import { cx } from "../utils/cx";
import { warn } from "../utils/warn";

export type ButtonVariant = "solid" | "outline" | "ghost" | "subtle";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> {
  variant?: ButtonVariant;
  /** Accent color for `solid` and `subtle` variants. Sets `--vf-accent`. */
  accent?: string;
  size?: ButtonSize;
  active?: boolean;
  disabled?: boolean;
  /** When true, renders a spinner before children and disables the button. */
  loading?: boolean;
  /** Icon rendered before children. Replaced by spinner when loading. */
  iconLeft?: ReactNode;
  /** Icon rendered after children. */
  iconRight?: ReactNode;
  onClick?: () => void;
  /** Render through `<Slot>` and merge styles onto a single child element. */
  asChild?: boolean;
  children?: ReactNode;
  style?: CSSProperties;
}

const ButtonImpl = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    children,
    variant = "outline",
    accent,
    size = "md",
    active,
    disabled,
    loading,
    iconLeft,
    iconRight,
    onClick,
    asChild,
    className,
    style,
    ...props
  },
  ref
) {
  const composedStyle: CSSProperties = {
    ...(accent ? ({ "--vf-accent": accent } as CSSProperties) : {}),
    ...style,
  };
  const composedClass = cx(
    "vf-button",
    `vf-button--${variant}`,
    `vf-button--${size}`,
    className
  );
  const isDisabled = disabled || loading;
  const dataAttrs = {
    "data-active": active ? "true" : undefined,
    "data-disabled": isDisabled ? "true" : undefined,
  };

  if (asChild) {
    warn(
      typeof children !== "string",
      "<Button asChild> expects a single React element child (not a plain string)."
    );
    // Decorate the child element: inject icons/spinner around its existing
    // children, then pass the decorated child to Slot for prop merging.
    let decoratedChild = children;
    if (isValidElement(children)) {
      const childEl = children as ReactElement<{ children?: React.ReactNode }>;
      decoratedChild = cloneElement(childEl, {
        children: (
          <>
            {loading ? (
              <span className="vf-button__spinner" aria-hidden="true">&#x27F3;</span>
            ) : iconLeft ? (
              <span className="vf-button__icon vf-button__icon--left">{iconLeft}</span>
            ) : null}
            {childEl.props.children}
            {iconRight && (
              <span className="vf-button__icon vf-button__icon--right">{iconRight}</span>
            )}
          </>
        ),
      });
    }
    return (
      <Slot
        ref={ref as never}
        onClick={isDisabled ? undefined : onClick}
        className={composedClass}
        style={composedStyle}
        {...dataAttrs}
        {...props}
      >
        {decoratedChild}
      </Slot>
    );
  }

  const { type: typeProp, ...restProps } = props as { type?: "button" | "submit" | "reset" };
  return (
    <button
      ref={ref}
      type={typeProp ?? "button"}
      onClick={isDisabled ? undefined : onClick}
      aria-disabled={isDisabled || undefined}
      className={composedClass}
      style={composedStyle}
      {...dataAttrs}
      {...restProps}
    >
      {loading ? (
        <span className="vf-button__spinner" aria-hidden="true">&#x27F3;</span>
      ) : iconLeft ? (
        <span className="vf-button__icon vf-button__icon--left">{iconLeft}</span>
      ) : null}
      {children}
      {iconRight && <span className="vf-button__icon vf-button__icon--right">{iconRight}</span>}
    </button>
  );
});
ButtonImpl.displayName = "Button";
/** Memoized leaf — skips re-render when props are referentially stable. */
export const Button = memo(ButtonImpl);
(Button as unknown as { displayName: string }).displayName = "Button";

export interface ButtonGroupOption {
  key: string;
  label: string;
}

export interface ButtonGroupProps {
  options: ButtonGroupOption[];
  value: string;
  onValueChange: (key: string) => void;
  accent?: string;
  size?: ButtonSize;
  className?: string;
  style?: CSSProperties;
}

export const ButtonGroup = forwardRef<HTMLDivElement, ButtonGroupProps>(
  function ButtonGroup({ options, value, onValueChange, accent, size, className, style }, ref) {
    return (
      <div ref={ref} className={cx("vf-button-group", className)} style={style}>
        {options.map((o) => (
          <Button
            key={o.key}
            active={value === o.key}
            onClick={() => onValueChange(o.key)}
            accent={accent}
            size={size}
            variant={accent ? "subtle" : "outline"}
          >
            {o.label}
          </Button>
        ))}
      </div>
    );
  }
);
ButtonGroup.displayName = "ButtonGroup";
