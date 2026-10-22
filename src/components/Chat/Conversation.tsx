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
  /**
   * Per-author colour: a CSS colour or `var(--vf-…)`. Rendered as the
   * message's leading stripe and the group avatar ring so several
   * assistants in one transcript tell apart without reading names.
   */
  color?: string;
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

/**
 * Vertical transcript of a chat conversation: renders a list of `Message`s
 * with grouping, auto-scroll, and empty-state slot.
 */
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
  /**
   * Prepend older history. The list records its scroll position before the
   * call and restores it after the children change, so the messages the
   * reader was looking at stay put while earlier ones appear above.
   */
  onLoadEarlier?: () => void | Promise<void>;
  /** Whether more history exists; renders the load-earlier control at the top. */
  hasEarlier?: boolean;
  /** Controlled loading state for the control (otherwise derived from the promise). */
  loadingEarlier?: boolean;
  /** Also call `onLoadEarlier` when the reader scrolls to the top. Default true. */
  loadEarlierOnScroll?: boolean;
  /** Label of the load-earlier control. Default "Load earlier messages". */
  loadEarlierLabel?: ReactNode;
  children?: ReactNode;
  style?: CSSProperties;
}

/**
 * Virtualised scrollable list of `Message`s. Handles auto-scroll-to-bottom
 * and a "new messages" affordance.
 *
 * Pinned-state resolution: when nested inside a `<Conversation>` context,
 * the shared `pinnedToBottom` flag wins — multiple `MessageList`s can share
 * a single pin-state across the conversation. When rendered standalone, the
 * list falls back to its own local pinned state tied to its own scroll
 * container.
 */
export const MessageList = forwardRef<HTMLDivElement, MessageListProps>(
  function MessageList(
    {
      autoScroll: autoScrollProp,
      pinThreshold,
      onLoadEarlier,
      hasEarlier = false,
      loadingEarlier: loadingEarlierProp,
      loadEarlierOnScroll = true,
      loadEarlierLabel = "Load earlier messages",
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
    const [loadingInternal, setLoadingInternal] = useState(false);
    const loadingEarlier = loadingEarlierProp ?? loadingInternal;
    // Scroll anchor captured before history is prepended.
    const anchorRef = useRef<{ height: number; top: number } | null>(null);

    const loadEarlier = () => {
      if (!onLoadEarlier || loadingEarlier || !hasEarlier) return;
      const el = innerRef.current;
      if (el) anchorRef.current = { height: el.scrollHeight, top: el.scrollTop };
      // Prepending history must not drag the view to the bottom.
      setPinned(false);
      const result = onLoadEarlier();
      if (result && typeof (result as Promise<void>).then === "function") {
        setLoadingInternal(true);
        (result as Promise<void>).finally(() => setLoadingInternal(false));
      }
    };

    const captureRef = (node: HTMLDivElement | null) => {
      innerRef.current = node;
      if (convo) convo.scrollRef.current = node;
      if (typeof forwardedRef === "function") forwardedRef(node);
      else if (forwardedRef) {
        (forwardedRef as { current: HTMLDivElement | null }).current = node;
      }
    };

    // Restore the anchor once history has arrived: the content grew by
    // (new height - old height) above the reader, so move down by that much.
    useIsomorphicLayoutEffect(() => {
      const anchor = anchorRef.current;
      const el = innerRef.current;
      if (!anchor || !el) return;
      const grown = el.scrollHeight - anchor.height;
      if (grown > 0) {
        el.scrollTop = anchor.top + grown;
        anchorRef.current = null;
      }
    }, [children]);

    useIsomorphicLayoutEffect(() => {
      if (!autoScroll || !isPinned || anchorRef.current) return;
      const el = innerRef.current;
      if (!el) return;
      el.scrollTop = el.scrollHeight;
    }, [children, autoScroll, isPinned]);

    const handleScroll = (e: UIEvent<HTMLDivElement>) => {
      onScroll?.(e);
      const el = e.currentTarget;
      const distance = el.scrollHeight - el.clientHeight - el.scrollTop;
      setPinned(distance <= threshold);
      if (loadEarlierOnScroll && hasEarlier && onLoadEarlier && el.scrollTop <= 0 && !loadingEarlier) {
        loadEarlier();
      }
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
        data-has-earlier={hasEarlier ? "true" : undefined}
        {...props}
      >
        {hasEarlier && onLoadEarlier && (
          <div className="vf-message-list__earlier">
            <button
              type="button"
              className="vf-message-list__earlier-button"
              onClick={loadEarlier}
              disabled={loadingEarlier}
              aria-busy={loadingEarlier || undefined}
            >
              {loadingEarlier ? "Loading…" : loadEarlierLabel}
            </button>
          </div>
        )}
        {children}
      </div>
    );
  }
);
MessageList.displayName = "MessageList";
