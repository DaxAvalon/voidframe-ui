"use client";

// Event and trace tables.
//
//   EventLog (alias TraceTable)        dense monospace event table: id, time or range,
//                                      label, detail, tone band, kind filters, anchors,
//                                      cited highlight.
//   EventTimeline (alias RequestResponseTrace)
//                                      ordered events with optional durations, request/
//                                      response pairing and payload drill-down. For spans
//                                      with a hierarchy use `TraceViewer`.
//   ChangeTable                        field-level before → after rows with a direction
//                                      tone and an optional Verdict / Badge column.

import { forwardRef, useMemo, useState, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../utils/cx";
import type { Tone } from "../types";
import { Verdict, type VerdictValue, type VerdictKinds } from "./Verdict";

// ── shared ───────────────────────────────────────────────────────

export type EventTone = "neutral" | Tone;

function fmtTime(value: string | number | Date | undefined, base?: number): string {
  if (value === undefined || value === null) return "";
  if (typeof value === "string") return value;
  const ms = value instanceof Date ? value.getTime() : value;
  if (base !== undefined) {
    const d = ms - base;
    return d >= 1000 ? `+${(d / 1000).toFixed(2)} s` : `+${Math.round(d)} ms`;
  }
  const d = value instanceof Date ? value : new Date(ms);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleTimeString(undefined, { hour12: false }) + `.${String(d.getMilliseconds()).padStart(3, "0")}`;
}

function fmtDuration(ms: number): string {
  if (!Number.isFinite(ms)) return "";
  if (ms < 1000) return `${Math.round(ms)} ms`;
  if (ms < 60_000) return `${(ms / 1000).toFixed(2)} s`;
  return `${(ms / 60_000).toFixed(1)} min`;
}

function payloadText(payload: unknown): string {
  if (typeof payload === "string") return payload;
  try {
    return JSON.stringify(payload, null, 2);
  } catch {
    return String(payload);
  }
}

// ── EventLog ─────────────────────────────────────────────────────

export interface LogEvent {
  id: string;
  /** Instant, or the start of a range when `end` is set. */
  time?: string | number | Date;
  end?: string | number | Date;
  label: ReactNode;
  detail?: ReactNode;
  /** Category used by the kind filter. */
  kind?: string;
  tone?: EventTone;
  /** Shown in a drill-down row when `expandable`. */
  payload?: unknown;
}

export interface EventLogProps extends Omit<HTMLAttributes<HTMLDivElement>, "onSelect"> {
  events: LogEvent[];
  /** Show the kind filter chips (kinds collected from `events`, or given). Default false. */
  filterable?: boolean | string[];
  /** Controlled set of visible kinds (`undefined` = all). */
  visibleKinds?: string[];
  onVisibleKindsChange?: (kinds: string[] | undefined) => void;
  /** Ids to highlight (citations). */
  cited?: string[];
  /** Prefix for each row's DOM id so citations can link to `#${anchorPrefix}${event.id}`. Default `"event-"`. */
  anchorPrefix?: string;
  /** Click or Enter on a row. */
  onSelect?: (event: LogEvent) => void;
  /** Row with the selection grammar. */
  selectedId?: string;
  /** Format times; default `HH:MM:SS.mmm` (or the string as given). */
  formatTime?: (value: string | number | Date) => string;
  /** Show the id column. Default true. */
  showIds?: boolean;
  /** Show the time column. Default true. */
  showTime?: boolean;
  /** Rows with `payload` get a disclosure that shows it. Default false. */
  expandable?: boolean;
  /** Accessible name. Default "Event log". */
  label?: string;
  empty?: ReactNode;
  /** Tighter rows. */
  dense?: boolean;
}

/**
 * Dense monospace event table with a tone band per row, kind filters,
 * anchor ids for citations and a "cited" highlight. For session traces,
 * audit logs and wiretaps.
 */
export const EventLog = forwardRef<HTMLDivElement, EventLogProps>(function EventLog(
  {
    events,
    filterable = false,
    visibleKinds: visibleProp,
    onVisibleKindsChange,
    cited,
    anchorPrefix = "event-",
    onSelect,
    selectedId,
    formatTime = (v) => fmtTime(v),
    showIds = true,
    showTime = true,
    expandable = false,
    label = "Event log",
    empty = "No events.",
    dense,
    className,
    ...rest
  },
  ref
) {
  const kinds = useMemo(() => {
    if (Array.isArray(filterable)) return filterable;
    const set = new Set<string>();
    for (const e of events) if (e.kind) set.add(e.kind);
    return [...set];
  }, [events, filterable]);
  const [visibleInternal, setVisibleInternal] = useState<string[] | undefined>(undefined);
  const visible = visibleProp ?? visibleInternal;
  const setVisible = (next: string[] | undefined) => {
    if (visibleProp === undefined) setVisibleInternal(next);
    onVisibleKindsChange?.(next);
  };
  const [open, setOpen] = useState<Set<string>>(() => new Set());
  const citedSet = useMemo(() => new Set(cited ?? []), [cited]);
  const rows = visible ? events.filter((e) => !e.kind || visible.includes(e.kind)) : events;
  const interactive = Boolean(onSelect);
  const columns = (showIds ? 1 : 0) + (showTime ? 1 : 0) + 2;
  return (
    <div ref={ref} className={cx("vf-event-log", dense && "vf-event-log--dense", className)} {...rest}>
      {filterable && kinds.length > 0 ? (
        <div className="vf-event-log__filters" role="group" aria-label="Filter by kind">
          {kinds.map((k) => {
            const on = !visible || visible.includes(k);
            return (
              <button
                key={k}
                type="button"
                className={cx("vf-event-log__chip", on && "vf-event-log__chip--on")}
                aria-pressed={on}
                onClick={() => {
                  const current = visible ?? kinds;
                  const next = on ? current.filter((x) => x !== k) : [...current, k];
                  setVisible(next.length === kinds.length ? undefined : next);
                }}
              >
                {k}
              </button>
            );
          })}
        </div>
      ) : null}
      <table className="vf-event-log__table" aria-label={label}>
        <thead className="vf-sr-only">
          <tr>
            {showIds ? <th scope="col">Id</th> : null}
            {showTime ? <th scope="col">Time</th> : null}
            <th scope="col">Event</th>
            <th scope="col">Detail</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns} className="vf-event-log__empty">
                {empty}
              </td>
            </tr>
          ) : (
            rows.map((e) => {
              const tone = e.tone ?? "neutral";
              const isOpen = open.has(e.id);
              const hasPayload = expandable && e.payload !== undefined;
              const activate = () => onSelect?.(e);
              return (
                <EventRows
                  key={e.id}
                  columns={columns}
                  row={
                    <tr
                      id={`${anchorPrefix}${e.id}`}
                      className={cx(
                        "vf-event-log__row",
                        `vf-event-log__row--${tone}`,
                        citedSet.has(e.id) && "vf-event-log__row--cited",
                        selectedId === e.id && "vf-event-log__row--selected",
                        interactive && "vf-event-log__row--interactive"
                      )}
                      data-tone={tone !== "neutral" ? tone : undefined}
                      data-kind={e.kind}
                      data-cited={citedSet.has(e.id) || undefined}
                      data-selected={selectedId === e.id || undefined}
                      aria-selected={interactive ? selectedId === e.id : undefined}
                      tabIndex={interactive ? 0 : undefined}
                      onClick={interactive ? activate : undefined}
                      onKeyDown={
                        interactive
                          ? (ev) => {
                              if (ev.key === "Enter" || ev.key === " ") {
                                ev.preventDefault();
                                activate();
                              }
                            }
                          : undefined
                      }
                    >
                      {showIds ? <td className="vf-event-log__id">{e.id}</td> : null}
                      {showTime ? (
                        <td className="vf-event-log__time">
                          {e.time !== undefined ? formatTime(e.time) : ""}
                          {e.end !== undefined ? <span className="vf-event-log__range"> → {formatTime(e.end)}</span> : null}
                        </td>
                      ) : null}
                      <td className="vf-event-log__label">
                        {e.kind ? <span className="vf-event-log__kind">{e.kind}</span> : null}
                        {e.label}
                      </td>
                      <td className="vf-event-log__detail">
                        {e.detail}
                        {hasPayload ? (
                          <button
                            type="button"
                            className="vf-event-log__toggle"
                            aria-expanded={isOpen}
                            aria-controls={`${anchorPrefix}${e.id}-payload`}
                            onClick={(ev) => {
                              ev.stopPropagation();
                              setOpen((prev) => {
                                const next = new Set(prev);
                                if (next.has(e.id)) next.delete(e.id);
                                else next.add(e.id);
                                return next;
                              });
                            }}
                          >
                            {isOpen ? "Hide payload" : "Payload"}
                          </button>
                        ) : null}
                      </td>
                    </tr>
                  }
                  payload={
                    hasPayload && isOpen ? (
                      <tr className="vf-event-log__payload-row" id={`${anchorPrefix}${e.id}-payload`}>
                        <td colSpan={columns}>
                          <pre className="vf-event-log__payload">{payloadText(e.payload)}</pre>
                        </td>
                      </tr>
                    ) : null
                  }
                />
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
});
EventLog.displayName = "EventLog";

function EventRows({ row, payload }: { row: ReactNode; payload: ReactNode; columns: number }) {
  return (
    <>
      {row}
      {payload}
    </>
  );
}

/** Alias of `EventLog`. */
export const TraceTable = EventLog;

// ── EventTimeline ────────────────────────────────────────────────

export interface TraceEvent {
  id: string;
  /** When it happened (ms epoch or Date). */
  at: number | Date;
  /** "request", "response", "event", "error", or a domain kind. */
  kind?: string;
  label: ReactNode;
  /** Events sharing a `pairId` are drawn as one exchange (request → response). */
  pairId?: string;
  /** Explicit duration; otherwise derived from the paired event's time. */
  durationMs?: number;
  tone?: EventTone;
  payload?: unknown;
  detail?: ReactNode;
}

export interface EventTimelineProps extends Omit<HTMLAttributes<HTMLDivElement>, "onSelect"> {
  events: TraceEvent[];
  /** Zero point for the offsets column. Default the first event. */
  baseTime?: number | Date;
  /** Draw paired events as one row with the duration between them. Default true. */
  pair?: boolean;
  onSelect?: (event: TraceEvent) => void;
  /** Payload drill-down. Default true. */
  expandable?: boolean;
  label?: string;
  empty?: ReactNode;
}

const KIND_GLYPH: Record<string, string> = {
  request: "→",
  response: "←",
  error: "✕",
  event: "•",
};

function msOf(v: number | Date): number {
  return v instanceof Date ? v.getTime() : v;
}

/**
 * Ordered events with offsets from a base time, request/response pairing
 * (duration between the two) and payload drill-down. Events, not spans:
 * nothing needs a start and an end. For a span hierarchy use `TraceViewer`.
 */
export const EventTimeline = forwardRef<HTMLDivElement, EventTimelineProps>(function EventTimeline(
  { events, baseTime, pair = true, onSelect, expandable = true, label = "Event timeline", empty = "No events.", className, ...rest },
  ref
) {
  const sorted = useMemo(() => [...events].sort((a, b) => msOf(a.at) - msOf(b.at)), [events]);
  const base = baseTime !== undefined ? msOf(baseTime) : sorted.length ? msOf(sorted[0]!.at) : 0;
  const rows = useMemo(() => {
    if (!pair) return sorted.map((e) => ({ event: e, partner: undefined as TraceEvent | undefined }));
    const seen = new Set<string>();
    const out: Array<{ event: TraceEvent; partner?: TraceEvent }> = [];
    for (const e of sorted) {
      if (seen.has(e.id)) continue;
      const partner = e.pairId ? sorted.find((o) => o !== e && o.pairId === e.pairId && !seen.has(o.id)) : undefined;
      seen.add(e.id);
      if (partner) seen.add(partner.id);
      out.push({ event: e, partner });
    }
    return out;
  }, [sorted, pair]);
  const [open, setOpen] = useState<Set<string>>(() => new Set());
  const interactive = Boolean(onSelect);
  return (
    <div ref={ref} className={cx("vf-event-timeline", className)} {...rest}>
      {rows.length === 0 ? (
        <p className="vf-event-timeline__empty">{empty}</p>
      ) : (
        <ol className="vf-event-timeline__list" aria-label={label}>
          {rows.map(({ event: e, partner }) => {
            const duration = e.durationMs ?? (partner ? Math.abs(msOf(partner.at) - msOf(e.at)) : undefined);
            const tone = partner?.tone && partner.tone !== "neutral" ? partner.tone : e.tone ?? "neutral";
            const isOpen = open.has(e.id);
            const payloads = [e, partner].filter((x): x is TraceEvent => Boolean(x) && x!.payload !== undefined);
            return (
              <li
                key={e.id}
                className={cx("vf-event-timeline__item", `vf-event-timeline__item--${tone}`, partner && "vf-event-timeline__item--paired")}
                data-tone={tone !== "neutral" ? tone : undefined}
                data-kind={e.kind}
              >
                <span className="vf-event-timeline__offset">{fmtTime(e.at, base)}</span>
                <span className="vf-event-timeline__glyph" aria-hidden="true">
                  {KIND_GLYPH[e.kind ?? "event"] ?? "•"}
                </span>
                <div className="vf-event-timeline__main">
                  <div className="vf-event-timeline__head">
                    {interactive ? (
                      <button type="button" className="vf-event-timeline__label vf-event-timeline__label--button" onClick={() => onSelect?.(e)}>
                        {e.label}
                      </button>
                    ) : (
                      <span className="vf-event-timeline__label">{e.label}</span>
                    )}
                    {partner ? (
                      <span className="vf-event-timeline__partner">
                        {KIND_GLYPH[partner.kind ?? "response"] ?? "←"} {partner.label}
                      </span>
                    ) : null}
                    {duration !== undefined ? <span className="vf-event-timeline__duration">{fmtDuration(duration)}</span> : null}
                    {expandable && payloads.length > 0 ? (
                      <button
                        type="button"
                        className="vf-event-timeline__toggle"
                        aria-expanded={isOpen}
                        onClick={() =>
                          setOpen((prev) => {
                            const next = new Set(prev);
                            if (next.has(e.id)) next.delete(e.id);
                            else next.add(e.id);
                            return next;
                          })
                        }
                      >
                        {isOpen ? "Hide payload" : "Payload"}
                      </button>
                    ) : null}
                  </div>
                  {e.detail ? <div className="vf-event-timeline__detail">{e.detail}</div> : null}
                  {isOpen
                    ? payloads.map((p) => (
                        <pre key={p.id} className="vf-event-timeline__payload" data-for={p.id}>
                          {payloadText(p.payload)}
                        </pre>
                      ))
                    : null}
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
});
EventTimeline.displayName = "EventTimeline";

/** Alias of `EventTimeline`. */
export const RequestResponseTrace = EventTimeline;

// ── ChangeTable ──────────────────────────────────────────────────

export interface ChangeRow {
  label: ReactNode;
  before?: ReactNode;
  after?: ReactNode;
  /** Explicit tone; otherwise derived with `deriveTone`. */
  tone?: EventTone;
  note?: ReactNode;
  /** Optional verdict shown in the last column. */
  verdict?: VerdictValue;
  /** Any node for the last column (a Badge) when `verdict` is not used. */
  trailing?: ReactNode;
}

export interface ChangeTableProps extends HTMLAttributes<HTMLTableElement> {
  rows: ChangeRow[];
  /**
   * Tone for rows without one. Default: `success` when a numeric value moves
   * in the `direction` that is good, `danger` the other way, `neutral` when
   * unchanged or non-numeric.
   */
  deriveTone?: (row: ChangeRow) => EventTone;
  /** Which way is good for numeric values. Default `"up-good"`. */
  direction?: "up-good" | "down-good";
  /** Vocabulary for the `verdict` column. */
  verdictKinds?: VerdictKinds;
  beforeHeading?: ReactNode;
  afterHeading?: ReactNode;
  label?: string;
}

/** Default tone derivation for `ChangeTable`. */
export function changeTone(row: ChangeRow, direction: "up-good" | "down-good" = "up-good"): EventTone {
  if (row.tone) return row.tone;
  const b = typeof row.before === "number" ? row.before : Number(typeof row.before === "string" ? row.before : NaN);
  const a = typeof row.after === "number" ? row.after : Number(typeof row.after === "string" ? row.after : NaN);
  if (!Number.isFinite(a) || !Number.isFinite(b) || a === b) return "neutral";
  const up = a > b;
  return (direction === "up-good") === up ? "success" : "danger";
}

/**
 * Field-level "before → after" table with a dimmed before value, a
 * direction tone per row and an optional Verdict or custom trailing column.
 */
export const ChangeTable = forwardRef<HTMLTableElement, ChangeTableProps>(function ChangeTable(
  { rows, deriveTone, direction = "up-good", verdictKinds, beforeHeading = "Before", afterHeading = "After", label = "Changes", className, ...rest },
  ref
) {
  const hasNote = rows.some((r) => r.note !== undefined && r.note !== null);
  const hasTrailing = rows.some((r) => r.verdict !== undefined || r.trailing !== undefined);
  return (
    <table ref={ref} className={cx("vf-change-table", className)} aria-label={label} {...rest}>
      <thead>
        <tr>
          <th scope="col">Field</th>
          <th scope="col">{beforeHeading}</th>
          <th scope="col" aria-hidden="true" />
          <th scope="col">{afterHeading}</th>
          {hasNote ? <th scope="col">Note</th> : null}
          {hasTrailing ? <th scope="col">Status</th> : null}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => {
          const tone = deriveTone ? deriveTone(r) : changeTone(r, direction);
          return (
            <tr key={i} className={cx("vf-change-table__row", `vf-change-table__row--${tone}`)} data-tone={tone !== "neutral" ? tone : undefined}>
              <th scope="row" className="vf-change-table__label">
                {r.label}
              </th>
              <td className="vf-change-table__before">
                <code className="vf-code vf-code--muted">{r.before ?? "—"}</code>
              </td>
              <td className="vf-change-table__arrow" aria-hidden="true">
                →
              </td>
              <td className="vf-change-table__after">
                <code className="vf-code">{r.after ?? "—"}</code>
              </td>
              {hasNote ? <td className="vf-change-table__note">{r.note}</td> : null}
              {hasTrailing ? (
                <td className="vf-change-table__trailing">
                  {r.verdict !== undefined ? <Verdict verdict={r.verdict} kinds={verdictKinds} size="sm" /> : r.trailing}
                </td>
              ) : null}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
});
ChangeTable.displayName = "ChangeTable";
