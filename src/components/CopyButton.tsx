"use client";

import { forwardRef, memo, useCallback, useEffect, useRef, useState } from "react";
import type { HTMLAttributes } from "react";
import { cx } from "../utils/cx";

export interface CopyButtonProps
  extends Omit<HTMLAttributes<HTMLButtonElement>, "onClick" | "onCopy" | "onError"> {
  /** The text to copy to the clipboard. */
  text: string;
  /** Label shown in default (idle) state. Defaults to "Copy". */
  label?: string;
  /** Label shown after a successful copy. Defaults to "Copied". */
  copiedLabel?: string;
  /** Duration in ms the "copied" state is shown. Defaults to 2000. */
  copiedDuration?: number;
  variant?: "default" | "ghost" | "accent";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  /** Fires after a successful clipboard write with the copied text. */
  onCopy?: (text: string) => void;
  /** Fires when the clipboard write fails. */
  onError?: (error: Error) => void;
}

const CopyButtonImpl = forwardRef<HTMLButtonElement, CopyButtonProps>(
  function CopyButton(
    {
      text,
      label = "Copy",
      copiedLabel = "Copied",
      copiedDuration = 2000,
      variant = "default",
      size = "md",
      disabled,
      onCopy,
      onError,
      className,
      ...props
    },
    ref
  ) {
    const [copied, setCopied] = useState(false);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Clear timeout on unmount to prevent memory leaks.
    useEffect(() => {
      return () => {
        if (timerRef.current !== null) {
          clearTimeout(timerRef.current);
        }
      };
    }, []);

    const handleClick = useCallback(async () => {
      if (disabled) return;
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        onCopy?.(text);

        // Clear any existing timer before setting a new one.
        if (timerRef.current !== null) {
          clearTimeout(timerRef.current);
        }
        timerRef.current = setTimeout(() => {
          setCopied(false);
          timerRef.current = null;
        }, copiedDuration);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        onError?.(error);
      }
    }, [text, disabled, copiedDuration, onCopy, onError]);

    return (
      <button
        ref={ref}
        type="button"
        onClick={handleClick}
        aria-disabled={disabled || undefined}
        aria-label={copied ? copiedLabel : label}
        className={cx(
          "vf-copy-button",
          `vf-copy-button--${variant}`,
          `vf-copy-button--${size}`,
          copied && "vf-copy-button--copied",
          className
        )}
        data-disabled={disabled ? "true" : undefined}
        {...props}
      >
        <span className="vf-copy-button__icon" aria-hidden="true">
          {copied ? "\u2713" : "\u2398"}
        </span>
        {copied ? copiedLabel : label}
      </button>
    );
  }
);
CopyButtonImpl.displayName = "CopyButton";

/** Memoized leaf — skips re-render when props are referentially stable. */
export const CopyButton = memo(CopyButtonImpl);
(CopyButton as unknown as { displayName: string }).displayName = "CopyButton";
