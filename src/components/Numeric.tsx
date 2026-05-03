"use client";

// Phase 13 — Numeric displays

import {
  forwardRef,
  useMemo,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { cx } from "../utils/cx";
import { toneAttrs } from "../utils/toneAttrs";

// ── NumberDisplay ───────────────────────────────────────────

export interface NumberDisplayProps
  extends Omit<HTMLAttributes<HTMLSpanElement>, "children" | "prefix"> {
  value: number;
  locale?: string;
  decimals?: number;
  compact?: boolean;
  /** Show sign for positive numbers too. */
  signed?: boolean;
  prefix?: ReactNode;
  suffix?: ReactNode;
  tone?: "neutral" | "success" | "warning" | "danger" | "info";
}

/**
 * Locale-aware number formatter via `Intl.NumberFormat`. Takes `value` and
 * optional precision / notation.
 */
export const NumberDisplay = forwardRef<HTMLSpanElement, NumberDisplayProps>(
  function NumberDisplay(
    {
      value,
      locale,
      decimals,
      compact,
      signed,
      prefix,
      suffix,
      tone,
      className,
      ...props
    },
    ref
  ) {
    const text = useMemo(() => {
      const options: Intl.NumberFormatOptions = {};
      if (decimals !== undefined) {
        options.minimumFractionDigits = decimals;
        options.maximumFractionDigits = decimals;
      }
      if (compact) {
        options.notation = "compact";
        options.maximumFractionDigits ??= 1;
      }
      if (signed) options.signDisplay = "exceptZero";
      return new Intl.NumberFormat(locale, options).format(value);
    }, [value, locale, decimals, compact, signed]);
    const ta = toneAttrs("vf-num", { tone });
    return (
      <span
        ref={ref}
        className={cx(ta.className, className)}
        {...ta.attrs}
        {...props}
      >
        {prefix}
        <span className="vf-num__value">{text}</span>
        {suffix}
      </span>
    );
  }
);
NumberDisplay.displayName = "NumberDisplay";

// ── CurrencyDisplay ─────────────────────────────────────────

export interface CurrencyDisplayProps
  extends Omit<HTMLAttributes<HTMLSpanElement>, "children"> {
  value: number;
  currency?: string;
  locale?: string;
  signed?: boolean;
  compact?: boolean;
  /**
   * Render positive/negative/zero with semantic tone classes.
   * Default: no tone.
   */
  autoTone?: boolean;
  decimals?: number;
}

/**
 * Locale-aware currency formatter via `Intl.NumberFormat`. Takes a numeric
 * `value`, ISO currency code, and optional precision override.
 */
export const CurrencyDisplay = forwardRef<
  HTMLSpanElement,
  CurrencyDisplayProps
>(function CurrencyDisplay(
  {
    value,
    currency = "USD",
    locale,
    signed,
    compact,
    autoTone,
    decimals,
    className,
    ...props
  },
  ref
) {
  const text = useMemo(() => {
    const options: Intl.NumberFormatOptions = {
      style: "currency",
      currency,
    };
    if (decimals !== undefined) {
      options.minimumFractionDigits = decimals;
      options.maximumFractionDigits = decimals;
    }
    if (signed) options.signDisplay = "exceptZero";
    if (compact) {
      options.notation = "compact";
      options.maximumFractionDigits ??= 2;
    }
    return new Intl.NumberFormat(locale, options).format(value);
  }, [value, currency, locale, signed, compact, decimals]);

  const tone =
    autoTone && value !== 0
      ? value > 0
        ? "success"
        : "danger"
      : undefined;

  const ta = toneAttrs("vf-currency", { tone });
  return (
    <span
      ref={ref}
      data-value={value}
      className={cx(ta.className, className)}
      {...ta.attrs}
      {...props}
    >
      {text}
    </span>
  );
});
CurrencyDisplay.displayName = "CurrencyDisplay";

// ── PercentDisplay ──────────────────────────────────────────

export interface PercentDisplayProps
  extends Omit<HTMLAttributes<HTMLSpanElement>, "children"> {
  /**
   * Value to render. By default interpreted as already in percent units
   * (`value={50}` → `"50%"`). Pass `basis="fraction"` if your value is a
   * 0-1 ratio (`value={0.5}` + `basis="fraction"` → `"50%"`).
   */
  value: number;
  /** `"percent"` (default): value is 0-100. `"fraction"`: value is 0-1. */
  basis?: "percent" | "fraction";
  decimals?: number;
  locale?: string;
  signed?: boolean;
  autoTone?: boolean;
}

/**
 * Locale-aware percentage formatter. Defaults to treating `value` as
 * already-in-percent (50 → "50%"); switch with `basis="fraction"` when
 * your source is a 0-1 ratio.
 */
export const PercentDisplay = forwardRef<
  HTMLSpanElement,
  PercentDisplayProps
>(function PercentDisplay(
  {
    value,
    basis = "percent",
    decimals = 1,
    locale,
    signed,
    autoTone,
    className,
    ...props
  },
  ref
) {
  const fraction = basis === "percent" ? value / 100 : value;
  const text = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        style: "percent",
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
        signDisplay: signed ? "exceptZero" : "auto",
      }).format(fraction),
    [fraction, locale, decimals, signed]
  );
  const tone =
    autoTone && fraction !== 0
      ? fraction > 0
        ? "success"
        : "danger"
      : undefined;
  const ta = toneAttrs("vf-percent", { tone });
  return (
    <span
      ref={ref}
      className={cx(ta.className, className)}
      {...ta.attrs}
      {...props}
    >
      {text}
    </span>
  );
});
PercentDisplay.displayName = "PercentDisplay";

// ── BigNumber ───────────────────────────────────────────────

export interface BigNumberProps extends HTMLAttributes<HTMLDivElement> {
  value: ReactNode;
  unit?: ReactNode;
  label?: ReactNode;
  delta?: ReactNode;
  /** Tone for the delta chip. */
  deltaTone?: "success" | "danger" | "warning" | "info" | "neutral";
  sparkline?: ReactNode;
  align?: "start" | "center";
  size?: "md" | "lg" | "xl";
}

/**
 * Large hero metric: value, optional delta/trend, and caption. Use inside
 * dashboards; pair with `Sparkline` for an inline trend.
 */
export const BigNumber = forwardRef<HTMLDivElement, BigNumberProps>(
  function BigNumber(
    {
      value,
      unit,
      label,
      delta,
      deltaTone = "neutral",
      sparkline,
      align = "start",
      size = "lg",
      className,
      ...props
    },
    ref
  ) {
    const ta = toneAttrs("vf-big-number", { size, variant: align });
    return (
      <div
        ref={ref}
        className={cx(ta.className, className)}
        {...ta.attrs}
        {...props}
      >
        {label && <div className="vf-big-number__label">{label}</div>}
        <div className="vf-big-number__row">
          <span className="vf-big-number__value">{value}</span>
          {unit && <span className="vf-big-number__unit">{unit}</span>}
          {delta && (
            <span
              className={cx(
                "vf-big-number__delta",
                `vf-big-number__delta--${deltaTone}`
              )}
            >
              {delta}
            </span>
          )}
        </div>
        {sparkline && (
          <div className="vf-big-number__sparkline">{sparkline}</div>
        )}
      </div>
    );
  }
);
BigNumber.displayName = "BigNumber";
