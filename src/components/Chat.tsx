// Phase 12 — Chat core
//
// Conversation / MessageList / Message / MessageGroup / MessageContent /
// StreamingText / ThinkingIndicator / ReasoningTrace / MessageActions /
// MessageFeedback / ReactionBar / MessageEdit.
//
// `Conversation` provides a scroll-pinning context that `MessageList` reads
// from. `Message` is a bubble with role-aware styling; `MessageContent`
// knows how to render plain-text, streaming tokens, markdown, and mixed
// content parts (text / code / tool_use / tool_result / thinking).

import {
  Children,
  createContext,
  forwardRef,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
  type UIEvent,
} from "react";
import { MarkdownRenderer } from "./Viewers";
import { cx } from "../utils/cx";

// ── Types shared across chat ────────────────────────────────

export type MessageRole =
  | "user"
  | "assistant"
  | "system"
  | "tool"
  | "developer";

export type MessageStatus =
  | "pending"
  | "streaming"
  | "delivered"
  | "error";

export type ConversationStatus =
  | "idle"
  | "streaming"
  | "thinking"
  | "error";

export interface MessageAuthor {
  id?: string;
  name?: string;
  avatar?: ReactNode;
  role?: string;
}

export type MessagePart =
  | { type: "text"; text: string }
  | { type: "code"; language?: string; code: string }
  | { type: "tool_use"; name: string; args?: unknown }
  | { type: "tool_result"; name: string; result: unknown; error?: boolean }
  | { type: "thinking"; content: string };

// ── Conversation (root) ─────────────────────────────────────

interface ConversationContextValue {
  status: ConversationStatus;
  autoScroll: boolean;
  pinnedToBottom: boolean;
  setPinnedToBottom: (v: boolean) => void;
  scrollRef: React.MutableRefObject<HTMLDivElement | null>;
  threshold: number;
}

const ConversationContext = createContext<ConversationContextValue | null>(null);

export function useConversation(): ConversationContextValue | null {
  return useContext(ConversationContext);
}

export interface ConversationProps extends HTMLAttributes<HTMLDivElement> {
  status?: ConversationStatus;
  autoScroll?: boolean;
  scrollToBottomThreshold?: number;
  onRetry?: () => void;
  onStop?: () => void;
  onRegenerate?: () => void;
  emptyState?: ReactNode;
  /** Switches to virtualization-friendly layout (consumer-owned). */
  virtualized?: boolean;
  children?: ReactNode;
  style?: CSSProperties;
}

export const Conversation = forwardRef<HTMLDivElement, ConversationProps>(
  function Conversation(
    {
      status = "idle",
      autoScroll = true,
      scrollToBottomThreshold = 80,
      onRetry: _onRetry,
      onStop: _onStop,
      onRegenerate: _onRegenerate,
      emptyState,
      virtualized,
      className,
      children,
      style,
      ...props
    },
    ref
  ) {
    const scrollRef = useRef<HTMLDivElement | null>(null);
    const [pinnedToBottom, setPinnedToBottom] = useState(true);

    const ctx = useMemo<ConversationContextValue>(
      () => ({
        status,
        autoScroll,
        pinnedToBottom,
        setPinnedToBottom,
        scrollRef,
        threshold: scrollToBottomThreshold,
      }),
      [status, autoScroll, pinnedToBottom, scrollToBottomThreshold]
    );

    const showEmpty =
      emptyState !== undefined &&
      Children.toArray(children).filter(isValidElement).length === 0;

    return (
      <ConversationContext.Provider value={ctx}>
        <div
          ref={ref}
          className={cx(
            "vf-conversation",
            `vf-conversation--${status}`,
            virtualized && "vf-conversation--virtualized",
            className
          )}
          style={style}
          data-status={status}
          {...props}
        >
          {showEmpty ? emptyState : children}
        </div>
      </ConversationContext.Provider>
    );
  }
);
Conversation.displayName = "Conversation";

// ── MessageList ─────────────────────────────────────────────

export interface MessageListProps extends HTMLAttributes<HTMLDivElement> {
  /** If true (default), scrolls to bottom on new children while pinned. */
  autoScroll?: boolean;
  /** Pixels from bottom that still count as "pinned". */
  pinThreshold?: number;
  children?: ReactNode;
  style?: CSSProperties;
}

export const MessageList = forwardRef<HTMLDivElement, MessageListProps>(
  function MessageList(
    {
      autoScroll: autoScrollProp,
      pinThreshold,
      className,
      children,
      style,
      onScroll,
      ...props
    },
    forwardedRef
  ) {
    const convo = useConversation();
    const autoScroll = autoScrollProp ?? convo?.autoScroll ?? true;
    const threshold = pinThreshold ?? convo?.threshold ?? 80;
    const innerRef = useRef<HTMLDivElement | null>(null);
    const [pinned, setPinnedLocal] = useState(true);
    const setPinned = convo?.setPinnedToBottom ?? setPinnedLocal;
    const isPinned = convo?.pinnedToBottom ?? pinned;

    const captureRef = (node: HTMLDivElement | null) => {
      innerRef.current = node;
      if (convo) convo.scrollRef.current = node;
      if (typeof forwardedRef === "function") forwardedRef(node);
      else if (forwardedRef) {
        (forwardedRef as { current: HTMLDivElement | null }).current = node;
      }
    };

    useLayoutEffect(() => {
      if (!autoScroll || !isPinned) return;
      const el = innerRef.current;
      if (!el) return;
      el.scrollTop = el.scrollHeight;
    }, [children, autoScroll, isPinned]);

    const handleScroll = (e: UIEvent<HTMLDivElement>) => {
      onScroll?.(e);
      const el = e.currentTarget;
      const distance = el.scrollHeight - el.clientHeight - el.scrollTop;
      setPinned(distance <= threshold);
    };

    return (
      <div
        ref={captureRef}
        role="log"
        aria-live="polite"
        aria-relevant="additions text"
        className={cx("vf-message-list", className)}
        onScroll={handleScroll}
        style={style}
        {...props}
      >
        {children}
      </div>
    );
  }
);
MessageList.displayName = "MessageList";

// ── MessageGroup ────────────────────────────────────────────

export interface MessageGroupProps extends HTMLAttributes<HTMLDivElement> {
  author?: MessageAuthor;
  role?: MessageRole;
  timestamp?: ReactNode;
  children?: ReactNode;
}

export const MessageGroup = forwardRef<HTMLDivElement, MessageGroupProps>(
  function MessageGroup(
    { author, role, timestamp, className, children, ...props },
    ref
  ) {
    return (
      <div
        ref={ref}
        className={cx(
          "vf-message-group",
          role && `vf-message-group--${role}`,
          className
        )}
        data-role={role}
        {...props}
      >
        {(author || timestamp) && (
          <header className="vf-message-group__header">
            {author?.avatar && (
              <span className="vf-message-group__avatar" aria-hidden="true">
                {author.avatar}
              </span>
            )}
            {author?.name && (
              <span className="vf-message-group__name">{author.name}</span>
            )}
            {timestamp && (
              <span className="vf-message-group__time">{timestamp}</span>
            )}
          </header>
        )}
        <div className="vf-message-group__items">{children}</div>
      </div>
    );
  }
);
MessageGroup.displayName = "MessageGroup";

// ── Message (base bubble) ───────────────────────────────────

export interface MessageProps extends Omit<HTMLAttributes<HTMLDivElement>, "content"> {
  role?: MessageRole;
  content?: ReactNode;
  timestamp?: ReactNode;
  author?: MessageAuthor;
  status?: MessageStatus;
  actions?: ReactNode;
  reactions?: ReactNode;
  attachments?: ReactNode;
  edited?: boolean;
  pinned?: boolean;
  error?: ReactNode;
  children?: ReactNode;
}

export const Message = forwardRef<HTMLDivElement, MessageProps>(function Message(
  {
    role = "assistant",
    content,
    timestamp,
    author,
    status,
    actions,
    reactions,
    attachments,
    edited,
    pinned,
    error,
    className,
    children,
    ...props
  },
  ref
) {
  return (
    <article
      ref={ref}
      data-role={role}
      data-status={status}
      className={cx(
        "vf-message",
        `vf-message--${role}`,
        status && `vf-message--${status}`,
        edited && "vf-message--edited",
        pinned && "vf-message--pinned",
        error && "vf-message--error",
        className
      )}
      {...props}
    >
      {(author || timestamp || pinned) && (
        <header className="vf-message__header">
          {author?.avatar && (
            <span className="vf-message__avatar" aria-hidden="true">
              {author.avatar}
            </span>
          )}
          {author?.name && <span className="vf-message__name">{author.name}</span>}
          {author?.role && (
            <span className="vf-message__role-label">{author.role}</span>
          )}
          {pinned && (
            <span className="vf-message__pin" aria-label="Pinned">
              ★
            </span>
          )}
          {timestamp && (
            <time className="vf-message__time">{timestamp}</time>
          )}
        </header>
      )}
      <div className="vf-message__body">
        {content !== undefined ? (
          typeof content === "string" ? (
            <MessageContent content={content} />
          ) : (
            content
          )
        ) : (
          children
        )}
      </div>
      {attachments && (
        <div className="vf-message__attachments">{attachments}</div>
      )}
      {reactions && (
        <div className="vf-message__reactions">{reactions}</div>
      )}
      {error && <div className="vf-message__error">{error}</div>}
      {(edited || actions) && (
        <footer className="vf-message__footer">
          {edited && (
            <span className="vf-message__edited-label">(edited)</span>
          )}
          {actions && <div className="vf-message__actions">{actions}</div>}
        </footer>
      )}
    </article>
  );
});
Message.displayName = "Message";

// ── MessageContent ──────────────────────────────────────────

export interface MessageContentProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "content"> {
  content: string | MessagePart[];
  markdown?: boolean;
  streaming?: boolean;
  cursor?: boolean;
  citations?: ReactNode;
}

export const MessageContent = forwardRef<HTMLDivElement, MessageContentProps>(
  function MessageContent(
    { content, markdown, streaming, cursor, citations, className, ...props },
    ref
  ) {
    return (
      <div
        ref={ref}
        className={cx(
          "vf-message-content",
          streaming && "vf-message-content--streaming",
          className
        )}
        {...props}
      >
        {typeof content === "string" ? (
          markdown ? (
            <MarkdownRenderer content={content} />
          ) : (
            <span className="vf-message-content__text">{content}</span>
          )
        ) : (
          content.map((part, i) => (
            <MessagePartRenderer key={i} part={part} markdown={markdown} />
          ))
        )}
        {streaming && cursor !== false && (
          <span className="vf-message-content__cursor" aria-hidden="true">
            ▋
          </span>
        )}
        {citations && (
          <div className="vf-message-content__citations">{citations}</div>
        )}
      </div>
    );
  }
);
MessageContent.displayName = "MessageContent";

function MessagePartRenderer({
  part,
  markdown,
}: {
  part: MessagePart;
  markdown?: boolean;
}) {
  if (part.type === "text") {
    return markdown ? (
      <MarkdownRenderer content={part.text} />
    ) : (
      <p className="vf-message-content__text">{part.text}</p>
    );
  }
  if (part.type === "code") {
    return (
      <pre className="vf-message-content__code">
        <code data-language={part.language}>{part.code}</code>
      </pre>
    );
  }
  if (part.type === "thinking") {
    return (
      <div className="vf-message-content__thinking">
        <span className="vf-message-content__thinking-label">Thinking</span>
        <span className="vf-message-content__thinking-body">{part.content}</span>
      </div>
    );
  }
  if (part.type === "tool_use") {
    return (
      <div className="vf-message-content__tool-use" data-name={part.name}>
        <span className="vf-message-content__tool-label">→ {part.name}</span>
      </div>
    );
  }
  // tool_result
  return (
    <div
      className={cx(
        "vf-message-content__tool-result",
        part.error && "vf-message-content__tool-result--error"
      )}
      data-name={part.name}
    >
      <span className="vf-message-content__tool-label">← {part.name}</span>
    </div>
  );
}

// ── StreamingText ───────────────────────────────────────────

export interface StreamingTextProps extends HTMLAttributes<HTMLSpanElement> {
  text: string;
  cursor?: boolean;
  /** `"instant"` mirrors server tokens verbatim; a number is chars-per-second. */
  speed?: "instant" | number;
}

export const StreamingText = forwardRef<HTMLSpanElement, StreamingTextProps>(
  function StreamingText(
    { text, cursor = true, speed = "instant", className, ...props },
    ref
  ) {
    const [rendered, setRendered] = useState(() =>
      speed === "instant" ? text : ""
    );
    const lastText = useRef(text);
    const activeRef = useRef(true);

    useEffect(() => {
      activeRef.current = true;
      return () => {
        activeRef.current = false;
      };
    }, []);

    useEffect(() => {
      if (speed === "instant") {
        setRendered(text);
        lastText.current = text;
        return;
      }
      // Typewriter mode.
      let i = rendered.length;
      if (!text.startsWith(rendered)) {
        // Text changed incompatibly; restart from scratch.
        setRendered("");
        i = 0;
      }
      if (i >= text.length) return;
      const perChar = Math.max(8, Math.round(1000 / speed));
      const handle = setInterval(() => {
        if (!activeRef.current) return;
        i += 1;
        setRendered(text.slice(0, i));
        if (i >= text.length) clearInterval(handle);
      }, perChar);
      return () => clearInterval(handle);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [text, speed]);

    const done = rendered === text;

    return (
      <span
        ref={ref}
        className={cx(
          "vf-streaming-text",
          !done && "vf-streaming-text--active",
          className
        )}
        {...props}
      >
        {rendered}
        {cursor && (
          <span
            className={cx(
              "vf-streaming-text__cursor",
              done && "vf-streaming-text__cursor--done"
            )}
            aria-hidden="true"
          >
            ▋
          </span>
        )}
      </span>
    );
  }
);
StreamingText.displayName = "StreamingText";

// ── ThinkingIndicator ───────────────────────────────────────

export interface ThinkingIndicatorProps extends HTMLAttributes<HTMLDivElement> {
  message?: ReactNode;
  /** Elapsed time in ms, displayed as "thought for Xs". */
  duration?: number;
  variant?: "dots" | "shimmer";
}

export const ThinkingIndicator = forwardRef<HTMLDivElement, ThinkingIndicatorProps>(
  function ThinkingIndicator(
    { message = "Thinking", duration, variant = "dots", className, ...props },
    ref
  ) {
    return (
      <div
        ref={ref}
        role="status"
        aria-live="polite"
        className={cx(
          "vf-thinking-indicator",
          `vf-thinking-indicator--${variant}`,
          className
        )}
        {...props}
      >
        <span className="vf-thinking-indicator__message">{message}</span>
        {variant === "dots" && (
          <span className="vf-thinking-indicator__dots" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
        )}
        {variant === "shimmer" && (
          <span className="vf-thinking-indicator__shimmer" aria-hidden="true" />
        )}
        {duration !== undefined && (
          <span className="vf-thinking-indicator__duration">
            {formatDuration(duration)}
          </span>
        )}
      </div>
    );
  }
);
ThinkingIndicator.displayName = "ThinkingIndicator";

/** Alias for human-chat use cases. */
export const TypingIndicator = ThinkingIndicator;

function formatDuration(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

// ── ReasoningTrace ──────────────────────────────────────────

export interface ReasoningTraceProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "content" | "title"> {
  content: ReactNode;
  streaming?: boolean;
  defaultExpanded?: boolean;
  expanded?: boolean;
  onExpandedChange?: (next: boolean) => void;
  /** Elapsed time in ms; renders a "thought for Xs" pill. */
  duration?: number;
  title?: ReactNode;
}

export const ReasoningTrace = forwardRef<HTMLDivElement, ReasoningTraceProps>(
  function ReasoningTrace(
    {
      content,
      streaming,
      defaultExpanded = false,
      expanded,
      onExpandedChange,
      duration,
      title = "Reasoning",
      className,
      ...props
    },
    ref
  ) {
    const [internal, setInternal] = useState(defaultExpanded);
    const isOpen = expanded ?? internal;
    const setOpen = (next: boolean) => {
      if (expanded === undefined) setInternal(next);
      onExpandedChange?.(next);
    };
    const baseId = useId();
    const contentId = `${baseId}-content`;

    return (
      <div
        ref={ref}
        className={cx(
          "vf-reasoning-trace",
          isOpen && "vf-reasoning-trace--open",
          streaming && "vf-reasoning-trace--streaming",
          className
        )}
        {...props}
      >
        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls={contentId}
          className="vf-reasoning-trace__trigger"
          onClick={() => setOpen(!isOpen)}
        >
          <span aria-hidden="true" className="vf-reasoning-trace__caret">
            {isOpen ? "▾" : "▸"}
          </span>
          <span className="vf-reasoning-trace__title">{title}</span>
          {duration !== undefined && (
            <span className="vf-reasoning-trace__duration">
              thought for {formatDuration(duration)}
            </span>
          )}
          {streaming && (
            <span className="vf-reasoning-trace__streaming-dot" aria-hidden="true" />
          )}
        </button>
        {isOpen && (
          <div id={contentId} className="vf-reasoning-trace__content">
            {content}
          </div>
        )}
      </div>
    );
  }
);
ReasoningTrace.displayName = "ReasoningTrace";

// ── MessageActions (compound) ───────────────────────────────

export interface MessageActionsProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

function MessageActionsRoot({
  className,
  children,
  ...props
}: MessageActionsProps) {
  return (
    <div
      role="toolbar"
      aria-label="Message actions"
      className={cx("vf-message-actions", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export interface MessageActionButtonProps
  extends HTMLAttributes<HTMLButtonElement> {
  icon?: ReactNode;
  label?: ReactNode;
  disabled?: boolean;
}

const MessageActionButton = forwardRef<HTMLButtonElement, MessageActionButtonProps>(
  function MessageActionButton(
    { icon, label, className, children, disabled, ...props },
    ref
  ) {
    return (
      <button
        ref={ref}
        type="button"
        className={cx("vf-message-actions__btn", className)}
        aria-label={typeof label === "string" ? label : undefined}
        disabled={disabled}
        {...props}
      >
        {icon && (
          <span className="vf-message-actions__icon" aria-hidden="true">
            {icon}
          </span>
        )}
        {(label || children) && (
          <span className="vf-message-actions__label">{label ?? children}</span>
        )}
      </button>
    );
  }
);

const namedAction = (
  name: string,
  defaultIcon: string,
  defaultLabel: string
) => {
  const Component = forwardRef<HTMLButtonElement, MessageActionButtonProps>(
    function NamedAction({ icon, label, ...props }, ref) {
      return (
        <MessageActionButton
          ref={ref}
          icon={icon ?? defaultIcon}
          label={label ?? defaultLabel}
          {...props}
        />
      );
    }
  );
  Component.displayName = name;
  return Component;
};

const CopyAction = namedAction("MessageActions.Copy", "⧉", "Copy");
const RegenerateAction = namedAction(
  "MessageActions.Regenerate",
  "↻",
  "Regenerate"
);
const EditAction = namedAction("MessageActions.Edit", "✎", "Edit");
const DeleteAction = namedAction("MessageActions.Delete", "✕", "Delete");
const ShareAction = namedAction("MessageActions.Share", "↗", "Share");
const FeedbackAction = namedAction(
  "MessageActions.Feedback",
  "✱",
  "Feedback"
);
const PinAction = namedAction("MessageActions.Pin", "★", "Pin");
const BranchAction = namedAction(
  "MessageActions.Branch",
  "⑂",
  "Branch from here"
);

export const MessageActions = Object.assign(MessageActionsRoot, {
  Button: MessageActionButton,
  Copy: CopyAction,
  Regenerate: RegenerateAction,
  Edit: EditAction,
  Delete: DeleteAction,
  Share: ShareAction,
  Feedback: FeedbackAction,
  Pin: PinAction,
  Branch: BranchAction,
});

// ── MessageFeedback ─────────────────────────────────────────

export type FeedbackValue = "up" | "down" | null;

export interface FeedbackReason {
  id: string;
  label: string;
}

export interface MessageFeedbackProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  value?: FeedbackValue;
  defaultValue?: FeedbackValue;
  onChange?: (next: FeedbackValue) => void;
  reasons?: FeedbackReason[];
  onReasonSelect?: (reasonId: string) => void;
}

export const MessageFeedback = forwardRef<HTMLDivElement, MessageFeedbackProps>(
  function MessageFeedback(
    {
      value,
      defaultValue = null,
      onChange,
      reasons,
      onReasonSelect,
      className,
      ...props
    },
    ref
  ) {
    const [internal, setInternal] = useState<FeedbackValue>(defaultValue);
    const current = value === undefined ? internal : value;
    const set = (next: FeedbackValue) => {
      if (value === undefined) setInternal(next);
      onChange?.(next);
    };
    return (
      <div
        ref={ref}
        role="group"
        aria-label="Feedback"
        className={cx("vf-message-feedback", className)}
        {...props}
      >
        <button
          type="button"
          aria-pressed={current === "up"}
          aria-label="Thumbs up"
          className={cx(
            "vf-message-feedback__btn",
            current === "up" && "vf-message-feedback__btn--active"
          )}
          onClick={() => set(current === "up" ? null : "up")}
        >
          ▲
        </button>
        <button
          type="button"
          aria-pressed={current === "down"}
          aria-label="Thumbs down"
          className={cx(
            "vf-message-feedback__btn",
            current === "down" && "vf-message-feedback__btn--active"
          )}
          onClick={() => set(current === "down" ? null : "down")}
        >
          ▼
        </button>
        {current === "down" && reasons && reasons.length > 0 && (
          <div className="vf-message-feedback__reasons" role="radiogroup">
            {reasons.map((reason) => (
              <button
                key={reason.id}
                type="button"
                role="radio"
                aria-checked="false"
                className="vf-message-feedback__reason"
                onClick={() => onReasonSelect?.(reason.id)}
              >
                {reason.label}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }
);
MessageFeedback.displayName = "MessageFeedback";

// ── ReactionBar ─────────────────────────────────────────────

export interface MessageReactionEntry {
  emoji: string;
  count: number;
  reacted?: boolean;
}

export interface ReactionBarProps extends HTMLAttributes<HTMLDivElement> {
  reactions: MessageReactionEntry[];
  onReact?: (emoji: string) => void;
  onUnreact?: (emoji: string) => void;
  onAdd?: () => void;
}

export const ReactionBar = forwardRef<HTMLDivElement, ReactionBarProps>(
  function ReactionBar(
    { reactions, onReact, onUnreact, onAdd, className, ...props },
    ref
  ) {
    return (
      <div
        ref={ref}
        role="group"
        aria-label="Reactions"
        className={cx("vf-reaction-bar", className)}
        {...props}
      >
        {reactions.map((r) => (
          <button
            key={r.emoji}
            type="button"
            aria-pressed={!!r.reacted}
            className={cx(
              "vf-reaction-bar__chip",
              r.reacted && "vf-reaction-bar__chip--active"
            )}
            onClick={() =>
              r.reacted ? onUnreact?.(r.emoji) : onReact?.(r.emoji)
            }
          >
            <span className="vf-reaction-bar__emoji" aria-hidden="true">
              {r.emoji}
            </span>
            <span className="vf-reaction-bar__count">{r.count}</span>
          </button>
        ))}
        {onAdd && (
          <button
            type="button"
            className="vf-reaction-bar__add"
            aria-label="Add reaction"
            onClick={onAdd}
          >
            +
          </button>
        )}
      </div>
    );
  }
);
ReactionBar.displayName = "ReactionBar";

/** Alias — same component, different name for emoji-style chip collections. */
export const MessageReactions = ReactionBar;

// ── MessageEdit ─────────────────────────────────────────────

export interface MessageEditProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  value: string;
  onChange: (next: string) => void;
  onSave?: (next: string) => void;
  onCancel?: () => void;
  placeholder?: string;
  saveLabel?: ReactNode;
  cancelLabel?: ReactNode;
  autoFocus?: boolean;
}

export const MessageEdit = forwardRef<HTMLDivElement, MessageEditProps>(
  function MessageEdit(
    {
      value,
      onChange,
      onSave,
      onCancel,
      placeholder,
      saveLabel = "Save",
      cancelLabel = "Cancel",
      autoFocus = true,
      className,
      ...props
    },
    ref
  ) {
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    useEffect(() => {
      if (autoFocus) textareaRef.current?.focus();
    }, [autoFocus]);

    const save = useCallback(() => onSave?.(value), [onSave, value]);

    return (
      <div
        ref={ref}
        className={cx("vf-message-edit", className)}
        {...props}
      >
        <textarea
          ref={textareaRef}
          className="vf-message-edit__input"
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
              e.preventDefault();
              save();
            } else if (e.key === "Escape") {
              e.preventDefault();
              onCancel?.();
            }
          }}
        />
        <div className="vf-message-edit__actions">
          <button
            type="button"
            className="vf-message-edit__cancel"
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className="vf-message-edit__save"
            onClick={save}
          >
            {saveLabel}
          </button>
        </div>
      </div>
    );
  }
);
MessageEdit.displayName = "MessageEdit";
