"use client";

// Phase 12 — Session list, conversation header, empty state

import {
  forwardRef,
  useMemo,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { useControllableState } from "../hooks/useControllableState";
import { cx } from "../utils/cx";
import { LiveIndicator } from "./LiveIndicator";

// ── Session types ───────────────────────────────────────────

export type SessionStatus = "idle" | "typing" | "awaiting" | "error";

export interface ChatSessionEntry {
  id: string;
  title: ReactNode;
  lastMessage?: ReactNode;
  updatedAt?: number | Date;
  pinned?: boolean;
  /** Unread messages; shown as a count badge (and `aria-label`ed). */
  unreadCount?: number;
  /** `typing`: the agent is responding; `awaiting`: it waits for the user; `error`: the last turn failed. */
  status?: SessionStatus;
  /** Per-session colour (a CSS colour or `var(--vf-…)`): a leading stripe. */
  accent?: string;
  /** Row-level render slot for extra controls or a context menu trigger. */
  renderActions?: (session: ChatSessionEntry) => ReactNode;
  /** Anything else the app needs on the row (model name, project). */
  meta?: ReactNode;
}

export type SessionGroupBy = "day" | "pinned" | "none";

/** A custom section: label, member ids in order, initial open state. */
export interface SessionGroup {
  id?: string;
  label: ReactNode;
  ids: string[];
  /** Default true. */
  defaultOpen?: boolean;
}

const STATUS_WORD: Record<SessionStatus, string> = {
  idle: "",
  typing: "responding",
  awaiting: "waiting for you",
  error: "failed",
};

// ── SessionListItem ─────────────────────────────────────────

export interface SessionListItemProps extends HTMLAttributes<HTMLDivElement> {
  session: ChatSessionEntry;
  active?: boolean;
  onSelect?: () => void;
  onDelete?: () => void;
  onRename?: () => void;
  onPin?: () => void;
}

/**
 * Single row in `SessionList`: title, preview, timestamp, unread state.
 */
export const SessionListItem = forwardRef<
  HTMLDivElement,
  SessionListItemProps
>(function SessionListItem(
  { session, active, onSelect, onDelete, onRename, onPin, className, style, ...props },
  ref
) {
  const unread = session.unreadCount ?? 0;
  const status = session.status && session.status !== "idle" ? session.status : undefined;
  const nameParts = [
    typeof session.title === "string" ? session.title : undefined,
    unread > 0 ? `${unread} unread` : undefined,
    status ? STATUS_WORD[status] : undefined,
  ].filter(Boolean);
  const extra = session.renderActions?.(session);
  return (
    <div
      ref={ref}
      role="option"
      aria-selected={active}
      data-active={active || undefined}
      data-status={status}
      data-unread={unread > 0 ? unread : undefined}
      className={cx(
        "vf-session-item",
        active && "vf-session-item--active",
        session.pinned && "vf-session-item--pinned",
        unread > 0 && "vf-session-item--unread",
        status && `vf-session-item--${status}`,
        session.accent && "vf-session-item--accented",
        className
      )}
      style={session.accent ? ({ "--vf-session-accent": session.accent, ...style } as CSSProperties) : style}
      {...props}
    >
      <button
        type="button"
        className="vf-session-item__button"
        onClick={onSelect}
        aria-label={nameParts.length > 1 ? nameParts.join(", ") : undefined}
      >
        {session.pinned && (
          <span className="vf-session-item__pin" aria-hidden="true">
            ★
          </span>
        )}
        <span className="vf-session-item__content">
          <span className="vf-session-item__title-row">
            <span className="vf-session-item__title">{session.title}</span>
            {session.meta && <span className="vf-session-item__meta">{session.meta}</span>}
          </span>
          {status === "typing" ? (
            <span className="vf-session-item__preview vf-session-item__preview--status">
              <LiveIndicator kind="typing" size="sm" label="Responding" className="vf-session-item__status-indicator" />
            </span>
          ) : status ? (
            <span className="vf-session-item__preview vf-session-item__preview--status" data-status={status}>
              {STATUS_WORD[status]}
            </span>
          ) : (
            session.lastMessage && (
              <span className="vf-session-item__preview">{session.lastMessage}</span>
            )
          )}
        </span>
        <span className="vf-session-item__trailing">
          {session.updatedAt && (
            <span className="vf-session-item__time">
              {formatTime(session.updatedAt)}
            </span>
          )}
          {unread > 0 && (
            <span className="vf-session-item__unread" aria-hidden="true">
              {unread > 99 ? "99+" : unread}
            </span>
          )}
        </span>
      </button>
      {(onPin || onRename || onDelete || extra) && (
        <div className="vf-session-item__actions">
          {extra}
          {onPin && (
            <button
              type="button"
              className="vf-session-item__action"
              aria-label={session.pinned ? "Unpin" : "Pin"}
              onClick={onPin}
            >
              ★
            </button>
          )}
          {onRename && (
            <button
              type="button"
              className="vf-session-item__action"
              aria-label="Rename"
              onClick={onRename}
            >
              ✎
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              className="vf-session-item__action"
              aria-label="Delete"
              onClick={onDelete}
            >
              ✕
            </button>
          )}
        </div>
      )}
    </div>
  );
});
SessionListItem.displayName = "SessionListItem";

function formatTime(value: number | Date): string {
  const date = value instanceof Date ? value : new Date(value);
  const now = Date.now();
  const diff = now - date.getTime();
  if (diff < 60_000) return "now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h`;
  if (diff < 7 * 86_400_000) return `${Math.floor(diff / 86_400_000)}d`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

// ── SessionList ─────────────────────────────────────────────

export interface SessionListProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onSelect"> {
  sessions: ChatSessionEntry[];
  activeId?: string;
  onSelect?: (id: string) => void;
  onDelete?: (id: string) => void;
  onRename?: (id: string) => void;
  onPin?: (id: string) => void;
  searchable?: boolean;
  groupBy?: SessionGroupBy;
  /**
   * Custom sections instead of `groupBy` (needs attention, active, in
   * review, done, archived…): each lists member ids in display order and
   * can start collapsed. Sessions in no group render after the last one
   * under `ungroupedLabel`.
   */
  groups?: SessionGroup[];
  /** Label of the trailing section for sessions no custom group claims. Default "Other". */
  ungroupedLabel?: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  emptyState?: ReactNode;
}

/**
 * Sidebar list of chat sessions with titles, timestamps, and unread badges.
 * Pairs with `ChatLayout`.
 */
export const SessionList = forwardRef<HTMLDivElement, SessionListProps>(
  function SessionList(
    {
      sessions,
      activeId,
      onSelect,
      onDelete,
      onRename,
      onPin,
      searchable = false,
      groupBy = "day",
      groups: customGroups,
      ungroupedLabel = "Other",
      header,
      footer,
      emptyState,
      className,
      ...props
    },
    ref
  ) {
    const [query, setQuery] = useState("");
    const filtered = useMemo(() => {
      if (!query.trim()) return sessions;
      const q = query.toLowerCase();
      return sessions.filter((s) =>
        String(s.title).toLowerCase().includes(q) ||
        String(s.lastMessage ?? "").toLowerCase().includes(q)
      );
    }, [sessions, query]);

    const groups = useMemo<{ id: string; label: ReactNode; items: ChatSessionEntry[]; defaultOpen: boolean }[]>(() => {
      if (customGroups) {
        const byId = new Map(filtered.map((s) => [s.id, s]));
        const claimed = new Set<string>();
        const out = customGroups.map((g, i) => {
          const items = g.ids.map((id) => byId.get(id)).filter((s): s is ChatSessionEntry => !!s);
          items.forEach((s) => claimed.add(s.id));
          return { id: g.id ?? `g${i}`, label: g.label, items, defaultOpen: g.defaultOpen ?? true };
        });
        const rest = filtered.filter((s) => !claimed.has(s.id));
        if (rest.length) out.push({ id: "ungrouped", label: ungroupedLabel, items: rest, defaultOpen: true });
        return out.filter((g) => g.items.length > 0);
      }
      return groupSessions(filtered, groupBy).map((g) => ({ id: g.label || "all", label: g.label, items: g.items, defaultOpen: true }));
    }, [filtered, groupBy, customGroups, ungroupedLabel]);
    const [closed, setClosed] = useState<Set<string>>(new Set());
    const toggleGroup = (id: string) =>
      setClosed((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });

    return (
      <aside
        ref={ref}
        className={cx("vf-session-list", className)}
        aria-label="Chat sessions"
        {...props}
      >
        {header && <header className="vf-session-list__header">{header}</header>}
        {searchable && (
          <div className="vf-session-list__search">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search sessions…"
              className="vf-session-list__search-input"
              aria-label="Search sessions"
            />
          </div>
        )}
        <div className="vf-session-list__groups" role="listbox">
          {filtered.length === 0
            ? emptyState ?? (
                <div className="vf-session-list__empty">No sessions</div>
              )
            : groups.map((group) => {
                const collapsible = !!customGroups;
                const isOpen = collapsible ? (closed.has(group.id) ? false : group.defaultOpen ? true : closed.has(`!${group.id}`)) : true;
                return (
                <section
                  key={group.id}
                  className={cx("vf-session-list__group", collapsible && !isOpen && "vf-session-list__group--closed")}
                  aria-label={typeof group.label === "string" ? group.label : undefined}
                  data-open={collapsible ? (isOpen ? "true" : "false") : undefined}
                >
                  {group.label !== "" && (collapsible ? (
                    <button
                      type="button"
                      className="vf-session-list__group-label vf-session-list__group-toggle"
                      aria-expanded={isOpen}
                      onClick={() => {
                        // Groups that start closed are tracked with a "!" key so one set covers both directions.
                        if (group.defaultOpen) toggleGroup(group.id);
                        else toggleGroup(`!${group.id}`);
                      }}
                    >
                      <span aria-hidden="true">{isOpen ? "▾" : "▸"}</span>
                      {group.label}
                      <span className="vf-session-list__group-count">{group.items.length}</span>
                    </button>
                  ) : (
                    <header className="vf-session-list__group-label">
                      {group.label}
                    </header>
                  ))}
                  {isOpen && group.items.map((session) => (
                    <SessionListItem
                      key={session.id}
                      session={session}
                      active={session.id === activeId}
                      onSelect={onSelect ? () => onSelect(session.id) : undefined}
                      onDelete={onDelete ? () => onDelete(session.id) : undefined}
                      onRename={onRename ? () => onRename(session.id) : undefined}
                      onPin={onPin ? () => onPin(session.id) : undefined}
                    />
                  ))}
                </section>
                );
              })}
        </div>
        {footer && <footer className="vf-session-list__footer">{footer}</footer>}
      </aside>
    );
  }
);
SessionList.displayName = "SessionList";

function groupSessions(
  sessions: ChatSessionEntry[],
  groupBy: SessionGroupBy
): { label: string; items: ChatSessionEntry[] }[] {
  if (groupBy === "none") return [{ label: "", items: sessions }];
  if (groupBy === "pinned") {
    const pinned = sessions.filter((s) => s.pinned);
    const rest = sessions.filter((s) => !s.pinned);
    const out: { label: string; items: ChatSessionEntry[] }[] = [];
    if (pinned.length) out.push({ label: "Pinned", items: pinned });
    if (rest.length) out.push({ label: "All", items: rest });
    return out;
  }
  // groupBy === "day"
  const now = Date.now();
  const order = [
    "Pinned",
    "Today",
    "Yesterday",
    "Last 7 days",
    "Last 30 days",
    "Older",
  ] as const;
  const buckets = new Map<string, ChatSessionEntry[]>(
    order.map((label) => [label, []])
  );
  const push = (key: string, s: ChatSessionEntry) => {
    const list = buckets.get(key);
    if (list) list.push(s);
  };
  for (const s of sessions) {
    if (s.pinned) {
      push("Pinned", s);
      continue;
    }
    const ts =
      s.updatedAt instanceof Date
        ? s.updatedAt.getTime()
        : typeof s.updatedAt === "number"
        ? s.updatedAt
        : now;
    const diff = now - ts;
    if (diff < 86_400_000) push("Today", s);
    else if (diff < 2 * 86_400_000) push("Yesterday", s);
    else if (diff < 7 * 86_400_000) push("Last 7 days", s);
    else if (diff < 30 * 86_400_000) push("Last 30 days", s);
    else push("Older", s);
  }
  return order
    .map((label) => ({ label, items: buckets.get(label) ?? [] }))
    .filter((g) => g.items.length > 0);
}

// ── ConversationHeader ──────────────────────────────────────

export interface ConversationHeaderProps
  extends Omit<HTMLAttributes<HTMLElement>, "onChange" | "title"> {
  title?: ReactNode;
  /** Uncontrolled initial title. */
  defaultTitle?: string;
  onTitleChange?: (next: string) => void;
  model?: ReactNode;
  /** Uncontrolled initial model. */
  defaultModel?: string;
  onModelChange?: (next: string) => void;
  tokens?: ReactNode;
  cost?: ReactNode;
  actions?: ReactNode;
  status?: ReactNode;
}

/**
 * Header for a chat conversation: title, participants, model badge, and
 * optional actions menu.
 */
export const ConversationHeader = forwardRef<
  HTMLElement,
  ConversationHeaderProps
>(function ConversationHeader(
  {
    title,
    defaultTitle,
    onTitleChange,
    model,
    defaultModel,
    onModelChange,
    tokens,
    cost,
    actions,
    status,
    className,
    ...props
  },
  ref
) {
  // Route `title` through useControllableState so callers can pass either a
  // controlled `title` or an uncontrolled `defaultTitle` and still get a live
  // in-place edit experience.
  const [currentTitle, setCurrentTitle] = useControllableState<string>({
    value: typeof title === "string" ? title : undefined,
    defaultValue: defaultTitle ?? "",
    onChange: onTitleChange,
    componentName: "ConversationHeader",
  });
  const displayTitle: ReactNode =
    typeof title === "string" || title === undefined ? currentTitle : title;

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(currentTitle);

  const beginEdit = () => {
    if (!onTitleChange && title !== undefined) return;
    setDraft(currentTitle);
    setEditing(true);
  };
  const commit = () => {
    setCurrentTitle(draft);
    setEditing(false);
  };

  // Model edit flow — mirrors title flow but only when `model` is a string
  // (if it's a complex ReactNode the caller is responsible for rendering
  // their own edit affordance; we don't know how to serialize it).
  const modelIsString = typeof model === "string" || model === undefined;
  const [currentModel, setCurrentModel] = useControllableState<string>({
    value: typeof model === "string" ? model : undefined,
    defaultValue: defaultModel ?? "",
    onChange: onModelChange,
    componentName: "ConversationHeader.model",
  });
  const modelEditable =
    modelIsString && typeof onModelChange === "function";
  const [editingModel, setEditingModel] = useState(false);
  const [modelDraft, setModelDraft] = useState(currentModel);
  const beginModelEdit = () => {
    if (!modelEditable) return;
    setModelDraft(currentModel);
    setEditingModel(true);
  };
  const commitModel = () => {
    setCurrentModel(modelDraft);
    setEditingModel(false);
  };

  return (
    <header
      ref={ref}
      className={cx("vf-conversation-header", className)}
      {...props}
    >
      <div className="vf-conversation-header__main">
        {editing && onTitleChange ? (
          <input
            type="text"
            className="vf-conversation-header__title-input"
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                commit();
              } else if (e.key === "Escape") {
                setEditing(false);
              }
            }}
          />
        ) : (
          <button
            type="button"
            className={cx(
              "vf-conversation-header__title",
              onTitleChange && "vf-conversation-header__title--editable"
            )}
            onClick={beginEdit}
            aria-label={onTitleChange ? "Rename conversation" : undefined}
            disabled={!onTitleChange}
          >
            {displayTitle || "Untitled"}
          </button>
        )}
        {status && (
          <span className="vf-conversation-header__status">{status}</span>
        )}
      </div>
      <div className="vf-conversation-header__meta">
        {(model || currentModel) && (
          editingModel && modelEditable ? (
            <input
              type="text"
              className="vf-conversation-header__model-input"
              autoFocus
              value={modelDraft}
              onChange={(e) => setModelDraft(e.target.value)}
              onBlur={commitModel}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  commitModel();
                } else if (e.key === "Escape") {
                  setEditingModel(false);
                }
              }}
            />
          ) : modelEditable ? (
            <button
              type="button"
              className={cx(
                "vf-conversation-header__model",
                "vf-conversation-header__model--editable"
              )}
              onClick={beginModelEdit}
              aria-label="Change model"
            >
              {modelIsString ? currentModel : model}
            </button>
          ) : (
            <span className="vf-conversation-header__model">
              {modelIsString ? currentModel : model}
            </span>
          )
        )}
        {tokens && (
          <span className="vf-conversation-header__tokens">{tokens}</span>
        )}
        {cost && <span className="vf-conversation-header__cost">{cost}</span>}
      </div>
      {actions && (
        <div className="vf-conversation-header__actions">{actions}</div>
      )}
    </header>
  );
});
ConversationHeader.displayName = "ConversationHeader";

// ── ConversationEmptyState ──────────────────────────────────

export interface ConversationEmptyStateSuggestion {
  id?: string;
  text: ReactNode;
  icon?: ReactNode;
  description?: ReactNode;
}

export interface ConversationEmptyStateProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  title?: ReactNode;
  description?: ReactNode;
  logo?: ReactNode;
  suggestions?: ConversationEmptyStateSuggestion[];
  onSuggestionSelect?: (suggestion: ConversationEmptyStateSuggestion) => void;
}

/**
 * Empty-state card shown inside `Conversation` when no messages exist yet.
 * Slot for suggested prompts.
 */
export const ConversationEmptyState = forwardRef<
  HTMLDivElement,
  ConversationEmptyStateProps
>(function ConversationEmptyState(
  {
    title = "Start a new conversation",
    description,
    logo,
    suggestions,
    onSuggestionSelect,
    className,
    ...props
  },
  ref
) {
  return (
    <div
      ref={ref}
      className={cx("vf-conversation-empty", className)}
      {...props}
    >
      {logo && <div className="vf-conversation-empty__logo">{logo}</div>}
      <h2 className="vf-conversation-empty__title">{title}</h2>
      {description && (
        <p className="vf-conversation-empty__description">{description}</p>
      )}
      {suggestions && suggestions.length > 0 && (
        <ul className="vf-conversation-empty__suggestions" role="list">
          {suggestions.map((s, i) => (
            <li
              key={s.id ?? `sugg-${i}`}
              className="vf-conversation-empty__item"
            >
              <button
                type="button"
                className="vf-conversation-empty__btn"
                onClick={() => onSuggestionSelect?.(s)}
              >
                {s.icon && (
                  <span
                    className="vf-conversation-empty__icon"
                    aria-hidden="true"
                  >
                    {s.icon}
                  </span>
                )}
                <span className="vf-conversation-empty__text">
                  <span className="vf-conversation-empty__text-main">
                    {s.text}
                  </span>
                  {s.description && (
                    <span className="vf-conversation-empty__text-desc">
                      {s.description}
                    </span>
                  )}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
});
ConversationEmptyState.displayName = "ConversationEmptyState";
