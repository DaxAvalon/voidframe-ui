"use client";

// Phase 7.3 — MaskedInput + CurrencyInput + PhoneInput
//
// MaskedInput applies a positional mask to the input, using these tokens:
//   #  digit    [0-9]
//   A  letter   [A-Za-z]
//   *  any char
// Anything else in the pattern is a literal separator that auto-fills.
//
// Example: "(###) ###-####" for US phone, "####-####-####-####" for credit card,
// "####-##-##" for ISO date, "AA-###" for license plate.
//
// CurrencyInput and PhoneInput sit on top of either plain input formatting
// (Currency) or a default mask (Phone).

import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type FocusEvent,
  type InputHTMLAttributes,
} from "react";
import { useControllableState } from "../hooks/useControllableState";
import { useId } from "../hooks/useId";
import { useMergedRefs } from "../hooks/useMergedRefs";
import { cx } from "../utils/cx";
import { Label } from "./Text";

// ── mask engine ───────────────────────────────────────────────

const TOKEN_TESTERS: Record<string, (ch: string) => boolean> = {
  "#": (c) => /\d/.test(c),
  A: (c) => /[A-Za-z]/.test(c),
  "*": () => true,
};

function isToken(char: string): boolean {
  return Object.prototype.hasOwnProperty.call(TOKEN_TESTERS, char);
}

/** Apply a mask to a raw string, returning the formatted result. */
export function applyMask(raw: string, mask: string): string {
  let out = "";
  let ri = 0;
  for (let mi = 0; mi < mask.length; mi++) {
    const m = mask[mi]!;
    if (isToken(m)) {
      if (ri >= raw.length) break;
      while (ri < raw.length && !TOKEN_TESTERS[m]!(raw[ri]!)) ri++;
      if (ri >= raw.length) break;
      out += raw[ri];
      ri++;
    } else {
      out += m;
      // If the user typed the literal separator, advance over it.
      if (ri < raw.length && raw[ri] === m) ri++;
    }
  }
  return out;
}

/** Strip a formatted value down to the raw characters the mask cares about. */
export function stripMask(formatted: string, mask: string): string {
  let out = "";
  let fi = 0;
  for (let mi = 0; mi < mask.length && fi < formatted.length; mi++) {
    const m = mask[mi]!;
    const f = formatted[fi]!;
    if (isToken(m)) {
      if (TOKEN_TESTERS[m]!(f)) {
        out += f;
        fi++;
      } else {
        fi++;
        mi--;
      }
    } else {
      if (f === m) fi++;
    }
  }
  return out;
}

// ── MaskedInput ───────────────────────────────────────────────

type InputBase = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "onChange" | "value" | "defaultValue" | "type" | "size"
>;

export interface MaskedInputProps extends InputBase {
  mask: string;
  /** Emits the formatted string. */
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** Also emit the raw (unmasked) string alongside the formatted one. */
  onValueChange?: (info: { value: string; raw: string }) => void;
  label?: string;
  style?: CSSProperties;
}

export const MaskedInput = forwardRef<HTMLInputElement, MaskedInputProps>(
  function MaskedInput(
    {
      mask,
      value,
      defaultValue,
      onChange,
      onValueChange,
      label,
      className,
      style,
      id,
      placeholder,
      ...props
    },
    ref
  ) {
    const [current, setCurrent] = useControllableState<string>({
      value,
      defaultValue: defaultValue ?? "",
      onChange,
      componentName: "MaskedInput",
    });

    const formatted = useMemo(() => applyMask(current, mask), [current, mask]);
    const inputId = useId(id);
    const mergedRef = useMergedRefs(ref);

    const handleChange = useCallback(
      (e: ChangeEvent<HTMLInputElement>) => {
        const next = applyMask(e.target.value, mask);
        setCurrent(next);
        if (onValueChange) {
          onValueChange({ value: next, raw: stripMask(next, mask) });
        }
      },
      [mask, setCurrent, onValueChange]
    );

    return (
      <div className={cx("vf-masked-input", className)} style={style}>
        {label && (
          <Label as="label" htmlFor={inputId}>
            {label}
          </Label>
        )}
        <input
          ref={mergedRef}
          id={inputId}
          type="text"
          inputMode={mask.includes("#") && !mask.includes("A") ? "numeric" : "text"}
          className="vf-input"
          value={formatted}
          onChange={handleChange}
          placeholder={placeholder ?? mask.replace(/#/g, "_").replace(/A/g, "_").replace(/\*/g, "_")}
          {...props}
        />
      </div>
    );
  }
);
MaskedInput.displayName = "MaskedInput";

// ── CurrencyInput ─────────────────────────────────────────────

export interface CurrencyInputProps extends InputBase {
  /** Controlled numeric value (null = empty). */
  value?: number | null;
  defaultValue?: number | null;
  onChange?: (value: number | null) => void;
  label?: string;
  /** ISO 4217 code. Default "USD". */
  currency?: string;
  /** BCP-47 locale. Default uses navigator.language. */
  locale?: string;
  /** Allow negative values. */
  allowNegative?: boolean;
  /** Max fraction digits (default taken from Intl for the currency). */
  maximumFractionDigits?: number;
  /** Min fraction digits (default 2 for most currencies). */
  minimumFractionDigits?: number;
  style?: CSSProperties;
}

function defaultLocale(): string {
  if (typeof navigator !== "undefined" && navigator.language) return navigator.language;
  return "en-US";
}

export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  function CurrencyInput(
    {
      value,
      defaultValue,
      onChange,
      label,
      currency = "USD",
      locale = defaultLocale(),
      allowNegative = false,
      maximumFractionDigits,
      minimumFractionDigits,
      className,
      style,
      id,
      placeholder,
      disabled,
      onFocus,
      onBlur,
      ...props
    },
    ref
  ) {
    const [current, setCurrent] = useControllableState<number | null>({
      value,
      defaultValue: defaultValue ?? null,
      onChange,
      componentName: "CurrencyInput",
    });
    const inputId = useId(id);
    const mergedRef = useMergedRefs(ref);

    const formatter = useMemo(
      () =>
        new Intl.NumberFormat(locale, {
          style: "currency",
          currency,
          maximumFractionDigits,
          minimumFractionDigits,
        }),
      [locale, currency, maximumFractionDigits, minimumFractionDigits]
    );

    const decimalSep = useMemo(() => {
      const parts = new Intl.NumberFormat(locale).formatToParts(1.1);
      return parts.find((p) => p.type === "decimal")?.value ?? ".";
    }, [locale]);

    const format = useCallback(
      (n: number | null) =>
        n === null || Number.isNaN(n) ? "" : formatter.format(n),
      [formatter]
    );

    const [text, setText] = useState<string>(() => format(current));
    const [focused, setFocused] = useState(false);

    // Keep text in sync when the controlled value changes externally (and we're
    // not actively editing).
    useEffect(() => {
      if (!focused) setText(format(current));
    }, [current, focused, format]);

    const parseText = useCallback(
      (raw: string): number | null => {
        if (raw.trim() === "") return null;
        const kept = raw
          .split("")
          .filter(
            (c) => /\d/.test(c) || (allowNegative && c === "-") || c === decimalSep
          )
          .join("");
        if (kept === "" || kept === "-") return null;
        const normalized = kept.replace(decimalSep, ".");
        const num = Number(normalized);
        return Number.isNaN(num) ? null : num;
      },
      [allowNegative, decimalSep]
    );

    const handleChange = useCallback(
      (e: ChangeEvent<HTMLInputElement>) => {
        const next = e.target.value;
        setText(next);
        const parsed = parseText(next);
        setCurrent(parsed);
      },
      [parseText, setCurrent]
    );

    const handleFocus = useCallback(
      (e: FocusEvent<HTMLInputElement>) => {
        setFocused(true);
        // Show raw digit string while editing so typing isn't fighting the formatter.
        if (current !== null) setText(String(current));
        onFocus?.(e);
      },
      [current, onFocus]
    );

    const handleBlur = useCallback(
      (e: FocusEvent<HTMLInputElement>) => {
        setFocused(false);
        setText(format(current));
        onBlur?.(e);
      },
      [current, format, onBlur]
    );

    return (
      <div className={cx("vf-currency-input", className)} style={style}>
        {label && (
          <Label as="label" htmlFor={inputId}>
            {label}
          </Label>
        )}
        <input
          ref={mergedRef}
          id={inputId}
          type="text"
          inputMode="decimal"
          className="vf-input"
          value={text}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder ?? formatter.format(0)}
          disabled={disabled}
          {...props}
        />
      </div>
    );
  }
);
CurrencyInput.displayName = "CurrencyInput";

// ── PhoneInput ────────────────────────────────────────────────

// Common masks by country code. Keep this small and extensible via `mask` prop
// rather than shipping a full libphonenumber.
const DEFAULT_PHONE_MASKS: Record<string, string> = {
  US: "(###) ###-####",
  CA: "(###) ###-####",
  GB: "#### ### ####",
  FR: "## ## ## ## ##",
  DE: "#### #######",
  AU: "#### ### ###",
  JP: "###-####-####",
  IN: "#####-#####",
};

export interface PhoneInputProps extends Omit<MaskedInputProps, "mask"> {
  /** Two-letter country code (ISO 3166-1 alpha-2). Defaults to "US". */
  country?: keyof typeof DEFAULT_PHONE_MASKS | string;
  /** Override the mask entirely. */
  mask?: string;
}

export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  function PhoneInput({ country = "US", mask, ...props }, ref) {
    const resolved =
      mask ?? DEFAULT_PHONE_MASKS[country] ?? DEFAULT_PHONE_MASKS.US!;
    return <MaskedInput ref={ref} mask={resolved} {...props} />;
  }
);
PhoneInput.displayName = "PhoneInput";
