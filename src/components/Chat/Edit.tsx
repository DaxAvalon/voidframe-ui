"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { cx } from "../../utils/cx";

// ── MessageEdit ─────────────────────────────────────────────

export interface MessageEditProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  value: string;
  onValueChange: (next: string) => void;
  onSave?: (next: string) => void;
  onCancel?: () => void;
  placeholder?: string;
  saveLabel?: ReactNode;
  cancelLabel?: ReactNode;
  autoFocus?: boolean;
}

/**
 * Inline edit mode for a chat message: textarea plus Save / Cancel. Keyboard
 * Esc to cancel, Cmd+Enter to save.
 */
export const MessageEdit = forwardRef<HTMLDivElement, MessageEditProps>(
  function MessageEdit(
    {
      value,
      onValueChange,
      onSave,
      onCancel,
      placeholder,
      saveLabel = "Save",
      cancelLabel = "Cancel",
      autoFocus = true,
      className,
      ...props
    },
    ref
  ) {
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    useEffect(() => {
      if (autoFocus) textareaRef.current?.focus();
    }, [autoFocus]);

    const save = useCallback(() => onSave?.(value), [onSave, value]);

    return (
      <div
        ref={ref}
        className={cx("vf-message-edit", className)}
        {...props}
      >
        <textarea
          ref={textareaRef}
          className="vf-message-edit__input"
          value={value}
          placeholder={placeholder}
          onChange={(e) => onValueChange(e.target.value)}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
              e.preventDefault();
              save();
            } else if (e.key === "Escape") {
              e.preventDefault();
              onCancel?.();
            }
          }}
        />
        <div className="vf-message-edit__actions">
          <button
            type="button"
            className="vf-message-edit__cancel"
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className="vf-message-edit__save"
            onClick={save}
          >
            {saveLabel}
          </button>
        </div>
      </div>
    );
  }
);
MessageEdit.displayName = "MessageEdit";
