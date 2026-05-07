"use client";

// Phase 12 — Session list, conversation header, empty state

import {
  forwardRef,
  useMemo,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { useControllableState } from "../hooks/useControllableState";
import { cx } from "../utils/cx";

// ── Session types ───────────────────────────────────────────

export interface ChatSessionEntry {
  id: string;
  title: ReactNode;
  lastMessage?: ReactNode;
  updatedAt?: number | Date;
  pinned?: boolean;
}

export type SessionGroupBy = "day" | "pinned" | "none";

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
  { session, active, onSelect, onDelete, onRename, onPin, className, ...props },
  ref
) {
  return (
    <div
      ref={ref}
      role="option"
      aria-selected={active}
      data-active={active || undefined}
      className={cx(
        "vf-session-item",
        active && "vf-session-item--active",
        session.pinned && "vf-session-item--pinned",
        className
      )}
      {...props}
    >
      <button
        type="button"
        className="vf-session-item__button"
        onClick={onSelect}
      >
        {session.pinned && (
          <span className="vf-session-item__pin" aria-hidden="true">
            ★
          </span>
        )}
        <span className="vf-session-item__content">
          <span className="vf-session-item__title">{session.title}</span>
          {session.lastMessage && (
            <span className="vf-session-item__preview">
              {session.lastMessage}
            </span>
          )}
        </span>
        {session.updatedAt && (
          <span className="vf-session-item__time">
            {formatTime(session.updatedAt)}
          </span>
        )}
      </button>
      {(onPin || onRename || onDelete) && (
        <div className="vf-session-item__actions">
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

    const groups = useMemo(() => groupSessions(filtered, groupBy), [
      filtered,
      groupBy,
    ]);

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
            : groups.map((group) => (
                <section
                  key={group.label}
                  className="vf-session-list__group"
                  aria-label={group.label}
                >
                  {group.label !== "" && (
                    <header className="vf-session-list__group-label">
                      {group.label}
                    </header>
                  )}
                  {group.items.map((session) => (
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
              ))}
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
  suggestions?: Array<string | ConversationEmptyStateSuggestion>;
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
  const normalized = (suggestions ?? []).map(s =>
    typeof s === "string" ? { text: s } as ConversationEmptyStateSuggestion : s
  );
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
      {normalized.length > 0 && (
        <ul className="vf-conversation-empty__suggestions" role="list">
          {normalized.map((s, i) => (
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
