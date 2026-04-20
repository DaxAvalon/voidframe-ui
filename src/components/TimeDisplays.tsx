"use client";

// Phase 13 — Time zone, relative time, duration, countdown

import {
  forwardRef,
  useEffect,
  useMemo,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { cx } from "../utils/cx";

// ── TimeZoneSelect ──────────────────────────────────────────

export interface TimeZoneSelectProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (next: string) => void;
  zones?: string[];
  label?: ReactNode;
  /** Show UTC offset next to each name. */
  showOffset?: boolean;
}

/**
 * Dropdown for selecting an IANA time zone. Groups by region and shows
 * current UTC offset.
 */
export const TimeZoneSelect = forwardRef<HTMLDivElement, TimeZoneSelectProps>(
  function TimeZoneSelect(
    {
      value,
      defaultValue,
      onValueChange,
      zones,
      label = "Time zone",
      showOffset = true,
      className,
      ...props
    },
    ref
  ) {
    const list = useMemo(
      () => zones ?? listTimeZones(),
      [zones]
    );
    const [internal, setInternal] = useState(() => {
      if (defaultValue !== undefined) return defaultValue;
      if (typeof Intl !== "undefined") {
        return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
      }
      return "UTC";
    });
    const current = value ?? internal;
    const set = (next: string) => {
      if (value === undefined) setInternal(next);
      onValueChange?.(next);
    };
    const [query, setQuery] = useState("");
    const filtered = query
      ? list.filter((z) => z.toLowerCase().includes(query.toLowerCase()))
      : list;
    return (
      <div
        ref={ref}
        className={cx("vf-tz-select", className)}
        {...props}
      >
        {label && (
          <span className="vf-tz-select__label">{label}</span>
        )}
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter…"
          className="vf-tz-select__search"
          aria-label="Filter time zones"
        />
        <select
          className="vf-tz-select__select"
          value={current}
          onChange={(e) => set(e.target.value)}
          size={Math.min(8, Math.max(4, filtered.length))}
          aria-label="Time zone"
        >
          {filtered.map((z) => (
            <option key={z} value={z}>
              {z}
              {showOffset ? ` (${offsetLabel(z)})` : ""}
            </option>
          ))}
        </select>
      </div>
    );
  }
);
TimeZoneSelect.displayName = "TimeZoneSelect";

function listTimeZones(): string[] {
  if (
    typeof Intl !== "undefined" &&
    typeof (Intl as typeof Intl & { supportedValuesOf?: (k: string) => string[] })
      .supportedValuesOf === "function"
  ) {
    try {
      const supported = (
        Intl as typeof Intl & { supportedValuesOf: (k: string) => string[] }
      ).supportedValuesOf("timeZone");
      if (Array.isArray(supported) && supported.length > 0) return supported;
    } catch {
      // fall through to fallback
    }
  }
  return [
    "UTC",
    "America/Los_Angeles",
    "America/Denver",
    "America/Chicago",
    "America/New_York",
    "America/Sao_Paulo",
    "Europe/London",
    "Europe/Berlin",
    "Europe/Madrid",
    "Europe/Paris",
    "Africa/Lagos",
    "Africa/Johannesburg",
    "Asia/Dubai",
    "Asia/Kolkata",
    "Asia/Singapore",
    "Asia/Tokyo",
    "Australia/Sydney",
  ];
}

function offsetLabel(tz: string): string {
  try {
    const parts = new Intl.DateTimeFormat(undefined, {
      timeZone: tz,
      timeZoneName: "shortOffset",
    }).formatToParts(new Date());
    const offset = parts.find((p) => p.type === "timeZoneName");
    return offset?.value ?? "";
  } catch {
    return "";
  }
}

// ── RelativeTime ────────────────────────────────────────────

export interface RelativeTimeProps
  extends Omit<HTMLAttributes<HTMLTimeElement>, "children" | "dateTime"> {
  date: number | string | Date;
  /** Override the base "now" — useful for tests. */
  now?: number;
  /** Update interval in ms. Pass 0 to disable. Default 30 000. */
  updateInterval?: number;
  locale?: string;
}

/**
 * Formats a timestamp as a relative, auto-updating string (`2m ago`,
 * `yesterday`).
 */
export const RelativeTime = forwardRef<HTMLTimeElement, RelativeTimeProps>(
  function RelativeTime(
    { date, now, updateInterval = 30_000, locale, className, ...props },
    ref
  ) {
    const [, force] = useState(0);
    useEffect(() => {
      if (!updateInterval) return;
      const h = setInterval(() => force((n) => n + 1), updateInterval);
      return () => clearInterval(h);
    }, [updateInterval]);

    const target =
      date instanceof Date
        ? date
        : new Date(typeof date === "string" ? date : date);
    const base = now ?? Date.now();
    const diff = target.getTime() - base;
    const text = relativeFormat(diff, locale);
    return (
      <time
        ref={ref}
        dateTime={target.toISOString()}
        className={cx("vf-relative-time", className)}
        {...props}
      >
        {text}
      </time>
    );
  }
);
RelativeTime.displayName = "RelativeTime";

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 365 * 86_400_000],
  ["month", 30 * 86_400_000],
  ["week", 7 * 86_400_000],
  ["day", 86_400_000],
  ["hour", 3_600_000],
  ["minute", 60_000],
  ["second", 1000],
];

function relativeFormat(diffMs: number, locale?: string): string {
  const abs = Math.abs(diffMs);
  if (abs < 1000) return "just now";
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  for (const [unit, ms] of UNITS) {
    if (abs >= ms) {
      return rtf.format(Math.round(diffMs / ms), unit);
    }
  }
  return rtf.format(Math.round(diffMs / 1000), "second");
}

// ── DurationDisplay ─────────────────────────────────────────

export interface DurationDisplayProps
  extends HTMLAttributes<HTMLSpanElement> {
  seconds: number;
  format?: "hms" | "compact" | "long";
}

/**
 * Formats a millisecond duration as a human-readable string (`2m 13s`, `1h
 * 04m`, etc.). Locale-aware.
 */
export const DurationDisplay = forwardRef<
  HTMLSpanElement,
  DurationDisplayProps
>(function DurationDisplay(
  { seconds, format = "hms", className, ...props },
  ref
) {
  const text = useMemo(() => {
    const total = Math.max(0, Math.floor(seconds));
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    if (format === "compact") {
      if (total < 60) return `${total}s`;
      if (total < 3600) return `${m}m ${s}s`;
      return `${h}h ${m}m`;
    }
    if (format === "long") {
      const parts: string[] = [];
      if (h) parts.push(`${h} hour${h === 1 ? "" : "s"}`);
      if (m) parts.push(`${m} minute${m === 1 ? "" : "s"}`);
      if (s || parts.length === 0)
        parts.push(`${s} second${s === 1 ? "" : "s"}`);
      return parts.join(" ");
    }
    // hms
    const hh = String(h).padStart(2, "0");
    const mm = String(m).padStart(2, "0");
    const ss = String(s).padStart(2, "0");
    return h > 0 ? `${hh}:${mm}:${ss}` : `${mm}:${ss}`;
  }, [seconds, format]);
  return (
    <span
      ref={ref}
      className={cx("vf-duration", className)}
      {...props}
    >
      {text}
    </span>
  );
});
DurationDisplay.displayName = "DurationDisplay";

// ── Countdown ───────────────────────────────────────────────

export interface CountdownProps extends HTMLAttributes<HTMLSpanElement> {
  target: number | string | Date;
  onComplete?: () => void;
  /** Format of the remaining time. */
  format?: "hms" | "compact" | "long";
  /** Render after completion. Defaults to "0:00". */
  completedLabel?: ReactNode;
}

/**
 * Countdown timer to a target date/time. Auto-updates every second; fires
 * `onComplete` when it hits zero.
 */
export const Countdown = forwardRef<HTMLSpanElement, CountdownProps>(
  function Countdown(
    { target, onComplete, format = "hms", completedLabel, className, ...props },
    ref
  ) {
    const targetMs =
      target instanceof Date
        ? target.getTime()
        : new Date(typeof target === "string" ? target : target).getTime();
    const [now, setNow] = useState(Date.now);
    useEffect(() => {
      const tick = () => setNow(Date.now());
      const handle = setInterval(tick, 500);
      return () => clearInterval(handle);
    }, []);
    const diff = Math.max(0, targetMs - now);
    const completed = diff <= 0;
    useEffect(() => {
      if (completed) onComplete?.();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [completed]);
    return (
      <span
        ref={ref}
        className={cx(
          "vf-countdown",
          completed && "vf-countdown--done",
          className
        )}
        data-remaining-ms={diff}
        {...props}
      >
        {completed ? (
          completedLabel ?? <DurationDisplay seconds={0} format={format} />
        ) : (
          <DurationDisplay
            seconds={Math.ceil(diff / 1000)}
            format={format}
          />
        )}
      </span>
    );
  }
);
Countdown.displayName = "Countdown";
