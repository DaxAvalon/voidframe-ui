// Phase 9 — Activity / ActivityFeed
//
// Chronological list of events with actor, action, target, optional preview,
// and relative/absolute timestamps.

import {
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { cx } from "../utils/cx";

function formatRelative(time: Date | string): string {
  const d = typeof time === "string" ? new Date(time) : time;
  const now = Date.now();
  const diff = now - d.getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return d.toLocaleDateString();
}

export interface ActivityProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

const ActivityRoot = forwardRef<HTMLDivElement, ActivityProps>(function Activity(
  { className, children, ...props },
  ref
) {
  return (
    <div
      ref={ref}
      role="feed"
      aria-label="Activity feed"
      className={cx("vf-activity", className)}
      {...props}
    >
      {children}
    </div>
  );
});
ActivityRoot.displayName = "Activity";

export interface ActivityItemProps extends HTMLAttributes<HTMLDivElement> {
  actor?: ReactNode;
  avatar?: ReactNode;
  action?: ReactNode;
  target?: ReactNode;
  preview?: ReactNode;
  time?: Date | string;
  /** Show absolute time instead of relative. */
  absoluteTime?: boolean;
  tone?: "neutral" | "success" | "warning" | "danger" | "info";
}

const ActivityItem = forwardRef<HTMLDivElement, ActivityItemProps>(
  function ActivityItem(
    {
      actor,
      avatar,
      action,
      target,
      preview,
      time,
      absoluteTime,
      tone = "neutral",
      className,
      ...props
    },
    ref
  ) {
    return (
      <article
        ref={ref}
        className={cx("vf-activity__item", `vf-activity__item--${tone}`, className)}
        {...props}
      >
        {avatar && <div className="vf-activity__avatar">{avatar}</div>}
        <div className="vf-activity__body">
          <div className="vf-activity__head">
            {actor && <strong className="vf-activity__actor">{actor}</strong>}
            {action && <span className="vf-activity__action">{action}</span>}
            {target && <em className="vf-activity__target">{target}</em>}
            {time && (
              <time
                className="vf-activity__time"
                dateTime={time instanceof Date ? time.toISOString() : time}
              >
                {absoluteTime
                  ? time instanceof Date
                    ? time.toLocaleString()
                    : time
                  : formatRelative(time)}
              </time>
            )}
          </div>
          {preview && <div className="vf-activity__preview">{preview}</div>}
        </div>
      </article>
    );
  }
);
ActivityItem.displayName = "ActivityItem";

export const Activity = Object.assign(ActivityRoot, { Item: ActivityItem });
