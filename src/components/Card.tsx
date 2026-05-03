"use client";

import { forwardRef, useId as useReactId } from "react";
import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { Slot } from "../primitives/Slot";
import { useDisclosure } from "../hooks/useDisclosure";
import { cx } from "../utils/cx";
import { Label } from "./Text";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  headerRight?: ReactNode;
  padding?: number;
  /** Adds hover elevation effect via CSS class. */
  hoverable?: boolean;
  /**
   * When true, renders the card body in a monospace font stack with a
   * slightly reduced size. Intended for CI log output, prompt dumps, raw
   * JSON traces, code snippets pasted into a card, etc.
   */
  monospace?: boolean;
  /** Renders in a footer actions slot after children. */
  actions?: ReactNode;
  /**
   * When true, renders the card header as a clickable disclosure toggle so
   * the body collapses in-place. Mirrors `Sidebar.Section` / `Accordion`
   * collapse semantics without reparenting the content. Controllable via
   * `open` + `onOpenChange`; uncontrolled via `defaultOpen`.
   */
  collapsible?: boolean;
  /** Controlled open state (only meaningful when `collapsible`). */
  open?: boolean;
  /** Uncontrolled initial open state (only meaningful when `collapsible`). Default true. */
  defaultOpen?: boolean;
  /** Fires when the open state changes. */
  onOpenChange?: (open: boolean) => void;
  asChild?: boolean;
  children?: ReactNode;
  style?: CSSProperties;
}

/**
 * Brutalist content container with a bordered surface. Optional `title` /
 * `subtitle` / `headerRight` header slot and `actions` footer slot. Use
 * `hoverable` for a lift-on-hover effect, `monospace` for log/code content,
 * or `asChild` to render a custom element (link, button) while keeping card
 * styling.
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  {
    children,
    title,
    subtitle,
    padding,
    headerRight,
    hoverable,
    monospace,
    actions,
    collapsible,
    open,
    defaultOpen = true,
    onOpenChange,
    asChild,
    className,
    style,
    ...props
  },
  ref
) {
  const composedStyle: CSSProperties =
    padding !== undefined ? { padding, ...style } : (style ?? {});
  const disclosure = useDisclosure({
    open: collapsible ? open : undefined,
    defaultOpen: collapsible ? defaultOpen : true,
    onOpenChange: collapsible ? onOpenChange : undefined,
  });
  const showBody = !collapsible || disclosure.open;
  const reactId = useReactId();
  const bodyId = `vf-card-${reactId}-body`;
  const titleId = `vf-card-${reactId}-title`;

  if (asChild) {
    return (
      <Slot
        ref={ref as never}
        className={cx(
          "vf-card",
          monospace && "vf-card--monospace",
          className
        )}
        style={composedStyle}
        {...props}
      >
        {children}
      </Slot>
    );
  }

  return (
    <div
      ref={ref}
      className={cx(
        "vf-card",
        hoverable && "vf-card--hoverable",
        monospace && "vf-card--monospace",
        collapsible && "vf-card--collapsible",
        className
      )}
      data-open={collapsible ? disclosure.open : undefined}
      style={composedStyle}
      {...props}
    >
      {(title || subtitle || headerRight) && (
        <div className="vf-card__header">
          {collapsible ? (
            <button
              type="button"
              className="vf-card__toggle"
              aria-expanded={disclosure.open}
              aria-controls={bodyId}
              onClick={disclosure.toggle}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--vf-sp-2)",
                background: "transparent",
                border: 0,
                font: "inherit",
                color: "inherit",
                padding: 0,
                cursor: "pointer",
                textAlign: "left",
                flex: 1,
              }}
            >
              <span aria-hidden="true">{disclosure.open ? "▾" : "▸"}</span>
              <div>
                {title && <Label id={titleId}>{title}</Label>}
                {subtitle && <div className="vf-card__subtitle">{subtitle}</div>}
              </div>
            </button>
          ) : (
            <div>
              {title && <Label id={titleId}>{title}</Label>}
              {subtitle && <div className="vf-card__subtitle">{subtitle}</div>}
            </div>
          )}
          {headerRight}
        </div>
      )}
      {showBody && (
        <div
          id={bodyId}
          role={collapsible ? "region" : undefined}
          aria-labelledby={collapsible && title ? titleId : undefined}
        >
          {children}
        </div>
      )}
      {showBody && actions && <div className="vf-card__actions">{actions}</div>}
    </div>
  );
});
Card.displayName = "Card";

export interface ScrollRowProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  gap?: number | string;
  style?: CSSProperties;
}

/**
 * Horizontally-scrolling row with overflow fading. Good for chip / card
 * rows.
 */
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

/**
 * Bottom status bar (e.g. for an editor / IDE-style UI). Renders items with
 * icons and text.
 */
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

/**
 * Horizontal bar divided into labelled segments, sized by a weight. Good for
 * status/health breakdowns.
 */
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
