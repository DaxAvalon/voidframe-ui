# Changelog

All notable changes to voidframe-ui will be recorded here. Dates are in
UTC. The project follows [Semantic Versioning](https://semver.org).

## [Unreleased]

_Nothing yet._

## [1.3.0] - 2026-05-04

Developer experience release driven by a comparative audit against
shadcn/ui, MUI, Chakra, and Radix. Addresses 14 usability findings
across visual defaults, API ergonomics, documentation, and tooling.

### Behavior changes

- **`.vf-root` no longer sets `min-height: 100vh`.** The provider's
  wrapper `<div>` previously forced a viewport-height minimum, which
  broke flex/grid layouts in Next.js App Router and similar setups
  where the host element already manages height. Consumers who relied
  on the provider filling the viewport should add `min-height: 100vh`
  to their own root element or pass it via `style`.
- **Default Button outline is brighter.** The base `.vf-button` class
  now uses `border: var(--vf-border-3)` and `color: var(--vf-text-1)`
  (was `border-1` / `text-3`). Buttons without an explicit `variant`
  now look intentionally styled rather than broken.
- **Dialog/Popconfirm action buttons render as solid.** `Dialog.Action`
  now applies `vf-button--solid` and uses `buttonDisabledAttrs` for
  accessibility. Popconfirm's confirm button default changed from
  `outline` to `solid`. Cancel buttons remain `ghost`/`outline`.

### Added

- **`ButtonGroupOption.icon`** — optional leading icon (`ReactNode`).
- **`ButtonGroupOption.disabled`** — per-option disabled state.
- **`ButtonGroupOption.label`** widened from `string` to `ReactNode`.
- **`FieldBindings.onValueChange`** — `form.register("name")` now
  returns `onValueChange` alongside `onChange`, so spreading onto
  VoidFrame form controls works without prop ordering issues.
- **Browser Support section** in README documenting the `color-mix()`
  CSS baseline (Chrome 111+, Firefox 113+, Safari 16.2+).
- **Button style guide** in README — table showing which `variant`,
  `tone`, and `accent` combinations to use for each intent.
- **`compat-shadcn` and `reactflow`** added to README subpath table.
- **V2 deprecation note** in README component inventory.
- **~45 compound sub-component JSDoc descriptions** across Dialog,
  DrawerV2, Sheet, Popover, Tooltip, HoverCard, Tabs, Accordion,
  and Card for improved IDE hover documentation.
- **Socket.dev badge** in README.

### Fixed

- **`suppressA11yWarning` marked `@internal`** in JSDoc on Input,
  Textarea, Select, and Toggle to discourage direct consumer use.
- **`variant="destructive"` documented as alias** — JSDoc on
  `ButtonVariant` clarifies it maps to `variant="solid" tone="danger"`.
- **`useFormContext` generic limitation documented** — `@remarks`
  note explains the convenience cast is not a compile-time guarantee.

### Build / tooling

- **VS Code extension ready for Marketplace** — removed `private:
  true`, added `license: MIT`. Publish with `npx vsce publish`.

## [1.2.1] - 2026-05-03

Comprehensive audit remediation release. A 12-area code audit
identified 50+ findings across security, accessibility, performance,
build, i18n, RTL, and developer experience. This release resolves all
of them. Every change is backwards-compatible except for the two
items listed under Behavior changes below.

### Behavior changes

These two changes are intentional but observable from the outside.

- **`AppShell` now constrains its height to `100vh` (was `minHeight:
  100vh`).** Sidebar, main content, and right panel each scroll
  independently within their viewport slice. Previously the entire
  shell grew with content, so the sidebar scrolled with the page.
  Consumers who embedded an `AppShell` inside a taller parent (not
  full-page) should pass `style={{ height: "auto" }}` to restore
  the old behavior.
- **Type declaration paths changed.** `rollupTypes` was disabled to
  fix a build crash (see Build below). The `exports` map in
  `package.json` has been updated so resolution via `moduleResolution:
  "bundler"` or `"node16"` is unaffected. Consumers using the legacy
  `moduleResolution: "node"` who import `dist/types/voidframe.d.ts`
  directly (not via the package name) will need to update to
  `dist/types/index.d.ts`.

### Security

- **`CarouselImageGallery` `img.src` sanitized.** Image sources now
  pass through `safeHref()`, blocking `javascript:`, `data:`, and
  other dangerous URI schemes. Safe URLs (https, relative paths)
  are unaffected.
- **`Print` iframe hardened.** A `Content-Security-Policy` meta tag
  with `script-src 'none'` is injected into the print iframe,
  preventing script execution. Stylesheet `<link>` elements are
  cloned by extracting `href`/`rel` through `escapeHTML()` instead
  of writing raw `outerHTML`. `<style>` elements use `textContent`
  instead of `outerHTML`.

### Accessibility

- **`Dialog.Trigger` and `Menu.Trigger` forward refs with `asChild`.**
  Both used `cloneElement` without passing the `ref`, breaking ref
  access for consumers using the `asChild` pattern. Fixed with
  `captureRef` (matching the existing `PopoverTrigger` pattern).
  `MenuTrigger` is now also wrapped in `forwardRef` and merges the
  child's `onClick` instead of overwriting it.
- **`Slider` `aria-label` fallback.** Falls back to `"Slider"` when
  the `label` prop is omitted, preventing an unlabeled range input.
- **`FormField` error/help IDs.** Error and help spans now have
  auto-generated `id` attributes (via `useId`). Error spans have
  `role="alert"`. A `data-describedby` attribute on the wrapper
  exposes the active ID for consumers wiring `aria-describedby`.
- **`Combobox` and `MultiSelect` close on Tab.** Pressing Tab while
  the dropdown is open now closes it cleanly and moves focus to the
  next element, matching WAI-ARIA combobox expectations.
- **`Spotlight` dismissable via Escape.** A `keydown` listener on
  `document` closes the tour overlay when Escape is pressed.
- **`ContextMenu` RTL positioning.** Changed `left` to
  `insetInlineStart` so the context menu appears on the correct side
  in RTL layouts.
- **`NavItem` RTL indentation.** Changed `paddingLeft` to
  `paddingInlineStart` so nested nav items indent on the correct
  side in RTL.

### Performance

- **`DataGrid` `handleColumnResize` memoized** with `useCallback` to
  prevent re-creating the closure on every render.
- **`ThemeScope` composed style memoized** with `useMemo` to prevent
  all consumers re-rendering when `cssVars`/`style` haven't changed.
- **`VoidframeProvider` `mergedStyle` memoized** with `useMemo` to
  stabilize the style object identity across renders.

### Fixed

- **Build: all 21 subpath bundles now generate.** `vite-plugin-dts`
  with `rollupTypes: true` caused a stack overflow in
  `@microsoft/api-extractor` when processing 21 entry points,
  producing only 3 of 21 bundles (voidframe, charts, dev). Set
  `rollupTypes: false` — `tsc` already emits correct per-file
  `.d.ts` declarations. All 21 ES + CJS bundles and type
  declarations now build successfully.
- **`useCopyToClipboard` timer leak.** The `setTimeout` handle was
  not stored or cleaned up. Now uses `useRef` + `useEffect` cleanup
  to prevent `setState` on unmounted components.
- **`portalContainer` SSR guard.** `getPortalContainer()` now throws
  a descriptive error when called during SSR (`typeof document ===
  "undefined"`) instead of crashing with `ReferenceError`.
- **`Mermaid` stable diagram ID.** Replaced `Math.random()` with
  React `useId()` (colon-stripped) for deterministic, SSR-safe
  element IDs.
- **Deprecated API removal targets updated.** `Drawer`, `Popover`,
  `Alert`, `ConfirmDialog`, `Dropdown`, `Spinner` removal targets
  bumped from v1.2 (current) to v2.0.

### RTL

- **30+ CSS physical properties converted to logical equivalents**
  across 18 component stylesheets: `padding-left` →
  `padding-inline-start`, `margin-left` → `margin-inline-start`,
  `border-left` → `border-inline-start`, `text-align: left` →
  `text-align: start`, etc. Components affected: comment, command
  input, CSV viewer, interactive (tabs, collapsible), navigation
  (nav item active border), hex dump, date/time, responsive table,
  complex form (tree select), cascader, code context view, split
  button, token visualizer, feedback overlays (popover arrow
  centering), popconfirm overlay positioning.
- **Slider thumb** uses `insetInlineStart` in both CSS transition
  and JS inline style.
- **Regression test** (`test/css-logical.test.ts`) scans all CSS
  files for physical left/right properties and fails on new
  violations. Allowlists popover arrow triangle and timeline arrow
  (intentionally physical shapes).

### i18n

- **`fileUpload.tooLarge` and `fileUpload.tooMany` translations**
  added to all 7 non-English locales (ar, de, es, fr, he, ja,
  zh-CN).
- **`ChatComposer.SlashCommandPicker`** gains `emptyMessage` prop
  (default `"No commands"`) so consumers can localize the empty
  state.
- **`Mermaid`** gains `loadingMessage` prop (default `"Loading
  diagram…"`) so consumers can localize the loading fallback.
- **Locale completeness test** verifies every key in `enMessages`
  exists in all non-English locale packs. Template function test
  args updated to include `max`/`maxBytes`.

### Developer experience

- **Token export script** (`scripts/export-tokens.mjs`) now exports
  all 4 themes (dark, light, midnight, grey) to CSS, SCSS, JSON,
  and Figma variable formats. Previously only dark and light.
- **VS Code extension `props.json` regenerated** from current
  component source. Previously stale (showed old Button variants).
- **CLI `init` template** changed `variant="primary"` (deprecated)
  to `variant="solid"`.
- **ESLint `require-a11y-label` rule** now accepts `aria-labelledby`
  as a valid label attribute (message already mentioned it,
  implementation now matches).
- **`InlineEdit` ref cast** changed from `as any` to a proper
  intersection type.

### Build / CI

- **CI dist verification expanded.** Both GitHub Actions and Forgejo
  CI now check all 21 entry bundles (ES + CJS), type declarations,
  and CSS — not just the 3 main bundles.
- **GitHub Actions pinned to SHA hashes** (`checkout@v4.3.1`,
  `setup-node@v4.4.0`, `configure-pages@v5.0.0`,
  `upload-pages-artifact@v3.0.1`, `deploy-pages@v4.0.5`) to
  prevent supply-chain attacks via mutable tag force-pushes.
- **Subpath export test** (`test/build/subpath-exports.test.ts`)
  verifies all 21 barrel files export at least one symbol.
- **Export-tokens test** updated to expect 4 theme modes and assert
  midnight/grey CSS selectors.

## [1.2.0] - 2026-04-28

Tier-1 completion release. Closes the deferred items from the v1.1.0
post-mortem: SSR-unsafe ID generation, advanced form-control size
parity, performance memoization on flagship collections, plus three
new opt-in subpaths (`/compat-shadcn`, `/reactflow`) and a published
`create-voidframe-app` starter. Non-breaking, additive — every change
preserves existing call-site behavior.

### Behavior changes

- **`MaskedInput.onChange` is deprecated.** Use `onValueChange` —
  emits both the formatted and raw strings via `{ value, raw }`.
  `onChange` will be removed in v1.3. Dev-mode warning fires once
  per call site when only `onChange` is supplied.

### Added

- **`size?: "sm" | "md" | "lg"` + `wrapperProps?: HTMLAttributes<HTMLDivElement>`**
  on every advanced compound form control that lacked them in v1.1:
  `ColorPicker`, `MaskedInput`, `RatingInput`, `DatePicker`,
  `DateTimePicker`, `TimePicker`, `Combobox`, `MultiSelect`,
  `CommandInput`, `TreeSelect`, `Cascader`, `FileUpload`,
  `MentionInput`. CSS scaling rules ship in `src/css/components/form-sizes.css`
  (consumed via `voidframe-ui/styles.css`).
- **`voidframe-ui/compat-shadcn` subpath.** Static compat layer for
  shadcn/Radix migrations. Flat named exports backed by voidframe
  internals: `Button`, `Card` (+ `CardHeader`/`Title`/`Description`/
  `Content`/`Footer`), `Dialog` (+ all subcomponents), `AlertDialog`
  (+ subcomponents), `Sheet` (DrawerV2 underneath), `Popover`,
  `Tooltip` (+ `TooltipProvider` no-op for source-compat),
  `DropdownMenu` (+ `Item`/`CheckboxItem`/`RadioItem`/`Separator`/
  `Sub*`), `Select` (+ Trigger/Value/Content/Item), `Tabs` (+ List/
  Trigger/Content), `Toast` (+ `useToast`, `Toaster`), and trivial
  passthroughs for `Input` / `Textarea` / `Label` / `Badge` /
  `Checkbox` / `Switch` / `Avatar` / `Separator` / `ScrollArea` /
  `Skeleton` / `Progress` / `Slider` / `Toggle` / `ToggleGroup` /
  `RadioGroup` / `RadioGroupItem`. ~25 KB gzipped budget; pure
  re-exports, zero runtime translation cost.
- **`voidframe-ui/reactflow` subpath.** `<VoidframeReactFlowTheme>`
  wrapper + `useVoidframeReactFlowStyles()` hook that scope voidframe
  CSS variables onto `@xyflow/react`'s `Controls` / `MiniMap` / edges
  / nodes / handles. No `!important` overrides. `@xyflow/react`
  declared as optional peer.
- **`create-voidframe-app` starter package.** Published separately as
  `npm create voidframe-app@latest my-app` (or `npx create-voidframe-app`).
  Wraps the existing `voidframe init` CLI logic so consumers don't
  need to install the full `voidframe-ui` CLI just to scaffold.
- **`Radio` accepts `defaultChecked` for uncontrolled use.** Closes
  the v1.1 audit gap where `Radio` was forced controlled-only despite
  the CHANGELOG claim.

### Fixed

- **SSR-unsafe ID generation eliminated** at three escape sites:
  - `KeyValueEditor` (DevTools.tsx) — was `kv-${Date.now().toString(36)}`,
    now uses `useId()` + per-instance counter ref.
  - `QueryBuilder` (DevTools.tsx) — was `${Date.now()}-${Math.random()}`,
    now uses `useIdGenerator()` helper.
  - `PromptTemplateEditor` (ChatComposer.tsx) — was
    `t-${Date.now().toString(36)}`, now uses `useId()` + counter ref.
- **`utils/formatters.ts:uid()` JSDoc** updated to flag the helper
  as internal-only (Math.random()-based, NOT SSR-safe). Public
  consumers should use React's `useId()` instead.
- **`Popconfirm` SSR break** — was using direct `useLayoutEffect`
  (throws on server-render); switched to `useIsomorphicLayoutEffect`.
  Audit found this immediately after v1.1.0 ship; fixed pre-1.2.

### Performance

- **`Kanban`, `Calendar`, `Gantt`, `TreeView`** export sites now
  wrapped in `React.memo`. Parent re-renders with referentially-stable
  props skip the per-cell / per-row / per-task render walk. For best
  effect, consumers should pass stable callbacks (e.g. via
  `useCallback`).
- **`CommandPalette.Item` and `CommandPalette.Group`** memoized at
  the export site. Large palette lists no longer re-render every item
  on `value` / `onValueChange` parent changes.
- **`DataGrid` and `Table`** retain their generic `<T>` signature and
  are not export-level memoized in this release; per-row component
  extraction is tracked for v1.3 when generic-preserving memo wrappers
  land.

### Build / packaging

- **`size-limit` ceilings** added for the two new subpaths:
  `compat-shadcn ESM` ≤ 25 KB gzipped, `reactflow ESM` ≤ 5 KB gzipped.
- **`peerDependenciesMeta.@xyflow/react.optional: true`** declared so
  consumers who don't use ReactFlow don't need to install it.

### Docs

- **CHANGELOG flags MaskedInput `onChange` deprecation** prominently
  under Behavior changes for v1.3 removal.
- **Component-level JSDoc** updated on Kanban / Calendar / Gantt /
  TreeView / CommandPalette describing the memoization pattern and
  the consumer-side stability requirement.

## [1.1.0] - 2026-04-28

Standardization release driven by the DevTeam integration report
against 1.0.0. Every fixable correctness-matrix row and improvement
suggestion was applied at the source level and fanned out across
related components — the goal was to fix once and have every similar
surface inherit the fix.

### Behavior changes

These three are intentional but observable from the outside; pin to
1.0.x if you can't take them this cycle.

- **`Button` now emits the native `disabled` attribute** alongside
  `aria-disabled="true"` when `disabled` is set. The 1.0.x build
  emitted `aria-disabled` only, which let `<form>` submission still
  fire from a disabled submit button. The same dual-emission rule is
  applied uniformly to every button-like component (`IconButton`,
  `CopyButton`, `FloatingActionButton`, `SplitButton`'s primary +
  menu halves, `ToggleGroup` items, `Toolbar` buttons, and
  `SegmentedControl` segments) via the new shared
  `buttonDisabledAttrs(disabled)` helper.
- **`Label` auto-upgrades to `<label>` when `htmlFor` is supplied.**
  The default rendered element is still `<span>` (so nesting a
  decorative `<Label>` inside another `<label>` stays valid HTML),
  but a `<Label htmlFor="id" />` now renders an actual `<label
  for="id">`. This fixes `getByLabelText` resolution against
  externally-positioned labels — the previous span-with-`for`
  combination was inert.
- **`NumberInput.value` widened to `number | "" | null`** with a
  matching `onValueChange`, plus a `defaultBlank` prop covering the
  common "empty = unset" form pattern. `DatePicker`,
  `DateTimePicker`, `TimePicker`, `RatingInput`, `ColorPicker`,
  `Combobox`, `TreeSelect`, and `Cascader` got the same
  empty-vs-zero-vs-null cleanup. Consumers using
  `Dispatch<SetStateAction<number>>` or `(n: number) => void` for
  `onValueChange` will need to widen their handler to accept
  `NumberInputValue`.
- **`Composer` defaults `disabled` from `status="streaming"`.** When
  `status="streaming"` and `disabled` is not explicitly set, the
  composer is now disabled. Consumers who want to allow interruption
  during streaming pass `disabled={false}` explicitly. The status
  prop is documented as the visual indicator; the new default keeps
  the visual and the blocking behavior in sync.

### Added

- **Theme attributes are written to `document.documentElement`** in
  addition to the provider's own subtree (`VoidframeProvider`,
  `ThemeScope`). Portaled overlays — `Dialog`, `AlertDialog`,
  `ConfirmDialogV2`, `DrawerV2`, `Popconfirm`, `TooltipV2`,
  `Popover`/`PopoverV2`, `HoverCard`, `Menu`, `ContextMenu`,
  `Lightbox`, `Overlay`, `Spotlight`, `Toaster`, `CommandPalette` —
  now inherit the active theme regardless of where the portal mounts
  in the DOM tree. Opt out of the global write with
  `<VoidframeProvider scope="root">` for apps that need
  subtree-only theming.
- **`data-tone` / `data-variant` / `data-size` attributes** are now
  emitted alongside the existing `vf-*--*` BEM modifier classes on
  every tone-capable component (`Badge`, `AlertV2`, `Callout`,
  `Stat`, `Progress`, `Table`, `Message`, `MetricCard`,
  `StatGroup`, `BigNumber`, `MultiProgress`, `Activity` +
  `Activity.Item`, `Anchor`, `Calendar`, `ContextWindow`,
  `ChatTokenCounter`, `CostDisplay`, `EmptyState`, `ListItem`,
  `Toast`, …). Tests and consumer CSS can target either; no visual
  change. Routed through a shared `toneAttrs({ tone, variant, size })`
  helper.
- **`data-testid` and other rest props now land on the native form
  control** for every form primitive that previously dropped them on
  the wrapper (`NumberInput`, `Checkbox`, `Slider`, `SearchInput`,
  `Switch`, `PasswordInput`, `PinInput`, `TagInput`,
  `SegmentedControl`, `RadioGroup` items, `ColorPicker`,
  `MaskedInput`, `RatingInput`, `DatePicker`, `DateTimePicker`,
  `TimePicker`, `Combobox`, `CommandInput`, `TreeSelect`,
  `Cascader`, `FileUpload`, `MentionInput`). A new optional
  `wrapperProps?: React.HTMLAttributes<HTMLDivElement>` escape
  hatch is available on the same components for consumers who
  genuinely need to hook the wrapper.
- **Compound API aliases** for Radix-shape parity: `Tabs.Content`
  alongside `Tabs.Panel`; `Tooltip.Root` / `Tooltip.Trigger` /
  `Tooltip.Content` alongside the prop-based `Tooltip`; `Select.Root`
  / `Select.Trigger` / `Select.Value` / `Select.Content` /
  `Select.Item` alongside the prop-based `Select`; `ContextMenu.Item`
  / `ContextMenu.CheckboxItem` / `ContextMenu.RadioGroup` /
  `ContextMenu.RadioItem` / `ContextMenu.Separator` /
  `ContextMenu.Label` / `ContextMenu.Sub` / `ContextMenu.SubTrigger`
  / `ContextMenu.SubContent` exposed as direct subkeys.
- **`tone` prop on `Button` and every button-like component**
  (`neutral` | `info` | `success` | `danger` | `warning`), plus
  `size="icon"` and `variant="destructive"` (alias for
  `tone="danger"`) for shadcn/Radix migration parity. `Menu.Item`,
  `Menu.CheckboxItem`, `Menu.RadioItem`, `MegaMenu` items,
  `NavItem`, `ListItem`, `Combobox` options, tree nodes
  (`TreeView`, `TreeSelect`, `Cascader`), `CommandPalette.Item`, and
  `Sidebar` items also gained `tone`.
- **Default `data-testid` on every built-in dialog action button**:
  `vf-confirm-confirm-button` / `vf-confirm-cancel-button` on
  `ConfirmDialogV2`; `vf-alert-confirm-button` /
  `vf-alert-cancel-button` on `AlertDialog`;
  `vf-popconfirm-confirm-button` / `vf-popconfirm-cancel-button` on
  `Popconfirm`; `vf-drawer-close-button` on `DrawerV2`'s built-in
  close X; `vf-dialog-close-button` on `Dialog`'s close X. Each
  component also accepts `confirmButtonProps` / `cancelButtonProps`
  / `closeButtonProps` pass-throughs.
- **`useConfirm()` falls back to `window.confirm()` in development**
  when no `ConfirmProvider` is in scope (with a one-time warn),
  instead of throwing on first call.
- **`ContextMenu` wraps its `content` slot in a `Menu` provider** so
  `Menu.Item`, `Menu.CheckboxItem`, `Menu.Separator` work inside
  context-menu content. `useMenu()` outside a provider now soft-warns
  and returns an inert context (instead of throwing), preventing
  whole-subtree crashes during refactors.
- **`Sortable.dragHandleProps` widened** to
  `React.HTMLAttributes<any>` so consumers who attach the handle to
  a `<button>` / `<span>` / SVG don't need to cast.
- **`size` variant + `asAriaLabel` escape hatch** added uniformly to
  `Input`, `Textarea`, `Select`, `Toggle`, `Combobox`, `NumberInput`,
  `Checkbox`, `Radio` so every form control accepts
  `size="sm" | "md" | "lg"` plus the per-control a11y-label
  override. The `requires label / aria-label / aria-labelledby`
  warning is automatically suppressed when the control's nearest
  ancestor has `role="grid"` / `role="row"` / `role="gridcell"` /
  `role="table"` (via the new `hasAccessibleGridAncestor` helper),
  so DataGrid-cell controls don't false-positive.
- **`Progress.indeterminate` prop** (explicit) alongside the
  existing `value === undefined ⇒ indeterminate` shortcut. Same
  prop added to `MultiProgress` and audited across `Loading`,
  `Gantt`, and `Metrics` progress-like surfaces.
- **Per-row / per-item attribute forwarding** on every collection
  component. `Table`, `DataGrid`, `DataList`, `List`, `TreeView`,
  `TreeTable`, `TreeSelect`, `Cascader`, `Virtualization`,
  `Sortable`, `Transfer`, `Activity`, `LogViewer`, `CodeBlock`,
  `Gantt`, `Calendar` all emit `data-row-key` / `data-item-key` /
  `data-node-key` / `data-line-number` / `data-date` and accept a
  `rowAttributes(row)` / `itemAttributes(item)` callback for
  arbitrary per-row attrs. New `defineColumns<T>(cols)` identity
  helper for explicit T-anchoring.
- **`kind?: "default" | "compact"`** shared across chat-telemetry
  widgets (`ContextWindow`, `ChatTokenCounter`, `CostDisplay`,
  `LatencyIndicator`, `ModelPicker` trigger) for consistent
  compact-rendering in chat headers.
- **`toast` two-arg signature**: `toast(message, options?)` overload
  alongside the existing single-options form. `action` accepts
  `{ label, onClick }` objects in addition to ReactNode. `toast.error`
  added as an alias for `toast.danger` (sonner parity).
- **Default empty-state visuals** (subtle icon + background tile)
  applied uniformly to `EmptyState`, `Table`'s no-rows render,
  `DataGrid` empty render, `DataList` empty render, `CommandPalette`
  no-results, `Combobox` / `TreeSelect` / `Cascader` empty options,
  `ConversationEmptyState`, and `Sidebar` empty-list state.
  `EmptyState.variant="decorated" | "plain"` for explicit control.
- **`MessageContent` accepts `children`** as an alternative to
  `content` (children wins when both are set). `MessageMarkdown`
  exported as a named alias for the content-rendering role.
- **`monospace?: boolean` prop** on every content-container
  component that can host code/log output: `Card`, `DrawerV2.Content`,
  `Dialog.Content`, `Interactive` modal body, `Overlay`, `AlertV2`,
  `CodeBlock` (verified consistency), `HexDump` (verified
  consistency), `CSVViewer`.
- **`Link` primitive** at `voidframe-ui` root: `<Link href onClick
  variant tone external as />` wrapping native `<a>` by default,
  with `as` for react-router / Next.js Link integration. Inherits
  voidframe accent-color hover/focus.
- **`collapsible` + `action` slots on section-header layout
  components**: `Sidebar.Section`, `Card`, `FormStructure` field
  groups. All share the new `useDisclosure` hook for
  controlled/uncontrolled parity with `Accordion`.
- **`AppShell.sidebarResizable`** with `sidebarMinWidth` /
  `sidebarMaxWidth` / `onSidebarWidthChange`. Internal use of the
  existing resize primitives.
- **`toModelPickerOptions(backends)`** adapter helper exported from
  `ChatModel.tsx` for the common
  `{name, available_models, model_capabilities}` → `ModelPickerOption[]`
  shape.
- **`StatGroup.columns`** prop (`number | Responsive<number>`).
  Maps to `display: grid; grid-template-columns: repeat(N, 1fr)`.
- **`DrawerV2.Content` accepts `side`**: content-level value wins;
  falls back to the root `DrawerV2.side`.
- **Compound logging / context surfaces**:
  - `LogEntry.context: { before?: string[]; after?: string[] }` —
    LogViewer renders surrounding context lines dimmed with line
    numbers around the matched message.
  - `Activity.Item` accepts `children?: ReactNode` as an
    expanded-detail slot.
  - `CodeBlock.lineAnnotations: Record<number, ReactNode>` for
    inline error/annotation rendering attached to specific lines.
  - `Calendar.renderDay` + `Calendar.expandedDay` for rich
    day-cell expansion.
  - New `<CodeContextView>` primitive at
    `voidframe-ui/specialty` — error-with-context rendering without
    the full LogViewer chrome (default + compact variants).
- **`CommandPalette.Input` controlled mode**: `value` +
  `onValueChange` props; when controlled, internal filtering is
  skipped. New `filter?: (query, items) => items` hook for
  consumers that want custom filtering while keeping internal
  state.
- **`<Field>` compound** documented and audited as the canonical
  form-grouping primitive: `<Field>`, `<Field.Label>`,
  `<Field.Control>`, `<Field.Help>`, `<Field.Error>`. The built-in
  `label` prop on individual controls remains first-class for
  single-purpose cases; the compound covers help text, error
  messages, and custom label slots.
- **`voidframe-ui/testing` subpath gains `renderWithVoidframe`** —
  wraps the rendered tree in `VoidframeProvider` + `ConfirmProvider`
  (and optionally `ThemeScope`), and re-exports
  `@testing-library/react`'s `render` / `screen` / `waitFor` /
  `fireEvent` / `within` / `cleanup` / `act` for consumer test
  ergonomics.

### Build / packaging

- **Main entry no longer pulls `d3-*` / `dompurify` /
  `topojson-client` into the root chunk.** `LazySparkline` and
  `LazyHeatmap` were removed from `src/lazy.ts` (chart-bundle
  consumers should import from `voidframe-ui/charts` instead);
  `dompurify` is consumed via static import but tree-shaken via
  `sideEffects: ["*.css"]`. The peer dependencies remain marked
  `optional: true` in `peerDependenciesMeta` and are now genuinely
  optional for non-chart / non-markdown consumers.
- **Predictable chunk names**: `vite.config.ts` `manualChunks`
  groups overlay components into a stable `overlays.es.js` chunk
  (was `FloatingActionButton-*.js`), tree components into
  `tree.es.js`, and chart math helpers into `charts-math.es.js`.
- **`theme-script.js` inline comment** corrected from `voidframe`
  to `voidframe-ui`.

### Deprecated

- **`Drawer` (legacy V1) and `Popover` (legacy V1) removal milestone
  slipped from v1.1 → v1.2.** The 1.0.0 changelog flagged these for
  removal in v1.1, but this release is intentionally additive — no
  breaking removals — to give consumers a clean upgrade path through
  the standardization changes. The `@deprecated` JSDoc on each
  component has been updated to reflect the new milestone. The same
  slip applies to `Dropdown`, `Alert`, `ConfirmDialog`, `Spinner`
  (in `DataExtended`), and `Toast` (in `Interactive`) which were
  already on the v1.2 milestone.

### Fixed

- **Stale `@deprecated` replacement-text references** to
  `voidframe` (the pre-publish package name) updated to
  `voidframe-ui` in `Interactive.tsx`, `DataExtended.tsx`, and
  `Overlay.tsx`. Removal milestones bumped from v1.1 → v1.2 since
  the v1.1 release lands without the breaking removals.

### Docs

- **README** gained dedicated sections for: Persistent theming
  (`useThemePersistence` + `VoidframeProvider`), Accessibility:
  labeling form controls, Switch vs Checkbox guidance, When to use
  `<Field>` vs the built-in `label` prop, Link primitive, and
  Testing (referencing the new `renderWithVoidframe` helper).
- **JSDoc updates** on every component touched in this release —
  `Button` (native disabled + MouseEvent onClick), `Label`
  (auto-upgrade behavior), `MessageContent` (content vs children
  vs `MessageMarkdown` alias), `Composer` (status visual vs
  disabled blocking), `TraceViewer` (`@remarks` block clarifying
  span-hierarchy requirement), `Field` (compound vs `label` prop
  guidance).

## [1.0.1] - 2026-04-22

First patch release. Fixes four user-reported bugs from the first day
on npm, plus two docs-only rough edges discovered along the way.

### Fixed

- **Tabs render unstyled.** The component emitted six CSS classes
  (`__list`, `__trigger`, `__trigger--active`, `__panel`, `--horizontal`,
  `--vertical`) but `src/css/components/interactive.css` only defined
  a rule for the root container, so the tab strip had no border, no
  active indicator, and no padding. Added the missing selectors with
  the library's canonical brutalist vocabulary (1px borders, token-
  driven `text-transform` / `letter-spacing`, accent-color active bar,
  horizontal + vertical orientation). Affects every Tabs consumer.
  (#3)
- **QR codes are now actually scannable.** `<QRCode>` previously
  shipped a deterministic hash-to-pattern placeholder that looked
  like a QR code but encoded nothing. The component now lazy-loads
  the new optional peer dependency `qrcode-generator` on first
  render and produces a real scannable SVG. When the peer is
  missing, the component renders a clearly-labelled
  **PLACEHOLDER / install qrcode-generator** overlay so the
  fallback can't be shipped to production by accident. Consumers
  can still bypass both paths by passing a pre-computed `matrix`
  prop. (#1)
- **Barcodes are now actually scannable.** Same shape as QR:
  `<Barcode>` lazy-loads the new optional peer dependency `jsbarcode`
  and renders a real scannable SVG in CODE128 / CODE39 / EAN13 / EAN8
  / UPC / ITF. When the peer is missing, falls back to a clearly-
  labelled **PLACEHOLDER / install jsbarcode** overlay. `pattern`
  prop still bypasses both. (#2)
- **`<PercentDisplay value={50} />` returned `"5,000%"`.** The
  default `basis` was `"fraction"`, interpreting `50` as "50.0× of
  the whole" → `5,000%`. The intuitive default is now `"percent"`
  (value is already 0–100), so `value={50}` renders `"50%"`. The
  `basis="fraction"` mode is still available for 0–1 ratio inputs.
  **Breaking semantic change** for any 1.0.0 consumer who relied on
  the fraction default; justified by the ~0-hour shelf life of 1.0.0.
  (#4)

### Docs

- **DashboardGrid playground now demonstrates drag + resize.** The
  previous snippet rendered a static four-card grid because it
  didn't wire `onLayoutChange` — the library's defensive "drag is
  a no-op without a state updater" path silently disabled
  interactivity. Rewritten as a stateful function component that
  passes `onLayoutChange={setItems}` and enables `resizable`, so
  the docs reader sees the intended behavior.
- **AudioPlayer and VideoPlayer playground URLs retargeted.** Both
  previously pointed at W3Schools hotlinked assets that return
  inconsistently across hosts and don't support Safari for `.ogg`.
  Swapped to Google's CodeSkulptor demo bucket
  (`commondatastorage.googleapis.com`) and the Big Buck Bunny GTV
  sample — both universally-playable formats, hotlink-friendly,
  stable for a decade.
- **README "Subpath imports" section** now explains when to reach
  for a subpath vs the root. Bundler consumers (Vite, Webpack,
  Next.js, Remix, …) should keep using `voidframe-ui` — bundlers
  tree-shake. Bundler-free consumers (raw Node scripts, Deno, Bun
  without a bundler, `node --input-type=module`, esm.sh, unpkg)
  should import from the category subpath (`voidframe-ui/core`,
  `.../forms`, etc.) because the root bundle statically references
  every optional peer's chunk; without tree-shaking, Node's ESM
  loader fails to resolve `dompurify` / `d3-*` / `react-live` at
  load time unless those optional peers are installed.

### Added

- `.markdownlint.json` — `MD024` relaxed to `siblings_only: true` so
  the keepachangelog pattern of repeated `### Added` / `### Fixed` /
  `### Docs` under different version headings stops tripping. Also
  disabled `MD013` (line length), `MD033` (inline HTML), and `MD041`
  (first-line H1 requirement) to match the repo's existing prose
  style.

### Optional peer dependencies added

- `qrcode-generator >= 1.4.0` — required for real `<QRCode>` output.
- `jsbarcode >= 3.11.0` — required for real `<Barcode>` output.

Both are marked `optional: true` in `peerDependenciesMeta`, so
consumers who don't use `<QRCode>` or `<Barcode>` don't need to
install them. Consumers who DO use those components but skip
installing the peer will see the PLACEHOLDER overlay at runtime,
matching the existing BYO-peer pattern used by the chart suite.

## [1.0.0] - 2026-04-21

First public release. Two years of pre-public development matured the
library through layered framework expansion (primitives, layout, forms,
data, overlays, charts, chat/AI, i18n, responsive, icons, dev tools,
testing helpers) and a sequence of audit passes (parameter
standardisation, security, functionality, docs, accessibility), followed
by three-tier real-browser interaction coverage and a publish-prep
polish pass. Every exported component ships with ARIA semantics,
keyboard navigation, a typed `.*Props` interface, and a `displayName`.
Every stateful component is controllable / uncontrolled.

### Added

- **500+ components** across primitives, layout, navigation, forms, data
  display, overlays, interactive surfaces, a full chat/AI tier,
  specialty widgets (dev tools, identity, numeric, time, help, encoding,
  print), and ~60 bundled monoline icons.
- **75 hooks** covering state (`useControllableState`, `useDebounce`,
  `useLocalStorage`, `useUndoRedo`, …), input / IO
  (`useKeyboardShortcut`, `useCopyToClipboard`, `useEventSource`,
  `useWebSocket`), layout (`useResizeObserver`, `useContainerQuery`,
  `useIntersectionObserver`), and framework glue (`useId`, `useEvent`,
  `useIsomorphicLayoutEffect`).
- **96 utilities** for formatting, date math, colour manipulation,
  a11y announcers, controllable-state wiring, safe URLs, and
  deprecation helpers.
- **Four themes**: `darkTheme`, `lightTheme`, `midnightTheme`,
  `greyTheme`, plus `"system"` resolution and per-subtree
  `<ThemeScope>`.
- **Visual-rhythm theme tokens** (brutalist defaults preserved;
  consumer-overridable):
  - `--vf-font-mono` / `--vf-font-sans` / `--vf-font-display` —
    distinct font-stack slots; `--vf-font-family` kept as an alias
    for the mono slot.
  - `--vf-heading-case` — `uppercase` by default; set to `none` for
    title-case.
  - `--vf-heading-tracking` — heading letter-spacing (`0.08em` default).
  - `--vf-radius-0/1/2` — border-radius scale (0 by default, preserves
    zero-corner brutalist default).
- **Full i18n** via `MessagesProvider` + `Intl.*` — eight shipped
  locale packs (`en`, `es`, `fr`, `de`, `ja`, `zhCN`, `ar`, `he`)
  plus `enXA` pseudolocale.
- **Responsive system** — CSS-driven `<Show>` / `<Hide>`,
  `Responsive<T>` props on every layout primitive, `ResponsiveBox`
  escape hatch, and hooks (`useBreakpoint`, `useDeviceType`,
  `useResponsive`, `useContainerQuery`).
- **Charts** — core families (`BarChart`, `LineChart`, `AreaChart`,
  `ScatterPlot`, `BubbleChart`, `ComposedChart`, `PieChart`,
  `DonutChart`, `RadarChart`, `Histogram`, `CalendarHeatmap`,
  `Sparkline`, `Heatmap`), advanced layouts (`TreeMap`, `Sunburst`,
  `FunnelChart`, `WaterfallChart`, `BoxPlot`, `ViolinPlot`,
  `CandlestickChart`, `OHLCChart`, `StreamGraph`, `HorizonChart`,
  `Sankey`, `ChordDiagram`, `ParallelCoordinates`, `ScatterMatrix`,
  `SmallMultiples`), and geo/network (`DependencyGraph`,
  `TileGridMap`, `NetworkGraph`, `ChoroplethMap`, `BubbleMap`).
  Optional d3 peers are declared in `peerDependenciesMeta`.
- **Chat/AI tier** — `Conversation`, `MessageList`, `Message`,
  `ToolCall`, `Composer` (compound), `SessionList`, `ChatLayout`,
  `AgentRunner`, `DebugPanel`, `TraceViewer`, and supporting
  citation / attachment / streaming surfaces.
- **Dev experience** — `<DevPanel>` HUD (renders / warnings / theme /
  about tabs), `ProfilerScope`, `DevErrorFallback`, runtime misuse
  warnings on `RadioGroup`, `Tabs`, `Select`, `FormField`, `Combobox`,
  `DataGrid`.
- **Tooling** — `voidframe` CLI (`init`, `theme`, `codemod`, `doctor`,
  `test`), a **13-rule ESLint plugin** (`no-deprecated-props`,
  `no-deprecated-prop-combination`, `no-inline-style-overrides`,
  `no-legacy-chart-imports`, `no-raw-hex-colors`, `prefer-asChild`,
  `prefer-compound-pattern`, `prefer-subpath-import`,
  `require-a11y-label`, `require-controlled-pair`, `require-use-client`,
  `require-voidframe-provider`, `exhaustive-kind-variant`), two
  codemods (`legacy-charts-to-v2`, `tokens-from-hex`), a VS Code
  extension with snippets + hover docs + Open Playground command.
- **Tree-shaking subpaths** — alongside the monolithic root import,
  the library ships 14 per-category subpaths driven by the docs
  taxonomy: `voidframe-ui/primitives`, `/core`, `/layout`,
  `/navigation`, `/forms`, `/data`, `/activity`, `/overlays`,
  `/media`, `/animation`, `/icons`, `/chat`, `/specialty`,
  `/interactive`, plus the pre-existing `/charts`, `/dev`,
  `/tokens`, `/testing`, `/styles.css`, and `/theme-script.js`.
  Consumers importing from a subpath only pay for the components
  they touch plus shared primitives; the root `voidframe-ui` import
  keeps working unchanged for progressive migration.
- **Testing subpath** (`voidframe-ui/testing`) — `renderWithTheme`,
  `expectNoA11yViolations`, `installMatchMedia`, `createMockStorage`.
- **SSR-safe** — every stateful module carries `"use client"`, a
  `renderToString` smoke test runs in CI, and a pre-hydration theme
  script ships at `voidframe-ui/theme-script.js` to prevent
  dark→light flash.

### Changed

- Replaced the legacy single-file chart surface with scale / axis /
  grid / legend / tooltip / brush primitives; all current charts
  compose from those primitives.
- Replaced `Drawer`, `Modal`, `Popover` with compound `DrawerV2`,
  `Dialog`, `PopoverV2`. The legacy names remain as deprecation
  shims (see below).
- Parameter standardisation across the public API: canonical
  `variant="solid|outline|ghost|subtle"` on Button / IconButton /
  Badge / ToggleGroup, `tone="neutral|accent|success|warning|danger|info"`
  for semantic colour, `onDismiss` for overlay close, `onValueChange`
  unified on non-form controls, `value`/`onValueChange` on Pagination
  and list editors, Tabs migrated to compound dot-notation (flat
  `tabs[]` API removed), `defaultValue` added to seven controllable
  inputs, `asChild` on `Text`.
- `Dialog.Cancel` and `Dialog.Action` now accept `asChild` so trigger
  children render as the consumer's own interactive element, avoiding
  nested-interactive a11y issues.
- `ReactionPicker.onReact` renamed to `onPick` (the handler emits the
  `Reaction.id`, not an emoji character); `ReactionBar.onReact` is
  unchanged and still emits the emoji.
- `ContextMenu` now dismisses on item click (previously the portaled
  menu swallowed the click and stayed open).
- `MenuBar` triggers render `role="menuitem"` to satisfy the
  `aria-required-children` ARIA rule; opening a sibling menu closes
  the previous one via a shared active-id registry.
- `Menu.Content` auto-focuses the first enabled item on open so
  arrow-key navigation works without an initial hint.
- `Toolbar` now implements orientation-aware arrow-key navigation
  (Home / End jump to first / last) to match its `role="toolbar"`
  contract.
- `ResizableHandle` exposes `aria-valuenow` / `aria-valuemin` /
  `aria-valuemax` / `aria-valuetext` reflecting the percentage split
  of the panel to its left.
- `CommandPalette` input is now an ARIA 1.2 combobox (`role="combobox"`,
  `aria-expanded="true"`, `aria-autocomplete="list"`,
  `aria-controls`/`aria-owns` linking the listbox) with a labelled
  listbox; items are direct listbox children via a `role="presentation"`
  group wrapper so AT can resolve `aria-activedescendant`.
- `Avatar` status indicator gained `role="img"` so its `aria-label`
  is spec-valid.
- `Callout` root element is now `<div>` (was `<aside>`); it is
  editorial emphasis, not a page-level complementary landmark.
- `Toaster` adds `data-vf-ignore-outside-click="true"` so clicking a
  toast's Dismiss button doesn't trip outside-click dismissal of the
  modal underneath it.
- `DismissableLayer.isTopmost()` rewritten to handle portaled sibling
  layers correctly: a layer is topmost iff no descendant layer exists
  and no later-pushed non-ancestor sibling layer exists. Fixes the
  prior cascade where a single Escape closed both a Dialog and a
  nested Popover simultaneously.
- Security hardening: URL safety helpers enforced on every
  user-controlled `href`; stricter component prop validation.
- Functionality fixes: 42 wired-but-inert props restored or removed;
  ChartFrame scale propagation fixed across 10 charts; DonutChart
  innerRatio regression fixed; Popconfirm overlay anchored to
  trigger under Portal.

### Deprecated

- `Drawer` → `DrawerV2` (removal target: v1.1).
- `Button` `primary` prop → `variant="solid"` + `accent="var(--vf-accent)"`
  (removal target: v1.1).

### Performance

- **Tree-shaking.** Category subpath imports let consumers pull only
  the components they use. The root bundle code-splits aggressively
  — each subpath entry file is < 1 KB gzipped and pulls in only the
  chunks its components transitively reference.
- Bundle budgets in CI: core ESM ≤200 KB, charts ESM ≤40 KB, dev ESM
  ≤10 KB, stylesheet ≤50 KB, per-category subpaths individually
  ceilinged, and a combined-JS aggregate guardrail — all gzipped.
- Heavy components expose `Lazy*` wrappers so consumers can
  code-split the chunk at their boundary.
- Dev-only `warn()` / `warnOnce()` calls are guarded by
  `process.env.NODE_ENV !== "production"` and stripped by bundlers.

### Accessibility

- 40+ components formally audited (see `docs/a11y-audit.ts`). Every
  component in the audit runs through `jest-axe` on every commit.
- Remaining surface uses the same patterns — broader audit tracked
  as a post-1.0 initiative.
- Three-tier Playwright interaction coverage (see Testing) adds
  real-browser axe sweeps on 40+ component routes across all four
  built-in themes, plus open-state axe checks on every overlay.

### Testing

- **Unit tests** — 5,100+ tests across 341 files (vitest +
  happy-dom). First line of defence for API contract, prop wiring,
  state transitions, and hook behaviour.
- **Visual regression** — Playwright-driven screenshot sweep across
  the four themes (`test/visual/`).
- **E2E interaction** — dedicated Playwright harness in `e2e/` on
  port 5176 with 44 component-fixture routes and 49 spec files
  covering focus traps through Portals, DOM keyboard navigation
  across compound components, `data-side` flip logic,
  `color-mix()` / `:has()` CSS, clipboard API, touch pointer
  events, `getBoundingClientRect()` math, and `ResizeObserver`
  settle. Runs across chromium + firefox + webkit with
  `@axe-core/playwright` sweeps on chromium. Three tiers:
  - Tier A — flagship flows for the 25 highest-bug-density
    components (overlays, compound keyboard, forms, data, canvas).
  - Tier B — secondary interaction flows for the next 14
    components (ContextMenu, Toast, Spotlight, Carousel, ScrollArea,
    Resizable, Collapsible, CommandPalette, Stepper, Toolbar,
    Calendar, NumberStepper, ColorPicker, Wizard).
  - Tier C / D — display-sweep axe coverage + cross-component
    integration flows (nested overlays, focus-restore chain,
    Escape unwind ordering, scroll-lock stacking, theme-switch
    while overlay open, portal z-order).

### Documentation

- README, this CHANGELOG, docs-site guides, and migration pages
  aligned with the shipping surface (component counts, bundle
  budgets, theme list, subpath exports, contributing link).
- ESLint rule documentation is aspirational at
  `daxavalon.github.io/voidframe-ui/eslint-plugin#<rule>`; each
  rule's message also links to its source file on GitHub so
  pre-deploy the URL still resolves.
- TSDoc backfill across the full public surface — every exported
  component, hook, and utility has a TSDoc block picked up by
  `docs/data/*.json`.
- `CONTRIBUTING.md` added with the full contributor workflow plus
  a dedicated section for AI coding assistants working in this
  codebase.
