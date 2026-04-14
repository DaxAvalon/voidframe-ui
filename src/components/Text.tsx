import { forwardRef } from "react";
import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import type { Size } from "../types";
import { cx } from "../utils/cx";

type AsElement = "span" | "div" | "p" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

export interface TextProps extends Omit<HTMLAttributes<HTMLElement>, "color"> {
  size?: Size;
  /** Override text color. */
  color?: string;
  weight?: number;
  spacing?: number;
  /** Uppercase transform. */
  upper?: boolean;
  as?: AsElement;
  style?: CSSProperties;
  children?: ReactNode;
}

/**
 * Generic text element. Size, color, transform are CSS-driven; `color`,
 * `weight`, and `spacing` come through as inline-style overrides because they
 * are arbitrary per-instance values.
 */
export const Text = forwardRef<HTMLElement, TextProps>(function Text(
  {
    children,
    size = "md",
    color,
    weight,
    spacing,
    upper,
    as: Tag = "span",
    className,
    style,
    ...props
  },
  ref
) {
  const inline: CSSProperties = {
    ...(color !== undefined ? { color } : {}),
    ...(weight !== undefined ? { fontWeight: weight } : {}),
    ...(spacing !== undefined ? { letterSpacing: spacing } : {}),
    ...style,
  };
  return (
    <Tag
      ref={ref as never}
      className={cx("vf-text", `vf-text--${size}`, upper && "vf-text--upper", className)}
      style={inline}
      {...props}
    >
      {children}
    </Tag>
  );
});
Text.displayName = "Text";

type LabelAsElement = "span" | "label" | "div";

export interface LabelProps extends Omit<HTMLAttributes<HTMLElement>, "color"> {
  color?: string;
  as?: LabelAsElement;
  htmlFor?: string;
  children?: ReactNode;
  style?: CSSProperties;
}

/** Uppercase chrome label. Render as `<label>` + `htmlFor` to associate with a form input. */
export const Label = forwardRef<HTMLElement, LabelProps>(function Label(
  { children, color, className, style, as: Tag = "span", htmlFor, ...props },
  ref
) {
  const labelExtras = Tag === "label" && htmlFor ? ({ htmlFor } as { htmlFor: string }) : {};
  const inline: CSSProperties = color !== undefined ? { color, ...style } : (style ?? {});
  return (
    <Tag
      ref={ref as never}
      className={cx("vf-label", className)}
      style={inline}
      {...labelExtras}
      {...props}
    >
      {children}
    </Tag>
  );
});
Label.displayName = "Label";

export interface DividerProps extends HTMLAttributes<HTMLDivElement> {
  color?: string;
  /** Vertical margin in px. Defaults to `sp6` (12px) via CSS. */
  spacing?: number;
  style?: CSSProperties;
}

/** Horizontal rule using the border system. */
export const Divider = forwardRef<HTMLDivElement, DividerProps>(function Divider(
  { color, spacing, className, style, ...props },
  ref
) {
  const inline: CSSProperties = {
    ...(color !== undefined ? { borderTopColor: color } : {}),
    ...(spacing !== undefined ? { margin: `${spacing}px 0` } : {}),
    ...style,
  };
  return (
    <div
      ref={ref}
      className={cx("vf-divider", className)}
      style={inline}
      {...props}
    />
  );
});
Divider.displayName = "Divider";

export interface SpacerProps extends HTMLAttributes<HTMLDivElement> {
  size?: number;
  style?: CSSProperties;
}

/** Vertical spacer. */
export const Spacer = forwardRef<HTMLDivElement, SpacerProps>(function Spacer(
  { size, className, style, ...props },
  ref
) {
  const inline: CSSProperties = size !== undefined ? { height: size, ...style } : (style ?? {});
  return (
    <div
      ref={ref}
      className={cx("vf-spacer", className)}
      style={inline}
      {...props}
    />
  );
});
Spacer.displayName = "Spacer";
