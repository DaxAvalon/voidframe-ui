"use client";

import { forwardRef, memo, useEffect, useRef, useState } from "react";
import type { HTMLAttributes, KeyboardEvent, ReactNode } from "react";
import { cx } from "../utils/cx";

export interface InlineEditProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onSubmit"> {
  value: string;
  /**
   * Called with the committed draft after validation passes. The parent is
   * expected to propagate the change back into `value`; InlineEdit treats
   * `value` as authoritative for the display state, so if the upstream state
   * update lags (async/rejected), the displayed value may briefly trail the
   * value the user just typed.
   */
  onSave: (value: string) => void;
  onCancel?: () => void;
  placeholder?: string;
  validation?: (value: string) => string | undefined;
  size?: "sm" | "md" | "lg";
  multiline?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  renderDisplay?: (value: string) => ReactNode;
  maxLength?: number;
  /** Select all text on entering edit mode. Default true. */
  autoSelect?: boolean;
  /** Save on blur. Default true. */
  submitOnBlur?: boolean;
  /** Save on Enter key. Default true. */
  submitOnEnter?: boolean;
}

const InlineEditImpl = forwardRef<HTMLDivElement, InlineEditProps>(
  function InlineEdit(
    {
      value,
      onSave,
      onCancel,
      placeholder,
      validation,
      size = "md",
      multiline = false,
      disabled = false,
      readOnly = false,
      renderDisplay,
      maxLength,
      autoSelect = true,
      submitOnBlur = true,
      submitOnEnter = true,
      className,
      style,
      ...props
    },
    ref
  ) {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(value);
    const [error, setError] = useState<string | undefined>(undefined);
    const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

    // Focus (and optionally select) the input when entering edit mode.
    useEffect(() => {
      if (editing && inputRef.current) {
        inputRef.current.focus();
        if (autoSelect) {
          inputRef.current.select();
        }
      }
    }, [editing, autoSelect]);

    const enterEditMode = () => {
      if (disabled || readOnly) return;
      setDraft(value);
      setError(undefined);
      setEditing(true);
    };

    const save = () => {
      // Guard: if the component was flipped to disabled/readOnly mid-edit,
      // treat submit (blur/enter) as a cancel rather than committing stale data.
      if (disabled || readOnly) {
        cancel();
        return;
      }
      if (validation) {
        const result = validation(draft);
        if (result) {
          setError(result);
          return;
        }
      }
      setError(undefined);
      setEditing(false);
      onSave(draft);
    };

    const cancel = () => {
      setDraft(value);
      setError(undefined);
      setEditing(false);
      onCancel?.();
    };

    const handleDisplayKeyDown = (e: KeyboardEvent<HTMLSpanElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        enterEditMode();
      }
    };

    const handleInputKeyDown = (
      e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
      if (e.key === "Escape") {
        e.preventDefault();
        cancel();
      } else if (e.key === "Enter" && submitOnEnter && !multiline) {
        e.preventDefault();
        save();
      }
    };

    const handleBlur = () => {
      if (submitOnBlur) {
        save();
      }
    };

    const rootClass = cx(
      "vf-inline-edit",
      `vf-inline-edit--${size}`,
      editing && "vf-inline-edit--editing",
      disabled && "vf-inline-edit--disabled",
      readOnly && "vf-inline-edit--readonly",
      className
    );

    const inputProps = {
      ref: inputRef as any,
      className: "vf-inline-edit__input",
      value: draft,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setDraft(e.target.value),
      onKeyDown: handleInputKeyDown,
      onBlur: handleBlur,
      maxLength,
      "aria-label": "Inline edit input",
      "aria-invalid": error ? true : undefined,
    };

    return (
      <div ref={ref} className={rootClass} style={style} {...props}>
        {editing ? (
          <>
            {multiline ? (
              <textarea {...inputProps} rows={3} />
            ) : (
              <input type="text" {...inputProps} />
            )}
            {error && (
              <span className="vf-inline-edit__error" role="alert">
                {error}
              </span>
            )}
          </>
        ) : (
          <span
            className="vf-inline-edit__display"
            role="button"
            tabIndex={disabled || readOnly ? -1 : 0}
            onClick={enterEditMode}
            onKeyDown={handleDisplayKeyDown}
          >
            {renderDisplay
              ? renderDisplay(value)
              : value || (
                  <span className="vf-inline-edit__placeholder">
                    {placeholder}
                  </span>
                )}
          </span>
        )}
      </div>
    );
  }
);
InlineEditImpl.displayName = "InlineEdit";
/**
 * Click-to-edit text field: displays a value until clicked, then renders an
 * input with Save/Cancel.
 */
export const InlineEdit = memo(InlineEditImpl);
(InlineEdit as unknown as { displayName: string }).displayName = "InlineEdit";
