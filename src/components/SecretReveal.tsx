"use client";

// SecretReveal — a one-time secret (a minted token, a recovery code): masked
// by default, revealed on request, copyable, and dismissed only by an
// explicit acknowledgement. Once acknowledged the value is gone from the
// component for good; a parent must mint a new one to show another.

import { forwardRef, useState, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../utils/cx";
import { useId } from "../hooks/useId";
import { Button } from "./Button";
import { CopyButton } from "./CopyButton";

export interface SecretRevealProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /** The secret. */
  value: string;
  /** What it is ("API token", "Recovery codes"). */
  label: ReactNode;
  /** The sentence that says this is shown once. Default provided. */
  notice?: ReactNode;
  /** Fires when the user acknowledges; the component then shows only `acknowledgedMessage`. */
  onAcknowledge?: () => void;
  /** Default "I have saved it". */
  acknowledgeLabel?: string;
  /** Default "The secret was shown once and is no longer available here." */
  acknowledgedMessage?: ReactNode;
  /** Start revealed. Default false (masked). */
  defaultRevealed?: boolean;
  /** Hide the copy control. Default shown. */
  copyable?: boolean;
  /** Render the value in a wrapping block (recovery codes) rather than one line. */
  multiline?: boolean;
}

const MASK = "•";

export const SecretReveal = forwardRef<HTMLDivElement, SecretRevealProps>(function SecretReveal(
  {
    value,
    label,
    notice = "Shown once. Copy it now; it cannot be displayed again.",
    onAcknowledge,
    acknowledgeLabel = "I have saved it",
    acknowledgedMessage = "The secret was shown once and is no longer available here.",
    defaultRevealed = false,
    copyable = true,
    multiline = false,
    className,
    ...props
  },
  ref
) {
  const [revealed, setRevealed] = useState(defaultRevealed);
  const [acknowledged, setAcknowledged] = useState(false);
  const id = useId();
  const labelId = `${id}-label`;

  if (acknowledged) {
    return (
      <div ref={ref} className={cx("vf-secret", "vf-secret--acknowledged", className)} role="status" {...props}>
        <span className="vf-secret__label" id={labelId}>{label}</span>
        <p className="vf-secret__acknowledged">{acknowledgedMessage}</p>
      </div>
    );
  }

  const masked = multiline
    ? value.replace(/[^\s]/g, MASK)
    : MASK.repeat(Math.min(Math.max(value.length, 8), 32));

  return (
    <div ref={ref} className={cx("vf-secret", revealed && "vf-secret--revealed", className)} {...props}>
      <div className="vf-secret__head">
        <span className="vf-secret__label" id={labelId}>{label}</span>
        <span className="vf-secret__notice">{notice}</span>
      </div>
      <div className="vf-secret__row">
        <output
          className={cx("vf-secret__value", multiline && "vf-secret__value--multiline")}
          aria-labelledby={labelId}
          aria-live="off"
          data-revealed={revealed ? "true" : "false"}
        >
          {revealed ? value : masked}
        </output>
        <div className="vf-secret__controls">
          <Button
            variant="outline"
            size="sm"
            aria-pressed={revealed}
            onClick={() => setRevealed((r) => !r)}
          >
            {revealed ? "Hide" : "Reveal"}
          </Button>
          {copyable && <CopyButton text={value} size="sm" variant="outline" />}
        </div>
      </div>
      <div className="vf-secret__footer">
        <Button
          variant="solid"
          size="sm"
          onClick={() => {
            setAcknowledged(true);
            setRevealed(false);
            onAcknowledge?.();
          }}
        >
          {acknowledgeLabel}
        </Button>
      </div>
    </div>
  );
});
SecretReveal.displayName = "SecretReveal";
