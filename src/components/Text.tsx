"use client";

import { forwardRef, memo } from "react";
import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { Slot } from "../primitives/Slot";
import type { Size } from "../types";
import { cx } from "../utils/cx";
import { useResponsive, type Responsive } from "../responsive";

type AsElement = "span" | "div" | "p" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

/**
 * Pre-baked responsive size ladders. `responsive-xl` = { base: lg, md: xl,
 * xl: xxl } — intended for Heading-ish use cases where a single prop
 * should scale automatically across breakpoints.
 */
export const RESPONSIVE_SIZE_PRESETS = {
  "responsive-sm": { base: "xs", md: "sm" },
  "responsive-md": { base: "sm", md: "md" },
  "responsive-lg": { base: "md", md: "lg" },
  "responsive-xl": { base: "lg", md: "xl", xl: "xxl" },
  "responsive-xxl": { base: "xl", md: "xxl", xl: "3xl" },
} as const satisfies Record<string, Partial<Record<string, Size>>>;

export type ResponsiveSizePreset = keyof typeof RESPONSIVE_SIZE_PRESETS;

export type TextSize = Size | ResponsiveSizePreset | Responsive<Size>;

export interface TextProps extends Omit<HTMLAttributes<HTMLElement>, "color"> {
  size?: TextSize;
  /** Override text color. */
  color?: string;
  weight?: number;
  spacing?: number;
  /** Uppercase transform. */
  upper?: boolean;
  as?: AsElement;
  /** Render through `<Slot>` and merge props onto a single child element. */
  asChild?: boolean;
  style?: CSSProperties;
  children?: ReactNode;
}

/**
 * Generic text element. Size, color, transform are CSS-driven; `color`,
 * `weight`, and `spacing` come through as inline-style overrides because they
 * are arbitrary per-instance values. Supports polymorphic `as` for choosing
 * an intrinsic tag, or `asChild` to merge styling onto a consumer-provided
 * element (e.g. a router link).
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
    asChild,
    className,
    style,
    ...props
  },
  ref
) {
  const resolvedSize = useResolvedTextSize(size);
  const inline: CSSProperties = {
    ...(color !== undefined ? { color } : {}),
    ...(weight !== undefined ? { fontWeight: weight } : {}),
    ...(spacing !== undefined ? { letterSpacing: spacing } : {}),
    ...style,
  };
  const composedClass = cx(
    "vf-text",
    `vf-text--${resolvedSize}`,
    upper && "vf-text--upper",
    className
  );
  if (asChild) {
    return (
      <Slot
        ref={ref as never}
        className={composedClass}
        style={inline}
        {...props}
      >
        {children}
      </Slot>
    );
  }
  return (
    <Tag
      ref={ref as never}
      className={composedClass}
      style={inline}
      {...props}
    >
      {children}
    </Tag>
  );
});
Text.displayName = "Text";

function useResolvedTextSize(size: TextSize): Size {
  const normalized: Responsive<Size> =
    typeof size === "string" && size in RESPONSIVE_SIZE_PRESETS
      ? (RESPONSIVE_SIZE_PRESETS[size as ResponsiveSizePreset] as Responsive<Size>)
      : (size as Responsive<Size>);
  const resolved = useResponsive<Size>(normalized);
  return resolved ?? "md";
}

type LabelAsElement = "span" | "label" | "div";

export interface LabelProps extends Omit<HTMLAttributes<HTMLElement>, "color"> {
  color?: string;
  as?: LabelAsElement;
  htmlFor?: string;
  children?: ReactNode;
  style?: CSSProperties;
}

/** Uppercase chrome label. Render as `<label>` + `htmlFor` to associate with a form input. */
const LabelImpl = forwardRef<HTMLElement, LabelProps>(function Label(
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
LabelImpl.displayName = "Label";
/**
 * Accessible form label that associates with its control via `htmlFor`.
 * `<Field>` wires this automatically.
 */
export const Label = memo(LabelImpl);
(Label as unknown as { displayName: string }).displayName = "Label";

export interface DividerProps extends HTMLAttributes<HTMLDivElement> {
  color?: string;
  /** Vertical margin in px. Defaults to `sp6` (12px) via CSS. */
  spacing?: number;
  /** Orientation. Default "horizontal". */
  orientation?: "horizontal" | "vertical";
  /** Optional inline label centered on the rule (horizontal only). */
  label?: ReactNode;
  style?: CSSProperties;
}

/** Horizontal or vertical rule; can wrap a label inline for "OR"-style separators. */
const DividerImpl = forwardRef<HTMLDivElement, DividerProps>(function Divider(
  { color, spacing, orientation = "horizontal", label, className, style, ...props },
  ref
) {
  const inline: CSSProperties = {
    ...(color !== undefined
      ? orientation === "vertical"
        ? { borderInlineStartColor: color }
        : { borderTopColor: color }
      : {}),
    ...(spacing !== undefined
      ? orientation === "vertical"
        ? { margin: `0 ${spacing}px` }
        : { margin: `${spacing}px 0` }
      : {}),
    ...style,
  };
  if (orientation === "horizontal" && label !== undefined) {
    return (
      <div
        ref={ref}
        role="separator"
        aria-orientation="horizontal"
        className={cx("vf-divider", "vf-divider--labeled", className)}
        style={inline}
        {...props}
      >
        <span className="vf-divider__label">{label}</span>
      </div>
    );
  }
  return (
    <div
      ref={ref}
      role="separator"
      aria-orientation={orientation}
      className={cx(
        "vf-divider",
        orientation === "vertical" && "vf-divider--vertical",
        className
      )}
      style={inline}
      {...props}
    />
  );
});
DividerImpl.displayName = "Divider";
/**
 * Horizontal or vertical rule used to separate groups of content. Optional
 * `label` renders a centred caption break.
 */
export const Divider = memo(DividerImpl);
(Divider as unknown as { displayName: string }).displayName = "Divider";

export interface SpacerProps extends HTMLAttributes<HTMLDivElement> {
  size?: number;
  style?: CSSProperties;
}

/** Vertical spacer. */
const SpacerImpl = forwardRef<HTMLDivElement, SpacerProps>(function Spacer(
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
SpacerImpl.displayName = "Spacer";
/**
 * Layout wrapper that fills the free space in a flex row/column. Use between
 * children to push them apart.
 */
export const Spacer = memo(SpacerImpl);
(Spacer as unknown as { displayName: string }).displayName = "Spacer";
