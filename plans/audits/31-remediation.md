# Audit 31 — Remediation Plan

One row per P0/P1 finding, grouped into waves by risk. P2 / P3 collapsed to bullet lists at the end. All citations are `file:line` against the tree at audit-time.

## Wave 0 — P0 fixes (no breaking API change)

### Fix `Gridlines` / `ReferenceLine` / `ReferenceBand` rendering in every chart
- **File:** `src/charts/primitives/Gridlines.tsx:27-42` (and `ChartFrame.tsx:161-162` where scales are surfaced to context)
- **Root cause:** Every top-level chart calls `<ChartFrame>` without passing `xScale`/`yScale`, so `ChartContext` scales are `undefined` and Gridlines short-circuits to empty ticks.
- **Fix:** Thread `xScale`/`yScale` into `<ChartFrame>` from each top-level chart: AreaChart (src/charts/AreaChart.tsx:125-132), BarChart (src/charts/BarChart.tsx:133-140), LineChart (src/charts/LineChart.tsx:129-136), ScatterPlot (src/charts/ScatterPlot.tsx:107-114), CandlestickChart (src/charts/CandlestickChart.tsx:210), ComposedChart (src/charts/ComposedChart.tsx:111-118), Histogram (src/charts/Histogram.tsx:165), WaterfallChart (src/charts/WaterfallChart.tsx:224), BoxPlot (src/charts/BoxPlot.tsx:222).
- **Regression test:** `ChartFrame.test.tsx` — "Gridlines render N lines when parent chart passes xScale/yScale via ChartFrame", asserting `svg line` count equals `xTicks.length + yTicks.length` for each affected chart.

### Fix `DonutChart.innerRatio` default regression
- **File:** `src/charts/PieChart.tsx:199`
- **Root cause:** Spread order `<PieChart ref={ref} innerRatio={props.innerRatio ?? 0.6} {...props} />` — `{...props}` overrides the explicit default, so `innerRatio: undefined` reverts to PieChart's own default of `0`.
- **Fix:** Rewrite as `<PieChart ref={ref} {...props} innerRatio={props.innerRatio ?? 0.6} />` (spread first, then default).
- **Regression test:** `PieChart.test.tsx` — "DonutChart renders with innerRatio=0.6 when caller omits innerRatio", asserting rendered arc `d` attribute has the expected inner radius.

### Fix `CronBuilder.fields`
- **File:** `src/components/CronBuilder.tsx:177`
- **Root cause:** prop destructured as `_fields` and never referenced; 5- vs 6-field render is hardcoded via `FIELD_NAMES`/`FIELD_RANGES`.
- **Fix:** destructure as `fields`; use `fields.length` to drive the render loop; default `fields = DEFAULT_FIELDS` (5-field preset). `buildField` must branch for 5 vs 6.
- **Regression test:** `CronBuilder.test.tsx` — "renders exactly the `fields` provided" + "renders DEFAULT_FIELDS when `fields` omitted".

### Fix `FilterBuilder.between` shape
- **File:** `src/components/FilterBuilder.tsx:49-50, 180-196`
- **Root cause:** `renderValueInput` only renders a single scalar input for any non-empty operator; `between` requires two bounds but no tuple value is represented.
- **Fix:** branch on `op === "between"` in `renderValueInput` to render two inputs; emit `{ op: "between", value: [lo, hi] }` through `onValueChange`.
- **Regression test:** `FilterBuilder.test.tsx` — "between emits [lo, hi] tuple via onValueChange".

### Fix `MentionInput.SlashCommandOption.action` argument shape
- **File:** `src/components/MentionInput.tsx:334` (declaration at 304)
- **Root cause:** Wrapper invokes `action({ text: "", triggerIndex: 0, caret: 0 })` with constants; declared shape is a lie.
- **Fix:** pass the live `text` (textarea value slice from trigger→caret), `triggerIndex` (position of the active trigger), and `caret` (current selection start) from the surrounding mention state.
- **Regression test:** `MentionInput.test.tsx` — "SlashCommandOption.action receives live text/triggerIndex/caret matching the textarea state".

### Fix `ConversationHeader.onModelChange`
- **File:** `src/components/ChatSession.tsx:300, 315`
- **Root cause:** destructured as `_onModelChange`, never referenced; the `model` field is rendered read-only.
- **Fix:** either add an edit affordance (mirroring the title-edit flow on :345-375) that calls `onModelChange(next)` on commit, or remove the prop from the public type.
- **Regression test:** `ChatSession.test.tsx` — "onModelChange fires when the model control commits a new value".

### Fix `Conversation` `onRetry` / `onStop` / `onRegenerate`
- **File:** `src/components/Chat/Conversation.tsx:78-80, 94-96`
- **Root cause:** All three destructured as `_onRetry`/`_onStop`/`_onRegenerate`; never placed on `ConversationContext`, never read by any child.
- **Fix:** Expose them via `ConversationContext` so that `MessageActions`/`SubmitButton` descendants can call them. Wire Retry/Stop/Regenerate buttons to the context values.
- **Regression test:** `Conversation.test.tsx` — "onRetry fires when a MessageActions retry button is clicked" + analogous for stop/regenerate.

### Fix `Popconfirm.placement` anchoring under Portal
- **File:** `src/components/Popconfirm.tsx:129` (Portal wrap), `src/components/Popconfirm.tsx:50, 133` (placement class), `src/css/components/popconfirm.css:20-46`
- **Root cause:** Portal detaches the overlay; CSS `top/left: 100%` resolves against `document.body`, so `placement` is CSS-dead.
- **Fix:** compute anchored position via `computeAnchoredPosition(triggerRect, placement)` (same pattern as `PopoverV2` at `src/components/Popovers.tsx:155-172`); drop the CSS `top/left: 100%` placement rules.
- **Regression test:** `Popconfirm.test.tsx` — "overlay is positioned adjacent to the trigger's bounding rect when placement='top'".

### Fix `CoachMark.once`
- **File:** `src/components/Spotlight.tsx:234-235, 318`
- **Root cause:** implementation is literally `void once;`.
- **Fix:** either (a) implement: track dismissed-within-mount via local ref, gate `open` on `!dismissedRef.current && (once || storageKey dismissed)`; or (b) remove `once` from the props type.
- **Regression test:** `Spotlight.test.tsx` — "CoachMark with once=true hides after first dismissal for the remainder of the mount".

### Fix `Ticker.steps`
- **File:** `src/components/Animations.tsx:208, 244`
- **Root cause:** `void steps;` — documented no-op.
- **Fix:** use `steps` to discretize the animation into N frames (e.g. `setInterval(tick, durationMs / steps)`), or remove the prop.
- **Regression test:** `Animations.test.tsx` — "Ticker emits exactly `steps` intermediate values across duration".

### Fix `VStack.wrap` dead prop (DOM unknown-attribute)
- **File:** `src/components/Layout.tsx:97-112`
- **Root cause:** `VStack` destructures `{ children, align, gap, className, style, ...props }` without pulling `wrap`, so it falls through onto the `<div>`.
- **Fix:** destructure `wrap` and apply `vf-flex--wrap` class (mirror HStack line 75).
- **Regression test:** `Layout.test.tsx` — "VStack wrap=true applies vf-flex--wrap class and emits no unknown-attribute warning".

### Fix `VirtualList.estimatedItemHeight` dead prop
- **File:** `src/components/Virtualization.tsx:163-166`
- **Root cause:** `void estimatedItemHeight;` — explicitly discarded.
- **Fix:** either remove the prop from `VirtualListProps`, or wire it to drive viewport estimation when `itemHeight` is a function (fallback until measured heights are available).
- **Regression test:** `Virtualization.test.tsx` — "VirtualList uses estimatedItemHeight for initial viewport sizing when itemHeight is a function".

### Fix `RegExpTester.showReplace` non-functional UI
- **File:** `src/components/RegExpTester.tsx:208-219`
- **Root cause:** no state, no `onChange`, no `replace()` call; the result div is empty.
- **Fix:** add controlled `replacement` state, bind input `value`+`onChange`, render `testString.replace(re, replacement)` into the result div.
- **Regression test:** `RegExpTester.test.tsx` — "showReplace renders the result of testString.replace(re, replacement)".

### Fix `ModelCompare.syncScroll` dead prop
- **File:** `src/components/ModelCompare.tsx:45`
- **Root cause:** destructured but never referenced; panels scroll independently.
- **Fix:** attach `onScroll` handlers to both panel-content divs; when `syncScroll=true` mirror `scrollTop` across refs.
- **Regression test:** `ModelCompare.test.tsx` — "syncScroll=true mirrors scrollTop between the two panels".

### Fix `Anchor` scrollspy
- **File:** `src/components/Anchor.tsx:1-92`
- **Root cause:** header comment claims scrollspy but `current` is only updated via `handleClick`.
- **Fix:** add an `IntersectionObserver` over the target sections; set `current` to the first intersecting id. Preserve the click-driven path.
- **Regression test:** `Anchor.test.tsx` — "active item updates when the observed section intersects the viewport".

### Fix `Gantt.onTaskUpdate` stale-closure
- **File:** `src/components/Gantt.tsx:174-198` (onUp reads outer `draftTasks` at :182)
- **Root cause:** `onUp` closes over `draftTasks` captured at `beginDrag`; the captured object never reflects mid-drag state, so `draft` is always `undefined` and `onTaskUpdate` is skipped.
- **Fix:** read the latest state via a ref, use a functional `setDraftTasks` + commit in a post-drag effect, or compute `nextStart`/`nextEnd` inline in `onUp` from `d.initialStart` + final pointer delta.
- **Regression test:** `Gantt.test.tsx` — "onTaskUpdate fires with the updated start/end after a pointer drag".

### Fix `DragDrop.Droppable` listener leak
- **File:** `src/components/DragDrop.tsx:124-153`
- **Root cause:** `dropRef` is redeclared inline each render; listeners are added inside the ref callback without cleanup, so N renders leave N listener sets.
- **Fix:** wrap `dropRef` in `useCallback([])`; move listener attach/detach into a `useEffect` with a cleanup that calls `removeEventListener`.
- **Regression test:** `DragDrop.test.tsx` — "Droppable never registers duplicate dragover/drop listeners after re-renders" (use a listener-count spy).

### Fix `Carousel` compound API drops `slidesPerView` / `gap`
- **File:** `src/components/Carousel.tsx:183-188`
- **Root cause:** computed viewport style is only applied in the `children ?? <DefaultTree>` fallback; `CarouselViewport` does not read those values from context.
- **Fix:** publish `slidesPerView`/`gap` via `CarouselContext`; have `CarouselViewport` consume and apply the style.
- **Regression test:** `Carousel.test.tsx` — "compound `<Carousel.Viewport>` applies slidesPerView and gap to the computed style".

### Fix `QueryBuilder` nested-group callbacks
- **File:** `src/components/DevTools.tsx:880-886, 871-877`
- **Root cause:** nested `<Group>` gets comment-only stub lambdas for `onAddRule` / `onAddGroup`; combinator select uses `@ts-expect-error` to call `onRuleChange` with a key `isGroup` filters out.
- **Fix:** thread `replaceIn` down so nested groups can emit full add-rule / add-group / combinator-change patches; widen `onRuleChange`'s accepted type to cover group combinators.
- **Regression test:** `QueryBuilder.test.tsx` — "nested Add Rule / Add Group / combinator change emit the patched tree to the root onChange".

## Wave 1 — P1 fixes (no breaking API change)

### Fix `Button.asChild` drops affordances
- **File:** `src/components/Button.tsx:41-44, 68-85`
- **Root cause:** `asChild` branch renders `{children}` without `iconLeft`/`iconRight`/`loading` spinner; disabled guard ignores `loading`.
- **Fix:** inside `asChild` branch, pass decorated JSX (icons + spinner + children) as the Slot child, and use `isDisabled` (derived including `loading`) for the onClick guard.
- **Regression test:** `Button.test.tsx` — "asChild renders iconLeft/iconRight/spinner and suppresses onClick while loading".

### Fix `Pagination.pageSize` uncontrolled→controlled warning
- **File:** `src/components/Navigation.tsx:256, 334-336`
- **Root cause:** `<select value={pageSize}>` with undefined `pageSize` warns and picks first option.
- **Fix:** default `pageSize ?? pageSizeOptions[0]` and require the prop when `showPageSize=true`, or fall back to `defaultValue` until a value arrives.
- **Regression test:** `Navigation.test.tsx` — "Pagination renders without the controlled-input warning when showPageSize=true and pageSize is omitted".

### Fix `AsyncData` silent-null success
- **File:** `src/components/AsyncData.tsx:91-93`
- **Root cause:** success branch short-circuits to `null` when `data` is undefined; caller `children(data)` never runs, empty slot never taken.
- **Fix:** fall back to the `empty` slot when `data` is null/undefined, or render `children(data as T)` and let callers decide; emit a dev warning.
- **Regression test:** `AsyncData.test.tsx` — "status=success with undefined data renders the empty slot".

### Fix Popconfirm no click-outside / no focus trap
- **File:** `src/components/Popconfirm.tsx:90, 136`
- **Root cause:** only Escape is wired; no `DismissableLayer`, no `FocusScope`, `role="dialog"` without `aria-modal` or focus trap.
- **Fix:** wrap overlay in `<DismissableLayer>` and `<FocusScope trapped>`; add `aria-modal="true"` when the dialog is open.
- **Regression test:** `Popconfirm.test.tsx` — "clicking outside closes the popconfirm; focus returns to the trigger on close".

### Fix deprecated `Drawer` missing ScrollLock
- **File:** `src/components/Overlay.tsx:69-116`
- **Root cause:** modal drawer portals without locking body scroll.
- **Fix:** compose `<ScrollLock enabled={open && modal} />` inside the deprecated Drawer (mirror `DrawerV2`).
- **Regression test:** `Overlay.test.tsx` — "deprecated Drawer locks body scroll when open".

### Fix `DrawerV2` / `Sheet` `ScrollLock` ignores `modal`
- **File:** `src/components/DrawerCompound.tsx:193, 427`
- **Root cause:** `enabled={ctx.open}` should be `enabled={ctx.open && ctx.modal}`; non-modal drawers currently lock body scroll.
- **Fix:** gate `ScrollLock.enabled` on `modal` (match Dialog at `src/components/Dialog.tsx:229`).
- **Regression test:** `DrawerCompound.test.tsx` — "modal=false drawer does not add overflow:hidden to the body".

### Fix `TooltipProvider.skipDelayDuration` stale snapshot
- **File:** `src/components/Popovers.tsx:245-256, 281-287`
- **Root cause:** `lastClosedAt: lastClosed.current` captured at `useMemo` time; `setLastClosedAt` mutates the ref without re-memoizing.
- **Fix:** hoist `lastClosedAt` to `useState`, update via `setState`; include it in the memo deps. Alternatively, provide a `getLastClosedAt()` function in the context.
- **Regression test:** `Popovers.test.tsx` — "second tooltip opens with 0 delay when re-opened within skipDelayDuration".

### Fix `MenuBar` ArrowLeft/ArrowRight between sibling menus
- **File:** `src/components/Menu.tsx:608-618`
- **Root cause:** docstring claims ArrowLeft/ArrowRight sibling navigation; no keyboard handler on the menubar.
- **Fix:** in `MenuBar`, attach `onKeyDown` that moves focus between registered sibling `MenuBarMenu` triggers on Arrow keys.
- **Regression test:** `Menu.test.tsx` — "ArrowRight on an open MenuBarMenu moves focus to the next sibling menu".

### Fix `ShortcutGuide.triggerKeys` combo support
- **File:** `src/components/ShortcutGuide.tsx:21, 69`
- **Root cause:** `e.key === triggerKeys` raw equality; combos like `"mod+?"` never match.
- **Fix:** route through a combo-aware matcher (reuse the helper from `CommandPalette.tsx:162`) or narrow the docstring to single-key only.
- **Regression test:** `ShortcutGuide.test.tsx` — "triggerKeys='mod+?' opens the guide when Meta+? is pressed".

### Fix `MessageFeedback` controlled-mode deselect swallow
- **File:** `src/components/Chat/Reactions.tsx:54-58`
- **Root cause:** deselect (`next === undefined`) never calls `onReasonSelect`; parent cannot observe toggle-off.
- **Fix:** call `onReasonSelect?.(next)` unconditionally; keep the internal-state gate on `selectedReasonProp === undefined`.
- **Regression test:** `Reactions.test.tsx` — "onReasonSelect(undefined) fires when the active reason is toggled off".

### Fix `StreamingText` `speed="instant"` then back-to-number edge
- **File:** `src/components/Chat/Message.tsx:311-316`
- **Root cause:** flipping from `"instant"` back to a number with unchanged `text` leaves `done=true`; `vf-streaming-text--active` lags the real state.
- **Fix:** when `speed` changes and `i >= text.length`, reset `i` to 0 and re-run the typewriter loop if callers explicitly re-enter number-mode.
- **Regression test:** `Message.test.tsx` — "StreamingText re-animates when speed flips from 'instant' back to a number".

### Fix `ComposerMicButton` double onRecordStop
- **File:** `src/components/ChatComposer.tsx:398-403, 405-410`
- **Root cause:** controlled `recording` + `maxDuration` effect can fire `onRecordStop` twice without an intervening `onRecordStart`.
- **Fix:** gate the `maxDuration` effect's `setRecording(false)` on `recording === true`; ensure `onRecordStart`/`onRecordStop` are only emitted on actual transitions.
- **Regression test:** `ChatComposer.test.tsx` — "onRecordStop fires exactly once in controlled mode after maxDuration".

### Fix `MarkdownEditor` controlled-value desync / toolbar commands
- **File:** `src/components/MarkdownEditor.tsx:102-166, 116-120, 127-130`
- **Root cause:** `wrapSelection` / `prependLine` assign `textarea.value` directly instead of via React's native setter; `onChange` on controlled `value` can be skipped.
- **Fix:** use `Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set.call(textarea, next)` then dispatch an `input` event. Also call `onChange(next)` explicitly.
- **Regression test:** `MarkdownEditor.test.tsx` — "toolbar Bold updates controlled value via onChange".

### Fix `MarkdownEditor.previewShown` state never resyncs
- **File:** `src/components/MarkdownEditor.tsx:507`
- **Root cause:** `useState(preview !== false)` captures at mount; prop changes ignored.
- **Fix:** derive `previewShown` from the `preview` prop, or add a sync `useEffect` on `preview`.
- **Regression test:** `MarkdownEditor.test.tsx` — "previewShown reflects prop changes when parent toggles preview".

### Fix `RichTextEditor` `onInput` bypasses sanitizer
- **File:** `src/components/RichTextEditor.tsx:302`
- **Root cause:** raw `innerHTML` reaches `setHtml` without sanitization on the hot path; sanitizer only re-runs on the next render.
- **Fix:** sanitize inside the `onInput` handler before `setHtml`, matching the paste path.
- **Regression test:** `RichTextEditor.test.tsx` — "onInput with script tag is sanitized before onChange fires".

### Fix `VideoPlayer` / `AudioPlayer` `muted` prop never re-syncs
- **File:** `src/components/MediaPlayer.tsx:323` (+ `MediaShell`)
- **Root cause:** `muted` applied on initial render only; programmatic changes don't propagate.
- **Fix:** add `useEffect([muted])` that writes `el.current.muted = muted` inside `MediaShell`.
- **Regression test:** `MediaPlayer.test.tsx` — "programmatic muted prop change updates the media element".

### Fix `AudioPlayer` drops `captions`, inherits audio-irrelevant `poster`/`playsInline`
- **File:** `src/components/MediaPlayer.tsx:355-412, 391`
- **Root cause:** AudioPlayer always passes `captions={[]}` to MediaShell; also accepts `poster`/`playsInline` which make no sense for audio.
- **Fix:** forward `captions` from props to MediaShell; split the props interface so AudioPlayer omits `poster`/`playsInline`.
- **Regression test:** `MediaPlayer.test.tsx` — "AudioPlayer renders caption tracks when captions prop is provided".

### Fix `Carousel` initial scroll misses non-zero defaultIndex
- **File:** `src/components/Carousel.tsx:135-137`
- **Root cause:** mount effect schedules scroll before slides register via their own effects.
- **Fix:** defer the initial `scrollToIndex` via `requestAnimationFrame` or watch for first slide registration before calling.
- **Regression test:** `Carousel.test.tsx` — "Carousel with defaultIndex=2 scrolls to slide 2 after mount".

### Fix `Lightbox.onIndexChange` redundant firing at boundaries
- **File:** `src/components/Lightbox.tsx:75-86`
- **Root cause:** `setIndex(clamped)` still calls `onIndexChange` when clamped equals the current index.
- **Fix:** skip the callback when `clamped === currentIndex`.
- **Regression test:** `Lightbox.test.tsx` — "onIndexChange does not fire when navigating past the last slide".

### Fix `ImageCropper.displayScale` stale after resize
- **File:** `src/components/ImageCropper.tsx:148-152`
- **Root cause:** `useMemo` deps only `natural`; no `ResizeObserver`.
- **Fix:** attach a `ResizeObserver` to the image element; include observed width/height in the memo deps.
- **Regression test:** `ImageCropper.test.tsx` — "crop rectangle coordinates update on container resize".

### Fix `ImageDiff.overlayOpacity` one-shot initializer
- **File:** `src/components/ImageDiff.tsx:56`
- **Root cause:** `useState(overlayOpacityProp ?? 0.5)` seeds once; parent updates ignored.
- **Fix:** convert to `useControllableState(overlayOpacityProp, 0.5, onOpacityChange)`; add `onOpacityChange` callback.
- **Regression test:** `ImageDiff.test.tsx` — "overlayOpacity prop drives the overlay when provided".

### Fix `Presence` child ref extraction (React cross-major)
- **File:** `src/primitives/Presence.tsx:41-44`
- **Root cause:** reads `(children as any).ref` which may differ across React majors.
- **Fix:** use `useMergedRefs` helper; prefer `element.props.ref` fallback where available.
- **Regression test:** `Presence.test.tsx` — "child ref is populated regardless of React version".

### Fix `DismissableLayer` unused handle fields
- **File:** `src/primitives/DismissableLayer.tsx:56-73`
- **Root cause:** `layerStack` stores `onEscape`/`onPointerDownOutside` callbacks that are never invoked; document listeners read refs directly.
- **Fix:** either iterate `layerStack` top-first to dispatch through the handle (real top-only semantics), or drop the unused fields.
- **Regression test:** `DismissableLayer.test.tsx` — "only the topmost layer receives the Escape / outside-pointer-down callback".

### Fix `ResizableBox` controlled width/height drift
- **File:** `src/components/Resizable.tsx:341-344`
- **Root cause:** `useState(controlledW ?? defaultWidth)` seeds once; later prop changes never sync.
- **Fix:** add `useEffect([controlledW, controlledH])` that writes internal `w`/`h` when the caller is controlled; or route through `useControllableState`.
- **Regression test:** `Resizable.test.tsx` — "width prop updates propagate to the rendered container".

### Fix `DashboardGrid` double fire on pointer move
- **File:** `src/components/Widget.tsx:544-575`
- **Root cause:** `onResizeMoveTick` callback identity changes every pointer tick, which re-runs the effect that calls the tick.
- **Fix:** move the tick invocation inline in the pointer-move handler; drop the `useEffect` indirection, or throttle `setPointer`.
- **Regression test:** `Widget.test.tsx` — "DashboardGrid resize emits onLayoutChange at most once per pointer event".

### Fix `DashboardGrid` inert interaction when `onLayoutChange` absent
- **File:** `src/components/Widget.tsx:485, 527, 545`
- **Root cause:** `movable=true`/`resizable=true` still start drag tracking but early-return in commit; users see motion with no effect.
- **Fix:** disable drag handles when `onLayoutChange` is undefined, or warn in dev.
- **Regression test:** `Widget.test.tsx` — "dragging a widget is a no-op visually when onLayoutChange is absent, and emits a dev warning".

### Fix `DataGrid.onGroupByChange` echo loop
- **File:** `src/components/DataGrid.tsx:289-296`
- **Root cause:** effect re-emits the caller's `groupBy` prop; no internal state exists. Potential render loop if parent naively setState in the callback.
- **Fix:** delete the callback for prop-driven changes; only fire when internal state changes. Or introduce an internal `groupBy` store.
- **Regression test:** `DataGrid.test.tsx` — "onGroupByChange does not re-fire when the parent re-passes the same groupBy prop".

### Fix `DataGrid` "select all" scope
- **File:** `src/components/DataGrid.tsx:381-419`
- **Root cause:** `allRowKeys` computed after pagination slice; "select all" only selects current page.
- **Fix:** compute `allRowKeys` from `filteredData` *before* pagination, or document the behaviour.
- **Regression test:** `DataGrid.test.tsx` — "toggleAll selects all filtered rows across pages".

### Fix `TreeView` ArrowRight fails for lazy-loaded nodes
- **File:** `src/components/TreeView.tsx:220-224`
- **Root cause:** key handler only expands when `kids?.length` is truthy.
- **Fix:** call `toggleExpand` when `hasChildren` is true regardless of current children presence.
- **Regression test:** `TreeView.test.tsx` — "ArrowRight on a hasChildren node with no children-yet triggers the expand handler".

### Fix `NavItem.asChild` drops ref and rest props
- **File:** `src/components/Navigation.tsx:610-628`
- **Root cause:** hand-spreads `{ ...child, props }` instead of `cloneElement`; forwarded `ref` and caller `...props` are lost.
- **Fix:** use `React.cloneElement(child, { ...commonProps, ref, ...restProps, onClick })`.
- **Regression test:** `Navigation.test.tsx` — "NavItem asChild forwards ref and arbitrary aria-label".

### Fix `MarkdownEditor` / `CodeEditor` `readOnly` on toolbar/Tab paths
- **File:** `src/components/MarkdownEditor.tsx:102-166`, `src/components/CodeEditor.tsx:86-101`
- **Root cause:** toolbar commands and Tab keyboard handler bypass `readOnly` guard.
- **Fix:** add `if (readOnly) return;` at the top of every command / key handler that mutates value.
- **Regression test:** `MarkdownEditor.test.tsx` + `CodeEditor.test.tsx` — "readOnly suppresses toolbar commands and Tab insertion".

### Fix `NumberInput` / `Slider` controlled-only inconsistency
- **File:** `src/components/FormExtended.tsx:197-198, 248-249`
- **Root cause:** both require `value`+`onChange` but sibling components use `useControllableState`.
- **Fix:** route through `useControllableState(value, defaultValue, onChange)`; add `defaultValue` to the type.
- **Regression test:** `FormExtended.test.tsx` — "NumberInput and Slider support uncontrolled defaultValue".

### Fix `Checkbox` / `Radio` `disabled` aria/tabIndex wiring
- **File:** `src/components/FormExtended.tsx:40-45, 54-55, 86-91, 100-105`
- **Root cause:** `data-disabled` flips but `tabIndex={0}` stays and no `aria-disabled` is emitted.
- **Fix:** set `tabIndex={disabled ? -1 : 0}` and `aria-disabled={disabled || undefined}`.
- **Regression test:** `FormExtended.test.tsx` — "disabled Checkbox/Radio is skipped in tab order and reports aria-disabled".

### Fix `ColorSwatch.disabled` coupling
- **File:** `src/components/ColorTools.tsx:60-61`
- **Root cause:** `disabled={!onSelect}`; display-only swatches always render disabled.
- **Fix:** decouple — accept an explicit `disabled` prop; only fall back to `!onSelect` when `disabled` is undefined, and render as a `<div>` (non-button) in display-only mode.
- **Regression test:** `ColorTools.test.tsx` — "ColorSwatch without onSelect is not disabled and not focusable".

### Fix `ConfirmDialog.open` prop consumption (deprecated)
- **File:** `src/components/Overlay.tsx:333-346, 385-389`
- **Root cause:** `open` is only consulted in the `motion=false` branch; motion branch defers to `<Presence present={open}>`, which is fine, but `aria-modal="true"` stays hardcoded.
- **Fix:** gate `aria-modal` on `open` (or make the render branch drive aria).
- **Regression test:** `Overlay.test.tsx` — "ConfirmDialog drops aria-modal when open=false".

### Fix `InfiniteScroll.onLoadMore` repeated calls
- **File:** `src/components/Virtualization.tsx:317-319`
- **Root cause:** IntersectionObserver callback fires on every entry while `!loading`; no `hasFired` guard.
- **Fix:** add `hasFiredRef.current` guard reset when the sentinel goes out of view.
- **Regression test:** `Virtualization.test.tsx` — "onLoadMore fires exactly once per intersection batch".

### Fix `WhatsNewPopover` cross-mode state leak
- **File:** `src/components/HelpChangelog.tsx:263-264, 278`
- **Root cause:** `dismiss()` writes to localStorage even in controlled mode.
- **Fix:** gate the storage-write on `open === undefined` (i.e. only when uncontrolled).
- **Regression test:** `HelpChangelog.test.tsx` — "dismiss in controlled mode does not touch localStorage".

### Fix `NetworkInspector.filter` dual state
- **File:** `src/components/DevTools.tsx:139-178, 155-156, 189`
- **Root cause:** `useState(filter)` seeds once; `onFilterChange ? filter : internalFilter` branch picks on each render and can drift.
- **Fix:** route through `useControllableState`.
- **Regression test:** `DevTools.test.tsx` — "NetworkInspector filter prop updates the rendered list when controlled".

### Fix `Transfer` duplicate emit
- **File:** `src/components/Transfer.tsx:63-66`
- **Root cause:** both `onChange` and `onValueChange` fire inside `setSelectedKeys`.
- **Fix:** fire only one; alias the other to it. Document the intended name.
- **Regression test:** `Transfer.test.tsx` — "onChange and onValueChange are not both fired for the same transition".

### Fix `AppShell` CSS class prefix typo
- **File:** `src/components/AppShell.tsx:138-145`
- **Root cause:** mobile variant uses `vf-app-shell__…`, rest uses `vf-appshell__…`.
- **Fix:** unify on `vf-appshell__` (or update CSS to match).
- **Regression test:** `AppShell.test.tsx` — "mobile variant renders the same vf-appshell__ prefix".

### Fix `SwipeActions` leading-only cannot open
- **File:** `src/components/Gestures.tsx:107-115`
- **Root cause:** `max=0` when `trailingActions` absent; clamp floors rightward drag to 0.
- **Fix:** decouple bounds: `next = Math.max(min, Math.min(max, startOffset + dx))`.
- **Regression test:** `Gestures.test.tsx` — "leading-only SwipeActions opens on rightward drag".

### Fix `Axis.autoRotate` Y-axis silent no-op
- **File:** `src/charts/primitives/Axis.tsx:104`
- **Root cause:** `shouldRotate = rotate && isX && …` — Y axes ignore autoRotate.
- **Fix:** extend the rotate logic to left/right orientations, or narrow the prop docs to "X axes only".
- **Regression test:** `Axis.test.tsx` — "autoRotate on a left-oriented axis rotates tick labels".

### Fix `RadarChart` / `ScatterPlot` `showLegend` single-series override
- **File:** `src/charts/RadarChart.tsx:257`, `src/charts/ScatterPlot.tsx:130`
- **Root cause:** legend only renders when `series.length > 1`; caller cannot force it for single series.
- **Fix:** honor `showLegend=true` even for single-series charts.
- **Regression test:** `RadarChart.test.tsx` + `ScatterPlot.test.tsx` — "showLegend=true renders a legend for single-series charts".

### Fix `ComposedChart.valueFormat` default inconsistency
- **File:** `src/charts/ComposedChart.tsx:87`
- **Root cause:** defaults to `String` while sibling charts default to `formatChartNumber`.
- **Fix:** default to `formatChartNumber`.
- **Regression test:** `ComposedChart.test.tsx` — "ComposedChart formats tick labels using formatChartNumber by default".

### Fix `Heatmap` / `CalendarHeatmap` / `ChoroplethMap` legend ignores `valueFormat`
- **File:** `src/charts/Heatmap.tsx:183`, `src/charts/CalendarHeatmap.tsx:244-257`, `src/charts/ChoroplethMap.tsx:245`
- **Root cause:** legend hardcodes `Math.round(max)` or `formatChartNumber(max)`, ignoring the caller's `valueFormat`.
- **Fix:** route legend labels through `valueFormat` when provided.
- **Regression test:** one-per — "legend labels use the valueFormat prop".

### Fix `NetworkGraph.rubberBand` silent no-op mid-load
- **File:** `src/charts/NetworkGraph.tsx:298, 300-306`
- **Root cause:** when peer dep not resolved and `rubberBand=false`, `onNodeDown` returns early; drag silently no-ops.
- **Fix:** show a dev warning if the peer dep is missing when `rubberBand=false`.
- **Regression test:** `NetworkGraph.test.tsx` — "rubberBand=false drag is a no-op with a dev warning when d3-force is not loaded".

### Fix `BubbleMap` error never clears
- **File:** `src/charts/BubbleMap.tsx:88-90, 94-146`
- **Root cause:** `setError(null)` never called; once set, error UI persists across effect reruns.
- **Fix:** reset `setError(null)` at the start of each effect run.
- **Regression test:** `BubbleMap.test.tsx` — "BubbleMap clears error state when peer resolves on retry".

### Fix `ChartFrame` dual-ref fragility
- **File:** `src/charts/primitives/ChartFrame.tsx:86, 89-134`
- **Root cause:** `useImperativeHandle(ref, …)` against the same ref that `useMergedRefs` writes to; fragile ordering.
- **Fix:** separate concerns — forward DOM ref via `useMergedRefs`, expose `toSVG`/`toPNG` via a separate named handle (e.g. `exportRef`).
- **Regression test:** `ChartFrame.test.tsx` — "caller ref points at the container DOM node and imperative toSVG is available".

### Fix `Calendar` misleading `value` + `onRangeChange` stable identity
- **File:** `src/components/Calendar.tsx:52, 147-166`
- **Root cause:** `value: Date[]` implies selection but no `onValueChange`; `onRangeChange` fires fresh Date instances every render.
- **Fix:** rename to `highlighted` or add `onValueChange`; dedupe `range` by epoch ms before firing `onRangeChange`.
- **Regression test:** `Calendar.test.tsx` — "onRangeChange fires at most once for an unchanged range".

### Fix `DateRangePicker.handleSelect` / `applyPreset` ignore bounds
- **File:** `src/components/DatePicker.tsx:594-605, 607-612`
- **Root cause:** neither path validates selection against `min`/`max`/`disabledDates`.
- **Fix:** clamp/validate in both handlers; emit no onChange if clamped equals current.
- **Regression test:** `DatePicker.test.tsx` — "DateRangePicker cannot apply a preset outside min/max".

### Fix `Combobox` silent typed-query drop on blur
- **File:** `src/components/Combobox.tsx:202-208`
- **Root cause:** `allowCustomValue=false` path discards typed query without visible reset.
- **Fix:** explicitly clear input to `selectedOption.label` on blur when query is dropped; or commit `null` and document.
- **Regression test:** `Combobox.test.tsx` — "Combobox with allowCustomValue=false visually resets the input on blur".

### Fix `Combobox` disabled-option highlight
- **File:** `src/components/Combobox.tsx:163, 170`
- **Root cause:** arrow keys traverse disabled options; Enter silently no-ops.
- **Fix:** skip disabled entries during arrow traversal.
- **Regression test:** `Combobox.test.tsx` — "ArrowDown skips disabled options".

## Wave 2 — P2 cleanup (optional; can batch)

Bulleted per-component; no per-finding tests required.

- **BarChart** — document/test `showStroke` default; document `BarChartSeries.tone` as series-config.
- **CandlestickChart / OHLCChart** — note that `xTicks` is dead on band scales; document.
- **ChartFrame** — add internal-docs warning: `xScale`/`yScale` should be threaded by top-level charts (also see Wave 0).
- **PieChart** — guard `innerRatio > 1` with clamp to `[0, 1]`.
- **ChoroplethMap / Heatmap** — already covered in Wave 1 for legend + valueFormat.
- **Brush** — document that `minWidth` clears the selection on drag-end.
- **Sparkline** — honor the passed `stroke` on the `showTrend` dashed line.
- **Axis** — add tests for `hideLine`/`hideTickLines`/`hideLabels`.
- **BoxPlot** — show "no data" state for empty groups; document.
- **StreamGraph** — default `xFormat` for Date uses `toDateString()`; add a time-aware fallback or document.
- **AreaChart** — wrap `xValuesRaw` in `useMemo` so downstream memos cache.
- **Badge** — asChild drops `dot`/`icon`/`count`/`overflowCount`/`dismissible`; either restrict the asChild type or thread decorated markup.
- **Pagination.maxItems=1** — render an explicit collapsed state with current page at the tail.
- **ToggleGroup.focusItem** — remove dead helper.
- **InlineEdit.submitOnBlur / submitOnEnter** — cancel instead of commit when `disabled`/`readOnly` flipped during edit.
- **InlineEdit.onSave** — document the "external value may lag" contract.
- **FloatingActionButton.offset** — filter sub-keys by `position`.
- **CopyButton.aria-label** — drop `aria-label` from `Omit<>` or flip spread order so explicit prop wins.
- **FileUpload "removed" status** — either wire a terminal removed state or drop from the union.
- **TagInput.validate string** — call `warn`/`warnOnce` when `validate` returns a string.
- **Combobox.group** — either implement grouping render or drop from the option type.
- **MentionInput insert trailing space** — skip the trailing space when `mentionText === ""`.
- **ConversationHeader controlled-only title** — add `defaultValue`/sync effect for `title`.
- **StreamingText unused `lastText`** — drop.
- **ComposerAttachment progress=100** — render completed-state pill instead of hiding.
- **MessageList pinned-state** — document local-vs-context fallback.
- **ReactionPicker recent** — expose `recent`/`onRecentsChange` to hydrate.
- **AudioAttachment empty header** — gate on non-zero duration or all-actions-present.
- **Carousel Children/isValidElement void imports** — drop.
- **PrintButton outerHTML caveat** — document.
- **DrawerV2 / Dialog / Sheet backdrop double-fire** — pick one dismissal source; drop the other.
- **Drawer (deprecated) ScrollLock** — ship Wave 1 fix; remove `@deprecated` usage.
- **ShortcutGuide missing Portal/focus trap** — align to V2 overlay conventions or document non-modal intent.
- **Kanban search fields** — expose `getSearchable(item)` or document `{title,label}` convention.
- **JSONViewer setState during render** — move to `useEffect`.
- **Calendar `onRangeChange` identity** — covered in Wave 1.
- **NotificationCenter focus trap / escape** — add for `role="dialog"`.
- **CommitGraph disabled button** — render as `<div role="listitem">` when no callback.
- **Tabs unknown active warn** — default `aria-label`.
- **HelpTooltip aria-expanded** — drop; rely on tooltip semantics.
- **ConfidenceMeter text-only variant** — add explicit branch.
- **NumberStepper aria-valuemin/max fallback** — use `MIN_SAFE_INTEGER`/`MAX_SAFE_INTEGER`.
- **Typewriter loop+onComplete** — document per-cycle semantics.
- **Marquee loop=false** — assert CSS rule presence in tests.
- **ColorTools / Citation / Mermaid / Zoomable / ShareButton / CommitGraph / ConsoleOutput** — see per-bucket bullets.
- **Popconfirm trigger cloning** — respect caller-provided `aria-haspopup`/`aria-expanded` if set.
- **AppShell mobile CSS** — unify prefix (also a Wave 1 item).
- **Dropdown (deprecated)** — no action; track for v1.1 retirement.
- **ChartFrame `xScale`/`yScale`** — document they must be passed by top-level charts.
- **DashboardGrid 4000-cell search cap** — expose as prop or document.

## Wave 3 — P3 test-coverage backfill

One test file (or new `*.test.tsx` suite) per missing area.

- **Charts** — `BubbleChart.test.tsx`, `Area.test.tsx`, `Line.test.tsx`, `ViolinPlot.test.tsx` (explicit-number bandwidth branch), `DependencyGraph.test.tsx` (`directed=false`), `BubbleMap.test.tsx` (default color fallback), `NetworkGraph.test.tsx` (coolDownAfter assertion), add family-wide smoke render for the 75 icons in `src/icons/set.tsx`.
- **Forms** — `DateTimePicker.test.tsx`, `CurrencyDisplay` dedicated test, `ColorTools`/`Palette` dedicated test.
- **Chat** — `ChatLayout.test.tsx`, assertion for `Conversation` `vf-conversation--virtualized`.
- **Media** — `MarkdownEditor` tests for `renderPreview` override and `preview="below"` layout; `ImageCropper` `outputQuality` propagation.
- **Smalls** — `CodeBlock` download-button class decoupling (P3 cosmetic).
- **Misc-A** — dedicated tests for `ModelSelector`, `SystemPromptEditor`, `CostDisplay`, `TokenCounter`, `AgentRunner`, `DebugPanel`, `DebugTree` (YAML), `KeyValueEditor`, `QueryBuilder`, `ShortcutEditor`, `BigNumber`, `NumberDisplay`, `PercentDisplay`, `Gauge`, `CircularProgress`, `MetricCard`, `QRCode`, `Barcode`, `IFrame`, `DocumentPreview`, `VoiceWaveform`, `ShareButton`, `ScrollIndicator`, `Palette`, `Stat` (deep branches), `PinInput.onComplete` dedupe, `HelpChangelog` storage interaction, `ConversationHeader.onTitleChange`/`onModelChange`, `Spotlight.CoachMark.once` (after Wave 0 fix), `Animations.Ticker.steps`/`format` (after Wave 0 fix).
- **Misc-B** — `SimpleChat.test.tsx`, `PromptTemplateEditor`/`PromptTemplateList` `onSave` (with derived `variables`) + `onSelect`.
- **Icons** — family-wide loop-render smoke test; dedicated `IconButton` dev-warn test isolated from module state; re-export `AccessibleIcon` from `src/icons/index.ts` or update docs.
- **Core** — no P3s were filed; some components have only incidental coverage — consider a dedicated `AsyncData.test.tsx` covering the new success+undefined path (Wave 1).
- **Overlays** — no P3s were filed in the bucket; all current test files cover the principal paths.

## Priorities

Recommended execution order (no deadlines):

1. **Wave 0 charts root defect first** — `ChartFrame.xScale`/`yScale` threading. This is a single editing pattern applied across ~9 charts, unblocks `showGrid`/`ReferenceLine`/`ReferenceBand` everywhere, and has the highest signal-per-LOC. Pair with the `DonutChart` spread-order fix (one-line change, high user impact).
2. **Wave 0 dead-prop cleanup** — CronBuilder, MentionInput, ConversationHeader, Conversation callbacks, CoachMark, Ticker, VStack, VirtualList, RegExpTester, ModelCompare, Carousel compound, QueryBuilder nested, Gantt closure, DragDrop leak, Anchor scrollspy, Popconfirm placement. Each is a localized fix under 50 LOC; batch by file ownership to avoid merge churn.
3. **Wave 1 controlled-prop fixes** — prioritize `ResizableBox`, `ImageDiff.overlayOpacity`, `VideoPlayer/AudioPlayer.muted`, `NetworkInspector.filter`, `MarkdownEditor.previewShown`. Consistent pattern (route through `useControllableState`) means a shared PR.
4. **Wave 1 overlays + a11y** — ScrollLock×modal, Popconfirm focus trap, MenuBar arrow nav, NavItem cloneElement, Checkbox/Radio `aria-disabled`. Higher-risk because they touch focus handling; gate behind feature tests.
5. **Wave 1 charts UX tails** — single-series legend, Heatmap/ChoroplethMap/CalendarHeatmap legend valueFormat, Axis autoRotate, NetworkGraph warning, BubbleMap error reset, ComposedChart `valueFormat` default.
6. **Wave 2 batch PRs** — group by file. Many are docstring/JSDoc tightening and can ship together per file.
7. **Wave 3 test backfill** — opportunistic; no sequencing dependency. Add as coverage permits once Wave 0/1 ship.

**Effort estimate (rough, in reviewer-hours):**
- Wave 0 (22 fixes): ~25-35 hours including tests
- Wave 1 (~45 fixes): ~45-60 hours including tests
- Wave 2 (~43 items): ~15-20 hours (bulk docstring + small patches)
- Wave 3 (~50 test files): ~25-40 hours (scaffolding dominated)
