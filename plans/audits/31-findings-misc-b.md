# Plan 31 — Misc-B Bucket Audit (second half of `misc` bucket, 68 components)

Scope: `/Users/aaron/Code/VoidFrame/plans/audits/_misc-b.json`. Methodology: 5-point liveness check per plan 31 Task 2 (prop-to-code liveness, controlled/uncontrolled, state transitions, callback signatures, test coverage). Read-only pass — no source modified.

## Severity counts

- P0 (dead prop / broken callback): **1**
- P1 (edge-path bug): **1**
- P2 (undocumented behavior): **1**
- P3 (test-only gap): **2**

Total components audited: 68 / 68. Components couldn't audit: 0.

## Findings (per component)

### VStack — `src/components/Layout.tsx:97`

- **P0 — dead prop `wrap`.** `VStack` uses the shared `StackProps` interface (`src/components/Layout.tsx:65`), which declares `wrap?: boolean`. The destructure on line 98 (`{ children, align, gap, className, style, ...props }`) does NOT pull `wrap`, so when a consumer passes `<VStack wrap>` the boolean falls through `...props` onto the underlying `<div>` on line 107 and React will log an unknown-DOM-attribute warning. `HStack` on `src/components/Layout.tsx:75` handles `wrap` correctly, so the type contract implies both do. Fix: either destructure+apply `wrap` in VStack (as HStack does) or split the Stack types so only HStack exposes it.

### SwipeActions — `src/components/Gestures.tsx:107-115`

- **P1 — leading-only `SwipeActions` cannot be opened.** In `onPointerMove` the bounds are computed as `const max = trailingActions ? actionWidth : 0;` and `const min = leadingActions ? -actionWidth : 0;`, then the next offset is clamped via `next = Math.max(-max, Math.min(-min, -next));`. When only `leadingActions` is provided (no `trailingActions`), `max === 0` so `-max === 0`, and for any rightward drag the `Math.max(0, …)` floor forces the result back to `0` — `setOffset(-next)` becomes `setOffset(0)` and the leading action panel never opens. Trailing-only and leading+trailing both work. The snap-open logic on line 118-120 silently papers over this because `offset` never leaves `0` until the user also supplies trailing actions. Fix: decouple the two bounds (e.g. `next = Math.max(min, Math.min(max, startOffset.current + dx))`) instead of folding both through negation.

### Dropdown — `src/components/Overlay.tsx:151`

- **P2 — deprecated component, audit note only.** Marked `@deprecated` in favor of `Menu` (line 150) and the deprecation is emitted via `deprecatedComponent(...)`. All three advertised props (`trigger`, `items`, `align`) are wired; nothing is dead. Flagging solely so consumers of this audit know this is on the retirement list for v1.1 — no code change required.

### SimpleChat — `src/components/ChatModel.tsx:673`

- **P3 — test-only gap.** The component is fully functional (`conversation` and `header` both live at lines 681-682), but a Grep across `**/*.test.*` finds zero references to `SimpleChat`. The neighboring `ChatLayout` is exercised in `src/components/__tests__/ChatSession.test.tsx`; `SimpleChat` is not.

### PromptTemplateEditor / PromptTemplateList — `src/components/ChatComposer.tsx:750`, `src/components/ChatComposer.tsx:702`

- **P3 — thin test coverage.** Both are imported and lightly rendered in `src/components/__tests__/ChatComposer.test.tsx`, but there is no coverage for the `onSave` callback emitting a template with derived `variables` via `extractVars(body)` (line 772-773) nor for `onSelect` on `PromptTemplateList`. Prop wiring itself is correct (controlled via local `useState` triad on 757-759; compound Save/Cancel buttons on 806-818).

## Zero-finding roster (62 components)

All prop declarations are live, controlled/uncontrolled state branches behave correctly, callbacks have consistent signatures, and each is referenced by at least one test file.

- **SubmitButton** — `src/components/ChatComposer.tsx:540`. `status`, `onSubmit`, `onStop`, `disabled` all live; button click branches on `status==="streaming"`. Covered by `ChatComposer.test.tsx`.
- **UnreadBadge** — `src/components/ChatModel.tsx:587`. `count`, `max`, `dot`, `label` all live (dot-mode short-circuit at line 592). Covered by `ChatSession.test.tsx`.
- **UserCard** — `src/components/Identity.tsx:34`. `user`, `actions`, `compact`, `onSelect`; onSelect switches render between `<button>` and `<article>`. Covered by `Identity.test.tsx`.
- **Backdrop** — `src/components/Popovers.tsx:592`. `open`, `blur`, `tint` all live; `open={false}` early-returns null. Covered by `Popovers.test.tsx`.
- **BackToTop** — `src/components/NavigationExtended.tsx:210`. `threshold`, `position`, `label` live; scroll listener registered in effect. Covered by `NavigationExtended.test.tsx`.
- **Callout** — `src/components/Notifications.tsx:262`. `icon`, `title`, `tone` live. Covered by `Notifications.test.tsx`.
- **Changelog** — `src/components/HelpChangelog.tsx:146`. `entries`, `collapsed`, `title` live; `collapsed` seeds initial-expanded set on line 151-153. Covered by `HelpChangelog.test.tsx`.
- **Clipboard** — `src/components/Utility.tsx:35`. `value`, `children` (render-prop), `onCopy`, `resetMs` live; clipboard fallback silent-catches on line 49. Covered by `InteractiveMedia.test.tsx`.
- **ConsoleOutput** — `src/components/DevTools.tsx:345`. `entries`, `filter`, `showTimestamps` live; `filter` supports `"warn+"` suffix (line 354). Covered by `DevTools.test.tsx`.
- **ContextWindow** — `src/components/ChatModel.tsx:273`. `used`, `max`, `label` live; pct clamped 0–100 on line 275. Covered by `ChatSession.test.tsx`.
- **Draggable** — `src/components/DragDrop.tsx:172`. `id`, `index`, `droppableId` live (render-prop). Covered by `DragDrop.test.tsx`.
- **DropZone** — `src/components/FormExtended.tsx:421`. `onFiles`, `accept`, `label` live. Covered by `FormExtended.test.tsx`.
- **Hide** — `src/responsive/Show.tsx:49`. `above`, `below`, `between` map to class tokens via `visibilityClasses`. Covered by `Responsive.test.tsx`.
- **HStack** — `src/components/Layout.tsx:74`. `align`, `gap`, `wrap` live (wrap applied as class). Covered by `Layout.test.tsx`.
- **Identicon** — `src/components/Identity.tsx:267`. `value`, `size`, `background` live; `useMemo` on pattern keyed on value (line 272). Covered by `Identity.test.tsx`.
- **MegaMenu** — `src/components/MegaMenu.tsx:44`. `open`, `defaultOpen`, `onOpenChange` with correct uncontrolled fallback (line 48-53). Covered by `MegaMenu.test.tsx`.
- **OfflineBanner** — `src/components/Network.tsx:24`. `message`, `dismissible`, `onDismiss` live; hidden flag resets on reconnect (effect line 35-37). Covered by `FeedbackOverlays.test.tsx`.
- **OrganizationCard** — `src/components/Identity.tsx:188`. `organization`, `actions`, `onSelect` live. Covered by `Identity.test.tsx`.
- **PlanDisplay** — `src/components/ChatAgent.tsx:412`. `steps`, `onStepClick`, `title` live; step button disabled when no `onStepClick` (line 440). Covered by `ChatAgent.test.tsx`.
- **QuickReplies** — `src/components/ChatComposer.tsx:683`. Alias export of `SuggestionChips` — intentional and documented. Covered by `ChatComposer.test.tsx`.
- **SegmentedProgress** — `src/components/Metrics.tsx:205`. `segments`, `total`, `showLabels` live. Covered by `DataDisplay.test.tsx`.
- **Show** — `src/responsive/Show.tsx:25`. `above`, `below`, `between` map via `visibilityClasses`. Covered by `Responsive.test.tsx`.
- **Snackbar** — `src/components/ToastSystem.tsx:359`. Thin forwarding wrapper: `Toaster` with `position="bottom-center"`. Covered by `ToastSystem.test.tsx`.
- **SourceGrid** — `src/components/ChatCitations.tsx:275`. `sources`, `onSourceClick`, `columns` live. Covered by `ChatCitations.test.tsx`.
- **Sticky** — `src/components/LayoutExtended.tsx:96`. `top`, `bottom`, `zIndex` live. Covered by `LayoutExtended.test.tsx`.
- **SuggestionChips** — `src/components/ChatComposer.tsx:639`. `suggestions`, `onSelect`, `layout` live; onSelect receives `(item, index)`. Covered by `ChatComposer.test.tsx`.
- **SwipeActions** (root component, excluding the leading-only bug above) — `src/components/Gestures.tsx:89`. `leadingActions`, `trailingActions`, `actionWidth` prop-to-code mapping is all live; only the clamp logic is defective. Covered by `Gestures.test.tsx`.
- **TabBar** — `src/components/Navbar.tsx:101`. `value`, `defaultValue`, `onChange` with correct controlled/uncontrolled toggle (line 106-110). Covered by `Navbar.test.tsx`.
- **TeamCard** — `src/components/Identity.tsx:114`. `team`, `actions`, `onSelect` live. Covered by `Identity.test.tsx`.
- **TrendIndicator** — `src/components/Metrics.tsx:374`. `value`, `format`, `showArrow` live. Covered by `DataDisplay.test.tsx`.
- **ConnectionStatus** — `src/components/Network.tsx:88`. `status`, `label` live. Covered by `FeedbackOverlays.test.tsx`.
- **DataList** — `src/components/DataList.tsx:30`. `items`, `orientation` live; `children` co-exists with `items` intentionally. Covered by `DataDisplay.test.tsx`.
- **LatencyIndicator** — `src/components/ChatModel.tsx:382`. `value`, `label` live; tone buckets <500/<2000/<5000ms (line 387). Covered by `ChatSession.test.tsx`.
- **Quote** — `src/components/Notifications.tsx:290`. `cite`, `source` both live; string-vs-node `cite` handled (298). Covered by `Notifications.test.tsx`.
- **RegenerateButton** — `src/components/ChatComposer.tsx:603`. `onRegenerate`, `label` live. Covered by `ChatComposer.test.tsx`.
- **ScrollSpy** — `src/components/NavigationExtended.tsx:102`. `offset`, `smooth` live; scroll listener auto-rebinds on `offset` change (line 132). Covered by `NavigationExtended.test.tsx`.
- **Sidebar** — `src/components/Sidebar.tsx:36`. `collapsed`, `adaptive` live; context-prop surfaced to `Brand`/`Section`. Covered by `Sidebar.test.tsx`.
- **StatusIndicator** — `src/components/Metrics.tsx:415`. `status`, `label` live. Covered by `DataDisplay.test.tsx`.
- **StopButton** — `src/components/ChatComposer.tsx:574`. `onStop`, `label` live. Covered by `ChatComposer.test.tsx`.
- **Tag** — `src/components/DataExtended.tsx:141`. `color`, `onRemove` live (removes via inner span — minor a11y note deferred, not a functional finding). Covered by `DataExtended.test.tsx`.
- **ToolCallGroup** — `src/components/ChatAgent.tsx:175`. `title`, `status` live. Covered by `ChatAgent.test.tsx`.
- **TraceViewer** — `src/components/ChatModel.tsx:510`. `spans`, `totalMs` live; `totalMs` fallback via `computeTotal` (line 512). Covered by `ChatSession.test.tsx`.
- **AspectRatio** — `src/components/Layout.tsx:202`. `ratio` live; default 16/9 (203). Covered by `Layout.test.tsx`.
- **AttachmentList** — `src/components/ChatAttachments.tsx:130`. `orientation` live. Covered by `ChatAttachments.test.tsx`.
- **ContextMenu** — `src/components/Menu.tsx:539`. `content` live; `children` wrapped by `onContextMenu` handler. Covered by `Menu.test.tsx`.
- **Droppable** — `src/components/DragDrop.tsx:124`. `id` live (render-prop children emit `isOver` / `dropRef`). Covered by `DragDrop.test.tsx`.
- **EmptyLayout** — `src/components/LayoutExtended.tsx:261`. `maxWidth` live; sm/md/lg name map + number/string fallback (line 263-273). Covered by `LayoutExtended.test.tsx`.
- **KeyValue** — `src/components/DataExtended.tsx:493`. `items` live; per-item `color` override. Covered by `DataExtended.test.tsx`.
- **LegalText** — `src/components/RichEmbed.tsx:23`. `size` (`xs`|`sm`) live. Covered by `RichEmbed.test.tsx`.
- **ScrollRow** — `src/components/Card.tsx:67`. `gap` live. Covered by `Card.test.tsx`.
- **SegmentBar** — `src/components/Card.tsx:128`. `segments` live; total computed from span. Covered by `Card.test.tsx`.
- **Shortcut** — `src/components/NavigationExtended.tsx:288`. `keys` live; mac/pc alias tables switched by `isMacLike()`. Covered by `NavigationExtended.test.tsx`.
- **Spacer** — `src/components/Text.tsx:196`. `size` live (memoized). Covered by `Text.test.tsx`.
- **StatGroup** — `src/components/Metrics.tsx:23`. `divided` live. Covered by `DataDisplay.test.tsx`.
- **StatusBar** — `src/components/Card.tsx:93`. `items` live. Covered by `Card.test.tsx`.
- **Toolbar** — `src/components/Toolbar.tsx:29`. `orientation` live. Covered by `Toolbar.test.tsx`.
- **UserMenu** — `src/components/NavigationExtended.tsx:428`. `user` live; children cloned to close menu on select. Covered by `NavigationExtended.test.tsx`.
- **Center** — `src/components/Layout.tsx:184`. Zero-prop presentational. Covered by `Layout.test.tsx`.
- **ConfirmProvider** — `src/components/Dialog.tsx:512`. Zero-prop provider; request/resolve pipeline live. Covered by `Dialog.test.tsx`.
- **DescriptionList** — `src/components/DataList.tsx:75`. Zero-prop; compound `.Term` + `.Description`. Covered by `DataDisplay.test.tsx`.
- **Legend** — `src/components/FormStructure.tsx:159`. Zero-prop thin wrapper over `<legend>`. Covered by `FormStructure.test.tsx`.
- **ShortcutProvider** — `src/hooks/useShortcuts.tsx:42`. Zero-prop; registry state live. Covered by `ShortcutGuide.test.tsx`.
- **Stretch** — `src/components/Layout.tsx:259`. Zero-prop spacer. Covered by `Layout.test.tsx`.

## Methodology notes

- **Search strategy.** Read the source file for every unique component path in `_misc-b.json`, then ran `Grep` over `**/*.test.*` to establish a coverage floor per component (presence of at least one test-file reference counts as "tested"). All references in this report are the declaration sites of the component (`export const …` or `const …Base = forwardRef`).
- **Prop liveness rule.** A prop is "live" if it is either destructured in the component function body and used (inline style, attribute, conditional render, or forwarded to a child) or destructured but documented as an intentional passthrough via `...props`. A prop declared in the `Props` interface but never destructured and landing on a DOM element through `...props` spread counts as dead (React will surface it as an unknown-attribute warning).
- **Controlled/uncontrolled rule.** The component must seed an internal state from `defaultX`, fall back to `value ?? internal`, and only update the internal store when `value === undefined`. A deviation (e.g. calling `setInternal` unconditionally) would be P0. Every controllable component in this bucket follows the pattern.
- **Callback signature rule.** Change handlers emit the new value (not the event) unless the prop name mirrors a DOM handler. `SuggestionChips.onSelect` (emits `(item, index)`) and `Citation.onClick` (emits the source ref) are the asymmetries I noticed — both are intentional and documented in prop JSDoc.
- **Test-coverage heuristic.** Presence of the component identifier in any `*.test.*` file under `src/`, `tests/`, or `docs/` is sufficient to clear P3. I did not measure branch coverage; this audit only checks that the component name is referenced at all.
- **Out-of-scope observations.** SwipeActions has two additional ergonomic issues (no long-press-to-open, scroll capture on touch devices) that are behavioral gaps, not correctness regressions, so they are excluded. `Dropdown`, `Popover`, `Drawer`, `Alert`, `ConfirmDialog`, `Spinner` are all marked `@deprecated` — they still work; deprecation is enforced at runtime via `deprecatedComponent(...)` from `src/utils/deprecate.ts`.
