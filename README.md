# VOIDFRAME

[![CI](https://github.com/DaxAvalon/voidframe-ui/actions/workflows/ci.yml/badge.svg)](https://github.com/DaxAvalon/voidframe-ui/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/voidframe-ui)](https://www.npmjs.com/package/voidframe-ui)
[![downloads](https://img.shields.io/npm/dm/voidframe-ui)](https://www.npmjs.com/package/voidframe-ui)
[![license](https://img.shields.io/npm/l/voidframe-ui)](https://github.com/DaxAvalon/voidframe-ui/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)](https://www.typescriptlang.org/)
[![bundle size](https://img.shields.io/bundlephobia/minzip/voidframe-ui)](https://bundlephobia.com/package/voidframe-ui)
[![React](https://img.shields.io/badge/React-%3E%3D18-61dafb)](https://react.dev/)
[![coverage](https://img.shields.io/badge/coverage-%E2%89%A575%25-brightgreen)](https://github.com/DaxAvalon/voidframe-ui)
[![docs](https://img.shields.io/badge/docs-live-green)](https://daxavalon.github.io/voidframe-ui)

Dark monochrome React UI framework. Terminal-brutalist. Data-dense. Zero border-radius. Monospace-first.

Built for dashboards, dev tools, data interfaces, internal consoles, AI chat products, and anything that needs to feel like it was forged from the void.

**500+ accessible components across primitives, layout, forms, navigation, data display, overlays, interactive surfaces, a full chat/AI tier, domain-specific specialty widgets, and ~60 bundled monoline icons.** Every stateful component is controllable or uncontrolled; every compound surface exposes a Radix-style dot-notation API; every interactive surface ships WAI-ARIA semantics and keyboard nav under CI-enforced jest-axe + Playwright coverage. Runtime dependencies: React and React-DOM — everything else is a peer.

---

## Install

```bash
npm install voidframe-ui
```

**Peer dependencies.** Required: `react >= 18.0.0`, `react-dom >= 18.0.0`.

**Optional** (only required if you render the component on the right):

| Optional peer | Needed by |
|---|---|
| `d3-force` | `NetworkGraph` |
| `d3-geo`, `topojson-client` | `ChoroplethMap`, `BubbleMap` |
| `d3-hierarchy` | `TreeMap`, `Sunburst` |
| `d3-sankey` | `Sankey` |
| `d3-scale`, `d3-shape`, `d3-array`, `d3-time` | All other charts (pulled in via the `voidframe-ui/charts` subpath) |
| `dompurify` | `MarkdownRenderer`, `MarkdownEditor` preview |
| `react-live` | `docs/` site and any `<Playground>` consumer |
| `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, `jest-axe` | Required only when using `voidframe-ui/testing`'s helpers |

Voidframe throws `MissingPeerDependencyError` at render time with the exact `npm install` command if an optional peer isn't resolvable. See the Charts section for per-chart install examples.

Import the stylesheet once at the top of your app:

```js
import "voidframe-ui/styles.css";
```

### Subpath imports

The main entry re-exports the whole library. The subpaths below let you
import only what you need or reach for helpers that aren't surfaced on
the root entry:

| Subpath | When to use it |
|---|---|
| `voidframe-ui` | Default — every component, hook, and utility. |
| `voidframe-ui/charts` | Charts only (dead-code elimination if you don't touch any non-chart component). |
| `voidframe-ui/dev` | `<Playground>`, `<PropsTable>`, `<DevPanel>`, `ProfilerScope` — dev-only surface, never ships to production. |
| `voidframe-ui/tokens` | Token object (`darkTheme`, `lightTheme`, …) without pulling in React. Useful for tooling and design-tool sync. |
| `voidframe-ui/testing` | `renderWithTheme`, `expectNoA11yViolations`, `installMatchMedia`, `createMockStorage`. |
| `voidframe-ui/primitives` | Low-level primitives: `Slot`, `Portal`, `FocusScope`, `DismissableLayer`, `Presence`, `LiveRegion`, a11y helpers. |
| `voidframe-ui/core` | `Button`, `Badge`, `Card`, `Text`, `Loading`, `SplitButton`, `CopyButton`, `Result`. |
| `voidframe-ui/layout` | `Layout` family, `AppShell`, `Sidebar`, `Masonry`, `Resizable`, `ScrollArea`, responsive `Show`/`ResponsiveBox`. |
| `voidframe-ui/navigation` | `Menu`, `MegaMenu`, `BreadcrumbMenu`, `CommandPalette`, `Navbar`, `Toolbar`, `Wizard`, `Anchor`, `FloatingActionButton`. |
| `voidframe-ui/forms` | Every form control — inputs, date/time/color pickers, editors, `FormProvider`, `Field`, `Combobox`, `Cascader`, etc. |
| `voidframe-ui/data` | `DataGrid`, `TreeTable`, `TreeView`, `Virtualization`, `Viewers/*`, `Metrics`, `AsyncData`, skeletons, descriptions. |
| `voidframe-ui/activity` | `Calendar`, `Gantt`, `Kanban`, `Comment`, `LiveIndicator`, `Activity`. |
| `voidframe-ui/overlays` | `Dialog`, `Drawer`, `Popovers`, `Spotlight`, `ToastSystem`, `Notifications`, `Network`, `Popconfirm`. |
| `voidframe-ui/media` | `Carousel`, `Lightbox`, `Image`, `MediaPlayer`, `Embed`/`RichEmbed`, `ImageDiff`. |
| `voidframe-ui/animation` | `FadeIn`, `SlideIn`, and the rest of the `Animations` module. |
| `voidframe-ui/icons` | `Icon`, `IconButton`, the bundled icon set, and `adaptIcon`. |
| `voidframe-ui/chat` | Chat surface — `Conversation`, `Message*`, `ChatComposer`, `ChatSession`, `ModelCompare`, `TokenVisualizer`. |
| `voidframe-ui/specialty` | Niche surface: `ThemeSelector`, `ShortcutGuide`, `Print`, `ColorTools`, `Numeric`, `TimeDisplays`, etc. |
| `voidframe-ui/interactive` | `Accordion`, `DragDrop`, `Gestures`, `FilterBuilder`, `Interactive` primitives. |
| `voidframe-ui/styles.css` | The single bundled stylesheet. |
| `voidframe-ui/theme-script.js` | Inline `<head>` snippet that applies the persisted theme pre-hydration (no flash). |

#### When to reach for a subpath vs the root

For the vast majority of consumers — anyone using a bundler (Vite, Webpack, Rspack, Rollup, esbuild, Next.js, Remix, Astro, Parcel) — `import { Button } from "voidframe-ui"` is fine. The bundler tree-shakes unused modules, so pulling `Button` from the root bundle only ships `Button`.

The category subpaths (`voidframe-ui/core`, `voidframe-ui/forms`, `voidframe-ui/data`, …) exist for two cases:

1. **Bundler-free consumers** — raw Node scripts, Deno, Bun without a bundler, `node --input-type=module`, esm.sh, unpkg with `?module`, etc. The monolithic root entry statically references chunks for every optional peer (`dompurify`, `d3-*`, `react-live`). Without tree-shaking, Node's ESM loader will try to resolve every referenced chunk at module-load time and fail if the optional peers aren't installed.

    ```js
    // ✗ needs dompurify + d3-* + react-live installed to even load
    import { Button } from "voidframe-ui";

    // ✓ loads clean with only react + react-dom
    import { Button } from "voidframe-ui/core";
    ```

    If you're writing a small script, importing from the relevant subpath is the right call.

2. **Explicit boundary control** — if you want to guarantee at review time that a file only reaches into one category, `import { DataGrid } from "voidframe-ui/data"` makes the intent reviewable. Some teams lint for this with the bundled `voidframe-ui/prefer-subpath-import` ESLint rule.

### Scaffold a new app

The `voidframe-ui` CLI can set up a fresh Vite + React project pre-wired
with the provider, stylesheet, and a starter page:

```bash
npx voidframe init my-app
cd my-app && npm install && npm run dev
```

Other CLI commands:

- `voidframe theme <dark|light|midnight|grey>` — drop a theme override
  file you can edit locally.
- `voidframe codemod <name> <paths...>` — run a voidframe codemod
  (`legacy-charts-to-v2`, `tokens-from-hex`).
- `voidframe doctor` — verify your project wiring (voidframe version,
  React version, stylesheet import, peer deps).
- `voidframe test <name> [--type component|hook|util] [--force]` —
  scaffold a vitest file for a component, hook, or utility, with
  prop-aware test stubs based on the source declaration.

### VS Code extension

A packaged `.vsix` for VS Code lives at
[`tools/vscode-voidframe/`](tools/vscode-voidframe/). It ships snippets
for every public component (trigger with `vf-<name>` or the PascalCase
name), hover docs, and an "Open Playground" command. Not published to
the Marketplace — install locally with:

```bash
code --install-extension tools/vscode-voidframe/vscode-voidframe-1.0.0.vsix
```

## Quick Start

```jsx
import {
  VoidframeProvider,
  AppShell,
  Sidebar,
  PageHeader,
  Card,
  Button,
  Stat,
  StatGroup,
  Toaster,
  toast,
} from "voidframe-ui";

function App() {
  return (
    <VoidframeProvider>
      <AppShell
        sidebar={
          <Sidebar title="VOIDFRAME">
            <Sidebar.Item href="#/">Dashboard</Sidebar.Item>
            <Sidebar.Item href="#/ops">Operations</Sidebar.Item>
          </Sidebar>
        }
        header={<PageHeader title="DASHBOARD" />}
      >
        <Card title="OVERVIEW">
          <StatGroup>
            <Stat label="USERS" value="12,847" color="#4ade80" />
            <Stat label="REVENUE" value="$1.2M" color="#4ade80" />
          </StatGroup>
          <Button
            variant="accent"
            accent="#4ade80"
            onClick={() => toast.success("Refreshed")}
          >
            REFRESH
          </Button>
        </Card>
      </AppShell>
      <Toaster />
    </VoidframeProvider>
  );
}
```

---

## Migrating from shadcn / Radix

If you're moving an existing shadcn/ui (or Radix Primitives) project to voidframe-ui, the `voidframe-ui/compat-shadcn` subpath provides shadcn-shaped flat exports backed by voidframe internals. Most call sites can keep their existing imports verbatim; only the import path changes.

```diff
- import { Button } from "@/components/ui/button";
- import {
-   Dialog,
-   DialogTrigger,
-   DialogContent,
-   DialogHeader,
-   DialogTitle,
-   DialogFooter,
- } from "@/components/ui/dialog";
+ import {
+   Button,
+   Dialog,
+   DialogTrigger,
+   DialogContent,
+   DialogHeader,
+   DialogTitle,
+   DialogFooter,
+ } from "voidframe-ui/compat-shadcn";
```

The compat layer is purely static re-exports — zero runtime translation cost. Behavior, a11y semantics, focus management, and DOM shape come from the underlying voidframe components.

### Parity table

| shadcn import | `voidframe-ui/compat-shadcn` export | voidframe equivalent |
| --- | --- | --- |
| `Button`, `buttonVariants` | `Button` | `Button` (variant `default→solid`, `secondary→subtle`, `link→Link primitive`) |
| `Card` (+ `Header`/`Title`/`Description`/`Content`/`Footer`) | `Card` + same | `Card` (with composed slot wrappers) |
| `Dialog` (+ all subcomponents) | `Dialog`, `DialogTrigger`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogBody`, `DialogFooter`, `DialogClose` | `Dialog.*` |
| `AlertDialog` (+ subcomponents) | `AlertDialog`, `AlertDialogTrigger`, `AlertDialogContent`, `AlertDialogHeader`, `AlertDialogTitle`, `AlertDialogDescription`, `AlertDialogFooter`, `AlertDialogAction`, `AlertDialogCancel` | `AlertDialog` + `Dialog.*` slots |
| `Sheet` (+ subcomponents) | `Sheet`, `SheetTrigger`, `SheetContent`, `SheetHeader`, `SheetTitle`, `SheetDescription`, `SheetFooter`, `SheetClose` | `DrawerV2.*` (description aliases body) |
| `Popover` (+ subcomponents) | `Popover`, `PopoverTrigger`, `PopoverContent` | `PopoverV2.*` |
| `Tooltip` (+ `TooltipProvider`) | `Tooltip`, `TooltipTrigger`, `TooltipContent`, `TooltipProvider` | `TooltipRoot.*` (provider is a no-op pass-through for source-compat) |
| `DropdownMenu` (+ Item / CheckboxItem / RadioGroup / RadioItem / Separator / Label / Sub*) | Same names with `DropdownMenu` prefix | `Menu.*` |
| `Select` (+ Trigger / Value / Content / Item) | Same | `Select.Root` / `.Trigger` / `.Value` / `.Content` / `.Item` |
| `Tabs` (+ List / Trigger / Content) | Same | `Tabs.List` / `.Trigger` / `.Panel` (aliased as `.Content`) |
| `Toast` / `Toaster` / `useToast` | Same | `Toaster` + `toast()` (sonner-shaped `toast.error`, `.success`, `.warning`, `.info` also work) |
| `Input`, `Textarea`, `Label`, `Badge`, `Checkbox`, `Switch`, `Avatar`, `Separator`, `ScrollArea`, `Skeleton`, `Progress`, `Slider`, `Toggle`, `ToggleGroup`, `RadioGroup`, `RadioGroupItem` | Trivial passthroughs | direct voidframe exports |

### Migration tips

- **`Button`'s `variant="link"`** renders the voidframe `Link` primitive (an `<a>`-based element with accent + focus ring). If you were using `Button` `variant="link"` for a programmatic action (no `href`), switch to `variant="ghost"` + `tone="info"` instead.
- **Sonner-style toast** — `toast.error("message")` works directly. The 2-arg signature `toast(message, options)` is supported alongside the existing single-options form.
- **Radix `<Tooltip.Provider>`** is required-by-design in Radix; voidframe doesn't need one. The compat-layer `TooltipProvider` is a no-op `<>{children}</>` so existing `<TooltipProvider delayDuration={...}>` wrappers stay valid (the `delayDuration` prop is silently ignored — voidframe Tooltip handles its own timing).
- **Class-variance-authority** (`cva`) is not bundled. If your shadcn project used `cva` for variant CSS, you can keep importing it from your own deps (it's tiny) or migrate to voidframe's `tone`/`variant`/`size` props which auto-emit `data-tone`/`data-variant`/`data-size` plus BEM classes.

The compat layer is intentionally thin (~5 KB gzipped) — it's a migration aid, not a parallel implementation. Once your migration is done, you can switch each consumer over to native voidframe imports at your own pace.

---

## Theming

### Provider

Wrap your app (or any subtree) in `VoidframeProvider`. All child components read tokens from context.

```jsx
import { VoidframeProvider } from "voidframe-ui";

<VoidframeProvider>
  <App />
</VoidframeProvider>
```

### Built-in themes

Four themes ship out of the box: `darkTheme` (default), `lightTheme`, `midnightTheme` (deep-black OLED-friendly), and `greyTheme` (neutral mid-grey for print and projection). Pass any of them to `VoidframeProvider`'s `theme` prop or address them by name via `themeName="dark" | "light" | "midnight" | "grey" | "system"`.

```jsx
import { VoidframeProvider } from "voidframe-ui";

// By name — sets data-vf-theme and uses the stylesheet cascade (no FOUC).
<VoidframeProvider themeName="midnight">
  <App />
</VoidframeProvider>

// Or pass a full token set via `theme` for runtime overrides.
import { lightTheme } from "voidframe-ui";
<VoidframeProvider theme={lightTheme}>
  <App />
</VoidframeProvider>
```

### `"system"` — follow OS preference

```jsx
<VoidframeProvider themeName="system">
  <App />
</VoidframeProvider>
```

Subscribes to `prefers-color-scheme` and re-resolves automatically.

### Custom tokens

```jsx
import { VoidframeProvider, createTheme } from "voidframe-ui";

const warmVoid = createTheme({
  bg0: "#0a0806",
  bg1: "#0e0c0a",
  green: "#86efac",
  fontFamily: "'IBM Plex Mono', monospace",
});

<VoidframeProvider theme={warmVoid}>
  <App />
</VoidframeProvider>
```

### Density, contrast, direction, reduced motion

Independent, composable props on the provider — all cascade via `data-*` attributes so component CSS reads them through custom properties.

```jsx
<VoidframeProvider
  themeName="system"
  density="compact"          // comfortable | compact | spacious
  contrast="high"            // normal | high
  direction="rtl"            // ltr | rtl
  reducedMotion="auto"       // auto | always | never
>
  <App />
</VoidframeProvider>
```

### Nested `<ThemeScope>`

Override any of the above for a subtree without remounting the rest.

```jsx
import { ThemeScope, lightTheme } from "voidframe-ui";

<VoidframeProvider themeName="dark">
  <Header />
  <ThemeScope themeName="light">
    <Preview />               {/* this subtree renders in light */}
  </ThemeScope>
  <Footer />
</VoidframeProvider>
```

### Persistence

```jsx
import { useThemePersistence, VoidframeProvider, ThemeSelector } from "voidframe-ui";

function App() {
  const { theme, setTheme } = useThemePersistence({
    key: "myapp-theme",
    defaultTheme: "system",
    allowed: ["dark", "light", "midnight", "system"],
  });
  return (
    <VoidframeProvider themeName={theme}>
      <ThemeSelector
        value={theme}
        onChange={setTheme}
        themes={[
          { id: "dark", label: "Dark" },
          { id: "light", label: "Light" },
          { id: "midnight", label: "Midnight" },
          { id: "system", label: "Auto" },
        ]}
      />
    </VoidframeProvider>
  );
}
```

Reads from `localStorage`, survives reloads, and syncs across tabs via the `storage` event.

### Accessing Tokens

```jsx
import { useTokens } from "voidframe-ui";

function MyComponent() {
  const t = useTokens();
  return <div style={{ color: t.green, fontFamily: t.fontFamily }}>OK</div>;
}
```

---

## Design Tokens

| Category   | Tokens                                    | Purpose                         |
|------------|-------------------------------------------|---------------------------------|
| Surfaces   | `bg0` → `bg5`                             | 6 depth layers, no shadows      |
| Borders    | `border0` → `border4`                     | 5 tiers, subtle to prominent    |
| Text       | `text0` → `text5`                         | 6 levels, white to invisible    |
| Accents    | `green red amber blue purple cyan rose`   | Semantic color only             |
| Aliases    | `success danger warning info`             | Semantic shortcuts              |
| Typography | `fontFamily`, `fontXxs` → `font3xl`       | 8 sizes, monospace only         |
| Spacing    | `sp1` (2px) → `sp12` (48px)               | 12-step scale                   |
| Misc       | `radius` (always 0), `transition`         | Framework constants             |

---

## Component Inventory

Everything below ships from the top-level `voidframe-ui` import. Compound components expose their subparts as dot-properties (e.g. `Sidebar.Item`, `Menu.Trigger`, `Dialog.Content`).

### Foundations & layout

| Component | Purpose |
|-----------|---------|
| `Text`, `Label`, `Quote`, `Code`, `Kbd` | Typographic primitives |
| `Divider`, `Spacer` | Whitespace / separation |
| `Box`, `Flex`, `HStack`, `VStack`, `Stack`, `Grid`, `Container` | Layout primitives |
| `AspectRatio` | Fixed-ratio frames |
| `AppShell` | Sidebar + header + footer scaffolding |
| `Sidebar` (compound) | Collapsible navigation shell with groups and items |
| `PageHeader` | Title / subtitle / action area for routes |
| `Navbar`, `Toolbar` (compound) | Top-level bars and inline action strips |
| `SplitView`, `ResizableGroup` / `ResizablePanel` / `ResizableHandle` | Draggable split panes |
| `ResizableBox` | Standalone freeform resize (`axis="x" \| "y" \| "both"`) with edge + corner grips |
| `ScrollArea`, `ScrollRow`, `ScrollIndicator`, `ScrollSpy` | Scroll containers + indicators |
| `StatusBar`, `SegmentBar`, `SegmentedProgress` | Horizontal status strips |
| `Frame`, `BannerAlert`, `Callout`, `OfflineBanner`, `ConnectionStatus` | Framed content + top-of-page callouts |

### Buttons & indicators

| Component | Purpose |
|-----------|---------|
| `Button`, `ButtonGroup` | Primary button + segmented group |
| `IconButton` | Icon-only button |
| `Link` | Text-link primitive — voidframe accent + focus ring; pass `as` for react-router / next/link integration |
| `Badge`, `Tag`, `TagInput` | Small labels / chip collections |
| `Shortcut`, `Kbd`, `ShortcutGuide` | Keyboard hints + `?` registry overlay |
| `StatusIndicator`, `Dots` | Presence dots and multi-dot stacks |
| `Spinner`, `SpinnerV2`, `Shimmer`, `Skeleton`, `Dots`, `Progress`, `CircularProgress`, `Gauge`, `Sparkline` | Loading / progress primitives |
| `LoadingOverlay`, `Backdrop` | Full-surface loading / dim layers |

#### `Link` — text-link primitive

```jsx
import { Link } from "voidframe-ui";
import NextLink from "next/link";

// Default — wraps native <a>, picks up voidframe accent + focus ring.
<Link href="/docs">Read the docs</Link>

// External target — adds rel="noopener noreferrer" + target="_blank".
<Link href="https://example.com" external>Example</Link>

// Polymorphic — render as a router-aware Link without losing styling.
<Link as={NextLink} href="/dashboard">Dashboard</Link>
```

Use `Link` whenever you would have reached for `<a className="…">` and
hand-rolled accent/focus styling — the primitive keeps focus rings,
hover tones, and visited-link semantics consistent across the app.
For programmatic actions (no destination URL), use `Button` with
`variant="ghost"` instead — links should always navigate.

### Form controls

Core: `Input`, `Textarea`, `Select`, `Toggle`, `Switch`, `Checkbox`, `CheckboxGroup`, `RadioGroup`, `Slider`, `NumberInput`, `CurrencyInput`, `PhoneInput`, `PinInput`, `PasswordInput`, `MaskedInput`, `SearchInput`, `SegmentedControl`, `RatingInput`, `ColorPicker`.

Complex selects: `Combobox`, `MultiSelect`, `TreeSelect`, `MentionInput`.

Date & time: `DatePicker`, `DateRangePicker`, `DateTimePicker`, `TimePicker` (via DatePicker).

Editors: `RichTextEditor`, `MarkdownEditor`, `CodeEditor`, `MarkdownRenderer`.

Capture: `SignaturePad`, `ImageCropper`, `FileUpload`, `Clipboard`.

Forms hook: `useForm()` for controlled-or-uncontrolled form state with validation.

#### Labeling form controls (accessibility)

Every form control needs an accessible name. Voidframe surfaces a runtime
warning at mount when `Input` / `Textarea` / `Toggle` / `Select` are
rendered without one — keep the warnings clean and the components are
instantly screen-reader-correct.

Three accepted ways to name a control:

```jsx
// 1. Built-in `label` prop (recommended) — voidframe wires htmlFor + id.
<Input label="Email" value={email} onValueChange={setEmail} />

// 2. <Field> compound — when a control has helpText / errorMessage / a
//    custom label slot, wrap in Field for one-stop association.
<Field label="Email" helpText="We'll never share your email." error={errors.email}>
  <Input value={email} onValueChange={setEmail} />
</Field>

// 3. aria-label — for inline / matrix / data-dense UIs where a visible
//    label would be redundant. Voidframe accepts `asAriaLabel` as an
//    explicit escape hatch + suppresses the missing-name warning.
<Select asAriaLabel="Tier backend" options={…} value={…} onValueChange={…} />
```

**When to use `Field`**: any time you need a label *and* helper / error /
description text. Single-purpose cases (just a label, no error UI) read
cleaner with the built-in `label` prop. The compound `Field` exists to
bundle the auxiliary slots into one consistent layout.

**Switch vs Checkbox** — both controllable, both keyboard-navigable,
near-identical APIs. Pick by intent:

| Use | When |
|---|---|
| `<Switch>` | Persistent app/system state — "Dark mode", "Refinement enabled", "Notifications on". The switch *is* the setting. |
| `<Checkbox>` | Selection from a list, agreement to terms, multi-select rows — the choice is one of many. |

Mixed lists (e.g. settings panes that have both kinds) are fine; the visual
distinction is part of why the two components exist.

### Navigation

`Tabs`, `TabBar`, `Stepper`, `Breadcrumb`, `BreadcrumbMenu`, `Pagination`, `CursorPagination`, `Menu` (compound), `MenuBar` + `MenuBarMenu`, `MegaMenu`, `NavGroup`, `NavItem`.

### Data display

Tables: `Table`, `DataGrid` (sort / filter / resize / reorder / group / virtualize / persist / export), `TreeTable`, `DataList`, `DescriptionList`, `KeyValue`, `JSONViewer`, `DiffViewer`, `LogViewer`, `Gantt`, `Kanban`, `Heatmap`.

Trees & lists: `TreeView`, `VirtualList` (via DataGrid virtualization), `Sortable`.

Metrics: `Stat`, `StatGroup`, `MetricCard`, `CircularProgress`.

Charts — hand-rolled SVG library. Math uses d3-scale / d3-shape / d3-array / d3-time for algorithms; every rendered element, CSS class, and interaction is ours and themed through `--vf-*` tokens.

**Primitives (Phase 21):**

| Primitive | Purpose |
|-----------|---------|
| `ChartFrame` | SVG wrapper, margin accounting, scale context, responsive sizing |
| `Axis` | 1px brutalist axis with nice-ticks for linear / log / time / band / point scales |
| `Gridlines` | X / Y / both, solid or dashed |
| `ChartLegend` | Swatches + labels, interactive toggle, tone variants |
| `ChartTooltip` | Portaled tooltip with viewport-flip + edge-clamp math |
| `Crosshair` | SVG guide lines + point at `(x, y)` in plot-space coords |
| `Brush` | Drag-select range on X or Y axis, controlled + uncontrolled |

**Chart families (Phase 22):**

| Chart | Variants |
|-------|----------|
| `BarChart` | vertical / horizontal, grouped / stacked / 100%-stacked |
| `LineChart` | single + multi-series, linear/step/monotone/catmull-rom curves, dashed, crosshair |
| `AreaChart` | single / stacked / 100%-stacked |
| `ScatterPlot`, `BubbleChart` | square/circle/diamond/cross shapes, sqrt size scale for bubbles |
| `ComposedChart` | bar + line + area + scatter on shared axes |
| `PieChart`, `DonutChart` | configurable inner radius, pad/corner angles |
| `RadarChart` | multi-series polygon over shared axes |
| `Histogram` | auto-bin via d3-array, tooltip per bin |
| `CalendarHeatmap` | GitHub contribution-graph style, quantized color scale |
| `Sparkline` | inline micro-chart, optional area + trend + points |
| `Heatmap` | row × column matrix, quantized color scale |

**Advanced layouts (Phase 23):**

| Chart | Notes |
|-------|-------|
| `TreeMap` | squarified / binary / slice / dice / slice-dice tilings via d3-hierarchy |
| `Sunburst` | radial partition with rotated labels for wide sweeps |
| `FunnelChart` | vertical or horizontal drop-off, percent-of-top label |
| `WaterfallChart` | running-sum bars with increase / decrease / total tones and connectors |
| `BoxPlot` | min / Q1 / median / Q3 / max + outliers beyond 1.5 × IQR |
| `ViolinPlot` | Gaussian-kernel density (Silverman bandwidth), falls back to rect for small samples |
| `CandlestickChart`, `OHLCChart` | candle bodies or OHLC ticks with up/down tones |
| `StreamGraph` | stacked area with wiggle baseline + inside-out order |
| `HorizonChart` | N colored bands, negatives folded |
| `Sankey` | node relaxation via d3-sankey with justify/left/right/center alignment |
| `ChordDiagram` | flow between N groups from a square matrix |
| `ParallelCoordinates` | N per-dimension linear axes with polylines per row |
| `ScatterMatrix` | N × N scatter grid (SPLOM) |
| `SmallMultiples<T>` | generic faceting wrapper used by SPLOM and any chart repeated over categories |

**Geo + Network (Phase 24):**

| Chart | Peer deps | Notes |
|-------|-----------|-------|
| `DependencyGraph` | none | layered DAG, longest-path layering, top-down or left-right with arrowed orthogonal edges |
| `TileGridMap` | none | equal-area square tiles, ships with `US_STATES_GRID` preset (50 + DC) |
| `NetworkGraph` | `d3-force` (optional) | force-directed simulation, drag to pin nodes, auto-cools after `coolDownAfter` ms of quiet |
| `ChoroplethMap` | `d3-geo`, `topojson-client` (optional) | quantized fill per feature, supports `geoMercator`/`geoEqualEarth`/`geoNaturalEarth1`/`geoAlbersUsa` |
| `BubbleMap` | `d3-geo`, `topojson-client` (optional) | sized circles at `[lon, lat]` over a TopoJSON base layer |

If a chart's optional peer is not installed when it renders, voidframe throws `MissingPeerDependencyError` with the exact `npm install` command. Install only what you use:

```sh
npm install d3-force                 # NetworkGraph
npm install d3-geo topojson-client   # ChoroplethMap + BubbleMap
```

**Math utilities:** `linearScale`, `logScale`, `sqrtScale`, `timeScale`, `bandScale`, `pointScale`, `quantizeScale`, `generateTicks`, `stackSeries`, `resolveCurve`, `bisectNearest`, `scanNearest`, `seriesPalette`, `formatChartNumber`.

Calendars: `Calendar` (month/week/day views, range selection).

Avatars & media: `Avatar`, `AvatarGroup`, `Image`, `ImageGallery`, `AudioPlayer`, `VideoPlayer`, `DocumentPreview`, `IFrame`, `CodeBlock`.

### Overlays

`Modal`, `Dialog` (compound), `DrawerV2`, `Sheet` (smooth continuous drag on the handle, snaps on release), `PopoverV2`, `HoverCard`, `TooltipV2`, `ContextMenu`, `Menu`, `CommandPalette`, `Spotlight`, `NotificationCenter`, `EmptyState`, `ErrorState`, `ReactionPicker`.

Toasts: `toast()` imperative API, `useToast()` hook, `Toaster` (placement wrapper), `Snackbar` (bottom-center preset), `AlertV2`.

### Interactive & media

`Accordion` (compound), `Carousel`, `Marquee`, `Lightbox`, `Swipeable`, `SwipeActions`, `Zoomable`, `ShareButton`, `Activity`, `MediaPlayer`.

### Chat & AI

Purpose-built surface for Claude-/ChatGPT-/agent-style products. Everything below is in the top-level `voidframe-ui` import.

**Conversation + messages:** `Conversation`, `MessageList`, `MessageGroup`, `Message`, `MessageContent` (with `MessagePart[]` — text / code / tool_use / tool_result / thinking), `StreamingText`, `ThinkingIndicator` / `TypingIndicator`, `ReasoningTrace`, `MessageActions` (compound: `Copy`/`Regenerate`/`Edit`/`Delete`/`Share`/`Feedback`/`Pin`/`Branch`), `MessageFeedback`, `ReactionBar` / `MessageReactions`, `MessageEdit`.

**Attachments:** `AttachmentList`, `Attachment`, `ImageAttachment`, `FileAttachment`, `CodeAttachment`, `AudioAttachment`.

**Tool calls & agents:** `ToolCall`, `ToolCallGroup`, `AgentStep`, `AgentTrace`, `PlanDisplay`.

**Citations & sources:** `Citation`, `CitationList`, `SourceCard`, `SourceGrid`, `RAGContext`.

**Composer:** `Composer` (compound: `Toolbar`, `Input`, `Footer`, `Submit`, `AttachButton`, `SlashButton`, `MicButton`, `TokenCounter`), `ComposerAttachment`, `ComposerMicButton`, `SubmitButton`, `StopButton`, `RegenerateButton`, `SuggestionChips` / `QuickReplies`, `PromptTemplateList`, `PromptTemplateEditor`, `SlashCommandPicker`, `Mention`.

**Session & history:** `SessionList`, `SessionListItem`, `ConversationHeader`, `ConversationEmptyState`.

**Model, context, cost:** `ModelSelector`, `SystemPromptEditor`, `ChatTokenCounter`, `ContextWindow`, `CostDisplay`, `LatencyIndicator`, `UnreadBadge`.

**Debug & trace:** `DebugPanel`, `TraceViewer`.

**Layout patterns:** `ChatLayout` (sidebar + conversation + inspector), `SimpleChat`, `AgentRunner`.

### Specialty

Domain surfaces that round out the tier-1 offering. Everything below is in the top-level `voidframe-ui` import.

**Dev tools:** `CommitGraph`, `NetworkInspector` (JSON headers/body drill-down), `ConsoleOutput` (level filter `"warn+"`), `DebugTree` (JSON or YAML via `format` prop — `toYaml` helper exported), `KeyValueEditor`, `QueryBuilder` (AND/OR groups + rules), `ShortcutEditor` (records chords to `mod+shift+k`-style strings with conflict detection).

**Identity:** `UserCard`, `TeamCard`, `OrganizationCard`, `Identicon` (deterministic 5×5 mirrored pattern), `PresenceList` (grouped by status, maxVisible + overflow).

**Numeric:** `NumberDisplay`, `CurrencyDisplay`, `PercentDisplay` (all locale-aware with auto-tone), `BigNumber` (hero metric with unit + delta + optional sparkline slot).

**Time:** `TimeZoneSelect` (searchable, Intl-driven), `RelativeTime` (auto-updating, pure `Intl.RelativeTimeFormat`), `DurationDisplay` (`hms`/`compact`/`long`), `Countdown`.

**Help & changelog:** `HelpTooltip` (CSS-positioned ? icon), `ContextHelp` (side-panel pattern), `Changelog` (per-entry `added`/`fixed`/`changed`/`removed`/`security`/`deprecated`), `WhatsNewPopover` (once-per-version, persists via injected storage for tests/SSR).

**Encoding:** `QRCode`, `Barcode` — both render placeholder patterns by default and accept a pre-computed `matrix` / `pattern` so consumers can pipe in output from a peer dep (`qrcode-generator`, `jsbarcode`) without bundling it.

**Color:** `ColorSwatch`, `Palette`.

**Rich embeds:** `LegalText`, `Mermaid` (accepts a `loader` prop to lazy-resolve the peer dep at runtime).

**Widgets:** `WidgetShell` (loading / error / empty states, optional drag + resize handles), `DashboardGrid` (CSS-grid placement, optional drag-to-swap with live drop indicator, optional corner-resize handles via `resizable`), `packLayout` / `usePackedLayout` helpers.

**Print:** `PrintLayout` (`@media print` optimized), `PrintButton` (prints a ref'd subtree via a transient iframe, preserving styles).

### Icons

Monoline, 1px-stroke, 24×24 brutalist icon system. Decorative by default; supplying `label` promotes to `role="img"`. Directional icons auto-mirror under `[dir="rtl"]`. `spin` and `pulse` animations respect `prefers-reduced-motion`.

**Primitive:** `Icon` (size `xs`/`sm`/`md`/`lg`/`xl`/`xxl` or raw number, flipX/flipY/rotate/spin/pulse/directional).

**Bundled set (~60):** `PlusIcon`, `MinusIcon`, `CheckIcon`, `XIcon`, `EditIcon`, `TrashIcon`, `CopyIcon`, `DownloadIcon`, `UploadIcon`, `RefreshIcon`, `SaveIcon`, `ShareIcon`, `SendIcon`, `BookmarkIcon`, `PinIcon`, `ChevronUp/Down/Left/RightIcon`, `ArrowUp/Down/Left/RightIcon`, `HomeIcon`, `ExternalLinkIcon`, `MoreHorizontal/VerticalIcon`, `MenuIcon`, `FileIcon`, `FileTextIcon`, `FolderIcon`, `FolderOpenIcon`, `BoldIcon`, `ItalicIcon`, `UnderlineIcon`, `CodeIcon`, `QuoteIcon`, `LinkIcon`, `InfoIcon`, `WarningIcon`, `ErrorIcon`, `SuccessIcon`, `QuestionIcon`, `SpinnerIcon`, `CircleIcon`, `SquareIcon`, `StarIcon`, `HeartIcon`, `SettingsIcon`, `UserIcon`, `UsersIcon`, `LockIcon`, `UnlockIcon`, `EyeIcon`, `EyeOffIcon`, `SearchIcon`, `FilterIcon`, `SortIcon`, `MailIcon`, `BellIcon`, `MessageIcon`, `PlayIcon`, `PauseIcon`, `StopIcon`, `ClockIcon`, `CalendarIcon`, `SunIcon`, `MoonIcon`, `ChartBarIcon`, `ChartLineIcon`, `DatabaseIcon`, `TerminalIcon`, `CloudIcon`, `CaretIcon`, `LoadingDotsIcon`.

**Composition:** `IconButton` (square, required `aria-label`, optional `tooltip`, `active` for toggles), `IconGroup` (row with gap or interleaved separator).

**Third-party adapter:** `adaptIcon(Component, { defaultLabel, directional })` wraps any Lucide/Phosphor/Heroicons/Tabler icon so framework sizing, color, spin, and RTL mirroring all apply.

```jsx
import { SearchIcon, IconButton, adaptIcon } from "voidframe-ui";
import { Compass } from "lucide-react";

const CompassIcon = adaptIcon(Compass, { defaultLabel: "Compass" });

<IconButton aria-label="Search" tooltip="Search docs (⌘K)">
  <SearchIcon />
</IconButton>
<CompassIcon size="xl" />
```

### Performance

**Lazy wrappers.** The heaviest components ship pre-wrapped as `React.lazy` exports so you can defer their chunks until mount. Pair with `<Suspense>` at the consumer:

```jsx
import { Suspense } from "react";
import {
  LazyModal, LazyDialog, LazyDrawer, LazyLightbox,
  LazyDataGrid, LazyTreeTable, LazyGantt, LazyKanban,
  LazyCodeEditor, LazyMarkdownEditor, LazyRichTextEditor,
  LazyDatePicker, LazyDateRangePicker, LazyCalendar,
  LazySparkline, LazyHeatmap,
  LazySignaturePad, LazyImageCropper, LazyVideoPlayer,
} from "voidframe-ui";

<Suspense fallback={<Spinner />}>
  <LazyDataGrid columns={cols} data={rows} />
</Suspense>
```

**Memoized leaves.** High-traffic stateless components — `Button`, `Badge`, `Dots`, `Label`, `Divider`, `Spacer`, `Spinner`, `Kbd`, `Icon` — are wrapped in `React.memo`. Re-renders skip when props are referentially stable, which is the typical case inside tables, feeds, and icon-heavy lists.

**Tree-shaking.** `package.json` declares `sideEffects: ["*.css"]`. Every export is named; barrels re-export without side effects. Bundlers drop unused components automatically — `import { SearchIcon } from "voidframe-ui"` costs you just the icon and its primitive.

**CSS perf hints.** Overlay panels (modals, drawers, popovers, tooltips, toasts, command palette) carry `contain: layout paint` so they don't invalidate the surrounding page on open/close. For virtualized content, opt in to `content-visibility: auto` via `data-content-visibility="auto"` or the `vf-cv-auto` class — browsers skip rendering off-screen descendants entirely.

```jsx
<div data-content-visibility="auto">
  {longList.map((row) => <Row key={row.id} {...row} />)}
</div>
```

**Bundle budgets** (enforced in CI via `npm run size` — see `package.json` `size-limit`):

| Entry | Budget (gzipped) |
|---|---:|
| Core ESM (`dist/voidframe.es.js`) | ≤200 KB |
| Charts ESM (`dist/charts.es.js`) | ≤40 KB |
| Dev ESM (`dist/dev.es.js`) | ≤10 KB |
| Stylesheet (`dist/voidframe.css`) | ≤50 KB |
| All JS (ES + CJS, every entry) | ≤460 KB |

Tree-shaking still applies — `import { Button } from "voidframe-ui"` costs roughly **4–5 KB** gzipped, `import { SearchIcon }` about **2 KB**. Those per-import figures are measured ad-hoc, not enforced in CI; open a PR before relying on them for a strict budget.

**Per-subpath sizes.** A measured bytes-per-subpath table is generated from the current `dist/` output by `node scripts/bundle-sizes.mjs` (run after `npm run build`) and committed to [`docs/bundle-sizes.md`](docs/bundle-sizes.md). Refer to it when picking the smallest subpath for a given import.

**Production DCE.** All dev-only `warn()` and `warnOnce()` calls are guarded by `process.env.NODE_ENV !== "production"` — bundlers strip them from production builds entirely, so warning message strings never ship.

### Testing your app against Voidframe

Voidframe ships a `voidframe-ui/testing` subpath with the same helpers used internally — so consuming apps can write tests against our components with the provider, a11y checks, and viewport mocks pre-wired.

Two render helpers are exposed:

- **`renderWithTheme`** — wraps in `VoidframeProvider` only. Smallest possible setup.
- **`renderWithVoidframe`** — wraps in `VoidframeProvider` + `ConfirmProvider` (and optionally a nested `ThemeScope`). Use when the component under test calls `useConfirm()` or other voidframe imperative hooks. Re-exports `screen` / `waitFor` / `fireEvent` / `within` / `cleanup` / `act` from testing-library so consumers don't need to dual-import.

```jsx
import { describe, expect, it } from "vitest";
import {
  renderWithVoidframe,
  expectNoA11yViolations,
  installMatchMedia,
  createMockStorage,
  screen,
} from "voidframe-ui/testing";
import { MyFeature } from "./MyFeature";

it("renders inside the provider + passes axe", async () => {
  const { container } = renderWithVoidframe(<MyFeature />, {
    themeName: "light",
    density: "compact",
    direction: "rtl",
  });
  expect(screen.getByRole("button")).toBeInTheDocument();
  await expectNoA11yViolations(container);
});

it("reacts to a viewport resize", () => {
  const ctl = installMatchMedia(320);
  renderWithVoidframe(<MyFeature />);
  ctl.setWidth(1100);            // flips min-width matches + fires listeners
  ctl.restore();
});

it("persists theme through storage", () => {
  const storage = createMockStorage();
  // Pass `storage` into useThemePersistence / WhatsNewPopover.
});
```

**Scripts** (the framework's own CI matrix, mirrored in `package.json`):

```bash
npm run test              # full vitest suite (5,157 tests as of 2026-04-28)
npm run test:watch        # interactive
npm run test:coverage     # v8 coverage + enforced floor thresholds
npm run test:ssr          # renderToString smoke test per phase
npm run test:a11y         # axe suite across every component
```

**Coverage floors** (enforced by vitest thresholds): lines / statements / functions ≥75%, branches ≥70%. Per-layer targets in the Phase 19 plan (utilities / hooks / primitives ≥95%) are aspirational and can be raised as the suite matures.

**Playwright + Chromatic.** Unit + SSR + axe is the baseline. For full-flow interaction tests (overlays, drag-drop, form submission) add Playwright against the shipped demo:

```bash
npx playwright install
npx playwright test
```

Use `@axe-core/playwright` for per-route browser-level a11y checks. For visual regression, point Chromatic at the demo build or publish Storybook — the setup lives in Phases 22 / 25 of the plan.

### SSR & framework compatibility

Voidframe is SSR-safe and carries `"use client"` directives on every stateful module, so it works out of the box with Next.js (App + Pages Router), Remix, Astro, Vite SSR, and Gatsby. A `renderToString` smoke test exercises a representative sample of every complexity tier on every commit.

**Next.js (App Router):** wrap the root layout in a thin client wrapper — this keeps the rest of the layout server-rendered while carving out a single client boundary for `VoidframeProvider`.

```tsx
// app/providers.tsx
"use client";
import { VoidframeProvider } from "voidframe-ui";
export function AppProviders({ children }) {
  return <VoidframeProvider>{children}</VoidframeProvider>;
}

// app/layout.tsx
import { AppProviders } from "./providers";
import "voidframe-ui/styles.css";

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Pre-hydration theme sync — no flash. */}
        <script src="/vf-theme.js" />
      </head>
      <body><AppProviders>{children}</AppProviders></body>
    </html>
  );
}
```

**Remix / Vite SSR / Astro:** identical pattern — import `VoidframeProvider` in a client-only entry, include `voidframe-ui/styles.css` in your root layout, add the theme-sync script inline to `<head>`.

**Pre-hydration theme script.** Prevents the dark→light flash when a user has a persisted or `"system"` theme preference. Inline the script in `<head>` *before* your app bundle — it's shipped at the package root as `voidframe-ui/theme-script.js`:

```html
<!-- via <script src> — shipped at the package root -->
<script src="/node_modules/voidframe-ui/theme-script.js"></script>

<!-- or inline — identical behavior -->
<script>
  (function () {
    try {
      var t = localStorage.getItem("voidframe-theme");
      if (!t || t === "system") {
        t = window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
      }
      document.documentElement.setAttribute("data-vf-theme", t);
    } catch (e) {}
  })();
</script>
```

The snippet runs synchronously, reads the user's persisted pref (the same `voidframe-theme` key `useThemePersistence` uses), and sets `data-vf-theme` before React takes over.

**`<HydrationBoundary>`.** For components that genuinely can't SSR (canvas, measured layouts, time-of-day text), wrap them to render a fallback until after hydration — no mismatch, no broken diff.

```jsx
import { HydrationBoundary } from "voidframe-ui";

<HydrationBoundary fallback={<Skeleton lines={3} />}>
  <SignaturePad />
</HydrationBoundary>
```

**React Server Components.** Stateful components carry `"use client"` — use them freely in client files. Pure display primitives (`Text`, `Label`, `Divider`, `Badge`, `Icon`, `Box`, `Flex`, `Grid`, `Container`, `Code`, `Kbd`) remain usable from RSC because they don't hook into any stateful context beyond CSS.

### Internationalization

Full i18n surface — every built-in string translates, every layout mirrors in RTL, every number/date formats by locale. Backed entirely by `Intl.*` APIs (no `date-fns`/`moment` dependency).

```jsx
import {
  VoidframeProvider,
  MessagesProvider,
  useMessages,
  formatCurrency,
  formatDate,
  formatRelativeTime,
  pluralize,
  pseudolocalize,
  ja, ar, enXA,                   // locale packs
} from "voidframe-ui";

// Provider — pass a LocalePack (messages + direction + firstDayOfWeek).
<VoidframeProvider locale={ja}>
  <App />
</VoidframeProvider>

// Or layer partial overrides over a pack:
<VoidframeProvider
  locale={ar}
  messages={{ dialog: { confirm: "OK" } }}
>
  <App />
</VoidframeProvider>

// RTL auto-derives from the pack — explicit `direction` wins if supplied.
<VoidframeProvider locale={ar}>   {/* dir="rtl" */}
<VoidframeProvider locale={ar} direction="ltr">  {/* forced LTR */}

// Inside components
function MyComponent() {
  const { t, locale, direction, firstDayOfWeek } = useMessages();
  return (
    <>
      <Button>{t("dialog.confirm")}</Button>
      <span>{t("pagination.pageOf", { current: 2, total: 10 })}</span>
      <span>{formatCurrency(1234.56, "EUR", locale)}</span>
      <span>{formatDate(new Date(), locale, { dateStyle: "long" })}</span>
      <span>{formatRelativeTime(Date.now() - 60_000, locale)}</span>
      <span>
        {pluralize(count, locale, {
          one: `1 file`,
          other: `${count} files`,
        })}
      </span>
    </>
  );
}
```

**Shipped locale packs** (tree-shakable — import only what you need):
`en`, `es`, `fr`, `de`, `ja`, `zhCN`, `ar` (RTL), `he` (RTL), plus `enXA` — a pseudolocale wrapper for text-expansion QA.

**Pseudolocalization** — drop in `enXA` or `pseudolocalize(enMessages)` to stress-test layout with 40%-longer diacritic-heavy strings:

```jsx
<VoidframeProvider locale={enXA}>
```

**Nothing hardcoded** — `t()` paths like `pagination.previous`, `dialog.cancel`, `table.noData`, `overlay.close`, `a11y.menu` etc. resolve from the merged catalog. Override any subset via the `messages` prop without re-translating everything.

### Responsive

Breakpoint tokens (`sm=640`, `md=768`, `lg=1024`, `xl=1280`, `xxl=1536`), a `Responsive<T>` prop shape, CSS-based `<Show>` / `<Hide>` (no SSR hydration flash), a JS `ResponsiveBox` primitive, and hooks for dynamic resolution.

```jsx
import {
  Show,
  Hide,
  ResponsiveBox,
  useBreakpoint,
  useDeviceType,
  useResponsive,
  useContainerQuery,
} from "voidframe-ui";

// CSS-based visibility — no flash, no JS required.
<Show above="md"><DesktopNav /></Show>
<Hide above="md"><MobileMenu /></Hide>
<Show between={["md", "xl"]}><TabletBand /></Show>

// Every layout primitive now accepts Responsive<T> natively.
<Flex direction={{ base: "column", md: "row" }} gap={{ base: 4, md: 8 }} />
<Grid columns={{ base: 1, md: 2, lg: 3 }} gap={{ base: 8, md: 16 }} />
<Container maxWidth={{ base: "100%", lg: "1200px" }} />
<Text size={{ base: "sm", md: "md", lg: "lg" }} />
<Text size="responsive-xl">Hero headline</Text>  {/* preset ladder */}

// Or use ResponsiveBox as an escape hatch with the full prop surface.
<ResponsiveBox
  display="grid"
  columns={{ base: 1, sm: 2, md: 3, lg: 4, xxl: 6 }}
  gap={{ base: 8, md: 12, lg: 16 }}
  p={{ base: 8, md: 16 }}
/>

// Hooks for behavior that can't be expressed in CSS.
function ChatHeader() {
  const bp = useBreakpoint();              // "base" | "sm" | "md" | "lg" | "xl" | "xxl"
  const device = useDeviceType();          // "mobile" | "tablet" | "desktop"
  const variant = useResponsive({ base: "compact", md: "comfortable" });
  return ...;
}

// Container queries — element-size responsiveness.
function Card({ children }) {
  const ref = useRef<HTMLDivElement>(null);
  const state = useContainerQuery(ref, {
    small: "(max-width: 300px)",
    medium: "(min-width: 301px) and (max-width: 600px)",
    large: "(min-width: 601px)",
  });
  return <div ref={ref} data-container="inline">...</div>;
}
```

**Container query polyfill.** The `data-container="inline"` / `"size"` CSS hooks apply `container-type: inline-size` / `size` on modern browsers (>93% support as of 2026). For older browsers, add the [container query polyfill](https://github.com/GoogleChromeLabs/container-query-polyfill) to your bundle:

```js
import "container-query-polyfill";
```

The `useContainerQuery` hook above doesn't depend on browser CSS support — it measures via `ResizeObserver` and evaluates the predicates locally — so it always works.

**Adaptive components.** `Modal`, `Drawer`, `DrawerV2`, `Sidebar`, and `Table` accept an `adaptive` prop (default **`true`**) that changes behavior below the `md` breakpoint:

- `Modal` goes full-screen.
- `Drawer` / `DrawerV2` expand to full-width.
- `Sidebar` collapses to a 48px rail (labels hidden).
- `Table` renders as stacked cards (column header above each value).

Opt-out with `adaptive={false}` when you're wrapping one of these inside your own mobile-aware shell.

### Providers

`VoidframeProvider` — theme context.
`ConfirmProvider` + `useConfirm()` — promise-based confirmation dialogs.
`ShortcutProvider` + `useShortcut()` — global keyboard shortcut registry.

---

## Hooks

Theming & state:
`useTokens`, `useControllableState`, `useHover`, `useFocus`, `useToggle`, `useClickOutside`, `useDebounce`, `useMediaQuery`, `useLocalStorage`, `useInterval`, `usePrevious`, `useForceUpdate`, `useMergedRefs`, `useId`, `useIsomorphicLayoutEffect`.

Input & IO: `useKeyboardShortcut`, `useCopyToClipboard`, `useScroll`, `useWindowSize`, `useShortcut`, `useShortcutRegistry`.

Forms: `useForm` (see `Forms` section).

Toasts: `useToast`, plus module-level `toast.success / .info / .warning / .danger / .promise / .dismiss`.

---

## Utilities

`cx`, `tint`, `formatNumber`, `formatBytes`, `formatDuration`, `timeAgo`, `truncate`, `clamp`, `mapRange`, `stringToColor`, `adjustColor`, `deepMerge`, `uid`, `groupBy`, `sortBy`, `copyToClipboard`, `createSafeContext`, `genericForwardRef`, `deprecatedProp`, `deprecatedComponent`.

---

## Design Principles

1. **Monospace everything** — One typeface. Numbers, labels, body text share the same grid.
2. **Zero border radius** — Sharp edges. No pills, no rounding. Precision over friendliness.
3. **Layered depth** — `bg0`→`bg5` creates hierarchy without box-shadows.
4. **Accent by exception** — 95% grayscale. Color is semantic, never decorative.
5. **Information density** — Tight spacing. Dense tables. Trust the user to parse.
6. **Uppercase chrome** — Labels and metadata are uppercase with letter-spacing. Content is mixed-case.
7. **Accessible first** — Every interactive surface ships real ARIA semantics, focus management, and keyboard navigation. Tests assert it.
8. **Controlled *or* uncontrolled** — Every stateful component accepts both a `value`/`defaultValue` pair so you can drop it in without a reducer.

---

## Chat quickstart

```jsx
import {
  VoidframeProvider,
  ChatLayout,
  SessionList,
  Conversation,
  ConversationHeader,
  MessageList,
  Message,
  MessageContent,
  Composer,
  ToolCall,
  toast,
} from "voidframe-ui";

function ChatApp() {
  return (
    <VoidframeProvider>
      <ChatLayout
        sidebar={<SessionList sessions={sessions} activeId={id} onSelect={load} />}
        conversation={
          <Conversation status={status}>
            <ConversationHeader title={title} model={model} />
            <MessageList>
              {messages.map((m) => (
                <Message key={m.id} role={m.role} author={m.author}>
                  <MessageContent content={m.content} streaming={m.streaming} />
                  {m.toolCalls?.map((tc) => <ToolCall key={tc.id} {...tc} />)}
                </Message>
              ))}
            </MessageList>
            <Composer value={draft} onChange={setDraft} onSubmit={send} status={status}>
              <Composer.Toolbar>
                <Composer.AttachButton />
              </Composer.Toolbar>
              <Composer.Input placeholder="Message…" />
              <Composer.Footer>
                <Composer.TokenCounter />
                <Composer.Submit />
              </Composer.Footer>
            </Composer>
          </Conversation>
        }
      />
    </VoidframeProvider>
  );
}
```

## Demo

A live, section-by-section showcase covers every shipped component. Run it locally:

```bash
docker compose up demo      # serves http://localhost:5173
```

Demo entry: `demo/App.tsx`. Sections are defined as plain components and registered in a `SECTIONS` array — add your own by appending one.

---

## Build

```bash
npm install
npm run build     # outputs dist/voidframe.es.js, dist/voidframe.cjs.js, dist/voidframe.css
npm run test      # full vitest suite (5,157 tests as of 2026-04-28)
npm run typecheck # tsc --noEmit
```

---

## Project Structure

```
voidframe/
├── src/
│   ├── index.ts              # Top-level barrel
│   ├── tokens.ts             # Design tokens + createTheme + lightTheme
│   ├── provider/             # VoidframeProvider
│   ├── primitives/           # Slot, Portal, FocusScope, Presence, DismissableLayer
│   ├── hooks/                # All hooks
│   ├── utils/                # cx, formatters, polymorphic helpers
│   ├── components/           # Every component in the inventory above
│   └── css/                  # Component stylesheets
├── demo/                     # Section-by-section showcase app
├── package.json
├── vite.config.ts
└── README.md
```

---

## Contributing

The canonical repository lives at
[github.com/DaxAvalon/voidframe-ui](https://github.com/DaxAvalon/voidframe-ui).
Issues, patches, and long-form discussion happen there. See
[CONTRIBUTING.md](CONTRIBUTING.md) for workflow, coding standards, and
notes for AI coding assistants working in this repo.

Local workflow:

```bash
git clone https://github.com/DaxAvalon/voidframe-ui.git
cd voidframe-ui
npm install
npm test              # unit + a11y + SSR matrix
npm run docs          # local docs site on :5175
npm run demo          # live demo on :5173
```

Before opening a patch, run `npm run typecheck && npm test && npm run size`.
Phase plans and audit docs live under `plans/`; read the relevant one
before adding components to a tier.

---

## License

MIT
