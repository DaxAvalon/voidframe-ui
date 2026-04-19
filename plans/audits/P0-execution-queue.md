# P0 Execution Queue — All Audits

Source: `plans/audits/{29,30,31,32}-remediation.md`.
Generated: 2026-04-18.

## Summary

Total P0 fixes: 31
- Audit 29: 0 (the doc bundles "P0/P1" findings into Wave 1 without isolating severities; nothing in 29-remediation is unambiguously-P0. See "Unclassified" note below.)
- Audit 30: 0 (expected)
- Audit 31: 19
- Audit 32: 12

User-decision items (Wave E): 3

## Waves (risk + scope grouping)

Each wave = one coherent batch that should land in one commit. Waves are ordered by risk (lowest first).

### Wave A: Dead-prop removal (single-word fixes)

Removing `void x;` statements and `_x` alias destructuring. Each is a 1-5 line fix. Zero breaking API changes — these props were never wired, so "fixing" means actually consuming them.

| # | Component | File:line | Fix | Test to add |
|---|---|---|---|---|
| A1 | CronBuilder | src/components/CronBuilder.tsx:177 | Destructure `fields` (not `_fields`); drive render from `fields.length`; default to `DEFAULT_FIELDS` (5-field preset); `buildField` branches 5 vs 6 | CronBuilder.test.tsx: "renders exactly the `fields` provided" + "renders DEFAULT_FIELDS when `fields` omitted" |
| A2 | ConversationHeader | src/components/ChatSession.tsx:300, 315 | Destructure as `onModelChange` (not `_onModelChange`); add model-edit affordance mirroring the title-edit flow (:345-375), or remove prop from type | ChatSession.test.tsx: "onModelChange fires when the model control commits a new value" |
| A3 | Conversation | src/components/Chat/Conversation.tsx:78-80, 94-96 | Expose `onRetry`/`onStop`/`onRegenerate` via `ConversationContext` so MessageActions/SubmitButton descendants can invoke them | Conversation.test.tsx: "onRetry fires when a MessageActions retry button is clicked" + analogous for stop/regenerate |
| A4 | CoachMark | src/components/Spotlight.tsx:234-235, 318 | Replace `void once;` with a mount-lifetime dismissed ref; gate `open` on `!dismissedRef.current && (once || storageKey dismissed)` — OR remove `once` from props | Spotlight.test.tsx: "CoachMark with once=true hides after first dismissal for the remainder of the mount" |
| A5 | Ticker | src/components/Animations.tsx:208, 244 | Replace `void steps;` — use `steps` to discretize animation into N frames via `setInterval(tick, durationMs / steps)`, or remove prop | Animations.test.tsx: "Ticker emits exactly `steps` intermediate values across duration" |
| A6 | VStack | src/components/Layout.tsx:97-112 | Destructure `wrap` (currently falls through to `<div>` causing unknown-attr warning); apply `vf-flex--wrap` class mirroring HStack:75 | Layout.test.tsx: "VStack wrap=true applies vf-flex--wrap class and emits no unknown-attribute warning" |
| A7 | VirtualList | src/components/Virtualization.tsx:163-166 | Replace `void estimatedItemHeight;` — wire to drive viewport estimation when `itemHeight` is a function, or remove prop from type | Virtualization.test.tsx: "VirtualList uses estimatedItemHeight for initial viewport sizing when itemHeight is a function" |
| A8 | ModelCompare | src/components/ModelCompare.tsx:45 | `syncScroll` is destructured but never referenced — attach `onScroll` handlers on both panel-content divs; mirror `scrollTop` across refs when `syncScroll=true` | ModelCompare.test.tsx: "syncScroll=true mirrors scrollTop between the two panels" |
| A9 | RegExpTester (showReplace) | src/components/RegExpTester.tsx:208-219 | Wire controlled `replacement` state; bind input `value`+`onChange`; render `testString.replace(re, replacement)` into result div | RegExpTester.test.tsx: "showReplace renders the result of testString.replace(re, replacement)" |

### Wave B: Callback wiring (stale closures, broken refs)

Fixes for callbacks declared but invoked incorrectly (stale refs, hardcoded args, never invoked). Each needs a regression test proving the callback fires with the correct arguments.

| # | Component | File:line | Fix | Test |
|---|---|---|---|---|
| B1 | MentionInput | src/components/MentionInput.tsx:334 (decl :304) | Pass live `{ text, triggerIndex, caret }` from the slash-command parse state (textarea value slice from trigger→caret; position of the active trigger; selectionStart) instead of `{text:"",triggerIndex:0,caret:0}` constants | MentionInput.test.tsx: "SlashCommandOption.action receives live text/triggerIndex/caret matching the textarea state" |
| B2 | FilterBuilder (between shape) | src/components/FilterBuilder.tsx:49-50, 180-196 | Branch on `op === "between"` in `renderValueInput` to render two inputs; emit `{ op: "between", value: [lo, hi] }` via `onValueChange` | FilterBuilder.test.tsx: "between emits [lo, hi] tuple via onValueChange" |
| B3 | Gantt (onTaskUpdate stale closure) | src/components/Gantt.tsx:174-198 (esp. :182) | `onUp` captures stale `draftTasks` at `beginDrag`. Fix via latest-state ref, functional `setDraftTasks` + post-drag commit effect, or compute `nextStart`/`nextEnd` inline in `onUp` from `d.initialStart` + final pointer delta | Gantt.test.tsx: "onTaskUpdate fires with the updated start/end after a pointer drag" |
| B4 | DragDrop.Droppable (listener leak) | src/components/DragDrop.tsx:124-153 | Wrap `dropRef` in `useCallback([])`; move listener attach/detach into `useEffect` with cleanup that `removeEventListener`s (currently N renders = N listener sets) | DragDrop.test.tsx: "Droppable never registers duplicate dragover/drop listeners after re-renders" (listener-count spy) |
| B5 | QueryBuilder nested-group callbacks | src/components/DevTools.tsx:880-886, 871-877 | Thread `replaceIn` down so nested groups emit full add-rule / add-group / combinator-change patches; widen `onRuleChange`'s accepted type to cover group combinators (remove `@ts-expect-error`) | QueryBuilder.test.tsx: "nested Add Rule / Add Group / combinator change emit the patched tree to the root onChange" |
| B6 | Anchor (scrollspy) | src/components/Anchor.tsx:1-92 | Header comment claims scrollspy; `current` only updates via `handleClick`. Add `IntersectionObserver` over target sections; set `current` to first intersecting id. Preserve click-driven path | Anchor.test.tsx: "active item updates when the observed section intersects the viewport" |

### Wave C: Architectural (cross-component root defects)

Fixes that affect multiple components. Higher risk; need broader regression coverage.

| # | Area | Files | Fix | Tests |
|---|---|---|---|---|
| C1 | ChartFrame scale propagation | src/charts/primitives/ChartFrame.tsx:161-162 + src/charts/primitives/Gridlines.tsx:27-42 + all top-level charts: AreaChart.tsx:125-132, BarChart.tsx:133-140, LineChart.tsx:129-136, ScatterPlot.tsx:107-114, CandlestickChart.tsx:210, ComposedChart.tsx:111-118, Histogram.tsx:165, WaterfallChart.tsx:224, BoxPlot.tsx:222 | Top-level charts must pass `xScale={xScale}` `yScale={yScale}` into `<ChartFrame>` so `ChartContext` scales are populated; verify `<Gridlines>`, `<ReferenceLine>`, `<ReferenceBand>` subscribe correctly | ChartFrame.test.tsx: "Gridlines render N lines when parent chart passes xScale/yScale via ChartFrame" — assert `svg line` count = `xTicks.length + yTicks.length` per affected chart; per-chart: `showGrid={true}` produces gridline elements; a `<ReferenceLine>` renders when passed |
| C2 | DonutChart innerRatio default regression | src/charts/PieChart.tsx:199 | Spread-order bug: `<PieChart ref={ref} innerRatio={props.innerRatio ?? 0.6} {...props} />` lets `{...props}` override the default. Rewrite as `<PieChart ref={ref} {...props} innerRatio={props.innerRatio ?? 0.6} />` (spread first, then default) | PieChart.test.tsx: "DonutChart renders with innerRatio=0.6 when caller omits innerRatio" — assert rendered arc `d` attribute has expected inner radius |
| C3 | Popconfirm placement anchoring under Portal | src/components/Popconfirm.tsx:50, 129, 133 + src/css/components/popconfirm.css:20-46 | Portal detaches overlay; CSS `top/left:100%` resolves against `document.body`, so `placement` is CSS-dead. Compute anchored position via `computeAnchoredPosition(triggerRect, placement)` (same pattern as PopoverV2 :155-172); drop CSS `top/left:100%` placement rules | Popconfirm.test.tsx: "overlay is positioned adjacent to the trigger's bounding rect when placement='top'" |
| C4 | Carousel compound drops slidesPerView/gap | src/components/Carousel.tsx:183-188 | Computed viewport style only applies in the `children ?? <DefaultTree>` fallback; `CarouselViewport` doesn't read from context. Publish `slidesPerView`/`gap` via `CarouselContext`; have `CarouselViewport` consume and apply style | Carousel.test.tsx: "compound `<Carousel.Viewport>` applies slidesPerView and gap to the computed style" |

### Wave D: Documentation P0s (no code change)

Just README/CHANGELOG/docs edits plus TSDoc additions (Wave A of the doc plan). Zero to low risk.

| # | Surface | File:line | Fix |
|---|---|---|---|
| D1 | README component count | README.md:7 | "230+ accessible components + a brutalist icon system" → "500+ accessible components across primitives, layout, forms, navigation, data display, overlays, interactive surfaces, a full chat/AI tier, domain-specific specialty widgets, and ~60 bundled monoline icons." Number sourced from `docs/data/props.json` after re-running `scripts/extract-props.mjs` |
| D2 | README theme count | README.md:122 | "Three themes" → "Four themes": `darkTheme`, `lightTheme`, `midnightTheme`, `greyTheme`; include greyTheme in `themeName` example enumeration |
| D3 | README bundle budgets | README.md:500-508 | Replace table with current CI budgets: core ESM ≤170 KB, charts ESM ≤40 KB, dev ESM ≤10 KB, stylesheet ≤50 KB, all JS ≤400 KB (all gzipped; enforced in `package.json` size-limit) |
| D4 | README test-count drift | README.md:554 and README.md:885 | Two different counts ("1260+" vs "1230+"). Replace both with one sentence each matching actual `npm run test` count at apply time |
| D5 | README marketing-fluff | README.md:5 | 32-remediation §1.9 explicitly concludes **no change** — keep the flavour line because it's adjacent to six concrete audience names. Listed here for traceability only |
| D6 | Docs a11y-audit blurb | docs/App.tsx:375 | Replace misleading "All components are tested with jest-axe" sentence with the accurate "formal audit of a representative cross-section; full-library audit tracked in plan 33" prose from 32-remediation §3.1 |
| D7 | TSDoc Wave A (Tier-A components) | 39 files across src/components/ (Button, Badge, Card, Tabs, Modal, Dialog, Drawer, DrawerV2, Sheet, Input, Textarea, Select, Toggle, Checkbox, RadioGroup, FormField, Combobox, Menu, Toaster, DataGrid, DataList, Viewers, Metrics, Sidebar, Navbar, Toolbar, PageHeader, Navigation Breadcrumb/Pagination/CursorPagination/Stepper, Wizard, CommandInput, ScrollArea, Popovers PopoverV2/HoverCard/Tooltip/TooltipProvider, …) | Paste the one-sentence-purpose + composition-hint TSDoc block immediately above each `export const <Name> = forwardRef(...)` / `export function <Name>` so `react-docgen-typescript` picks it up. Full prose listed in 32-remediation §4.1 |

### Wave E: User decisions required (do NOT fix without input)

These need the human to say yes/no before executing.

| # | Decision | Context | Options |
|---|---|---|---|
| E1 | `tools/cli/commands/test.mjs` | 87-line test-scaffold generator exists; never wired into `tools/cli/bin/voidframe.mjs`. 32-remediation §5.1 recommends wiring but flags as a decision | (a) Wire it in (add commander block after voidframe.mjs:67, add README bullet :35-42, add CHANGELOG entry) / (b) Delete test.mjs / (c) Move to `plans/deferred/` |
| E2 | `voidframe.dev` domain | ESLint rule URLs (tools/eslint-plugin-voidframe/rules/*.ts) and VS Code extension's "Open Playground" URL (tools/vscode-voidframe/src/extension.js:72) both reference `voidframe.dev/docs/…`. Domain not known to be registered; repo is on LAN Forgejo | (a) Register + deploy docs / (b) Rewrite all URLs to Forgejo `git.ahadley.local/aeryn/VoidFrame/src/branch/main/...` / (c) Make VS Code ext URL configurable via `voidframe.docsUrl` setting defaulting to `http://localhost:5175` |
| E3 | VS Code extension repository field | tools/vscode-voidframe/package.json:45-48 points to nonexistent `github.com/voidframe/voidframe`. Main repo is `git.ahadley.local/aeryn/VoidFrame` (Forgejo) | (a) Match main repo URL (Forgejo) with `"directory": "tools/vscode-voidframe"` / (b) Point at future GitHub mirror once created / (c) Defer until publish plan runs |

## Counting

Total P0 fixes across Waves A-D: 31
- Wave A (dead-prop): 9
- Wave B (callback wiring): 6
- Wave C (architectural): 4
- Wave D (docs): 7 (D5 is a no-change entry tracked for traceability; net 6 actionable)

User-decision items (Wave E): 3

## Unclassified / notes

- **Audit 29** — `29-remediation.md` bundles "P0/P1" findings into a single Wave 1 without severity splits. Without `29-findings.md`, we cannot isolate the P0 subset. The four mechanical P0-candidates (1.2 onChange→onValueChange, 1.4 ReactionPicker, 1.6 onClose→onDismiss, 2.1 variant vocab) are all non-breaking alias additions + warnOnce, and are better handled as a single coordinated Wave (codemod + deprecation shim) per plan 29's own rollout; they are intentionally omitted from the P0 queue above since each "fix" is additive and doesn't gate any user-visible defect. If a severity-split is required, load `29-findings.md` and reclassify.
- **VStack wrap** appears only in 31-remediation. No collapsed duplicate this pass.
- **ChartFrame dual-ref fragility** (31:406) is a P1 per the file section heading, excluded from Wave C.
- **Popconfirm focus-trap / click-outside** (31 Wave 1) is P1 and excluded; Wave C only carries the P0 placement fix (C3).
- Wave D/D7 is a file-by-file batch (39 components). Counted as one P0 execution line but expect ~39 commits.
