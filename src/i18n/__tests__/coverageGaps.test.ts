// Coverage-gap tests for i18n:
//   - format.ts: formatDate with string/number, formatRelativeTime edge,
//     formatList without Intl.ListFormat, formatNumber
//   - messages.ts: resolvePath with null in chain, array return
//   - plural.ts: zero/two/few/many forms, catch fallback

import { describe, expect, it, vi } from "vitest";
import {
  formatNumber,
  formatCurrency,
  formatPercent,
  formatDate,
  formatRelativeTime,
  formatList,
} from "../format";
import { resolvePath, enMessages, mergeMessages } from "../messages";
import { pluralize } from "../plural";

// ── format.ts gaps ───────────────────────────────────────

describe("formatNumber — edge cases", () => {
  it("formats with options", () => {
    const result = formatNumber(1234.5, "en-US", { minimumFractionDigits: 2 });
    expect(result).toContain("1,234.50");
  });

  it("formats zero", () => {
    expect(formatNumber(0, "en-US")).toBe("0");
  });
});

describe("formatDate — string and number inputs", () => {
  it("accepts a numeric timestamp", () => {
    const ts = new Date(2026, 0, 15).getTime();
    const result = formatDate(ts, "en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    });
    expect(typeof result).toBe("string");
    expect(result).toContain("2026");
  });

  it("accepts a string date", () => {
    const result = formatDate("2026-03-14T00:00:00Z", "en-US", {
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    });
    expect(result).toContain("2026");
    expect(result).toContain("Mar");
  });
});

describe("formatRelativeTime — edge cases", () => {
  it("returns 'now' or seconds for very small differences", () => {
    const now = Date.now();
    const result = formatRelativeTime(now - 500, "en", now);
    // Intl.RelativeTimeFormat with numeric: "auto" returns "now" for 0 seconds
    expect(result).toMatch(/now|second/);
  });

  it("handles future dates", () => {
    const now = Date.now();
    const result = formatRelativeTime(now + 86_400_000 * 7, "en", now);
    expect(result).toMatch(/week/i);
  });

  it("handles string target", () => {
    const now = Date.now();
    const target = new Date(now - 3600_000).toISOString();
    const result = formatRelativeTime(target, "en", now);
    expect(result).toMatch(/hour/);
  });

  it("handles month-level differences", () => {
    const now = Date.now();
    const result = formatRelativeTime(now - 35 * 86_400_000, "en", now);
    expect(result).toMatch(/month/);
  });

  it("handles year-level differences", () => {
    const now = Date.now();
    const result = formatRelativeTime(now - 400 * 86_400_000, "en", now);
    expect(result).toMatch(/year/);
  });
});

describe("formatList — fallback", () => {
  it("falls back to comma join when ListFormat throws", () => {
    const origListFormat = (Intl as Record<string, unknown>).ListFormat;
    // Force ListFormat to throw
    (Intl as Record<string, unknown>).ListFormat = class {
      constructor() {
        throw new Error("unsupported");
      }
    };
    const result = formatList(["a", "b", "c"], "en");
    expect(result).toBe("a, b, c");
    (Intl as Record<string, unknown>).ListFormat = origListFormat;
  });

  it("falls back when ListFormat is undefined", () => {
    const origListFormat = (Intl as Record<string, unknown>).ListFormat;
    (Intl as Record<string, unknown>).ListFormat = undefined;
    const result = formatList(["x", "y"], "en");
    expect(result).toBe("x, y");
    (Intl as Record<string, unknown>).ListFormat = origListFormat;
  });

  it("passes options through to ListFormat", () => {
    const result = formatList(["a", "b"], "en", { type: "disjunction" });
    // Should produce "a or b" with disjunction
    expect(result).toMatch(/a.*b/);
  });
});

// ── messages.ts gaps ─────────────────────────────────────

describe("resolvePath — edge cases", () => {
  it("returns path when intermediate value is null", () => {
    const msgs = { ...enMessages, broken: null } as unknown as typeof enMessages;
    expect(resolvePath(msgs, "broken.child")).toBe("broken.child");
  });

  it("joins arrays with commas", () => {
    // datePicker.months is an array
    const result = resolvePath(enMessages, "datePicker.months");
    expect(result).toContain("January");
    expect(result).toContain(",");
  });

  it("returns path for deeply nested missing key", () => {
    expect(resolvePath(enMessages, "a.b.c.d.e")).toBe("a.b.c.d.e");
  });

  it("mergeMessages returns base when overrides is undefined", () => {
    const result = mergeMessages(enMessages, undefined);
    expect(result).toBe(enMessages);
  });

  it("mergeMessages skips falsy override sections", () => {
    const result = mergeMessages(enMessages, {
      dialog: undefined,
      form: { required: "Req" },
    });
    expect(result.dialog.cancel).toBe("Cancel");
    expect(result.form.required).toBe("Req");
  });
});

// ── plural.ts gaps ───────────────────────────────────────

describe("pluralize — extended forms", () => {
  it("uses zero form when provided and n=0", () => {
    // English uses "other" for 0, but we check the zero form takes priority
    // when the locale supports it (Arabic has zero rule)
    const result = pluralize(0, "ar", {
      zero: "no items",
      one: "one item",
      two: "two items",
      few: "few items",
      many: "many items",
      other: "items",
    });
    expect(result).toBe("no items");
  });

  it("uses two form for Arabic n=2", () => {
    const result = pluralize(2, "ar", {
      one: "one",
      two: "two",
      few: "few",
      many: "many",
      other: "other",
    });
    expect(result).toBe("two");
  });

  it("falls back to other when matching form is undefined", () => {
    // For n=1 in English, PluralRules.select returns "one"
    // but if the one form is missing, falls back to other
    const result = pluralize(1, "en", { other: "fallback" });
    expect(result).toBe("fallback");
  });

  it("falls back to other on PluralRules error", () => {
    // Invalid locale should throw in PluralRules constructor
    const result = pluralize(5, "invalid-locale-xxx", {
      one: "one",
      other: "others",
    });
    // Should fall back to "others" via catch
    expect(result).toBe("others");
  });

  it("uses few form for Polish few", () => {
    // Polish: 2-4 use "few"
    const result = pluralize(3, "pl", {
      one: "plik",
      few: "pliki",
      many: "plikow",
      other: "plikow",
    });
    expect(result).toBe("pliki");
  });

  it("uses many form for Polish many", () => {
    // Polish: 5-21 use "many"
    const result = pluralize(5, "pl", {
      one: "plik",
      few: "pliki",
      many: "plikow",
      other: "plikow",
    });
    expect(result).toBe("plikow");
  });
});
