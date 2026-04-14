// ═══════════════════════════════════════════════════════════════
// Tiny date helpers — no external deps.
// ═══════════════════════════════════════════════════════════════

/** Normalize a date to midnight local time. Returns a new Date. */
export function startOfDay(d: Date): Date {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

/** First of the month at 00:00 local. */
export function startOfMonth(d: Date): Date {
  const copy = new Date(d.getFullYear(), d.getMonth(), 1);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

/** Last day of the month at 23:59:59.999 local. */
export function endOfMonth(d: Date): Date {
  const copy = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  copy.setHours(23, 59, 59, 999);
  return copy;
}

/** Return `n` days added (negative = subtract). New Date. */
export function addDays(d: Date, n: number): Date {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + n);
  return copy;
}

/** Return `n` months added. New Date. */
export function addMonths(d: Date, n: number): Date {
  const copy = new Date(d.getFullYear(), d.getMonth() + n, d.getDate());
  copy.setHours(d.getHours(), d.getMinutes(), d.getSeconds(), d.getMilliseconds());
  // If the target day doesn't exist (Jan 31 → Feb 31), JS rolls into the
  // next month. Clamp back to the last valid day of the intended month.
  const targetMonth = (((d.getMonth() + n) % 12) + 12) % 12;
  if (copy.getMonth() !== targetMonth) {
    copy.setDate(0);
  }
  return copy;
}

/** `true` if both dates fall on the same calendar day. */
export function isSameDay(a: Date | null | undefined, b: Date | null | undefined): boolean {
  if (!a || !b) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** `true` if both dates fall in the same calendar month/year. */
export function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

/** Build the six-row grid of days for a given month, padded with prior/next month days. */
export function getMonthGrid(
  month: Date,
  firstDayOfWeek: 0 | 1 = 0
): Date[] {
  const first = startOfMonth(month);
  const firstWeekday = first.getDay(); // 0-6, Sun=0
  const leading = (firstWeekday - firstDayOfWeek + 7) % 7;
  const start = addDays(first, -leading);
  const grid: Date[] = [];
  for (let i = 0; i < 42; i++) grid.push(addDays(start, i));
  return grid;
}

/** Localized short weekday names, rotated so index 0 is firstDayOfWeek. */
export function weekdayNames(
  locale: string,
  firstDayOfWeek: 0 | 1 = 0,
  length: "narrow" | "short" = "short"
): string[] {
  const fmt = new Intl.DateTimeFormat(locale, { weekday: length });
  const base = new Date(2023, 0, 1); // Sunday
  const names: string[] = [];
  for (let i = 0; i < 7; i++) {
    const day = addDays(base, i);
    names.push(fmt.format(day));
  }
  if (firstDayOfWeek === 1) {
    return [...names.slice(1), names[0]!];
  }
  return names;
}

/** Localized month name (e.g. "March"). */
export function monthName(d: Date, locale: string, length: "long" | "short" = "long"): string {
  return new Intl.DateTimeFormat(locale, { month: length }).format(d);
}

// ── Formatting ────────────────────────────────────────────────

/**
 * Tiny token-based formatter. Supported tokens:
 *   yyyy  4-digit year
 *   yy    2-digit year
 *   MM    2-digit month
 *   M     1-2 digit month
 *   dd    2-digit day
 *   d     1-2 digit day
 *   HH    2-digit hour (24h)
 *   H     1-2 digit hour (24h)
 *   hh    2-digit hour (12h)
 *   h     1-2 digit hour (12h)
 *   mm    2-digit minute
 *   m     1-2 digit minute
 *   ss    2-digit second
 *   a     AM/PM
 *
 * For richer locale-aware formatting, prefer `Intl.DateTimeFormat` directly
 * or pass a `(d) => string` function at the call site.
 */
export function formatDate(d: Date, pattern: string): string {
  const pad = (n: number, w: number) => String(n).padStart(w, "0");
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const hours24 = d.getHours();
  const hours12 = ((hours24 + 11) % 12) + 1;
  const minutes = d.getMinutes();
  const seconds = d.getSeconds();
  const ampm = hours24 < 12 ? "AM" : "PM";

  return pattern
    .replace(/yyyy/g, String(year))
    .replace(/yy/g, pad(year % 100, 2))
    .replace(/MM/g, pad(month, 2))
    .replace(/M/g, String(month))
    .replace(/dd/g, pad(day, 2))
    .replace(/d/g, String(day))
    .replace(/HH/g, pad(hours24, 2))
    .replace(/H/g, String(hours24))
    .replace(/hh/g, pad(hours12, 2))
    .replace(/h/g, String(hours12))
    .replace(/mm/g, pad(minutes, 2))
    .replace(/m/g, String(minutes))
    .replace(/ss/g, pad(seconds, 2))
    .replace(/a/g, ampm);
}

/**
 * Parse a date string against a pattern using the same token set as
 * `formatDate`. Returns `null` on failure.
 */
export function parseDate(input: string, pattern: string): Date | null {
  if (!input) return null;

  // Walk the pattern once, emitting regex source + a group-to-token map.
  const tokens: Array<{ key: string; group: number }> = [];
  let regexSource = "";
  let groupIdx = 0;
  const tokenRe = /(yyyy|yy|MM|M|dd|d|HH|H|hh|h|mm|m|ss|a)/g;

  let lastIndex = 0;
  for (const m of pattern.matchAll(tokenRe)) {
    const start = m.index ?? 0;
    regexSource += escapeRegExp(pattern.slice(lastIndex, start));
    const tok = m[1]!;
    groupIdx++;
    tokens.push({ key: tok, group: groupIdx });
    switch (tok) {
      case "yyyy": regexSource += "(\\d{4})"; break;
      case "yy":   regexSource += "(\\d{2})"; break;
      case "MM":   regexSource += "(\\d{2})"; break;
      case "M":    regexSource += "(\\d{1,2})"; break;
      case "dd":   regexSource += "(\\d{2})"; break;
      case "d":    regexSource += "(\\d{1,2})"; break;
      case "HH":   regexSource += "(\\d{2})"; break;
      case "H":    regexSource += "(\\d{1,2})"; break;
      case "hh":   regexSource += "(\\d{2})"; break;
      case "h":    regexSource += "(\\d{1,2})"; break;
      case "mm":   regexSource += "(\\d{2})"; break;
      case "m":    regexSource += "(\\d{1,2})"; break;
      case "ss":   regexSource += "(\\d{2})"; break;
      case "a":    regexSource += "(AM|PM|am|pm)"; break;
    }
    lastIndex = start + tok.length;
  }
  regexSource += escapeRegExp(pattern.slice(lastIndex));

  const matched = new RegExp(`^${regexSource}$`).exec(input.trim());
  if (!matched) return null;

  let y = new Date().getFullYear();
  let mo = 1;
  let d = 1;
  let h = 0;
  let mi = 0;
  let s = 0;
  let pm: boolean | null = null;

  for (const tok of tokens) {
    const v = matched[tok.group]!;
    switch (tok.key) {
      case "yyyy": y = Number(v); break;
      case "yy":   y = 2000 + Number(v); break;
      case "MM":
      case "M":    mo = Number(v); break;
      case "dd":
      case "d":    d = Number(v); break;
      case "HH":
      case "H":
      case "hh":
      case "h":    h = Number(v); break;
      case "mm":
      case "m":    mi = Number(v); break;
      case "ss":   s = Number(v); break;
      case "a":    pm = v.toLowerCase() === "pm"; break;
    }
  }

  if (pm !== null) {
    if (pm && h < 12) h += 12;
    if (!pm && h === 12) h = 0;
  }

  const result = new Date(y, mo - 1, d, h, mi, s, 0);
  if (isNaN(result.getTime())) return null;
  // Reject roll-over (e.g. Feb 31 → March 3).
  if (result.getMonth() !== mo - 1 || result.getDate() !== d) return null;
  return result;
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Clamp a date to [min, max]. Either bound can be null. */
export function clampDate(d: Date, min?: Date | null, max?: Date | null): Date {
  let result = d;
  if (min && result < min) result = min;
  if (max && result > max) result = max;
  return result;
}
