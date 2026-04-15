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

**Dev tools:** `CommitGraph`, `NetworkInspector` (JSON headers/body drill-down), `ConsoleOutput` (level filter `"warn+"`), `DebugTree`, `KeyValueEditor`, `QueryBuilder` (AND/OR groups + rules), `ShortcutEditor` (records chords to `mod+shift+k`-style strings with conflict detection).

**Identity:** `UserCard`, `TeamCard`, `OrganizationCard`, `Identicon` (deterministic 5×5 mirrored pattern), `PresenceList` (grouped by status, maxVisible + overflow).

**Numeric:** `NumberDisplay`, `CurrencyDisplay`, `PercentDisplay` (all locale-aware with auto-tone), `BigNumber` (hero metric with unit + delta + optional sparkline slot).

**Time:** `TimeZoneSelect` (searchable, Intl-driven), `RelativeTime` (auto-updating, pure `Intl.RelativeTimeFormat`), `DurationDisplay` (`hms`/`compact`/`long`), `Countdown`.

**Help & changelog:** `HelpTooltip` (CSS-positioned ? icon), `ContextHelp` (side-panel pattern), `Changelog` (per-entry `added`/`fixed`/`changed`/`removed`/`security`/`deprecated`), `WhatsNewPopover` (once-per-version, persists via injected storage for tests/SSR).

**Encoding:** `QRCode`, `Barcode` — both render placeholder patterns by default and accept a pre-computed `matrix` / `pattern` so consumers can pipe in output from a peer dep (`qrcode-generator`, `jsbarcode`) without bundling it.

**Color:** `ColorSwatch`, `Palette`.

**Rich embeds:** `LegalText`, `Mermaid` (accepts a `loader` prop to lazy-resolve the peer dep at runtime).

**Widgets:** `WidgetShell` (loading / error / empty states, optional drag + resize handles), `DashboardGrid` (CSS-grid placement, optional drag-to-swap), `packLayout` / `usePackedLayout` helpers.

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

// JS-resolved responsive layout — walks the ladder to pick the active value.
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
npm run test      # full vitest suite (1180+ tests)
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
