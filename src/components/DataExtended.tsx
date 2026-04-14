import { forwardRef, useState } from "react";
import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import type { Side } from "../types";
import { cx } from "../utils/cx";
import { Label } from "./Text";

// ── Avatar ────────────────────────────────────────────────────

export interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  name?: string;
  src?: string;
  size?: number;
  /** Color (sets `--vf-accent`). */
  color?: string;
  style?: CSSProperties;
}

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(function Avatar(
  { name, src, size = 28, color, className, style, ...props },
  ref
) {
  const initials = name
    ? name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "?";
  const composed: CSSProperties = {
    width: size,
    height: size,
    fontSize: size * 0.38,
    ...(color ? ({ "--vf-accent": color } as CSSProperties) : {}),
    ...(src ? { background: "transparent" } : {}),
    ...style,
  };
  return (
    <div ref={ref} className={cx("vf-avatar", className)} style={composed} {...props}>
      {src ? <img src={src} alt={name ?? ""} /> : initials}
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

export const AvatarGroup = forwardRef<HTMLDivElement, AvatarGroupProps>(
  function AvatarGroup({ items, max = 5, size = 28, className, style, ...props }, ref) {
    const visible = items.slice(0, max);
    const overflow = items.length - max;
    return (
      <div ref={ref} className={cx("vf-avatar-group", className)} style={style} {...props}>
        {visible.map((item, i) => (
          <div key={i} style={{ marginLeft: i > 0 ? -8 : 0, zIndex: max - i }}>
            <Avatar {...item} size={size} />
          </div>
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
  events: TimelineEvent[];
  style?: CSSProperties;
}

export const Timeline = forwardRef<HTMLDivElement, TimelineProps>(
  function Timeline({ events, className, style, ...props }, ref) {
    return (
      <div ref={ref} className={cx("vf-timeline", className)} style={style} {...props}>
        {events.map((ev, i) => (
          <div key={i} className="vf-timeline__event">
            <div
              className="vf-timeline__dot"
              style={ev.color ? { background: ev.color } : undefined}
            />
            <div className="vf-timeline__head">
              <span className="vf-timeline__title">{ev.title}</span>
              {ev.time && <Label style={{ flexShrink: 0 }}>{ev.time}</Label>}
            </div>
            {ev.content && <div className="vf-timeline__content">{ev.content}</div>}
          </div>
        ))}
      </div>
    );
  }
);
Timeline.displayName = "Timeline";

// ── Skeleton ──────────────────────────────────────────────────

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  width?: number | string;
  height?: number;
  lines?: number;
  style?: CSSProperties;
}

export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(function Skeleton(
  { width, height = 14, lines = 1, className, style, ...props },
  ref
) {
  return (
    <div
      ref={ref}
      className={cx("vf-skeleton", className)}
      style={style}
      aria-hidden="true"
      {...props}
    >
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
  items: ReactNode[];
  marker?: ReactNode | false;
  gap?: number | string;
  style?: CSSProperties;
}

export const List = forwardRef<HTMLDivElement, ListProps>(function List(
  { items, marker, gap, className, style, ...props },
  ref
) {
  const inline: CSSProperties = {
    ...(gap !== undefined ? { gap: typeof gap === "number" ? `${gap}px` : gap } : {}),
    ...style,
  };
  return (
    <div ref={ref} className={cx("vf-list", className)} style={inline} {...props}>
      {items.map((item, i) => (
        <div key={i} className="vf-list__item">
          {marker !== false && <span className="vf-list__marker">{marker ?? "●"}</span>}
          <div>{item}</div>
        </div>
      ))}
    </div>
  );
});
List.displayName = "List";

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

export const Spinner = forwardRef<HTMLDivElement, SpinnerProps>(function Spinner(
  { size = 16, color, className, style, ...props },
  ref
) {
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
Spinner.displayName = "Spinner";
