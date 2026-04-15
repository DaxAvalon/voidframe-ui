"use client";

// Phase 13 — Numeric displays

import {
  forwardRef,
  useMemo,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { cx } from "../utils/cx";

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
    return (
      <span
        ref={ref}
        className={cx("vf-num", tone && `vf-num--${tone}`, className)}
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

  return (
    <span
      ref={ref}
      data-value={value}
      className={cx(
        "vf-currency",
        tone && `vf-currency--${tone}`,
        className
      )}
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
   * Fraction (0.1 = 10%) by default. Pass `basis="percent"` if value is
   * already in percent units (10 = 10%).
   */
  value: number;
  basis?: "fraction" | "percent";
  decimals?: number;
  locale?: string;
  signed?: boolean;
  autoTone?: boolean;
}

export const PercentDisplay = forwardRef<
  HTMLSpanElement,
  PercentDisplayProps
>(function PercentDisplay(
  {
    value,
    basis = "fraction",
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
  return (
    <span
      ref={ref}
      className={cx(
        "vf-percent",
        tone && `vf-percent--${tone}`,
        className
      )}
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
    return (
      <div
        ref={ref}
        className={cx(
          "vf-big-number",
          `vf-big-number--${size}`,
          `vf-big-number--${align}`,
          className
        )}
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
