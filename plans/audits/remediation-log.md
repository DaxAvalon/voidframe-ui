# Audit Remediation Log

**Scope:** fix every finding (P0 through P3) across audits 29-32 before shipping v1.0, then run an exhaustive re-review. No public push / npm publish until green.

**Policy decisions (2026-04-18):**

- Audit 29 param standardization: **breaking-now** (no deprecation shims — v1.0 unshipped, no consumers).
- Canonical vocabulary:
  - `variant`: `"solid" | "outline" | "ghost" | "subtle"` (shape/treatment)
  - `tone`: `"neutral" | "accent" | "success" | "warning" | "danger" | "info"` (semantic color)
  - `size`: `"sm" | "md" | "lg"`
- Tabs: **full migration to dot-notation** (`Tabs.Root` / `Tabs.List` / `Tabs.Tab` / `Tabs.Panel`); remove flat `tabs: TabItem[]` API.
- P1 execution: by severity.
- No push / no publish until every P0-P3 is resolved AND a second exhaustive review runs green.
- Deferred features (F1 6-field cron, F2 Ticker discretized, F3 VirtualList estimated-height) are now in-scope for v1.0 instead of post-ship.

---

## Remediation segments

Work proceeds in segments so context stays manageable. Each segment ends with a verification pass (`make test`, `make check`) and a progress entry below.

### Segment 1 — Audit 31 P0s (Waves A-E of `P0-execution-queue.md`) — IN PROGRESS

| Wave | Scope | Status |
|---|---|---|
| A (9) | Dead-prop removal + wiring | ✅ DONE (2026-04-18) |
| B (6) | Callback wiring | ✅ DONE (2026-04-18) |
| C (4) | Architectural defects | ✅ DONE (2026-04-19) |
| D (6 + 39 TSDoc) | Documentation P0s + tier-A TSDoc backfill | pending |
| E' (2) | CLI test.mjs wire + VS Code docsUrl configurable | pending |
| Gate | Full test + typecheck + build + pack dry-run | pending |

### Segment 2 — Audit 29 P1 (param standardization — breaking)

- Apply canonical `variant` / `tone` / `size` vocabulary across Button, Badge, Alert, Progress, Tag, Chip, and all other visual-axis components.
- Migrate Tabs to dot-notation; remove flat API.
- Rename `onChange(value)` → `onValueChange(value)` on ~25-45 non-form controls (breaking).
- Unify controlled/uncontrolled patterns via `useControllableState`.
- Add `forwardRef` to DataGrid, ReferenceLine, ReferenceBand, AccessibleIcon.
- **Gate:** every P0/P1 from audit 29 resolved; test suite + typecheck green.

### Segment 3 — Audit 30 P2 hardening

- `Anchor.tsx:124` skip-safeHref fix.
- `Embed.tsx` iframe `src` → safeHref; warn on `allow-scripts + allow-same-origin` sandbox combo.
- `RegExpTester` + `LogViewer` regex compile-time length caps (ReDoS self-DoS guard).
- Raise `dompurify` peer floor to `>=3.2.4` (GHSA-mmhx fixed).
- Upgrade `happy-dom` and `vite-plugin-dts` to drop critical/high devDep advisories.

### Segment 4 — Audit 31 P1 (45 items)

By severity across buckets. Bucket-by-bucket order to preserve context:
- charts (8) → forms (3) → overlays (7) → chat+media (6) → smalls (9) → core (3) → misc-a (8) → misc-b (1).

### Segment 5 — Audit 32 P0 + P1 (12 + 24 items)

- README: fix component count, theme count, bundle budgets, test-count drift (use audit 32's ready-to-paste prose in `32-remediation.md`).
- Docs site: a11y-audit page blurb, Migration guide placeholder.
- Runtime-message rewrites (cryptic → what + where + how).
- CLI help / error messages.
- ESLint rule messages + docs URLs.
- VS Code snippets + hover docs.

### Segment 6 — TSDoc sweep (~439 components + 11 hooks + 3 utils)

Tiered:
- Tier A (39 components — already itemised in D7): top-50 prop-count + most-imported.
- Tier B (rest of components via bucketing from audit 31).
- Hooks (11 with no TSDoc; prioritize `useForm`).
- Utils (3 missing).

### Segment 7 — Hook test coverage (23/59 → 59/59)

- Minimum: one behavior test per hook via `renderHook`.
- Focus hooks: `useControllableState`, `useForm`, `useFieldArray`, `useEventSource`, `useWebSocket`, `useFetch`, `useLocalStorage`, `useSessionStorage`, `useClipboardRead`, `useGeolocation`, `usePermission`.

### Segment 8 — Deferred features (F1/F2/F3 from `deferred-features.md`)

Now in-scope for v1.0.
- F1: 6-field cron support in CronBuilder (seconds precision).
- F2: Discretized Ticker animation via `steps`.
- F3: VirtualList `estimatedItemHeight` for function-height items.

Each becomes its own sub-plan with its own test suite.

### Segment 9 — Audit 31 P2 + P3 (per-bucket + per-component)

- ~43 P2 findings (dead code, undocumented, untested-but-working)
- ~44 P3 findings (test-coverage gaps, cosmetic)
- Plus the P2/P3 items within the 50 top-50 per-component files.

### Segment 10 — Audit 32 P2 + P3 (16 + 7 items)

Marketing-fluff, capitalization/brand consistency, typos, stale cross-references, smart-quote normalization.

### Segment 11 — Audit 29 P2 + P3

Stylistic/naming inconsistencies that don't produce runtime bugs. Applied in alongside segment 2 where possible; otherwise mopped up here.

### Segment 12 — Exhaustive re-audit

Re-run all 4 audits against the fixed codebase. Goal: zero findings across P0-P3. If new findings surface, loop back into the relevant segment.

### Segment 13 — Publish prep (AFTER green re-audit; NO PUSH WITHOUT EXPLICIT APPROVAL)

- Rename package `voidframe` → `@voidframe/ui`; add `publishConfig.access: public`.
- Create `docs/vite.config.ts`; GitHub Pages deploy wiring (deferred to repo-creation time).
- Promote `CHANGELOG.md` `[Unreleased]` → `[1.0.0] - <date>` using audit 32's prose.
- Rewrite README install + subpath list.
- Dry-run `npm pack`, fresh-project install test against local tarball.
- **STOP HERE. Wait for explicit approval to `npm publish` / push mirror.**

---

## Progress record

### 2026-04-18 — Wave A (segment 1)

Commits: `aea763b`, `c49fdd5`, `d83e094`, `910df2f`, `9acd5bd`, `db2962b`, `7745fc9`, `a359609`, `4fea237`, `87097e2`.

- ✅ A1 CronBuilder.fields: prop removed; isValidCron tightened to exactly-5 parts. Feature F1 captured for later.
- ✅ A2 ConversationHeader.onModelChange: wired via title-edit-pattern clone; model-edit affordance renders when `model` is a string AND `onModelChange` provided. 2 tests.
- ✅ A3 Conversation.{onRetry,onStop,onRegenerate}: exposed via ConversationContext; MessageActions.Retry/Stop/Regenerate invoke the context callbacks by default; explicit onClick wins (no double-fire). 4 tests.
- ✅ A4 CoachMark.once: prop removed (semantically redundant with mount-scoped `dismissed` state). 1 regression test locking default behavior.
- ✅ A5 Ticker.steps: prop removed. Feature F2 captured.
- ✅ A6 VStack.wrap: destructured, applied `vf-flex--wrap` class to mirror HStack. 1 regression test.
- ✅ A7 VirtualList.estimatedItemHeight: prop removed. Feature F3 captured.
- ✅ A8 ModelCompare.syncScroll: panel refs + scroll handler mirror `scrollTop` across both panel-content divs; `syncingRef` guard prevents ping-pong. 2 regression tests.
- ✅ A9 RegExpTester.showReplace: uncontrolled state + useMemo-derived replace result + respects `readOnly`. 2 regression tests.

**Verification:** 326/326 test files, 4977/4977 tests passing, typecheck clean.

Audit rows closed: P0-execution-queue Wave A (A1-A9).

### 2026-04-18 — Wave B (segment 1)

Commits: `79a40cc`, `73b1e1f`, `9171cc0`, `3e0134f`, `e414314`, `5a026c3`.

- ✅ B1 MentionInput slash-command live args: widened `onMention` to pass a `MentionInputContext` second arg carrying live `{text, triggerIndex, caret}`; SlashCommandInput forwards it into each command's `action` callback. Two tests.
- ✅ B2 FilterBuilder "between" two-value shape: `renderValueInput` now branches on `operator === "between"` and renders two bounded inputs with aria-labels "Filter value lower bound" / "upper bound", emitting `[lo, hi]` via `onValueChange`. Operator-change handler resets `rule.value` shape (scalar ↔ tuple) to prevent stale-shape consumer confusion. Three tests.
- ✅ B3 Gantt.onTaskUpdate stale closure: `onUp` now computes `finalStart`/`finalEnd` directly from `d.initialStart`, `d.initialEnd`, and the pointerup `ev.clientX` delta. No more closure over the empty `draftTasks` snapshot. One pointer-drag regression test with happy-dom pointer-capture stubs.
- ✅ B4 DragDrop.Droppable listener leak: stabilized `dropRef` via `useCallback`, moved `addEventListener` into `useEffect` with matching `removeEventListener` cleanup; `ctxRef` lets handlers read the latest context without re-attaching. Add/remove pair-counting regression test.
- ✅ B5 QueryBuilder nested-group callbacks: Group now takes id-keyed callbacks (`onAddRule(groupId)`, `onAddGroup(groupId)`, `onCombinatorChange(groupId, next)`) and forwards them to nested Groups unchanged. Root QueryBuilder's existing `addRule(id)`, `addGroup(id)`, `updateCombinator(id, next)` helpers (which traverse via `replaceIn`) are now the callbacks — nested "+ Rule" / "+ Group" buttons and combinator selects finally patch the tree correctly. Removed the `@ts-expect-error` hack. Three regression tests.
- ✅ B6 Anchor IntersectionObserver scrollspy: new `useEffect` observes every `#id` target (walking nested items), picks the highest-ratio intersecting section as active via `setCurrent`. SSR-guarded, `rootMargin` honors `offset`, disconnects on unmount. Click-driven `setCurrent` path preserved. One regression test with an IntersectionObserver stub.

**Verification:** 326/326 test files, 4987/4987 tests passing (+10 over Wave A), typecheck clean.

Audit rows closed: P0-execution-queue Wave B (B1-B6).

### 2026-04-19 — Wave C (segment 1)

Commits: `2a9de17`, `d6771f3`, `250eb6a`, `ed755b2`.

- ✅ C1 ChartFrame scale propagation — the root defect that was silently killing `showGrid`, `ReferenceLine`, and `ReferenceBand` across 10 top-level charts. Added `ChartScales` — a small provider that re-publishes ChartContext with merged `xScale` / `yScale`. Each inner chart (AreaChart, BarChart, LineChart, ScatterPlot, CandlestickChart, ComposedChart, Histogram, WaterfallChart, BoxPlot, ViolinPlot) now wraps its rendered SVG tree in `<ChartScales xScale={...} yScale={...}>` so sibling primitives that read scales from context actually see the computed values. Two regression tests (AreaChart + BarChart) assert `showGrid={true}` produces actual `.vf-chart-gridlines__line` elements.
- ✅ C2 DonutChart innerRatio spread-order regression — flipped the JSX `<PieChart innerRatio={props.innerRatio ?? 0.6} {...props} />` to `<PieChart {...props} innerRatio={props.innerRatio ?? 0.6} />` so `{...props}` no longer clobbers the default when a forwarding caller passes `innerRatio={undefined}`. Regression test for the forwarding-pattern case.
- ✅ C3 Popconfirm placement under Portal — overlay was portaled to `document.body` but positioned via CSS `top: 100%; left: 0` percentages that resolve against body, not the trigger. Now wraps the trigger in a ref'd div, captures its bounding rect in a useLayoutEffect, and calls `computeAnchoredPosition` (the same helper PopoverV2 / Tooltip / HoverCard / chart tooltips use) to compute absolute pixel top/left applied inline with `position: fixed`. Re-runs on scroll/resize; initial off-screen position prevents flash. Regression test asserts concrete px top/left after stubbing the trigger rect.
- ✅ C4 Carousel compound drops slidesPerView/gap — previously only the shorthand `slides={[]}` fallback got the style. Added `slidesPerView` and `gap` to `CarouselContextValue`; `CarouselViewport` now reads them and computes its own `gap` + `gridAutoColumns` style so dot-notation `<Carousel.Viewport>` honors the parent's values. Caller-provided `style` still merges last. Two regression tests.

**Verification:** 326/326 test files, 4994/4994 tests passing (+7 over Wave B), typecheck clean.

Audit rows closed: P0-execution-queue Wave C (C1-C4). 25 P0 fixes landed across Waves A-C; 6 P0 docs items + 2 Wave E' executions remain in segment 1.

---
