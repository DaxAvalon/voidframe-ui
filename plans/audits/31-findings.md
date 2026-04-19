# Audit 31 — Functionality Audit Findings

Audit date: 2026-04-18. Audit is READ-ONLY. Source not modified.

## Summary

| Severity | Count | Notes |
|---|---|---|
| P0 | 29 | dead props / broken callbacks / never-rendered states |
| P1 | 45 | edge-path bugs, default mismatches |
| P2 | 43 | dead code, undocumented, untested-but-working |
| P3 | 44 | test-coverage gaps only |
| **Total** | **161** | across 9 buckets |

Components audited: 499 (across 9 buckets)
Top-50 high-prop-count components: deep-dive per-component files in `plans/audits/31-per-component/` (49 files on disk; the top-50 list in `plans/audits/31-top50.json` contains one duplicate entry that was not materialised as its own file)
Components with findings (signal): ~120
Zero-finding components: ~310 (aggregated across bucket-level zero-finding rosters)

## Headline findings

- **Charts: un-populated `ChartContext` scales is the single largest root defect.** Eight top-level charts (AreaChart, BarChart, LineChart, ScatterPlot, CandlestickChart, ComposedChart, Histogram, WaterfallChart, plus BoxPlot) call `<ChartFrame>` without passing `xScale`/`yScale`, so every `<Gridlines>`, `<ReferenceLine>`, and `<ReferenceBand>` child silently renders nothing — making `showGrid={true}` a no-op across the chart bucket. `DonutChart`'s `innerRatio` default is also dead due to spread order (`{...props}` overwrites the explicit `innerRatio ?? 0.6`).
- **Forms: MentionInput's `SlashCommandOption.action` receives hardcoded empty arguments** (`{ text: "", triggerIndex: 0, caret: 0 }`), so every declared field of the callback contract is a lie. CronBuilder's `fields` prop is destructured as `_fields` and never read. FilterBuilder's `between` operator can only accept one of the two required bounds.
- **Overlays: Popconfirm.placement is CSS-dead under Portal, CoachMark.once is explicitly `void once;`, TooltipProvider.skipDelayDuration is dead via a stale `useMemo` snapshot.** Ticker.steps is similarly `void steps;`.
- **Chat: Conversation's `onRetry`/`onStop`/`onRegenerate` and ConversationHeader's `onModelChange` are literally aliased to `_onX` and never referenced** — they are public surface but wire to nothing.
- **Multiple: VStack's `wrap` prop falls through `...props` onto the DOM** (unknown-attribute warning), while HStack consumes it correctly. DragDrop's `Droppable` attaches listeners on every render with no cleanup (leak). Gantt's `onTaskUpdate` closes over stale `draftTasks`. Carousel's `slidesPerView`/`gap` are dead under the compound children API. RegExpTester's entire `showReplace` UI has no state, no onChange, and no replace() call — a non-functional feature.
- **Several controlled props are actually one-shot initializers** — `ImageDiff.overlayOpacity`, `VideoPlayer/AudioPlayer.muted`, `MarkdownEditor.previewShown`, `NetworkInspector.filter`, `ResizableBox.width/height`.

## Findings by bucket

### Charts (49 components) — 33 findings

Root defect: every top-level chart fails to pass `xScale`/`yScale` into `ChartFrame`, so the `ChartContext` scales are always `undefined` and every subscriber child (`Gridlines`, `ReferenceLine`, `ReferenceBand`) renders `null`. See `plans/audits/31-findings-charts.md`. Severity: P0=5, P1=8, P2=9, P3=11.

Top 3 P0/P1:
- `src/charts/primitives/Gridlines.tsx:27-42` — reads unset `xScale`/`yScale` from context; every `showGrid={true}` is a no-op across 8+ charts.
- `src/charts/PieChart.tsx:199` — DonutChart spreads `{...props}` *after* `innerRatio={props.innerRatio ?? 0.6}`, overwriting the default; DonutChart renders as a plain Pie when caller omits `innerRatio`.
- `src/charts/ComposedChart.tsx:87` — `valueFormat` defaults to `String` while every sibling chart defaults to `formatChartNumber`; undocumented divergence.

### Forms (50 components) — 10 findings

See `plans/audits/31-findings-forms.md`. Severity: P0=3, P1=3, P2=4, P3=0.

Top 3 P0/P1:
- `src/components/CronBuilder.tsx:177` — `fields` prop destructured as `_fields` and never consulted; render is hardcoded 5-field.
- `src/components/FilterBuilder.tsx:49-50, 180-196` — `between` operator is offered in the UI but `renderValueInput` only emits a single scalar; two-bound range is unrepresentable.
- `src/components/MentionInput.tsx:304, 334` — `SlashCommandOption.action` is always invoked with `{ text: "", triggerIndex: 0, caret: 0 }` constants; the declared shape is a lie.

### Core (38 components) — 11 findings

See `plans/audits/31-findings-core.md`. Severity: P0=0, P1=3, P2=8, P3=0.

Top 3 P1:
- `src/components/Button.tsx:41-44, 68-85` — `asChild` branch drops `iconLeft`, `iconRight`, and the `loading` spinner/guard.
- `src/components/Navigation.tsx:256, 334-336` — Pagination's `pageSize` `<select>` has no default; uncontrolled→controlled warning when `showPageSize` is true with `pageSize` omitted.
- `src/components/AsyncData.tsx:91-93` — `status="success"` with `data` undefined silently renders `null`; neither `children(data)` nor the `empty` slot is invoked.

### Overlays (31 components) — 12 findings

See `plans/audits/31-findings-overlays.md`. Severity: P0=2, P1=7, P2=3, P3=0.

Top 3 P0/P1:
- `src/components/Popconfirm.tsx:129, 50, 133` + `src/css/components/popconfirm.css:20-46` — Portal detaches the overlay from the trigger; CSS `top/left: 100%` placement resolves against `document.body`, so `placement` is CSS-dead.
- `src/components/Spotlight.tsx:234-235, 318` — CoachMark's `once` prop is literally `void once;`.
- `src/components/Popovers.tsx:245-256, 281-287` — TooltipProvider's `skipDelayDuration` never activates because `lastClosedAt` is captured at memo time (always 0) while `setLastClosedAt` mutates a ref without re-memoizing.

### Chat + Media (38 components) — 18 findings

See `plans/audits/31-findings-chat-media.md`. Severity: P0=4, P1=6, P2=5, P3=3.

Top 3 P0/P1:
- `src/components/Chat/Conversation.tsx:78-80, 94-96` — `onRetry`, `onStop`, `onRegenerate` destructured as `_onRetry`/`_onStop`/`_onRegenerate` and never read.
- `src/components/ChatSession.tsx:300, 315` — `onModelChange` aliased to `_onModelChange` and unused; model is rendered read-only with no edit path.
- `src/components/Carousel.tsx:183-188` — `slidesPerView` and `gap` only apply in the `children ?? <DefaultTree>` fallback; the documented compound API (`<Carousel.Viewport>`) silently drops both props.

### Smalls-combined (78 components) — 26 findings

See `plans/audits/31-findings-smalls.md`. Severity: P0=7, P1=9, P2=7, P3=3.

Top 3 P0/P1:
- `src/components/Layout.tsx:97-112` — VStack's `wrap` prop falls through onto the `<div>` as an unknown DOM attribute; HStack destructures+applies it correctly.
- `src/components/Virtualization.tsx:163-166` — VirtualList's `estimatedItemHeight` is explicitly `void estimatedItemHeight;`.
- `src/components/Gantt.tsx:174-198` — `onTaskUpdate` never fires with dragged values because `onUp` closes over the `draftTasks` snapshot captured at `beginDrag` time (always `undefined`).
- Plus `src/components/DragDrop.tsx:124-153` — `Droppable` attaches `dragover`/`drop`/`dragleave` listeners on every render without cleanup (listener leak), `src/components/RegExpTester.tsx:208-219` — entire `showReplace` UI has no state and no replace() invocation, `src/components/ModelCompare.tsx:45` — `syncScroll` destructured but never applied, `src/components/Anchor.tsx:1-92` — no IntersectionObserver despite "scrollspy" docstring.

### Icons (78 components) — 3 findings

See `plans/audits/31-findings-icons.md`. Severity: P0=0, P1=0, P2=0, P3=3.

All 75 factory icons conform to `IconProps`; only test-coverage gaps:
- No family-wide loop-render smoke test for the 75 icons in `src/icons/set.tsx`.
- `IconButton.tsx:35` — module-level `warnedMissingLabel` flag makes the dev-warn test order-sensitive.
- `AccessibleIcon` not re-exported from `src/icons/index.ts`.

### Misc-A (69 components) — 43 findings

See `plans/audits/31-findings-misc-a.md`. Severity: P0=7, P1=8, P2=6, P3=22.

Top 3 P0/P1:
- `src/components/Animations.tsx:208, 244` — Ticker's `steps` prop is `void steps;` — documented no-op.
- `src/components/DevTools.tsx:880-886` — QueryBuilder's nested `<Group>` passes comment-only stub lambdas for `onAddRule` / `onAddGroup`; nested "Add Rule" / "Add Group" buttons fire nothing.
- `src/components/DevTools.tsx:871-877` — QueryBuilder uses `@ts-expect-error` around `onRuleChange` with a combinator key; the nested combinator select never actually patches.

### Misc-B (68 components) — 5 findings

See `plans/audits/31-findings-misc-b.md`. Severity: P0=1, P1=1, P2=1, P3=2.

Top 2 P0/P1:
- `src/components/Layout.tsx:97` — VStack dead `wrap` prop (also counted in smalls bucket; single root defect). Counted once in the aggregate P0 tally.
- `src/components/Gestures.tsx:107-115` — SwipeActions leading-only panel cannot be opened: `max === 0` when `trailingActions` is absent, and the clamp `Math.max(-max, …)` floors every rightward drag back to zero.

## Hall of shame — components with 3+ findings

| Component | Findings | Files |
|---|---|---|
| QueryBuilder (`src/components/DevTools.tsx`) | 3 (P1, P1, P3) | misc-a |
| DataGrid (`src/components/DataGrid.tsx`) | 3 (P1, P1, per-component P1 echo-loop) | smalls + per-component |
| MarkdownEditor (`src/components/MarkdownEditor.tsx`) | 3 (P1, P3, per-component P1 `previewShown` state desync) | chat-media + per-component |
| RichTextEditor (`src/components/RichTextEditor.tsx`) | 3 (P1 `onInput` bypass, P2 `renderToolbar` dead-end, P2 placeholder CSS) | chat-media + per-component |
| Popconfirm (`src/components/Popconfirm.tsx`) | 3 (P0 placement, P1 no focus trap, P2 trigger-cloning overrides aria) | overlays + per-component |
| ConversationHeader (`src/components/ChatSession.tsx`) | 3 (P0, P1, P3) | chat-media + misc-a |
| NetworkGraph (`src/charts/NetworkGraph.tsx`) | 3 (P1, P2, P3) | charts + per-component |
| Pagination / Navigation (`src/components/Navigation.tsx`) | 4 (P1 pageSize, P2 maxItems=1, P2 NavItem asChild, P2 legacy `total` alias) | core + smalls + per-component |
| Carousel (`src/components/Carousel.tsx`) | 3 (P0 compound API, P1 initial scroll, P1 onSlideChange spurious emit) | chat-media + per-component |
| DonutChart / PieChart (`src/charts/PieChart.tsx`) | 3 (P0 spread-order default, P2 cornerRadius conditional, P2 innerRatio unguarded) | charts + per-component |
| DateRangePicker / DatePicker (`src/components/DatePicker.tsx`) | 3 (P1 handleSelect ignores bounds, P1 preset ignores min/max, P2 format=function blur) | forms + per-component |
| InlineEdit (`src/components/InlineEdit.tsx`) | 2 P2 but surface-wide | core |
| Combobox (`src/components/Combobox.tsx`) | 3 (P1 typed query drop, P1 disabled-option highlight, P2 selectedOption null fallback) | forms + per-component |
| AudioPlayer / VideoPlayer (`src/components/MediaPlayer.tsx`) | 4+ (muted-resync, poster/playsInline inherited to audio, captions dropped for audio, no `ended` state, PlaybackRateSelect uncontrolled) | chat-media + per-component |
| VStack (`src/components/Layout.tsx:97`) | 2 (dead wrap counted twice; single defect) | smalls + misc-b |

## Zero-finding components

Roster of components flagged clean by at least one auditor.

**Charts** — OrgChart, HorizonChart, StreamGraph, ParallelCoordinates, Sankey, TreeMap, Arc, FunnelChart, ChordDiagram, SmallMultiples, Point, Sunburst, Bar, ChartTooltip, Crosshair, ChartLegend, ChartTooltipBody (plus BubbleChart, DependencyGraph, ViolinPlot, BubbleMap, Area, Line as P3-only).

**Forms** — DatePicker, DateRangePicker, PasswordInput, CommandInput, NumberStepper, SignaturePad, TimePicker, MultiSelect, Cascader, RatingInput, TreeSelect, PinInput, ColorContrast, CurrencyInput, DateTimePicker, ColorPicker, FileAttachment, CheckboxGroup, CurrencyDisplay, Input, PhoneInput, RadioGroup, SearchInput, MaskedInput, SegmentedControl, Switch, TimeZoneSelect, Select, Textarea, Field, FormField, Mention, Label, Timeline, FormActions, FormErrorSummary, NumberInput, Field.Error, Field.Help, Field.Label, FieldControl, FieldSet, Form, InputGroup.Addon.

**Core** — Accordion, Alert, AlertDialog, AlertV2, Avatar, AvatarGroup, Box, ButtonGroup, Card, Code, CodeAttachment, Container, Divider, Kbd, Progress, Result, Shimmer, Skeleton, SkeletonAvatar, SkeletonButton, SkeletonCard, SkeletonForm, SkeletonTable, SkeletonText, SplitButton, Spinner, SpinnerV2, Stack, Stepper, Text, Toggle.

**Overlays** — Dialog, ConfirmDialogV2, Modal, CommandPalette, Toast, Toaster, Popover, PopoverV2, Menu, MenuItem, MenuCheckboxItem, MenuRadioGroup, MenuRadioItem, MenuTrigger, MenuContent, MenuLabel, MenuSeparator, MenuSub, MenuSubTrigger, MenuSubContent, Spotlight.

**Chat** — Message, MessageContent, MessageGroup, MessageEdit, ThinkingIndicator, ReasoningTrace, ReactionBar, MessageActions, SessionListItem, MessagesProvider, Composer.

**Media** — CodeEditor, Image, HexDump, ImageGallery, ImageAttachment, PrintLayout.

**Smalls** — Transition, FocusScope, ErrorBoundary, LiveRegion, Separator, AccessibleIcon, HydrationBoundary, Portal, ScrollLock, SkipToContent, Slot, VisuallyHidden, RovingFocusGroup, RovingFocusGroup.Item, ResizableGroup, ResizablePanel, ResizableHandle, Flex, Grid, ScrollArea, GridItem, ThemeScope, VoidframeProvider, ResponsiveBox, Table, TreeTable, Descriptions, VirtualGrid, List, Masonry, CSVViewer, EnvironmentVars, TokenVisualizer, ThemeSelector, LiveIndicator, Countdown, RelativeTime, DurationDisplay, Wizard, Stepper, Breadcrumb, NavGroup, BreadcrumbMenu, Navbar, TabBar, HorizontalTimeline, NotificationBadge, Comment, CommentList, Activity, LogViewer, Terminal, DiffViewer, MarkdownRenderer.

**Icons** — all 75 factory icons plus Icon, IconGroup, AccessibleIcon (P3-only noise).

**Misc-A** — ToolCall, Attachment, AgentStep, AgentTrace, MultiProgress, BannerAlert, Collapsible, ConversationEmptyState, HoverCard, RAGContext, Swipeable, ReorderList, Sortable, CitationList, ContextHelp, Dots, EmptyState, LoadingOverlay, ErrorState, PresenceList, Identicon, SafeArea, Section, PageHeader, SplitView, CursorPagination.

**Misc-B** — SubmitButton, UnreadBadge, UserCard, Backdrop, BackToTop, Callout, Changelog, Clipboard, ConsoleOutput, ContextWindow, Draggable, DropZone, Hide, HStack, Identicon, MegaMenu, OfflineBanner, OrganizationCard, PlanDisplay, QuickReplies, SegmentedProgress, Show, Snackbar, SourceGrid, Sticky, SuggestionChips, TabBar, TeamCard, TrendIndicator, ConnectionStatus, DataList, LatencyIndicator, Quote, RegenerateButton, ScrollSpy, Sidebar, StatusIndicator, StopButton, Tag, ToolCallGroup, TraceViewer, AspectRatio, AttachmentList, ContextMenu, Droppable, EmptyLayout, KeyValue, LegalText, ScrollRow, SegmentBar, Shortcut, Spacer, StatGroup, StatusBar, Toolbar, UserMenu, Center, ConfirmProvider, DescriptionList, Legend, ShortcutProvider, Stretch.

## Methodology notes

- Every bucket subagent reported Bash was denied — grep+read only. Methodology held up.
- Known extractor anomalies (noted by the charts agent): `TileGridMap` has `propCount: 0` in `docs/data/props.json` despite declaring 12 props; `CSVViewer` similar (13+ props, reported as 0). Flagged for plan 32 TSDoc gap list.
- The 5-point check template (prop-to-code liveness, controlled/uncontrolled contract, state-transition rendering, callback signatures, test coverage) was followed consistently. All 49 of the 50 top-50 per-component files on disk have the 6 required sections (one top-50 entry is an alias and was folded into its canonical component).
- Counting convention: root defects that span multiple components (Gridlines/ChartContext, VStack `wrap` appearing in both smalls and misc-b) are counted once in the aggregate headline — per-bucket totals include both occurrences. Absolute aggregate severity totals above reflect the bucket-file sums, including the one double-count on VStack (P0: 29 raw → 28 de-duped).

## Links

- `plans/audits/31-component-index.json` — canonical component list + bucket assignments (499 entries)
- `plans/audits/31-top50.json` — top-50 by prop count
- `plans/audits/31-findings-charts.md`, `-forms.md`, `-core.md`, `-overlays.md`, `-chat-media.md`, `-smalls.md`, `-icons.md`, `-misc-a.md`, `-misc-b.md` — per-bucket signal-first findings (9 files)
- `plans/audits/31-per-component/<Name>.md` × 49 — deep-dive per top-50 component
