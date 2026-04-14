import { forwardRef } from "react";
import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { Slot } from "../primitives/Slot";
import { cx } from "../utils/cx";

export interface BadgeProps extends Omit<HTMLAttributes<HTMLSpanElement>, "color"> {
  /** Accent color (hex). Sets `--vf-accent`. */
  color?: string;
  asChild?: boolean;
  children?: ReactNode;
  style?: CSSProperties;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { children, color, asChild, className, style, ...props },
  ref
) {
  const composedStyle: CSSProperties = {
    ...(color ? ({ "--vf-accent": color } as CSSProperties) : {}),
    ...style,
  };
  const Component = asChild ? Slot : "span";
  return (
    <Component
      ref={ref as never}
      className={cx("vf-badge", className)}
      style={composedStyle}
      {...props}
    >
      {children}
    </Component>
  );
});
Badge.displayName = "Badge";

export interface DotsProps extends HTMLAttributes<HTMLSpanElement> {
  count: number;
  max?: number;
  /** Color (sets `--vf-accent`). */
  color?: string;
  /** Dot font-size in px. */
  size?: number;
  style?: CSSProperties;
}

export const Dots = forwardRef<HTMLSpanElement, DotsProps>(function Dots(
  { count, max = 8, color, size, className, style, ...props },
  ref
) {
  const n = Math.min(count, max);
  const composedStyle: CSSProperties = {
    ...(color ? ({ "--vf-accent": color } as CSSProperties) : {}),
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
        <span
          key={i}
          className="vf-dots__dot"
          style={size !== undefined ? { fontSize: size } : undefined}
        >
          ●
        </span>
      ))}
    </span>
  );
});
Dots.displayName = "Dots";
