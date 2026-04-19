"use client";

import { forwardRef } from "react";
import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { Slot } from "../primitives/Slot";
import { cx } from "../utils/cx";
import { Label } from "./Text";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  headerRight?: ReactNode;
  padding?: number;
  /** Adds hover elevation effect via CSS class. */
  hoverable?: boolean;
  /** Renders in a footer actions slot after children. */
  actions?: ReactNode;
  asChild?: boolean;
  children?: ReactNode;
  style?: CSSProperties;
}

/**
 * Brutalist content container with a bordered surface. Optional `title` /
 * `subtitle` / `headerRight` header slot and `actions` footer slot. Use
 * `hoverable` for a lift-on-hover effect, or `asChild` to render a custom
 * element (link, button) while keeping card styling.
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { children, title, subtitle, padding, headerRight, hoverable, actions, asChild, className, style, ...props },
  ref
) {
  const composedStyle: CSSProperties =
    padding !== undefined ? { padding, ...style } : (style ?? {});

  if (asChild) {
    return (
      <Slot
        ref={ref as never}
        className={cx("vf-card", className)}
        style={composedStyle}
        {...props}
      >
        {children}
      </Slot>
    );
  }

  return (
    <div ref={ref} className={cx("vf-card", hoverable && "vf-card--hoverable", className)} style={composedStyle} {...props}>
      {(title || subtitle || headerRight) && (
        <div className="vf-card__header">
          <div>
            {title && <Label>{title}</Label>}
            {subtitle && <div className="vf-card__subtitle">{subtitle}</div>}
          </div>
          {headerRight}
        </div>
      )}
      {children}
      {actions && <div className="vf-card__actions">{actions}</div>}
    </div>
  );
});
Card.displayName = "Card";

export interface ScrollRowProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  gap?: number | string;
  style?: CSSProperties;
}

export const ScrollRow = forwardRef<HTMLDivElement, ScrollRowProps>(
  function ScrollRow({ children, gap, className, style, ...props }, ref) {
    const inline: CSSProperties = {
      ...(gap !== undefined ? { gap: typeof gap === "number" ? `${gap}px` : gap } : {}),
      ...style,
    };
    return (
      <div ref={ref} className={cx("vf-scroll-row", className)} style={inline} {...props}>
        {children}
      </div>
    );
  }
);
ScrollRow.displayName = "ScrollRow";

export interface StatusBarItem {
  label?: string;
  value?: string;
  color?: string;
}

export interface StatusBarProps extends HTMLAttributes<HTMLDivElement> {
  items: StatusBarItem[];
  style?: CSSProperties;
}

export const StatusBar = forwardRef<HTMLDivElement, StatusBarProps>(
  function StatusBar({ items, className, style, ...props }, ref) {
    return (
      <div ref={ref} className={cx("vf-status-bar", className)} style={style} {...props}>
        {items.map((item, i) => (
          <div key={i} className="vf-status-bar__item">
            {i > 0 && <span className="vf-status-bar__sep">│</span>}
            {item.label && <Label>{item.label}</Label>}
            {item.value && (
              <span
                className="vf-status-bar__value"
                style={item.color ? { color: item.color } : undefined}
              >
                {item.value}
              </span>
            )}
          </div>
        ))}
      </div>
    );
  }
);
StatusBar.displayName = "StatusBar";

export interface SegmentBarSegment {
  label: string;
  span: number;
  color?: string;
}

export interface SegmentBarProps extends HTMLAttributes<HTMLDivElement> {
  segments: SegmentBarSegment[];
  style?: CSSProperties;
}

export const SegmentBar = forwardRef<HTMLDivElement, SegmentBarProps>(
  function SegmentBar({ segments, className, style, ...props }, ref) {
    const total = segments.reduce((s, seg) => s + seg.span, 0);
    return (
      <div ref={ref} className={cx("vf-segment-bar", className)} style={style} {...props}>
        {segments.map((seg, i) => (
          <div
            key={i}
            className="vf-segment-bar__segment"
            style={{
              width: `${(seg.span / total) * 100}%`,
              ...(seg.color ? { borderBottomColor: seg.color } : {}),
            }}
          >
            {seg.label}
          </div>
        ))}
      </div>
    );
  }
);
SegmentBar.displayName = "SegmentBar";
