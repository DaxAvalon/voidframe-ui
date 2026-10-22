// Chat tier helpers: timestamp formatting, day labels, sender grouping and
// transcript export. Pure functions; the components call them, and apps
// that render their own transcript can too.

import type { ReactNode } from "react";
import type { MessageAuthor, MessagePart, MessageRole } from "./Conversation";

export type TimestampInput = Date | string | number | ReactNode;

/** True for a value `formatTimestamp` will turn into text: a Date, an epoch number, or an ISO-like string. */
export function isDateLike(value: unknown): value is Date | string | number {
  if (value instanceof Date) return !Number.isNaN(value.getTime());
  if (typeof value === "number") return Number.isFinite(value);
  if (typeof value === "string") {
    // Only strings that look like dates; "just now" or "10 min ago" pass through untouched.
    if (!/^\d{4}-\d{2}-\d{2}/.test(value) && !/^\d{10,13}$/.test(value)) return false;
    return !Number.isNaN(new Date(value).getTime());
  }
  return false;
}

export function toDate(value: Date | string | number): Date {
  if (value instanceof Date) return value;
  if (typeof value === "number") return new Date(value);
  return /^\d{10,13}$/.test(value) ? new Date(Number(value)) : new Date(value);
}

export interface FormatTimestampOptions {
  locale?: string;
  timeZone?: string;
  /** `time` (default) "14:05"; `datetime` adds the date when not today; `relative` "3 min ago". */
  style?: "time" | "datetime" | "relative";
  now?: Date;
}

/** Format a date-like timestamp for a chat message in the given locale; other nodes return unchanged. */
export function formatTimestamp(value: TimestampInput, options: FormatTimestampOptions = {}): ReactNode {
  if (!isDateLike(value)) return value as ReactNode;
  const d = toDate(value);
  const { locale = "en", timeZone, style = "time", now = new Date() } = options;
  if (style === "relative") {
    const diff = Math.round((now.getTime() - d.getTime()) / 1000);
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
    if (Math.abs(diff) < 60) return rtf.format(-diff, "second");
    if (Math.abs(diff) < 3600) return rtf.format(-Math.round(diff / 60), "minute");
    if (Math.abs(diff) < 86400) return rtf.format(-Math.round(diff / 3600), "hour");
    return rtf.format(-Math.round(diff / 86400), "day");
  }
  const sameDay = d.toDateString() === now.toDateString();
  const opts: Intl.DateTimeFormatOptions =
    style === "datetime" && !sameDay
      ? { hour: "2-digit", minute: "2-digit", month: "short", day: "numeric", timeZone }
      : { hour: "2-digit", minute: "2-digit", timeZone };
  return new Intl.DateTimeFormat(locale, opts).format(d);
}

export interface DayLabelOptions {
  locale?: string;
  now?: Date;
  /** Words for the two nearest days. Default English. */
  labels?: { today?: string; yesterday?: string };
}

/** "Today", "Yesterday", a weekday name within the last week, else a short date. */
export function dayLabel(value: Date | string | number, options: DayLabelOptions = {}): string {
  const d = toDate(value);
  const { locale = "en", now = new Date(), labels } = options;
  const startOf = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const days = Math.round((startOf(now) - startOf(d)) / 86_400_000);
  if (days === 0) return labels?.today ?? "Today";
  if (days === 1) return labels?.yesterday ?? "Yesterday";
  if (days > 1 && days < 7) return new Intl.DateTimeFormat(locale, { weekday: "long" }).format(d);
  const sameYear = d.getFullYear() === now.getFullYear();
  return new Intl.DateTimeFormat(locale, sameYear ? { month: "long", day: "numeric" } : { year: "numeric", month: "short", day: "numeric" }).format(d);
}

/** Same calendar day in local time. */
export function isSameDay(a: Date | string | number, b: Date | string | number): boolean {
  const x = toDate(a);
  const y = toDate(b);
  return x.getFullYear() === y.getFullYear() && x.getMonth() === y.getMonth() && x.getDate() === y.getDate();
}

export interface GroupMessagesOptions<M> {
  /** Who sent it; consecutive messages with the same id group. */
  getSenderId: (m: M) => string | undefined;
  /** When it was sent; used by `breakAfterMs` and date dividers. */
  getTimestamp?: (m: M) => Date | string | number | undefined;
  /** Start a new group when more than this many ms passed since the previous message. Default 5 minutes. */
  breakAfterMs?: number;
  /** Extra rule: return true to force a new group before `m`. */
  breakOn?: (m: M, previous: M) => boolean;
}

export interface MessageGroupOf<M> {
  senderId: string | undefined;
  messages: M[];
  /** Timestamp of the first message, when available. */
  startedAt?: Date;
}

/** Group consecutive messages by sender, breaking on time gaps or a custom rule. */
export function groupMessagesBySender<M>(messages: readonly M[], options: GroupMessagesOptions<M>): MessageGroupOf<M>[] {
  const { getSenderId, getTimestamp, breakAfterMs = 5 * 60_000, breakOn } = options;
  const groups: MessageGroupOf<M>[] = [];
  let prev: M | undefined;
  for (const m of messages) {
    const sender = getSenderId(m);
    const ts = getTimestamp?.(m);
    const last = groups[groups.length - 1];
    let fresh = !last || last.senderId !== sender;
    if (!fresh && prev && getTimestamp) {
      const pts = getTimestamp(prev);
      if (ts !== undefined && pts !== undefined && toDate(ts).getTime() - toDate(pts).getTime() > breakAfterMs) fresh = true;
    }
    if (!fresh && prev && breakOn?.(m, prev)) fresh = true;
    if (fresh || !last) {
      groups.push({ senderId: sender, messages: [m], startedAt: ts !== undefined ? toDate(ts) : undefined });
    } else {
      last.messages.push(m);
    }
    prev = m;
  }
  return groups;
}

// ── Export ─────────────────────────────────────────────────

export interface ExportableMessage {
  id?: string;
  role?: MessageRole;
  author?: MessageAuthor;
  authorId?: string;
  timestamp?: Date | string | number;
  content: string | MessagePart[];
}

function partToMarkdown(p: MessagePart): string {
  switch (p.type) {
    case "text":
      return p.text;
    case "code":
      return `\`\`\`${p.language ?? ""}\n${p.code}\n\`\`\``;
    case "tool_use":
      return `**Tool call:** \`${p.name}\`${p.args !== undefined ? `\n\`\`\`json\n${JSON.stringify(p.args, null, 2)}\n\`\`\`` : ""}`;
    case "tool_result":
      return `**Tool result${p.error ? " (error)" : ""}:** \`${p.name}\`\n\`\`\`json\n${JSON.stringify(p.result, null, 2)}\n\`\`\``;
    case "thinking":
      return `> _${p.content}_`;
  }
}

export interface ExportOptions {
  /** Resolves an author for a message when `message.author` is absent. */
  authors?: Record<string, MessageAuthor>;
  /** Document title. */
  title?: string;
  locale?: string;
  /** Include timestamps. Default true. */
  timestamps?: boolean;
}

function authorName(m: ExportableMessage, authors?: Record<string, MessageAuthor>): string {
  const a = m.author ?? (m.authorId ? authors?.[m.authorId] : undefined);
  return a?.name ?? a?.role ?? m.role ?? "unknown";
}

/** A conversation as Markdown: a heading per message with author and time, parts as paragraphs and fences. */
export function exportConversationMarkdown(messages: readonly ExportableMessage[], options: ExportOptions = {}): string {
  const { authors, title, locale = "en", timestamps = true } = options;
  const lines: string[] = [];
  if (title) lines.push(`# ${title}`, "");
  for (const m of messages) {
    const when =
      timestamps && m.timestamp !== undefined && isDateLike(m.timestamp)
        ? ` · ${new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(toDate(m.timestamp))}`
        : "";
    lines.push(`### ${authorName(m, authors)}${when}`, "");
    const body = typeof m.content === "string" ? m.content : m.content.map(partToMarkdown).join("\n\n");
    lines.push(body, "");
  }
  return lines.join("\n").trimEnd() + "\n";
}

export interface ExportedConversation {
  title?: string;
  exportedAt: string;
  messages: Array<{
    id?: string;
    role?: MessageRole;
    author?: { id?: string; name?: string; role?: string };
    timestamp?: string;
    content: string | MessagePart[];
  }>;
}

/** A conversation as a plain JSON structure (avatars and other nodes dropped). */
export function exportConversationJson(messages: readonly ExportableMessage[], options: ExportOptions = {}): ExportedConversation {
  const { authors, title } = options;
  return {
    title,
    exportedAt: new Date().toISOString(),
    messages: messages.map((m) => {
      const a = m.author ?? (m.authorId ? authors?.[m.authorId] : undefined);
      return {
        id: m.id,
        role: m.role,
        author: a ? { id: a.id, name: a.name, role: a.role } : undefined,
        timestamp: m.timestamp !== undefined && isDateLike(m.timestamp) ? toDate(m.timestamp).toISOString() : undefined,
        content: m.content,
      };
    }),
  };
}
