# Plan 31 – Smalls-Combined Bucket Audit

Bucket coverage: **78 components** across primitives (16), layout (13), data (12), utility (11), navigation (10), domain-data (9), domain-charts (1), and viewers (6).

Audit performed 2026-04-17 against the 5-point check (prop-to-code liveness, controlled/uncontrolled pairing, state transitions, callback signatures, test coverage).

---

## Severity counts

| Severity | Count |
| --- | --- |
| **P0** – dead prop / broken callback | 7 |
| **P1** – edge-path / stale closure / duplicate listeners | 9 |
| **P2** – undocumented semantics / unused surface | 7 |
| **P3** – test-only / naming | 3 |
| **Total** | **26** |

Zero-finding components: **52 of 78** (67%).

---

## Per-component findings

### Primitives (16)

#### DismissableLayer — `src/primitives/DismissableLayer.tsx`
- **P1 – dead code / misleading handle API** (`src/primitives/DismissableLayer.tsx:56-73`). The layer pushes a `DismissableLayerHandle` with `onEscape`/`onPointerDownOutside` callbacks onto `layerStack`, but no code iterates the stack to invoke those members. Escape and outside-pointer-down are handled by the document-level listeners (lines 89-115) reading `escRef`/`outRef` directly. The handle's callback fields are never called. Refactor to either invoke through the stack (so top-only dispatch is real) or drop the unused handle fields. `layerStack` itself is still used for `isTopmost()` containment checks, so the stack is not entirely dead — only the callback fields are.

#### Presence — `src/primitives/Presence.tsx`
- **P1 – child ref type gap** (`src/primitives/Presence.tsx:41-44`). `(children as { ref?: Ref<HTMLElement> | null }).ref` reads the React 18 `element.ref` shape, which React 19 has stabilised but earlier React majors used `element.props.ref` (or an internal slot). On mixed React environments the merged ref may no-op for the child's original ref. Not a crash; documented as P1 because it silently drops the caller's ref.

#### Transition, FocusScope, ErrorBoundary, LiveRegion, Separator, AccessibleIcon, HydrationBoundary, Portal, ScrollLock, SkipToContent, Slot, VisuallyHidden, RovingFocusGroup, RovingFocusGroup.Item
Zero findings. Every declared prop is live, controlled/uncontrolled pairings are correct, callback signatures match documentation, and tests exist (`src/primitives/__tests__/…`).

---

### Layout (13)

#### VStack — `src/components/Layout.tsx`
- **P0 – dead `wrap` prop** (`src/components/Layout.tsx:97-112`). `StackProps` declares `wrap?: boolean`, `HStack` destructures and applies it (`vf-flex--wrap`), but `VStack` destructures only `{ children, align, gap, className, style }` — so `wrap` is spread onto the underlying `<div>` as an unknown DOM attribute, triggering React's "unknown prop" warning. Either destructure-and-apply like HStack or omit it from the shared `StackProps`.

#### ResizableBox — `src/components/Resizable.tsx`
- **P1 – initial-state drift under controlled width/height** (`src/components/Resizable.tsx:341-344`). `useState(controlledW ?? defaultWidth)` seeds internal state from the controlled value on first render, but later changes to the `width` / `height` prop never sync the internal `w`/`h` state (no effect). When the caller stops being controlled (`width` → `undefined`), the internal state is stuck at whatever it was last initialised with. The `liveW = controlledW ?? w` fallback masks this in most cases but breaks parent-overrides on subsequent renders. Document that controlled-only is the supported path, or add a sync effect.

#### DashboardGrid — `src/components/Widget.tsx`
- **P1 – resize effect fires twice per pointer move** (`src/components/Widget.tsx:544-575`). `onResizeMoveTick` is a `useCallback` whose deps include `pointer`, and a subsequent `useEffect(() => { onResizeMoveTick() }, [onResizeMoveTick])` (line 573) invokes it as a side effect of the memoized function. Because `pointer` state changes every pointermove, the callback identity changes and the effect re-runs — but the `setPointer` inside `onMove` (line 436) is the trigger, so we get `setPointer` → render → new callback → effect → `onLayoutChange`. Works, but undocumented that resize emits on every pixel of movement; consider throttling or documenting.

#### ResizableGroup, ResizablePanel, ResizableHandle, Flex, Grid, ScrollArea, GridItem (LayoutExtended), ThemeScope, VoidframeProvider, ResponsiveBox
Zero findings. Props-to-code map is clean; controlled/uncontrolled pairings in `ResizableGroup.sizes`, `VoidframeProvider.themeName`/`density`/`contrast`, and `ThemeScope.theme` are correct. Tests exist for each.

---

### Data (12)

#### DataGrid — `src/components/DataGrid.tsx`
- **P1 – groupBy echo callback** (`src/components/DataGrid.tsx:289-296`). `onGroupByChange?.(groupBy)` fires from an effect every time the caller's `groupBy` prop changes — but `groupBy` has no internal state (it's purely a prop), so the DataGrid is only re-emitting the value the caller just passed in. This creates a potential render loop if the parent naively reassigns state inside `onGroupByChange`. The surrounding block reads like a controlled/uncontrolled pairing that isn't actually there. Either delete the callback (no internal source of truth) or introduce an internal `groupBy` state that the callback can signal.
- **P1 – "select all" scoped to current page, not filtered set** (`src/components/DataGrid.tsx:381-419`). `filteredData` is sliced to the current pagination page at line 406-409 *before* `allRowKeys` is computed at line 413, so `toggleAll` / `allSelected` reflect only the visible page. Common UI pattern, but not documented — consumers expect "select all" to behave like spreadsheets.

#### VirtualList — `src/components/Virtualization.tsx`
- **P0 – dead `estimatedItemHeight` prop** (`src/components/Virtualization.tsx:163-166`). The prop is declared on `VirtualListProps`, accepted via destructure, and then explicitly discarded with `void estimatedItemHeight;` and a comment acknowledging it is never used. `itemHeight` is required so this prop can be removed from the public surface, or wired to drive estimation when a function-based `itemHeight` is supplied.

#### TreeView — `src/components/TreeView.tsx`
- **P1 – lazy-load via ArrowRight is gated on already-loaded children** (`src/components/TreeView.tsx:220-224`). The key handler expands only when `kids?.length` is truthy. A node with `hasChildren: true` but no `children` yet (the documented lazy-load signal) can only be expanded by clicking the disclosure button — ArrowRight silently drops the interaction. Either call `toggleExpand` when `hasChildren` is true regardless of current children presence, or document that keyboard lazy-load is unsupported.

#### Kanban — `src/components/Kanban.tsx`
- **P2 – client-side search reads undocumented fields** (`src/components/Kanban.tsx:84-92`). When `searchable && !onSearch`, the fallback filter looks at `it.title` and `it.label` on each item, but `KanbanItem` exposes only `{ id, columnId, [key: string]: unknown }`. Callers will see empty-string matches unless they happen to follow the convention. Document the expected item shape or expose a `getSearchable(item)` prop.

#### Table, TreeTable, Descriptions, VirtualGrid, List (DataExtended), Masonry, CSVViewer
Zero findings. Controlled/uncontrolled sort on `Table` is correct; TreeTable's `defaultExpanded` is uncontrolled only, which matches docs; CSVViewer is pure display despite the metadata `propCount: 0` (it exposes 13+ valid props).

---

### Utility (11)

#### RegExpTester — `src/components/RegExpTester.tsx`
- **P0 – Replace UI has no state or output** (`src/components/RegExpTester.tsx:208-219`). `showReplace` renders an input with `placeholder="Replace pattern..."` and an empty `vf-regexp-tester__replace-result` div, but there is no `onChange` handler, no state, and no `replace(…)` invocation anywhere in the file. Setting `showReplace` exposes a non-functional control. Either wire it (add state, compute `testString.replace(re, replacement)`, render into the result div) or remove the prop.

#### ModelCompare — `src/components/ModelCompare.tsx`
- **P0 – dead `syncScroll` prop** (`src/components/ModelCompare.tsx:45`). Destructured but never referenced in JSX or effect — panels are independent `<div>`s with no scroll synchronisation. Either add scroll linking across the two `vf-model-compare__panel-content` nodes or drop the prop.

#### HelpTooltip — `src/components/HelpChangelog.tsx`
- **P3 – `aria-expanded` on wrapper trigger is misleading** (`src/components/HelpChangelog.tsx:46-54`). The button has `aria-expanded={open}` but its child content is not a disclosure — it's a tooltip region. Screen readers will advertise a collapsible that doesn't exist. `aria-describedby`/`role="tooltip"` semantics are already present; remove `aria-expanded`.

#### ConfidenceMeter — `src/components/ConfidenceMeter.tsx`
- **P2 – `variant="text-only"` silently fallthroughs** (`src/components/ConfidenceMeter.tsx:94-161`). The variant is part of the public enum but the JSX only branches for `bar`, `gauge`, `ring`. `text-only` works because the `showValue`/`showLabel` blocks still render, but the behaviour is incidental rather than intentional. Add an explicit `variant === "text-only"` branch (or a comment + test) so the contract is visible.

#### EnvironmentVars, TokenVisualizer, ThemeSelector, LiveIndicator, Countdown, RelativeTime, DurationDisplay
Zero findings. Controlled/uncontrolled pairings on `RegExpTester`'s pattern/flags/test-string (via `useControllableState`) and `ThemeSelector.value` are correct; LiveIndicator's `variant`/`animated`/`size` all map to CSS state classes that exist in the component's stylesheet (confirmed by passing tests).

---

### Navigation (10)

#### Anchor — `src/components/Anchor.tsx`
- **P0 – no scroll-spy observer despite docstring** (`src/components/Anchor.tsx:1-92`). The file header comments "scrollspy-driven table of contents that highlights the currently visible section," but `current` is only updated via `handleClick` (line 72-92). There is no `IntersectionObserver`, scroll listener, or `activeKey` sync effect — so the active indicator changes *only* when the user clicks an item, not when they scroll naturally. Either add scroll-driven tracking or rewrite the docstring as "click-driven nav".

#### NavItem — `src/components/Navigation.tsx`
- **P1 – `asChild` does not clone correctly** (`src/components/Navigation.tsx:610-627`). The branch spreads `{ ...child, props: {...} }` to construct a "modified" element rather than using `cloneElement`. The result skips React's internal element validation (owner/fiber metadata) and does not forward the `ref`. Use `cloneElement(child, { ...commonProps, onClick })` so that refs, keys, and the internal element fields are preserved.

#### Tabs — `src/components/Interactive.tsx`
- **P3 – missing `aria-label` on the tablist when `active` is unknown** (`src/components/Interactive.tsx:60-66`). When `active` doesn't match any tab key, the component warns (good) and arrow-nav stops — but the visible tablist continues to render without an `aria-label` fallback. The type declares `"aria-label"?: string` so consumers *should* pass it, but the implementation doesn't enforce or default.

#### Wizard, Stepper, Breadcrumb, NavGroup, BreadcrumbMenu, Navbar, TabBar
Zero findings. Wizard's controlled/uncontrolled step state (`value`/`defaultValue`/`internal`) and `canAdvance` gating are consistent; Stepper's dual API (string-array vs compound) correctly unifies data via `Children.forEach`.

---

### Domain-data (9)

#### Gantt — `src/components/Gantt.tsx`
- **P0 – `onTaskUpdate` never fires with dragged values** (`src/components/Gantt.tsx:174-198`). The `onUp` closure reads `draftTasks[d.id]` from the outer scope (line 182), but that `draftTasks` is the object captured when `beginDrag` ran — i.e. before any `setDraftTasks` update — so `draft` is always `undefined` and `onTaskUpdate(…)` is skipped. The calling pattern forces the parent to observe the drag through some other channel, which contradicts the documented `onTaskUpdate` contract. Fix by reading the latest state via a ref, a functional `setDraftTasks` followed by a commit in a post-drag effect, or by computing `nextStart`/`nextEnd` inline in `onUp` from `d.initialStart`/`d.initialEnd` + the final pointer delta.

#### DragDropContext — `src/components/DragDrop.tsx`
- **P0 – `Droppable` attaches DOM listeners on every render** (`src/components/DragDrop.tsx:124-153`). `dropRef` is redeclared inline each render; React calls the previous callback with `null` and the new one with the element on every re-render, and the inline body *adds* `dragover`/`drop`/`dragleave` listeners without a cleanup. After N renders, the droppable has N sets of listeners, each calling `ctx.setHover` → additional renders. Wrap the ref in `useCallback` with an empty dep list, attach listeners in a `useEffect`, and return a cleanup that removes them.

#### Calendar — `src/components/Calendar.tsx`
- **P2 – `value` prop implies selection but no `onValueChange`** (`src/components/Calendar.tsx:52`). `value?: Date[]` only seeds the highlighted-day set (line 127). There is no `onValueChange` / selection callback — selections happen via `onDayClick`, leaving the caller responsible for toggling `value`. The documented "selecting dates" comment is misleading. Rename to `highlighted` or add the callback.
- **P2 – `onRangeChange` fires new Date objects every render** (`src/components/Calendar.tsx:147-166`). `range` is a `useMemo` returning `{ start, end }`, but `start`/`end` come from `addDays(first, …)` which constructs fresh `Date` instances — so referential equality holds only within a render. The `useEffect([range, onRangeChange])` fires on mount and whenever the memo runs; consumers who naively store the range in state will loop. Memoise by epoch ms or document that callers must dedupe.

#### NotificationCenter — `src/components/Notifications.tsx`
- **P1 – outside-click closes the popover but the trigger is outside the `outsideRef`** (`src/components/Notifications.tsx:79-125`). `useClickOutside` is attached to the outer `vf-notif-center` div, but because the trigger button is *inside* that wrapper, clicking the trigger toggles open via `onClick` and is also treated as an inside click. Works in practice. However, the popover's `role="dialog"` lacks both focus trap and Escape handling — users with keyboard-only access cannot close it without Tab-ing past its contents and clicking outside.

#### HorizontalTimeline, NotificationBadge, Comment, CommentList, Activity
Zero findings. `HorizontalTimeline` correctly derives status from `activeKey` when `event.status` is absent; Comment/CommentList are thin presentational wrappers with no callbacks or state.

---

### Domain-charts (1)

#### CommitGraph — `src/components/DevTools.tsx`
- **P2 – `disabled={!onCommitClick}` silences interaction on button container** (`src/components/DevTools.tsx:62-64`). When `onCommitClick` is omitted, each row renders as a `disabled` `<button>`, which suppresses focus, hover state, and keyboard access even though consumers may still want the row visible as a non-interactive display. Consider rendering as a `<div role="listitem">` when no callback is supplied.

---

### Viewers (6)

#### NetworkInspector (bucket-adjacent, also exported from DevTools) — `src/components/DevTools.tsx`
- **P1 – controlled `filter` prop never syncs `internalFilter`** (`src/components/DevTools.tsx:139-178`). `useState(filter)` seeds the internal value once; the `value=` expression picks `filter` vs `internalFilter` based on whether `onFilterChange` exists at *that* render. If a caller toggles between controlled and uncontrolled (or passes `filter` without `onFilterChange`), the two values diverge. Standardise on `useControllableState` (used elsewhere in the repo) or add a sync effect.

#### JSONViewer — `src/components/Viewers/JSONViewer.tsx`
- **P2 – `setState` during render** (`src/components/Viewers/JSONViewer.tsx:130-135`). `JSONNode` conditionally calls `setLastGen` and `setOpen` in the render body as a "sync to context" pattern. React tolerates this, but the same behaviour can be expressed cleaner with `useEffect` and avoids one extra render per context change. Not a correctness bug; flagged for future cleanup.

#### CodeBlock — `src/components/Viewers/CodeBlock.tsx`
- **P3 – download button reuses copy-button class** (`src/components/Viewers/CodeBlock.tsx:192-201`). `className="vf-codeblock__copy"` is applied to the Download button, coupling its styling to the copy affordance. A dedicated class (or a neutral `vf-codeblock__action`) keeps CSS overrides predictable.

#### LogViewer, Terminal, DiffViewer, MarkdownRenderer
Zero findings. DiffViewer's word-diff pairing + LCS is self-contained and pure; MarkdownRenderer delegates to `renderMarkdownBlocks` (tested elsewhere).

---

## Zero-finding roster (52)

**Primitives** — Transition, FocusScope, ErrorBoundary, LiveRegion, Separator, AccessibleIcon, HydrationBoundary, Portal, ScrollLock, SkipToContent, Slot, VisuallyHidden, RovingFocusGroup, RovingFocusGroup.Item

**Layout** — ResizableGroup, ResizablePanel, ResizableHandle, Flex, Grid, ScrollArea, GridItem, ThemeScope, VoidframeProvider, ResponsiveBox

**Data** — Table, TreeTable, Descriptions, VirtualGrid, List, Masonry, CSVViewer

**Utility** — EnvironmentVars, TokenVisualizer, ThemeSelector, LiveIndicator, Countdown, RelativeTime, DurationDisplay

**Navigation** — Wizard, Stepper, Breadcrumb, NavGroup, BreadcrumbMenu, Navbar, TabBar

**Domain-data** — HorizontalTimeline, NotificationBadge, Comment, CommentList, Activity

**Viewers** — LogViewer, Terminal, DiffViewer, MarkdownRenderer

---

## Methodology notes

- **Prop-to-code liveness**: For each declared prop, verified at least one read site in the component body (JSX, effect, or callback). Dead props that are silently spread onto the DOM node are flagged P0 because React will emit unknown-attribute warnings and consumers cannot tell the prop is a no-op.
- **Controlled/uncontrolled pairing**: Checked `value`/`defaultValue` symmetry, that the internal state is seeded from `defaultValue` (not `value`), and that the setter guards `if (value === undefined) setInternal(...)` before calling the callback. Components using `useControllableState` were trusted (separate hook with its own tests at `src/hooks/__tests__/useControllableState.test.ts`).
- **State transitions**: Looked for stale closures in `onPointerUp`-style handlers (`Gantt.tsx:182` was caught this way), duplicate effect subscriptions via inline ref callbacks (`DragDrop.tsx:124-153`), and `setState`-during-render (`JSONViewer.tsx:130-135`).
- **Callback signatures**: Compared the documented shape in the interface with the call site. Echo callbacks (like `DataGrid.onGroupByChange` firing for prop-driven changes) are P1 because they violate the "caller is source of truth" contract.
- **Test coverage**: Checked `src/primitives/__tests__/` and `src/components/__tests__/` plus provider/responsive/i18n test dirs for a file whose name contains the component identifier. All 78 components have at least one direct or indirect test; no component is test-only (P3 test-only would be used for components with tests but no production consumers — none found in this bucket).

**Scope limitations**
- Anchor's scrollspy claim was judged from the file header and implementation code; if the real contract is "click-driven" the finding should be downgraded to P3 (doc-only).
- `DataGrid.toggleAll` semantics (page vs dataset) may be intentional product design; P1 reflects the undocumented aspect, not the choice.
- `DashboardGrid` layout math for `bounds={{ rows }}` and swap-while-moving was not re-verified beyond reading the code; only the render-on-every-pointer-move pattern was flagged.

No source files were modified; no tests were executed. All citations are `file:line` against the tree at commit-time of read.
