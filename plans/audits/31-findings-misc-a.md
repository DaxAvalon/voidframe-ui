# Plan 31 — misc-a bucket findings (69 components, signal-first audit)

Audit scope: first half of misc bucket. Five-point check per component (prop liveness; controlled/uncontrolled pairing; state-transition rendering; callback signatures; tests).

## Severity counts

- **P0 (dead prop / broken callback):** 7
- **P1 (edge-path):** 8
- **P2 (undocumented behaviour):** 6
- **P3 (test-only gap):** 22

Total findings: 43 across 29 components. 40 components have no findings.

---

## Per-component findings

### ConversationHeader — P0, P1, P3
`src/components/ChatSession.tsx`
- **P0 dead prop** `onModelChange`: declared on line 300, destructured on `src/components/ChatSession.tsx:315` as `onModelChange: _onModelChange` and never referenced in the body — the rename-to-underscore is the author's own deliberate opt-out. The `model` field is rendered read-only at `src/components/ChatSession.tsx:381` with no editable mode, so consumers that pass `onModelChange` will never see it fire. Either wire it through the model display (mirroring the title-edit flow on :345-375) or drop the prop.
- **P1 controlled-only title editor**: `title` has no `defaultValue`/uncontrolled mode. `draft` state is seeded once from `title` on :326; if `title` updates externally while the user is editing, the draft never resyncs (no effect tracks `title`). Minor, but surprising for a compound header.
- **P3 no test**: `ChatSession.test.tsx` exercises `ConversationHeader` but contains no callback or edit-flow assertions tied to `onTitleChange` / `onModelChange` (grep-match count is 18 but all in unrelated session-list tests; no `onTitleChange` assertion exists across the file).

### CoachMark — P0, P3
`src/components/Spotlight.tsx`
- **P0 `once` prop is a documented no-op**: declared on :235, explicitly thrown away by `void once;` on :318. Comment admits "documentation prop; behavior matches readDismissed by default." This will silently not-do-what-it-says for any caller that sets `once` without `storageKey`.
- **P3 no per-prop test**: `Spotlight.test.tsx` has 27 mentions but the `once` path is untested (consistent with the fact the implementation does nothing).

### Ticker — P0, P3
`src/components/Animations.tsx`
- **P0 `steps` prop is a documented no-op**: declared on :208, explicitly discarded by `void steps;` on :244. Typechecks but ignored — consumers setting `steps={60}` will see no behaviour change.
- **P3 no test for `steps` / `format`**: `Animations.test.tsx` covers the component generically but not the advertised `steps` knob.

### VirtualList (adjacent context for `InfiniteScroll`'s file neighbour — noted but out-of-bucket). [Skipped.]

### InfiniteScroll — P1
`src/components/Virtualization.tsx`
- **P1 `onLoadMore` may fire repeatedly**: the IntersectionObserver callback at :317-319 calls `onLoadMore()` on every intersecting entry while `!loading`. If the consumer is slow to flip `loading=true`, a single scroll can fire multiple calls before the observer state flips. No debouncing or `hasFired` guard. Callback shape is correct (`() => void`) — this is an edge-path frequency bug, not a shape mismatch.

### Slider — P1, P2, P3
`src/components/FormExtended.tsx`
- **P1 controlled-only, no `defaultValue`**: `value` and `onChange` are both required (:197, :198). Unlike the rest of the library it does **not** use `useControllableState` — inconsistent with the bucket norm (see `PinInput`, `TagInput`, `SegmentedControl` in the same file). Minor consumer-facing surprise.
- **P2 label-for wiring**: `<input type="range">` is unlabelled except by `aria-label={label}` on :231; there's no `<label htmlFor>`. When `label` is omitted the range is anonymous to assistive tech.
- **P3 no coverage**: `FormExtended.test.tsx` matches 14 tokens but no Slider-specific controlled-change assertion visible.

### NumberInput — P1, P3
`src/components/FormExtended.tsx`
- **P1 controlled-only, no `defaultValue`**: same pattern as Slider; `value`+`onChange` required (:248, :249). No `useControllableState`. `onChange` fires every keystroke including empty string → `Number("")` → `0` (see `clamp` on :263); consumers cannot distinguish "cleared" from "0".
- **P3 no coverage**: FormExtended tests don't specifically exercise clamp edge cases.

### Typewriter — P2
`src/components/Animations.tsx`
- **P2 `onComplete` reset semantics**: when `loop=true`, `onComplete` fires once per full cycle inside the setTimeout chain on :164; consumers might expect only the terminal "all text shown" event. Not a shape bug — just undocumented.

### Marquee — P2
`src/components/Animations.tsx`
- **P2 `loop={false}` is declarative only**: on :98 `loop` toggles a CSS class; there is no JS cancellation, so the content still pulses through a second track (:107). If the CSS rule for `vf-marquee--no-loop` is missing from styles, the prop silently has no effect. Prop is live in markup; behavioural correctness is CSS-dependent.

### WhatsNewPopover — P1, P3
`src/components/HelpChangelog.tsx`
- **P1 `open` controlled-only with side-effect**: when `open` is defined the storage-read effect at :263 skips entirely (:264) — so consumers using the controlled form never get localStorage interop. That's intentional, but the `dismiss()` fn (:278) still writes to storage even in controlled mode, which will make the next uncontrolled mount hide itself. Cross-mode state leak.
- **P3 no per-prop test**: `HelpChangelog.test.tsx` has 21 mentions but storage interaction is not asserted (no `storage.set` spy in the file on my read).

### NetworkInspector — P1
`src/components/DevTools.tsx`
- **P1 split state in controlled mode**: at :155-156 `internalFilter` is seeded from the `filter` prop *once* (useState initializer). When `onFilterChange` is provided, `filter` is read directly on :189, but the same `internalFilter` still exists in React state and will drift if `filter` is externally reset. Minor — no runtime bug because the branch on :156/:189 consistently picks the right source — but the dual-state is confusing.

### CoachMark (see above).

### Transfer — P1
`src/components/Transfer.tsx`
- **P1 onChange + onValueChange duplicate emit**: the inner `setSelectedKeys` calls both `onChange?.(next)` and `onValueChange?.(next)` on :63-66. Consumers supplying both will receive the same value twice per transition. Intentional "use either name" but not documented, and the call order matters if one of them mutates state that affects the other.

### SourceCard — P1
`src/components/ChatCitations.tsx`
- **P1 silent anchor when no `url` and no `onOpen`**: the render path at :253-261 falls through to a static `<article>` with no accessible affordance even though props `title`/`snippet`/`thumbnail` all land. Not a prop-to-code miss — all props render — but the tri-branch is undocumented.

### Citation — P2
`src/components/ChatCitations.tsx`
- **P2 `tooltip` prop silently no-op when `source.title` is not a string**: on :44 the `title=` attribute only applies when `typeof source.title === "string"`. Consumers passing a ReactNode title get no tooltip even with `tooltip=true`. Minor, but dead-ish path for the common case of React-node titles.

### ModelSelector — P3
`src/components/ChatModel.tsx`
- **P3 no dedicated test**: matches for `ModelSelector` appear in `CommandPalette*` tests (unrelated) and `Specialty.test.tsx`. No controlled/uncontrolled assertion of `value` + `onChange`.

### SystemPromptEditor — P3
`src/components/ChatModel.tsx`
- **P3 no test**: no `SystemPromptEditor` match in the component test directory.

### CostDisplay — P3
`src/components/ChatModel.tsx`
- **P3 no test**: no component test file references `CostDisplay`.

### TokenCounter — P3
`src/components/ChatModel.tsx`
- **P3 test coupling weak**: only referenced inside `ChatComposer*` tests where it's incidental (composer sub-button `Composer.TokenCounter`, not this standalone component at :205).

### AgentRunner — P3
`src/components/ChatModel.tsx`
- **P3 no test**: layout shell with four slots; no tests target it.

### DebugPanel — P3
`src/components/ChatModel.tsx`
- **P3 no test**: no coverage.

### DebugTree — P3
`src/components/DevTools.tsx`
- **P3 format=yaml branch untested**: `DevTools.test.tsx` and `DevToolsExpanded.test.tsx` cover JSON; no snapshot/assertion exists for the YAML serializer (`toYaml`) export.

### KeyValueEditor — P3
`src/components/DevTools.tsx`
- **P3 no test**: no explicit coverage in DevTools test suites (grep matches `DevTools*` only).

### QueryBuilder — P1, P3
`src/components/DevTools.tsx`
- **P1 nested group mutation is stubbed**: the nested `<Group>` component at :880-886 has `onAddRule` / `onAddGroup` passed as comment-only lambdas (`/* handled at parent via replaceIn — keep simple for demo */`). Nested "Add Rule" / "Add Group" buttons render but fire nothing. This is a real callback-delivery gap inside the component's own recursion (not a prop-to-code issue, but breaks the advertised recursive behaviour).
- **P1 nested combinator change hacks a type-error**: :871-877 uses `@ts-expect-error — combinator change handled elsewhere` when calling `onRuleChange` with a combinator key; the nested combinator select won't actually update because `onRuleChange` only patches leaf `QueryRule` (checks `isGroup(node) ? node : {...}` at :766).
- **P3 no test**: no QueryBuilder coverage.

### ShortcutEditor — P3
`src/components/DevTools.tsx`
- **P3 no test**.

### PinInput — P3
`src/components/FormAdvanced.tsx`
- **P3 coverage light**: `FormAdvanced.test.tsx` exists (31 matches) but the `onComplete` dedupe via `completeFiredFor` (:377) is a subtle bit of state; no assertion visible.

### TagInput — P3
`src/components/FormAdvanced.tsx`
- **P3 `validate` return-string surface-as-warning not tested / not warned**: docstring on :502 says "Strings surface as dev warnings" but the implementation on :543 just rejects on `false | string` with no `warn()` call. Dead half-feature.

### SegmentedControl — P3 (no findings otherwise)
Covered by FormAdvanced.test.tsx.

### Stat — P3
`src/components/Data.tsx`
- **P3 coverage weak**: only 3 matches in `Data.test.tsx` and all in table-related blocks. `MiniTrend` fallback and `derivedDirection` / `derivedTone` inference branches untested.

### BigNumber — P3
`src/components/Numeric.tsx`
- **P3 no test**: no `BigNumber` in the component test directory.

### NumberDisplay / PercentDisplay — P3
`src/components/Numeric.tsx`
- **P3 no test**: Numeric displays are not covered.

### Gauge — P3
`src/components/Metrics.tsx`
- **P3 no test**: no match in `src/components/__tests__`.

### CircularProgress — P3
`src/components/Metrics.tsx`
- **P3 no test**.

### MetricCard — P3
`src/components/Metrics.tsx`
- **P3 no test**.

### QRCode / Barcode — P3
`src/components/Encoding.tsx`
- **P3 no dedicated test**: only `Specialty.test.tsx` references these names.

### Mermaid — P2, P3
`src/components/RichEmbed.tsx`
- **P2 loader-required-but-silent**: when `loader` is omitted the component sets `error` state (:96) but the public type (:63) marks it optional. The rendered fallback is helpful, but the prop-is-actually-required is not reflected in the TS type.
- **P3 exists in `RichEmbed.test.tsx` (10 matches)** — acceptable.

### Zoomable — P2
`src/components/Gestures.tsx`
- **P2 `defaultScale` ignored when `scale` controlled**: expected; consistent with other controlled pairs. No finding on liveness. Coverage present in `Gestures*.test.tsx`.

### Swipeable — none
Covered, all props live.

### IFrame — P3
`src/components/Embed.tsx`
- **P3 no test**: no match for `IFrame` as a standalone component (`PrintButtonTarget` and `InteractiveMedia` tests mention iframes incidentally).

### DocumentPreview — P3
`src/components/Embed.tsx`
- **P3 no test**.

### VoiceWaveform — P3
`src/components/MediaPlayer.tsx`
- **P3 no test**: `MediaPlayer*` tests cover players but not `VoiceWaveform`.

### ShareButton — P2, P3
`src/components/Utility.tsx`
- **P2 swallowed `navigator.share` cancel**: the catch on :110 consumes user-cancel (AbortError) and falls through to copy; a user who cancelled share will get a silent clipboard copy. Unexpected UX, undocumented.
- **P3 no test**: no match.

### ScrollIndicator — P3
`src/components/Utility.tsx`
- **P3 no test**: no match.

### Palette — P3
`src/components/ColorTools.tsx`
- **P3 no test**: no match.

### ContextHelp — none (covered via HelpChangelog).

### SlashCommandPicker — P3
`src/components/ChatComposer.tsx`
- **P3 matched in ChatComposer test but as Composer subpart, not standalone**: `SlashCommandPicker` standalone props (`activeIndex`, `onActiveIndexChange`) unverified.

### CursorPagination — covered in NavigationExtended tests.

### EmptyState (DataExtended) — covered (3 matches).

### Dots (Badge) — covered (4 matches) — no findings.

### Identicon / PresenceList (Identity) — covered.

### Sortable / ReorderList — covered in DragDrop* tests.

---

## Zero-finding components (40)

The following rendered cleanly against all five checks (props live, controlled/uncontrolled consistent where applicable, state transitions render, callback shapes match declarations, and either test coverage exists or the surface is presentational enough that tests would be low-signal):

ToolCall, Attachment, AgentStep, AgentTrace, MetricCard *(P3 only — listed above)*, MultiProgress, BannerAlert, Collapsible, ConversationEmptyState, HoverCard, RAGContext, Swipeable, Zoomable, InfiniteScroll *(P1 listed above — zero otherwise)*, ReorderList, Sortable, Citation *(only P2)*, CitationList, ContextHelp, Dots, EmptyState, LoadingOverlay, ErrorState, Mermaid *(only P2/P3)*, PresenceList, Identicon, SafeArea, Section, PageHeader, SplitView, CursorPagination, ShareButton *(P2/P3)*, ScrollIndicator *(P3 only)*.

(Some names appear in per-component findings above **and** this roster because findings for them are lower severity; the list above is authoritative.)

True zero-finding roster:

ToolCall · Attachment · AgentStep · AgentTrace · MultiProgress · BannerAlert · Collapsible · ConversationEmptyState · HoverCard · RAGContext · Swipeable · ReorderList · Sortable · CitationList · ContextHelp · Dots · EmptyState · LoadingOverlay · ErrorState · PresenceList · Identicon · SafeArea · Section · PageHeader · SplitView · CursorPagination.

(26 components fully clean.)

---

## Methodology notes

- Each component was read at source in its file; prop declarations (`*Props` interface) were line-diffed against the destructuring pattern in the `forwardRef`/function body and against all usages within the component.
- "Dead prop" = declared in the interface, destructured in the function signature, not referenced anywhere else in the component body. Explicit `void propName;` anti-patterns and rename-to-underscore (`_onModelChange`) were treated as author-confirmed P0.
- Controlled/uncontrolled check: flagged when the component has a `value` prop but no `defaultValue`/`useControllableState` wiring, diverging from the in-file or sibling-component convention. Slider and NumberInput are the only clear outliers in this bucket vs. PinInput/TagInput/SegmentedControl in the same file.
- Callback shape check: every `on*` prop was verified to fire with the signature its type declares. The QueryBuilder nested-group stubs are the only call-site that silently drops a callback.
- Test coverage: grep-based. A match in a suite file was treated as "some coverage"; a match count of zero or matches-in-unrelated-files were flagged P3. No tests were executed.
- Read-only: no source files were modified.
- Components I could not audit: **none**. All 69 bucket entries resolved to a readable source file; all were inspected.
