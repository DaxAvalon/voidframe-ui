# Phase 27 — Component Feature-Gap Review

> Author: automated review pass, 2026-04-15
> Scope: every component category — what features do consumers EXPECT
> that voidframe doesn't ship?
> Method: 5 parallel feature-gap subagents (Forms, Overlays, Data,
> Charts, Nav/Chat/Media) comparing the surface to Radix, Mantine,
> MUI, Chakra, Ant Design, AG Grid, Recharts, ECharts, Sonner, Vaul,
> and peers.

Five feature-gap agents ran concurrent capability surveys. The brief
was "what's MISSING that users will expect" — not bugs or hardening.
Total: **116 distinct capability gaps** across ~60 components.

Raw evidence preserved under `plans/agent-reports/27-*.md`.

---

## 0. Executive summary

The component *count* (491) overstates coverage. Most components implement
the canonical 70–80% of their concept, then stop short of the power-user
features consumers reach for. Four structural gaps matter more than any
individual component:

1. **No form-level primitive.** There is no `<Form>` root, no
   `FormProvider`, no `useForm`, no schema adapter, no `useFieldArray`,
   no dirty/touched/reset tracking, no unsaved-changes guard. Every
   mainstream library (Mantine, RHF + shadcn, Ant, MUI) ships this;
   voidframe's `Field` + `Wizard` are the substitutes and they're
   thinner than consumers expect.

2. **No async-data wrapper.** Every component takes a `loading` boolean
   with no shared empty/error/retry primitive; skeletons don't match
   component shape. Competitors have one `<AsyncData>`/`<Suspense>`
   envelope.

3. **Chart infrastructure ships the shapes but not the interactions.**
   Annotations, dual-Y, log scales (math exists, charts don't accept
   them), export, crosshair sync across siblings, zoom/pan, keyboard
   nav, data-table a11y fallback, and decimation for >5k points are
   all missing.

4. **Overlays say they do things they don't do.** Dialog advertises
   `size` variants (no CSS), typed scroll-lock primitive exists but no
   overlay engages it, nested dialogs lose focus correctly, Popover
   has no shift/boundary/virtual-element anchoring, Toast auto-dismiss
   never pauses on hover (WCAG 2.2.1).

Beyond these, each category has its own backlog — Button lacks
loading/async, Combobox lacks async + virtualization, DataGrid lacks
editable cells + row grouping, Gantt lacks today/milestone/critical,
Calendar lacks agenda/drag-create/recurring, MediaPlayer lacks
PiP/chapters/rate, Sidebar lacks Item/Header subcomponents, Icons
ship zero brand/social glyphs.

---

## 1. Cross-cutting missing primitives (P0)

These land at the framework level, not at any one component. Each is a
force-multiplier — fixing it unlocks the same feature across many
components at once.

### 1.1. `<Form>` root + `useForm` hook
New `src/components/Form/`. Provides:
- `<Form.Root>` — form-level state container with submit/reset.
- `useForm<Schema>()` — schema-resolver API (zod/yup adapter-based).
- `useFieldArray` — dynamic list of fields.
- `form.isDirty` / `form.isSubmitting` / `form.isValidating`.
- `FormProvider` context read by every input under it (id, invalid,
  describedby plumbing, required).
- `FormErrorSummary` + `focusFirstInvalid()` for a11y.
- Server-error setters (`form.setErrors({...})`) for 400-response
  plumbing.
- Autosave-on-blur helper.

Every input (`Input`, `Textarea`, `Select`, `Combobox`, `DatePicker`,
`TimePicker`, `ColorPicker`, `FileUpload`, `SignaturePad`, `TreeSelect`,
`RichTextEditor`, `CodeEditor`, `MarkdownEditor`, `RatingInput`,
`MentionInput`, `MaskedInput`) needs to consume `FormProvider` via
context so `id` / `aria-*` / `onChange` plumbing is consistent —
fixing the biggest "my form state doesn't flow down" complaint in one
sweep.

### 1.2. `<AsyncData>` wrapper + shaped skeletons
New `src/components/AsyncData.tsx`.
- Slots: `loading`, `empty`, `error`, `retry`, `children(data)`.
- Shaped skeletons: ghost rows for `Table`/`DataGrid`, ghost cards
  for `Kanban`, ghost feed for `Activity`, ghost tree for `TreeView`,
  ghost messages for `Chat.Conversation`.
- Retries with exponential backoff hook.

Replaces ~30 individual `loading?: boolean` props that each component
interprets slightly differently.

### 1.3. `<ContextMenu>` primitive
New `src/components/ContextMenu.tsx` — right-click-anchored menu at
pointer coords. Requires virtual-element support in
`utils/anchor.ts`.

`Menu.tsx` compound is the structural basis; `ContextMenu` is a thin
wrapper that opens at a `{ x, y }` instead of a DOM anchor.

### 1.4. Chart annotation + interaction primitive set
New `src/charts/primitives/Annotation.tsx`, `ReferenceLine.tsx`,
`ReferenceBand.tsx`, `EventMarker.tsx`, `ChartSyncProvider.tsx`,
`ZoomPan.tsx`.

Reused by BarChart, LineChart, AreaChart, ScatterPlot, ComposedChart,
CandlestickChart, and NetworkGraph. Without these, the chart surface
looks complete but can't match what a typical Grafana/Recharts/ECharts
dashboard does.

### 1.5. `safeHref()` (already in Phase 30 security scope)
Mentioned here because `BreadcrumbMenu`, `Navigation`, `Identity`, and
Chat citation components rely on it for safely rendering user
URLs — feature work should land on top of the security fix, not
ahead of it.

---

## 2. By category — top gaps

Compressed from the agent reports. Severity-weighted must-have (⚠) vs
nice-to-have (◉).

### Forms (22 findings)

⚠ **Form system missing outright.** See §1.1.
⚠ **Input/Textarea/Select**: no prefix/suffix/clear slots, no char count, no debounced-change, no placeholder on Select, no optgroups, no disabled-option.
⚠ **Combobox/MultiSelect**: no async `loadOptions`, no virtualization for 10k+, no `creatable`, no paste-to-split, no highlighting of matched substrings, no keyboard tag removal.
⚠ **FileUpload**: no chunked/retry/pause, no clipboard-paste, no human-readable size/mime errors, no image-preview grid with reorder.
⚠ **NumberInput**: no formatter/parser, no thousands separator, no currency prefix, no "blank = null" semantics.
◉ **Date**: no timezone (IANA), no `numberOfMonths` on single picker, no disabled-reason tooltip, no `T` = today shortcut.
◉ **DateRange**: no comparison-range mode, no ISO-week preset.
◉ **RichTextEditor / MarkdownEditor / CodeEditor**: no slash commands, no find+replace, no inline images, no version history, no collaborative cursor hook.
◉ **SignaturePad**: no `undo`, no `toSVG`, no typed-signature fallback.
◉ **MaskedInput**: no regex tokens, no aliases (phone/date/currency), no lazy placeholder.

### Overlays (20 findings)

⚠ **Dialog / Drawer / Sheet / Lightbox / CommandPalette don't engage `ScrollLock`** despite the primitive existing.
⚠ **Dialog `size` prop is typed but the CSS widths don't exist** — prop is inert.
⚠ **Nested-dialog focus restore is wrong** (FocusScope captures the original trigger, not the parent dialog).
⚠ **Popover / Tooltip lack `shift`, custom `boundary`, hide-when-anchor-offscreen, virtual-element anchoring, arrow positioning.**
⚠ **Tooltip has no `trigger="click|focus|hover"` modes, no interactive (stay-open-when-hovering-content), no controlled `open`.**
⚠ **Toast auto-dismiss doesn't pause on hover/focus** (WCAG 2.2.1), no progress/countdown, no `toast.dismiss()` (all), no grouping ("Saved ×3"), no `promise` cancel handle.
⚠ **ConfirmDialog `useConfirm` doesn't await async `onConfirm`** — closes immediately even if the handler throws.
⚠ **Dialog body has no sticky-header/sticky-footer pattern.** Long content overflows the panel.
⚠ **Dialog/Drawer have no `initialFocus` / `finalFocus` escape hatch** (always focuses the first focusable).
◉ **No `<ContextMenu>`** — see §1.3.
◉ **Spotlight**: no persistent "don't show again", no JSON config, no arrow-key binding, no auto-scroll-to-target.
◉ **CommandPalette**: no recents/pins, no async backend search, no nested palettes, fuzzy score not shown.
◉ **Lightbox**: no pan when zoomed, no slideshow/autoplay, no captions, no share, no fullscreen API, no EXIF.
◉ **Sheet snap transitions are linear, not spring**; no handle on non-bottom sides.
◉ **ConfirmDialog destructive-variant**: no type-to-confirm, no countdown-before-enable.
◉ **AlertV2 / BannerAlert**: no auto-dismiss, no pause-on-hover.
◉ **OfflineBanner**: no retry, no last-online timestamp, no service-worker `controllerchange` hook.

### Data (24 findings)

⚠ **DataGrid lacks inline cell editing + validation.**
⚠ **Column grouping / nested header rows absent.**
⚠ **Row-selection shift-click range + keyboard nav missing.**
⚠ **No bulk-actions bar** tied to selection.
⚠ **Row grouping has no aggregates** (sum/avg per group footer).
⚠ **Filters are string-only** — no per-column typed filters (number/date/enum), no AND/OR filter builder, no filter chips, no URL sync.
⚠ **Pagination is prev/next only** — no page-size selector, no jump-to-page, no "1–50 of 1,200".
⚠ **VirtualList has no dynamic row-height measurement** (ResizeObserver cache) and no `scrollToIndex`/scroll-restoration.
⚠ **TreeView has no drag-to-reorder/reparent**, no parent/child checkbox cascade, no per-node badges, no virtualization.
⚠ **Gantt has no today marker, milestones, quarter/year zoom, critical path, resource view.**
⚠ **Calendar has no agenda view, drag-to-create, drag-to-resize, recurring events, timezone display, all-day row, categories.**
⚠ **DiffViewer has no word-level diff, line annotations, collapsible unchanged hunks, "jump to next change".**
⚠ **JSONViewer has no expand/collapse all, path copy UI, search highlight, schema overlay, editable mode.**
⚠ **LogViewer / Terminal have no pause/resume, regex filter, export, or virtualization for 100k+ lines.**
⚠ **No `<AsyncData>` wrapper** — see §1.2.
◉ **Row pinning (sticky top/bottom rows).**
◉ **Saved views / presets.**
◉ **XLSX export + print layout.**
◉ **Column pinning on base `Table`** (only DataGrid supports it).
◉ **Spreadsheet clipboard** (copy range, paste, fill handle, undo/redo).
◉ **Kanban swimlanes, board-wide search, archive column, card templates.**
◉ **Activity infinite scroll, grouping, actor/action filter, realtime banner.**
◉ **CodeBlock / JSONViewer search + fullscreen + download.**
◉ **Stat / Metrics threshold coloring, period-over-period compare, click-to-drill-down.**

### Charts (25 findings)

⚠ **Reference lines / bands / thresholds** (no primitive at all).
⚠ **Point / callout / event annotations.**
⚠ **Dual Y-axes.**
⚠ **Log / symlog scale props** (`math/scales.ts` has them, charts don't accept them).
⚠ **Error bars** on Bar/Line/Scatter.
⚠ **Value labels on bars, pie slices, line points.**
⚠ **Interactive legend** — clicking a swatch does nothing across all axis charts.
⚠ **PNG / SVG export + copy-as-image.**
⚠ **Data-table a11y fallback** — framework claims this but every chart is silent for screen readers beyond `aria-label`.
⚠ **Keyboard navigation through data points.**
⚠ **Crosshair / brush sync across charts** — `SmallMultiples` can't share axes or hover.
⚠ **Zoom + pan** (wheel / pinch / selection-to-zoom).
⚠ **Null / gap / forecast-segment handling on lines.**
⚠ **Large-data decimation** (LTTB down-sampling).
⚠ **CVD-safe palette + printable monochrome + patterned fills.**
◉ **Negative stacked bars (diverging offset).**
◉ **Scatter lasso, trendline + R², density hex overlay, jitter.**
◉ **Pie explode, semicircle, top-N Other rollup, connector labels, nested rings.**
◉ **Heatmap diverging color scale, dendrogram/clustering.**
◉ **TreeMap / Sunburst drill-in with breadcrumbs.**
◉ **Candlestick volume pane, SMA/EMA/RSI/MACD overlays, period selector.**
◉ **Geo zoom + pan, marker clustering, AK/HI inset for US choropleth, projection swap.**
◉ **NetworkGraph minimap, clustering, shortest-path, edge bundling.**
◉ **Tooltip pinning / controlled tooltip.**
◉ **Legend placement + per-series values** (top/left/right/scroll).

### Nav / Chat / Media / Core / Specialty (25 findings)

⚠ **AppShell has no real mobile drawer** — advertised but implemented as width:0.
⚠ **Sidebar has no Item/Header/Search subcomponents** and no nested/collapsible groups.
⚠ **Toolbar has no overflow-to-menu**, no sticky variant, no roving-focus docs.
⚠ **Wizard has no built-in Stepper UI or progress bar** (Stepper exists in `Navigation.tsx` but isn't wired).
⚠ **Chat has no reply-to / thread primitives, no read-receipts slot.**
⚠ **ChatModel has no ModelPicker, no temperature/top-p popover, no streaming-stop control.**
⚠ **ChatComposer has no slash-command/emoji integration, no paste-image, no drop-file indicator.**
⚠ **MediaPlayer lacks PiP, playback rate, chapters, captions toggle, quality switcher, next/previous queue.**
⚠ **Button has no loading / iconLeft / iconRight / async auto-disable / split / toggle.**
◉ **Card has no hoverable, clickable-as-link, collapsible header, actions footer, cover-image slot.**
◉ **Badge has no dismissible, no count overflow (99+), no pulse, no hash-color.**
◉ **Skeleton has no list/table/card/chat presets.**
◉ **Avatar has no hash-from-name color generator, no rounded-square shape.**
◉ **Icons: no brand/social glyphs** (GitHub, Slack, Figma, Youtube, LinkedIn, X, Discord, Google, Apple). Also missing `DragHandleIcon`, `GitBranchIcon`, `GitCommitIcon` despite CommitGraph existing.
◉ **BreadcrumbMenu has no overflow collapse** (`maxItems` with dropdown ellipsis).
◉ **MenuItem has no icon/trailing slot, no scrollable long-list variant.**
◉ **Carousel has no vertical orientation, no thumb navigator, no autoplay-progress indicator, no centered alignment.**
◉ **Image has no srcset/sizes/fetchPriority pass-through, no onClick → Lightbox integration.**
◉ **Lightbox has no captions, no slideshow, no swipe-down-to-close, no share, no fullscreen API.**
◉ **DragDrop has no multi-select, no delayed-start/long-press, no between-items drop indicator, no external-file drop interop.**
◉ **Gesture has no pinch-zoom content handler, no swipe-row-actions, no long-press-menu helper.**
◉ **ColorPicker has no EyeDropper API trigger, no hex/rgb/hsl mode toggle, no recent colors, no gradient builder, no AA/AAA contrast pair checker.**
◉ **HelpChangelog has no FeedbackWidget** (thumbs up/down + comment).
◉ **Stat/Metrics: threshold coloring + period-over-period** (duplicated with Data section).

---

## 3. Proposed phases (40 – 47)

These follow the hardening/bundle/test phases (30–35 from Phase 26).
Feature phases deliver capability, not fixes. They're ordered by
leverage (unlock-the-most-at-once first).

### Phase 40 — Form system + AsyncData wrapper
**Goal:** land the two biggest cross-cutting primitives in §1.

Deliverables:
- `src/components/Form/` — Root, Provider, useForm, useFieldArray, FormErrorSummary, autosave helper, schema adapter interface.
- Zod + Yup + Valibot resolver packages (peer-dep, optional).
- `src/components/AsyncData.tsx` + shaped skeletons for Table / DataGrid / Kanban / Activity / TreeView / Chat.
- Migration: every existing input reads `FormProvider` context for id/aria/describedby.
- Docs: "Forms" guide rewrite + AsyncData guide.
- ~30 tests.

Size: ~1200 LOC. 6–8 days.

### Phase 41 — Core primitives polish
**Goal:** every atom consumers touch first (Button, Badge, Card, Avatar, Skeleton, Icons) gets the features peers ship out of the box.

Deliverables:
- `Button`: `loading` spinner slot, `iconLeft`/`iconRight`, async-auto-disable, split variant, toggle (`pressed`/`aria-pressed`).
- `Badge`: `dismissible` with onClose, `count` + `overflowCount`, dot variant, hash-color.
- `Card`: `hoverable`, `asChild` link, `Card.Actions` footer, `cover` image slot, collapsible header, skeleton state.
- `Avatar`: `getColorFromName` helper, `rounded` shape variant, 4-state status (online/away/busy/dnd).
- `Skeleton`: presets (`list`, `table`, `card`, `chat`, `feed`).
- `Icons`: add 10–15 brand icons (GitHub, Slack, Figma, Youtube, LinkedIn, X, Discord, Google, Apple) + `DragHandle`/`GitBranch`/`GitCommit`.
- ~40 tests.

Size: ~800 LOC + ~25 icon SVGs. 3–4 days.

### Phase 42 — Overlay capability hardening
**Goal:** close every gap surfaced by the Overlays agent. Overlaps with Phase 30 (security) — do AFTER security hardening.

Deliverables:
- Wire `ScrollLock` into Dialog, DrawerV2, Sheet, Lightbox, CommandPalette.
- Ship CSS for Dialog `size="sm|md|lg|xl|full"`.
- Add `initialFocus` / `finalFocus` ref props to Dialog, DrawerV2.
- Make `useConfirm().confirm()` await async onConfirm (busy state + retry).
- Extend `computeAnchoredPosition` with shift, boundary, hide-when-offscreen, virtual-element anchoring, arrow positioning.
- Tooltip: `trigger`, controlled `open`, interactive, delay-group provider wiring.
- Toast: pause-on-hover, countdown progress, `toast.dismiss()` (all), grouping, promise-cancel handle.
- New `ContextMenu` component (thin wrapper over Menu + virtual-element anchor).
- `ConfirmDialog` type-to-confirm + countdown-enable for destructive.
- Dialog body sticky header/footer pattern via CSS.
- Fix nested-dialog focus restore in FocusScope.
- ~40 tests.

Size: ~1000 LOC. 5–6 days.

### Phase 43 — DataGrid power features
**Goal:** match AG Grid / TanStack parity for the 80% of features real dashboards need.

Deliverables:
- Editable cells with per-column `editor` + `validate` + `onCellEdit`.
- Column grouping / nested header rows via new `Column.children`.
- Row selection: shift-click range, keyboard roving focus, select-all-page.
- `<DataGrid.BulkActions>` subcomponent that appears when any row is selected.
- Row grouping aggregates: `Column.aggregate: "sum|avg|min|max|count"` with group footer rows.
- Typed per-column filters (`filterType: "text|number|date|enum"`), filter-chip row, URL sync hook.
- Pagination: page-size selector, jump-to-page, range display, cursor-pagination hook.
- Saved views: named presets of sort+filter+visibility+widths.
- XLSX export + print layout.
- VirtualList: ResizeObserver-measured dynamic row heights + `scrollToIndex`.
- ~50 tests.

Size: ~1500 LOC. 7–8 days.

### Phase 44 — Chart capability expansion
**Goal:** cover the 15 chart gaps flagged critical so voidframe matches Recharts/ECharts on common dashboards.

Deliverables:
- Annotation primitive set: `ReferenceLine`, `ReferenceBand`, `Annotation`, `EventMarker`.
- Dual Y-axis support on `ComposedChart` (extend ChartContext scales).
- `scaleKind` prop on Bar/Line/Area/Scatter/Histogram (linear/log/symlog/sqrt).
- Error bars primitive + Bar/Line/Scatter props.
- Value-label primitive + Bar/Pie/Waterfall props.
- Interactive legend — every chart wires `hiddenSeries` state, filters rendering.
- Legend positioning: `legend?: { position, values, render }`.
- `ChartFrame` export imperative handle: `toSVG()`, `toPNG()`, `toDataTable()`.
- A11y: hidden `<table>` fallback on every axis chart; keyboard nav on bars/points/slices.
- `ChartSyncProvider` for shared crosshair / brush / scale across siblings.
- `ZoomPan` primitive (wheel / pinch / selection).
- Null-handling: `connectNulls` + per-segment dashed (forecast vs actual).
- LTTB decimation for >5k points on Line/Area/Scatter.
- CVD-safe palette + diverging palette + SVG pattern fills for print.
- Documented "no entrance animation" policy with `prefers-reduced-motion` note.
- ~60 tests.

Size: ~2000 LOC. 8–10 days.

### Phase 45 — Editor + Viewer upgrades
**Goal:** RichText / Markdown / Code / Diff / JSON / Log each get the features consumers expect.

Deliverables:
- RichTextEditor: slash command menu, inline-image upload hook, find+replace, table toolbar, `onSlashCommand`.
- MarkdownEditor: SECURE tokenized renderer (dovetails with Phase 30 security fix), slash commands, find+replace.
- CodeEditor: built-in themes, `onFind`, fold, `onSave` (cmd+S), language autodetect adapter.
- DiffViewer: word-level highlighting, fold-unchanged, jump-to-next-change, per-line annotation slot.
- JSONViewer: expand/collapse all, copy-path button, search highlight, schema overlay, editable mode.
- LogViewer: pause/resume, regex filter input, export, `VirtualList`-wrapped for 100k+.
- Terminal: ANSI-complete render, follow-tail mode, scroll-restoration.
- ~40 tests.

Size: ~1200 LOC. 6–7 days.

### Phase 46 — Specialty capability sweep
**Goal:** fill the Gantt/Calendar/Kanban/MediaPlayer/Wizard gaps.

Deliverables:
- Gantt: today marker, milestone markers, critical-path highlight, day/week/month/quarter/year zoom, drag-to-resize bars, drag-to-reschedule, resource view.
- Calendar: agenda view, drag-to-create/resize events, recurring events, timezone display, all-day row, event categories, overlapping events.
- Kanban: swimlanes, board search, archive column, card templates.
- Activity: infinite scroll, grouping, actor/action filter, realtime banner.
- MediaPlayer: PiP, playback rate, chapters, captions toggle, quality switcher, keyboard shortcuts, share-at-timestamp.
- Wizard: built-in Stepper UI, progress bar, non-linear gate, Review step.
- AppShell: real mobile drawer (overlay + scrim + auto-close).
- Sidebar: Item/Header/Search subcomponents, nested groups, rail-mode tooltips.
- Toolbar: overflow-to-menu, sticky variant, roving focus.
- ~50 tests.

Size: ~1500 LOC. 7–9 days.

### Phase 47 — Chat & AI depth
**Goal:** close the LLM-product-specific gaps; voidframe's Chat surface is already rich but missing the ergonomic parts.

Deliverables:
- Message: `replyTo` + `MessageThread` compound, read-receipts slot, reactions-grouping tooltip.
- ChatModel: ModelPicker (dropdown of available models), settings popover (temperature / top-p / max tokens), streaming-stop control wired into session context.
- ChatComposer: slash-command integration, emoji picker, paste-image, drop-file indicator, voice-record button, send-on-Enter vs Shift+Enter config.
- ChatAttachments: image preview, audio message playback, file preview cards.
- ChatAgent: cost display (tokens + $), context-window usage bar.
- ~30 tests.

Size: ~900 LOC. 4–5 days.

---

## 4. Rough sizing

| Phase | Est. LOC | Est. days | Tests added |
|---|---|---|---|
| 40 Form + AsyncData | ~1200 | 6–8 | ~30 |
| 41 Core primitives polish | ~800 + 25 SVG | 3–4 | ~40 |
| 42 Overlay hardening | ~1000 | 5–6 | ~40 |
| 43 DataGrid power | ~1500 | 7–8 | ~50 |
| 44 Chart expansion | ~2000 | 8–10 | ~60 |
| 45 Editors + Viewers | ~1200 | 6–7 | ~40 |
| 46 Specialty sweep | ~1500 | 7–9 | ~50 |
| 47 Chat & AI depth | ~900 | 4–5 | ~30 |
| **Total** | **~10,100 LOC** | **46–57 days** | **~340** |

For context: the entire voidframe surface today is ~30K LOC. Phases
40–47 add roughly a third more, mostly as targeted feature surface on
top of existing components.

---

## 5. Ordering recommendation

Three tracks that can run partially in parallel once Phase 30 (security)
is done:

**Track A — Forms & Overlays infrastructure (sequential):**
30 (Security) → 40 (Forms + AsyncData) → 42 (Overlay capability) → 47 (Chat/AI)

**Track B — Data depth (parallel to A, after 30):**
43 (DataGrid) → 46 (Specialty: Gantt/Kanban/Calendar/Wizard)

**Track C — Visualisation (parallel, after 30):**
44 (Charts) → 45 (Editors/Viewers)

Track A is load-bearing — 40 unblocks every other form integration,
42 unblocks ContextMenu for Data and Editor work. Track B can start
as soon as 40 lands (so DataGrid can consume `FormProvider` for
inline edit). Track C is orthogonal.

**Phase 41 (core primitives polish)** is a filler — do it
opportunistically between bigger phases; no sequential dependency.

---

## 6. What NOT to build (deferred / rejected)

- **Chart mount-animations.** Explicit policy-preserve. Document the
  trade-off so consumers choosing voidframe over Framer-Motion-heavy
  libs aren't surprised.
- **Built-in ScatterMatrix lasso.** Exotic; wait for user demand.
- **Mermaid authoring UI.** RichEmbed renders charts; adding an editor
  duplicates external tools.
- **Full Figma/tokens CLI export.** Stays out of scope per Phase 25
  deferral.
- **Mobile-first from-scratch rewrite of any surface.** Phases 42+46
  add mobile-specific features; not a full audit.
- **Dashboard/widget placement drag-resize beyond Widget.tsx.** Current
  Widget covers it; don't expand into competing tools.

---

## 7. Raw agent reports

Preserved verbatim under `plans/agent-reports/`:

- `27-forms.md` (22 findings)
- `27-overlays.md` (20 findings)
- `27-data.md` (24 findings)
- `27-charts.md` (25 findings)
- `27-nav-chat-media.md` (25 findings)

Each report has concrete file references and comparison benchmarks
against industry libraries.
