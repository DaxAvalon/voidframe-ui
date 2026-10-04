"use client";

import { forwardRef, memo, type HTMLAttributes } from "react";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";
import { cx } from "../utils/cx";

export type CountdownDialVariant = "ring" | "bar";
export type CountdownDialTone = "neutral" | "warning" | "danger";

export interface CountdownDialProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /** Total seconds of the count. */
  total: number;
  /** Seconds remaining. The consumer drives it; the component keeps no time. */
  remaining: number;
  /** `ring` (default) or `bar`. */
  variant?: CountdownDialVariant;
  /** `md`, `lg`, or `xl` — the numeral at the display size, readable from a distance. Default `md`. */
  size?: "md" | "lg" | "xl";
  /** Caption and accessible name ("Stay quiet", "Rolling"). */
  label?: string;
  /** Formats the numeral. Default: whole seconds, rounded up, never negative. */
  format?: (remaining: number) => string;
  /** Colour emphasis. Default `neutral`. */
  tone?: CountdownDialTone;
}

/** Fraction of the count remaining, 0..1; 0 when the total is not positive or a value is not finite. */
export function countdownFraction(remaining: number, total: number): number {
  if (!Number.isFinite(remaining) || !Number.isFinite(total) || total <= 0) return 0;
  return Math.min(1, Math.max(0, remaining / total));
}

/** Whole seconds remaining, rounded up so "1" shows until the count ends; never negative. */
export function formatSeconds(remaining: number): string {
  if (!Number.isFinite(remaining) || remaining <= 0) return "0";
  return String(Math.ceil(remaining));
}

const RADIUS = 45;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const STROKE = 8;

const CountdownDialImpl = forwardRef<HTMLDivElement, CountdownDialProps>(function CountdownDial(
  { total, remaining, variant = "ring", size = "md", label, format = formatSeconds, tone = "neutral", className, ...rest },
  ref
) {
  const reduced = usePrefersReducedMotion();
  const fraction = countdownFraction(remaining, total);
  const text = format(remaining);
  const name = label ? `${label}: ${text} seconds` : `${text} seconds`;
  const motion = reduced ? { transition: "none" } : undefined;
  return (
    <div
      ref={ref}
      role="timer"
      aria-live="off"
      aria-label={name}
      className={cx("vf-countdown-dial", `vf-countdown-dial--${variant}`, `vf-countdown-dial--${size}`, `vf-countdown-dial--${tone}`, reduced && "vf-countdown-dial--reduced", className)}
      data-remaining={text}
      {...rest}
    >
      {variant === "ring" ? (
        <div className="vf-countdown-dial__ring" aria-hidden="true">
          <svg className="vf-countdown-dial__svg" viewBox="0 0 100 100" focusable="false">
            <circle className="vf-countdown-dial__track" cx="50" cy="50" r={RADIUS} fill="none" strokeWidth={STROKE} />
            <circle
              className="vf-countdown-dial__fill"
              cx="50"
              cy="50"
              r={RADIUS}
              fill="none"
              strokeWidth={STROKE}
              strokeLinecap="butt"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={CIRCUMFERENCE * (1 - fraction)}
              transform="rotate(-90 50 50)"
              style={motion}
            />
          </svg>
          <span className="vf-countdown-dial__value">{text}</span>
        </div>
      ) : (
        <div className="vf-countdown-dial__bar" aria-hidden="true">
          <span className="vf-countdown-dial__value">{text}</span>
          <div className="vf-countdown-dial__track">
            <div className="vf-countdown-dial__fill" style={{ width: `${fraction * 100}%`, ...motion }} />
          </div>
        </div>
      )}
      {label && (
        <span className="vf-countdown-dial__label" aria-hidden="true">
          {label}
        </span>
      )}
    </div>
  );
});

/**
 * A countdown readable from a distance: a large numeral inside a ring or
 * above a bar that empties as the count runs. The consumer supplies `total`
 * and `remaining` and ticks them; the component keeps no time. `role="timer"`
 * with `aria-live="off"` so the count is never read every second — the
 * accessible name carries the label and the seconds for whoever asks. Under
 * `prefers-reduced-motion` the ring and bar step instead of sliding.
 */
export const CountdownDial = memo(CountdownDialImpl);
