"use client";

import { forwardRef, memo, useId, type HTMLAttributes } from "react";
import { Badge, type BadgeSize } from "./Badge";
import { VisuallyHidden } from "../primitives/VisuallyHidden";
import { cx } from "../utils/cx";

/** The five outcomes a check can have (the spec engine's vocabulary). */
export type VerdictKind = "pass" | "warn" | "fail" | "flagged" | "skipped";

export interface VerdictProps extends Omit<HTMLAttributes<HTMLSpanElement>, "children"> {
  /** The outcome. Decides the tone, the glyph and the word. */
  verdict: VerdictKind;
  /** One sentence the reader can act on, rendered after the badge. */
  explanation?: string;
  /** What was measured, e.g. "-54 dB RMS". Rendered in monospace with a hidden "measured" label. */
  measured?: string;
  /** What was required, e.g. "≤ -60 dB RMS". Rendered in monospace with a hidden "required" label. */
  required?: string;
  /** Badge size. Default `"md"`. */
  size?: BadgeSize;
  /** `"upper"` follows the theme's heading case (the Badge default); `"lower"` renders the word as written. Default `"upper"`. */
  wordCase?: "upper" | "lower";
  /** Override the word shown for this verdict (e.g. a translation). The verdict itself is still exposed via `data-verdict`. */
  label?: string;
}

const TONE: Record<VerdictKind, "success" | "warning" | "danger" | "neutral"> = {
  pass: "success",
  warn: "warning",
  fail: "danger",
  flagged: "warning",
  skipped: "neutral",
};

const GLYPH: Record<VerdictKind, string> = {
  pass: "✓",
  warn: "!",
  fail: "✕",
  flagged: "⚑",
  skipped: "–",
};

/** The tone a verdict renders with — exported so tables can colour other cells consistently. */
export function verdictTone(verdict: VerdictKind): "success" | "warning" | "danger" | "neutral" {
  return TONE[verdict];
}

const VerdictImpl = forwardRef<HTMLSpanElement, VerdictProps>(function Verdict(
  { verdict, explanation, measured, required, size = "md", wordCase = "upper", label, className, ...rest },
  ref
) {
  const explanationId = useId();
  const word = label ?? verdict;
  return (
    <span
      ref={ref}
      className={cx("vf-verdict", `vf-verdict--${verdict}`, `vf-verdict--${size}`, className)}
      data-verdict={verdict}
      {...rest}
    >
      <Badge
        tone={TONE[verdict]}
        size={size}
        icon={GLYPH[verdict]}
        className="vf-verdict__badge"
        style={wordCase === "lower" ? { textTransform: "none" } : undefined}
        aria-describedby={explanation ? explanationId : undefined}
      >
        {word}
      </Badge>
      {(measured || required) && (
        <span className="vf-verdict__numbers">
          {measured && (
            <span className="vf-verdict__measured">
              <VisuallyHidden>measured </VisuallyHidden>
              {measured}
            </span>
          )}
          {measured && required && <span aria-hidden="true"> · </span>}
          {required && (
            <span className="vf-verdict__required">
              <VisuallyHidden>required </VisuallyHidden>
              {required}
            </span>
          )}
        </span>
      )}
      {explanation && (
        <span id={explanationId} className="vf-verdict__explanation">
          {explanation}
        </span>
      )}
    </span>
  );
});

/**
 * A check's outcome — pass, warn, fail, flagged or skipped — as a glyph and a
 * word (never colour alone), with optional measured/required values in
 * monospace and an explanation sentence. A thin layer over `Badge` so verdicts
 * look the same in a checker report, a table cell and a session check.
 */
export const Verdict = memo(VerdictImpl);
