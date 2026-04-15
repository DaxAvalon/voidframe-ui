# Agent B — Structure + Bundle review

> 16 findings. Strongest: charts always in the default barrel (so
> tree-shaking is nominal), CSS bundle 5.6× stated budget, dev tools
> + `Playground` ship in production export path, icon set is a
> 755-line monolith, hooks barrel imports itself (cycle risk), hook
> exports inconsistent between `src/hooks/index.ts` and `src/index.ts`,
> V1/V2 surfaces doubled, size-limit glob misses the real chunks.

## Findings

### 1. Charts always bundled into main barrel — optional peers leak
**Severity:** high
**Evidence:** `src/components/index.ts:1071` `export * from "../charts";` + `src/index.ts:54` `export * from "./components"` + `vite.config.ts:88` externals are only `react`/`react-dom`.
**Problem:** `d3-array/hierarchy/sankey/scale/shape/time` (all in `dependencies`) plus the entire chart library get pulled into the root bundle even for `import { Button }`. Tree-shaking across a 1 MB shared chunk (`dist/index-CIrZv490.js`) is unreliable with Rollup's lib mode.
**Fix:** Move charts behind an explicit subpath (`voidframe/charts` in `exports`), list d3 packages as `external` in `rollupOptions`, and promote them to `peerDependencies`.

### 2. CSS bundle is ~5.6× the stated size budget
**Severity:** high
**Evidence:** `dist/voidframe.css` 225 389 bytes uncompressed; `package.json:75-79` declares a 40 KB gzipped ceiling.
**Problem:** All 491 components' CSS is concatenated (`cssCodeSplit:false` in `vite.config.ts:80`) and ships on every page load. Real-world gzip on 225 KB text is well above 40 KB.
**Fix:** Split CSS per component family (`voidframe/styles/charts.css`, `voidframe/styles/dev.css`, etc.) or drop the single-file invariant and raise the limit consciously.

### 3. Dev tools ship in the production barrel
**Severity:** high
**Evidence:** `src/index.ts:66` `export * from "./dev";` surfaces `DevPanel`, `Playground`, `PropsTable`, `ProfilerScope` — `dist/types/index.d.ts:2351`.
**Problem:** `Playground` pulls `react-live` (a 100+ KB runtime eval bundle, declared in `devDependencies`) transitively. Anyone who does `import * as V from "voidframe"` in an SSR tool chain risks pulling it; even dead-code-eliminated, the devtools + profiler are 15–40 KB of code shipping to real users.
**Fix:** Move `./dev` behind `voidframe/dev` subpath export and remove it from the root barrel.

### 4. `react-live` in `devDependencies` but imported by a public export
**Severity:** high
**Evidence:** `src/dev/Playground.tsx:4` imports `react-live`; `package.json:146` has it in `devDependencies` only.
**Problem:** If the export stays public, a consumer building the library sees `Cannot find module 'react-live'`. The build currently silently drops `Playground` (absent from `dist/types/index.d.ts`), which means the public API claim in `src/dev/index.ts:19-20` is a lie.
**Fix:** Either demote Playground to a dev-only entry or add `react-live` + `@types/vscode` to `optionalPeerDependencies` and mark the module `external`.

### 5. Icon set is a 755-line monolith barrel
**Severity:** medium
**Evidence:** `src/icons/set.tsx` exports 75 icons; `src/icons/index.ts:16` `export * from "./set"`.
**Problem:** `import { ChevronIcon } from "voidframe"` drags the entire 75-icon module through the barrel because every icon lives in one file — a single import of any icon forces the module into the chunk.
**Fix:** Split `set.tsx` into one file per icon and re-export from `index.ts`; Rollup can drop unused files but not unused exports within a file.

### 6. Hook exports inconsistent between `src/hooks/index.ts` and root `src/index.ts`
**Severity:** medium
**Evidence:** `src/hooks/index.ts` has ~63 exports; `src/index.ts:108-142` names only ~22.
**Problem:** `useEvent`, `useTimeout`, `useResizeObserver`, `useIntersectionObserver`, `useElementSize`, `useScrollPosition`, `useFocusVisible`, `useLongPress`, `useAsync`, `useForm`, `useCountdown`, `useStopwatch`, `useAnnouncer`, `useColorScheme`, `usePrefersReducedMotion`, `usePageVisibility`, `useNetworkStatus`, etc. are reachable from `./hooks` internally but never listed at the root — docs/autocomplete will miss them.
**Fix:** Replace the explicit list at `src/index.ts:108` with `export * from "./hooks"` or finish the manual list.

### 7. Hooks import from their own barrel (potential cycle)
**Severity:** medium
**Evidence:** `src/hooks/usePrefersReducedMotion.ts:1` and `src/hooks/usePrefersColorScheme.ts:1` do `import { useMediaQuery } from "./index"`.
**Problem:** Leaf modules importing the barrel creates a circular dependency graph; under Rollup this evaluates the barrel before its own children, producing `undefined` imports in some orderings.
**Fix:** Import directly from `./useMediaQuery`.

### 8. V1/V2 shadow components living side-by-side
**Severity:** medium
**Evidence:** `src/components/Overlay.tsx` exports `Drawer/Popover/Alert/ConfirmDialog`; `src/components/DrawerCompound.tsx`, `Popovers.tsx`, `Notifications.tsx`, `Dialog.tsx` export `DrawerV2`/`PopoverV2`/`AlertV2`/`ConfirmDialogV2`. Similarly `DataExtended.tsx:533` `Spinner` vs `Loading.tsx` `SpinnerV2`, `Interactive.tsx:286` `Toast` vs `ToastSystem.tsx` `Toaster/toast`.
**Problem:** Two of every overlay-family component ship, doubling bundle cost and API surface. Callers have to guess which to use.
**Fix:** Deprecate V1 with `deprecatedComponent`, schedule removal, and have the V1 re-export point at V2 internally.

### 9. Overstuffed source files
**Severity:** medium
**Evidence:** `DataGrid.tsx` 1142 LOC, `DevTools.tsx` 1080, `Chat.tsx` 1050, `ChatComposer.tsx` 966, `Viewers.tsx` 909, `ChatModel.tsx` 725, `Widget.tsx` 719, `MediaPlayer.tsx` 706, `DatePicker.tsx` 703, `Navigation.tsx` 690, `Menu.tsx` 628, `FormAdvanced.tsx` 626, `Popovers.tsx` 614, `CommandPalette.tsx` 602, `NetworkGraph.tsx` 652, `Viewers.tsx` 909.
**Problem:** Multi-component mega-files; e.g. `Viewers.tsx` contains CodeBlock+JSONViewer+DiffViewer+LogViewer+Terminal+MarkdownRenderer. Tree-shaking sub-components out of a single file is unreliable.
**Fix:** Split each mega-file into one module per component under a subfolder (`Viewers/CodeBlock.tsx`, etc.) and re-export from a slim `Viewers/index.ts`.

### 10. `dependencies` contains bundleable d3 packages that should be peer
**Severity:** medium
**Evidence:** `package.json:99-106` — `d3-array/hierarchy/sankey/scale/shape/time` are runtime `dependencies`; `d3-force/geo/topojson-client` are optional peers.
**Problem:** Inconsistent — installing `voidframe` drags 6 d3 modules into every consumer's `node_modules` even when they never touch a chart. Upgrading d3 requires a voidframe release.
**Fix:** Promote all d3-* to `peerDependencies` with `optional: true` where the chart is optional; keep `@types/*` in `devDependencies`.

### 11. Public utility exports look like internals
**Severity:** low
**Evidence:** `src/dev/index.ts:10-11` exports `recordRender`, `getProfilerStore`; `src/components/Viewers.tsx` re-exports `escapeCodeHTML`; `src/components/Widget.tsx` exports `packLayout`; `src/components/Dialog.tsx` exports `ConfirmDialogV2`+`useConfirm` side-by-side with `ConfirmProvider`.
**Problem:** These are internal helpers surfaced in the public API, adding versioning burden.
**Fix:** Prefix with `unstable_`, or move to `voidframe/internal` subpath gated by README guidance.

### 12. Test coverage gaps — 40+ components without a `__tests__` peer
**Severity:** medium
**Evidence:** `src/components/__tests__/` has ~60 tests for 91 component modules. Missing: Accordion, Activity, Animations, Calendar, Carousel, ChatAttachments, ChatModel, ColorTools, DataGrid, DataList, DateTimePicker, Dialog, DragDrop, DrawerCompound, Embed, Encoding, Gantt, Gestures, HelpChangelog, Identity, Image, Kanban, Lightbox, Loading, MediaPlayer, Metrics, Network, Notifications, Numeric, ScrollArea, Sidebar, Spotlight, ThemeSelector, TimeDisplays, TreeTable, TreeView, Utility, Viewers, Virtualization, Widget, Masonry, Print, RichEmbed, TimePicker, ToastSystem, CommandPalette, Text, Field.
**Problem:** Notably the heavy lift components (DataGrid, Dialog, DrawerCompound, ToastSystem, CommandPalette, Kanban, Gantt, MediaPlayer, Viewers) are untested despite being the most likely to regress.
**Fix:** Add at minimum a render-and-a11y smoke test per missing component.

### 13. Root `src/index.ts` uses `export *` for components — no surface review
**Severity:** low
**Evidence:** `src/index.ts:51-57` — `export * from "./primitives"`, `./components`, `./icons`, `./lazy`, `./dev`, `./responsive`.
**Problem:** Five wildcard re-exports mean any accidental internal export in a child barrel escapes to the public API with no gate. Name collisions (e.g. `Tooltip` in two modules, already renamed to `TooltipV2`) cascade through this path.
**Fix:** Convert to explicit `export { … }` lists; codify a `npm run api-check` that diffs `dist/types/index.d.ts` against a committed baseline.

### 14. `Overlay.tsx` exports types but not the components from root
**Severity:** low
**Evidence:** `src/components/index.ts:773-780` exports `DrawerProps`/`DropdownProps`/`PopoverProps`/`AlertProps`/`ConfirmDialogProps` as types, but the *value* exports `Drawer`/`Dropdown`/`Popover`/`Alert`/`ConfirmDialog` were listed earlier (lines 186-192). This duplicates the type/value split and obscures whether V1 is public.
**Problem:** Split declaration makes it easy to delete the value while leaving the type, producing phantom types that reference nothing.
**Fix:** Co-locate value and type exports in one block per module.

### 15. Duplicated positioning logic not all migrated to `utils/anchor`
**Severity:** low
**Evidence:** `utils/anchor.ts` is used only by `components/Popovers.tsx:32` and `charts/primitives/ChartTooltip.tsx:17`. Other files with their own positioning math: `Spotlight.tsx:100,283`, `Kanban.tsx`, `DataGrid.tsx`, `ImageCropper.tsx`, `MediaPlayer.tsx`, `RatingInput.tsx`, `NavigationExtended.tsx`, `Resizable.tsx`, `charts/primitives/Brush.tsx`, `charts/HorizonChart.tsx`, `charts/StreamGraph.tsx` — each calls `getBoundingClientRect` with bespoke clamping.
**Problem:** The anchor utility was lifted but migration stalled after two call-sites.
**Fix:** Either broaden `utils/anchor` to cover the remaining cases or accept divergence and delete the shared utility.

### 16. `size-limit` entry mismatches actual dist layout
**Severity:** low
**Evidence:** `package.json:82` limits "All JS chunks combined" by globbing `dist/voidframe.es.js` + `dist/*.cjs`, but actual JS weight lives in `dist/index-*.js` (1 MB file at `dist/index-CIrZv490.js`) and `dist/index-*.cjs` (630 KB).
**Problem:** The budget glob excludes `dist/index-*.js`, so size-limit green-lights a 1 MB shared chunk.
**Fix:** Change glob to `dist/*.js` or `dist/**/*.{js,cjs}`.
