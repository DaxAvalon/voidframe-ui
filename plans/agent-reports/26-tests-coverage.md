# Agent E — Tests + Coverage review

> 15 findings. Strongest: CommandPalette + 4 charts + 5 chart primitives
> have zero tests, `utils/formatters.ts` has 14 untested exports, SSR
> smoke test excludes the most-likely-to-break components, axe coverage
> is a curated allowlist, VirtualList "perf" test doesn't scroll, DataGrid
> resize test is a guaranteed-pass no-op.

## Findings

### 1. CommandPalette has zero tests
**Severity:** high
**Evidence:** `src/components/CommandPalette.tsx` exists; grep of `__tests__` for `CommandPalette` returns 0 matches.
**Problem:** A complex interactive surface (fuzzy search, keyboard nav, sections) is entirely untested despite being called out by the prompt as an integration-critical component.
**Fix:** Add `CommandPalette.test.tsx` covering filter input, arrow/Enter selection, group headings, and Esc-to-close.

### 2. Multiple chart components with no tests
**Severity:** high
**Evidence:** No files found under `src/charts/__tests__/` for `BubbleMap`, `ChoroplethMap`, `ComposedChart`, `NetworkGraph`. Chart primitives `Gridlines.tsx`, `Crosshair.tsx`, `ChartContext.tsx`, `ChartTooltip.tsx`, `ChartTooltipBody.tsx` also untested.
**Problem:** 4 top-level charts plus 5 shared primitives have zero coverage; chart primitives are used by every other chart.
**Fix:** Add at minimum smoke tests for each missing chart and primitive.

### 3. `utils/formatters.ts` — 14 exports, 0 tests
**Severity:** high
**Evidence:** `src/utils/formatters.ts:12-176` exports `formatNumber`, `formatBytes`, `timeAgo`, `clamp`, `mapRange`, `stringToColor`, `deepMerge`, `groupBy`, `sortBy`, `copyToClipboard` etc.; `src/utils/__tests__/` has only `anchor`, `cx`, `date`, `deprecate`, `warn`, `createSafeContext`.
**Problem:** Pure utilities are the cheapest and most valuable to test — skipping them is indefensible. `deepMerge` and `timeAgo` have edge cases that will silently regress.
**Fix:** Add `formatters.test.ts` with table-driven cases per function.

### 4. VirtualList "performance" test only uses 500 items and no scroll
**Severity:** medium
**Evidence:** `src/components/__tests__/DataDisplay.test.tsx:249-267` renders 500 items with itemHeight 20 and only asserts `rendered.length < 20`.
**Problem:** Does not stress >1k items, never scrolls, and cannot measure perf in happy-dom (no layout). `DataDisplayCompletions.test.tsx:198` for DataGrid virtualization only checks a CSS class exists.
**Fix:** Add a 10k-item scroll test driving `scrollTop` and asserting window relocation; real perf must move to a browser benchmark harness.

### 5. DataGrid resize/reorder tests admit they don't verify
**Severity:** medium
**Evidence:** `src/components/__tests__/DataDisplayCompletions.test.tsx:94-96` — comment: "We don't get to easily re-read the layout, but the handler should not have thrown — smoke check."
**Problem:** Test fires pointer events but asserts only that the element is still in the document. This is a guaranteed-pass false positive masquerading as resize coverage.
**Fix:** Use a controlled `onColumnResize` callback and assert on the emitted width value, not DOM layout.

### 6. SignaturePad relies on component's silent canvas fallback
**Severity:** medium
**Evidence:** `src/components/SignaturePad.tsx:77` — `if (typeof canvas.getContext !== "function") return;`. Test in `SignaturePad.test.tsx:22-35` fires pointer events and asserts `getStrokes().length === 1`.
**Problem:** happy-dom has no 2D canvas context, so the component silently no-ops the draw path; the stroke bookkeeping happens separately, meaning the test only covers the event→state wiring, not actual rendering. No mock documents this.
**Fix:** Mock `HTMLCanvasElement.prototype.getContext` to return a spy 2d-context stub so draw calls can be asserted.

### 7. Combobox has no group/section keyboard nav tests
**Severity:** medium
**Evidence:** `src/components/__tests__/Combobox.test.tsx` — grep for `group|optgroup|heading` returns zero matches; only flat-list ArrowDown tests exist.
**Problem:** Grouped combobox nav (skipping headings, jumping across groups) is a known hard case explicitly called out; no coverage.
**Fix:** Add a grouped-options test exercising ArrowDown across group boundaries and heading-skip semantics.

### 8. ToastSystem has only one file of tests and no queueing scenario
**Severity:** medium
**Evidence:** `ToastSystem` imported only in `FeedbackOverlays.test.tsx:12` via `_resetToastsForTesting, toast, Toaster`. No test for simultaneous toast dismissal ordering, max stack, or auto-dismiss timing interaction.
**Problem:** Queue + dismissal ordering under concurrent `toast(...)` calls is untested.
**Fix:** Add a multi-toast queue test with fake timers covering max-stack eviction and dismiss order.

### 9. Dialog + internal Form integration is absent
**Severity:** medium
**Evidence:** `Overlay.test.tsx` grep for `Form|useForm` returns 0 matches; `a11yAxe.test.tsx:77-94` uses Modal/Drawer but only with plain `<button>`/`<p>` children.
**Problem:** Focus trap + form submission + Escape-close is a canonical integration flow; no test exercises Dialog containing a Form with validation and submit.
**Fix:** Add integration test rendering `<Modal><Form/></Modal>`, asserting focus trap to first field, submit-closes, Esc-resets.

### 10. Chat streaming path untested
**Severity:** medium
**Evidence:** `ChatAgent.test.tsx` grep for `stream|Streaming` returns 0; only static `status` snapshots of `ToolCall` are exercised.
**Problem:** Real agent traces arrive incrementally; progressive text + tool-call transitions (pending→running→complete) aren't simulated.
**Fix:** Add a test that updates `MessageContent`/`AgentStep` status props across renders and asserts DOM transitions.

### 11. No hook test uses a library — manual `renderWithTheme` harnesses everywhere
**Severity:** low
**Evidence:** `src/hooks/__tests__/domHooks.test.tsx:82-95` saves/restores `globalThis.IntersectionObserver` inside each test; no shared harness.
**Problem:** Duplicated setup for Intersection/Resize observers across hook tests; no use of `renderHook` from `@testing-library/react`. Easy to drift.
**Fix:** Add a shared `test/observerMocks.ts` helper and adopt `renderHook` uniformly.

### 12. SSR smoke test skips most complex components
**Severity:** medium
**Evidence:** `src/__tests__/ssr.test.tsx:8-74` imports a curated subset — DataGrid, Kanban, Gantt, TreeTable, TreeView, Combobox, CommandPalette, MediaPlayer, SignaturePad, ImageCropper, ColorPicker, RichTextEditor, MarkdownEditor, CodeEditor, Calendar, DateTimePicker, Spotlight, Popovers are NOT in the render list.
**Problem:** The most likely SSR offenders (components that touch `window`/canvas/pointer APIs) are precisely the ones excluded. Guarantees false confidence.
**Fix:** Extend SSR test to render every exported top-level component at its default state.

### 13. A11y axe coverage is a curated allowlist, not exhaustive
**Severity:** medium
**Evidence:** `src/components/__tests__/a11yAxe.test.tsx:32-286` covers ~25 components; missing: Combobox, CommandPalette, DataGrid, Calendar, DatePicker, Kanban, Gantt, TreeView, MediaPlayer, Chat surfaces, Carousel, Wizard, Accordion, FileUpload, RatingInput, ColorPicker, MegaMenu, Sidebar, Menu.
**Problem:** Axe runs on a hand-picked subset — most of the interactive surface area has no axe check.
**Fix:** Refactor to iterate over every interactive export with a default harness, allowlist known-skips explicitly.

### 14. Chart tests assert on CSS classes
**Severity:** low
**Evidence:** `src/charts/__tests__/Sparkline.test.tsx:10` — `container.querySelector("path.vf-chart-line")`; `Heatmap.test.tsx:19` — `.vf-chart-heatmap__cell`; every chart test uses `vf-*` classnames.
**Problem:** Rename or restyle any CSS class → cascade of red tests with no semantic signal. Should use SVG role/aria or data-testid.
**Fix:** Migrate chart assertions to `data-testid` or role-based queries.

### 15. No test for hooks `useShortcuts`, `useLongPress` beyond existence
**Severity:** low
**Evidence:** `src/hooks/__tests__/interactionHooks.test.tsx` mentions `useLongPress` — but `useShortcuts.tsx` is a JSX-producing hook; no dedicated test file found (grep in hooks/__tests__ for `useShortcuts` returns nothing below the aggregate files).
**Problem:** Shortcut scopes, overlap resolution, meta-key platform variance untested.
**Fix:** Add `useShortcuts.test.tsx` with conflicting-scope cases.

## Summary numbers
- 1509 tests, ~53 component files in `src/components/` have direct `.test.tsx` but ~30+ components only appear indirectly through bucket files (`DataDisplay.test.tsx`, `InteractiveMedia.test.tsx`, `Specialty.test.tsx`) — organization mixes per-file and per-category with no consistent rule.
- 17 `console.warn/error` spies across 8 files — reasonable but concentrated in `dev/` (warn suppression is the feature under test there).
- 0 `.skip`/`.todo` markers — good hygiene signal.
- No real snapshot tests — good.
- `test/setup.ts` stubs `ResizeObserver` and `matchMedia` but not `IntersectionObserver` or canvas context; individual tests ad-hoc stub these, inviting drift.
