"use client";

import { forwardRef, memo } from "react";
import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils/cx";

export interface NotificationBadgeProps
  extends HTMLAttributes<HTMLSpanElement> {
  /** Number to display in the badge. */
  count?: number;
  /** Maximum count before showing `{max}+`. Default 99. */
  max?: number;
  /** Show a dot instead of a count. */
  dot?: boolean;
  /** Show badge even when count is 0. Default false. */
  showZero?: boolean;
  /** Pixel offset from default corner position as [x, y]. */
  offset?: [number, number];
  /** Override badge color (sets `--vf-accent` on the indicator). */
  color?: string;
  /** Badge indicator size. */
  size?: "sm" | "md";
  /** The element the badge is overlaid on. */
  children?: ReactNode;
}

const NotificationBadgeImpl = forwardRef<HTMLSpanElement, NotificationBadgeProps>(
  function NotificationBadge(
    {
      count,
      max = 99,
      dot = false,
      showZero = false,
      offset,
      color,
      size = "md",
      children,
      className,
      style,
      ...props
    },
    ref
  ) {
    const hasChildren = children != null;
    const normalizedCount = count !== undefined && count < 0 ? 0 : count;
    const isVisible =
      dot || (normalizedCount !== undefined && (normalizedCount > 0 || showZero));

    let displayText: string | undefined;
    if (!dot && normalizedCount !== undefined) {
      displayText =
        normalizedCount > max ? `${max}+` : String(normalizedCount);
    }

    const ariaLabel = dot
      ? "New notification"
      : normalizedCount !== undefined
        ? `${normalizedCount} notification${normalizedCount === 1 ? "" : "s"}`
        : undefined;

    const indicatorStyle: CSSProperties = {
      ...(color ? ({ "--vf-accent": color } as CSSProperties) : {}),
      ...(offset
        ? { top: `${-offset[1]}px`, right: `${-offset[0]}px` }
        : {}),
    };

    const indicatorClass = cx(
      "vf-notification-badge__indicator",
      dot && "vf-notification-badge__indicator--dot",
      !isVisible && "vf-notification-badge__indicator--hidden"
    );

    const rootClass = cx(
      "vf-notification-badge",
      `vf-notification-badge--${size}`,
      !hasChildren && "vf-notification-badge--standalone",
      className
    );

    return (
      <span
        ref={ref}
        className={rootClass}
        style={style}
        {...props}
      >
        {children}
        <span
          className={indicatorClass}
          style={indicatorStyle}
          aria-label={ariaLabel}
        >
          {!dot && isVisible ? displayText : null}
        </span>
      </span>
    );
  }
);
NotificationBadgeImpl.displayName = "NotificationBadge";
/**
 * Small numeric or dot badge overlay for a host element (e.g. a bell icon).
 * Hides at zero by default.
 */
export const NotificationBadge = memo(NotificationBadgeImpl);
(NotificationBadge as unknown as { displayName: string }).displayName =
  "NotificationBadge";
