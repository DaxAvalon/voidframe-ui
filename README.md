# VOIDFRAME

Dark monochrome React UI framework. Terminal-brutalist. Data-dense. Zero border-radius. Monospace-first.

Built for dashboards, dev tools, data interfaces, internal consoles, and anything that needs to feel like it was forged from the void.

**150+ accessible components** across primitives, layout, forms, navigation, data, overlays, and interaction. WAI-ARIA patterns. Controllable / uncontrollable duality on every input. Compound APIs on every complex surface. No runtime dependencies beyond React.

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

### Custom Themes

Override any token via `createTheme()`:

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

### Light Theme

```jsx
import { VoidframeProvider, lightTheme } from "voidframe";

<VoidframeProvider theme={lightTheme}>
  <App />
</VoidframeProvider>
```

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

Calendars: `Calendar` (month/week/day views, range selection).

Avatars & media: `Avatar`, `AvatarGroup`, `Image`, `ImageGallery`, `AudioPlayer`, `VideoPlayer`, `DocumentPreview`, `IFrame`, `CodeBlock`.

### Overlays

`Modal`, `Dialog` (compound), `DrawerV2`, `Sheet`, `PopoverV2`, `HoverCard`, `TooltipV2`, `ContextMenu`, `Menu`, `CommandPalette`, `Spotlight`, `NotificationCenter`, `EmptyState`, `ErrorState`, `ReactionPicker`.

Toasts: `toast()` imperative API, `useToast()` hook, `Toaster` (placement wrapper), `Snackbar` (bottom-center preset), `AlertV2`.

### Interactive & media

`Accordion` (compound), `Carousel`, `Marquee`, `Lightbox`, `Swipeable`, `SwipeActions`, `Zoomable`, `ShareButton`, `Activity`, `MediaPlayer`.

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
npm run test      # full vitest suite (1000+ tests)
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
