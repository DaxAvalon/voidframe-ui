"use client";

// ── Chat barrel ─────────────────────────────────────────────
// Re-exports every public component and type from the Chat module.

export {
  Conversation,
  MessageList,
  useConversation,
} from "./Conversation";
export type {
  ConversationProps,
  ConversationStatus,
  ConversationContextValue,
  MessageListProps,
  MessageRole,
  MessageStatus,
  MessageAuthor,
  MessagePart,
} from "./Conversation";

export {
  MessageGroup,
  Message,
  MessageContent,
  StreamingText,
} from "./Message";
export type {
  MessageGroupProps,
  MessageProps,
  MessageContentProps,
  StreamingTextProps,
} from "./Message";

export {
  ThinkingIndicator,
  ReasoningTrace,
} from "./Indicators";
export type {
  ThinkingIndicatorProps,
  ReasoningTraceProps,
} from "./Indicators";

export { MessageActions } from "./Actions";
export type {
  MessageActionsProps,
  MessageActionButtonProps,
} from "./Actions";

export {
  MessageFeedback,
  ReactionBar,
} from "./Reactions";
export type {
  FeedbackValue,
  FeedbackReason,
  MessageFeedbackProps,
  MessageReactionEntry,
  ReactionBarProps,
} from "./Reactions";

export { MessageEdit } from "./Edit";
export type { MessageEditProps } from "./Edit";
