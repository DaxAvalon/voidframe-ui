"use client";

import {
  Children,
  createContext,
  forwardRef,
  isValidElement,
  useContext,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
  type UIEvent,
} from "react";
import { cx } from "../../utils/cx";
import { useIsomorphicLayoutEffect } from "../../hooks/useIsomorphicLayoutEffect";

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

// ── Conversation context ───────────────────────────────────

export interface ConversationContextValue {
  status: ConversationStatus;
  autoScroll: boolean;
  pinnedToBottom: boolean;
  setPinnedToBottom: (v: boolean) => void;
  scrollRef: React.MutableRefObject<HTMLDivElement | null>;
  threshold: number;
  /** Invoked by descendant actions (MessageActions.Retry) when an operation should be re-attempted. */
  onRetry?: () => void;
  /** Invoked by descendant actions (MessageActions.Stop) to cancel an in-flight operation. */
  onStop?: () => void;
  /** Invoked by descendant actions (MessageActions.Regenerate) to request a fresh response. */
  onRegenerate?: () => void;
}

export const ConversationContext = createContext<ConversationContextValue | null>(null);

export function useConversation(): ConversationContextValue | null {
  return useContext(ConversationContext);
}

// ── Conversation (root) ─────────────────────────────────────

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
      onRetry,
      onStop,
      onRegenerate,
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
        onRetry,
        onStop,
        onRegenerate,
      }),
      [
        status,
        autoScroll,
        pinnedToBottom,
        scrollToBottomThreshold,
        onRetry,
        onStop,
        onRegenerate,
      ]
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

    useIsomorphicLayoutEffect(() => {
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
