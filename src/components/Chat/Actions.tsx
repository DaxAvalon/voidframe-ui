"use client";

import {
  forwardRef,
  type HTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from "react";
import { cx } from "../../utils/cx";
import { useConversation } from "./Conversation";

// ── MessageActions (compound) ───────────────────────────────

export interface MessageActionsProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

function MessageActionsRoot({
  className,
  children,
  ...props
}: MessageActionsProps) {
  return (
    <div
      role="toolbar"
      aria-label="Message actions"
      className={cx("vf-message-actions", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export interface MessageActionButtonProps
  extends HTMLAttributes<HTMLButtonElement> {
  icon?: ReactNode;
  label?: ReactNode;
  disabled?: boolean;
}

const MessageActionButton = forwardRef<HTMLButtonElement, MessageActionButtonProps>(
  function MessageActionButton(
    { icon, label, className, children, disabled, ...props },
    ref
  ) {
    return (
      <button
        ref={ref}
        type="button"
        className={cx("vf-message-actions__btn", className)}
        aria-label={typeof label === "string" ? label : undefined}
        disabled={disabled}
        {...props}
      >
        {icon && (
          <span className="vf-message-actions__icon" aria-hidden="true">
            {icon}
          </span>
        )}
        {(label || children) && (
          <span className="vf-message-actions__label">{label ?? children}</span>
        )}
      </button>
    );
  }
);

const namedAction = (
  name: string,
  defaultIcon: string,
  defaultLabel: string
) => {
  const Component = forwardRef<HTMLButtonElement, MessageActionButtonProps>(
    function NamedAction({ icon, label, ...props }, ref) {
      return (
        <MessageActionButton
          ref={ref}
          icon={icon ?? defaultIcon}
          label={label ?? defaultLabel}
          {...props}
        />
      );
    }
  );
  Component.displayName = name;
  return Component;
};

// Action that falls back to a Conversation-context callback when no explicit
// `onClick` is provided. Explicit `onClick` always wins — no double-fire.
function namedConversationAction(
  name: string,
  defaultIcon: string,
  defaultLabel: string,
  pick: (ctx: ReturnType<typeof useConversation>) => (() => void) | undefined
) {
  const Component = forwardRef<HTMLButtonElement, MessageActionButtonProps>(
    function NamedConversationAction({ icon, label, onClick, ...props }, ref) {
      const ctx = useConversation();
      const contextHandler = pick(ctx);
      const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
        if (onClick) {
          onClick(e);
          return;
        }
        contextHandler?.();
      };
      return (
        <MessageActionButton
          ref={ref}
          icon={icon ?? defaultIcon}
          label={label ?? defaultLabel}
          onClick={handleClick}
          {...props}
        />
      );
    }
  );
  Component.displayName = name;
  return Component;
}

const CopyAction = namedAction("MessageActions.Copy", "⧉", "Copy");
const RegenerateAction = namedConversationAction(
  "MessageActions.Regenerate",
  "↻",
  "Regenerate",
  (ctx) => ctx?.onRegenerate
);
const RetryAction = namedConversationAction(
  "MessageActions.Retry",
  "↺",
  "Retry",
  (ctx) => ctx?.onRetry
);
const StopAction = namedConversationAction(
  "MessageActions.Stop",
  "■",
  "Stop",
  (ctx) => ctx?.onStop
);
const EditAction = namedAction("MessageActions.Edit", "✎", "Edit");
const DeleteAction = namedAction("MessageActions.Delete", "✕", "Delete");
const ShareAction = namedAction("MessageActions.Share", "↗", "Share");
const FeedbackAction = namedAction(
  "MessageActions.Feedback",
  "✱",
  "Feedback"
);
const PinAction = namedAction("MessageActions.Pin", "★", "Pin");
const BranchAction = namedAction(
  "MessageActions.Branch",
  "⑂",
  "Branch from here"
);

export const MessageActions = Object.assign(MessageActionsRoot, {
  Button: MessageActionButton,
  Copy: CopyAction,
  Regenerate: RegenerateAction,
  Retry: RetryAction,
  Stop: StopAction,
  Edit: EditAction,
  Delete: DeleteAction,
  Share: ShareAction,
  Feedback: FeedbackAction,
  Pin: PinAction,
  Branch: BranchAction,
});
