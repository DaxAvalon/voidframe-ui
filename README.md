# VOIDFRAME

Dark monochrome React UI framework. Terminal-brutalist. Data-dense. Zero border-radius. Monospace-first.

Built for dashboards, dev tools, data interfaces, internal consoles, AI chat products, and anything that needs to feel like it was forged from the void.

**230+ accessible components + a brutalist icon system** across primitives, layout, forms, navigation, data, overlays, interaction, a full chat/AI surface, a specialty tier (dev tools, identity, numeric, time, help, encoding, widgets, print), and ~60 bundled monoline icons. WAI-ARIA patterns. Controllable / uncontrollable duality on every input. Compound APIs on every complex surface. No runtime dependencies beyond React.

---

## Install

```bash
npm install voidframe
```

Peer dependencies: `react >= 18.0.0`, `react-dom >= 18.0.0`

Import the stylesheet once at the top of your app:

```js
import "voidframe/dist/voidframe.css";
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
} from "voidframe";

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

## Theming

### Provider

Wrap your app (or any subtree) in `VoidframeProvider`. All child components read tokens from context.

```jsx
import { VoidframeProvider } from "voidframe";

<VoidframeProvider>
  <App />
</VoidframeProvider>
```

### Built-in themes

Three themes ship out of the box: `darkTheme` (default), `lightTheme`, and `midnightTheme` (deep-black OLED-friendly).

```jsx
import { VoidframeProvider } from "voidframe";

// By name — sets data-vf-theme and uses the stylesheet cascade (no FOUC).
<VoidframeProvider themeName="midnight">
  <App />
</VoidframeProvider>

// Or pass a full token set via `theme` for runtime overrides.
import { lightTheme } from "voidframe";
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
import { VoidframeProvider, createTheme } from "voidframe";

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
import { ThemeScope, lightTheme } from "voidframe";

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
import { useThemePersistence, VoidframeProvider, ThemeSelector } from "voidframe";

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
import { useTokens } from "voidframe";

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

Everything below ships from the top-level `voidframe` import. Compound components expose their subparts as dot-properties (e.g. `Sidebar.Item`, `Menu.Trigger`, `Dialog.Content`).

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
| `Badge`, `Tag`, `TagInput` | Small labels / chip collections |
| `Shortcut`, `Kbd`, `ShortcutGuide` | Keyboard hints + `?` registry overlay |
| `StatusIndicator`, `Dots` | Presence dots and multi-dot stacks |
| `Spinner`, `SpinnerV2`, `Shimmer`, `Skeleton`, `Dots`, `Progress`, `CircularProgress`, `Gauge`, `Sparkline` | Loading / progress primitives |
| `LoadingOverlay`, `Backdrop` | Full-surface loading / dim layers |

### Form controls

Core: `Input`, `Textarea`, `Select`, `Toggle`, `Switch`, `Checkbox`, `CheckboxGroup`, `RadioGroup`, `Slider`, `NumberInput`, `CurrencyInput`, `PhoneInput`, `PinInput`, `PasswordInput`, `MaskedInput`, `SearchInput`, `SegmentedControl`, `RatingInput`, `ColorPicker`.

Complex selects: `Combobox`, `MultiSelect`, `TreeSelect`, `MentionInput`.

Date & time: `DatePicker`, `DateRangePicker`, `DateTimePicker`, `TimePicker` (via DatePicker).

Editors: `RichTextEditor`, `MarkdownEditor`, `CodeEditor`, `MarkdownRenderer`.

Capture: `SignaturePad`, `ImageCropper`, `FileUpload`, `Clipboard`.

Forms hook: `useForm()` for controlled-or-uncontrolled form state with validation.

### Navigation

`Tabs`, `TabBar`, `Stepper`, `Breadcrumb`, `BreadcrumbMenu`, `Pagination`, `CursorPagination`, `Menu` (compound), `MenuBar` + `MenuBarMenu`, `MegaMenu`, `NavGroup`, `NavItem`.

### Data display

Tables: `Table`, `DataGrid` (sort / filter / resize / reorder / group / virtualize / persist / export), `TreeTable`, `DataList`, `DescriptionList`, `KeyValue`, `JSONViewer`, `DiffViewer`, `LogViewer`, `Gantt`, `Kanban`, `Heatmap`.

Trees & lists: `TreeView`, `VirtualList` (via DataGrid virtualization), `Sortable`.

Metrics: `Stat`, `StatGroup`, `MetricCard`, `CircularProgress`, `Sparkline`, `ChartContainer`.

Charts (Phase 21 foundations — primitives ready for the chart library shipping in Phases 22–24):

| Primitive | Purpose |
|-----------|---------|
| `ChartFrame` | SVG wrapper, margin accounting, scale context, responsive sizing |
| `Axis` | 1px brutalist axis with nice-ticks for linear / log / time / band / point scales |
| `Gridlines` | X / Y / both, solid or dashed |
| `ChartLegend` | Swatches + labels, interactive toggle, tone variants |
| `ChartTooltip` | Portaled tooltip with viewport-flip + edge-clamp math |
| `Crosshair` | SVG guide lines + point at `(x, y)` in plot-space coords |
| `Brush` | Drag-select range on X or Y axis, controlled + uncontrolled |

Math utilities (thin wrappers over d3-scale / d3-shape / d3-array / d3-time — algorithms only, every rendered element is ours): `linearScale`, `logScale`, `sqrtScale`, `timeScale`, `bandScale`, `pointScale`, `quantizeScale`, `generateTicks`, `stackSeries`, `resolveCurve`, `bisectNearest`, `scanNearest`, `seriesPalette`.

Calendars: `Calendar` (month/week/day views, range selection).

Avatars & media: `Avatar`, `AvatarGroup`, `Image`, `ImageGallery`, `AudioPlayer`, `VideoPlayer`, `DocumentPreview`, `IFrame`, `CodeBlock`.

### Overlays

`Modal`, `Dialog` (compound), `DrawerV2`, `Sheet` (smooth continuous drag on the handle, snaps on release), `PopoverV2`, `HoverCard`, `TooltipV2`, `ContextMenu`, `Menu`, `CommandPalette`, `Spotlight`, `NotificationCenter`, `EmptyState`, `ErrorState`, `ReactionPicker`.

Toasts: `toast()` imperative API, `useToast()` hook, `Toaster` (placement wrapper), `Snackbar` (bottom-center preset), `AlertV2`.

### Interactive & media

`Accordion` (compound), `Carousel`, `Marquee`, `Lightbox`, `Swipeable`, `SwipeActions`, `Zoomable`, `ShareButton`, `Activity`, `MediaPlayer`.

### Chat & AI

Purpose-built surface for Claude-/ChatGPT-/agent-style products. Everything below is in the top-level `voidframe` import.

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

Domain surfaces that round out the tier-1 offering. Everything below is in the top-level `voidframe` import.

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
import { SearchIcon, IconButton, adaptIcon } from "voidframe";
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
} from "voidframe";

<Suspense fallback={<Spinner />}>
  <LazyDataGrid columns={cols} data={rows} />
</Suspense>
```

**Memoized leaves.** High-traffic stateless components — `Button`, `Badge`, `Dots`, `Label`, `Divider`, `Spacer`, `Spinner`, `Kbd`, `Icon` — are wrapped in `React.memo`. Re-renders skip when props are referentially stable, which is the typical case inside tables, feeds, and icon-heavy lists.

**Tree-shaking.** `package.json` declares `sideEffects: ["*.css"]`. Every export is named; barrels re-export without side effects. Bundlers drop unused components automatically — `import { SearchIcon } from "voidframe"` costs you just the icon and its primitive.

**CSS perf hints.** Overlay panels (modals, drawers, popovers, tooltips, toasts, command palette) carry `contain: layout paint` so they don't invalidate the surrounding page on open/close. For virtualized content, opt in to `content-visibility: auto` via `data-content-visibility="auto"` or the `vf-cv-auto` class — browsers skip rendering off-screen descendants entirely.

```jsx
<div data-content-visibility="auto">
  {longList.map((row) => <Row key={row.id} {...row} />)}
</div>
```

**Bundle budgets** (enforced in CI via `npm run size`):

| Entry | Budget |
|---|---|
| Full ESM bundle | ≤150 KB gzipped |
| Stylesheet | ≤25 KB gzipped |
| `import { Button }` only | ≤5 KB gzipped |
| `import { Icon, SearchIcon }` | ≤3 KB gzipped |

Configured in `package.json` → `size-limit`. Run `npm run size` after `npm run build` to verify before shipping a large component.

**Production DCE.** All dev-only `warn()` and `warnOnce()` calls are guarded by `process.env.NODE_ENV !== "production"` — bundlers strip them from production builds entirely, so warning message strings never ship.

### Testing your app against Voidframe

Voidframe ships a `voidframe/testing` subpath with the same helpers used internally — so consuming apps can write tests against our components with the provider, a11y checks, and viewport mocks pre-wired.

```jsx
import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import {
  renderWithTheme,
  expectNoA11yViolations,
  installMatchMedia,
  createMockStorage,
} from "voidframe/testing";
import { MyFeature } from "./MyFeature";

it("renders inside the provider + passes axe", async () => {
  const { container } = renderWithTheme(<MyFeature />, {
    themeName: "light",
    density: "compact",
    direction: "rtl",
  });
  expect(screen.getByRole("button")).toBeInTheDocument();
  await expectNoA11yViolations(container);
});

it("reacts to a viewport resize", () => {
  const ctl = installMatchMedia(320);
  renderWithTheme(<MyFeature />);
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
npm run test              # full vitest suite (1260+ tests)
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
import { VoidframeProvider } from "voidframe";
export function AppProviders({ children }) {
  return <VoidframeProvider>{children}</VoidframeProvider>;
}

// app/layout.tsx
import { AppProviders } from "./providers";
import "voidframe/styles.css";

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

**Remix / Vite SSR / Astro:** identical pattern — import `VoidframeProvider` in a client-only entry, include `voidframe/styles.css` in your root layout, add the theme-sync script inline to `<head>`.

**Pre-hydration theme script.** Prevents the dark→light flash when a user has a persisted or `"system"` theme preference. Inline the script in `<head>` *before* your app bundle — it's shipped at the package root as `voidframe/theme-script.js`:

```html
<!-- via <script src> — shipped at the package root -->
<script src="/node_modules/voidframe/theme-script.js"></script>

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
import { HydrationBoundary } from "voidframe";

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
} from "voidframe";

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
} from "voidframe";

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
} from "voidframe";

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
npm run test      # full vitest suite (1230+ tests)
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

## License

MIT
