# Phase 26 — Comprehensive Adversarial Review

> Author: automated review pass, 2026-04-15
> Scope: full codebase (491 components, ~55 hooks, ~41 utils, ~225 KB CSS)
> Method: 5 parallel adversarial audits (component/a11y, structure/bundle, security, CSS/theme, tests)

Five subagents ran concurrent deep reviews of the voidframe surface. Their
brief was to find **what's broken, missing, or wrong** — not to describe
what exists. This document consolidates their findings into a prioritised
backlog and proposes six follow-on phases (30 – 35) to address them.

---

## 0. Executive summary

Voidframe has a large, polished component surface with solid test hygiene
(1509 passing tests, no `.skip`, no snapshot noise) and a working docs
site. Three systemic issues block a real "v1.0 production" claim:

1. **XSS-shaped holes** in four components shipping HTML-building code
   (`MarkdownEditor`, `RichTextEditor`, `RichEmbed`/Mermaid, `Viewers`),
   and no shared `safeHref` helper across the ~9 components that accept
   user-controlled URLs.
2. **Bundle + surface leaks.** Charts, icons, and dev tools all ship in
   the default barrel; the real minified-gzipped JS weight isn't what
   `size-limit` reports because its glob misses the chunk files; the CSS
   bundle is 225 KB uncompressed and exceeds its own stated budget.
3. **V1/V2 parallel surfaces.** `Overlay.tsx` still exports a weaker
   Drawer/Popover/Dropdown/Alert/ConfirmDialog next to the V2 compound
   versions in sibling files. Dead paths that consumers can still reach.

Add a layer of polish issues — `reducedMotion` API backwards, RTL
support largely cosmetic, `Input`/`Textarea` onChange shape
inconsistent with the rest of the surface, and ~40 components with no
dedicated test — and the full adversarial surface is non-trivial.

The findings split cleanly into six phases. None require a ground-up
rewrite.

---

## 1. Critical findings (6)

These items are **correctness / security** — ship-blockers for v1.

| # | Finding | File (evidence) | Fix sketch |
|---|---|---|---|
| 1 | MarkdownEditor renders raw user HTML via `innerHTML` with unescaped `href` interpolation — `[x](javascript:alert(1))` executes | [MarkdownEditor.tsx:180](src/components/MarkdownEditor.tsx#L180) | Tokenize → sanitize → stringify; use `safeHref` + HTML-escape on attribute values |
| 2 | RichTextEditor writes unsanitized HTML `value` into the DOM and accepts arbitrary `createLink` URLs | [RichTextEditor.tsx:152-155](src/components/RichTextEditor.tsx#L152), [RichTextEditor.tsx:200](src/components/RichTextEditor.tsx#L200) | Built-in allowlist sanitizer; reject non-http(s)/mailto/hash URLs on createLink |
| 3 | Mermaid initialized with `securityLevel: "loose"` then the returned SVG is written via `innerHTML` — arbitrary JS in a chart string executes | [RichEmbed.tsx:90](src/components/RichEmbed.tsx#L90) | Default to `"strict"`; expose as opt-in prop |
| 4 | Every anchor-capable component (Navigation, BreadcrumbMenu, Identity, ChatCitations, ChatComposer Mention, SkipToContent, Lightbox Download, Embed.DocumentPreview) forwards untrusted `href` untouched | 9 files, [details below](#details-a-component--a11y) | Shared `safeHref()` in `utils/` that rejects `javascript:` / `data:` / `vbscript:` — adopt everywhere |
| 5 | Two `target="_blank"` anchors use only `rel="noreferrer"` — older browsers leak `window.opener` (reverse tab-nabbing) | [ChatCitations.tsx:160,245](src/components/ChatCitations.tsx#L160), [Identity.tsx:218](src/components/Identity.tsx#L218) | Standardise on `rel="noreferrer noopener"` |
| 6 | `Chat.tsx` uses raw `useLayoutEffect` (SSR warning + hydration drift) despite `useIsomorphicLayoutEffect` being available and used elsewhere | [Chat.tsx:23,201](src/components/Chat.tsx#L23) | Swap to the isomorphic variant |

---

## 2. High-impact findings (14)

### Bundle + surface
- **Charts ship on every import.** [src/components/index.ts:1071](src/components/index.ts#L1071) re-exports `../charts` into the root barrel, and `vite.config.ts` only externalises `react`/`react-dom`. `d3-*` packages live in `dependencies`, not peers. A consumer doing `import { Button } from "voidframe"` pulls the full chart tree.
- **CSS 225 KB uncompressed**, concatenated via `cssCodeSplit: false` in [vite.config.ts:80](vite.config.ts#L80). Declared size-limit ceiling is 40 KB gzipped; the glob in `package.json:82` doesn't match the emitted chunk names so we never see it.
- **Dev tools in the production barrel.** `src/index.ts:66` exposes `DevPanel`, `Playground`, `PropsTable`, `ProfilerScope` on the default import path. `Playground` imports `react-live` — which lives in `devDependencies` only, meaning the claim is currently a build landmine.
- **Icons are a 755-line monolith.** [src/icons/set.tsx](src/icons/set.tsx) exports all 75 icons from one file; a single named import drags the whole module.

### Duplicate / shadow components
- **V1/V2 doubled.** `Overlay.tsx` exports `Drawer` / `Popover` / `Dropdown` / `Alert` / `ConfirmDialog` next to `DrawerV2` / `PopoverV2` / `Menu` / `AlertV2` / `ConfirmDialogV2` in sibling files. V1 versions lack anchoring, focus trap, and compound APIs.
- **`Overlay.Dropdown` violates the WAI-ARIA menu contract.** `role="menu"` without ArrowUp/Down/Home/End/Escape; trigger is a `<div onClick>`. Redundant with `Menu.tsx`. [Overlay.tsx:162-199](src/components/Overlay.tsx#L162).
- **`Spotlight` claims `aria-modal="true"` without focus trap, escape handler, or focus return.** SR/keyboard users get stranded mid-tour. [Spotlight.tsx:152-223](src/components/Spotlight.tsx#L152).

### API consistency
- **`Input` / `Textarea` emit the raw `ChangeEvent`** ([Form.tsx:38,89](src/components/Form.tsx#L38)) while every other form component (`Combobox`, `MaskedInput`, `MentionInput`, `CodeEditor`, `MarkdownEditor`, `RadioGroup`, `MultiSelect`, …) emits a bare value. Swapping one for another breaks the handler.
- **`asChild` triggers clobber user `onClick`.** Dialog, DrawerV2, and PopoverV2 all spread `...props` AFTER the toggle handler, so any consumer-supplied click replaces it. Also no ref-merging in Dialog/DrawerV2 (PopoverV2 does it right — prove-of-concept already in-tree). [Dialog.tsx:136-143](src/components/Dialog.tsx#L136), [DrawerCompound.tsx:100-107](src/components/DrawerCompound.tsx#L100).

### Theming
- **`reducedMotion` naming is inverted.** Prop is `"auto" | "always" | "never"`, and the CSS at `tokens.css:291-305` gates on the OPPOSITE meaning — `"always"` means "force reduce", `"never"` means "ignore OS". Directly backwards from how the prop reads. [provider/VoidframeProvider.tsx:39](src/provider/VoidframeProvider.tsx#L39).
- **Dialog / Drawer backdrops collapse in light mode.** `feedback-overlays.css:16` uses `color-mix(... var(--vf-bg-0) 70% ...)` — in light mode `--vf-bg-0` is near-white, so the scrim is a 70% near-white wash over content. Modality cue disappears.
- **Kanban card elevation inverts in light mode.** `data-display.css:682-691` sets column bg to `bg-2` and card bg to `bg-3`; in light theme `bg-3` is darker than `bg-2`, making cards look pressed-in instead of raised.
- **No `@media print` coverage.** Only one ad-hoc rule in `specialty.css:1504`. Overlays, toasts, tooltips all print as fixed-position blobs. Framework advertises a "Print specialty" but has no shared print contract.

### Testing
- **CommandPalette has zero tests.** A complex surface (fuzzy, keyboard, groups) entirely uncovered.
- **SSR smoke test skips the most likely offenders.** [src/__tests__/ssr.test.tsx:8-74](src/__tests__/ssr.test.tsx#L8) excludes DataGrid, Kanban, Gantt, Combobox, CommandPalette, MediaPlayer, SignaturePad, ImageCropper, ColorPicker, RichTextEditor, MarkdownEditor, CodeEditor, Calendar, DateTimePicker, Spotlight, Popovers — exactly the ones most likely to reach `window`/canvas during render.

---

## 3. Medium findings (selected — 22 total across agent reports)

Compressed summary; see subagent reports in full detail.

- **Toaster container has no `aria-live`** — SR misses new entries. [ToastSystem.tsx:247-263](src/components/ToastSystem.tsx#L247).
- **No component honors `prefers-reduced-motion` at the JS layer.** `usePrefersReducedMotion` exists; zero call-sites. Carousel autoplay, Typewriter, Marquee, Spotlight interval all ignore it.
- **Combobox syncs derived query state via `useEffect`** — stale closure and extra render on every selection change. [Combobox.tsx:124-126](src/components/Combobox.tsx#L124).
- **Three overlapping menu surfaces** (`Overlay.Dropdown`, `Menu`, `MegaMenu`, `BreadcrumbMenu`) with no boundary guidance.
- **Compound roots missing `displayName`** — `DialogRoot`, `AccordionRoot`, `DrawerRoot`, `PopoverRoot`. Shows as `Unknown`/`_c` in React DevTools.
- **RTL broken structurally.** Physical margins/paddings/positions dominate; only ONE `[dir="rtl"]` selector in the codebase. Chat alone has 15+ `margin-left: auto` entries to push metadata.
- **Hardcoded `rgba(0,0,0,*)` scrims and `#eee`/`#444` in Lightbox** — neither tokenized. [interactive-media.css:86-120](src/css/components/interactive-media.css#L86).
- **`--vf-accent` referenced 112 times across 21 files but never defined as a theme token.** Always `var(--vf-accent, <fallback>)`.
- **Hooks barrel imports from itself** — `usePrefersReducedMotion` imports `useMediaQuery` via `./index`. Cycle risk.
- **Hook exports inconsistent.** `src/hooks/index.ts` surfaces ~63, `src/index.ts` manually lists ~22. Users reach `useEvent`, `useTimeout`, `useResizeObserver`, `useAnnouncer`, etc. only via deep imports.
- **`useThemePersistence` / `DataGrid` column-state read `localStorage` during render** — hydration mismatch under SSR. [useThemePersistence.ts:77-85](src/hooks/useThemePersistence.ts#L77).
- **IFrame `sandbox` default allows scripts + forms with no warning if consumer adds `allow-same-origin` (known escape).** [Embed.tsx:35](src/components/Embed.tsx#L35).
- **`size-limit` glob mismatch** — misses `dist/index-*.{js,cjs}` chunks that hold the actual weight. Currently green-lights a 1 MB chunk.
- **`react-live` + `vsce` + `@types/vscode` in `devDependencies` despite runtime import by public export.** Build-time lie.
- **40+ components have no dedicated test file.** Dialog, DataGrid, Kanban, Gantt, MediaPlayer, ToastSystem, Viewers, Widget, Accordion, Combobox-grouped-nav — all untested.

---

## 4. Low-severity / hygiene findings (selected)

- `deprecatedProp` / `deprecatedComponent` exist but are unused — no component has been formally deprecated despite V1/V2 duality.
- Axe coverage is a curated allowlist (~25 components), not exhaustive.
- Chart tests assert on `.vf-*` CSS classes; any CSS rename cascades false reds.
- VirtualList "performance" test only renders 500 items and doesn't scroll.
- DataGrid resize test is a guaranteed-pass no-op — fires pointer events, asserts element is still in DOM.
- Overstuffed mega-files: `DataGrid.tsx` 1142 LOC, `DevTools.tsx` 1080, `Chat.tsx` 1050, `Viewers.tsx` 909, `ChatComposer.tsx` 966, `DatePicker.tsx` 703.
- Dead CSS utilities: `.vf-will-change-transform`, `.vf-will-change-opacity`, `.vf-cv-auto` — defined, unreferenced.
- `Object.assign` compound pattern lost TSDoc until recent fix (still needs the comment ON the assign, not the root).
- Duplicate `prefers-reduced-motion` blocks across `tokens.css`, `keyframes.css`, `components/icon.css`.
- Root `src/index.ts` uses five `export *` wildcards — any internal accidental export escapes publicly.

---

## 5. Proposed phases (30 – 35)

### Phase 30 — Critical Security Hardening
**Goal:** close the six critical findings and land a reusable security baseline.

Tasks:
1. Add `utils/safeHref.ts` — rejects `javascript:`, `vbscript:`, non-http(s)/mailto/tel/hash URLs. Export from root.
2. Audit + adopt `safeHref` in all 9 anchor-forwarding components.
3. Replace the regex markdown renderer in `MarkdownEditor` with a tokenise-then-stringify pipeline + attribute escaping. Optional: swap to `marked` / `micromark` with a whitelist renderer.
4. Sanitize RichTextEditor HTML on every write: minimum allowlist of tags + attrs, explicit `createLink` URL validation.
5. Default Mermaid `securityLevel` to `"strict"`. Expose as an opt-in prop.
6. Normalize every `target="_blank"` anchor to `rel="noreferrer noopener"`.
7. Swap `Chat.tsx` to `useIsomorphicLayoutEffect`; grep for other raw `useLayoutEffect` users.
8. Move `useThemePersistence` + `DataGrid` storage reads to post-mount effects; gate initial render on the default.

Tests: security-specific suite (`src/__tests__/security/`) that covers each vector with concrete payloads — `javascript:` in markdown links, RichText `createLink` prompts, Mermaid graphs with `click`.

Risk: deprecations. If consumers rely on `javascript:` links (they shouldn't), flag with a dev-mode warning for a release cycle.

### Phase 31 — Bundle + Surface Hygiene
**Goal:** cut the default bundle, fix size budgets, stop leaking internals.

Tasks:
1. Split `voidframe` package `exports` into subpaths:
   `.`, `./styles.css`, `./styles/charts.css`, `./charts`, `./dev`, `./playground`, `./icons`.
2. Remove `export * from "../charts"` and `export * from "./dev"` from the root barrel. Update docs + CLI init template.
3. Promote `d3-*` to `peerDependencies` with `optional: true`. Keep `@types/*` in `devDependencies`.
4. Move `react-live`, `vsce`, `@types/vscode` out of `devDependencies`: `react-live` → optional peer for the playground subpath; vsce → tools-only.
5. Split `src/icons/set.tsx` into one file per icon, re-export from the barrel. Preserve public API.
6. Replace `cssCodeSplit: false` with per-family CSS emission; or drop the single-file invariant and raise size-limit consciously.
7. Fix `size-limit` glob to cover `dist/**/*.{js,cjs}`; tighten budgets and publish per-surface numbers in CI.
8. Swap `src/hooks/index.ts` self-imports (`usePrefersReducedMotion`, `usePrefersColorScheme`) to direct file paths to break the cycle risk.
9. Reconcile `src/index.ts` hooks list with `src/hooks/index.ts` — prefer `export * from "./hooks"` once the cycle is fixed.
10. Add `npm run api-check` comparing `dist/types/index.d.ts` to a committed baseline; fail CI on undeclared additions.

### Phase 32 — V1/V2 Consolidation & Mega-file Split
**Goal:** remove shadow components and shard the 700+ LOC files.

Tasks:
1. Deprecate `Overlay.Drawer` / `.Popover` / `.Dropdown` / `.Alert` / `.ConfirmDialog` via `deprecatedComponent`; re-export V2 versions internally as thin wrappers. Schedule hard removal for v1.1.
2. Deprecate `Interactive.Toast` + legacy `Toast` in favor of `Toaster` / `toast()`.
3. Deprecate `Spinner` (DataExtended) in favor of `SpinnerV2` (Loading).
4. Split `Chat.tsx` into `Chat/Conversation.tsx`, `Chat/Message.tsx`, `Chat/Indicators.tsx`, `Chat/Reactions.tsx`, `Chat/Edit.tsx`. Drop duplicate aliases (`TypingIndicator` = `ThinkingIndicator`, `MessageReactions` = `ReactionBar`).
5. Split `Viewers.tsx` into a directory (`Viewers/CodeBlock.tsx`, `JSONViewer.tsx`, `DiffViewer.tsx`, `LogViewer.tsx`, `Terminal.tsx`, `MarkdownRenderer.tsx`).
6. Split `DataGrid.tsx`, `DatePicker.tsx`, `MediaPlayer.tsx`, `ChatComposer.tsx`, `DevTools.tsx` — same pattern: one module per component.
7. Attach `displayName` on compound roots (Dialog, Accordion, Drawer, Popover) before `Object.assign`.

### Phase 33 — Interaction & A11y Hardening
**Goal:** close every interactive-component contract gap found.

Tasks:
1. Unify form component onChange signatures. Rewrite `Input` / `Textarea` to route through `useControllableState` and emit `(value: string, event) => void`. Add `defaultValue`. Old signature behind `onChangeEvent` for one release.
2. Fix `asChild` Trigger pattern in `Dialog`, `DrawerV2`: merge handlers via a `mergeHandlers` util (compose user + framework click), merge refs via `useMergedRefs`. PopoverV2 is the template.
3. Spotlight: wrap card in `FocusScope` + `DismissableLayer`, add focus return, Escape handler — or drop `aria-modal`.
4. Toaster: add `aria-live="polite"` + `aria-relevant="additions"` to the container; split a second `aria-live="assertive"` region for danger-tone toasts.
5. Wire `usePrefersReducedMotion` into `Carousel` autoplay, `Typewriter`, `Marquee`, `Spotlight` intervals, `ChatAgent` streaming.
6. Fix Combobox's `useEffect`-driven query sync — compute displayed text during render.
7. Fix Carousel interval replay: use functional setter, drop `index` from deps.
8. Convert `Widget.tsx` manual ref-forking to `useMergedRefs`.
9. Replace `Overlay.Dropdown`'s broken ARIA menu with a thin wrapper around `Menu`.
10. Add `axeCoverage.test.tsx` that iterates every interactive export with a default harness; explicit allowlist for known skips.

### Phase 34 — Theme, Tokens, RTL, Print
**Goal:** make the theming claim true across every theme, every direction, and every medium.

Tasks:
1. Rename `reducedMotion` API to match semantics (`"auto" | "reduce" | "respect"` or similar) with a deprecated-alias shim for one release.
2. Introduce semantic surface/ink tokens: `--vf-surface-canvas`, `--vf-surface-raised`, `--vf-surface-overlay`, `--vf-ink-primary`, `--vf-ink-muted`, `--vf-ink-subtle`. Map per theme. Migrate components off ordinal `bg-0..5` / `text-0..5`.
3. Define `--vf-scrim`, `--vf-scrim-strong`, `--vf-shadow-sm/md/lg` per theme. Replace hardcoded `rgba(0,0,0,*)` and `#eee/#444/etc.` in `feedback-overlays.css`, `interactive-media.css`, `data-display.css`, `overlay.css`, `specialty.css`, `dev.css`.
4. Define `--vf-accent` in every theme block (remove the 112 var fallbacks).
5. Flip Kanban card elevation to use the semantic surface tokens (fixes the light-mode inversion).
6. RTL conversion: physical → logical properties across all `src/css/components/*.css`. Lint rule to reject `margin-left`, `padding-right`, `left:`, `right:` in component CSS.
7. Consolidate the three `prefers-reduced-motion` blocks into one in `tokens.css`.
8. Add shared `@media print` block in `base.css`: hide overlays/toasts/tooltips/dropdowns/backdrops, force `background: white; color: black` on body, keep `[data-print-layout]` visible.
9. Rework the density system to drive padding/gap exclusively through `--vf-sp-*` tokens so every component scales.
10. Delete the unreferenced `.vf-will-change-*` / `.vf-cv-auto` classes.

### Phase 35 — Test Coverage & Quality Sweep
**Goal:** raise coverage from "1509 passing" to actually meaningful.

Tasks:
1. Add dedicated tests for the 40+ untested components. Priority: CommandPalette, DataGrid, Dialog, DrawerCompound, ToastSystem, Kanban, Gantt, MediaPlayer, Viewers, Accordion, Combobox (grouped nav), SignaturePad (with canvas mock).
2. Add `formatters.test.ts` — table-driven cases for every util (14 missing).
3. Add chart tests: `BubbleMap`, `ChoroplethMap`, `ComposedChart`, `NetworkGraph` + primitives `Gridlines`, `Crosshair`, `ChartContext`, `ChartTooltip`, `ChartTooltipBody`.
4. Rewrite chart tests to use role/data-testid selectors instead of `.vf-*` CSS classes.
5. Extend `ssr.test.tsx` to render every top-level export at default state; SSR-break the DataGrid/Calendar/ColorPicker/MarkdownEditor/etc. regressions this will find.
6. Rewrite the VirtualList/DataGrid virtualization tests with a 10k-item scroll driver + `onRangeChange` spy.
7. Fix the DataGrid resize test (assert on the callback payload, not DOM layout).
8. Mock `HTMLCanvasElement.prototype.getContext` in `test/setup.ts` so SignaturePad tests actually exercise draw.
9. Add `test/observerMocks.ts` (Resize, Intersection) and remove per-test stubs.
10. Dialog + Form integration test covering focus trap → first field, submit closes, Esc cancels.
11. ChatAgent streaming test asserting tool-call status transitions.
12. Add `npm run test:coverage` thresholds specifically for `src/hooks`, `src/utils`, `src/primitives` — raise to 95%.

---

## 6. What NOT to fix yet

Deferred deliberately:

- **Storybook / runtime docs iteration.** Current docs + Playground are enough.
- **Figma / design-tool bridge.** Still out of scope until a design partner exists.
- **Hot theme swap at runtime via JS.** Edit tokens in-place works; not worth an API.
- **Generic RTL demo pass.** Wait until Phase 34 converts CSS, then verify once.
- **Complete TSDoc for all 400+ undocumented components.** Content work — incremental.
- **Public API-diff tooling beyond `api-check`.** Good-enough gate; fancy reports later.

---

## 7. Rough sizing

| Phase | Est. LOC | Est. days | Tests added | Ship-order priority |
|---|---|---|---|---|
| 30 Security | ~600 + sanitizer deps | 4-5 | ~30 | **first** |
| 31 Bundle | ~400 config + icon split (~800) | 3-4 | ~5 | second |
| 32 V1/V2 + mega-file split | ~2000 reshuffle | 5-7 | ~40 | third |
| 33 Interaction/A11y | ~1200 | 5-6 | ~60 | fourth |
| 34 Theme/RTL/Print | ~1500 CSS rewrite | 6-8 | ~15 | fifth |
| 35 Test sweep | ~400 src fixes + ~2500 test | 7-10 | ~250 | parallel w/ 32-34 |

Total new tests target: **~1500 → ~1900**, with coverage floors raised for `hooks`/`utils`/`primitives` to 95%.

---

## 8. Details (A–E): raw agent findings

Agent reports are preserved verbatim in:

- `plans/agent-reports/26-component-a11y.md`
- `plans/agent-reports/26-structure-bundle.md`
- `plans/agent-reports/26-security.md`
- `plans/agent-reports/26-css-theme.md`
- `plans/agent-reports/26-tests-coverage.md`

(Saved as part of this commit so the raw evidence is versioned alongside
the consolidated plan. Each report has 14–16 concrete findings with file
+ line references.)
