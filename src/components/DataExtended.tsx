"use client";

import { forwardRef, memo, useState } from "react";
import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import type { Side } from "../types";
import { cx } from "../utils/cx";
import { deprecatedComponent } from "../utils/deprecate";
import { Label } from "./Text";

// ── Avatar utilities ─────────────────────────────────────────

export function avatarColorFromName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
    hash &= hash;
  }
  const hue = ((hash % 360) + 360) % 360;
  return `hsl(${hue}, 55%, 45%)`;
}

// ── Avatar ────────────────────────────────────────────────────

export type AvatarStatus = "online" | "offline" | "away" | "busy";

export interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  name?: string;
  src?: string;
  size?: number;
  /** Color (sets `--vf-accent`). */
  color?: string;
  /** Explicit fallback text (overrides derived initials). */
  fallback?: string;
  status?: AvatarStatus;
  /** Render a square (non-rounded) avatar. */
  square?: boolean;
  style?: CSSProperties;
}

/**
 * Circular or rounded image for a person or entity with initial / icon
 * fallback. Sizes (`xs`-`xl`), tones, and `loading="lazy" | "eager"` pass
 * through to the underlying `<img>`.
 */
export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(function Avatar(
  { name, src, size = 28, color, fallback, status, square, className, style, ...props },
  ref
) {
  const [imgErrored, setImgErrored] = useState(false);
  const initials =
    fallback ??
    (name
      ? name
          .split(" ")
          .map((w) => w[0])
          .join("")
          .slice(0, 2)
          .toUpperCase()
      : "?");
  const showImg = src && !imgErrored;
  const composed: CSSProperties = {
    width: size,
    height: size,
    fontSize: size * 0.38,
    ...(color ? ({ "--vf-accent": color } as CSSProperties) : {}),
    ...(showImg ? { background: "transparent" } : {}),
    ...style,
  };
  return (
    <div
      ref={ref}
      className={cx(
        "vf-avatar",
        square && "vf-avatar--square",
        className
      )}
      style={composed}
      {...props}
    >
      {showImg ? (
        <img src={src} alt={name ?? ""} onError={() => setImgErrored(true)} />
      ) : (
        initials
      )}
      {status && (
        <span
          aria-label={`status ${status}`}
          className={cx("vf-avatar__status", `vf-avatar__status--${status}`)}
        />
      )}
    </div>
  );
});
Avatar.displayName = "Avatar";

// ── AvatarGroup ───────────────────────────────────────────────

export interface AvatarGroupProps extends HTMLAttributes<HTMLDivElement> {
  items: AvatarProps[];
  max?: number;
  size?: number;
  style?: CSSProperties;
}

/**
 * Overlapping stack of `Avatar`s with an optional `+N` overflow chip. `max`
 * caps the visible count; the rest collapse into the overflow indicator.
 */
export const AvatarGroup = forwardRef<HTMLDivElement, AvatarGroupProps>(
  function AvatarGroup({ items, max = 5, size = 28, className, style, ...props }, ref) {
    const visible = items.slice(0, max);
    const overflow = items.length - max;
    return (
      <div ref={ref} className={cx("vf-avatar-group", className)} style={style} {...props}>
        {visible.map((item, i) => (
          <Avatar
            key={i}
            {...item}
            size={size}
            style={{
              ...(item.style ?? {}),
              zIndex: max - i,
            }}
          />
        ))}
        {overflow > 0 && (
          <div
            className="vf-avatar-group__overflow"
            style={{ width: size, height: size, fontSize: size * 0.35 }}
          >
            +{overflow}
          </div>
        )}
      </div>
    );
  }
);
AvatarGroup.displayName = "AvatarGroup";

// ── Tag ───────────────────────────────────────────────────────

export interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  children?: ReactNode;
  /** Sets `--vf-accent`. */
  color?: string;
  onRemove?: () => void;
  style?: CSSProperties;
}

/**
 * Small removable label chip with optional leading icon. Emits `onRemove`
 * when the dismiss button is clicked.
 */
export const Tag = forwardRef<HTMLSpanElement, TagProps>(function Tag(
  { children, color, onRemove, className, style, ...props },
  ref
) {
  const composed: CSSProperties = color
    ? ({ "--vf-accent": color, ...style } as CSSProperties)
    : (style ?? {});
  return (
    <span ref={ref} className={cx("vf-tag", className)} style={composed} {...props}>
      {children}
      {onRemove && (
        <span className="vf-tag__remove" onClick={onRemove}>
          ×
        </span>
      )}
    </span>
  );
});
Tag.displayName = "Tag";

// ── Tooltip ───────────────────────────────────────────────────

export interface TooltipProps {
  children: ReactNode;
  content: ReactNode;
  position?: Side;
  className?: string;
  style?: CSSProperties;
}

/**
 * Small text popover anchored to a trigger on hover / focus. Install one
 * `TooltipProvider` near the app root to coordinate delays.
 */
export const Tooltip = forwardRef<HTMLDivElement, TooltipProps>(function Tooltip(
  { children, content, position = "top", className, style },
  ref
) {
  const [show, setShow] = useState(false);
  return (
    <div
      ref={ref}
      className={cx("vf-tooltip__anchor", className)}
      style={style}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <div role="tooltip" className={cx("vf-tooltip__bubble", `vf-tooltip__bubble--${position}`)}>
          {content}
        </div>
      )}
    </div>
  );
});
Tooltip.displayName = "Tooltip";

// ── Code ──────────────────────────────────────────────────────

export interface CodeProps extends HTMLAttributes<HTMLElement> {
  children?: ReactNode;
  inline?: boolean;
  style?: CSSProperties;
}

/**
 * Inline monospace code span with optional language badge. For multi-line
 * blocks use `CodeBlock`.
 */
export const Code = forwardRef<HTMLElement, CodeProps>(function Code(
  { children, inline, className, style, ...props },
  ref
) {
  if (inline) {
    return (
      <code
        ref={ref as never}
        className={cx("vf-code--inline", className)}
        style={style}
        {...props}
      >
        {children}
      </code>
    );
  }
  return (
    <pre
      ref={ref as never}
      className={cx("vf-code--block", className)}
      style={style}
      {...props}
    >
      {children}
    </pre>
  );
});
Code.displayName = "Code";

// ── Timeline ──────────────────────────────────────────────────

export interface TimelineEvent {
  title: string;
  time?: string;
  content?: ReactNode;
  color?: string;
}

export interface TimelineProps extends HTMLAttributes<HTMLDivElement> {
  /** Legacy events array. Compound `<Timeline.Item>` children are preferred. */
  events?: TimelineEvent[];
  orientation?: "vertical" | "horizontal";
  children?: ReactNode;
  style?: CSSProperties;
}

const TimelineBase = forwardRef<HTMLDivElement, TimelineProps>(
  function Timeline(
    { events, className, style, orientation = "vertical", children, ...props },
    ref
  ) {
    return (
      <div
        ref={ref}
        className={cx(
          "vf-timeline",
          `vf-timeline--${orientation}`,
          className
        )}
        style={style}
        {...props}
      >
        {events
          ? events.map((ev, i) => (
              <div key={i} className="vf-timeline__event">
                <div
                  className="vf-timeline__dot"
                  style={ev.color ? { background: ev.color } : undefined}
                />
                <div className="vf-timeline__head">
                  <span className="vf-timeline__title">{ev.title}</span>
                  {ev.time && <Label style={{ flexShrink: 0 }}>{ev.time}</Label>}
                </div>
                {ev.content && (
                  <div className="vf-timeline__content">{ev.content}</div>
                )}
              </div>
            ))
          : children}
      </div>
    );
  }
);
TimelineBase.displayName = "Timeline";

export interface TimelineItemProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  time?: ReactNode;
  icon?: ReactNode;
  tone?: "neutral" | "success" | "warning" | "danger";
  title?: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
}

const TimelineItemComponent = forwardRef<HTMLDivElement, TimelineItemProps>(
  function TimelineItem(
    { time, icon, tone = "neutral", title, description, children, className, ...props },
    ref
  ) {
    return (
      <div
        ref={ref}
        className={cx(
          "vf-timeline__event",
          `vf-timeline__event--${tone}`,
          className
        )}
        {...props}
      >
        <div className="vf-timeline__dot" aria-hidden="true">
          {icon}
        </div>
        <div className="vf-timeline__body">
          <div className="vf-timeline__head">
            {title && <span className="vf-timeline__title">{title}</span>}
            {time && <Label style={{ flexShrink: 0 }}>{time}</Label>}
          </div>
          {(description || children) && (
            <div className="vf-timeline__content">{description ?? children}</div>
          )}
        </div>
      </div>
    );
  }
);
TimelineItemComponent.displayName = "TimelineItem";

/**
 * Vertical timeline with dotted axis and event cards. Each item has time,
 * title, optional body.
 */
export const Timeline = Object.assign(TimelineBase, {
  Item: TimelineItemComponent,
});

// ── Skeleton ──────────────────────────────────────────────────

export type SkeletonShape = "rect" | "circle" | "text";
export type SkeletonAnimation = "pulse" | "shimmer" | "none";

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  width?: number | string;
  height?: number | string;
  lines?: number;
  shape?: SkeletonShape;
  animation?: SkeletonAnimation;
  style?: CSSProperties;
}

/**
 * Rectangle shimmer placeholder used while content loads. Composed into
 * `SkeletonText`, `SkeletonAvatar`, etc.
 */
export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(function Skeleton(
  {
    width,
    height = 14,
    lines = 1,
    shape = "text",
    animation = "pulse",
    className,
    style,
    ...props
  },
  ref
) {
  const sharedProps = {
    className: cx(
      "vf-skeleton",
      `vf-skeleton--${shape}`,
      `vf-skeleton--anim-${animation}`,
      className
    ),
    "aria-hidden": true as const,
  };
  if (shape !== "text") {
    const merged: CSSProperties = {
      width: width ?? (shape === "circle" ? height : "100%"),
      height,
      ...style,
    };
    return <div ref={ref} {...sharedProps} style={merged} {...props} />;
  }
  return (
    <div ref={ref} {...sharedProps} style={style} {...props}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="vf-skeleton__line"
          style={{
            width: i === lines - 1 && lines > 1 ? "60%" : (width ?? "100%"),
            height,
          }}
        />
      ))}
    </div>
  );
});
Skeleton.displayName = "Skeleton";

// ── EmptyState ────────────────────────────────────────────────

export interface EmptyStateProps extends HTMLAttributes<HTMLDivElement> {
  icon?: ReactNode;
  title?: string;
  description?: string;
  action?: ReactNode;
  style?: CSSProperties;
}

/**
 * Centred illustration + title + description + optional action. Use when a
 * list/table/view has no data yet.
 */
export const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(
  function EmptyState({ icon, title, description, action, className, style, ...props }, ref) {
    return (
      <div ref={ref} className={cx("vf-empty-state", className)} style={style} {...props}>
        {icon && <div className="vf-empty-state__icon">{icon}</div>}
        {title && <div className="vf-empty-state__title">{title}</div>}
        {description && <div className="vf-empty-state__desc">{description}</div>}
        {action && <div className="vf-empty-state__action">{action}</div>}
      </div>
    );
  }
);
EmptyState.displayName = "EmptyState";

// ── List ──────────────────────────────────────────────────────

export interface ListProps extends HTMLAttributes<HTMLDivElement> {
  /** Legacy array API. Compound `<List.Item>` children are preferred. */
  items?: ReactNode[];
  marker?: ReactNode | false;
  gap?: number | string;
  style?: CSSProperties;
  children?: ReactNode;
}

const ListBase = forwardRef<HTMLDivElement, ListProps>(function List(
  { items, marker, gap, className, style, children, ...props },
  ref
) {
  const inline: CSSProperties = {
    ...(gap !== undefined ? { gap: typeof gap === "number" ? `${gap}px` : gap } : {}),
    ...style,
  };
  return (
    <div ref={ref} className={cx("vf-list", className)} style={inline} {...props}>
      {items
        ? items.map((item, i) => (
            <div key={i} className="vf-list__item">
              {marker !== false && (
                <span className="vf-list__marker">{marker ?? "●"}</span>
              )}
              <div>{item}</div>
            </div>
          ))
        : children}
    </div>
  );
});
ListBase.displayName = "List";

export interface ListItemProps extends HTMLAttributes<HTMLDivElement> {
  leading?: ReactNode;
  trailing?: ReactNode;
  children?: ReactNode;
}

const ListItemComponent = forwardRef<HTMLDivElement, ListItemProps>(
  function ListItem({ leading, trailing, className, children, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cx("vf-list__item", "vf-list__item--compound", className)}
        {...props}
      >
        {leading && <span className="vf-list__leading">{leading}</span>}
        <span className="vf-list__content">{children}</span>
        {trailing && <span className="vf-list__trailing">{trailing}</span>}
      </div>
    );
  }
);
ListItemComponent.displayName = "ListItem";

/**
 * Vertical list with configurable separators, density, and selection.
 * Compound: `List.Item`.
 */
export const List = Object.assign(ListBase, { Item: ListItemComponent });

// ── KeyValue ──────────────────────────────────────────────────

export interface KeyValueItem {
  key: string;
  value: ReactNode;
  color?: string;
}

export interface KeyValueProps extends HTMLAttributes<HTMLDivElement> {
  items: KeyValueItem[];
  style?: CSSProperties;
}

/**
 * Single label/value row. Used inside `DataList` / `Descriptions`;
 * standalone for inline metadata.
 */
export const KeyValue = forwardRef<HTMLDivElement, KeyValueProps>(function KeyValue(
  { items, className, style, ...props },
  ref
) {
  return (
    <div ref={ref} className={cx("vf-kv", className)} style={style} {...props}>
      {items.map((item, i) => (
        <div key={i} className="vf-kv__row">
          <Label>{item.key}</Label>
          <span
            className="vf-kv__value"
            style={item.color ? { color: item.color } : undefined}
          >
            {item.value}
          </span>
        </div>
      ))}
    </div>
  );
});
KeyValue.displayName = "KeyValue";

// ── Spinner ───────────────────────────────────────────────────

export interface SpinnerProps extends HTMLAttributes<HTMLDivElement> {
  size?: number;
  /** Sets `--vf-spinner-color`. */
  color?: string;
  style?: CSSProperties;
}

/** @deprecated Use `SpinnerV2` from `voidframe` instead. Will be removed in v1.1. */
const SpinnerImpl = forwardRef<HTMLDivElement, SpinnerProps>(function Spinner(
  { size = 16, color, className, style, ...props },
  ref
) {
  deprecatedComponent("Spinner", "SpinnerV2", "v1.1");
  const composed: CSSProperties = {
    width: size,
    height: size,
    ...(color ? ({ "--vf-spinner-color": color } as CSSProperties) : {}),
    ...style,
  };
  return (
    <div
      ref={ref}
      className={cx("vf-spinner", className)}
      style={composed}
      role="status"
      aria-label="Loading"
      {...props}
    />
  );
});
SpinnerImpl.displayName = "Spinner";
/**
 * Animated loading spinner. Respects `prefers-reduced-motion`; sizes
 * configurable.
 */
export const Spinner = memo(SpinnerImpl);
(Spinner as unknown as { displayName: string }).displayName = "Spinner";
