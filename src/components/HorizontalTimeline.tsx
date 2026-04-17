"use client";

import { forwardRef, memo, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../utils/cx";

export interface HorizontalTimelineEvent {
  key: string;
  label: string;
  date?: string;
  description?: string;
  icon?: ReactNode;
  status?: "completed" | "active" | "pending" | "error";
}

export interface HorizontalTimelineProps extends HTMLAttributes<HTMLDivElement> {
  events: HorizontalTimelineEvent[];
  activeKey?: string;
  onEventClick?: (key: string) => void;
  scrollable?: boolean;
  connector?: "line" | "arrow" | "dots";
  size?: "sm" | "md";
}

const defaultIcons: Record<string, string> = {
  completed: "\u2713",
  active: "\u25CF",
  pending: "\u25CB",
  error: "\u2717",
};

const HorizontalTimelineImpl = forwardRef<
  HTMLDivElement,
  HorizontalTimelineProps
>(function HorizontalTimeline(
  {
    events,
    activeKey,
    onEventClick,
    scrollable = false,
    connector = "line",
    size = "md",
    className,
    style,
    ...props
  },
  ref
) {
  return (
    <div
      ref={ref}
      className={cx(
        "vf-htimeline",
        `vf-htimeline--${size}`,
        `vf-htimeline--connector-${connector}`,
        scrollable && "vf-htimeline--scrollable",
        className
      )}
      style={style}
      role="list"
      {...props}
    >
      {events.map((event, index) => {
        const status =
          event.status ??
          (activeKey === event.key ? "active" : "pending");
        const isLast = index === events.length - 1;
        return (
          <div
            key={event.key}
            className={cx(
              "vf-htimeline__event",
              `vf-htimeline__event--${status}`
            )}
            role="listitem"
            onClick={() => onEventClick?.(event.key)}
            style={onEventClick ? { cursor: "pointer" } : undefined}
          >
            <div className="vf-htimeline__dot" aria-hidden="true">
              {event.icon ?? defaultIcons[status] ?? defaultIcons.pending}
            </div>
            <div className="vf-htimeline__content">
              <span className="vf-htimeline__label">{event.label}</span>
              {event.date && (
                <span className="vf-htimeline__date">{event.date}</span>
              )}
              {event.description && (
                <span className="vf-htimeline__description">
                  {event.description}
                </span>
              )}
            </div>
            {!isLast && (
              <div
                className={cx(
                  "vf-htimeline__connector",
                  `vf-htimeline__connector--${connector}`
                )}
                aria-hidden="true"
              />
            )}
          </div>
        );
      })}
    </div>
  );
});
HorizontalTimelineImpl.displayName = "HorizontalTimeline";
export const HorizontalTimeline = memo(HorizontalTimelineImpl);
(HorizontalTimeline as unknown as { displayName: string }).displayName =
  "HorizontalTimeline";
