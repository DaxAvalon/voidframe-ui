# 12 — Components: Chat & AI UX

**Goal:** Ship ~35 components covering the full surface area of modern AI chat and agent interfaces — message lists, streaming, tool calls, citations, reasoning traces, composers, sessions. Voidframe becomes a first-class UI framework for building Claude-/ChatGPT-/agent-style products.

**Depends on:** all Track A phases; 11 (MarkdownRenderer, CodeBlock, VoiceWaveform); 10 (Tooltip, Popover).
**Effort:** 5-7 days.

## Messaging Core

### C01. Conversation (new — root container)

```tsx
<Conversation
  messages={Message[]}
  status="idle" | "streaming" | "thinking" | "error"
  onRetry onStop onRegenerate
  autoScroll
  scrollToBottomThreshold={80}
  emptyState={<ConversationEmptyState />}
  virtualized
>
  {/* or use render prop */}
</Conversation>
```

- Manages auto-scroll behavior (scroll pinning, pause on user scroll, "new messages" indicator).
- Virtualized with VirtualList for long histories.
- Orchestrates MessageList + ComposerArea slots.

### C02. MessageList (new)

Scrollable list of messages with smart scroll.

```tsx
<MessageList messages renderMessage groupBySender autoScroll />
```

- Groups consecutive messages from same sender (one avatar, one timestamp).

### C03. Message (new — base message bubble)

```tsx
<Message
  role="user" | "assistant" | "system" | "tool" | "developer"
  content={string | ReactNode}
  timestamp
  author={{ name, avatar, role }}
  status="pending" | "streaming" | "delivered" | "error"
  actions={<MessageActions />}
  reactions={<ReactionBar />}
  attachments={<AttachmentList />}
  edited
  pinned
  error
/>
```

- Role-specific styling (user right-aligned or just differently toned; assistant full-width for dense info).
- Hover reveals action bar.

### C04. MessageGroup (new)

Container for consecutive messages from one sender.

```tsx
<MessageGroup author>
  <Message />
  <Message />
</MessageGroup>
```

### C05. MessageContent (new)

Renders message body — markdown, plain text, rich content.

```tsx
<MessageContent
  content={string | MessagePart[]}       // parts: text, code, tool_use, tool_result, thinking
  markdown
  streaming
  cursor
  citations
/>
```

- When streaming, appends tokens; shows cursor.
- Part-based rendering for mixed content (text + code + tool calls).

### C06. StreamingText (new)

```tsx
<StreamingText text={string} cursor speed="instant" | number />
```

- `instant`: appends immediately (for real LLM streams).
- `number`: typewriter effect (for demo/simulated cases).
- Cursor blink stops when `text` stops changing.

### C07. ThinkingIndicator (new)

```tsx
<ThinkingIndicator message="Thinking..." duration />
```

- Three-dot pulse or shimmer.
- Optional elapsed time.

### C08. ReasoningTrace (new — collapsible thinking/chain-of-thought display)

```tsx
<ReasoningTrace
  content={string}
  streaming
  defaultExpanded={false}
  duration
  title="Reasoning"
/>
```

- Collapsible accordion-style.
- Rendered with muted typography (text-2).
- Duration pill ("thought for 3.2s").

### C09. MessageActions (new)

Action bar that appears on hover.

```tsx
<MessageActions>
  <MessageActions.Copy />
  <MessageActions.Regenerate />
  <MessageActions.Edit />
  <MessageActions.Delete />
  <MessageActions.Share />
  <MessageActions.Feedback />
  <MessageActions.Pin />
  <MessageActions.Branch />               // fork conversation from here
</MessageActions>
```

### C10. MessageFeedback (new)

Thumbs up/down with optional comment.

```tsx
<MessageFeedback
  value="up" | "down" | null
  onChange
  reasons={[{ id, label }]}
  onReasonSelect
/>
```

### C11. MessageReactions / ReactionBar (new)

```tsx
<ReactionBar
  reactions={[{ emoji, count, reacted: boolean }]}
  onReact onUnreact
  onAdd                                 // opens ReactionPicker
/>
```

### C12. MessageEdit (new)

Inline editor for editing a previously sent message.

```tsx
<MessageEdit value onChange onSave onCancel />
```

---

## Attachments

### C13. AttachmentList (new)

```tsx
<AttachmentList>
  <Attachment
    kind="image" | "video" | "audio" | "file" | "pdf" | "code"
    name size thumbnail
    onClick onDownload onRemove
  />
</AttachmentList>
```

### C14. Attachment (new)

Single attachment chip.

### C15. ImageAttachment (new)

Inline image with click-to-lightbox.

### C16. FileAttachment (new)

File chip with icon + name + size.

### C17. CodeAttachment (new)

Preview of attached code file (uses CodeBlock).

### C18. AudioAttachment (new)

Waveform + playback controls (uses VoiceWaveform).

---

## Tool Calls & Agents

### C19. ToolCall (new — agent tool invocation display)

```tsx
<ToolCall
  name="search_web"
  status="running" | "complete" | "error"
  args={{ query: "..." }}
  result={unknown}
  duration
  defaultExpanded={false}
  onRetry
  onCancel
/>
```

- Collapsible.
- Running: spinner + name.
- Complete: green check + duration + preview of result.
- Error: red X + error message + retry button.
- Expanded view shows args (JSONViewer) and result.

### C20. ToolCallGroup (new)

Groups parallel or sequential tool calls.

```tsx
<ToolCallGroup title="Searching the web" status>
  <ToolCall />
  <ToolCall />
</ToolCallGroup>
```

### C21. AgentStep (new — higher-level step display)

For multi-step agent runs.

```tsx
<AgentStep
  number
  title="Analyzing codebase"
  status
  toolCalls={ToolCall[]}
  output
  duration
  defaultExpanded
/>
```

### C22. AgentTrace (new — full agent execution view)

```tsx
<AgentTrace
  steps={AgentStep[]}
  tokens={{ input, output, total }}
  cost
  duration
  status
/>
```

- Timeline of agent steps with costs + tokens.

### C23. PlanDisplay (new)

Agent's plan / task list.

```tsx
<PlanDisplay
  steps={[{ id, title, status: "pending" | "active" | "done" | "failed" }]}
  onStepClick
/>
```

---

## Citations & Sources

### C24. Citation (new)

Inline citation marker (superscript or inline badge).

```tsx
<Citation index={1} source={SourceRef} tooltip />
```

### C25. CitationList (new)

Numbered list of cited sources at end of message.

```tsx
<CitationList sources={Source[]} onSourceClick />
```

### C26. SourceCard (new)

Rich card for a cited source (URL, title, snippet, favicon).

```tsx
<SourceCard
  title url snippet favicon publisher publishedAt
  thumbnail
  onClick
/>
```

### C27. SourceGrid (new)

Grid of source cards.

### C28. RAGContext (new)

Displays retrieved context used for answering.

```tsx
<RAGContext
  chunks={{ source, content, score }[]}
  collapsed
/>
```

---

## Composer

### C29. Composer (new — message input)

Compound component for rich message composition.

```tsx
<Composer
  value onChange
  onSubmit onStop
  status="idle" | "streaming"
  disabled
  attachments onAttachmentAdd onAttachmentRemove
  mentions slashCommands
  maxLength showCount
>
  <Composer.Toolbar>
    <Composer.AttachButton />
    <Composer.MicButton />
    <Composer.SlashButton />
  </Composer.Toolbar>
  <Composer.Input placeholder="Message..." autoSize minRows={1} maxRows={8} />
  <Composer.Footer>
    <Composer.TokenCounter />
    <Composer.Submit />
  </Composer.Footer>
</Composer>
```

- Enter submits, Shift+Enter newline (configurable).
- Auto-resize textarea.
- Attachment chips above input.
- Mentions/slash commands via MentionInput/SlashCommandInput primitives.

### C30. ComposerAttachment (new)

Chip shown above input for a queued attachment.

### C31. ComposerMicButton (new)

Voice recording button.

```tsx
<ComposerMicButton
  onRecordStart onRecordStop
  maxDuration
  transcribing
  waveform
/>
```

- Shows waveform while recording.
- Tap to start/stop; long-press to push-to-talk.

### C32. SubmitButton (new)

Smart submit button — morphs between send icon (idle) and stop icon (streaming).

```tsx
<SubmitButton status="idle" | "streaming" onSubmit onStop disabled />
```

### C33. StopButton (new)

Explicit stop button (in cases where SubmitButton's morphed state isn't preferred).

### C34. RegenerateButton (new)

Circular arrow button to regenerate last response.

### C35. SuggestionChips / QuickReplies (new)

```tsx
<SuggestionChips
  suggestions={string[] | { text, icon? }[]}
  onSelect
  layout="horizontal" | "wrap"
/>
```

- Displayed above composer to suggest prompts.

### C36. PromptTemplate (new)

Saved prompt templates with variable substitution.

```tsx
<PromptTemplateList templates onSelect />
<PromptTemplateEditor template onSave />
```

### C37. SlashCommandPicker (new)

Specialized SlashCommandInput integration — opens menu on `/` with registered commands.

### C38. Mention (new)

Inline mention chip within message content: `@alice`, `#channel`, `<<file.ts>>`.

---

## Session & History

### C39. SessionList (new — chat history sidebar)

```tsx
<SessionList
  sessions={{ id, title, lastMessage, updatedAt, pinned }[]}
  activeId onSelect onDelete onRename onPin
  searchable
  groupBy="day" | "pinned"
/>
```

- Groups by time (Today, Yesterday, Last 7 days, Older).
- Search + filter.
- Context menu per item (rename, delete, share, archive).

### C40. SessionListItem (new)

Single session entry.

### C41. ConversationHeader (new)

Top bar of a conversation.

```tsx
<ConversationHeader
  title onTitleChange                 // editable
  model onModelChange
  tokens cost
  actions                             // Menu with Share, Export, Delete, etc.
/>
```

### C42. ConversationEmptyState (new)

Onboarding view shown when no messages yet.

```tsx
<ConversationEmptyState
  title logo
  suggestions={Suggestion[]}
  onSuggestionSelect
/>
```

---

## Model & Context

### C43. ModelSelector (new)

```tsx
<ModelSelector
  models={{ id, name, provider, capabilities, contextWindow }[]}
  value onChange
  showCapabilities
/>
```

### C44. SystemPromptEditor (new)

Textarea-based system prompt editor with preview.

```tsx
<SystemPromptEditor value onChange templates />
```

### C45. TokenCounter (new)

```tsx
<TokenCounter
  input output total
  max
  variant="compact" | "detailed"
/>
```

- Shows `342 / 4,096` with progress bar.

### C46. ContextWindow (new)

Visualizes used vs available context as a bar.

### C47. CostDisplay (new)

```tsx
<CostDisplay input output total currency />
```

---

## Agent & Debugging

### C48. LatencyIndicator (new)

Inline latency pill on assistant messages ("2.3s").

### C49. DebugPanel (new)

Side panel showing raw request/response, token counts, trace.

```tsx
<DebugPanel open onClose events={DebugEvent[]} />
```

### C50. TraceViewer (new)

Detailed view of agent execution steps + tool calls + timing.

---

## Utility

### C51. TypingIndicator (alias of ThinkingIndicator for human-chat use cases).

### C52. OnlineStatus (alias of StatusIndicator for presence).

### C53. UnreadBadge (new)

Small dot/count badge for unread messages.

---

## Patterns / Templates

### Pattern P1. ChatLayout

Standard 3-column layout: SessionList | Conversation | (optional DebugPanel).

```tsx
<ChatLayout
  sidebar={<SessionList />}
  conversation={<Conversation />}
  inspector={<DebugPanel />}
/>
```

### Pattern P2. SimpleChat

Minimal single-conversation layout (no sidebar).

### Pattern P3. AgentRunner

Layout for autonomous agent runs — conversation + plan + trace.

---

## Example Composition

```tsx
<ChatLayout
  sidebar={
    <SessionList sessions={sessions} activeId={id} onSelect={load} />
  }
  conversation={
    <Conversation status={status}>
      <ConversationHeader title={title} model={model} tokens={tokens} cost={cost} />
      <MessageList>
        {messages.map(m => (
          <Message key={m.id} role={m.role} author={m.author} actions={<MessageActions />}>
            <MessageContent content={m.content} streaming={m.streaming} />
            {m.reasoning && <ReasoningTrace content={m.reasoning} />}
            {m.toolCalls?.map(tc => <ToolCall key={tc.id} {...tc} />)}
            {m.citations && <CitationList sources={m.citations} />}
          </Message>
        ))}
        {status === "streaming" && <ThinkingIndicator />}
      </MessageList>
      <Composer value={draft} onChange={setDraft} onSubmit={send} status={status}>
        <Composer.Toolbar>
          <Composer.AttachButton />
          <Composer.MicButton />
        </Composer.Toolbar>
        <Composer.Input placeholder="Message..." />
        <Composer.Footer>
          <Composer.TokenCounter input={tokens.input} max={4096} />
          <Composer.Submit />
        </Composer.Footer>
      </Composer>
    </Conversation>
  }
/>
```

---

## Acceptance Criteria

- [ ] All ~50 chat/AI components implemented.
- [ ] StreamingText handles token-by-token updates at 60fps.
- [ ] ToolCall collapsible with arg/result rendering.
- [ ] Composer auto-resizes, handles attachments, mentions, slash commands.
- [ ] MessageActions hover-revealed; keyboard accessible via focus.
- [ ] SessionList handles 1000+ sessions via virtualization.
- [ ] ReasoningTrace collapses cleanly; streams gracefully.
- [ ] CitationList + SourceCard render correctly with real web sources.
- [ ] Demo app includes a complete chat example using these components.
- [ ] All pass axe audit (chat accessibility is particularly nuanced — live regions for streaming).
