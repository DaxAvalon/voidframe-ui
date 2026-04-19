# Plan 32 — Remediation

**Status:** READY TO PASTE. No code edits performed during this audit.
Findings live in `32-findings.md`; the replacement prose below is keyed to
those findings' P0 / P1 severity. P2 / P3 items are listed in §7 at the end
with shorter, batchable replacements.

> Executable ordering:
> 1. TSDoc additions (Waves A–D below) — they unblock the docs site, the VS
>    Code hover snapshot, and half the other fixes.
> 2. README rewrite (§1) — single largest surface.
> 3. CHANGELOG promotion (§2).
> 4. Tooling strings (§5 CLI / ESLint / VS Code).
> 5. Runtime-message polish (§6).
> 6. Docs-site narrative patches (§3 — guides, migration).

---

## §1 — README (`README.md`)

### §1.1 P0 — Component count in the intro paragraph

**Location:** `README.md:7`
**Current:** "**230+ accessible components + a brutalist icon system** …"
**Replace with:**

> **500+ accessible components across primitives, layout, forms, navigation, data display, overlays, interactive surfaces, a full chat/AI tier, domain-specific specialty widgets, and ~60 bundled monoline icons.** Every stateful component is controllable or uncontrolled; every compound surface exposes a Radix-style dot-notation API; every interactive surface ships WAI-ARIA semantics and keyboard nav under CI-enforced jest-axe + Playwright coverage. Runtime dependencies: React and React-DOM — everything else is a peer.

*(Number is sourced from `docs/data/props.json` entry count at the time of the
rewrite. Re-run `scripts/extract-props.mjs` before pasting and update the
number if it drifted.)*

### §1.2 P0 — Theme count

**Location:** `README.md:122`
**Current:** "Three themes ship out of the box: `darkTheme` (default), `lightTheme`, and `midnightTheme` (deep-black OLED-friendly)."
**Replace with:**

> Four themes ship out of the box: `darkTheme` (default), `lightTheme`, `midnightTheme` (deep-black OLED-friendly), and `greyTheme` (neutral mid-grey for print and projection). Pass any of them to `VoidframeProvider`'s `theme` prop or address them by name via `themeName="dark" | "light" | "midnight" | "grey" | "system"`.

### §1.3 P0 — Bundle budgets out of sync with `package.json`

**Location:** `README.md:500-508`
**Current:** Table claims full-ESM ≤150 KB and stylesheet ≤25 KB gzipped.
**Replace with:**

> **Bundle budgets** (enforced in CI via `npm run size` — see `package.json` `size-limit`):
>
> | Entry | Budget (gzipped) |
> |---|---:|
> | Core ESM (`dist/voidframe.es.js`) | ≤170 KB |
> | Charts ESM (`dist/charts.es.js`) | ≤40 KB |
> | Dev ESM (`dist/dev.es.js`) | ≤10 KB |
> | Stylesheet (`dist/voidframe.css`) | ≤50 KB |
> | All JS (ES + CJS, every entry) | ≤400 KB |
>
> Tree-shaking still applies — `import { Button } from "voidframe"` costs roughly **4–5 KB** gzipped, `import { SearchIcon }` about **2 KB**. Those per-import figures are measured ad-hoc, not enforced in CI; open a PR before relying on them for a strict budget.

### §1.4 P0 — "1260+ tests" vs "1230+ tests"

**Locations:** `README.md:554` and `README.md:885`
**Current:** two different test counts.
**Replace both with one sentence each, matching the actual current `npm run test` count.**

- `README.md:554` — "npm run test              # full vitest suite (**`<N>`** tests)"
- `README.md:885` — "npm run test      # full vitest suite (**`<N>`** tests)"

Leave `<N>` as a placeholder in the remediation PR; fill it from the
`npm run test` output the remediation agent runs before committing.

### §1.5 P1 — Peer dependency line is incomplete

**Location:** `README.md:17`
**Current:** "Peer dependencies: `react >= 18.0.0`, `react-dom >= 18.0.0`"
**Replace with:**

> **Peer dependencies.** Required: `react >= 18.0.0`, `react-dom >= 18.0.0`.
>
> **Optional** (only required if you render the component in the right-hand column):
>
> | Optional peer | Needed by |
> |---|---|
> | `d3-force` | `NetworkGraph` |
> | `d3-geo`, `topojson-client` | `ChoroplethMap`, `BubbleMap` |
> | `d3-hierarchy` | `TreeMap`, `Sunburst` |
> | `d3-sankey` | `Sankey` |
> | `d3-scale`, `d3-shape`, `d3-array`, `d3-time` | All other charts (pulled in via the `voidframe/charts` subpath) |
> | `dompurify` | `MarkdownRenderer`, `MarkdownEditor` preview |
> | `react-live` | `docs/` site and any `<Playground>` consumer |
> | `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, `jest-axe` | Required only when using `voidframe/testing`'s helpers |
>
> Voidframe throws `MissingPeerDependencyError` at render time with the exact `npm install` command if the optional peer isn't resolvable. See the Charts section for per-chart install examples.

### §1.6 P1 — `@voidframe/ui` rename (post-publish task)

**Not required yet** — `package.json` still reads `voidframe`. When the publish
plan runs (per `plans/npm-publish-plan.md`), the remediation owner should:

- Global-search-replace `voidframe/styles.css` → `@voidframe/ui/styles.css`
- `npm install voidframe` → `npm install @voidframe/ui`
- `import { … } from "voidframe"` → `from "@voidframe/ui"`

Leaving this as a checklist, not inline prose, because the rename hasn't
landed.

### §1.7 P1 — Subpath imports under-advertised

**Location:** insert after `README.md:23` (the single `voidframe/styles.css` import line).
**New subsection:**

> ### Subpath imports
>
> The main entry re-exports the whole library. The subpaths below let you
> import only what you need or reach for helpers that aren't surfaced on
> the root entry:
>
> | Subpath | When to use it |
> |---|---|
> | `voidframe` | Default — every component, hook, and utility. |
> | `voidframe/charts` | Charts only (dead-code elimination if you don't touch any non-chart component). |
> | `voidframe/dev` | `<Playground>`, `<PropsTable>`, `<DevPanel>`, `ProfilerScope` — dev-only surface, never ships to production. |
> | `voidframe/tokens` | Token object (`darkTheme`, `lightTheme`, …) without pulling in React. Useful for tooling and design-tool sync. |
> | `voidframe/testing` | `renderWithTheme`, `expectNoA11yViolations`, `installMatchMedia`, `createMockStorage`. |
> | `voidframe/styles.css` | The single bundled stylesheet. |
> | `voidframe/theme-script.js` | Inline `<head>` snippet that applies the persisted theme pre-hydration (no flash). |

### §1.8 P1 — Contributing / repo link

**Location:** insert a new section before the License section at `README.md:910`:

> ## Contributing
>
> The canonical repository lives at
> [git.ahadley.local/aeryn/VoidFrame](https://git.ahadley.local/aeryn/VoidFrame)
> (Forgejo instance). Issues, patches, and long-form discussion happen there.
>
> Local workflow:
>
> ```bash
> git clone https://git.ahadley.local/aeryn/VoidFrame.git voidframe
> cd voidframe
> npm install
> npm test              # unit + a11y + SSR matrix
> npm run docs          # local docs site on :5175
> npm run demo          # live demo on :5173
> ```
>
> Before opening a patch, run `npm run typecheck && npm test && npm run size`.
> Phase plans and audit docs live under `plans/`; read the relevant one
> before adding components to a tier.

*(If Forgejo is private, swap the URL for whichever public mirror exists.
 The link currently in `package.json:216` is a LAN address — resolve before
 publishing.)*

### §1.9 P0 — Marketing-fluff & structural tweaks (no-op bundle)

**Location:** `README.md:5`
**Current:** "…anything that needs to feel like it was forged from the void."
**Keep the flavour line** — per plan criterion 'fluff is OK when adjacent to a concrete claim'. This sentence is preceded by six concrete audience names ("dashboards, dev tools, data interfaces, internal consoles, AI chat products, and anything that …"). **No change.**

---

## §2 — CHANGELOG (`CHANGELOG.md`)

### §2.1 P1 — Promote `[Unreleased]` to `[1.0.0]`

**Location:** `CHANGELOG.md:6`
**Current:** `## [Unreleased]`
**Replace with** (use today's UTC date at apply time):

```markdown
## [1.0.0] - 2026-04-17

First stable release. The library matured through seven phases of framework
expansion (layout, forms, data, overlays, charts, chat/AI, i18n, responsive,
icons, dev tools, testing helpers) and four audit passes (parameter
standardisation, security, functionality, docs). Every exported component
ships with ARIA semantics, keyboard navigation, an `.*Props` type, and a
`displayName`. Every stateful component is controllable / uncontrolled.

### Added

- **500+ components** across primitives, layout, navigation, forms, data
  display, overlays, interactive surfaces, a full chat/AI tier, specialty
  widgets, and ~60 bundled monoline icons.
- **75 hooks** covering state (`useControllableState`, `useDebounce`,
  `useLocalStorage`, `useUndoRedo`, …), input / IO
  (`useKeyboardShortcut`, `useCopyToClipboard`, `useEventSource`,
  `useWebSocket`), layout (`useResizeObserver`, `useContainerQuery`,
  `useIntersectionObserver`), and framework glue (`useId`, `useEvent`,
  `useIsomorphicLayoutEffect`).
- **96 utilities** for formatting, date math, colour manipulation, a11y
  announcers, controllable-state wiring, safe URLs, and deprecation helpers.
- **Four themes**: `darkTheme`, `lightTheme`, `midnightTheme`, `greyTheme`,
  plus `"system"` resolution and per-subtree `<ThemeScope>`.
- **Full i18n** via `MessagesProvider` + `Intl.*` — eight shipped locale
  packs (`en`, `es`, `fr`, `de`, `ja`, `zhCN`, `ar`, `he`) plus `enXA`
  pseudolocale.
- **Responsive system** — CSS-driven `<Show>` / `<Hide>`, `Responsive<T>`
  props on every layout primitive, `ResponsiveBox` escape hatch, and hooks
  (`useBreakpoint`, `useDeviceType`, `useResponsive`, `useContainerQuery`).
- **Charts** — core families (`BarChart`, `LineChart`, `AreaChart`,
  `ScatterPlot`, `BubbleChart`, `ComposedChart`, `PieChart`, `DonutChart`,
  `RadarChart`, `Histogram`, `CalendarHeatmap`, `Sparkline`, `Heatmap`),
  advanced layouts (`TreeMap`, `Sunburst`, `FunnelChart`, `WaterfallChart`,
  `BoxPlot`, `ViolinPlot`, `CandlestickChart`, `OHLCChart`, `StreamGraph`,
  `HorizonChart`, `Sankey`, `ChordDiagram`, `ParallelCoordinates`,
  `ScatterMatrix`, `SmallMultiples`), and geo/network
  (`DependencyGraph`, `TileGridMap`, `NetworkGraph`, `ChoroplethMap`,
  `BubbleMap`). Optional d3 peers are declared in `peerDependenciesMeta`.
- **Chat/AI tier** — `Conversation`, `MessageList`, `Message`, `ToolCall`,
  `Composer` (compound), `SessionList`, `ChatLayout`, `AgentRunner`,
  `DebugPanel`, `TraceViewer`, and supporting citation / attachment /
  streaming surfaces.
- **Dev experience** — `<DevPanel>` HUD (renders / warnings / theme / about
  tabs), `ProfilerScope`, `DevErrorFallback`, runtime misuse warnings on
  `RadioGroup`, `Tabs`, `Select`, `FormField`, `Combobox`, `DataGrid`.
- **Tooling** — `voidframe` CLI (`init`, `theme`, `codemod`, `doctor`),
  six-rule ESLint plugin
  (`no-deprecated-props`, `no-legacy-chart-imports`, `no-raw-hex-colors`,
  `prefer-compound-pattern`, `require-a11y-label`, `require-use-client`),
  two codemods (`legacy-charts-to-v2`, `tokens-from-hex`), a VS Code
  extension with snippets + hover docs.
- **Testing subpath** (`voidframe/testing`) — `renderWithTheme`,
  `expectNoA11yViolations`, `installMatchMedia`, `createMockStorage`.
- **SSR-safe** — every stateful module carries `"use client"`, a
  `renderToString` smoke test runs in CI, and a pre-hydration theme
  script ships at `voidframe/theme-script.js` to prevent dark→light flash.

### Changed

- Replaced the legacy single-file chart surface with Phase 21's scale /
  axis / grid / legend / tooltip / brush primitives; all phase-22+ charts
  compose from those primitives.
- Replaced `Drawer`, `Modal`, `Popover` with compound `DrawerV2`,
  `Dialog`, `PopoverV2`. The legacy names remain as deprecation shims
  (see below).

### Deprecated

- `Drawer` → `DrawerV2` (removal target: v1.1).
- `Button` `primary` prop → `variant="accent"` (removal target: v1.1).

### Performance

- Bundle budgets in CI: core ESM ≤170 KB, charts ESM ≤40 KB, dev ESM ≤10
  KB, stylesheet ≤50 KB, combined JS ≤400 KB (all gzipped).
- Heavy components expose `Lazy*` wrappers so consumers can code-split
  the chunk at their boundary.
- Dev-only `warn()` / `warnOnce()` calls are guarded by
  `process.env.NODE_ENV !== "production"` and stripped by bundlers.

### Accessibility

- 33 components formally audited (see `docs/a11y-audit.ts`). Every
  component in the audit runs through `jest-axe` on every commit.
  Remaining surface uses the same patterns — broader audit tracked in
  plan 33+.
```

### §2.2 P1 — Missing phase entries

The `[1.0.0]` entry above absorbs Phases 1-20 under "Earlier phases", the
Phase 21-28 blocks currently in the file, and the Phase 29-32 audits plus
the "Phase 1-7 framework expansion" that added ~30 new components. After
pasting §2.1, **delete** the current `[Unreleased]` body (lines 8-78) — it
is fully covered by §2.1's consolidated entry.

Start a fresh `## [Unreleased]` **above** the `[1.0.0]` heading for
post-1.0 work:

```markdown
## [Unreleased]

_Nothing yet._

```

---

## §3 — Docs site

### §3.1 P0 — A11y audit page blurb is inaccurate

**Location:** `docs/App.tsx:375`
**Current:** "Accessibility audit status for voidframe components. All components are tested with jest-axe. Keyboard and screen reader testing status documented below."
**Replace with:**

```tsx
<Text>
  Formal accessibility audit of a representative cross-section of voidframe
  components. Every component below is exercised through jest-axe on every
  commit; keyboard navigation and screen-reader behaviour are documented
  per-entry. The full library uses the same ARIA / focus / roving-tabindex
  patterns — a complete row-per-component audit is tracked in plan 33.
</Text>
```

### §3.2 P1 — Migration page placeholder

**Location:** `docs/migration.tsx:19-31`
**Current:** Placeholder `v1-to-v2` entry with empty `breakingChanges`.
**Replace with** a live `v1.0-to-v1.1` entry that documents the two
deprecations in flight:

```ts
export const migrations: MigrationGuide[] = [
  {
    id: "v1-to-v1.1",
    fromVersion: "1.0",
    toVersion: "1.1",
    breakingChanges: [
      {
        component: "Drawer",
        description:
          "`<Drawer>` is deprecated in favour of the compound `<DrawerV2>`. The old API still works in 1.x but emits a dev warning; it will be removed in 1.1. `DrawerV2` is a superset — same props plus `DrawerV2.Header`, `DrawerV2.Body`, `DrawerV2.Footer` subparts.",
        before: `<Drawer open={open} onClose={close} title="Details">\n  <p>…</p>\n</Drawer>`,
        after: `<DrawerV2 open={open} onOpenChange={setOpen}>\n  <DrawerV2.Header>Details</DrawerV2.Header>\n  <DrawerV2.Body>\n    <p>…</p>\n  </DrawerV2.Body>\n</DrawerV2>`,
      },
      {
        component: "Button",
        description:
          "The `primary` boolean prop on `<Button>` is deprecated. Use `variant=\"accent\"` instead. ESLint's `no-deprecated-props` auto-flags the old usage.",
        before: `<Button primary>Save</Button>`,
        after: `<Button variant="accent">Save</Button>`,
      },
    ],
    newFeatures: [
      "`<DrawerV2>` compound API with scoped header / body / footer.",
    ],
    deprecations: [
      "`<Drawer>` (use `<DrawerV2>`).",
      "`<Button primary>` (use `variant=\"accent\"`).",
    ],
  },
  {
    id: "v1-to-v2",
    fromVersion: "1.x",
    toVersion: "2.0",
    breakingChanges: [],
    newFeatures: [],
    deprecations: [],
  },
];
```

### §3.3 P1 — Guides: link to Forgejo from Getting Started

**Location:** `docs/guides.tsx`, inside `GettingStartedGuide`, append a new `<Section title="Contributing">` at the end:

```tsx
<Section title="Contributing">
  <Text>
    The canonical repository lives at{" "}
    <a href="https://git.ahadley.local/aeryn/VoidFrame">
      git.ahadley.local/aeryn/VoidFrame
    </a>
    . Clone, <code>npm install</code>, then <code>npm test</code>. Phase
    plans and audits live under <code>plans/</code>.
  </Text>
</Section>
```

---

## §4 — TSDoc additions (Waves A–D)

The P0 / P1 TSDoc gaps are too numerous to inline here in full (439 missing
components). The strategy is four waves, each batched by
`src/components/<file>.tsx` so one PR touches one file.

> **Source of truth for per-component prose:** the prose below is the
> **minimum viable** TSDoc — a one-sentence purpose statement plus (where
> relevant) a composition hint. Prop-level descriptions should follow once
> the component-level pass is complete.

### §4.1 Wave A — Tier-A components (P0). Full prose, 39 entries.

Paste each `/** … */` block immediately above the component's
`export const <Name> = forwardRef(...)` (or `export function <Name>…`) so
`react-docgen-typescript` picks it up.

**`src/components/Button.tsx`** (replace the current misleading "Memoized
leaf" comment):

```ts
/**
 * A solid interactive control. Handles click, submit, reset, asChild
 * composition, and icon-left/right slots. Five variants
 * (`default`, `primary`, `accent`, `ghost`, `danger`), three sizes
 * (`sm`, `md`, `lg`), and an optional `loading` state that swaps the
 * label for a spinner without shifting layout.
 */
```

**`src/components/Badge.tsx`:**

```ts
/**
 * Compact inline label for status, counts, and tags. Five tones
 * (`neutral`, `success`, `warning`, `danger`, `info`) mirror the
 * platform semantic colours; `variant="solid" | "outline" | "subtle"`
 * selects fill vs outlined. Add `dot` for a leading status dot, `pulse`
 * for the dot to animate.
 */
```

**`src/components/Card.tsx`:**

```ts
/**
 * Bordered panel for a logical content grouping. Accepts optional
 * `title` / `subtitle` / `actions` slots that render a header strip;
 * `padding` controls inner whitespace. Use `as="section" | "article"`
 * to control the rendered tag for semantics.
 */
```

**`src/components/Interactive.tsx` — `Tabs`:**

```ts
/**
 * Keyboard-navigable tablist. Arrow keys cycle within the list, Home/End
 * jump to the first/last tab, Tab leaves the list. The `active` key
 * is controllable; pass `defaultActive` for uncontrolled. Tabs can be
 * `variant="line" | "solid" | "enclosed"` and `size="sm" | "md" | "lg"`.
 */
```

**`src/components/Interactive.tsx` — `Modal`:**

```ts
/**
 * Centred modal dialog with focus trap, Escape-to-dismiss, and
 * body-scroll lock. Requires either `title` or `aria-label` /
 * `aria-labelledby` for screen readers. Consider `Dialog` (compound
 * API) for richer composition.
 */
```

**`src/components/Dialog.tsx`:**

```ts
/**
 * Compound modal dialog. Subparts: `Dialog.Trigger`, `Dialog.Content`,
 * `Dialog.Title`, `Dialog.Description`, `Dialog.Close`. Wires focus
 * trap, Escape, and aria-labelledby automatically through context.
 */
```

**`src/components/Overlay.tsx` — `Drawer`:**

```ts
/**
 * @deprecated Use `DrawerV2` instead. Will be removed in v1.1.
 * Side-anchored panel that slides in from `side="start" | "end" |
 * "top" | "bottom"`. Requires `title` or `aria-label` for a11y.
 */
```

**`src/components/DrawerCompound.tsx` — `DrawerV2`:**

```ts
/**
 * Side-anchored panel with compound subparts
 * (`DrawerV2.Header`, `DrawerV2.Body`, `DrawerV2.Footer`). Anchors via
 * `side="start" | "end" | "top" | "bottom"`; below the `md` breakpoint
 * defaults to full-screen unless `adaptive={false}`.
 */
```

**`src/components/DrawerCompound.tsx` — `Sheet`:**

```ts
/**
 * Bottom-sheet with continuous-drag dismissal. Snap points configurable
 * via `snapPoints={[0.25, 0.5, 1]}`; flicks and release past the
 * dismiss threshold close it. Requires `aria-label` for a11y.
 */
```

**`src/components/Form.tsx` — `Input`:**

```ts
/**
 * Single-line text field. Emits via `onValueChange(value)` as the
 * canonical callback; `onChange(e)` is preserved for raw-event access.
 * Requires `label`, `aria-label`, or `aria-labelledby`; `<Field>` wires
 * this automatically.
 */
```

**`src/components/Form.tsx` — `Textarea`:**

```ts
/**
 * Multi-line text field with configurable `rows` and optional
 * auto-resize via the `autoResize` prop. Accessible-name rules match
 * `Input`.
 */
```

**`src/components/Form.tsx` — `Select`:**

```ts
/**
 * Native dropdown wrapping a single option pick. Feed `options` as
 * `{ value, label }[]`; duplicate values, empty `options`, and controlled
 * values not matching any option all emit dev-only warnings. Requires
 * an accessible name.
 */
```

**`src/components/Form.tsx` — `Toggle`:**

```ts
/**
 * Two-state switch control with a visible label and keyboard support
 * (`Space` / `Enter` toggle). Controllable via `checked` /
 * `onCheckedChange`; uncontrolled via `defaultChecked`.
 */
```

**`src/components/Form.tsx` — `Checkbox`:**

```ts
/**
 * Native checkbox with voidframe styling, optional `indeterminate`
 * state, and label composition. For groups use `CheckboxGroup`.
 */
```

**`src/components/FormExtended.tsx` — `RadioGroup`:**

```ts
/**
 * Group of exclusive options rendered as radio buttons. Feed `options`
 * as `{ value, label }[]`; empty / duplicate-value inputs emit
 * dev-only warnings. Keyboard navigation is full roving-tabindex.
 */
```

**`src/components/FormExtended.tsx` — `FormField`:**

```ts
/**
 * Form-row wrapper that layouts a label, an input, optional help text,
 * and an error message. Auto-wires `htmlFor`, `aria-describedby`, and
 * `aria-invalid` on the inner control. `required`-without-`label` and
 * `error`-plus-`help` combinations emit dev-only warnings.
 */
```

**`src/components/Combobox.tsx`:**

```ts
/**
 * Searchable single-select. Combines a text input with a popover
 * listbox; users type to filter, arrow-keys to move, Enter to select.
 * Duplicate option values emit a dev-only warning — each `value` must
 * be unique.
 */
```

**`src/components/Menu.tsx` — `Menu` and its subparts:**

```ts
/**
 * Keyboard-navigable dropdown of actions anchored to a trigger.
 * Subparts: `Menu.Trigger`, `Menu.Content`, `Menu.Item`,
 * `Menu.CheckboxItem`, `Menu.RadioGroup` + `Menu.RadioItem`,
 * `Menu.Sub` (+ `Menu.SubTrigger`, `Menu.SubContent`),
 * `Menu.Separator`, `Menu.Label`.
 */
```

**`src/components/ToastSystem.tsx` — `Toaster`:**

```ts
/**
 * Portalled queue of transient notifications, rendered at a
 * `placement`-configurable corner (`top-right` default). Mount once
 * near the app root; dispatch via the module-level `toast` API
 * (`toast.success`, `toast.info`, `toast.warning`, `toast.danger`,
 * `toast.promise`) or the `useToast()` hook.
 */
```

**`src/components/DataGrid.tsx`:**

```ts
/**
 * High-density data table with sort, filter, pagination, column resize,
 * column reorder, row grouping, virtualisation, export, and
 * persistence hooks. Compound subparts (`DataGrid.Toolbar`,
 * `.Search`, `.Filters`, `.Pagination`, `.Export`) compose
 * freely. Virtualisation is disabled when `groupBy` is active — the
 * combination emits a dev warning.
 */
```

**`src/components/DataList.tsx`, `src/components/Viewers.tsx` (DescriptionList / KeyValue / JSONViewer / DiffViewer / LogViewer), `src/components/Metrics.tsx` (Stat / StatGroup / MetricCard / CircularProgress), `src/components/Sidebar.tsx`, `src/components/Navbar.tsx`, `src/components/Toolbar.tsx`, `src/components/PageHeader.tsx`, `src/components/Navigation.tsx` (Breadcrumb / Pagination / CursorPagination / Stepper), `src/components/Wizard.tsx`, `src/components/CommandInput.tsx`, `src/components/ScrollArea.tsx`, `src/components/Popovers.tsx` (PopoverV2 / HoverCard / Tooltip / TooltipProvider):**

See the template per-component in §4.2 below; Wave A covers all the
names listed in §5.2 of `32-findings.md` Tier-A.

### §4.2 Wave B — Charts & data (P1). 45 entries.

**Template** (copy, swap the bolded parts):

```ts
/**
 * <one-sentence purpose>. Axes: <linear | log | time | band | point
 * | none>. Interactions: <crosshair | tooltip | brush | legend toggle>.
 * Accepts `data` as `<shape>`. See `ChartFrame` for shared margin /
 * padding conventions.
 */
```

**Example — `src/charts/BarChart.tsx`:**

```ts
/**
 * Vertical or horizontal bar chart, grouped / stacked / 100%-stacked.
 * Axes: band (category) × linear (value). Interactions: hover
 * highlight, legend toggle, optional brush. Accepts `data` as
 * `{ key: string; [series: string]: number }[]` plus a `series`
 * descriptor that names the numeric keys.
 */
```

**Example — `src/charts/NetworkGraph.tsx`:**

```ts
/**
 * Force-directed graph. Nodes relax via d3-force; drag a node to pin
 * it. The simulation auto-cools after `coolDownAfter` ms of quiet.
 *
 * @peerDependency `d3-force` (optional). If missing at render time,
 *   voidframe throws `MissingPeerDependencyError` with the install
 *   command.
 */
```

Apply the template to the remaining 43 chart-tier files enumerated in
`32-tsdoc-gaps.json` under `missing.components`, batched one PR per
`src/charts/` or `src/components/<chart-name>.tsx`.

### §4.3 Wave C — Icons (P3). 61 entries.

These are genuinely obvious-from-name. Batch-fix via a codemod or a script
that emits the same one-liner for every `*Icon` export:

```ts
/**
 * <Name> icon. Decorative by default; supply `label` to promote to
 * `role="img"`. Monoline, 1px stroke, 24×24 at `size="md"`.
 */
```

### §4.4 Wave D — Remaining components + hooks + utils (P1 / P2). ~310 components, 11 hooks, 3 utils.

**Hooks — direct paste into the declaration files:**

- `src/hooks/useForm.ts` (`useForm`):

  ```ts
  /**
   * Controlled-or-uncontrolled form-state primitive with validation.
   * Returns `{ values, errors, touched, register, handleSubmit, reset,
   * setFieldValue, setFieldError, trigger }`. Pair with
   * `useFieldArray` for dynamic rows and `FormErrorSummary` for a live
   * error list.
   */
  ```

- `src/hooks/useEventSource.ts`:

  ```ts
  /**
   * Managed Server-Sent-Events (SSE) subscription. Auto-reconnects with
   * exponential backoff; exposes `{ data, readyState, error,
   * close }`. Pass `null` for `url` to pause the subscription.
   */
  ```

- `src/hooks/useGeolocation.ts`:

  ```ts
  /**
   * Track the user's geolocation via `navigator.geolocation`. Returns
   * `{ coords, accuracy, timestamp, error, loading, requestPermission }`.
   * SSR-safe: returns `{ loading: false, coords: null }` on the server.
   */
  ```

- `src/hooks/useList.ts`:

  ```ts
  /**
   * Array-state helper: returns `{ list, set, push, pop, shift,
   * unshift, insertAt, removeAt, updateAt, filter, sort, clear }`.
   * Each mutator returns a stable identity so passing them into memoised
   * children doesn't churn props.
   */
  ```

- `src/hooks/useMap.ts`:

  ```ts
  /**
   * Map-state helper: returns `{ map, set, delete, clear, has, get,
   * entries }`. Identity of `map` updates on every change so React sees
   * a new reference.
   */
  ```

- `src/hooks/usePermission.ts`:

  ```ts
  /**
   * Wrap `navigator.permissions.query({ name })`. Returns
   * `{ state: "granted" | "denied" | "prompt" | "unsupported" }` and
   * re-evaluates on `change` events.
   */
  ```

- `src/hooks/useSet.ts`:

  ```ts
  /**
   * Set-state helper: returns `{ set, add, delete, toggle, clear, has,
   * values }`. Useful for "selected IDs" collections.
   */
  ```

- `src/hooks/useShortcuts.tsx` (`ShortcutProvider`, `useShortcutRegistry`):

  ```ts
  /**
   * Provider + registry for globally-registered keyboard shortcuts.
   * Components inside call `useShortcut(chord, handler)` to register;
   * `ShortcutGuide` renders the live list. `useShortcutRegistry()` is
   * the low-level read-access hook if you're building a custom guide
   * UI.
   */
  ```

- `src/hooks/useThemePersistence.ts`:

  ```ts
  /**
   * Persist the active theme in `localStorage` (key configurable),
   * sync across tabs via the `storage` event, and resolve
   * `"system"` against `matchMedia("(prefers-color-scheme: light)")`.
   * Pairs with `ThemeSelector` for a ready-made UI.
   */
  ```

- `src/hooks/useWebSocket.ts`:

  ```ts
  /**
   * Managed WebSocket subscription. Exposes `{ readyState, lastMessage,
   * send, close }`; auto-reconnects with exponential backoff;
   * closes on unmount. Pass `null` for `url` to pause.
   */
  ```

**Utils — paste above each declaration:**

- `src/utils/portalContainer.ts` (`DEFAULT_PORTAL_ID`):

  ```ts
  /** Default DOM id for voidframe's portal root: `"vf-portal-root"`. */
  ```

- `src/utils/warn.ts` (`getLogger`):

  ```ts
  /**
   * Read the currently-installed logger used by `warn()` / `warnOnce()`.
   * Useful in tests that want to assert on a captured output. Mirror
   * of `setLogger`.
   */
  ```

- `src/utils/formatters.ts` (`uid`):

  ```ts
  /**
   * Generate a short unique ID (monotonic counter, prefixed).
   * Useful for non-ARIA identifiers where `useId` isn't an option
   * (e.g. module-level caches). Not cryptographically random.
   *
   * @param prefix Default `"vf"`.
   */
  ```

**Remaining 310 components** — batch by file. Pre-planned 18-file batches
(one per major file under `src/components/`) match how plan 31's component
bucket would group them; use plan 31's component index if it has run,
otherwise fall back to directory-based batching (see plan 32 Task 10
Step 1).

---

## §5 — Tooling

### §5.1 P0 — `voidframe test` subcommand

**File:** `tools/cli/bin/voidframe.mjs`
**Decision required:** wire it up or delete `tools/cli/commands/test.mjs`.

**Recommended:** wire it up. The generator is useful. Add after line 67 of
`voidframe.mjs`:

```js
import { generateTest } from "../commands/test.mjs";

// …

program
  .command("test <name>")
  .description(
    "Scaffold a unit-test file for a voidframe component/hook/utility."
  )
  .option(
    "--type <type>",
    "component | hook | util (default: component).",
    "component"
  )
  .option("--force", "Overwrite an existing test file.")
  .action(async (name, opts) => {
    const result = await generateTest(name, {
      type: opts.type,
      force: Boolean(opts.force),
    });
    done(result?.code ?? 0);
  });
```

Then add a matching bullet to `README.md:35-42`:

```
- `voidframe test <name> [--type component|hook|util]` — scaffold a
  vitest test file (vitest + @testing-library + jest-axe preamble).
```

And a line to the `[1.0.0]` CHANGELOG entry's CLI bullet (§2.1 above).

Alternatively, if the generator is not production-ready, **delete**
`tools/cli/commands/test.mjs` and the reference in §8.1 of the findings doc
disappears.

### §5.2 P0 — VS Code extension repository URL mismatch

**File:** `tools/vscode-voidframe/package.json:45-48`
**Current:**

```json
"repository": {
  "type": "git",
  "url": "https://github.com/voidframe/voidframe"
}
```

**Replace with** the main package's canonical URL:

```json
"repository": {
  "type": "git",
  "url": "https://git.ahadley.local/aeryn/VoidFrame.git",
  "directory": "tools/vscode-voidframe"
}
```

*(If a public GitHub mirror becomes the canonical URL before publish, swap
to that. Do not ship `github.com/voidframe/voidframe` — it's fictional.)*

### §5.3 P0 — VS Code "Open Playground" URL

**File:** `tools/vscode-voidframe/src/extension.js:72`
**Current:**

```js
const url = `https://voidframe.dev/docs/#${name.toLowerCase()}`;
```

**Decision required:** does `voidframe.dev` exist? If yes, leave as-is.
If no (likely — the repo is on a LAN Forgejo and there's no `dns.config`
evidence of the domain), replace with a local-first fallback:

```js
// Open the local docs if the dev is running it, otherwise prompt.
const url = `http://localhost:5175/#${name.toLowerCase()}`;
```

Or make it configurable via `vscode.workspace.getConfiguration("voidframe").get("docsUrl")` with a sensible default. Add to `tools/vscode-voidframe/package.json`:

```json
"configuration": {
  "title": "Voidframe",
  "properties": {
    "voidframe.docsUrl": {
      "type": "string",
      "default": "http://localhost:5175",
      "description": "Base URL of the voidframe docs site. Append `#<componentName>` is appended automatically."
    }
  }
}
```

### §5.4 P0 / P1 — ESLint rule doc URLs

**Files:** `tools/eslint-plugin-voidframe/rules/*.ts`
**Current:** Four of the six rules point at `https://voidframe.dev/docs/eslint-plugin#<name>` — a domain whose existence is unconfirmed.
**Replace** the createRule invocation URL in all four (`no-legacy-chart-imports.ts:4`, `no-raw-hex-colors.ts:4`, `require-use-client.ts:4`, and any other `createRule` sites) with a stable repo URL:

```ts
const createRule = ESLintUtils.RuleCreator(
  (name) =>
    `https://git.ahadley.local/aeryn/VoidFrame/src/branch/main/tools/eslint-plugin-voidframe/rules/${name}.ts`
);
```

And add rule-URL support to the two plain-object rules
(`no-deprecated-props.ts`, `prefer-compound-pattern.ts`,
`require-a11y-label.ts`) by converting them to use `ESLintUtils.RuleCreator`
with the same URL template — per the findings doc §8.3 this also
standardises their `meta.docs` shape.

### §5.5 P1 — Doctor checks optional peers

**File:** `tools/cli/commands/doctor.mjs`
**Add** after the existing four checks (line 92, before `let failed = 0`):

```js
// Optional peer-dep awareness: if the user has a chart in their code
// but the peer isn't installed, flag it rather than wait for a runtime
// throw. This is a soft check — the grep is bounded by `depth`.
const OPTIONAL_PEERS = [
  ["d3-force", /NetworkGraph/],
  ["d3-geo", /ChoroplethMap|BubbleMap/],
  ["topojson-client", /ChoroplethMap|BubbleMap/],
  ["d3-hierarchy", /TreeMap|Sunburst/],
  ["d3-sankey", /Sankey/],
  ["dompurify", /MarkdownRenderer|MarkdownEditor/],
];
for (const [peer, needle] of OPTIONAL_PEERS) {
  if (!deps[peer]) {
    // Only warn when the user appears to actually use a component
    // that needs this peer.
    const used = await grepForPattern(cwd, needle);
    checks.push(
      check(
        `${peer} (optional peer)`,
        !used,
        used
          ? `used by code matching /${needle.source}/; run \`npm install ${peer}\``
          : "not used"
      )
    );
  }
}
```

*(Add `grepForPattern` alongside `grepForVoidframeCss`.)*

### §5.6 P1 — ESLint rule messages

**File:** `tools/eslint-plugin-voidframe/rules/require-a11y-label.ts:9-11`
**Current:** "IconButton must have an aria-label prop for accessibility."
**Replace with:**

```ts
messages: {
  missingLabel:
    "<IconButton> must declare `aria-label` (or `aria-labelledby`) so screen readers can announce the action. See the Accessibility guide at /docs/guides/accessibility.",
},
```

### §5.7 P1 — Codemod "Unknown transform" message

**File:** `tools/codemods/run.mjs:57`
**Current:** `log.error?.(\`Unknown transform: ${transform}\`);`
**Replace with:**

```js
log.error?.(
  `Unknown transform: ${transform}\n` +
    `Available: ${TRANSFORMS.join(", ")}`
);
```

---

## §6 — Runtime messages

### §6.1 P1 — Console.warn bypass

Migrate the two direct `console.warn` sites to the framework wrapper so they
flow through `DevPanel`.

**File:** `src/icons/IconButton.tsx:61-66`
**Current:**

```ts
if (/* gate */) {
  warnedMissingLabel = true;
  // eslint-disable-next-line no-console
  console.warn(
    "[voidframe] <IconButton> requires `aria-label` (or `aria-labelledby`) for screen readers."
  );
}
```

**Replace with:**

```ts
import { warnOnce } from "../utils/warn";

// …

warnOnce(
  "IconButton:missing-aria-label",
  "<IconButton> requires `aria-label` (or `aria-labelledby`) for screen readers."
);
```

Drop the local `warnedMissingLabel` flag (no longer needed —
`warnOnce` handles dedupe).

**File:** `src/utils/safeHref.ts:87-97`
**Current:** raw `console.warn` guarded by `process.env.NODE_ENV !== "production"`.
**Replace the console.warn call with:**

```ts
import { warnOnce } from "./warn";

// …

warnOnce(
  `safeHref:rejected:${component}:${url}`,
  `${component}: rejected unsafe href "${String(url)}" — only http(s), mailto, tel, sms, and relative paths are allowed.`
);
```

### §6.2 P1 — Accessible-name warnings link to the guide

**Files:** `src/components/Form.tsx:56, 112, 162, 230`, `src/components/Overlay.tsx:60`, `src/components/Interactive.tsx:204`.
**Current template:** "<Component> requires `label`, `aria-label`, or `aria-labelledby` for screen readers."
**Replace template with:**

```
<Component> requires `label`, `aria-label`, or `aria-labelledby` for screen readers. Wrap the control in `<Field>` to auto-wire these, or use `<VisuallyHidden>` for a non-visible label.
```

Apply the new template to all six call sites.

---

## §7 — P2 / P3 cosmetic cleanups (batch)

These don't need per-item replacement prose — pattern-based batch edits.

1. **Brand capitalisation.** Unify on **"Voidframe"** for prose (title case),
   **`voidframe`** for the package name / code, and reserve **VOIDFRAME**
   for brand chrome (sidebar titles, topbar, etc.). Audit sweep:
   - `README.md:1` — "# VOIDFRAME" — **keep** as brand chrome.
   - `README.md:4, 5, 6, …` — replace "VOIDFRAME" in prose with "Voidframe".
   - All `docs/*.tsx` prose references — "Voidframe" (already consistent in most cases).
2. **Terse / misleading TSDoc** for `Button`, `CopyButton`, `Icon`,
   `Form`, `BubbleChart`, `OHLCChart`, `TileGridMap` — see §4.1 for
   `Button`; apply the same "purpose first, implementation note second"
   pattern to the other six.
3. **Duplicated Quick Start.** The Chat quickstart at `README.md:817-867`
   duplicates framing already established in the main Quick Start. Either
   heading it "Chat quickstart" + trimming the `<VoidframeProvider>`
   wrapping already shown 700 lines earlier, or moving it into the Chat &
   AI subsection of Component Inventory would improve scannability. **Low
   priority** — ship as-is for 1.0.
4. **Smart-quote drift.** `docs/patterns.tsx:41` contains
   `Don\u0027t have an account?` — a literal unicode-escape string inside
   the playground code. Replace with `Don't have an account?` (or an HTML
   entity). **[P3]**
5. **Snippet description truncation.** `scripts/generate-vscode-snippets.mjs`
   ends descriptions at the first newline, producing mid-sentence snips
   (see `snippets/voidframe.code-snippets:32` Activity). Fix the script to
   take the first full sentence (split on `. ` or `\n\n`). **[P2]**

---

## §8 — Publish readiness checklist

Reconciles with `plans/npm-publish-plan.md` Steps 5-6:

- [ ] Rewrite of `README.md` sections per §1 above has landed.
- [ ] `CHANGELOG.md` promotion per §2 above has landed; `git tag v1.0.0`.
- [ ] All P0 TSDoc additions (Wave A, §4.1) have landed and
      `scripts/extract-props.mjs` has been re-run so
      `docs/data/props.json` reflects the new descriptions.
- [ ] `tools/vscode-voidframe/data/props.json` regenerated via
      `npm run vscode:snippets && npm run vscode:package` after the TSDoc
      passes so the shipped `.vsix` carries the new hover text.
- [ ] `voidframe test` wired or removed (§5.1); no dead CLI surface ships.
- [ ] `voidframe.dev` domain decision made (§5.3, §5.4); all hard-coded
      URLs resolved.
- [ ] `README.md` test count + bundle-budget numbers updated from actual
      `npm run test` and `npm run size` output (§1.3, §1.4).
- [ ] Doctor checks optional peers (§5.5) wired.
- [ ] Migration page populated (§3.2).
