"use client";

import { forwardRef } from "react";
import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from "react";
import { Slot } from "../primitives/Slot";
import { cx } from "../utils/cx";
import { warn } from "../utils/warn";

export type ButtonVariant = "default" | "ghost" | "accent" | "solid";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> {
  variant?: ButtonVariant;
  /** Accent color for `accent` and `solid` variants. Sets `--vf-accent`. */
  accent?: string;
  size?: ButtonSize;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  /** Render through `<Slot>` and merge styles onto a single child element. */
  asChild?: boolean;
  children?: ReactNode;
  style?: CSSProperties;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    children,
    variant = "default",
    accent,
    size = "md",
    active,
    disabled,
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
  const dataAttrs = {
    "data-active": active ? "true" : undefined,
    "data-disabled": disabled ? "true" : undefined,
  };

  if (asChild) {
    warn(
      typeof children !== "string",
      "<Button asChild> expects a single React element child (not a plain string)."
    );
    return (
      <Slot
        ref={ref as never}
        onClick={disabled ? undefined : onClick}
        className={composedClass}
        style={composedStyle}
        {...dataAttrs}
        {...props}
      >
        {children}
      </Slot>
    );
  }

  return (
    <button
      ref={ref}
      onClick={disabled ? undefined : onClick}
      aria-disabled={disabled || undefined}
      className={composedClass}
      style={composedStyle}
      {...dataAttrs}
      {...props}
    >
      {children}
    </button>
  );
});
Button.displayName = "Button";

export interface ButtonGroupOption {
  key: string;
  label: string;
}

export interface ButtonGroupProps {
  options: ButtonGroupOption[];
  value: string;
  onChange: (key: string) => void;
  accent?: string;
  size?: ButtonSize;
  className?: string;
  style?: CSSProperties;
}

export const ButtonGroup = forwardRef<HTMLDivElement, ButtonGroupProps>(
  function ButtonGroup({ options, value, onChange, accent, size, className, style }, ref) {
    return (
      <div ref={ref} className={cx("vf-button-group", className)} style={style}>
        {options.map((o) => (
          <Button
            key={o.key}
            active={value === o.key}
            onClick={() => onChange(o.key)}
            accent={accent}
            size={size}
            variant={accent ? "accent" : "default"}
          >
            {o.label}
          </Button>
        ))}
      </div>
    );
  }
);
ButtonGroup.displayName = "ButtonGroup";
