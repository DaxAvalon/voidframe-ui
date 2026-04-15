// Phase 17 — Locale-aware formatting helpers
//
// Thin wrappers around `Intl.*` APIs. Every helper accepts a `locale`
// argument for explicit control and falls back to the environment's
// default otherwise.

export function formatNumber(
  n: number,
  locale?: string,
  options?: Intl.NumberFormatOptions
): string {
  return new Intl.NumberFormat(locale, options).format(n);
}

export function formatCurrency(
  n: number,
  currency = "USD",
  locale?: string,
  options?: Intl.NumberFormatOptions
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    ...options,
  }).format(n);
}

export function formatPercent(
  fraction: number,
  locale?: string,
  options?: Intl.NumberFormatOptions
): string {
  return new Intl.NumberFormat(locale, {
    style: "percent",
    ...options,
  }).format(fraction);
}

export function formatDate(
  date: Date | number | string,
  locale?: string,
  options?: Intl.DateTimeFormatOptions
): string {
  const d =
    date instanceof Date
      ? date
      : new Date(typeof date === "number" ? date : date);
  return new Intl.DateTimeFormat(locale, options).format(d);
}

const RELATIVE_UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 365 * 86_400_000],
  ["month", 30 * 86_400_000],
  ["week", 7 * 86_400_000],
  ["day", 86_400_000],
  ["hour", 3_600_000],
  ["minute", 60_000],
  ["second", 1000],
];

/**
 * "in 3 hours" / "2 minutes ago". Chooses the largest unit whose
 * absolute value is at least 1 and formats it via
 * `Intl.RelativeTimeFormat`.
 */
export function formatRelativeTime(
  target: Date | number | string,
  locale?: string,
  now = Date.now()
): string {
  const targetMs =
    target instanceof Date
      ? target.getTime()
      : new Date(typeof target === "number" ? target : target).getTime();
  const diff = targetMs - now;
  const abs = Math.abs(diff);
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  for (const [unit, ms] of RELATIVE_UNITS) {
    if (abs >= ms) return rtf.format(Math.round(diff / ms), unit);
  }
  return rtf.format(Math.round(diff / 1000), "second");
}

export interface ListFormatOptions {
  localeMatcher?: "lookup" | "best fit";
  type?: "conjunction" | "disjunction" | "unit";
  style?: "long" | "short" | "narrow";
}

export function formatList(
  items: string[],
  locale?: string,
  options?: ListFormatOptions
): string {
  const IntlAny = Intl as unknown as {
    ListFormat?: new (
      locale?: string,
      options?: ListFormatOptions
    ) => { format(items: Iterable<string>): string };
  };
  if (!IntlAny.ListFormat) return items.join(", ");
  try {
    return new IntlAny.ListFormat(locale, {
      style: "long",
      type: "conjunction",
      ...options,
    }).format(items);
  } catch {
    return items.join(", ");
  }
}
