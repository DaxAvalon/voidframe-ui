"use client";

// Phase 14 — Icon primitive
//
// Monoline, 1px stroke, square caps, miter joins. Drawn on 24x24 grid.
// Sizes follow the framework's t-shirt scale: xs=12, sm=14, md=16, lg=20,
// xl=24, xxl=32. Icons are decorative by default; supplying `label`
// promotes them to img role with that accessible name.

import { forwardRef, type ReactNode, type SVGProps } from "react";
import { cx } from "../utils/cx";

export type IconSize = "xs" | "sm" | "md" | "lg" | "xl" | "xxl";

const SIZE_MAP: Record<IconSize, number> = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
};

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, "children"> {
  size?: IconSize | number;
  color?: string;
  strokeWidth?: number;
  /** Accessible name. If omitted, icon is marked decorative (aria-hidden). */
  label?: string;
  /** Force decorative (aria-hidden) even when label is provided. */
  decorative?: boolean;
  /**
   * Marks this icon as direction-sensitive. CSS mirrors it automatically
   * under `[dir="rtl"]`.
   */
  directional?: boolean;
  flipX?: boolean;
  flipY?: boolean;
  rotate?: 0 | 90 | 180 | 270;
  /** Continuous rotation. Disabled under prefers-reduced-motion. */
  spin?: boolean;
  /** Opacity pulse. Disabled under prefers-reduced-motion. */
  pulse?: boolean;
  children?: ReactNode;
}

export const Icon = forwardRef<SVGSVGElement, IconProps>(function Icon(
  {
    size = "md",
    color,
    strokeWidth = 1,
    label,
    decorative,
    directional,
    flipX,
    flipY,
    rotate,
    spin,
    pulse,
    className,
    style,
    viewBox = "0 0 24 24",
    children,
    ...props
  },
  ref
) {
  const dim = typeof size === "number" ? size : SIZE_MAP[size];
  const sizeClass =
    typeof size === "string" ? `vf-icon--${size}` : undefined;
  const hidden = decorative || !label;
  const transforms: string[] = [];
  if (flipX) transforms.push("scaleX(-1)");
  if (flipY) transforms.push("scaleY(-1)");
  if (rotate) transforms.push(`rotate(${rotate}deg)`);
  const composedStyle = {
    ...(color ? { color } : {}),
    ...(transforms.length ? { transform: transforms.join(" ") } : {}),
    ...style,
  };
  return (
    <svg
      ref={ref}
      className={cx(
        "vf-icon",
        sizeClass,
        directional && "vf-icon--directional",
        spin && "vf-icon--spin",
        pulse && "vf-icon--pulse",
        className
      )}
      width={dim}
      height={dim}
      viewBox={viewBox}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="square"
      strokeLinejoin="miter"
      role={hidden ? undefined : "img"}
      aria-hidden={hidden || undefined}
      aria-label={hidden ? undefined : label}
      data-directional={directional ? "true" : undefined}
      style={composedStyle}
      {...props}
    >
      {children}
    </svg>
  );
});
Icon.displayName = "Icon";
