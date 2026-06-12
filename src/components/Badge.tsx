"use client";

import { Children, cloneElement, forwardRef, isValidElement, memo } from "react";
import type { CSSProperties, HTMLAttributes, ReactElement, ReactNode } from "react";
import { Slot } from "../primitives/Slot";
import { cx } from "../utils/cx";
import { toneAttrs } from "../utils/toneAttrs";
import { warn } from "../utils/warn";

export type BadgeVariant = "solid" | "outline" | "ghost" | "subtle";
export type BadgeTone = "neutral" | "success" | "danger" | "warning" | "info";
export type BadgeSize = "sm" | "md" | "lg";

export interface BadgeProps extends Omit<HTMLAttributes<HTMLSpanElement>, "color"> {
  /** Accent color (hex). Sets `--vf-accent`. */
  color?: string;
  variant?: BadgeVariant;
  tone?: BadgeTone;
  size?: BadgeSize;
  /** Render a leading dot glyph instead of full background. */
  dot?: boolean;
  icon?: ReactNode;
  /** Renders a close button after the label. */
  dismissible?: boolean;
  /** Callback when the close button is clicked. */
  onDismiss?: () => void;
  /** When set, renders the count as the label (ignoring children). */
  count?: number;
  /** When count exceeds this, displays `{overflowCount}+`. */
  overflowCount?: number;
  asChild?: boolean;
  children?: ReactNode;
  style?: CSSProperties;
}

const BadgeImpl = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  {
    children,
    color,
    variant = "solid",
    tone = "neutral",
    size = "md",
    dot,
    icon,
    dismissible,
    onDismiss,
    count,
    overflowCount,
    asChild,
    className,
    style,
    ...props
  },
  ref
) {
  const composedStyle: CSSProperties = {
    ...(color ? ({ "--vf-accent": color } as CSSProperties) : {}),
    ...style,
  };
  const Component = asChild ? Slot : "span";
  const ta = toneAttrs("vf-badge", { tone, variant, size });
  const badgeClass = cx(
    ta.className,
    dot && "vf-badge--with-dot",
    className
  );
  const decorated = (
    <>
      {dot && <span className="vf-badge__dot" aria-hidden="true" />}
      {icon && <span className="vf-badge__icon" aria-hidden="true">{icon}</span>}
      <span className="vf-badge__label">
        {count !== undefined
          ? count > (overflowCount ?? Infinity)
            ? `${overflowCount}+`
            : String(count)
          : children}
      </span>
      {dismissible && (
        <button type="button" className="vf-badge__close" aria-label="Dismiss" onClick={onDismiss}>
          &times;
        </button>
      )}
    </>
  );
  // In asChild mode we pass through to the consumer element but still thread
  // the dot/icon/count/dismissible affordances into its children so those
  // props don't silently disappear.
  if (asChild) {
    const hasAffordance =
      !!dot || !!icon || !!dismissible || count !== undefined;
    let slotChildren: ReactNode = children;
    if (hasAffordance) {
      if (isValidElement(children)) {
        const only = Children.only(children) as ReactElement<{
          children?: ReactNode;
        }>;
        const existing = (only.props as { children?: ReactNode }).children;
        const labelContent =
          count !== undefined
            ? count > (overflowCount ?? Infinity)
              ? `${overflowCount}+`
              : String(count)
            : existing;
        slotChildren = cloneElement(
          only,
          undefined,
          <>
            {dot && <span className="vf-badge__dot" aria-hidden="true" />}
            {icon && <span className="vf-badge__icon" aria-hidden="true">{icon}</span>}
            <span className="vf-badge__label">{labelContent}</span>
            {dismissible && (
              <button
                type="button"
                className="vf-badge__close"
                aria-label="Dismiss"
                onClick={onDismiss}
              >
                &times;
              </button>
            )}
          </>
        );
      } else {
        warn(
          false,
          "<Badge asChild> with dot/icon/count/dismissible requires a single React element child; affordances were dropped."
        );
      }
    }
    return (
      <Component
        ref={ref as never}
        className={badgeClass}
        style={composedStyle}
        {...ta.attrs}
        {...props}
      >
        {slotChildren}
      </Component>
    );
  }
  return (
    <span
      ref={ref}
      className={badgeClass}
      style={composedStyle}
      {...ta.attrs}
      {...props}
    >
      {decorated}
    </span>
  );
});
BadgeImpl.displayName = "Badge";

/**
 * Small categorical label for status chips, counts, and highlights. Tone
 * (`neutral`/`success`/`danger`/`warning`/`info`), variant (`solid`/`outline`/
 * `ghost`/`subtle`), and size knobs. Supports a leading dot glyph, optional
 * icon, dismissible close button, and a `count` + `overflowCount` counter mode.
 */
export const Badge = memo(BadgeImpl);
(Badge as unknown as { displayName: string }).displayName = "Badge";

export interface DotsProps extends HTMLAttributes<HTMLSpanElement> {
  count: number;
  max?: number;
  /** Color (sets `--vf-accent`). */
  color?: string;
  /** Dot font-size in px. */
  size?: number;
  style?: CSSProperties;
}

const DotsImpl = forwardRef<HTMLSpanElement, DotsProps>(function Dots(
  { count, max = 8, color, size, className, style, ...props },
  ref
) {
  const n = Math.min(count, max);
  const composedStyle: CSSProperties = {
    ...(color ? ({ "--vf-accent": color } as CSSProperties) : {}),
    ...(size !== undefined
      ? ({ "--vf-dots-size": `${size}px` } as CSSProperties)
      : {}),
    ...style,
  };
  return (
    <span
      ref={ref}
      className={cx("vf-dots", className)}
      style={composedStyle}
      {...props}
    >
      {Array.from({ length: n }).map((_, i) => (
        <span key={i} className="vf-dots__dot">
          ●
        </span>
      ))}
    </span>
  );
});
DotsImpl.displayName = "Dots";
/**
 * Small row of dots used as a step/progress indicator (e.g. carousel
 * pagination).
 */
export const Dots = memo(DotsImpl);
(Dots as unknown as { displayName: string }).displayName = "Dots";
