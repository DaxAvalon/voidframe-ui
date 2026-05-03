"use client";

import { forwardRef, memo, useCallback, useEffect, useRef, useState } from "react";
import type { HTMLAttributes } from "react";
import { cx } from "../utils/cx";
import { buttonDisabledAttrs } from "../utils/buttonDisabledAttrs";
import { toneAttrs } from "../utils/toneAttrs";

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
  variant?: "solid" | "outline" | "ghost" | "subtle" | "destructive";
  size?: "sm" | "md" | "lg" | "icon";
  /**
   * Semantic tone. Mirrors Button/IconButton tone vocabulary — emits
   * `data-tone` and primes `--vf-accent` when no explicit accent is supplied.
   */
  tone?: "neutral" | "info" | "success" | "danger" | "warning";
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
      variant = "outline",
      size = "md",
      tone,
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

    const resolvedTone = variant === "destructive" ? "danger" : tone;
    const resolvedVariant = variant === "destructive" ? "solid" : variant;
    const ta = toneAttrs("vf-copy-button", {
      variant: resolvedVariant,
      size,
      tone: resolvedTone,
    });
    return (
      <button
        ref={ref}
        type="button"
        aria-label={copied ? copiedLabel : label}
        {...props}
        onClick={handleClick}
        {...buttonDisabledAttrs(disabled)}
        className={cx(ta.className, copied && "vf-copy-button--copied", className)}
        {...ta.attrs}
        data-disabled={disabled ? "true" : undefined}
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

/**
 * Clipboard button that writes `text` on click and flips to a "Copied"
 * confirmation state for `copiedDuration` ms. Emits `onCopy(text)` on success,
 * `onError(err)` on clipboard-API failure. Matches Button's canonical variant
 * vocabulary. Memoized.
 */
export const CopyButton = memo(CopyButtonImpl);
(CopyButton as unknown as { displayName: string }).displayName = "CopyButton";
