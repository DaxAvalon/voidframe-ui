"use client";

import {
  forwardRef,
  useEffect,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { MarkdownRenderer } from "../Viewers";
import { cx } from "../../utils/cx";
import type {
  MessageRole,
  MessageStatus,
  MessageAuthor,
  MessagePart,
} from "./Conversation";

// ── MessageGroup ────────────────────────────────────────────

export interface MessageGroupProps extends HTMLAttributes<HTMLDivElement> {
  author?: MessageAuthor;
  role?: MessageRole;
  timestamp?: ReactNode;
  children?: ReactNode;
}

/**
 * Visually groups consecutive messages from the same author into a single
 * run.
 */
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
  /** Quoted message this is replying to. */
  replyTo?: {
    author?: string;
    content?: string;
  };
  children?: ReactNode;
}

/**
 * Single chat message card: role (`user` | `assistant` | `system` | `tool`),
 * content, actions, timestamp.
 */
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
    replyTo,
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
      {replyTo && (
        <div className="vf-message__reply-to">
          {replyTo.author && <span className="vf-message__reply-author">{replyTo.author}</span>}
          <span className="vf-message__reply-text">{replyTo.content}</span>
        </div>
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

/**
 * Body slot of a chat `Message` — renders markdown, attachments, code
 * blocks, and citations.
 */
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

/**
 * Incrementally-rendered text block for streaming LLM output. Shows a
 * trailing cursor while active.
 */
export const StreamingText = forwardRef<HTMLSpanElement, StreamingTextProps>(
  function StreamingText(
    { text, cursor = true, speed = "instant", className, ...props },
    ref
  ) {
    const [rendered, setRendered] = useState(() =>
      speed === "instant" ? text : ""
    );
    const lastSpeed = useRef<"instant" | number>(speed);
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
        lastSpeed.current = speed;
        return;
      }
      // Typewriter mode.
      let i = rendered.length;
      // If we just flipped from "instant" back to a number with unchanged text,
      // restart the animation so the active-class reflects the real state.
      if (lastSpeed.current === "instant" && rendered === text) {
        setRendered("");
        i = 0;
      } else if (!text.startsWith(rendered)) {
        // Text changed incompatibly; restart from scratch.
        setRendered("");
        i = 0;
      }
      lastSpeed.current = speed;
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
