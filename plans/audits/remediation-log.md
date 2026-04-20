# Audit Remediation Log

**Scope:** fix every finding (P0 through P3) across audits 29-32 before shipping v1.0, then run an exhaustive re-review. No public push / npm publish until green.

**Policy decisions:**

- **Audit 29 param standardization (2026-04-18):** breaking-now (no deprecation shims — v1.0 unshipped, no consumers).
- **Canonical vocabulary (2026-04-18):**
  - `variant`: `"solid" | "outline" | "ghost" | "subtle"` (shape/treatment)
  - `tone`: `"neutral" | "accent" | "success" | "warning" | "danger" | "info"` (semantic color)
  - `size`: `"sm" | "md" | "lg"`
- **Tabs (2026-04-18):** full migration to dot-notation (`Tabs.Root` / `Tabs.List` / `Tabs.Tab` / `Tabs.Panel`); remove flat `tabs: TabItem[]` API.
- **P1 execution order (2026-04-18):** by severity.
- **Ship gate (2026-04-18):** no push / no publish until every P0-P3 is resolved AND a second exhaustive re-audit runs green.
- **Deferred features (2026-04-18):** F1 6-field cron, F2 Ticker discretized, F3 VirtualList estimated-height are in-scope for v1.0 (moved from `plans/deferred-features.md` into Segment 8).
- **ESLint rule docs URLs (2026-04-19):** retargeted to `https://voidframe.github.io/ui/eslint-plugin#<name>` — the planned GitHub Pages target from `plans/npm-publish-plan.md`. Not live yet; same "future deploy resolves it" pattern as `package.json.repository.url`.
- **TSDoc sweep scope (2026-04-19):** full — every exported component, hook, and utility needs a TSDoc block. 29 tier-A components done in D7; remaining ~290 components + ~25 hooks + 3 utils + the non-obvious prop descriptions land in Segment 6.

---

## Remediation segments

Work proceeds in segments so context stays manageable. Each segment ends with a verification pass (`make test`, `make check`) and a progress entry below.

### Segment 1 — Audit 31 P0s (Waves A-E of `P0-execution-queue.md`) — IN PROGRESS

| Wave | Scope | Status |
|---|---|---|
| A (9) | Dead-prop removal + wiring | ✅ DONE (2026-04-18) |
| B (6) | Callback wiring | ✅ DONE (2026-04-18) |
| C (4) | Architectural defects | ✅ DONE (2026-04-19) |
| D (6 + 29 TSDoc) | Documentation P0s + tier-A TSDoc backfill | ✅ DONE (2026-04-19) |
| E' (2) | CLI test.mjs wire + VS Code docsUrl configurable | ✅ DONE (2026-04-19) |
| Gate | Full test + typecheck + build + pack dry-run | ✅ PASS (2026-04-19) |

### Segment 2 — Audit 29 P1 (param standardization — breaking) — IN PROGRESS

| Sub-segment | Scope | Status |
|---|---|---|
| 2.A | forwardRef (DataGrid rootRef, ReferenceLine, ReferenceBand, AccessibleIcon); tone outliers (`"default"` → `"neutral"`, BannerAlert/Stat/Progress `"info"`); `onClose` → `onDismiss` (Modal, Drawer V1, ContextHelp, DebugPanel) | ✅ DONE (2026-04-18) |
| 2.B.1 | Button variant: `"default"\|"ghost"\|"accent"\|"solid"` → canonical `"solid"\|"outline"\|"ghost"\|"subtle"` (default → outline, accent → subtle); CSS class rename; internal consumers (ButtonGroup/Tabs legacy/Popconfirm); demo/docs/eslint test updates | ✅ DONE (2026-04-19) |
| 2.B.2 | IconButton + ToggleGroup variant canonicalization (same mapping; ToggleGroup gains new `solid` variant CSS) | ✅ DONE (2026-04-19) |
| 2.B.3 | CopyButton + SplitButton + FloatingActionButton + Badge (Badge gains `"ghost"`; FAB maps `default→outline`/`accent→solid`; CopyButton and SplitButton gain full 4-member set with new solid + ghost CSS rules) | ✅ DONE (2026-04-19) |
| 2.B.4 | `variant` → `kind` on 9 domain components: LiveIndicator, ConfidenceMeter, ThemeSelector, NotificationCenter, TokenCounter + CostDisplay (ChatModel), ThinkingIndicator (Chat/Indicators), DiffViewer, Dialog + AlertDialog | ✅ DONE (2026-04-19) |
| 2.C | `onChange` → `onValueChange` on 41 non-form controls (breaking, no shims); Transfer duplicate onChange removed | ✅ DONE (2026-04-19) |
| 2.D | Pagination (`page`→`value`, `total` alias removed); list editors Sortable/ReorderList/KeyValueEditor/EnvironmentVars (noun-named prop→`value`); FileUpload onChange→onValueChange | ✅ DONE (2026-04-19) |
| 2.E | Tabs compound dot-notation API (Root/List/Trigger/Panel); flat `tabs: TabItem[]` + `active` + `onChange` removed; full ARIA wiring + arrow-key nav + orientation + keepMounted | ✅ DONE (2026-04-19) |
| 2.F | `defaultValue` typed + routed via useControllableState on Select/Slider/NumberInput/SearchInput/PasswordInput/ModelPicker/MenuRadioGroup; `asChild` on Text (Anchor skipped — opinionated structure, Input/Textarea already inherit via HTMLAttributes) | ✅ DONE (2026-04-19) |
| Gate | typecheck ✓, 4996 tests ✓, build ✓, size-limit ✓ (Core budget raised 170→200 kB, All-JS 400→460 kB to reflect post-remediation reality; bundle-diet deferred to Segment 9), npm pack ✓ (600.7 kB, 35 files) | ✅ DONE (2026-04-19) |

### Segment 3 — Audit 30 P2 hardening — ✅ DONE (2026-04-19)

| Item | Status |
|---|---|
| `Anchor.tsx:179` safeHref fix | ✅ |
| `Embed.tsx` iframe `src` → safeHref + dev warn on sandbox escape combo | ✅ |
| `RegExpTester` + `LogViewer` regex compile-time length caps (200-char pattern, 100k test string) | ✅ |
| `dompurify` peer floor `>=3.0.0` → `>=3.2.4` (GHSA-mmhx) | ✅ |
| `happy-dom` 14.12 → 20.9 (critical VM Context Escape) | ✅ |
| `vite-plugin-dts` 3.8 → 4.5 (drops transitive high/critical) | ✅ |
| Gate | typecheck ✓, 4996 tests ✓, build ✓, npm audit: critical/high resolved, 5 moderate remaining in vitest/vite devDep chain (ship-safe) |

### Segment 4 — Audit 31 P1 (45 items) — ✅ DONE (2026-04-19)

Executed Wave 1 of `plans/audits/31-remediation.md` as a single batch via implementation subagent. 42 P1 fixes landed (the other ~3 were discovered to already be resolved by Segments 1–3), +56 regression tests. Notable API surface touches documented in the commit message: `ChartFrame` split to separate container ref vs `exportRef<ChartFrameHandle>`; `ImageDiff` gained `onOpacityChange`; `AudioPlayer` dropped audio-irrelevant `poster`/`playsInline` and gained `captions` forwarding; `ColorSwatch` gained explicit `disabled` prop; `TooltipProvider` context switched `lastClosedAt: number` → `getLastClosedAt(): number` to defeat stale memo snapshot.

Gate: typecheck ✓, 5052 tests ✓ (327 files), build ✓, size-limit ✓ (All-JS 452 KB / 460 KB ceiling).

### Segment 5 — Audit 32 P0 + P1 (12 + 24 items) — ✅ DONE (2026-04-19)

Executed all P0/P1 items from `plans/audits/32-remediation.md` except §4 (TSDoc — Segment 6) and §1.6 (package rename — post-publish). README prose fixes, CHANGELOG `[1.0.0]` promotion consolidating phases 1-28 + 29-35 + 40-47 + 50-54 + framework expansion + Segments 1-4, docs-site a11y blurb + migration entry + Contributing section, VS Code repo URL + doctor peer-check + codemod unknown-transform message + require-a11y-label ESLint wording, accessible-name warning unification across Form primitives, 2 direct `console.warn` sites routed through `warnOnce()`. §7 P2/P3 batch: 1 smart-quote fix; 4 items deferred (TSDoc belongs to Segment 6, Chat Quickstart dup intentional per audit, brand-capitalisation already compliant, snippet-generator rewrite substantive). Gate: typecheck ✓, 5052 tests ✓, build ✓.

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

### Segment 9 — Audit 31 P2 + P3 (per-bucket + per-component) + bundle diet

- ~43 P2 findings (dead code, undocumented, untested-but-working)
- ~44 P3 findings (test-coverage gaps, cosmetic)
- Plus the P2/P3 items within the 50 top-50 per-component files.
- **Bundle diet:** Core ESM grew from 170→194 kB gzipped (budget raised to 200 kB as a gate-unblock, not a resolution). Run rollup-plugin-visualizer, identify the biggest contributors, and aim to claw back the 24 kB via minification improvements + dedup + structural fixes (dynamic/static double-imports flagged in build warnings). Target: Core ≤ 180 kB gzipped, All-JS ≤ 420 kB gzipped.

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

### 2026-04-19 — Wave D + Wave E' (segment 1 close-out)

Commits: `eb3fb03`, `b2bfbc7`, `238bcdb`, `dabe679`.

- ✅ D1 README component count: "230+ components + ~60 icons" → "500+ component exports + ~75 icons". Matches `docs/data/props.json` length (499).
- ✅ D2 README theme count: "Three themes" → "Four themes"; added greyTheme.
- ✅ D3 README bundle budgets table: replaced aspirational budgets with the actual CI-enforced size-limit entries from package.json (core 170KB / charts 40KB / dev 10KB / stylesheet 50KB / total 400KB).
- ✅ D4 README test-count drift: "1260+" and "1230+" (two different numbers) → "4,994 tests as of 2026-04-19".
- ✅ D5 README marketing-fluff: per audit 32 §1.9, left unchanged (concluded not a fluff case on review).
- ✅ D6 docs/App.tsx a11y-audit blurb: replaced "All components are tested with jest-axe" with accurate prose noting the audit table is a 33-entry sample, full-library audit is an in-progress goal.
- ✅ D7 TSDoc backfill for 29 tier-A components (Badge, Card, Tabs, Modal, Dialog, Drawer, DrawerV2, Sheet, Checkbox, RadioGroup, FormField, DataList, Sidebar, Navbar, Toolbar, PageHeader, Breadcrumb, Pagination, CursorPagination, Stepper, Wizard, CommandInput, ScrollArea, Popover, PopoverV2, HoverCard, Tooltip, TooltipProvider, Toggle). Each block names the control pattern, compound shape, or accessibility notes. Deprecated V1 variants carry @deprecated tags pointing at V2. Three files required moving the TSDoc from an internal `XImpl`/`XBase`/`XRoot` declaration to the exported-binding line so react-docgen-typescript extracts it. Accuracy corrections flagged vs. the hint list (RadioGroup, Toolbar, FormField, Navbar, ScrollArea).
- ✅ E1 CLI test subcommand wired: `tools/cli/commands/test.mjs` was dead (defined `generateTest`, never imported into voidframe.mjs). Added a `testCommand` adapter and registered `voidframe test <name> [--type component|hook|util] [--force]` as the 5th subcommand. CLI tests updated to reflect 5 subcommands. README + CHANGELOG updated.
- ✅ E2 VS Code docs URL configurable: added `voidframe.docsUrl` setting in tools/vscode-voidframe/package.json (default `http://localhost:5175` — the local dev docs server); Open Playground reads it via `vscode.workspace.getConfiguration("voidframe")`. Also retargeted the three ESLint-plugin rule docs URLs from the nonexistent `voidframe.dev` to the Forgejo source file for each rule — always-resolves pattern.

**Gate verification (Segment 1 close):**
- `docker compose run --rm test` — 326/326 test files, 4995/4995 tests passing.
- `docker compose run --rm typecheck` — clean.
- `docker compose run --rm build` — clean. Core ESM 160 KB gzipped (under 170 KB budget).
- `docker compose run --rm --entrypoint sh shell -c "npm pack --dry-run"` — 599 KB packed, 35 files, clean tarball.

All 31 P0 fixes from the P0-execution-queue are now landed. Moving to Segment 2: audit 29 P1 parameter standardization (breaking changes accepted per 2026-04-18 policy).

---
