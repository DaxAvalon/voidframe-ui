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
import { warnOnce } from "../utils/warn";
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
  /**
   * @deprecated Use `onValueChange` instead. `onChange` will be removed in
   * v1.3. `onValueChange` emits both the formatted and raw strings via
   * `{ value, raw }` and matches every other voidframe form-control's
   * callback shape.
   */
  onChange?: (value: string) => void;
  /**
   * Fires on every keystroke. Receives `{ value: formatted, raw: unmasked }`
   * — preferred over `onChange` (which only emits the formatted string).
   */
  onValueChange?: (info: { value: string; raw: string }) => void;
  label?: string;
  /** Visual size variant — `"sm" | "md" | "lg"`. Default `"md"`. */
  size?: "sm" | "md" | "lg";
  /** Props forwarded to the outer wrapper `<div>`. */
  wrapperProps?: React.HTMLAttributes<HTMLDivElement>;
  style?: CSSProperties;
}

/**
 * Text input with a display mask (e.g. `###-##-####`). Emits the unmasked
 * value to `onValueChange`.
 */
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
      size = "md",
      wrapperProps,
      ...props
    },
    ref
  ) {
    if (
      process.env.NODE_ENV !== "production" &&
      onChange !== undefined &&
      onValueChange === undefined
    ) {
      warnOnce(
        "MaskedInput:onChange-deprecated",
        "<MaskedInput> `onChange` is deprecated and will be removed in v1.3. Use `onValueChange` instead — it emits both the formatted value and the raw unmasked string via `{ value, raw }`."
      );
    }
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
      <div
        className={cx("vf-masked-input", `vf-masked-input--${size}`, className)}
        data-size={size}
        style={style}
        {...wrapperProps}
      >
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

/**
 * Numeric input with currency formatting and live-masked editing. Emits the
 * raw numeric value to `onValueChange`.
 */
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

// ── Country phone data ────────────────────────────────────────

export interface PhoneCountry {
  code: string;
  name: string;
  dial: string;
  flag: string;
  mask: string;
}

/**
 * Phone country data. ~30 entries covering the most common locales.
 * Consumers can extend this via the `mask` prop override.
 */
export const PHONE_COUNTRIES: PhoneCountry[] = [
  { code: "US", name: "United States", dial: "+1", flag: "\u{1F1FA}\u{1F1F8}", mask: "(###) ###-####" },
  { code: "CA", name: "Canada", dial: "+1", flag: "\u{1F1E8}\u{1F1E6}", mask: "(###) ###-####" },
  { code: "GB", name: "United Kingdom", dial: "+44", flag: "\u{1F1EC}\u{1F1E7}", mask: "#### ### ####" },
  { code: "FR", name: "France", dial: "+33", flag: "\u{1F1EB}\u{1F1F7}", mask: "## ## ## ## ##" },
  { code: "DE", name: "Germany", dial: "+49", flag: "\u{1F1E9}\u{1F1EA}", mask: "#### #######" },
  { code: "AU", name: "Australia", dial: "+61", flag: "\u{1F1E6}\u{1F1FA}", mask: "#### ### ###" },
  { code: "JP", name: "Japan", dial: "+81", flag: "\u{1F1EF}\u{1F1F5}", mask: "###-####-####" },
  { code: "IN", name: "India", dial: "+91", flag: "\u{1F1EE}\u{1F1F3}", mask: "#####-#####" },
  { code: "BR", name: "Brazil", dial: "+55", flag: "\u{1F1E7}\u{1F1F7}", mask: "(##) #####-####" },
  { code: "MX", name: "Mexico", dial: "+52", flag: "\u{1F1F2}\u{1F1FD}", mask: "## #### ####" },
  { code: "IT", name: "Italy", dial: "+39", flag: "\u{1F1EE}\u{1F1F9}", mask: "### ### ####" },
  { code: "ES", name: "Spain", dial: "+34", flag: "\u{1F1EA}\u{1F1F8}", mask: "### ## ## ##" },
  { code: "NL", name: "Netherlands", dial: "+31", flag: "\u{1F1F3}\u{1F1F1}", mask: "## ########" },
  { code: "SE", name: "Sweden", dial: "+46", flag: "\u{1F1F8}\u{1F1EA}", mask: "##-### ## ##" },
  { code: "NO", name: "Norway", dial: "+47", flag: "\u{1F1F3}\u{1F1F4}", mask: "### ## ###" },
  { code: "DK", name: "Denmark", dial: "+45", flag: "\u{1F1E9}\u{1F1F0}", mask: "## ## ## ##" },
  { code: "FI", name: "Finland", dial: "+358", flag: "\u{1F1EB}\u{1F1EE}", mask: "## ### ####" },
  { code: "CH", name: "Switzerland", dial: "+41", flag: "\u{1F1E8}\u{1F1ED}", mask: "## ### ## ##" },
  { code: "AT", name: "Austria", dial: "+43", flag: "\u{1F1E6}\u{1F1F9}", mask: "#### ######" },
  { code: "BE", name: "Belgium", dial: "+32", flag: "\u{1F1E7}\u{1F1EA}", mask: "### ## ## ##" },
  { code: "PT", name: "Portugal", dial: "+351", flag: "\u{1F1F5}\u{1F1F9}", mask: "### ### ###" },
  { code: "PL", name: "Poland", dial: "+48", flag: "\u{1F1F5}\u{1F1F1}", mask: "### ### ###" },
  { code: "KR", name: "South Korea", dial: "+82", flag: "\u{1F1F0}\u{1F1F7}", mask: "###-####-####" },
  { code: "CN", name: "China", dial: "+86", flag: "\u{1F1E8}\u{1F1F3}", mask: "### #### ####" },
  { code: "RU", name: "Russia", dial: "+7", flag: "\u{1F1F7}\u{1F1FA}", mask: "(###) ###-##-##" },
  { code: "ZA", name: "South Africa", dial: "+27", flag: "\u{1F1FF}\u{1F1E6}", mask: "## ### ####" },
  { code: "NG", name: "Nigeria", dial: "+234", flag: "\u{1F1F3}\u{1F1EC}", mask: "### ### ####" },
  { code: "AR", name: "Argentina", dial: "+54", flag: "\u{1F1E6}\u{1F1F7}", mask: "## ####-####" },
  { code: "CL", name: "Chile", dial: "+56", flag: "\u{1F1E8}\u{1F1F1}", mask: "# #### ####" },
  { code: "NZ", name: "New Zealand", dial: "+64", flag: "\u{1F1F3}\u{1F1FF}", mask: "## ### ####" },
];

const PHONE_MASK_BY_CODE: Record<string, string> = Object.fromEntries(
  PHONE_COUNTRIES.map((c) => [c.code, c.mask])
);

export interface PhoneInputProps extends Omit<MaskedInputProps, "mask" | "onChange"> {
  /** Two-letter country code (ISO 3166-1 alpha-2). Defaults to "US". */
  country?: string;
  /** Override the mask entirely. */
  mask?: string;
  /**
   * When true, renders a `<select>` before the masked input showing country
   * flag, name, and dial code. Selecting a country updates the mask
   * automatically.
   */
  showCountrySelector?: boolean;
}

/**
 * Phone number input with display formatting via masks. When
 * `showCountrySelector` is true a country dropdown is rendered alongside the
 * input, automatically switching the mask on selection.
 */
export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  function PhoneInput({ country = "US", mask, showCountrySelector, className, style, ...props }, ref) {
    const [selectedCountry, setSelectedCountry] = useState(country);
    const resolved =
      mask ?? PHONE_MASK_BY_CODE[selectedCountry] ?? PHONE_MASK_BY_CODE.US!;

    if (showCountrySelector) {
      return (
        <div className={cx("vf-phone-input", className)} style={{ display: "flex", gap: 8, alignItems: "flex-end", ...style }}>
          <select
            className="vf-phone-input__country-select"
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            aria-label="Country"
          >
            {PHONE_COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.flag} {c.name} ({c.dial})
              </option>
            ))}
          </select>
          <MaskedInput ref={ref} mask={resolved} {...props} />
        </div>
      );
    }

    return <MaskedInput ref={ref} mask={resolved} className={className} style={style} {...props} />;
  }
);
PhoneInput.displayName = "PhoneInput";
