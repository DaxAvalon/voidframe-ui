"use client";

import {
  forwardRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { cx } from "../../utils/cx";

// ── MessageFeedback ─────────────────────────────────────────

export type FeedbackValue = "up" | "down" | null;

export interface FeedbackReason {
  id: string;
  label: string;
}

export interface MessageFeedbackProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  value?: FeedbackValue;
  defaultValue?: FeedbackValue;
  onValueChange?: (next: FeedbackValue) => void;
  reasons?: FeedbackReason[];
  selectedReason?: string;
  onReasonSelect?: (reasonId: string | undefined) => void;
}

/**
 * Thumbs up/down feedback control for a chat message. Emits `{ value,
 * reason? }` on change.
 */
export const MessageFeedback = forwardRef<HTMLDivElement, MessageFeedbackProps>(
  function MessageFeedback(
    {
      value,
      defaultValue = null,
      onValueChange,
      reasons,
      selectedReason: selectedReasonProp,
      onReasonSelect,
      className,
      ...props
    },
    ref
  ) {
    const [internal, setInternal] = useState<FeedbackValue>(defaultValue);
    const current = value === undefined ? internal : value;
    const set = (next: FeedbackValue) => {
      if (value === undefined) setInternal(next);
      onValueChange?.(next);
    };

    const [reasonInternal, setReasonInternal] = useState<string | undefined>();
    const currentReason = selectedReasonProp ?? reasonInternal;

    const selectReason = (reasonId: string) => {
      const next = currentReason === reasonId ? undefined : reasonId;
      if (selectedReasonProp === undefined) setReasonInternal(next);
      onReasonSelect?.(next);
    };

    return (
      <div
        ref={ref}
        role="group"
        aria-label="Feedback"
        className={cx("vf-message-feedback", className)}
        {...props}
      >
        <button
          type="button"
          aria-pressed={current === "up"}
          aria-label="Thumbs up"
          className={cx(
            "vf-message-feedback__btn",
            current === "up" && "vf-message-feedback__btn--active"
          )}
          onClick={() => set(current === "up" ? null : "up")}
        >
          ▲
        </button>
        <button
          type="button"
          aria-pressed={current === "down"}
          aria-label="Thumbs down"
          className={cx(
            "vf-message-feedback__btn",
            current === "down" && "vf-message-feedback__btn--active"
          )}
          onClick={() => set(current === "down" ? null : "down")}
        >
          ▼
        </button>
        {current === "down" && reasons && reasons.length > 0 && (
          <div className="vf-message-feedback__reasons" role="radiogroup">
            {reasons.map((reason) => (
              <button
                key={reason.id}
                type="button"
                role="radio"
                aria-checked={currentReason === reason.id}
                className={cx(
                  "vf-message-feedback__reason",
                  currentReason === reason.id && "vf-message-feedback__reason--selected"
                )}
                onClick={() => selectReason(reason.id)}
              >
                {reason.label}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }
);
MessageFeedback.displayName = "MessageFeedback";

// ── ReactionBar ─────────────────────────────────────────────

export interface MessageReactionEntry {
  emoji: string;
  count: number;
  reacted?: boolean;
}

export interface ReactionBarProps extends HTMLAttributes<HTMLDivElement> {
  reactions: MessageReactionEntry[];
  onReact?: (emoji: string) => void;
  onUnreact?: (emoji: string) => void;
  onAdd?: () => void;
}

/**
 * Emoji reaction row for a message / post. Shows tallies per reaction; emits
 * toggle events.
 */
export const ReactionBar = forwardRef<HTMLDivElement, ReactionBarProps>(
  function ReactionBar(
    { reactions, onReact, onUnreact, onAdd, className, ...props },
    ref
  ) {
    return (
      <div
        ref={ref}
        role="group"
        aria-label="Reactions"
        className={cx("vf-reaction-bar", className)}
        {...props}
      >
        {reactions.map((r) => (
          <button
            key={r.emoji}
            type="button"
            aria-pressed={!!r.reacted}
            className={cx(
              "vf-reaction-bar__chip",
              r.reacted && "vf-reaction-bar__chip--active"
            )}
            onClick={() =>
              r.reacted ? onUnreact?.(r.emoji) : onReact?.(r.emoji)
            }
          >
            <span className="vf-reaction-bar__emoji" aria-hidden="true">
              {r.emoji}
            </span>
            <span className="vf-reaction-bar__count">{r.count}</span>
          </button>
        ))}
        {onAdd && (
          <button
            type="button"
            className="vf-reaction-bar__add"
            aria-label="Add reaction"
            onClick={onAdd}
          >
            +
          </button>
        )}
      </div>
    );
  }
);
ReactionBar.displayName = "ReactionBar";
