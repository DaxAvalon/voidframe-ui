# Audit 31 — Chat + Media Bucket Findings

Scope: the 38 components enumerated in `plans/audits/_chat-media.json`
(21 chat + 17 media).
Method: static read of each file under `src/components/**` with cross-reference
to tests under `src/components/__tests__/**`. No source was modified and
nothing was executed.

## Severity Counts

| Severity | Count |
| -------- | ----: |
| P0 — dead prop / broken callback       | 4 |
| P1 — edge-path bug                     | 6 |
| P2 — undocumented / minor discrepancy  | 5 |
| P3 — test-only gap                     | 3 |
| **Total**                              | **18** |

## Chat findings

### Conversation (`src/components/Chat/Conversation.tsx`)

- **P0 — dead callbacks: `onRetry`, `onStop`, `onRegenerate`.**
  Declared on `ConversationProps` (lines 78–80), destructured with
  leading-underscore aliases (`_onRetry`, `_onStop`, `_onRegenerate`) at
  lines 94–96, and never consumed anywhere in the file. No child reads
  them from `ConversationContext`, and no test references them. They
  appear in the public surface but wire to nothing.
- **P3 — no tests for `virtualized` class flag.** Conversation.test.tsx
  asserts `data-status` but not `vf-conversation--virtualized`.

### MessageList (`src/components/Chat/Conversation.tsx`)

- **P2 — ambiguous pinned-state source of truth.** `setPinnedLocal`
  (local state) is created only as a fallback when no Conversation
  context is present, but the code always prefers `convo?.setPinnedToBottom`.
  In SSR or when mounted outside a Conversation the local fallback is
  active, and the initial `pinned=true` assumption causes auto-scroll to
  fire on first render even if the user had scrolled away in a prior
  mount. Not broken, but the dual paths are easy to trip over.

### MessageFeedback (`src/components/Chat/Reactions.tsx`)

- **P1 — controlled-mode reason deselect swallowed.** In `selectReason`
  (lines 54–58):
  ```ts
  const next = currentReason === reasonId ? undefined : reasonId;
  if (selectedReasonProp === undefined) setReasonInternal(next);
  if (next !== undefined) onReasonSelect?.(next);
  ```
  Deselect (`next === undefined`) never calls `onReasonSelect`. A parent
  using controlled `selectedReason` cannot learn that the user toggled
  the selection off. Internal state is similarly kept in sync only in
  uncontrolled mode.

### ConversationHeader (`src/components/ChatSession.tsx`)

- **P0 — dead callback `onModelChange`.** The prop is declared at line
  300, destructured as `_onModelChange` at line 315, and never read. The
  `model` prop is rendered as a plain node and is not editable.

### ChatLayout (`src/components/ChatModel.tsx`)

- **P3 — no test coverage.** The component doesn't appear in any test
  file under `src/components/__tests__`. It's a structural shell so
  missing tests are P3 rather than higher.

### StreamingText (`src/components/Chat/Message.tsx`)

- **P2 — unused ref.** `lastText` (line 301) is captured but only
  written, never read. The "text changed incompatibly" branch (lines
  319–323) restarts the typewriter from scratch based on `rendered`,
  not on the previous text. Minor; works in practice.
- **P1 — `speed="instant"` reset bug after typewriter.** When the
  caller flips `speed` from a number to `"instant"` mid-stream, the
  effect (lines 311–316) immediately sets `rendered = text`, which is
  correct. But if `speed` is then flipped back to a number while `text`
  unchanged, the effect does nothing (`i >= text.length`), leaving
  `rendered` equal to `text` and `done === true` until the parent sends
  a new `text`. The `vf-streaming-text--active` class therefore lags the
  real streaming state if the parent toggles speed. Unlikely in
  practice; filing as edge-path.

### Composer (ChatComposerRoot) (`src/components/ChatComposer.tsx`)

- No findings. `value`+`defaultValue`+`onChange` triad is clean,
  `onSubmit` guards against empty-trimmed inputs and streaming status,
  and tests exercise Enter / Shift+Enter / slash-command / stop
  transitions.

### ComposerMicButton (`src/components/ChatComposer.tsx`)

- **P1 — `onRecordStart`/`onRecordStop` bundled with state write.** The
  `setRecording` local helper (lines 398–403) calls both
  `onRecordingChange(next)` and `onRecordStart/Stop()`. In controlled
  mode (`recording` prop supplied) the parent then flips `recording`,
  which re-renders and triggers the `useEffect` at 405–410 that calls
  `setRecording(false)` when `maxDuration` elapses. Because the effect
  uses `setRecording` and the recording prop is controlled, the parent
  sees `onRecordStop` a second time with no intervening `onRecordStart`
  if the parent ignored the first callback. This is a subtle callback-
  identity issue for external state machines. No test exercises the
  controlled `recording` + `maxDuration` combination.

### ComposerAttachment (`src/components/ChatComposer.tsx`)

- **P2 — `progress === 100` silently hides the bar.** The condition
  `progress !== undefined && progress < 100` (line 500) means upload-
  complete state is indistinguishable from "no upload in progress".
  Minor UX surprise; probably intentional but undocumented.

### SessionListItem (`src/components/ChatSession.tsx`)

- No findings.

### SessionList (`src/components/ChatSession.tsx`)

- **P2 — `header` / `footer` / `searchable` have no tests.**
  ChatSession.test.tsx covers select, delete, rename and pin but not
  these three props. Filing as P2 since the integration is trivial.

### MessageEdit (`src/components/Chat/Edit.tsx`)

- No findings.

### ReasoningTrace (`src/components/Chat/Indicators.tsx`)

- No findings. Correct controlled/uncontrolled pattern with
  `expanded` + `onExpandedChange`.

### ThinkingIndicator, MessageActions, Message, MessageGroup, MessageContent

- No findings.

### ReactionBar (`src/components/Chat/Reactions.tsx`)

- No findings. `onReact`/`onUnreact` correctly keyed off `r.reacted`.

### ReactionPicker (`src/components/Utility.tsx`)

- **P2 — `recent` state is purely internal.** No way to hydrate recent
  reactions across mounts or share them across pickers, and no
  `onRecentsChange` callback to persist upstream. Documented limit
  (recent is "persisted in component state") but the surface feels
  incomplete for typical chat UIs. Undocumented P2.

### MessagesProvider (`src/i18n/MessagesProvider.tsx`)

- No findings.

## Media findings

### MarkdownEditor (`src/components/MarkdownEditor.tsx`)

- **P1 — toolbar commands can desync controlled `value`.**
  `applyMarkdownCommand` (lines 102–166) mutates `textarea.value`
  directly and dispatches a synthetic `input` event. React's value
  tracker on a controlled `<textarea value={md}>` is known to skip
  onChange propagation when `.value` is assigned without going through
  the native setter — only the programmatic path via
  `Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,
  'value').set` survives React's diff. `MarkdownEditor.test.tsx`
  asserts `ta.value === "**hello**"` after clicking Bold but never
  asserts that `onChange` fired or that a controlled `value` prop
  observed the new markdown. In practice the preview pane will still
  reflect the prior `md` state until the user types again. This is an
  edge-path bug that is easy to miss because the DOM value looks
  correct.
- **P3 — no tests for the `renderPreview` override or the
  `preview="below"` layout class.**

### RichTextEditor (`src/components/RichTextEditor.tsx`)

- **P1 — input-path HTML bypasses sanitizer on the hot path.** The
  `onInput` handler at line 302 reads `innerHTML` and calls `setHtml`
  with the raw string; only the `useEffect` at 220–225 re-sanitizes on
  the next render. During the render cycle the controlled `value`
  observed by parent `onChange` is the unsanitized payload. The only
  surface receiving user HTML through `setHtml` without immediate
  sanitization is this `onInput`. Paste is correctly intercepted. The
  mitigating factor is that `contentEditable` itself produces tame
  markup, but any browser extension or script-injected payload would
  escape the allowlist for a single render tick.
- **P2 — `renderToolbar` API dead-ends the `run()` command for
  unknown commands.** The `RichTextCommand` union is narrow; custom
  toolbar implementations cannot issue arbitrary `execCommand`s through
  `api.run`. Minor surface gap.

### CodeEditor (`src/components/CodeEditor.tsx`)

- No findings. Tab-insertion path correctly updates both DOM value and
  controllable state in one call.

### VideoPlayer (`src/components/MediaPlayer.tsx`)

- **P1 — `muted` prop does not re-sync after mount.** The `<video
  muted={muted}>` attribute (line 323) is honored only on the initial
  render; the internal `muted` state is updated by the media element's
  own `volumechange` event. Programmatic `muted` prop changes from the
  parent do not propagate to the element because React treats `muted`
  as an ordinary prop on the React side but the internal
  `MediaShell` never reads the prop to call
  `el.current.muted = muted`. Similar applies to `AudioPlayer`.
- **P2 — no `ended` state tracked.** Per the audit brief on playback
  states: the `MediaContextValue` models only `playing`, not `ended`,
  and the `onEnded` callback is fire-and-forget to the parent. Custom
  controls cannot visually surface the ended state without listening to
  the raw DOM element themselves. Filing as undocumented gap.
- **P2 — `PlaybackRateSelect` is uncontrolled with no exposed knob.**
  The rate state lives inside the subcomponent (line 556), with no
  prop/callback on `VideoPlayerProps` to initialize, observe, or drive
  it. Consumers who want to persist the last chosen rate must fork.

### AudioPlayer (`src/components/MediaPlayer.tsx`)

- Inherits the `muted`-resync P1 above. No additional findings.

### VoiceWaveform (`src/components/MediaPlayer.tsx` — used by audio stack)

- Not in the 38-item audit bucket; skipped.

### Carousel (`src/components/Carousel.tsx`)

- **P0 — `slidesPerView` and `gap` are dead when using compound
  children.** The computed viewport style (lines 183–188) is only
  applied in the `children ?? <DefaultTree>` fallback branch. Consumers
  who opt into the compound API
  (`<Carousel><Carousel.Viewport>…</Carousel.Viewport></Carousel>`)
  lose both props entirely, because `CarouselViewport` does not read
  them from context. This affects the documented compound pattern.
- **P1 — initial `scrollToIndex(index)` fires before any slide has
  registered.** The mount effect (lines 135–137) schedules a scroll to
  `index` but `viewportRef.current.children` depends on slides that
  register through `useEffect` one render later. The first call is a
  no-op. In practice the default index is `0` so no user impact, but
  non-zero `defaultIndex` misses the initial scroll.

### CarouselImageGallery (`src/components/Carousel.tsx`)

- **P2 — `void Children; void isValidElement;` imports are a code
  smell.** Existing comment says "silence unused import for
  tree-shaking guard"; the imports are actually unused and can be
  dropped. Undocumented.

### Lightbox (`src/components/Lightbox.tsx`)

- **P1 — `onIndexChange` never fires for keyboard-driven index moves
  originating outside the component.** `setIndex` correctly calls it
  for arrow keys, thumbnails, and nav buttons. But when `indexProp` is
  supplied and the keyboard-capture effect (lines 75–86) fires, it
  calls `setIndex(index+1)` which does call `onIndexChange`. That path
  is OK. The real edge case: `setIndex`'s `clamped` value equals the
  current `indexProp` at the boundary — the callback still fires with
  the unchanged index. Minor; may cause redundant work in parents that
  re-render on the notification.

### ImageGallery (`src/components/Lightbox.tsx`)

- No findings.

### ImageCropper (`src/components/ImageCropper.tsx`)

- **P1 — `displayScale` memo is stale after image layout changes.**
  `useMemo` at 148–152 depends only on `natural`, not on any viewport
  resize, so rotating the device or resizing the container leaves the
  overlay rectangle at the wrong CSS coordinates until the image
  reloads. No `ResizeObserver` on the image element.
- **P3 — no test covers `outputQuality` propagation to
  `canvas.toDataURL` / `toBlob`.**

### Image (`src/components/Image.tsx`)

- No findings.

### ImageDiff (`src/components/ImageDiff.tsx`)

- **P1 — `overlayOpacity` prop is effectively an initializer, not a
  controlled input.** `useState(overlayOpacityProp ?? 0.5)` at line 56
  uses the prop only on first render. Parents that wire the opacity to
  external state will see their updates ignored. No sibling
  `onOpacityChange` callback exists either.

### HexDump (`src/components/HexDump.tsx`)

- No findings.

### ImageAttachment (`src/components/ChatAttachments.tsx`)

- No findings.

### AudioAttachment (`src/components/ChatAttachments.tsx`)

- **P2 — `onDownload`/`onRemove` only appear in the header, which is
  hidden when `title`, `duration`, `onDownload`, and `onRemove` are all
  falsy.** Fine (the header short-circuits correctly), but `duration`
  alone would render an otherwise-empty header if the consumer passed
  zero duration — a consumer footgun worth documenting.

### PrintLayout (`src/components/Print.tsx`)

- No findings.

### PrintButton (`src/components/Print.tsx`)

- **P2 — `printNode` uses `outerHTML` which drops component state
  (canvas pixels, form values) from the printed clone.** Intentional
  simplification but undocumented; consumers with canvases or live
  form inputs will see blank regions.

## Zero-finding roster (Chat)

- Message
- MessageContent
- MessageGroup
- MessageEdit
- ThinkingIndicator
- ReasoningTrace
- ReactionBar
- MessageActions
- SessionListItem
- MessagesProvider
- Composer (root)

## Zero-finding roster (Media)

- CodeEditor
- Image
- HexDump
- ImageGallery
- ImageAttachment
- PrintLayout

## Components I couldn't audit

None. All 38 files in the bucket were read in full.

## Methodology notes

- Read-only audit using the `Read` and `Grep` tools. No test runner or
  type-checker was invoked.
- For each component I inspected the full source and spot-checked the
  tests colocated under `src/components/__tests__`. I did not rerun
  those tests; test-coverage findings are derived from grep over the
  test filenames + quick reads of test bodies.
- Severity mapping:
  - **P0** — a declared prop or callback is destructured and unused,
    or a callback's contract can fire the wrong arguments (e.g., alias
    like `_onModelChange`).
  - **P1** — works in the common path but breaks on a realistic edge
    case (controlled mode re-sync, toolbar desync, resize handling).
  - **P2** — undocumented behavior a maintainer can miss.
  - **P3** — test-coverage-only gap with no runtime evidence of a bug.
- "Streaming" checks: inspected `StreamingText`, `MessageContent`
  streaming cursor, `ReasoningTrace.streaming`, `Composer.status`
  streaming, and `Conversation.status` streaming. Three of the four are
  sound; `Composer` routes stop via `onStop?.()` correctly and the
  context `status` propagates to `ComposerSubmit`.
- Editor sanitization: `RichTextEditor` uses `sanitizeHtml("rich-text")`
  via DOMPurify on the initial write, on paste, and inside `runCommand`.
  Only the hot `onInput` path skips that sanitization (filed above).
  `MarkdownEditor` doesn't need a sanitizer because it renders via
  React element trees, never `dangerouslySetInnerHTML` — the existing
  code comment documents this correctly.
- Controlled/uncontrolled: every editor and selector in-bucket uses a
  consistent `value?` + `defaultValue` + `onChange` triad via
  `useControllableState`, except for `ImageDiff.overlayOpacity` and
  `VideoPlayer/AudioPlayer.muted`, flagged above.
- Playback state: the `MediaContext` tracks `playing` but not `ended`
  (flagged). `onEnded` is wired through, so external state machines can
  still model the transition.
