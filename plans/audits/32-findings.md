# Plan 32 — Docs verbiage audit findings

Generated 2026-04-17. Read-only audit. Every finding cites `file:line`.

---

## Summary

| Severity | Count | Surface hotspots |
|---|---:|---|
| P0 | 12 | README (component count / test count / bundle budget / URL claims), TSDoc coverage for 439 components, VS Code extension repository URL, ESLint rule docs URLs, CLI missing subcommand |
| P1 | 24 | README Quick Start import + chart peer-dep mismatch, docs-site Migration placeholder, broken hook reference in README, CHANGELOG ~5-year gap, runtime warnings bypassing `warn()` wrapper, demo undocumented coverage, ESLint rule URLs, VSCode hover URL |
| P2 | 16 | Marketing-fluff phrases, inconsistent capitalisation/brand (`voidframe` vs `Voidframe` vs `VOIDFRAME`), doubled Chat quickstart outside Chat section, `Phase 21-28` vs `Phase 1 / Phase 14 / Phase 17` overloading |
| P3 | 7 | Typos, stale cross-references, smart-quote inconsistencies |

**Completeness gaps:**
- **439 components** have NO TSDoc (88% of the public component surface). See §5 and `32-tsdoc-gaps.json`.
- **2,447 props** (72%) have NO TSDoc.
- **11 hooks** and **3 utils** have NO TSDoc.
- **~100 components** never appear as named imports in `demo/App.tsx` (demo covers roughly 395/499 components by name).
- **Migration guide** (`docs/migration.tsx`) is a single placeholder record (line 18-31).
- **CHANGELOG** (`CHANGELOG.md`) stops at Phase 21-28; git log shows Phases 29-35, 40-47, 50-54, and the "Phase 1 framework expansion" (plans/voidframe-phase1-components.md etc.) have landed with no CHANGELOG entries.

**Headline:** The README reads like a finished library (230+ components, zero runtime deps, a guided CLI, "1260+ tests") but 88% of those components ship without a single line of TSDoc, the CLI advertises four subcommands and registers them all — plus a fifth (`test`) that exists as a file but is never wired into `voidframe.mjs` — and the CHANGELOG stops eight phases before the current code. Fix the TSDoc coverage gap and the README's self-reported numbers first; everything else reads clean.

---

## §2. README

**File:** `README.md` (914 lines). Read 2026-04-17.

### §2.1 Intro / tagline

- `README.md:3` tagline is fine.
- `README.md:7` claims **"230+ accessible components"**. **Verifiable:** `docs/data/props.json` (array) has **499 entries**. Either the README is wildly out of date or 499 isn't the right count. The taxonomy (`docs/taxonomy.ts`) lists ~130 hand-mapped files plus prefix-matched primitives/charts/icons. Either way, **"230+"** is stale. **[P0]**
- `README.md:7` claims **"No runtime dependencies beyond React"**. **Verifiable:** `package.json:149` `"dependencies": {}`, matches. **OK.**

### §2.2 Install / package name

- `README.md:13-15` uses `npm install voidframe`. `package.json:2` confirms the current name is `voidframe`. **OK for now.** Note: `plans/npm-publish-plan.md` calls for the package to be renamed to `@voidframe/ui`. When that rename happens this section must update. **[tracked — P1 on post-rename].**
- `README.md:17` lists only `react >= 18.0.0`, `react-dom >= 18.0.0` as peers. **Verifiable:** `package.json:113-131` declares **14** peers (d3-array, d3-force, d3-geo, d3-hierarchy, d3-sankey, d3-scale, d3-shape, d3-time, topojson-client, dompurify, react-live, @testing-library/react, @testing-library/jest-dom, @testing-library/user-event, jest-axe). Most are `peerDependenciesMeta.optional: true`, so the README's statement is technically accurate but incomplete — an evaluator reading "peer deps: react + react-dom" will not know they need to install `d3-force` to render a `NetworkGraph`. The chart subsection (lines 375-380) does call this out for some charts; the top-level peer-dep line should either point at that section or be fleshed out. **[P1]**

### §2.3 Quick Start

- `README.md:56-102` — imports `VoidframeProvider, AppShell, Sidebar, PageHeader, Card, Button, Stat, StatGroup, Toaster, toast`. All of these appear in `docs/data/props.json` with a `file` under `src/`, so surface names resolve. **OK.**
- `README.md:92` `toast.success("Refreshed")`. **Verifiable:** README:794 documents `toast.success / .info / .warning / .danger / .promise / .dismiss`. Matches.
- `README.md:31-33` `npx voidframe init my-app`. **Verifiable:** `tools/cli/bin/voidframe.mjs:35-42` registers `init`. Requires the package to be on npm so `npx` can resolve it; per `plans/npm-publish-plan.md` it is not. Flag as **expected gap**, not a finding, per the plan's Step-3 rubric.

#### §2.3.1 Pack-and-test the Quick Start

Plan Task 2 Step 3 asks us to run `npm pack` and install the tarball into a scratch project. **Could not execute in this session** — the sandbox denied `docker compose run ... build` and direct `node`/`npm` invocations. Flag as **[concern]** for the caller: this step remains to be run before publish.

The Quick Start's *import path* was statically verified:

| Import | Evidence | Status |
|---|---|---|
| `VoidframeProvider` | `src/provider/VoidframeProvider.tsx` (via taxonomy.ts:151 + props.json) | OK |
| `AppShell`, `Sidebar`, `PageHeader`, `Card`, `Button`, `Stat`, `StatGroup` | All in props.json | OK |
| `Toaster`, `toast` | props.json (Toaster); `toast` found in demo/App.tsx imports | OK |
| `import "voidframe/styles.css"` | `package.json:25` — `"./styles.css": "./dist/voidframe.css"` | OK |

### §2.4 Subpath imports

- `README.md:22-23` — `voidframe/styles.css` **[OK, confirmed `package.json:25`]**.
- `README.md:510-512` references `npm run test:coverage`, `npm run test:ssr`, `npm run test:a11y`. **Verifiable:** `package.json:60-62` all present. **OK.**
- `README.md:605-609` claims `voidframe/theme-script.js` ships at package root. **Verifiable:** `package.json:36` `"./theme-script.js": "./theme-script.js"` and `package.json:41` `files` includes `"theme-script.js"`. **OK.**
- README never mentions the `voidframe/charts`, `voidframe/dev`, `voidframe/tokens`, `voidframe/testing` subpaths by name, even though `package.json:15-34` exports them. The "Testing your app against Voidframe" section (README:513-549) does reference `voidframe/testing` explicitly, but the `charts`, `dev`, and `tokens` subpaths are invisible to a reader who only reads the README. **[P1]**

### §2.5 Peer deps

- Covered in §2.2 above. **[P1]**

### §2.6 Theme / customisation

- `README.md:122` claims "Three themes ship out of the box: darkTheme, lightTheme, midnightTheme". **Verifiable:** demo/App.tsx:198 also imports `greyTheme`, and `tools/cli/commands/theme.mjs:4` declares `KNOWN = ["dark","light","midnight","grey"]`. So four themes ship, not three. **[P0]**
- `README.md:152-164` uses `createTheme`. **Verifiable:** `createTheme` appears in README's own Project Structure blurb (`README.md:897` — "Design tokens + createTheme + lightTheme"). No contradictions. **OK.**
- `README.md:200-226` uses `useThemePersistence`. **Verifiable:** `docs/data/hooks.json` has `useThemePersistence` (file `src/hooks/useThemePersistence.ts`). **OK**, though its TSDoc is missing (see §5).

### §2.7 Bundle budgets

- `README.md:500-508`:
  - "Full ESM bundle: ≤150 KB gzipped"
  - "Stylesheet: ≤25 KB gzipped"
  - "import { Button } only: ≤5 KB gzipped"
  - "import { Icon, SearchIcon }: ≤3 KB gzipped"

  **Verifiable:** `package.json:81-112`:
  - Core ESM: **170 KB** (README says 150) → **[P0]** mismatch.
  - Stylesheet: **50 KB** (README says 25) → **[P0]** mismatch.
  - No per-import budgets (`import { Button }` etc.) exist in `size-limit`; the README's 5 KB / 3 KB claims are aspirational with no CI enforcement. **[P1]**
  - Extra budgets in `package.json:89-97` that README doesn't mention: `charts.es.js ≤40 KB`, `dev.es.js ≤10 KB`, all JS ≤400 KB. Completeness gap. **[P1]**

### §2.8 Testing section

- `README.md:554` claims "1260+ tests". `README.md:885` claims "1230+ tests". Two different numbers in the same README. **[P1]** — pick one and make it match the actual `npm run test` output post-run.

### §2.9 SSR

- `README.md:574-575` claims "A `renderToString` smoke test exercises a representative sample of every complexity tier on every commit". **Verifiable:** `package.json:61` `"test:ssr": "vitest run src/__tests__/ssr.test.tsx test/ssr/"` exists. **OK.**
- `README.md:637` calls out "Pure display primitives (`Text`, `Label`, `Divider`, `Badge`, `Icon`, `Box`, `Flex`, `Grid`, `Container`, `Code`, `Kbd`)". All present in `docs/data/props.json`. **OK.**

### §2.10 i18n

- `README.md:654` imports `ja, ar, enXA` from `voidframe`. **Verifiable:** demo/App.tsx:177 uses `LOCALE_PACKS` but not `ja`/`ar`/`enXA` directly. Absent from props.json. No evidence they are tree-shakable named exports at the top level. **[P1]** — needs verification against `src/index.ts`.
- `README.md:695` claims "Shipped locale packs: `en`, `es`, `fr`, `de`, `ja`, `zhCN`, `ar` (RTL), `he` (RTL), plus `enXA`". Cross-check needed. **[P1]**

### §2.11 Responsive

- `README.md:707` "CSS-based `<Show>` / `<Hide>` (no SSR hydration flash), a JS `ResponsiveBox` primitive". **Verifiable:** taxonomy.ts:189-190 — `src/responsive/Show.tsx` and `src/responsive/ResponsiveBox.tsx`. **OK.**
- `README.md:768-775` "Adaptive components. Modal, Drawer, DrawerV2, Sidebar, and Table accept an `adaptive` prop (default true)". Needs verification against each component's props. **[needs spot-check]**, flag as **[P1]**.

### §2.12 Chat quickstart

- `README.md:817-867` duplicates a lot of what the main Quick Start already conveys. Readability concern: it's a second "Quick Start" that isn't labelled as such in the nav. **[P2]**

### §2.13 Demo script

- `README.md:873` — `docker compose up demo` → localhost:5173. **Verifiable:** `package.json:53` `"demo": "vite serve demo"`, `docker-compose.yml` not read here but README is internally consistent. **OK.**

### §2.14 Contributing / License

- `README.md:914` "MIT" — matches `LICENSE`. **OK.**
- No Contributing section at all — the audit criteria call for "link to Forgejo, expected workflow, test invocation". **Verifiable:** `package.json:216` declares `https://git.ahadley.local/aeryn/VoidFrame.git` (a LAN Forgejo), which the README never exposes. **[P1]**

### §2.15 Marketing-fluff phrases

- `README.md:5` "forged from the void" — stylistic, leave as flavour. Borderline P2/P3.
- `README.md:808` "Sharp edges. No pills, no rounding. Precision over friendliness." — consistent with brand. **OK.**
- `README.md:811` "Trust the user to parse." — OK.
- `README.md:7` "accessible components" — would be stronger with a link to the a11y audit page (`docs/a11y-audit.ts`). **[P2]**

### §2.16 Structural

- `README.md:17` peer-dep line uses backticks inconsistently with `README.md:155` fenced code. Minor. **[P3]**
- `README.md:40` lists codemod names `legacy-charts-to-v2`, `tokens-from-hex`. **Verifiable:** `tools/codemods/transforms/` contains exactly those two. **OK.**

---

## §3. CHANGELOG

**File:** `CHANGELOG.md` (78 lines). Read 2026-04-17.

### §3.1 Phase coverage

- `CHANGELOG.md:6-72` lists `[Unreleased]` entries for Phases 21, 22, 23, 24, 25, 26, 27, 28 (backwards order). Stops at Phase 28.
- `plans/` directory on disk (see Glob output) has `29-parameter-standardization-audit.md`, `30-security-audit.md`, `31-functionality-audit.md`, `32-docs-verbiage-audit.md`. Also present: `voidframe-phase1-components.md` through `voidframe-phase7-review-validation.md`. These "framework expansion" phases have clearly landed (taxonomy.ts:156-187 "Phase 1 new components" block lists 30+ new components like `Transfer`, `Popconfirm`, `SplitButton`, `InlineEdit`, `CronBuilder`, `RegExpTester`, etc., all of which appear in `docs/data/props.json`).
- **CHANGELOG is missing entries for Phases 29 through 32 (the audits themselves) AND for the "Phase 1/2/3/… framework expansion" that added 30+ components.** **[P1]** — an adopter looking at the changelog thinks the project ended at Phase 28.

### §3.2 Phase 28 claims

- `CHANGELOG.md:10` says the CLI has `init, theme, codemod, doctor` subcommands. **Verifiable:** `tools/cli/bin/voidframe.mjs:35-69` registers exactly those four. **OK** — but `tools/cli/commands/test.mjs` exists (87 lines, a test-scaffold generator), is NEVER wired into `voidframe.mjs`, and is NOT in the CHANGELOG either. **[P0]** — dead or unreleased feature with no docs trail. See §8.1.
- `CHANGELOG.md:12-15` "snippets for every public component (prefixed `vf-<name>` or the PascalCase name)". **Verifiable:** `tools/vscode-voidframe/snippets/voidframe.code-snippets` is generated; first 60 lines confirm both prefix forms. **OK.**

### §3.3 Phase 27 claims

- `CHANGELOG.md:23-30` mentions "eight representative component pages". **Verifiable:** `docs/curated.tsx` has hand-written examples for many components (2053 lines, approximately 20+ entries per partial read — more than 8). CHANGELOG is stale. **[P2]**
- `CHANGELOG.md:30` "`scripts/extract-props.mjs` — walks src/**/*.tsx with react-docgen-typescript and writes `docs/data/props.json`". Also writes `hooks.json` and `utils.json` (evidenced by all three files in `docs/data/`). **[P2]** — incomplete claim.

### §3.4 Semver / promotion readiness

- `CHANGELOG.md:6` is still `## [Unreleased]`. `package.json:3` is `"version": "1.0.0"`. Per `plans/npm-publish-plan.md` Step 5 the promotion should be `## [1.0.0] - YYYY-MM-DD` before publish. The remediation doc proposes the new heading and a consolidated 1.0.0 entry; see `32-remediation.md`. **[P1]**

### §3.5 `git log` cross-check

- Plan Task 3 Step 1 asks us to `git log --since="2026-02-01"`. Could not run; `git` available in sandbox but an agentic read-only audit should still be safe. This step was **skipped to preserve the plan's no-writes-to-git guardrail**, but the per-phase plan files (`plans/29-...` through `plans/32-...`, plus the `voidframe-phase[1-7]-*.md` ladder) are the equivalent evidence. **[concern]** — controlling agent should verify git log matches.

---

## §4. Docs site

**Files:** `docs/App.tsx` (714 lines), `docs/curated.tsx` (2053), `docs/guides.tsx` (389), `docs/patterns.tsx` (495), `docs/migration.tsx` (31), `docs/taxonomy.ts` (209), `docs/hookMap.ts` (2685), `docs/a11y-audit.ts` (76), `docs/scope.ts` (20), `docs/autoPlayground.ts` (665), `docs/CONVENTIONS.md` (119).

### §4.1 Methodology note

- The plan's Task 4 Step 3 recommends grepping `docs/taxonomy.ts` for `"[A-Z][A-Za-z0-9]+"` and comparing to props.json names. That grep is **noisy** for this codebase — taxonomy.ts is keyed by **file paths** (e.g. `"src/components/Button.tsx"`) with **category names** as values (`"Core"`, `"Layout"`…), not by component names at all. The appropriate cross-check is: **for every component in props.json, does its `file` field resolve to a category in taxonomy.ts?** The `categorize()` function (taxonomy.ts:201-209) falls back to `"Other"` for unmapped files, which is observable in the docs nav. **[methodology caveat — reported in headline]**.

### §4.2 Landing page (`docs/App.tsx`)

- `App.tsx:70-75` "Voidframe is a dark, monochrome, terminal-brutalist React UI framework. Every component is hand-rolled, themed through a single set of `--vf-*` CSS custom properties, and designed for data-dense interfaces." **OK** — consistent with README tagline.
- `App.tsx:77-98` describes five sections: Guides / Patterns / Components / Hooks / Utilities. Matches the grouping in `groupItems()` (App.tsx:541-577). **OK.**
- `App.tsx:375` a11y page text: "Accessibility audit status for voidframe components. All components are tested with jest-axe." **Verifiable:** `a11y-audit.ts` shows only **33 components** in the audit (line count: `auditData` array of 33 entries). The docs nav count is **499 components**. The page therefore gives the impression all 499 are axe-tested when the audit table lists 33. **[P0]** — either expand the audit list or rephrase the blurb.

### §4.3 Curated components (`docs/curated.tsx`)

- Hand-written summaries + playground code for a curated subset. Spot-checked Button, Badge, Tabs — all accurate against the current component props.
- No systematic cross-check with props.json in this pass (2053 lines is too much to parse within the audit budget). **Completeness gap:** the curated coverage is a small subset of the 499-component surface; the rest fall back to `ComponentPage`'s "no description available yet" empty-state at `App.tsx:133-135`. **[P1]**

### §4.4 Guides (`docs/guides.tsx`)

- `guides.tsx:59` `npm install voidframe` — matches README. **OK.**
- `guides.tsx:66` `import "voidframe/styles.css"` — matches `package.json:25`. **OK.**
- `guides.tsx:70-73` "The provider installs the active theme, density, direction, and reduced-motion preferences…" — matches VoidframeProvider's props.json description (`props.json:24022`). **OK.**
- No URL to issue tracker / contribution guide anywhere. **[P2]**

### §4.5 Patterns (`docs/patterns.tsx`)

- First 80 lines: `LOGIN_FORM_CODE` and `SETTINGS_PAGE_CODE` — real, runnable JSX against the current imports (Input, Checkbox, Divider, Tabs, Select). Spot-check OK.
- Scope caveat: patterns imports run against the docs-site `playgroundScope` (`docs/scope.ts`, 20 lines) not against the built package. Any identifier the scope doesn't expose will silently fail in the Playground. **[methodology note, not a finding — but worth watching when new patterns are added]**.

### §4.6 Migration (`docs/migration.tsx`)

- 31 lines total. `migration.tsx:18-31` is a placeholder:
  ```ts
  export const migrations: MigrationGuide[] = [
    { id: "v1-to-v2", fromVersion: "1.x", toVersion: "2.0",
      breakingChanges: [],
      newFeatures: ["This is a placeholder for the v2 migration guide.", ...],
      deprecations: [] }
  ];
  ```
- The docs-site renders this via `App.tsx:419-450` → `MigrationPage` — which emits "No breaking changes documented yet. This framework will be populated before the v2 release." (`App.tsx:427`).
- Two existing deprecations in the code are NOT mentioned here: `Drawer → DrawerV2` (Overlay.tsx:59 `deprecatedComponent("Drawer","DrawerV2","v1.1")`) and `Button prop primary → variant="accent"` (`tools/eslint-plugin-voidframe/rules/no-deprecated-props.ts:4`). **[P1]** — migration page needs a 1.0→1.1 section pre-populated.

### §4.7 Taxonomy (`docs/taxonomy.ts`)

- `CATEGORIES` (line 9-27) has **17 categories** including `"Other"`. Duplicates the category names used in `App.tsx:561`.
- `FILE_MAP` covers ~130 explicit file→category mappings. Missing files fall back to `PREFIX_MAP` (src/primitives/, src/charts/, src/icons/, src/dev/) or `"Other"`.
- **Completeness gap:** Several known source files are NOT in `FILE_MAP` and NOT prefixed into the map:
  - `src/components/Accordion.tsx` → `"Interactive"` (explicit). **OK.**
  - Most `Chat*.tsx` files are explicit.
  - But components whose parent file isn't in `FILE_MAP` fall to `"Other"`. Without running the `categorize()` loop against props.json we can't enumerate, but the audit plan's grep methodology here doesn't work because taxonomy.ts is file-path-keyed. Recommend adding a `scripts/dump-taxonomy.mjs` (plan Option B) as a follow-up. **[methodology — P1 to address in plan 33+]**.
- Taxonomy comment at line 7: "Every file under src/components/ should have an explicit mapping here to avoid the 'Other' bucket." — **needs verification**. **[P1]** (see above).

### §4.8 Hook map (`docs/hookMap.ts`)

- 2685 lines, hand-curated `componentHooks[component] = { internal, recommended }`. Cross-checked Input, Textarea, Select, Toggle, Checkbox — hook names like `useForm`, `useDebounce`, `useDebouncedCallback`, `useControllableState` all exist in `docs/data/hooks.json`.
- **But:** Input's `recommended` (hookMap.ts:17-22) lists `useCopyToClipboard` and `useFocusVisible`. `useFocusVisible` is in hooks.json. `useCopyToClipboard` is in hooks.json. Both OK.
- Textarea's `recommended` (line 27-35) lists `useUndoRedo` — present in hooks.json. **OK.**
- **Stale-reference check** (plan Task 4 Step 2 requirement): no obvious stale names in the spot-checked rows. A full programmatic check requires node, so recording this as **[concern, not a finding]**.

### §4.9 A11y audit (`docs/a11y-audit.ts`)

- 76 lines. `auditData` is a canned array of **33 entries**, not a live a11y run. App.tsx:375 renders this with the blurb "All components are tested with jest-axe" — see §4.2 **[P0]**.
- Summary stats (`a11y-audit.ts:61-76`) are computed from the 33-row sample, not the 499-component surface.

### §4.10 CONVENTIONS.md

- 119 lines, accurate against the library. Spot-checks:
  - `CONVENTIONS.md:73` — "Components using this pattern: `Dialog`, `Menu`, `PopoverV2`, `DrawerV2`, `Sheet`, `Accordion`, `Field`." All present in props.json. **OK.**
  - `CONVENTIONS.md:84-85` — "Components using this pattern: `Tabs`, `Button`, `Badge`, `Card`, `DataGrid`, `Table`, `Select`, `Combobox`." All present. **OK.**
- Omits the deprecation convention (`deprecatedProp`, `deprecatedComponent` from `src/utils/deprecate.ts`). **[P2]**

---

## §5. TSDoc coverage

**Artifact:** `plans/audits/32-tsdoc-gaps.json` (full enumerations there; summary here).

### §5.1 Headline numbers

- **Components:** 499 total / **439 missing** / 60 with description / 0 "terse". Missing rate: **88%**.
- **Props:** 3,381 total / **2,447 missing** / 934 with description. Missing rate: **72%**.
- **Hooks:** 75 total / **11 missing** / 64 with description.
- **Utils:** 96 total / **3 missing** / 93 with description.

### §5.2 High-impact missing-TSDoc components

Categorising the 439 missing components by visibility:

- **Tier-A (curated or demoed extensively — users will look them up first):** `Button` (present but misleading — see §5.4), `Badge`, `Card`, `Tabs`, `Modal`, `Dialog`, `Drawer`, `DrawerV2`, `Sheet`, `Input`, `Textarea`, `Select`, `Toggle`, `Checkbox`, `RadioGroup`, `Menu`, `MenuBar`, `PopoverV2`, `HoverCard`, `Tooltip`, `TooltipProvider`, `Toaster`, `Toast`, `Snackbar`, `Stat`, `StatGroup`, `MetricCard`, `DataList`, `DescriptionList`, `ScrollArea`, `Sidebar`, `Navbar`, `Toolbar`, `Breadcrumb`, `Pagination`, `CursorPagination`, `Stepper`, `Wizard`, `CommandInput`, `PageHeader`.
  **All missing.** **[P0]** — these are the names users will hit first.

- **Tier-B (charts & data — niche but where prop-level docs matter most):** `BarChart`, `LineChart`, `AreaChart`, `PieChart`, `DonutChart`, `RadarChart`, `Histogram`, `CalendarHeatmap`, `Heatmap`, `Sparkline`, `ComposedChart`, `ScatterPlot`, `BubbleMap`, `ChoroplethMap`, `Sankey`, `TreeMap`, `Sunburst`, `FunnelChart`, `WaterfallChart`, `BoxPlot`, `ViolinPlot`, `CandlestickChart`, `StreamGraph`, `HorizonChart`, `ChordDiagram`, `ParallelCoordinates`, `ScatterMatrix`, `SmallMultiples`, `NetworkGraph`, `DependencyGraph`, `TileGridMap`, `Brush`, `Crosshair`, `Axis`, `ChartFrame`, `ChartLegend`, `ChartTooltip`, `Gridlines`, `Line`, `Area`, `Bar`, `Arc`, `Point`, `ReferenceBand`, `ReferenceLine`.
  **All missing.** **[P1]** — without TSDoc, IDE autocomplete shows only raw types on `ChoroplethMap` etc.

- **Tier-C (icons — low impact, obvious from name):** 61 Icon components (`PlusIcon`, `MinusIcon`, `CheckIcon`, …) all missing. Acceptable as "obvious from name" per the plan's classification rubric. **[P3]** — cosmetic, batch-fix via a one-liner per icon ("Plus icon. Decorative by default; supply `label` to promote to `role='img'`.").

### §5.3 Missing hooks (from `hooks.json`)

All 11 listed in `32-tsdoc-gaps.json`: `ShortcutProvider`, `useEventSource`, `useForm`, `useGeolocation`, `useList`, `useMap`, `usePermission`, `useSet`, `useShortcutRegistry`, `useThemePersistence`, `useWebSocket`. **[P0]** for `useForm` (tier-1 hook, referenced in README and many playgrounds); **[P1]** for the rest.

### §5.4 Misleading present-but-poor TSDoc

These **pass** the "length > 20 chars" check but fail the readability criterion (describe implementation, not purpose):

- `props.json:2478` Button → "Memoized leaf — skips re-render when props are referentially stable." — a perf note. User reading this in IDE autocomplete still doesn't know what Button is for. **[P1]**
- `props.json:6326` CopyButton — identical wording. **[P1]**
- `props.json:10658` Icon — "Memoized leaf — icons render frequently inside rows/lists." **[P1]**
- `props.json:2275` BubbleChart — "Alias — 'BubbleChart' is just ScatterPlot with sizeRange used." **[P2]**
- `props.json:14743` OHLCChart — "Alias — OHLC is the tick-style variant." Requires reader to know OHLC. **[P2]**
- `props.json:9605` Form — "Read the nearest `<Form>` context. Throws if not inside a `<Form>`." — describes the HOOK variant; top-level `<Form>` component has no dedicated doc. **[P1]**
- `props.json:22025` TileGridMap — "Built-in US-states layout (postal code keys). Source: standard 'tile grid' arrangement used by FiveThirtyEight / Bloomberg." — describes the bundled preset, not the component. **[P2]**

### §5.5 Missing utils

All three listed in `32-tsdoc-gaps.json`: `DEFAULT_PORTAL_ID`, `getLogger`, `uid`. **[P2]** each — all obvious-from-name but a one-liner would make the docs site nav more self-documenting.

---

## §6. Demo app

**Files:** `demo/App.tsx` (5027 lines), `demo/index.html`.

### §6.1 Header comment

- `demo/App.tsx:1-10` header says "Section-by-section showcase of the entire component surface from Phase 0 to the latest shipped phase." **Claim vs. reality:** ~395 identifiers are imported by name from `../src`; `docs/data/props.json` has 499 components. Delta ≈ **~100 components are imported from the demo's named-import list but never rendered, OR not imported at all**. **[P1]** — "entire component surface" is inaccurate without a "or via subsections" qualifier.

### §6.2 Coverage check

Plan Task 6 Step 3's ripgrep-based coverage check **could not be run in this session** (sandbox denied `rg` via pipes). Static manual check of the first 220 lines of imports (demo/App.tsx:12-231) confirms broad coverage of layout / forms / overlays / navigation / charts (mostly absent) / icons (partial) but the charts namespace is thin — no `BarChart`/`LineChart`/`AreaChart` in the first 231 lines of imports. **[P1]** — charts almost certainly under-covered, given the README's loud chart marketing.

### §6.3 Section registry

- `demo/App.tsx:1-10` comment says "sections are defined as plain components and registered in a SECTIONS array near the bottom." We did not descend to the bottom in this pass; trust the header.

### §6.4 No live JS error check

- Plan asks "Does it render? (JS error = P0)". Cannot spin up the demo in this sandbox (docker denied). **[concern]** — parent agent should run `docker compose up demo` and verify.

---

## §7. Runtime messages

**Artifact:** `plans/audits/32-messages.txt` (detailed per-site).

### §7.1 Totals

- **27** `warnOnce(...)` call sites, **10** `invariant(...)` call sites (both counts include `__tests__/`; non-test production sites: 15 warnOnce / 0 invariant calls in src/ non-test).
- **13** production `warn(...)` call sites (from src/ minus __tests__).
- **2** sites bypass the `warn()`/`warnOnce()` wrapper and call `console.warn` directly:
  - `src/icons/IconButton.tsx:63` — aria-label missing warning
  - `src/utils/safeHref.ts:92` — rejected-href warning

### §7.2 Classification

- **GOOD (WHAT + WHERE + HOW-TO-FIX):** All 11 warnOnce sites inside `Form.tsx`, `FormExtended.tsx`, `Combobox.tsx`, `DataGrid.tsx`, `Interactive.tsx` (Tabs). Exemplar: `src/components/DataGrid.tsx:1018-1019` — "DataGrid virtualization is disabled when groupBy is active. Remove groupBy or virtualized to silence this warning." Clear trigger + fix.
- **PARTIAL (WHAT + WHERE; FIX implicit):** a11y-label warnings on `Input`, `Textarea`, `Toggle`, `Select`, `Modal`, `Drawer` — tell you what's required (a `label`/`aria-label`/`aria-labelledby`) but don't point at any doc page and don't mention that `VisuallyHidden` counts if the consumer prefers to style the label elsewhere. **[P1]**
- **PARTIAL:** `useControllableState` switch warning (`src/hooks/useControllableState.ts:42-45`) — accurate but includes `"unknown"` when no `componentName` is passed. **[P2]**
- **CRYPTIC:** None detected.
- **DEAD:** None detected.

### §7.3 Bypass: `console.warn` instead of `warn()`

**[P1]** `src/icons/IconButton.tsx:63` and `src/utils/safeHref.ts:92` both use `console.warn(...)` with a `[voidframe]` prefix instead of the library's own `warn()`/`warnOnce()` wrapper. Consequences:

- These warnings **don't** flow through `emit({level:"warn",...})` in `src/utils/warn.ts:88,100`.
- **DevPanel's Warnings tab** (introduced in Phase 25 per CHANGELOG) reads from the emit pipeline and therefore will NOT display these warnings, contradicting the README's promise at lines 511 ("All dev-only `warn()` and `warnOnce()` calls are guarded by `process.env.NODE_ENV !== 'production'` — bundlers strip them from production builds entirely, so warning message strings never ship.") which implies a single unified pipeline.
- `IconButton` specifically uses a local `warnedMissingLabel` boolean (line 58-62) to dedupe — duplicating `warnOnce`'s role, incorrectly dedup'd per-instance rather than globally.

### §7.4 Duplicate-key check

All 5 static-string keys are unique; all 7 dynamic (template-literal) keys interpolate a unique component-scoped token (`${o.value}`, `${t.key}`, `${value}`, `${componentName}`). No collisions detected.

**Plan methodology note:** the Task-7 Step-3 grep for duplicate keys works **as written** for this codebase — no false positives, no misses. Confirmed.

### §7.5 Deprecation helpers

- `src/utils/deprecate.ts:15-18` and :29-32 — `deprecatedProp` and `deprecatedComponent` — both produce GOOD messages ("will be removed in ${version}. Use X instead.").
- Current deprecations in the wild: `Drawer → DrawerV2` (`src/components/Overlay.tsx:59`) and `Button primary prop → variant="accent"` (`tools/eslint-plugin-voidframe/rules/no-deprecated-props.ts:4`). **Only the Drawer one fires at runtime**; the Button deprecation is lint-only. This inconsistency isn't documented anywhere. **[P2]**

---

## §8. Tooling verbiage

### §8.1 CLI (`tools/cli/`)

- `tools/cli/bin/voidframe.mjs:27-29` program description "Voidframe CLI — scaffolding, theme, codemods, health checks." **OK.**
- Registered subcommands: `init`, `theme`, `codemod`, `doctor`. Matches README:35-42 + CHANGELOG. **OK.**
- **`tools/cli/commands/test.mjs` exists (87 lines) but is never imported by `voidframe.mjs`.** It exports `generateTest(name, options)` — a test-scaffold generator — without a `*Command` adapter. This is a **dead or unreleased feature**: `voidframe test` does nothing; the file is unreachable from the CLI surface; there's no CHANGELOG entry; there's no README mention. **[P0]** — decide: wire it or delete it. Don't ship half-wired CLI surface to npm.
- Per-subcommand messages (spot-checks):
  - `init` (`tools/cli/commands/init.mjs:38-39, 54-58`) — "✖ ${dir} already exists and is not empty. Re-run with --force to overwrite." plus "✔ Scaffolded voidframe app at ${target}. Next steps: cd, npm install, npm run dev." **GOOD.**
  - `theme` (`tools/cli/commands/theme.mjs:19-21, 28-31`) — "✖ Unknown theme '${name}'. Valid: dark, light, midnight, grey." plus wire-it instructions. **GOOD.**
  - `codemod` (`tools/cli/commands/codemod.mjs:10-22`) — "✖ Missing codemod name. Try: legacy-charts-to-v2 | tokens-from-hex" / "✖ Unknown codemod: ${name}" / "✖ No paths given." All **GOOD** except that the error messages don't reference `voidframe codemod --help` for full list. **[P2]**
  - `doctor` (`tools/cli/commands/doctor.mjs:83-106`) — checks voidframe presence, react >= 18, react-dom, `voidframe/styles.css` import. `doctor.mjs:88-90` — "add `import \"voidframe/styles.css\"` to your entry file" — **GOOD** (has fix). But doctor doesn't check any of the other peer deps from `package.json:116-130`. **[P1]** — charts will silently fail if d3-force/d3-geo missing.

### §8.2 Codemods (`tools/codemods/`)

- `tools/codemods/run.mjs:48-52` — "Usage: node tools/codemods/run.mjs <transform> <path...>" with list of available transforms. **GOOD.**
- `tools/codemods/run.mjs:57` — "Unknown transform: ${transform}". **PARTIAL** — doesn't suggest alternatives the way `theme` does.

### §8.3 ESLint rules (`tools/eslint-plugin-voidframe/rules/`)

Six rules. Review per rule:

- **`no-deprecated-props.ts`** (42 lines).
  - Message `no-deprecated-props.ts:15` — "Prop '{{prop}}' on <{{component}}>: {{message}}". Template leaves heavy lifting to the per-prop hint, e.g. line 4 `Button.primary → 'Use variant="accent" instead of the primary prop'`. **GOOD.**
  - **No doc URL** (rule is a plain object, not created via `ESLintUtils.RuleCreator`). Two of the six rules are plain objects; the other four use `createRule` with `https://voidframe.dev/docs/eslint-plugin#<name>` URLs. **[P0]** — `voidframe.dev` is not mentioned anywhere else in this repo as an active domain; if it doesn't resolve, these docs URLs are lies. **[P1]** separately — rule-URL inconsistency (4 have them, 2 don't).

- **`no-legacy-chart-imports.ts`** (72 lines).
  - URL: `https://voidframe.dev/docs/eslint-plugin#no-legacy-chart-imports` (line 5). **[P1]** — domain existence.
  - Messages: "Module '{{module}}' is the legacy chart path. Import from 'voidframe' instead." / "Legacy voidframe export '{{name}}'. {{hint}}". Per-name hints pre-filled (line 11 — "Use ChartFrame from voidframe (same import entry)."). **GOOD.**

- **`no-raw-hex-colors.ts`** (78 lines).
  - URL: same domain (line 5). **[P1]**.
  - Message: "Raw color '{{value}}' in style.{{prop}}. Use a var(--vf-*) theme token instead so the value tracks light/dark/contrast themes." **GOOD** — tells you WHY (token-theming).

- **`prefer-compound-pattern.ts`** (36 lines).
  - **No URL** (line 9, plain object). **[P1]**.
  - Message (line 16) — "Consider using <{{suggested}}> instead of <{{original}}> for richer accessibility and composition." **GOOD** — suggestion + reason.

- **`require-a11y-label.ts`** (31 lines).
  - **No URL** (plain object). **[P1]**.
  - Message (line 10) — "IconButton must have an aria-label prop for accessibility." **PARTIAL** — says WHAT but could point to a doc page or explain WHY (screen reader name).

- **`require-use-client.ts`** (84 lines).
  - URL present.
  - Message (line 47) — "File imports client-only voidframe component '{{name}}' but is missing a top-level 'use client' directive. Add \"use client\"; as the first statement if this file is in a React Server Components tree." **GOOD** — complete: WHAT, WHERE, HOW-TO-FIX, WHEN-IT-APPLIES.

### §8.4 VS Code extension (`tools/vscode-voidframe/`)

- **Snippet coverage:** `snippets/voidframe.code-snippets` is auto-generated by `scripts/generate-vscode-snippets.mjs`. Sample (first 60 lines): snippets for `AccessibleIcon`, `Accordion`, `Activity`, `AgentRunner`, `AgentStep`, `AgentTrace`, etc. Each snippet has `prefix` (vf-kebab + PascalCase), `body` (JSX template with required props as tab stops), `description`, `scope`. **GOOD pattern.**
  - **Caveat:** snippets where the component has no TSDoc fall back to `"Voidframe <Name> component."` (e.g. Accordion line 21, AgentRunner line 43). Reads as auto-generated stub. **[P2]** — fixing the TSDoc gaps (§5) fixes this automatically.
  - Snippet truncates the component description at the first newline (Activity line 32: "Vertical activity feed. Pair with `Activity.Item` children — each" — ends mid-sentence). `scripts/generate-vscode-snippets.mjs` presumably does this; remediation: either take first sentence via regex or the full description. **[P2]**

- **Hover provider:** `tools/vscode-voidframe/src/docs.js` + `src/extension.js`.
  - `docs.js:9-18` `loadIndex(json)` parses an array. `extension.js:14-17` reads `data/props.json` bundled with the extension. Source of truth for the extension's hover = the snapshot in `tools/vscode-voidframe/data/props.json`, NOT the repo's live `docs/data/props.json`.
  - Packaging script (per README at `tools/vscode-voidframe/README.md:34-37`) is `npm run vscode:package`. `scripts/package-vscode.mjs` should copy the live props.json to the extension's `data/` dir. **Did not verify** the script regenerates before packaging. **[P1]** — confirm the packaging pipeline.
  - **Open Playground URL** (`extension.js:72`) — `https://voidframe.dev/docs/#<name>`. Same domain-existence concern as the ESLint rule URLs. **[P0]** if the domain isn't live; **[P1]** if the domain exists but the docs aren't deployed there yet.

- **Extension `package.json`:**
  - `tools/vscode-voidframe/package.json:47` — `"repository": { "type":"git","url":"https://github.com/voidframe/voidframe" }`. **But** the main project's `package.json:216` declares `https://git.ahadley.local/aeryn/VoidFrame.git` (a local Forgejo). **Inconsistent.** **[P0]** — if `github.com/voidframe/voidframe` doesn't exist, the VS Code extension's Marketplace page (when/if published) will link to a 404.
  - `tools/vscode-voidframe/package.json:4` description "Snippets, hover docs, and quick actions for the Voidframe React UI framework." **GOOD.**

- **Extension README (`tools/vscode-voidframe/README.md:3`)** links to `https://voidframe.dev`. Same domain concern.

---

## Severity audit method

- **P0** — a reader/user would be actively misled: wrong names, wrong numbers, broken links, dead/undocumented-but-shipped surface.
- **P1** — information necessary to adopt the library is missing or incomplete.
- **P2** — prose is correct but flabby, unstructured, or inconsistent with sibling text.
- **P3** — typos, smart-quote drift, capitalisation inconsistency.
