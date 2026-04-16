"use client";

import {
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { cx } from "../../utils/cx";

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

const CopyAction = namedAction("MessageActions.Copy", "⧉", "Copy");
const RegenerateAction = namedAction(
  "MessageActions.Regenerate",
  "↻",
  "Regenerate"
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
  Edit: EditAction,
  Delete: DeleteAction,
  Share: ShareAction,
  Feedback: FeedbackAction,
  Pin: PinAction,
  Branch: BranchAction,
});
