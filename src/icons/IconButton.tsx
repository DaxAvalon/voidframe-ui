"use client";

// Phase 14 — IconButton + IconGroup
//
// IconButton is a square, icon-only button with required aria-label (dev-
// warn if missing). Optional `tooltip` prop wraps the button in a simple
// CSS-positioned tooltip.

import {
  forwardRef,
  useEffect,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { cx } from "../utils/cx";
import { warnOnce } from "../utils/warn";

export type IconButtonVariant = "solid" | "outline" | "ghost" | "subtle";
export type IconButtonSize = "xs" | "sm" | "md" | "lg";

export interface IconButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  accent?: string;
  /** Accessible name — required for screen readers. */
  "aria-label"?: string;
  /** Short text shown on hover / focus above the button. */
  tooltip?: ReactNode;
  /** Toggle state. */
  active?: boolean;
  children?: ReactNode;
}

/**
 * Icon-only button. Requires `aria-label` (or `aria-labelledby`) so screen
 * readers announce the action; dev warns without one.
 */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton(
    {
      variant = "outline",
      size = "md",
      accent,
      tooltip,
      active,
      className,
      style,
      "aria-label": ariaLabel,
      type = "button",
      children,
      ...props
    },
    ref
  ) {
    useEffect(() => {
      if (!ariaLabel && !props["aria-labelledby"]) {
        warnOnce(
          "IconButton:missing-aria-label",
          "<IconButton> requires `aria-label` (or `aria-labelledby`) for screen readers."
        );
      }
    }, [ariaLabel, props]);

    const composedStyle = {
      ...(accent ? ({ "--vf-accent": accent } as React.CSSProperties) : {}),
      ...style,
    };

    const button = (
      <button
        ref={ref}
        type={type}
        className={cx(
          "vf-icon-button",
          `vf-icon-button--${variant}`,
          `vf-icon-button--${size}`,
          active && "vf-icon-button--active",
          className
        )}
        aria-label={ariaLabel}
        aria-pressed={active ? "true" : undefined}
        style={composedStyle}
        {...props}
      >
        {children}
      </button>
    );

    if (!tooltip) return button;
    return (
      <span className="vf-icon-button-wrap">
        {button}
        <span role="tooltip" className="vf-icon-button__tooltip">
          {tooltip}
        </span>
      </span>
    );
  }
);
IconButton.displayName = "IconButton";

// ── IconGroup ──────────────────────────────────────────────

export interface IconGroupProps extends HTMLAttributes<HTMLDivElement> {
  gap?: number;
  align?: "center" | "start" | "end" | "baseline";
  separator?: ReactNode;
  children?: ReactNode;
}

/**
 * Compact group of icons displayed inline (e.g. status badges). Optional
 * overflow chip.
 */
export const IconGroup = forwardRef<HTMLDivElement, IconGroupProps>(
  function IconGroup(
    { gap = 4, align = "center", separator, className, style, children, ...props },
    ref
  ) {
    const composedStyle = {
      gap,
      alignItems:
        align === "start"
          ? "flex-start"
          : align === "end"
            ? "flex-end"
            : align === "baseline"
              ? "baseline"
              : "center",
      ...style,
    };
    if (!separator) {
      return (
        <div
          ref={ref}
          className={cx("vf-icon-group", className)}
          style={composedStyle}
          {...props}
        >
          {children}
        </div>
      );
    }
    // Interleave a separator between each child.
    const nodes = Array.isArray(children) ? children : [children];
    const interleaved: ReactNode[] = [];
    nodes.forEach((child, i) => {
      if (i > 0) {
        interleaved.push(
          <span
            key={`sep-${i}`}
            aria-hidden="true"
            className="vf-icon-group__sep"
          >
            {separator}
          </span>
        );
      }
      interleaved.push(child);
    });
    return (
      <div
        ref={ref}
        className={cx("vf-icon-group", className)}
        style={composedStyle}
        {...props}
      >
        {interleaved}
      </div>
    );
  }
);
IconGroup.displayName = "IconGroup";
