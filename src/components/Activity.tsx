"use client";

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
import { toneAttrs } from "../utils/toneAttrs";

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

/**
 * Vertical activity feed. Pair with `<Activity.Item>` children — each
 * item shows a rail marker, an actor, an action, and a timestamp.
 * Intended for audit logs, commit histories, and notification streams.
 */
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
  /**
   * Optional rich expansion content rendered below the fixed-shape row.
   * Use when an activity item should disclose more detail than fits in
   * `preview` — nested lists, inline diffs, evaluator breakdowns, etc.
   * Voidframe doesn't manage the expand/collapse state itself; consumers
   * conditionally pass `children` based on their own toggle state.
   */
  children?: ReactNode;
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
      children,
      className,
      ...props
    },
    ref
  ) {
    const ta = toneAttrs("vf-activity__item", { tone });
    return (
      <article
        ref={ref}
        className={cx(ta.className, className)}
        {...ta.attrs}
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
          {children && <div className="vf-activity__expanded">{children}</div>}
        </div>
      </article>
    );
  }
);
ActivityItem.displayName = "ActivityItem";

/**
 * Vertical activity feed. Pair with `Activity.Item` children — each
 * item shows a rail marker, an actor, an action, and a timestamp.
 * Intended for audit logs, commit histories, and notification streams.
 */
export const Activity = Object.assign(ActivityRoot, { Item: ActivityItem });
