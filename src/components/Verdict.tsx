"use client";

import { forwardRef, memo, useId, type HTMLAttributes, type ReactNode } from "react";
import { Badge, type BadgeSize } from "./Badge";
import { VisuallyHidden } from "../primitives/VisuallyHidden";
import { Disclosure } from "./Disclosure";
import { cx } from "../utils/cx";
import { toneAttrs } from "../utils/toneAttrs";
import { useMessages } from "../i18n/MessagesProvider";

/**
 * The outcomes a check can have (the spec engine's vocabulary) plus
 * `pending` for a check that has not run or is still running.
 */
export type VerdictKind = "pass" | "warn" | "fail" | "flagged" | "skipped" | "pending";

/**
 * How one outcome in a vocabulary renders: its tone, the glyph drawn before
 * the word, and the word itself (defaults to the key).
 */
export interface VerdictKindSpec {
  tone: VerdictTone;
  glyph: string;
  word?: string;
}

/** A consumer vocabulary: outcome key → how it renders. */
export type VerdictKinds = Record<string, VerdictKindSpec>;

/** A verdict key: one of the built-in kinds, or any key of the `kinds` passed alongside. */
export type VerdictValue = VerdictKind | (string & Record<never, never>);

export interface VerdictProps extends Omit<HTMLAttributes<HTMLSpanElement>, "children"> {
  /** The outcome. Decides the tone, the glyph and the word (built-in, or a key of `kinds`). */
  verdict: VerdictValue;
  /**
   * A custom vocabulary (accept / needs-approval / reject; endorse / flag /
   * escalate…). Keys render with their own tone, glyph and word under the
   * same glyph-and-word discipline. Built-in kinds stay available as a
   * fallback for keys the vocabulary does not define.
   */
  kinds?: VerdictKinds;
  /** Force the tone regardless of the verdict's vocabulary entry. */
  tone?: VerdictTone;
  /** Force the glyph regardless of the verdict's vocabulary entry. */
  glyph?: string;
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

export type VerdictTone = "success" | "warning" | "danger" | "neutral" | "info";

/** The built-in vocabulary. Spread it to extend rather than replace it. */
export const VERDICT_KINDS: Record<VerdictKind, VerdictKindSpec> = {
  pass: { tone: "success", glyph: "✓" },
  warn: { tone: "warning", glyph: "!" },
  fail: { tone: "danger", glyph: "✕" },
  flagged: { tone: "warning", glyph: "⚑" },
  skipped: { tone: "neutral", glyph: "–" },
  pending: { tone: "info", glyph: "…" },
};

const UNKNOWN_KIND: VerdictKindSpec = { tone: "neutral", glyph: "?" };

/** Resolve a verdict key against a vocabulary (then the built-ins). */
export function verdictSpec(verdict: VerdictValue, kinds?: VerdictKinds): VerdictKindSpec {
  return kinds?.[verdict] ?? (VERDICT_KINDS as Record<string, VerdictKindSpec>)[verdict] ?? UNKNOWN_KIND;
}

/** The tone a verdict renders with — exported so tables can colour other cells consistently. */
export function verdictTone(verdict: VerdictValue, kinds?: VerdictKinds): VerdictTone {
  return verdictSpec(verdict, kinds).tone;
}

const VerdictImpl = forwardRef<HTMLSpanElement, VerdictProps>(function Verdict(
  {
    verdict,
    kinds,
    tone: toneProp,
    glyph: glyphProp,
    explanation,
    measured,
    required,
    size = "md",
    wordCase = "upper",
    label,
    className,
    ...rest
  },
  ref
) {
  const explanationId = useId();
  const { t } = useMessages();
  const spec = verdictSpec(verdict, kinds);
  const word = label ?? spec.word ?? verdict;
  const tone = toneProp ?? spec.tone;
  return (
    <span
      ref={ref}
      className={cx("vf-verdict", `vf-verdict--${verdict}`, `vf-verdict--${size}`, className)}
      data-verdict={verdict}
      data-tone={tone}
      {...rest}
    >
      <Badge
        tone={tone}
        size={size}
        icon={glyphProp ?? spec.glyph}
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
              <VisuallyHidden>{t("media.measured")} </VisuallyHidden>
              {measured}
            </span>
          )}
          {measured && required && <span aria-hidden="true"> · </span>}
          {required && (
            <span className="vf-verdict__required">
              <VisuallyHidden>{t("media.required")} </VisuallyHidden>
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
 * A check's outcome — pass, warn, fail, flagged, skipped or pending — as a
 * glyph and a word (never colour alone), with optional measured/required values in
 * monospace and an explanation sentence. A thin layer over `Badge` so verdicts
 * look the same in a checker report, a table cell and a session check.
 */
export const Verdict = memo(VerdictImpl);

// ── VerdictCallout ───────────────────────────────────────────

export interface VerdictReason {
  /** The reason text. */
  text: ReactNode;
  /** Optional per-reason verdict, rendered as a small badge before the text. */
  verdict?: VerdictValue;
}

export interface VerdictCalloutProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  /** The overall outcome (built-in, or a key of `kinds`). */
  verdict: VerdictValue;
  /** Vocabulary shared by the headline and the per-reason badges. */
  kinds?: VerdictKinds;
  /** Override the headline word (e.g. a translation). */
  label?: string;
  /** One sentence the reader can act on, rendered next to the headline verdict. */
  headline?: ReactNode;
  /** Measured / required values shown with the headline (see `Verdict`). */
  measured?: string;
  required?: string;
  /** Reasons, as plain nodes or `{ text, verdict }`. Rendered as a list. */
  reasons?: ReadonlyArray<ReactNode | VerdictReason>;
  /** Heading above the reasons. Default "Reasons" (hidden when there are none). */
  reasonsLabel?: ReactNode;
  /** Raw details (a log, JSON, the measurement table) behind a disclosure. */
  details?: ReactNode;
  /** Disclosure trigger text. Default "Details". */
  detailsLabel?: ReactNode;
  /** Open the details by default. */
  detailsOpen?: boolean;
  /** Controls (re-run, override, open report) rendered in the footer. */
  actions?: ReactNode;
  /** Headline badge size. Default `"lg"`. */
  size?: BadgeSize;
  /** Heading element for the headline, for document outline. Default none. */
  headingAs?: "h2" | "h3" | "h4" | "h5" | "h6";
  children?: ReactNode;
}

function isReason(value: ReactNode | VerdictReason): value is VerdictReason {
  return typeof value === "object" && value !== null && "text" in value && !("$$typeof" in value);
}

/**
 * The verdict panel every gating surface builds by hand: a tone callout with
 * the `Verdict` as headline, a reasons list, free body content, raw details
 * behind a disclosure and footer actions. Tone, glyph and word come from the
 * verdict (and `kinds`), so a checker report, a review decision and an
 * approval gate look alike.
 */
export const VerdictCallout = forwardRef<HTMLDivElement, VerdictCalloutProps>(function VerdictCallout(
  {
    verdict,
    kinds,
    label,
    headline,
    measured,
    required,
    reasons,
    reasonsLabel = "Reasons",
    details,
    detailsLabel = "Details",
    detailsOpen,
    actions,
    size = "lg",
    headingAs,
    className,
    children,
    ...rest
  },
  ref
) {
  const tone = verdictTone(verdict, kinds);
  const ta = toneAttrs("vf-verdict-callout", { tone });
  const Heading = headingAs ?? "div";
  const list = (reasons ?? []).filter((r) => r !== null && r !== undefined && r !== false);
  return (
    <div
      ref={ref}
      role="group"
      className={cx(ta.className, className)}
      {...ta.attrs}
      data-verdict={verdict}
      {...rest}
    >
      <Heading className="vf-verdict-callout__headline">
        <Verdict verdict={verdict} kinds={kinds} label={label} size={size} measured={measured} required={required} />
        {headline !== undefined ? <span className="vf-verdict-callout__text">{headline}</span> : null}
      </Heading>
      {list.length > 0 ? (
        <div className="vf-verdict-callout__reasons">
          {reasonsLabel ? <div className="vf-verdict-callout__reasons-label">{reasonsLabel}</div> : null}
          <ul className="vf-verdict-callout__list">
            {list.map((r, i) => {
              const reason = isReason(r) ? r : { text: r };
              return (
                <li key={i} className="vf-verdict-callout__reason">
                  {reason.verdict !== undefined ? (
                    <Verdict verdict={reason.verdict} kinds={kinds} size="sm" className="vf-verdict-callout__reason-verdict" />
                  ) : null}
                  <span className="vf-verdict-callout__reason-text">{reason.text}</span>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
      {children !== undefined && children !== null ? <div className="vf-verdict-callout__body">{children}</div> : null}
      {details !== undefined && details !== null ? (
        <Disclosure
          trigger={detailsLabel}
          defaultOpen={detailsOpen}
          className="vf-verdict-callout__details"
          chevron="start"
        >
          <div className="vf-verdict-callout__details-body">{details}</div>
        </Disclosure>
      ) : null}
      {actions !== undefined && actions !== null ? <div className="vf-verdict-callout__actions">{actions}</div> : null}
    </div>
  );
});
VerdictCallout.displayName = "VerdictCallout";
