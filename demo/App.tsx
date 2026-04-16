/**
 * VOIDFRAME DEMO APP
 *
 * Section-by-section showcase of the entire component surface from
 * Phase 0 to the latest shipped phase. Run with `docker compose up demo`
 * (which boots Vite on port 5173).
 *
 * Adding a section: write the section component and append it to the
 * `SECTIONS` registry near the bottom.
 */

import { useMemo, useState, type ComponentProps, type ReactNode } from "react";
import "../src/css/index.css";
import {
  Accordion,
  Activity,
  AlertV2,
  AppShell,
  AspectRatio,
  AudioPlayer,
  Avatar,
  AvatarGroup,
  Backdrop,
  Badge,
  BannerAlert,
  Box,
  Breadcrumb,
  Button,
  ButtonGroup,
  Calendar,
  Callout,
  Card,
  Carousel,
  Checkbox,
  CheckboxGroup,
  CircularProgress,
  Clipboard,
  Code,
  CodeBlock,
  CodeEditor,
  ColorPicker,
  Combobox,
  CommandPalette,
  ConfirmProvider,
  ConnectionStatus,
  Container,
  ErrorBoundary,
  CurrencyInput,
  CursorPagination,
  DataGrid,
  DataList,
  DatePicker,
  DateRangePicker,
  DateTimePicker,
  DescriptionList,
  Dialog,
  DiffViewer,
  Divider,
  DocumentPreview,
  Dots,
  DrawerV2,
  EmptyState,
  ErrorState,
  FileUpload,
  Flex,
  Gantt,
  Gauge,
  Grid,
  HStack,
  HoverCard,
  IFrame,
  Image,
  ImageCropper,
  ImageGallery,
  Input,
  JSONViewer,
  Kanban,
  KeyValue,
  Label,
  LoadingOverlay,
  LogViewer,
  MarkdownEditor,
  MarkdownRenderer,
  Marquee,
  MaskedInput,
  Menu,
  MenuBar,
  MenuBarMenu,
  MentionInput,
  MetricCard,
  Modal,
  MultiSelect,
  NavGroup,
  NavItem,
  Navbar,
  NotificationCenter,
  NumberInput,
  OfflineBanner,
  PageHeader,
  Pagination,
  PasswordInput,
  PhoneInput,
  PinInput,
  PopoverV2,
  Progress,
  Quote,
  RadioGroup,
  RatingInput,
  ReactionPicker,
  ResizableBox,
  ResizableGroup,
  ResizableHandle,
  ResizablePanel,
  ScrollArea,
  ScrollIndicator,
  ScrollRow,
  ScrollSpy,
  SearchInput,
  SegmentBar,
  SegmentedControl,
  SegmentedProgress,
  Select,
  ShareButton,
  Sheet,
  Shimmer,
  Shortcut,
  ShortcutGuide,
  ShortcutProvider,
  Sidebar,
  SignaturePad,
  Skeleton,
  Slider,
  Sortable,
  Spinner,
  SpinnerV2,
  SplitView,
  Stack,
  Stat,
  StatGroup,
  StatusBar,
  StatusIndicator,
  Stepper,
  Swipeable,
  Switch,
  TabBar,
  Table,
  Tabs,
  Tag,
  TagInput,
  Terminal,
  Text,
  Textarea,
  TimePicker,
  Timeline,
  Toaster,
  Toggle,
  Toolbar,
  TreeNav,
  TreeSelect,
  TreeTable,
  TreeView,
  TrendIndicator,
  Ticker,
  Typewriter,
  UserMenu,
  VStack,
  VideoPlayer,
  VirtualList,
  VoiceWaveform,
  VoidframeProvider,
  Wizard,
  Zoomable,
  toast,
  useConfirm,
  warnOnce,
  // Phase 17: i18n
  LOCALE_PACKS,
  formatCurrency,
  formatDate,
  formatRelativeTime,
  pluralize,
  useMessages,
  type LocalePack,
  // Phase 16: responsive
  BREAKPOINTS,
  Hide,
  ResponsiveBox,
  Show,
  useBreakpoint,
  useDeviceType,
  useResponsive,
  // Phase 15: theming
  ThemeScope,
  ThemeSelector,
  darkTheme,
  lightTheme,
  midnightTheme,
  greyTheme,
  useThemePersistence,
  // Phase 14: icons
  Icon,
  IconButton,
  IconGroup,
  ArrowLeftIcon,
  ArrowRightIcon,
  BellIcon,
  BoldIcon,
  CaretIcon,
  CalendarIcon,
  ChartBarIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  ClockIcon,
  CloudIcon,
  CodeIcon,
  CopyIcon,
  DatabaseIcon,
  DownloadIcon,
  EditIcon,
  ErrorIcon,
  EyeIcon,
  FileIcon,
  FilterIcon,
  FolderIcon,
  HeartIcon,
  HomeIcon,
  InfoIcon,
  LinkIcon,
  LoadingDotsIcon,
  LockIcon,
  MailIcon,
  MenuIcon,
  MessageIcon,
  MoonIcon,
  MoreHorizontalIcon,
  PauseIcon,
  PinIcon,
  PlayIcon,
  PlusIcon,
  QuestionIcon,
  RefreshIcon,
  SaveIcon,
  SearchIcon,
  SendIcon,
  SettingsIcon,
  ShareIcon,
  SortIcon,
  SpinnerIcon,
  StarIcon,
  StopIcon,
  SunIcon,
  SuccessIcon,
  TerminalIcon,
  TrashIcon,
  UploadIcon,
  UserIcon,
  UsersIcon,
  WarningIcon,
  XIcon,
  // Phase 13: specialty
  Barcode,
  BigNumber,
  Changelog,
  ColorSwatch,
  CommitGraph,
  ConsoleOutput,
  ContextHelp,
  Countdown,
  CurrencyDisplay,
  DashboardGrid,
  DebugTree,
  DurationDisplay,
  HelpTooltip,
  Identicon,
  KeyValueEditor,
  LegalText,
  NetworkInspector,
  NumberDisplay,
  OrganizationCard,
  Palette,
  PercentDisplay,
  PresenceList,
  PrintButton,
  PrintLayout,
  QRCode,
  QueryBuilder,
  RelativeTime,
  ShortcutEditor,
  TeamCard,
  TimeZoneSelect,
  UserCard,
  WhatsNewPopover,
  WidgetShell,
  packLayout,
  // Phase 12: chat & AI
  AgentRunner,
  AgentStep,
  AgentTrace,
  AttachmentList,
  ChatLayout,
  ChatTokenCounter,
  Citation,
  CitationList,
  Composer,
  ComposerAttachment,
  ComposerMicButton,
  Conversation,
  ConversationEmptyState,
  ConversationHeader,
  ContextWindow,
  CostDisplay,
  DebugPanel,
  FileAttachment,
  ImageAttachment,
  LatencyIndicator,
  Mention,
  Message,
  MessageActions,
  MessageContent,
  MessageEdit,
  MessageFeedback,
  MessageGroup,
  MessageList,
  ModelSelector,
  PlanDisplay,
  PromptTemplateList,
  RAGContext,
  ReactionBar,
  ReasoningTrace,
  RegenerateButton,
  SessionList,
  SimpleChat,
  SlashCommandPicker,
  SourceCard,
  SourceGrid,
  StopButton,
  StreamingText,
  SubmitButton,
  SuggestionChips,
  SystemPromptEditor,
  ThinkingIndicator,
  ToolCall,
  ToolCallGroup,
  TraceViewer,
  UnreadBadge,
} from "../src";
import {
  DevPanel,
  DevErrorFallback,
  ProfilerScope,
  useRenderProfiler,
} from "../src/dev";
import {
  AreaChart,
  BarChart,
  BoxPlot,
  BubbleChart,
  CalendarHeatmap,
  CandlestickChart,
  ChartFrame,
  ChartLegend,
  ChartTooltip,
  ChordDiagram,
  ComposedChart,
  DonutChart,
  FunnelChart,
  Histogram,
  HorizonChart,
  LineChart,
  OHLCChart,
  ParallelCoordinates,
  PieChart,
  RadarChart,
  Sankey,
  ScatterMatrix,
  ScatterPlot,
  SmallMultiples,
  StreamGraph,
  Sunburst,
  TreeMap,
  ViolinPlot,
  WaterfallChart,
  DependencyGraph,
  NetworkGraph,
  TileGridMap,
  US_STATES_GRID,
  Axis,
  Brush,
  Crosshair,
  Gridlines,
  bandScale,
  linearScale,
  seriesPalette,
  Heatmap,
  Sparkline,
} from "../src/charts";
import type {
  CalendarHeatmapCell,
  WaterfallStep,
  NetworkNode,
  NetworkLink,
  DependencyNode,
  DependencyEdge,
} from "../src/charts";

// ── Section helpers ─────────────────────────────────────────

interface DemoSection {
  id: string;
  group: string;
  title: string;
  render: () => ReactNode;
}

function Frame({
  title,
  description,
  children,
}: {
  title: string;
  description?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <header
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 4,
          paddingBottom: 12,
          borderBottom: "1px solid var(--vf-border-1)",
        }}
      >
        <Text size="lg" upper spacing={3} color="var(--vf-text-0)">
          {title}
        </Text>
        {description && (
          <Text size="sm" color="var(--vf-text-3)">
            {description}
          </Text>
        )}
      </header>
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {children}
      </div>
    </section>
  );
}

function Block({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <Label>{label}</Label>
      <div
        style={{
          padding: 16,
          border: "1px solid var(--vf-border-1)",
          background: "var(--vf-bg-2)",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {children}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SECTIONS
// ─────────────────────────────────────────────────────────────

function FoundationsSection() {
  return (
    <Frame title="Foundations" description="Text + label primitives, dividers, spacers.">
      <Block label="Text">
        <Text size="xl" color="var(--vf-text-0)">Extra-large heading</Text>
        <Text size="lg">Large body text</Text>
        <Text size="md">Default body text</Text>
        <Text size="sm" color="var(--vf-text-3)">Small muted text</Text>
        <Text size="xs" upper spacing={2}>Eyebrow caps</Text>
      </Block>
      <Block label="Label">
        <Label>Section label</Label>
      </Block>
      <Block label="Divider">
        <Text>Above</Text>
        <Divider />
        <Text>Below</Text>
        <Divider label="OR" />
        <Flex gap={8} align="center">
          <span>A</span>
          <Divider orientation="vertical" />
          <span>B</span>
        </Flex>
      </Block>
    </Frame>
  );
}

function LayoutSection() {
  return (
    <Frame title="Layout" description="Boxes, stacks, grids, scroll regions, resizable splits.">
      <Block label="Box / HStack / VStack / Stack / Flex / Grid">
        <Flex gap={8}>
          <Box style={{ padding: 8, background: "var(--vf-bg-3)" }}>Box</Box>
          <HStack gap={8}>
            <span>H</span><span>S</span><span>T</span>
          </HStack>
          <VStack gap={4}>
            <span>V</span><span>S</span>
          </VStack>
          <Stack gap={4}>
            <span>Stack</span>
          </Stack>
        </Flex>
        <Grid columns={3} gap={8}>
          {[1, 2, 3].map((n) => (
            <div key={n} style={{ padding: 8, background: "var(--vf-bg-3)" }}>
              Cell {n}
            </div>
          ))}
        </Grid>
      </Block>
      <Block label="Container / AspectRatio">
        <Container maxWidth="md" style={{ background: "var(--vf-bg-3)", padding: 8 }}>
          maxWidth=md
        </Container>
        <div style={{ width: 240 }}>
          <AspectRatio ratio={16 / 9}>
            <div style={{ width: "100%", height: "100%", background: "var(--vf-bg-3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              16:9
            </div>
          </AspectRatio>
        </div>
      </Block>
      <Block label="ScrollArea">
        <ScrollArea height={120}>
          <div style={{ height: 400, padding: 8 }}>
            Scroll me — content is 400px tall in a 120px region.
          </div>
        </ScrollArea>
      </Block>
      <Block label="ResizableGroup">
        <div style={{ height: 160 }}>
          <ResizableGroup>
            <ResizablePanel>
              <div style={{ padding: 12 }}>Left</div>
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel>
              <div style={{ padding: 12 }}>Right</div>
            </ResizablePanel>
          </ResizableGroup>
        </div>
      </Block>
      <Block label="ResizableBox (axis='both')">
        <Flex gap={16} wrap>
          <ResizableBox
            axis="both"
            defaultWidth={220}
            defaultHeight={140}
            minWidth={120}
            minHeight={80}
          >
            <div style={{ padding: 12 }}>
              <Label>BOTH</Label>
              <Text size="sm" color="var(--vf-text-3)">
                Drag the right edge, bottom edge, or corner.
              </Text>
            </div>
          </ResizableBox>
          <ResizableBox
            axis="x"
            defaultWidth={180}
            defaultHeight={120}
            minWidth={100}
          >
            <div style={{ padding: 12 }}>
              <Label>X ONLY</Label>
            </div>
          </ResizableBox>
          <ResizableBox
            axis="y"
            defaultWidth={180}
            defaultHeight={120}
            minHeight={80}
          >
            <div style={{ padding: 12 }}>
              <Label>Y ONLY</Label>
            </div>
          </ResizableBox>
        </Flex>
      </Block>
      <Block label="SplitView (legacy)">
        <div style={{ height: 160, border: "1px solid var(--vf-border-2)" }}>
          <SplitView
            sidebarWidth="180px"
            gap={0}
            left={
              <div
                style={{
                  padding: 12,
                  background: "var(--vf-bg-2)",
                  height: "100%",
                }}
              >
                <Label>SIDEBAR</Label>
                <Text size="sm" color="var(--vf-text-3)">
                  Fixed-width left column.
                </Text>
              </div>
            }
            right={
              <div
                style={{
                  padding: 12,
                  background: "var(--vf-bg-1)",
                  height: "100%",
                }}
              >
                <Label>MAIN</Label>
                <Text size="sm">Fluid right column — takes remaining width.</Text>
              </div>
            }
          />
        </div>
      </Block>
    </Frame>
  );
}

function ButtonGroupDemo() {
  const [v, setV] = useState("day");
  return (
    <ButtonGroup
      value={v}
      onChange={setV}
      options={[
        { key: "day", label: "Day" },
        { key: "week", label: "Week" },
        { key: "month", label: "Month" },
      ]}
    />
  );
}

function ButtonsSection() {
  return (
    <Frame title="Buttons & Indicators" description="Buttons, badges, status indicators, dot stacks.">
      <Block label="Button variants">
        <Flex gap={8} wrap>
          <Button>Default</Button>
          <Button variant="solid">Solid</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="accent" accent="#4ade80">Accent</Button>
          <Button disabled>Disabled</Button>
        </Flex>
      </Block>
      <Block label="ButtonGroup (segmented)">
        <ButtonGroupDemo />
      </Block>
      <Block label="Badge variants">
        <Flex gap={8}>
          <Badge>Default</Badge>
          <Badge tone="success">Success</Badge>
          <Badge tone="warning" variant="outline">Outline</Badge>
          <Badge tone="danger" variant="subtle">Subtle</Badge>
          <Badge dot tone="info">With dot</Badge>
        </Flex>
      </Block>
      <Block label="StatusIndicator + Dots">
        <Flex gap={12}>
          <StatusIndicator status="online" label="Online" />
          <StatusIndicator status="busy" label="Busy" />
          <StatusIndicator status="loading" label="Syncing" />
          <Dots count={4} />
        </Flex>
      </Block>
    </Frame>
  );
}

function ContainersSection() {
  return (
    <Frame title="Containers" description="Cards, scrolling rows, status & segment bars, banners, callouts.">
      <Block label="Card">
        <Card title="DEPLOYMENT" subtitle="Production">
          <Text>Last deployed 3 hours ago by the autopilot agent.</Text>
        </Card>
      </Block>
      <Block label="StatusBar / SegmentBar">
        <StatusBar
          items={[
            { label: "BRANCH", value: "main" },
            { label: "BUILD", value: "passing", color: "var(--vf-success)" },
            { label: "OPS", value: "12 active" },
          ]}
        />
        <SegmentBar
          segments={[
            { label: "DONE", span: 60, color: "var(--vf-success)" },
            { label: "BLOCKED", span: 15, color: "var(--vf-danger)" },
            { label: "TODO", span: 25 },
          ]}
        />
      </Block>
      <Block label="ScrollRow">
        <ScrollRow gap={8}>
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              style={{
                padding: 16,
                background: "var(--vf-bg-3)",
                minWidth: 100,
                whiteSpace: "nowrap",
              }}
            >
              Item {i + 1}
            </div>
          ))}
        </ScrollRow>
      </Block>
      <Block label="BannerAlert + Callout + Quote + AlertV2">
        <BannerAlert tone="warning" dismissible>
          Scheduled maintenance at 2 PM UTC.
        </BannerAlert>
        <Callout title="Tip" tone="info">
          Press <Code inline>?</Code> to open the keyboard guide.
        </Callout>
        <Quote source="— Voidframe">
          Dark monochrome React UI framework. Terminal-brutalist. Data-dense.
        </Quote>
        <AlertV2 tone="success" title="Saved">
          Your changes are committed.
        </AlertV2>
      </Block>
    </Frame>
  );
}

function FormsCoreSection() {
  const [val, setVal] = useState("");
  const [tog, setTog] = useState(false);
  const [sel, setSel] = useState("opt2");
  return (
    <Frame title="Forms — Core" description="Input, Textarea, Toggle, Select.">
      <Block label="Input + Textarea + Select + Toggle">
        <Input label="Name" value={val} onChange={(e) => setVal(e.target.value)} />
        <Textarea label="Notes" defaultValue="The void is patient." />
        <Select
          label="Option"
          value={sel}
          onChange={setSel}
          options={[
            { value: "opt1", label: "Option 1" },
            { value: "opt2", label: "Option 2" },
            { value: "opt3", label: "Option 3" },
          ]}
        />
        <Toggle label="Notify me" checked={tog} onChange={setTog} />
      </Block>
    </Frame>
  );
}

interface TreeRow {
  id: string;
  name: string;
  children?: TreeRow[];
}

function TreeTableDemo() {
  const data: TreeRow[] = [
    {
      id: "a",
      name: "Root",
      children: [
        { id: "a1", name: "Child 1" },
        { id: "a2", name: "Child 2" },
      ],
    },
    { id: "b", name: "Sibling" },
  ];
  return (
    <TreeTable
      columns={[{ key: "name", header: "Name" }]}
      data={data}
      getChildren={(r) => r.children}
      rowKey={(r) => r.id}
      defaultExpanded={["a"]}
    />
  );
}

function TabsDemo() {
  const [active, setActive] = useState("overview");
  return (
    <div>
      <Tabs
        active={active}
        onChange={setActive}
        tabs={[
          { key: "overview", label: "Overview" },
          { key: "details", label: "Details" },
          { key: "logs", label: "Logs" },
        ]}
      />
      <div style={{ padding: 12 }}>
        {active === "overview" && <Text>Overview content</Text>}
        {active === "details" && <Text>Details content</Text>}
        {active === "logs" && <Text>Logs content</Text>}
      </div>
    </div>
  );
}

function SearchInputDemo() {
  const [q, setQ] = useState("");
  return (
    <SearchInput
      value={q}
      onChange={(e) => setQ(e.target.value)}
      placeholder="Type to search…"
    />
  );
}

function FormsExtendedSection() {
  const [check, setCheck] = useState(true);
  const [pick, setPick] = useState("a");
  const [n, setN] = useState(0);
  const [s, setS] = useState(40);
  const [tags, setTags] = useState<string[]>(["alpha", "beta"]);
  return (
    <Frame title="Forms — Extended" description="Checkbox, Radio, Slider, Number, Search, Switch, Pin, Tags.">
      <Block label="Checkbox / Radio">
        <Checkbox label="Subscribe" checked={check} onChange={setCheck} />
        <RadioGroup
          label="Plan"
          value={pick}
          onChange={setPick}
          options={[
            { value: "a", label: "Free" },
            { value: "b", label: "Pro" },
            { value: "c", label: "Team" },
          ]}
        />
        <CheckboxGroup
          label="Languages"
          defaultValue={["ts"]}
          options={[
            { value: "ts", label: "TypeScript" },
            { value: "go", label: "Go" },
            { value: "rs", label: "Rust" },
          ]}
        />
      </Block>
      <Block label="Number / Slider / Search">
        <NumberInput label="Quantity" value={n} onChange={setN} min={0} max={100} />
        <Slider label="Volume" value={s} onChange={setS} max={100} />
        <SearchInputDemo />
      </Block>
      <Block label="Switch / Segmented / Password / Pin / Tags">
        <Switch label="Dark mode" defaultChecked />
        <SegmentedControl
          defaultValue="grid"
          options={[
            { value: "grid", label: "Grid" },
            { value: "list", label: "List" },
            { value: "kanban", label: "Kanban" },
          ]}
        />
        <PasswordInput label="Password" />
        <PinInput label="OTP" length={4} />
        <TagInput label="Tags" value={tags} onChange={setTags} />
      </Block>
    </Frame>
  );
}

function FormsDateTimeSection() {
  return (
    <Frame title="Forms — Date / Time" description="DatePicker family.">
      <Block label="Single date / range / time / datetime">
        <DatePicker label="Date" />
        <DateRangePicker label="Range" />
        <TimePicker label="Time" defaultValue="14:30" />
        <DateTimePicker label="When" defaultValue={new Date(2026, 2, 7, 14, 30)} />
      </Block>
    </Frame>
  );
}

function FormsComplexSection() {
  const fruits = [
    { value: "apple", label: "Apple" },
    { value: "banana", label: "Banana" },
    { value: "cherry", label: "Cherry" },
  ];
  const tree = [
    {
      value: "fruits",
      label: "Fruits",
      children: fruits,
    },
    {
      value: "veg",
      label: "Vegetables",
      children: [{ value: "carrot", label: "Carrot" }],
    },
  ];
  return (
    <Frame title="Forms — Complex" description="Combobox, MultiSelect, TreeSelect, masked inputs, rating.">
      <Block label="Combobox / MultiSelect / TreeSelect">
        <Combobox label="Fruit" options={fruits} />
        <MultiSelect label="Fruits" options={fruits} defaultValue={["apple"]} />
        <TreeSelect label="Category" nodes={tree} />
      </Block>
      <Block label="Mask / Currency / Phone / Rating">
        <MaskedInput label="SSN" mask="###-##-####" />
        <CurrencyInput label="Price" currency="USD" defaultValue={1234.5} />
        <PhoneInput label="Phone" />
        <RatingInput label="Rating" defaultValue={3} />
      </Block>
    </Frame>
  );
}

function FormsEditorsSection() {
  return (
    <Frame title="Forms — Editors" description="Markdown, code, mention, color.">
      <Block label="MarkdownEditor">
        <MarkdownEditor
          label="Notes"
          defaultValue={"# Heading\n\nBody **bold**."}
          minHeight={140}
        />
      </Block>
      <Block label="CodeEditor">
        <CodeEditor
          label="Source"
          defaultValue={`const greet = (n: string) => "Hello " + n;\ngreet("void");`}
        />
      </Block>
      <Block label="MentionInput">
        <MentionInput
          label="Message"
          options={[
            { value: "alice", label: "Alice" },
            { value: "bob", label: "Bob", description: "Engineer" },
          ]}
        />
      </Block>
      <Block label="ColorPicker">
        <ColorPicker label="Accent" defaultValue="#4ade80" />
      </Block>
    </Frame>
  );
}

function FormsCaptureSection() {
  return (
    <Frame title="Forms — Capture & Files" description="SignaturePad, ImageCropper, FileUpload.">
      <Block label="FileUpload">
        <FileUpload label="Upload" />
      </Block>
      <Block label="ImageCropper">
        <ImageCropper label="Pick an image" />
      </Block>
      <Block label="SignaturePad">
        <SignaturePad label="Sign" height={120} />
      </Block>
    </Frame>
  );
}

function PaginationDemo() {
  const [page, setPage] = useState(3);
  return (
    <Pagination
      page={page}
      totalPages={10}
      onChange={setPage}
      siblingCount={1}
      showFirstLast
    />
  );
}

function NavigationSection() {
  return (
    <Frame title="Navigation" description="Breadcrumbs, pagination, steppers, menus, tabs, navbars, sidebars.">
      <Block label="Breadcrumb / Pagination / Stepper">
        <Breadcrumb
          items={[
            { label: "Home" },
            { label: "Users" },
            { label: "Alice" },
          ]}
        />
        <PaginationDemo />
        <Stepper steps={["Account", "Profile", "Confirm"]} current={1} />
      </Block>
      <Block label="CursorPagination / TabBar">
        <CursorPagination hasPrev hasNext />
        <TabBar defaultValue="home">
          <TabBar.Item value="home">Home</TabBar.Item>
          <TabBar.Item value="search">Search</TabBar.Item>
          <TabBar.Item value="me">Profile</TabBar.Item>
        </TabBar>
      </Block>
      <Block label="Tabs">
        <TabsDemo />
      </Block>
      <Block label="Menu / MenuBar">
        <Menu>
          <Menu.Trigger>Actions</Menu.Trigger>
          <Menu.Content>
            <Menu.Item>Copy</Menu.Item>
            <Menu.Item>Paste</Menu.Item>
            <Menu.Separator />
            <Menu.Item>Delete</Menu.Item>
          </Menu.Content>
        </Menu>
        <MenuBar>
          <MenuBarMenu trigger="File">
            <Menu.Item>New</Menu.Item>
            <Menu.Item>Open</Menu.Item>
          </MenuBarMenu>
          <MenuBarMenu trigger="Edit">
            <Menu.Item>Undo</Menu.Item>
            <Menu.Item>Redo</Menu.Item>
          </MenuBarMenu>
        </MenuBar>
      </Block>
      <Block label="Toolbar">
        <Toolbar>
          <Toolbar.Button>B</Toolbar.Button>
          <Toolbar.Button>I</Toolbar.Button>
          <Toolbar.Separator />
          <Toolbar.ToggleGroup type="single" defaultValue="left">
            <Toolbar.ToggleItem value="left">L</Toolbar.ToggleItem>
            <Toolbar.ToggleItem value="center">C</Toolbar.ToggleItem>
            <Toolbar.ToggleItem value="right">R</Toolbar.ToggleItem>
          </Toolbar.ToggleGroup>
        </Toolbar>
      </Block>
      <Block label="NavItem / NavGroup / Navbar / TreeNav / UserMenu / Shortcut">
        <Navbar>
          <Navbar.Brand>VF</Navbar.Brand>
          <Navbar.Links>
            <Navbar.Link href="#" active>Home</Navbar.Link>
            <Navbar.Link href="#">Docs</Navbar.Link>
          </Navbar.Links>
          <Navbar.Actions>
            <Button variant="ghost">Sign in</Button>
          </Navbar.Actions>
        </Navbar>
        <NavGroup title="Settings">
          <NavItem icon="⚙">Preferences</NavItem>
          <NavItem badge={<Badge tone="info">3</Badge>}>Notifications</NavItem>
        </NavGroup>
        <TreeNav
          items={[
            {
              id: "src",
              label: "src",
              children: [
                { id: "src/index.ts", label: "index.ts" },
                { id: "src/app.tsx", label: "app.tsx" },
              ],
            },
            { id: "readme", label: "README.md" },
          ]}
          activeId="src/index.ts"
        />
        <Flex gap={12} align="center">
          <UserMenu user={{ name: "Alice", email: "alice@void.dev" }}>
            <UserMenu.Item>Profile</UserMenu.Item>
            <UserMenu.Separator />
            <UserMenu.Item>Sign out</UserMenu.Item>
          </UserMenu>
          <Shortcut keys="mod+k" />
        </Flex>
      </Block>
      <Block label="Wizard">
        <Wizard defaultValue="a">
          <Wizard.Step id="a">
            <Text>Step A</Text>
          </Wizard.Step>
          <Wizard.Step id="b">
            <Text>Step B</Text>
          </Wizard.Step>
          <Wizard.Step id="c">
            <Text>Step C</Text>
          </Wizard.Step>
          <Wizard.Footer>
            <Wizard.Previous />
            <Wizard.StepIndicator />
            <Wizard.Next />
          </Wizard.Footer>
        </Wizard>
      </Block>
      <Block label="ScrollSpy">
        <ScrollSpy>
          <ScrollSpy.List>
            <ScrollSpy.Item target="intro">Introduction</ScrollSpy.Item>
            <ScrollSpy.Item target="usage">Usage</ScrollSpy.Item>
          </ScrollSpy.List>
        </ScrollSpy>
      </Block>
    </Frame>
  );
}

function DataTablesSection() {
  const rows = [
    { id: "1", name: "Alpha", count: 30 },
    { id: "2", name: "Beta", count: 12 },
    { id: "3", name: "Gamma", count: 5 },
  ];
  return (
    <Frame title="Data — Tables" description="Table, DataGrid, TreeTable.">
      <Block label="Table (sortable)">
        <Table
          columns={[
            { key: "name", header: "Name", sortable: true },
            { key: "count", header: "Count", sortable: true, align: "right" },
          ]}
          data={rows}
          striped
        />
      </Block>
      <Block label="DataGrid (sort + filter + selection)">
        <DataGrid
          columns={[
            { key: "name", header: "Name", sortable: true, filterable: true },
            { key: "count", header: "Count", sortable: true, align: "right" },
          ]}
          data={rows}
          rowKey={(r) => r.id}
          rowSelection="multi"
        />
      </Block>
      <Block label="TreeTable">
        <TreeTableDemo />
      </Block>
    </Frame>
  );
}

function DataListsSection() {
  return (
    <Frame title="Data — Trees & Lists" description="TreeView, VirtualList, DataList, KeyValue.">
      <Block label="TreeView">
        <TreeView
          items={[
            {
              id: "a",
              label: "src",
              children: [
                { id: "a1", label: "components" },
                { id: "a2", label: "hooks" },
              ],
            },
            { id: "b", label: "README.md" },
          ]}
          defaultExpanded={["a"]}
        />
      </Block>
      <Block label="VirtualList (1000 items)">
        <div style={{ height: 160 }}>
          <VirtualList
            items={Array.from({ length: 1000 }, (_, i) => `Row ${i + 1}`)}
            itemHeight={28}
            renderItem={(item, _, style) => (
              <div key={item} style={{ ...style, padding: "4px 8px" }}>
                {item}
              </div>
            )}
          />
        </div>
      </Block>
      <Block label="DataList / DescriptionList / KeyValue">
        <DataList
          items={[
            { label: "Name", value: "Alice" },
            { label: "Email", value: "alice@void.dev" },
          ]}
        />
        <DescriptionList>
          <DescriptionList.Term>Server</DescriptionList.Term>
          <DescriptionList.Description>edge-01</DescriptionList.Description>
        </DescriptionList>
        <KeyValue
          items={[
            { key: "BUILD", value: "passing" },
            { key: "BRANCH", value: "main" },
          ]}
        />
      </Block>
    </Frame>
  );
}

function MetricsSection() {
  return (
    <Frame title="Data — Metrics" description="Stat, MetricCard, progress family, Gauge, TrendIndicator.">
      <Block label="Stat / StatGroup">
        <StatGroup>
          <Stat label="Users" value="12,847" change={8.2} trend={[1, 3, 2, 5, 4, 6]} />
          <Stat label="Revenue" value="$42K" change={-2.5} />
        </StatGroup>
      </Block>
      <Block label="MetricCard">
        <MetricCard
          title="Active sessions"
          value={1234}
          delta={{ value: 4.2, direction: "up" }}
          subtitle="last 7 days"
        />
      </Block>
      <Block label="Progress / CircularProgress / SegmentedProgress / Gauge">
        <Progress value={68} label="Build" showValue />
        <Flex gap={16} align="center">
          <CircularProgress value={42} showLabel />
          <Gauge value={72} />
        </Flex>
        <SegmentedProgress
          segments={[
            { value: 30, label: "DONE", tone: "success" },
            { value: 20, label: "IN PROGRESS", tone: "warning" },
            { value: 50, label: "TODO" },
          ]}
          showLabels
        />
      </Block>
      <Block label="TrendIndicator">
        <Flex gap={16}>
          <TrendIndicator value={12.5} />
          <TrendIndicator value={-3.1} />
        </Flex>
      </Block>
    </Frame>
  );
}

function ChartsSection() {
  const salesData = [
    { category: "Jan", mobile: 30, desktop: 52, tablet: 14 },
    { category: "Feb", mobile: 45, desktop: 60, tablet: 18 },
    { category: "Mar", mobile: 52, desktop: 48, tablet: 20 },
    { category: "Apr", mobile: 68, desktop: 72, tablet: 22 },
    { category: "May", mobile: 75, desktop: 80, tablet: 28 },
    { category: "Jun", mobile: 90, desktop: 94, tablet: 34 },
  ];
  const timeSeries = Array.from({ length: 30 }, (_, i) => {
    const t = i;
    return {
      x: t,
      users: 100 + Math.sin(t / 4) * 30 + t * 2,
      sessions: 80 + Math.cos(t / 3) * 20 + t * 1.5,
    };
  });
  const scatterData = Array.from({ length: 30 }, (_, i) => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 10 + Math.random() * 40,
  }));
  const pieData = [
    { key: "infra", label: "Infra", value: 42 },
    { key: "research", label: "Research", value: 28 },
    { key: "design", label: "Design", value: 18 },
    { key: "ops", label: "Ops", value: 12 },
  ];
  const histogramValues = Array.from({ length: 400 }, () => {
    // roughly bell-shaped
    return (Math.random() + Math.random() + Math.random()) / 3;
  });
  const radarValues = {
    alice: [80, 65, 90, 70, 55, 85],
    bob: [60, 85, 60, 80, 70, 60],
  };
  const calHeatmapStart = new Date(2026, 0, 1);
  const calHeatmapEnd = new Date(2026, 3, 30);
  const calHeatmapData: CalendarHeatmapCell[] = [];
  for (let i = 0; i < 120; i++) {
    const d = new Date(calHeatmapStart);
    d.setDate(d.getDate() + i);
    if (Math.random() > 0.2) {
      calHeatmapData.push({ date: d, value: Math.floor(Math.random() * 12) });
    }
  }
  return (
    <Frame
      title="Data — Charts"
      description="Hand-rolled SVG chart library. BarChart, LineChart, AreaChart, ScatterPlot, BubbleChart, ComposedChart, PieChart, DonutChart, RadarChart, Histogram, CalendarHeatmap, Sparkline, Heatmap."
    >
      <Block label="BarChart — grouped">
        <BarChart
          data={salesData}
          series={[
            { key: "mobile", label: "Mobile" },
            { key: "desktop", label: "Desktop" },
            { key: "tablet", label: "Tablet" },
          ]}
          height={260}
        />
      </Block>
      <Block label="BarChart — stacked 100%">
        <BarChart
          data={salesData}
          series={[
            { key: "mobile", label: "Mobile" },
            { key: "desktop", label: "Desktop" },
            { key: "tablet", label: "Tablet" },
          ]}
          mode="100%-stacked"
          height={260}
        />
      </Block>
      <Block label="BarChart — horizontal">
        <BarChart
          data={salesData}
          series={[{ key: "mobile", label: "Mobile" }]}
          orientation="horizontal"
          height={260}
        />
      </Block>
      <Block label="LineChart (multi-series, monotone curve)">
        <LineChart
          data={timeSeries}
          series={[
            { key: "users", label: "Users", curve: "monotone" },
            { key: "sessions", label: "Sessions", curve: "monotone", dashed: true },
          ]}
          height={260}
        />
      </Block>
      <Block label="AreaChart — stacked">
        <AreaChart
          data={salesData.map((d) => ({
            x: d.category,
            mobile: d.mobile,
            desktop: d.desktop,
            tablet: d.tablet,
          }))}
          series={[
            { key: "mobile", label: "Mobile" },
            { key: "desktop", label: "Desktop" },
            { key: "tablet", label: "Tablet" },
          ]}
          xKind="category"
          mode="stacked"
          height={260}
        />
      </Block>
      <Block label="ScatterPlot + BubbleChart">
        <ScatterPlot
          data={scatterData}
          height={260}
          shape="square"
        />
      </Block>
      <Block label="ComposedChart (bar + line)">
        <ComposedChart
          data={salesData.map((d) => ({
            x: d.category,
            desktop: d.desktop,
            mobile: d.mobile,
          }))}
          series={[
            { key: "desktop", type: "bar", label: "Desktop" },
            { key: "mobile", type: "line", label: "Mobile", curve: "monotone" },
          ]}
          xKind="category"
          height={260}
        />
      </Block>
      <Block label="PieChart / DonutChart">
        <Flex gap={24} wrap align="flex-start">
          <PieChart data={pieData} size={240} />
          <DonutChart data={pieData} size={240} />
        </Flex>
      </Block>
      <Block label="RadarChart">
        <RadarChart
          axes={["Vision", "Execution", "Focus", "Pace", "Clarity", "Polish"]}
          series={[
            { key: "alice", label: "Alice", values: radarValues.alice },
            { key: "bob", label: "Bob", values: radarValues.bob },
          ]}
          size={320}
        />
      </Block>
      <Block label="Histogram">
        <Histogram values={histogramValues} bins={24} height={240} />
      </Block>
      <Block label="CalendarHeatmap">
        <CalendarHeatmap
          start={calHeatmapStart}
          end={calHeatmapEnd}
          data={calHeatmapData}
        />
      </Block>
      <Block label="Sparkline (new)">
        <Flex gap={16} align="center">
          <Sparkline data={[3, 5, 2, 8, 6, 9, 7, 11]} showArea showTrend />
          <Sparkline data={[11, 8, 9, 6, 7, 3, 5, 2]} showArea curve="monotone" />
          <Sparkline data={[4, 5, 4, 5, 4, 5, 4, 5]} showPoints />
        </Flex>
      </Block>
      <Block label="Heatmap (new)">
        <Heatmap
          rows={["Mon", "Tue", "Wed", "Thu", "Fri"]}
          columns={["00", "04", "08", "12", "16", "20"]}
          data={[
            { x: "00", y: "Mon", value: 1 },
            { x: "04", y: "Mon", value: 2 },
            { x: "08", y: "Mon", value: 6 },
            { x: "12", y: "Tue", value: 8 },
            { x: "16", y: "Wed", value: 3 },
            { x: "20", y: "Thu", value: 4 },
            { x: "04", y: "Fri", value: 7 },
            { x: "08", y: "Fri", value: 9 },
            { x: "12", y: "Fri", value: 5 },
          ]}
        />
      </Block>
    </Frame>
  );
}

function AdvancedChartsSection() {
  const treeData = {
    name: "platform",
    children: [
      {
        name: "backend",
        children: [
          { name: "api", value: 18 },
          { name: "worker", value: 12 },
          { name: "scheduler", value: 6 },
        ],
      },
      {
        name: "frontend",
        children: [
          { name: "web", value: 22 },
          { name: "mobile", value: 9 },
          { name: "embed", value: 4 },
        ],
      },
      {
        name: "infra",
        children: [
          { name: "deploy", value: 10 },
          { name: "ops", value: 7 },
        ],
      },
    ],
  };
  const funnel = [
    { key: "visits", label: "Visits", value: 1000 },
    { key: "signups", label: "Sign-ups", value: 420 },
    { key: "activated", label: "Activated", value: 260 },
    { key: "paid", label: "Paid", value: 85 },
  ];
  const waterfallSteps: WaterfallStep[] = [
    { key: "open", label: "Opening", value: 120 },
    { key: "inc1", label: "New users", value: 34 },
    { key: "dec1", label: "Churn", value: -12 },
    { key: "inc2", label: "Referrals", value: 22 },
    { key: "dec2", label: "Refunds", value: -4 },
    { key: "close", label: "Closing", value: "total" },
  ];
  const boxGroups = ["A", "B", "C"].map((k) => ({
    key: k,
    label: `Group ${k}`,
    values: Array.from(
      { length: 30 },
      () => (Math.random() + Math.random()) * 10 + 20
    ),
  }));
  const candleData = Array.from({ length: 24 }, (_, i) => {
    const base = 100 + Math.sin(i / 3) * 10 + i;
    const open = base + (Math.random() - 0.5) * 2;
    const close = open + (Math.random() - 0.5) * 4;
    const high = Math.max(open, close) + Math.random() * 2;
    const low = Math.min(open, close) - Math.random() * 2;
    return {
      x: `D${i + 1}`,
      open,
      close,
      high,
      low,
    };
  });
  const streamData = Array.from({ length: 24 }, (_, i) => ({
    x: i,
    a: 30 + Math.sin(i / 4) * 10 + Math.random() * 4,
    b: 20 + Math.cos(i / 3) * 8 + Math.random() * 4,
    c: 15 + Math.sin(i / 5) * 6 + Math.random() * 3,
    d: 10 + Math.cos(i / 6) * 5 + Math.random() * 2,
  }));
  const horizonSmallMultiples = [
    {
      key: "requests",
      label: "Requests",
      data: Array.from({ length: 60 }, (_, i) => ({
        x: i,
        y: Math.sin(i / 5) * 40 + Math.cos(i / 7) * 10,
      })),
    },
    {
      key: "latency",
      label: "Latency",
      data: Array.from({ length: 60 }, (_, i) => ({
        x: i,
        y: Math.cos(i / 4) * 30 - 10,
      })),
    },
    {
      key: "errors",
      label: "Errors",
      data: Array.from({ length: 60 }, (_, i) => ({
        x: i,
        y: Math.sin(i / 6) * 20,
      })),
    },
  ];
  const sankeyNodes = [
    { key: "raw", label: "Raw leads" },
    { key: "mql", label: "MQL" },
    { key: "sql", label: "SQL" },
    { key: "won", label: "Won" },
    { key: "lost", label: "Lost" },
  ];
  const sankeyLinks = [
    { source: "raw", target: "mql", value: 300 },
    { source: "raw", target: "lost", value: 180 },
    { source: "mql", target: "sql", value: 120 },
    { source: "mql", target: "lost", value: 180 },
    { source: "sql", target: "won", value: 60 },
    { source: "sql", target: "lost", value: 60 },
  ];
  const chordGroups = [
    { key: "us", label: "US" },
    { key: "eu", label: "EU" },
    { key: "as", label: "Asia" },
    { key: "sa", label: "South America" },
  ];
  const chordMatrix = [
    [0, 12, 8, 3],
    [10, 0, 5, 2],
    [6, 4, 0, 1],
    [2, 1, 1, 0],
  ];
  const parallelData = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    values: {
      mpg: 15 + Math.random() * 25,
      hp: 60 + Math.random() * 180,
      weight: 2000 + Math.random() * 2000,
      year: 2000 + Math.random() * 24,
    },
    series: i % 2 === 0 ? "a" : "b",
  }));
  const splomData = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    values: {
      x: Math.random() * 100,
      y: Math.random() * 100,
      z: Math.random() * 100,
    },
  }));
  return (
    <Frame
      title="Advanced charts — Phase 23"
      description="Hierarchical, statistical, financial, temporal, and relational charts."
    >
      <Block label="TreeMap">
        <TreeMap data={treeData} height={260} />
      </Block>
      <Block label="Sunburst">
        <Sunburst data={treeData} size={320} />
      </Block>
      <Block label="FunnelChart / WaterfallChart">
        <Flex gap={24} wrap>
          <FunnelChart steps={funnel} height={320} />
          <WaterfallChart
            steps={waterfallSteps}
            height={260}
          />
        </Flex>
      </Block>
      <Block label="BoxPlot / ViolinPlot">
        <Flex gap={24} wrap>
          <BoxPlot groups={boxGroups} height={260} />
          <ViolinPlot groups={boxGroups} height={260} />
        </Flex>
      </Block>
      <Block label="Candlestick / OHLC">
        <Flex gap={24} wrap>
          <CandlestickChart data={candleData} height={260} />
          <OHLCChart data={candleData} height={260} />
        </Flex>
      </Block>
      <Block label="StreamGraph">
        <StreamGraph
          data={streamData}
          series={[
            { key: "a", label: "A" },
            { key: "b", label: "B" },
            { key: "c", label: "C" },
            { key: "d", label: "D" },
          ]}
          height={200}
        />
      </Block>
      <Block label="HorizonChart (SmallMultiples)">
        <SmallMultiples
          items={horizonSmallMultiples}
          minItemWidth={280}
          facetLabel={(m) => m.label}
          renderItem={(m) => (
            <HorizonChart data={m.data} bands={3} height={54} />
          )}
        />
      </Block>
      <Block label="Sankey">
        <Sankey nodes={sankeyNodes} links={sankeyLinks} height={260} />
      </Block>
      <Block label="ChordDiagram">
        <ChordDiagram groups={chordGroups} matrix={chordMatrix} size={320} />
      </Block>
      <Block label="ParallelCoordinates">
        <ParallelCoordinates
          data={parallelData}
          axes={[
            { key: "mpg", label: "MPG" },
            { key: "hp", label: "HP" },
            { key: "weight", label: "Weight" },
            { key: "year", label: "Year" },
          ]}
          series={[
            { key: "a", label: "Cohort A" },
            { key: "b", label: "Cohort B" },
          ]}
          height={300}
        />
      </Block>
      <Block label="ScatterMatrix (SPLOM)">
        <ScatterMatrix
          data={splomData}
          dimensions={["x", "y", "z"]}
          facetHeight={140}
        />
      </Block>
    </Frame>
  );
}

function GeoNetworkChartsSection() {
  const networkNodes: NetworkNode[] = [
    { id: "ui", label: "UI", group: "client" },
    { id: "api", label: "API", group: "service" },
    { id: "auth", label: "Auth", group: "service" },
    { id: "db", label: "Postgres", group: "data" },
    { id: "cache", label: "Redis", group: "data" },
    { id: "queue", label: "Queue", group: "data" },
    { id: "worker", label: "Worker", group: "service" },
    { id: "search", label: "Search", group: "service" },
  ];
  const networkLinks: NetworkLink[] = [
    { source: "ui", target: "api", value: 3, label: "REST + WS" },
    { source: "ui", target: "auth", value: 1, label: "OAuth bootstrap" },
    { source: "api", target: "db", value: 4, label: "primary store" },
    { source: "api", target: "cache", value: 2, label: "read-through" },
    { source: "api", target: "queue", value: 2, label: "enqueue jobs" },
    { source: "queue", target: "worker", value: 2, label: "job stream" },
    { source: "worker", target: "db", value: 3, label: "writes" },
    { source: "worker", target: "search", value: 2, label: "indexing" },
    { source: "auth", target: "db", value: 1, label: "session lookup" },
  ];
  const depNodes: DependencyNode[] = [
    { id: "build", group: "core" },
    { id: "test", group: "core" },
    { id: "lint", group: "core" },
    { id: "typecheck", group: "core" },
    { id: "package", group: "release" },
    { id: "ship", group: "release" },
  ];
  const depEdges: DependencyEdge[] = [
    { source: "test", target: "build", label: "needs build artefacts" },
    { source: "lint", target: "build", label: "needs source map" },
    { source: "typecheck", target: "build", label: "needs declarations" },
    { source: "package", target: "test", value: 1 },
    { source: "package", target: "lint", value: 1 },
    { source: "package", target: "typecheck", value: 1 },
    { source: "ship", target: "package", label: "release-on-green" },
    // Skip-layer edge — passes under the intermediate layers, so the
    // segments where it crosses unrelated nodes render dashed on top.
    { source: "ship", target: "build", label: "ship blocks on build" },
  ];
  const stateValues: Record<string, number> = {
    CA: 38,
    TX: 30,
    FL: 22,
    NY: 19,
    PA: 13,
    IL: 13,
    OH: 12,
    GA: 11,
    NC: 11,
    MI: 10,
    WA: 8,
    MA: 7,
    CO: 6,
    OR: 4,
    NV: 3,
    AK: 1,
    HI: 1,
    DC: 1,
  };
  return (
    <Frame
      title="Geo + Network — Phase 24"
      description="DependencyGraph + TileGridMap ship without peer deps. NetworkGraph (d3-force), ChoroplethMap and BubbleMap (d3-geo + topojson-client) are loaded on demand from optional peer packages."
    >
      <Block label="DependencyGraph (top-down DAG, layered)">
        <DependencyGraph
          nodes={depNodes}
          edges={depEdges}
          direction="top-down"
        />
      </Block>
      <Block label="DependencyGraph (left-right)">
        <DependencyGraph
          nodes={depNodes}
          edges={depEdges}
          direction="left-right"
        />
      </Block>
      <Block label="NetworkGraph (force-directed, click to highlight, drag to rubber-band)">
        <NetworkGraph
          nodes={networkNodes}
          links={networkLinks}
          height={360}
        />
      </Block>
      <Block label="NetworkGraph (rubber-band off — drag pins one node, others stay put)">
        <NetworkGraph
          nodes={networkNodes}
          links={networkLinks}
          height={300}
          rubberBand={false}
          directed
        />
      </Block>
      <Block label="TileGridMap — US states (built-in grid)">
        <TileGridMap
          cells={US_STATES_GRID}
          values={stateValues}
        />
      </Block>
      <Block label="ChoroplethMap / BubbleMap (peer deps)">
        <Text size="sm" color="var(--vf-text-3)">
          ChoroplethMap and BubbleMap render TopoJSON via d3-geo +
          topojson-client. They live in <Code inline>voidframe</Code> but
          require those packages to be installed by the consuming app — the
          demo intentionally skips wiring sample TopoJSON to keep the bundle
          small. See the README for usage.
        </Text>
      </Block>
    </Frame>
  );
}

function ChartPrimitivesSection() {
  const [hover, setHover] = useState<
    | { datum: { month: string; value: number }; x: number; y: number }
    | null
  >(null);
  const data = [
    { month: "Jan", value: 42 },
    { month: "Feb", value: 64 },
    { month: "Mar", value: 28 },
    { month: "Apr", value: 88 },
    { month: "May", value: 52 },
    { month: "Jun", value: 71 },
  ];
  const max = Math.max(...data.map((d) => d.value));
  const xScale = ChartPrimitivesSection.cachedBand(data.map((d) => d.month));
  const yScale = ChartPrimitivesSection.cachedLinear(max);
  const palette = ChartPrimitivesSection.cachedPalette();
  return (
    <Frame
      title="Chart primitives — Phase 21"
      description="ChartFrame, Axis, Gridlines, Legend, ChartTooltip, Crosshair, Brush. These compose into every chart in Phases 22–24."
    >
      <Block label="ChartFrame + Axis + Gridlines (pure primitives)">
        <ChartFrame
          width={600}
          height={280}
          title="Monthly throughput"
          description="Band scale (X) + linear scale (Y), ticks + gridlines."
          xScale={xScale}
          yScale={yScale}
          accessibleLabel="Sample monthly throughput"
        >
          <Gridlines mode="y" ticks={5} dashed />
          <Axis orientation="bottom" />
          <Axis orientation="left" ticks={5} format={(v) => `${v}`} />
          {data.map((d) => {
            const x = xScale(d.month)!;
            const bw = xScale.bandwidth();
            const y = yScale(d.value)!;
            const h = yScale(0)! - y;
            return (
              <rect
                key={d.month}
                x={x}
                y={y}
                width={bw}
                height={h}
                fill={palette[0]}
                onPointerMove={(e) =>
                  setHover({ datum: d, x: e.clientX, y: e.clientY })
                }
                onPointerLeave={() => setHover(null)}
              />
            );
          })}
        </ChartFrame>
        <ChartTooltip
          active={!!hover}
          x={hover?.x ?? 0}
          y={hover?.y ?? 0}
        >
          {hover ? (
            <>
              <strong>{hover.datum.month}</strong>: {hover.datum.value}
            </>
          ) : null}
        </ChartTooltip>
      </Block>
      <Block label="ChartLegend (interactive)">
        <ChartLegend
          items={[
            { key: "mobile", label: "Mobile", color: palette[0]!, glyph: "square" },
            { key: "desktop", label: "Desktop", color: palette[1]!, glyph: "line" },
            { key: "tablet", label: "Tablet", color: palette[2]!, glyph: "circle", disabled: true },
          ]}
          onToggle={() => undefined}
        />
      </Block>
      <Block label="Brush + Crosshair overlay">
        <BrushPrimitiveDemo />
      </Block>
    </Frame>
  );
}

function BrushPrimitiveDemo() {
  const samples = useMemo(
    () =>
      Array.from({ length: 60 }, (_, i) => ({
        x: i,
        y: 50 + Math.sin(i / 4) * 25 + Math.cos(i / 9) * 12,
      })),
    []
  );
  const xScale = useMemo(
    () =>
      linearScale({
        domain: [samples[0]!.x, samples[samples.length - 1]!.x],
        range: [0, 552],
      }),
    [samples]
  );
  const yScale = useMemo(
    () =>
      linearScale({
        domain: [
          Math.min(...samples.map((s) => s.y)),
          Math.max(...samples.map((s) => s.y)),
        ],
        range: [156, 0],
        nice: true,
      }),
    [samples]
  );
  const [selection, setSelection] = useState<[number, number] | null>(null);
  const selectedSamples = useMemo(() => {
    if (!selection) return samples;
    const [x0, x1] = selection;
    const xMin = xScale.invert(x0);
    const xMax = xScale.invert(x1);
    return samples.filter((s) => s.x >= xMin && s.x <= xMax);
  }, [samples, selection, xScale]);
  const summary = useMemo(() => {
    if (selectedSamples.length === 0)
      return {
        count: 0,
        avg: 0,
        min: 0,
        max: 0,
        rangeStart: 0,
        rangeEnd: 0,
      };
    const ys = selectedSamples.map((s) => s.y);
    return {
      count: selectedSamples.length,
      avg: ys.reduce((a, b) => a + b, 0) / ys.length,
      min: Math.min(...ys),
      max: Math.max(...ys),
      rangeStart: selectedSamples[0]!.x,
      rangeEnd: selectedSamples[selectedSamples.length - 1]!.x,
    };
  }, [selectedSamples]);
  return (
    <Flex direction="column" gap={8}>
      <ChartFrame
        width={640}
        height={200}
        xScale={xScale}
        yScale={yScale}
        margins={{ top: 12, right: 16, bottom: 32, left: 44 }}
        accessibleLabel="Brush overlay demo"
      >
        <Gridlines mode="both" ticks={5} dashed />
        <Axis orientation="bottom" ticks={6} />
        <Axis orientation="left" ticks={5} />
        {(() => {
          const pts = samples.map(
            (s) => `${xScale(s.x)},${yScale(s.y)}`
          );
          return (
            <polyline
              points={pts.join(" ")}
              fill="none"
              stroke="var(--vf-green)"
              strokeWidth={1.5}
            />
          );
        })()}
        <Brush onChange={setSelection} />
      </ChartFrame>
      <Flex
        gap={16}
        wrap
        style={{
          fontFamily: "var(--vf-font-family)",
          fontSize: "var(--vf-font-xs)",
          color: "var(--vf-text-2)",
        }}
      >
        <span>
          <strong>Selected range:</strong>{" "}
          {selection
            ? `x ${summary.rangeStart}–${summary.rangeEnd}`
            : "(drag across the chart to brush)"}
        </span>
        <span>
          <strong>Points:</strong> {summary.count}
        </span>
        <span>
          <strong>Avg:</strong>{" "}
          {summary.avg.toLocaleString(undefined, { maximumFractionDigits: 2 })}
        </span>
        <span>
          <strong>Min:</strong>{" "}
          {summary.min.toLocaleString(undefined, { maximumFractionDigits: 2 })}
        </span>
        <span>
          <strong>Max:</strong>{" "}
          {summary.max.toLocaleString(undefined, { maximumFractionDigits: 2 })}
        </span>
        {selection && (
          <button
            type="button"
            className="vf-button vf-button--ghost vf-button--sm"
            onClick={() => setSelection(null)}
          >
            Clear selection
          </button>
        )}
      </Flex>
    </Flex>
  );
}

ChartPrimitivesSection.cachedBand = (domain: string[]) =>
  bandScale({ domain, range: [0, 540], padding: 0.2 });
ChartPrimitivesSection.cachedLinear = (max: number) =>
  linearScale({ domain: [0, max], range: [236, 0], nice: true });
ChartPrimitivesSection.cachedPalette = () => seriesPalette(3);

function ViewersSection() {
  return (
    <Frame title="Data — Viewers" description="CodeBlock, JSONViewer, DiffViewer, LogViewer, Terminal, MarkdownRenderer.">
      <Block label="CodeBlock">
        <CodeBlock
          code={`const greet = (n: string) => "Hello " + n;\ngreet("void");`}
          language="ts"
          copyable
        />
      </Block>
      <Block label="JSONViewer">
        <JSONViewer data={{ name: "void", deps: ["react", "happy-dom"], version: 1 }} />
      </Block>
      <Block label="DiffViewer">
        <DiffViewer oldValue={"line one\nline two"} newValue={"line one\nline TWO\nline three"} />
      </Block>
      <Block label="LogViewer">
        <LogViewer
          entries={[
            { level: "info", timestamp: new Date(), message: "Server started", source: "core" },
            { level: "warn", timestamp: new Date(), message: "High latency on /api", source: "api" },
            { level: "error", timestamp: new Date(), message: "Connection refused", source: "db" },
          ]}
          height={140}
        />
      </Block>
      <Block label="Terminal">
        <Terminal lines={["void@core ~ ls", "components/  hooks/  primitives/"]} height={140} />
      </Block>
      <Block label="MarkdownRenderer">
        <MarkdownRenderer content={"## Markdown\n\n- one\n- two\n\n[link](https://example.com)"} />
      </Block>
    </Frame>
  );
}

function CalendarsSection() {
  return (
    <Frame title="Data — Calendars" description="Calendar, Timeline, Gantt, Activity.">
      <Block label="Calendar">
        <Calendar defaultDisplayMonth={new Date()} />
      </Block>
      <Block label="Timeline">
        <Timeline>
          <Timeline.Item time="09:01" tone="success" title="Build started" />
          <Timeline.Item time="09:04" tone="warning" title="Cache miss" />
          <Timeline.Item time="09:08" title="Tests passed" />
        </Timeline>
      </Block>
      <Block label="Gantt">
        <Gantt
          start={new Date(2026, 2, 1)}
          end={new Date(2026, 2, 14)}
          tasks={[
            { id: "a", name: "Design", start: new Date(2026, 2, 1), end: new Date(2026, 2, 4) },
            { id: "b", name: "Build", start: new Date(2026, 2, 5), end: new Date(2026, 2, 9), dependencies: ["a"] },
            { id: "c", name: "Ship", start: new Date(2026, 2, 10), end: new Date(2026, 2, 11), dependencies: ["b"] },
          ]}
        />
      </Block>
      <Block label="Activity">
        <Activity>
          <Activity.Item actor="Alice" action="pushed" target="main" time={new Date(Date.now() - 1000 * 60 * 4)} />
          <Activity.Item actor="Bob" action="opened PR" target="#42" time={new Date(Date.now() - 1000 * 60 * 30)} />
        </Activity>
      </Block>
    </Frame>
  );
}

function AvatarsSection() {
  return (
    <Frame title="Data — Avatars + Misc" description="Avatar, AvatarGroup, Tag, Code.">
      <Block label="Avatar / AvatarGroup">
        <Flex gap={16} align="center">
          <Avatar name="Alice" />
          <Avatar name="Bob" status="online" />
          <Avatar name="Carol" square />
          <AvatarGroup
            items={[
              { name: "Alice" },
              { name: "Bob" },
              { name: "Carol" },
              { name: "Dan" },
              { name: "Eve" },
              { name: "Frank" },
            ]}
            max={4}
          />
        </Flex>
      </Block>
      <Block label="Tag / Code">
        <Flex gap={8} align="center">
          <Tag>Default</Tag>
          <Tag color="#4ade80" onRemove={() => {}}>
            Removable
          </Tag>
          <Code inline>inline code</Code>
        </Flex>
      </Block>
    </Frame>
  );
}

function KanbanSection() {
  interface Task {
    id: string;
    columnId: string;
    label: string;
    assignee?: string;
    priority?: "low" | "med" | "high" | "urgent";
    points?: number;
    tags?: string[];
    due?: string;
    [key: string]: unknown;
  }
  const [items, setItems] = useState<Task[]>([
    {
      id: "t1",
      columnId: "backlog",
      label: "Research auth providers",
      assignee: "Ada",
      priority: "med",
      points: 3,
      tags: ["research"],
    },
    {
      id: "t2",
      columnId: "todo",
      label: "Write API spec for /v2/sessions",
      assignee: "Linus",
      priority: "high",
      points: 5,
      tags: ["api", "spec"],
      due: "Apr 20",
    },
    {
      id: "t3",
      columnId: "todo",
      label: "Audit color-contrast on light theme",
      assignee: "Grace",
      priority: "low",
      points: 2,
      tags: ["a11y"],
    },
    {
      id: "t4",
      columnId: "doing",
      label: "Build RTL-aware icon mirroring",
      assignee: "Ada",
      priority: "high",
      points: 8,
      tags: ["icons", "rtl"],
      due: "Apr 18",
    },
    {
      id: "t5",
      columnId: "review",
      label: "Code review for responsive Grid retrofit",
      assignee: "Linus",
      priority: "med",
      points: 3,
      tags: ["review"],
    },
    {
      id: "t6",
      columnId: "done",
      label: "Ship Phase 20 perf wrappers",
      assignee: "Ada",
      priority: "urgent",
      points: 5,
      tags: ["perf", "shipped"],
    },
  ]);
  const toneByPriority: Record<NonNullable<Task["priority"]>, string> = {
    low: "var(--vf-text-3)",
    med: "var(--vf-info)",
    high: "var(--vf-warning)",
    urgent: "var(--vf-danger)",
  };
  return (
    <Frame title="Kanban" description="Drag-drop board with WIP limits + rich cards.">
      <Block label="Kanban (drag cards; Ctrl+Arrow to move with keyboard)">
        <Kanban
          columns={[
            { id: "backlog", title: "Backlog" },
            { id: "todo", title: "Todo", wip: 3 },
            { id: "doing", title: "In progress", wip: 2 },
            { id: "review", title: "Review" },
            { id: "done", title: "Done" },
          ]}
          items={items}
          renderItem={(it) => {
            const task = it as Task;
            return (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                }}
              >
                <div style={{ fontWeight: 600, color: "var(--vf-text-0)" }}>
                  {task.label}
                </div>
                <Flex gap={6} align="center" wrap>
                  {task.priority && (
                    <Badge
                      tone="neutral"
                      style={{
                        color: toneByPriority[task.priority],
                        borderColor: toneByPriority[task.priority],
                      }}
                    >
                      {task.priority}
                    </Badge>
                  )}
                  {task.points !== undefined && <Badge>{task.points} pts</Badge>}
                  {task.due && (
                    <Text size="xs" color="var(--vf-text-3)">
                      ⏱ {task.due}
                    </Text>
                  )}
                </Flex>
                <Flex gap={6} align="center" wrap>
                  {task.tags?.map((t) => (
                    <Tag key={t}>{t}</Tag>
                  ))}
                  <span style={{ flex: 1 }} />
                  {task.assignee && <Avatar name={task.assignee} size={20} />}
                </Flex>
              </div>
            );
          }}
          onItemMove={({ itemId, toColumn, toIndex }) => {
            setItems((prev) => {
              const moved = prev.find((i) => i.id === itemId);
              if (!moved) return prev;
              const without = prev.filter((i) => i.id !== itemId);
              const next = { ...moved, columnId: toColumn };
              const insertAt = Math.min(toIndex, without.length);
              return [...without.slice(0, insertAt), next, ...without.slice(insertAt)];
            });
          }}
        />
      </Block>
    </Frame>
  );
}

function BackdropDemo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Show backdrop</Button>
      {open && <Backdrop blur tint="rgba(0,0,0,0.5)" onClick={() => setOpen(false)} />}
    </>
  );
}

function ModalDemo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open legacy modal</Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Legacy modal">
        <Text>Voidframe ships both the simple Modal and the compound Dialog.</Text>
      </Modal>
    </>
  );
}

function OverlaysSection() {
  const [popOpen, setPopOpen] = useState(false);
  const confirm = useConfirm();
  return (
    <Frame title="Overlays" description="Dialog, Drawer, Sheet, Popover, Tooltip, HoverCard, ConfirmDialog hook.">
      <Block label="Dialog">
        <Dialog>
          <Dialog.Trigger asChild>
            <Button>Open dialog</Button>
          </Dialog.Trigger>
          <Dialog.Content size="md">
            <Dialog.Header>
              <Dialog.Title>Confirm action</Dialog.Title>
              <Dialog.Description>Are you sure?</Dialog.Description>
            </Dialog.Header>
            <Dialog.Body>
              <Text>This is a basic dialog body.</Text>
            </Dialog.Body>
            <Dialog.Footer>
              <Dialog.Cancel>Cancel</Dialog.Cancel>
              <Dialog.Action>Confirm</Dialog.Action>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog>
      </Block>
      <Block label="DrawerV2 / Sheet">
        <Flex gap={8} align="center">
          <DrawerV2>
            <DrawerV2.Trigger asChild>
              <Button>Open drawer</Button>
            </DrawerV2.Trigger>
            <DrawerV2.Content>
              <DrawerV2.Header>
                <DrawerV2.Title>Settings</DrawerV2.Title>
              </DrawerV2.Header>
              <DrawerV2.Body>
                <Text>Drawer content here — themed text + body padding.</Text>
              </DrawerV2.Body>
            </DrawerV2.Content>
          </DrawerV2>
          <Sheet>
            <Sheet.Trigger asChild>
              <Button>Open sheet</Button>
            </Sheet.Trigger>
            <Sheet.Content>
              <Sheet.Handle />
              <Sheet.Header>
                <Sheet.Title>Bottom sheet</Sheet.Title>
              </Sheet.Header>
              <Sheet.Body>
                <Text>Drag the handle to resize the sheet vertically.</Text>
              </Sheet.Body>
            </Sheet.Content>
          </Sheet>
        </Flex>
      </Block>
      <Block label="PopoverV2 / HoverCard">
        <Flex gap={8} align="center">
          <PopoverV2 open={popOpen} onOpenChange={setPopOpen}>
            <PopoverV2.Trigger asChild>
              <Button>Open popover</Button>
            </PopoverV2.Trigger>
            <PopoverV2.Content>
              <Text>Popover body</Text>
            </PopoverV2.Content>
          </PopoverV2>
          <HoverCard>
            <HoverCard.Trigger asChild>
              <Button variant="ghost">Hover me</Button>
            </HoverCard.Trigger>
            <HoverCard.Content>
              <Text size="sm">Card preview content.</Text>
            </HoverCard.Content>
          </HoverCard>
        </Flex>
      </Block>
      <Block label="useConfirm() hook">
        <Button
          onClick={async () => {
            const ok = await confirm({
              title: "Delete account?",
              description: "This cannot be undone.",
              destructive: true,
            });
            toast({ title: ok ? "Confirmed" : "Cancelled", duration: 2500 });
          }}
        >
          Delete account…
        </Button>
      </Block>
      <Block label="Backdrop">
        <BackdropDemo />
      </Block>
      <Block label="Modal (legacy)">
        <ModalDemo />
      </Block>
    </Frame>
  );
}

function CommandPaletteSection() {
  const [open, setOpen] = useState(false);
  const [dim, setDim] = useState(true);
  return (
    <Frame title="CommandPalette + ShortcutGuide" description="Discovery + onboarding overlays.">
      <Block label="CommandPalette (mod+k or button)">
        <Flex gap={12} align="center">
          <Button onClick={() => setOpen(true)}>Open palette</Button>
          <Toggle
            label="Dim page behind palette"
            checked={dim}
            onChange={setDim}
          />
        </Flex>
        <CommandPalette open={open} onOpenChange={setOpen} dim={dim}>
          <CommandPalette.Input />
          <CommandPalette.List>
            <CommandPalette.Empty>No commands</CommandPalette.Empty>
            <CommandPalette.Group heading="Navigation">
              <CommandPalette.Item value="home" onSelect={() => toast({ title: "Go home" })}>
                Go home
              </CommandPalette.Item>
              <CommandPalette.Item value="search" onSelect={() => toast({ title: "Search" })}>
                Search
              </CommandPalette.Item>
            </CommandPalette.Group>
          </CommandPalette.List>
          <CommandPalette.Footer>
            <Shortcut keys="enter" /> select <Shortcut keys="esc" /> close
          </CommandPalette.Footer>
        </CommandPalette>
      </Block>
      <Block label="ShortcutGuide (press ?)">
        <ShortcutGuide />
      </Block>
    </Frame>
  );
}

function NotificationsSection() {
  return (
    <Frame title="Notifications" description="Toast / Toaster / NotificationCenter.">
      <Block label="Toast (imperative)">
        <Flex gap={8}>
          <Button onClick={() => toast.success("Saved")}>Success</Button>
          <Button
            onClick={() =>
              toast.warning({ title: "Heads up", description: "Disk almost full" })
            }
          >
            Warning
          </Button>
          <Button onClick={() => toast.danger("Failed")}>Danger</Button>
          <Button
            onClick={() =>
              toast.promise(new Promise((r) => setTimeout(r, 1000)), {
                loading: "Working…",
                success: "Done",
                error: "Failed",
              })
            }
          >
            Promise
          </Button>
        </Flex>
      </Block>
      <Block label="NotificationCenter">
        <NotificationCenter
          notifications={[
            {
              id: "1",
              title: "Build complete",
              time: new Date(Date.now() - 60 * 1000),
              read: false,
            },
            {
              id: "2",
              title: "PR merged",
              time: new Date(Date.now() - 60 * 60 * 1000),
              read: true,
            },
          ]}
        />
      </Block>
    </Frame>
  );
}

function LoadingStatusSection() {
  const [busy, setBusy] = useState(false);
  return (
    <Frame title="Loading & Status" description="LoadingOverlay, SpinnerV2, Skeleton, Shimmer, EmptyState, ErrorState, OfflineBanner, ConnectionStatus.">
      <Block label="SpinnerV2 variants">
        <Flex gap={16} align="center">
          <SpinnerV2 variant="ring" />
          <SpinnerV2 variant="dots" />
          <SpinnerV2 variant="bars" />
          <SpinnerV2 variant="pulse" />
          <Spinner />
        </Flex>
      </Block>
      <Block label="LoadingOverlay">
        <div style={{ position: "relative", height: 140, background: "var(--vf-bg-3)" }}>
          <LoadingOverlay open={busy} label="Crunching numbers…" blur />
          <Flex style={{ padding: 16 }} gap={8}>
            <Text>Toggle the loading overlay:</Text>
            <Button onClick={() => setBusy((b) => !b)}>{busy ? "Stop" : "Start"}</Button>
          </Flex>
        </div>
      </Block>
      <Block label="Skeleton / Shimmer">
        <Skeleton lines={3} />
        <Shimmer lines={3} rounded />
      </Block>
      <Block label="Empty / Error states">
        <EmptyState
          title="Nothing here yet"
          description="Create something to get started."
          action={<Button>Create</Button>}
        />
        <ErrorState
          error={new Error("Network unreachable")}
          actions={<Button>Retry</Button>}
        />
      </Block>
      <Block label="ConnectionStatus / OfflineBanner">
        <Flex gap={16}>
          <ConnectionStatus status="connected" />
          <ConnectionStatus status="connecting" />
          <ConnectionStatus status="error" />
        </Flex>
        <OfflineBanner />
        <Text size="sm" color="var(--vf-text-3)">
          OfflineBanner appears automatically when the browser reports offline.
        </Text>
      </Block>
    </Frame>
  );
}

function InteractiveSection() {
  const [items, setItems] = useState(["alpha", "beta", "gamma", "delta"]);
  return (
    <Frame title="Interactive Patterns" description="Accordion, Carousel, Lightbox, gestures, Sortable.">
      <Block label="Accordion">
        <Accordion type="single" defaultValue="a">
          <Accordion.Item value="a">
            <Accordion.Trigger>Section A</Accordion.Trigger>
            <Accordion.Content>A content</Accordion.Content>
          </Accordion.Item>
          <Accordion.Item value="b">
            <Accordion.Trigger>Section B</Accordion.Trigger>
            <Accordion.Content>B content</Accordion.Content>
          </Accordion.Item>
        </Accordion>
      </Block>
      <Block label="Carousel">
        <Carousel
          slides={[
            <div key="a" style={{ padding: 32, background: "var(--vf-bg-3)" }}>Slide A</div>,
            <div key="b" style={{ padding: 32, background: "var(--vf-bg-4)" }}>Slide B</div>,
            <div key="c" style={{ padding: 32, background: "var(--vf-bg-3)" }}>Slide C</div>,
          ]}
          autoPlay
        />
      </Block>
      <Block label="Lightbox + ImageGallery">
        <ImageGallery
          images={[
            { src: "https://picsum.photos/seed/a/300", alt: "a" },
            { src: "https://picsum.photos/seed/b/300", alt: "b" },
            { src: "https://picsum.photos/seed/c/300", alt: "c" },
          ]}
          columns={3}
        />
      </Block>
      <Block label="Swipeable / Zoomable">
        <Swipeable
          onSwipeLeft={() => toast({ title: "Swiped left" })}
          onSwipeRight={() => toast({ title: "Swiped right" })}
        >
          <div style={{ padding: 16, background: "var(--vf-bg-3)" }}>
            Swipe me horizontally
          </div>
        </Swipeable>
        <Zoomable>
          <div style={{ padding: 16, background: "var(--vf-bg-3)" }}>
            Wheel zoom + drag pan
          </div>
        </Zoomable>
      </Block>
      <Block label="Sortable (drag rows; ArrowKeys to move)">
        <Sortable
          items={items}
          getKey={(x) => x}
          onChange={setItems}
          renderItem={(item, _i, { dragHandleProps }) => (
            <Flex gap={8} align="center">
              <span {...dragHandleProps} style={{ cursor: "grab" }}>⋮⋮</span>
              <span>{item}</span>
            </Flex>
          )}
        />
      </Block>
    </Frame>
  );
}

function AnimationSection() {
  return (
    <Frame title="Animation Atoms" description="Marquee, Typewriter, Ticker.">
      <Block label="Marquee">
        <Marquee>
          <span style={{ marginInlineEnd: 32 }}>
            VOIDFRAME — DARK MONOCHROME REACT FRAMEWORK
          </span>
          <span style={{ marginInlineEnd: 32 }}>
            TERMINAL-BRUTALIST · DATA-DENSE · ZERO BORDER-RADIUS
          </span>
        </Marquee>
      </Block>
      <Block label="Typewriter">
        <Typewriter text="Hello from the void." speed={20} />
      </Block>
      <Block label="Ticker">
        <Text size="lg">
          Sessions <Ticker from={0} to={12456} />
        </Text>
      </Block>
    </Frame>
  );
}

function MediaSection() {
  return (
    <Frame title="Media" description="Image, VideoPlayer, AudioPlayer, VoiceWaveform, IFrame, DocumentPreview.">
      <Block label="Image (with fallback)">
        <Image
          src="https://picsum.photos/seed/voidframe/400/240"
          alt="random"
          width={400}
          height={240}
          fallback="https://picsum.photos/seed/fallback/400/240"
        />
      </Block>
      <Block label="VideoPlayer">
        <VideoPlayer
          src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
          poster="https://picsum.photos/seed/poster/640/360"
          style={{ maxWidth: 480 }}
        />
      </Block>
      <Block label="AudioPlayer + VoiceWaveform">
        <AudioPlayer src="https://www.w3.org/2010/05/sound/sound_90.mp3" />
        <VoiceWaveform
          progress={0.3}
          audioData={Array.from({ length: 48 }, (_, i) => 0.2 + 0.6 * Math.sin(i / 4) ** 2)}
        />
      </Block>
      <Block label="IFrame / DocumentPreview">
        <IFrame src="about:blank" title="Sample frame" height={120} />
        <DocumentPreview filename="report.pdf" size={1024 * 80} kind="pdf" onOpen={() => {}} />
      </Block>
    </Frame>
  );
}

function UtilitySection() {
  return (
    <Frame title="Utility Interactive" description="Clipboard, ShareButton, ScrollIndicator, ReactionPicker.">
      <Block label="Clipboard / ShareButton">
        <Flex gap={8}>
          <Clipboard value="copied from voidframe" />
          <ShareButton url="https://example.com" title="Voidframe demo" />
        </Flex>
      </Block>
      <Block label="ScrollIndicator">
        <Text size="sm" color="var(--vf-text-3)">
          A 2px progress bar pinned to the top of the viewport.
        </Text>
        <ScrollIndicator />
      </Block>
      <Block label="ReactionPicker">
        <ReactionPicker
          recent
          reactions={[
            { id: "thumbsup", label: "👍" },
            { id: "heart", label: "❤" },
            { id: "smile", label: "😄" },
            { id: "tada", label: "🎉" },
          ]}
          onReact={(id) => toast({ title: `Reacted ${id}` })}
        />
      </Block>
    </Frame>
  );
}

// ─────────────────────────────────────────────────────────────
// PHASE 17 — i18n
// ─────────────────────────────────────────────────────────────

function I18nSection() {
  const { t, locale, direction, firstDayOfWeek } = useMessages();
  const [fileCount] = useState(3);
  const now = Date.now();
  return (
    <Frame
      title="i18n — Messages, locales, RTL, Intl formatters"
      description="Change the demo locale from the header selector (Phase 17). Strings, number/date formatting, and writing direction all flow from the provider."
    >
      <Block label="Resolved context">
        <Flex gap={24} wrap>
          <Text>
            Locale: <Code>{locale}</Code>
          </Text>
          <Text>
            Direction: <Code>{direction}</Code>
          </Text>
          <Text>
            First day of week:{" "}
            <Code>{String(firstDayOfWeek)}</Code>
          </Text>
        </Flex>
      </Block>
      <Block label="Built-in strings — t() resolved against the active locale">
        <Text size="sm" color="var(--vf-text-3)">
          These are the strings voidframe would render for common built-in
          UI ("Previous", "Cancel", "No data", etc.) under the currently
          selected locale. Switch the locale dropdown in the header to see
          everything retranslate live.
        </Text>
        <Flex gap={8} wrap style={{ marginTop: 8 }}>
          <Badge>
            t(&quot;pagination.previous&quot;) → <b>{t("pagination.previous")}</b>
          </Badge>
          <Badge>
            t(&quot;pagination.next&quot;) → <b>{t("pagination.next")}</b>
          </Badge>
          <Badge>
            t(&quot;dialog.cancel&quot;) → <b>{t("dialog.cancel")}</b>
          </Badge>
          <Badge>
            t(&quot;dialog.confirm&quot;) → <b>{t("dialog.confirm")}</b>
          </Badge>
          <Badge>
            t(&quot;form.required&quot;) → <b>{t("form.required")}</b>
          </Badge>
          <Badge>
            t(&quot;table.noData&quot;) → <b>{t("table.noData")}</b>
          </Badge>
        </Flex>
        <Text size="sm" style={{ marginTop: 8 }}>
          Templates accept args:{" "}
          <Code inline>{`t("pagination.pageOf", { current: 2, total: 10 })`}</Code>{" "}
          → <b>{t("pagination.pageOf", { current: 2, total: 10 })}</b>
        </Text>
      </Block>
      <Block label="Intl formatters">
        <Flex gap={24} wrap>
          <Text>
            Currency: <Code>{formatCurrency(1234.56, "EUR", locale)}</Code>
          </Text>
          <Text>
            Date:{" "}
            <Code>
              {formatDate(now, locale, {
                dateStyle: "long",
              })}
            </Code>
          </Text>
          <Text>
            Relative:{" "}
            <Code>{formatRelativeTime(now - 125_000, locale, now)}</Code>
          </Text>
          <Text>
            Plural:{" "}
            <Code>
              {pluralize(fileCount, locale, {
                one: `1 ${t("combobox.noResults").toLowerCase()}`,
                other: `${fileCount} items`,
              })}
            </Code>
          </Text>
        </Flex>
      </Block>
      <Block label="Ship catalog — 8 locale packs + pseudoloc">
        <Flex gap={8} wrap>
          {Object.keys(LOCALE_PACKS).map((tag) => {
            const pack: LocalePack = LOCALE_PACKS[tag]!;
            return (
              <Badge key={tag} tone={pack.direction === "rtl" ? "warning" : "neutral"}>
                {tag} · {pack.direction}
              </Badge>
            );
          })}
        </Flex>
        <Text size="xs" color="var(--vf-text-3)">
          Consumers import only the packs they need —{" "}
          <Code>{`import { ja } from "voidframe"`}</Code> is tree-shakable.
        </Text>
      </Block>
    </Frame>
  );
}

// ─────────────────────────────────────────────────────────────
// PHASE 16 — RESPONSIVE
// ─────────────────────────────────────────────────────────────

function ResponsiveSection() {
  const bp = useBreakpoint();
  const device = useDeviceType();
  const size = useResponsive({ base: "sm", md: "md", lg: "lg", xxl: "xxl" });
  return (
    <Frame
      title="Responsive — Breakpoints + Show/Hide + ResponsiveBox"
      description="JS + CSS responsive primitives. Resize the viewport to watch values update."
    >
      <Block label="Current viewport">
        <Flex gap={24} align="center" wrap>
          <Text>
            Breakpoint: <Code>{bp}</Code>
          </Text>
          <Text>
            Device: <Code>{device}</Code>
          </Text>
          <Text>
            Resolved size: <Code>{size ?? "—"}</Code>
          </Text>
        </Flex>
        <Text size="xs" color="var(--vf-text-3)">
          Breakpoint px values: sm={BREAKPOINTS.sm} md={BREAKPOINTS.md} lg=
          {BREAKPOINTS.lg} xl={BREAKPOINTS.xl} xxl={BREAKPOINTS.xxl}
        </Text>
      </Block>
      <Block label="Show / Hide (CSS-based, no SSR flash)">
        <Flex gap={16} wrap>
          <div
            style={{
              padding: 12,
              border: "1px solid var(--vf-border-1)",
              background: "var(--vf-bg-1)",
            }}
          >
            <Show above="md">
              <Text>▲ visible at md+</Text>
            </Show>
            <Hide above="md">
              <Text>▼ only below md</Text>
            </Hide>
          </div>
          <div
            style={{
              padding: 12,
              border: "1px solid var(--vf-border-1)",
              background: "var(--vf-bg-1)",
            }}
          >
            <Show between={["md", "xl"]}>
              <Text>◆ tablet band (md..xl)</Text>
            </Show>
            <Hide between={["md", "xl"]}>
              <Text>◇ not in tablet band</Text>
            </Hide>
          </div>
        </Flex>
      </Block>
      <Block label="ResponsiveBox — JS-resolved grid">
        <ResponsiveBox
          display="grid"
          columns={{ base: 1, sm: 2, md: 3, lg: 4, xxl: 6 }}
          gap={{ base: 8, md: 12, lg: 16 }}
          p={{ base: 8, md: 16 }}
          style={{
            border: "1px solid var(--vf-border-2)",
            background: "var(--vf-bg-1)",
          }}
        >
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              style={{
                padding: 12,
                background: "var(--vf-bg-3)",
                textAlign: "center",
              }}
            >
              <Text>#{i + 1}</Text>
            </div>
          ))}
        </ResponsiveBox>
      </Block>
      <Block label="ResponsiveBox — layout flips at md">
        <ResponsiveBox
          display="flex"
          direction={{ base: "column", md: "row" }}
          gap={{ base: 8, md: 16 }}
          align={{ base: "stretch", md: "center" }}
          p={12}
          style={{
            border: "1px solid var(--vf-border-2)",
            background: "var(--vf-bg-1)",
          }}
        >
          <Badge>Stacked on mobile</Badge>
          <Text>Rows at md and above. Resize to toggle.</Text>
          <Button variant="accent" accent="var(--vf-green)">
            OK
          </Button>
        </ResponsiveBox>
      </Block>
      <Block label="Native Flex / Grid accept Responsive<T>">
        <Grid columns={{ base: 1, sm: 2, md: 4 }} gap={{ base: 4, md: 12 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              style={{ padding: 12, background: "var(--vf-bg-3)" }}
            >
              col {i + 1}
            </div>
          ))}
        </Grid>
      </Block>
      <Block label="Text — responsive size preset">
        <Flex direction={{ base: "column", md: "row" }} gap={12} align="baseline">
          <Text size="responsive-xl">Hero (scales)</Text>
          <Text size={{ base: "sm", md: "md" }} color="var(--vf-text-3)">
            Body text resizes at md
          </Text>
        </Flex>
      </Block>
      <Block label="Adaptive Table (stacked cards below md)">
        <Table
          columns={[
            { key: "name", header: "NAME", width: "1fr" },
            { key: "role", header: "ROLE", width: "1fr" },
            { key: "status", header: "STATUS", width: "120px" },
          ]}
          data={[
            { name: "Alice Smith", role: "Platform", status: "active" },
            { name: "Bob Jones", role: "Data", status: "on-call" },
            { name: "Grace Lee", role: "Infra", status: "idle" },
          ]}
        />
        <Text size="xs" color="var(--vf-text-3)">
          Resize below 768px — rows become stacked cards with label/value
          pairs.
        </Text>
      </Block>
    </Frame>
  );
}

// ─────────────────────────────────────────────────────────────
// PHASE 15 — THEMING
// ─────────────────────────────────────────────────────────────

function ThemingSection() {
  const [previewTheme, setPreviewTheme] = useState<
    "dark" | "light" | "midnight" | "grey"
  >("light");
  const [density, setDensity] = useState<"comfortable" | "compact" | "spacious">(
    "comfortable"
  );
  const themeMap = {
    dark: darkTheme,
    light: lightTheme,
    midnight: midnightTheme,
    grey: greyTheme,
  };
  return (
    <Frame
      title="Theming — Scope + Density + Contrast"
      description="ThemeScope re-emits CSS vars for a subtree. Density + contrast + motion modes cascade via data attributes."
    >
      <Block label="ThemeScope — preview the opposite theme">
        <Flex gap={16} wrap align="flex-start">
          <ThemeSelector
            size="sm"
            value={previewTheme}
            onChange={(v) => setPreviewTheme(v as typeof previewTheme)}
            themes={[
              { id: "dark", label: "Dark" },
              { id: "light", label: "Light" },
              { id: "midnight", label: "Midnight" },
              { id: "grey", label: "Grey" },
            ]}
          />
          <ThemeScope
            theme={themeMap[previewTheme]}
            style={{
              padding: 16,
              border: "1px solid var(--vf-border-2)",
              background: "var(--vf-bg-1)",
              minWidth: 320,
            }}
          >
            <Text size="xs" color="var(--vf-text-3)" upper spacing={2}>
              {previewTheme} scope
            </Text>
            <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
              <Button>Default</Button>
              <Button variant="accent" accent="var(--vf-green)">
                Accent
              </Button>
              <Badge tone="success">Success</Badge>
              <Badge tone="danger">Danger</Badge>
            </div>
            <div style={{ marginTop: 12 }}>
              <Text>
                Surface ramp visible here uses the <b>{previewTheme}</b> token
                set; the rest of the demo stays on the root theme.
              </Text>
            </div>
          </ThemeScope>
        </Flex>
      </Block>
      <Block label="Density modes">
        <ThemeSelector
          size="sm"
          value={density}
          onChange={(v) => setDensity(v as typeof density)}
          themes={[
            { id: "comfortable", label: "Comfortable" },
            { id: "compact", label: "Compact" },
            { id: "spacious", label: "Spacious" },
          ]}
        />
        <ThemeScope
          density={density}
          style={{
            marginTop: 12,
            padding: 16,
            border: "1px solid var(--vf-border-2)",
            background: "var(--vf-bg-1)",
          }}
        >
          <Flex gap={8} align="center">
            <Button>OK</Button>
            <Button variant="ghost">Cancel</Button>
            <Badge>v1.0</Badge>
            <Text>Spacing tokens scale with <code>data-vf-density</code>.</Text>
          </Flex>
        </ThemeScope>
      </Block>
      <Block label="Contrast — high-contrast scope">
        <ThemeScope
          contrast="high"
          style={{
            padding: 16,
            border: "1px solid var(--vf-border-2)",
            background: "var(--vf-bg-1)",
          }}
        >
          <Text color="var(--vf-text-1)">
            Text-1 is brighter here. Borders thicken. Focus ring widens.
          </Text>
          <Flex gap={8} style={{ marginTop: 8 }}>
            <Button>Primary</Button>
            <Button variant="ghost">Ghost</Button>
          </Flex>
        </ThemeScope>
      </Block>
      <Block label="RTL scope (direction='rtl')">
        <ThemeScope
          direction="rtl"
          style={{
            padding: 16,
            border: "1px solid var(--vf-border-2)",
            background: "var(--vf-bg-1)",
          }}
        >
          <Flex gap={8} align="center">
            <ChevronRightIcon />
            <Text>القوالب تعكس الاتجاه تلقائيًا.</Text>
            <ArrowRightIcon />
          </Flex>
        </ThemeScope>
      </Block>
      <Block label="ThemeSelector variants">
        <Flex gap={16} align="center" wrap>
          <ThemeSelector
            size="sm"
            defaultValue="dark"
            themes={[
              { id: "dark", label: "Dark" },
              { id: "light", label: "Light" },
              { id: "system", label: "Auto" },
            ]}
          />
          <ThemeSelector
            variant="dropdown"
            defaultValue="dark"
            themes={[
              { id: "dark", label: "Dark" },
              { id: "light", label: "Light" },
              { id: "midnight", label: "Midnight" },
              { id: "grey", label: "Grey" },
              { id: "system", label: "Auto" },
            ]}
          />
        </Flex>
      </Block>
    </Frame>
  );
}

// ─────────────────────────────────────────────────────────────
// PHASE 14 — ICONS
// ─────────────────────────────────────────────────────────────

function IconsPrimitiveSection() {
  return (
    <Frame
      title="Icons — Primitive + Sizes"
      description="Monoline 1px-stroke brutalist set. xs=12 sm=14 md=16 lg=20 xl=24 xxl=32."
    >
      <Block label="Size scale">
        <Flex gap={12} align="center">
          {(["xs", "sm", "md", "lg", "xl", "xxl"] as const).map((s) => (
            <Flex key={s} direction="column" align="center" gap={4}>
              <SearchIcon size={s} />
              <Text size="xs" color="var(--vf-text-4)">
                {s}
              </Text>
            </Flex>
          ))}
        </Flex>
      </Block>
      <Block label="Color follows currentColor">
        <Flex gap={16} align="center">
          <span style={{ color: "var(--vf-text-0)" }}>
            <HeartIcon size="xl" />
          </span>
          <span style={{ color: "var(--vf-success)" }}>
            <SuccessIcon size="xl" />
          </span>
          <span style={{ color: "var(--vf-warning)" }}>
            <WarningIcon size="xl" />
          </span>
          <span style={{ color: "var(--vf-danger)" }}>
            <ErrorIcon size="xl" />
          </span>
          <span style={{ color: "var(--vf-info)" }}>
            <InfoIcon size="xl" />
          </span>
        </Flex>
      </Block>
      <Block label="Flip / rotate / spin / pulse">
        <Flex gap={24} align="center">
          <Flex direction="column" align="center" gap={4}>
            <ArrowRightIcon size="xl" />
            <Text size="xs" color="var(--vf-text-4)">
              default
            </Text>
          </Flex>
          <Flex direction="column" align="center" gap={4}>
            <ArrowRightIcon size="xl" flipX />
            <Text size="xs" color="var(--vf-text-4)">
              flipX
            </Text>
          </Flex>
          <Flex direction="column" align="center" gap={4}>
            <ArrowRightIcon size="xl" rotate={90} />
            <Text size="xs" color="var(--vf-text-4)">
              rotate 90°
            </Text>
          </Flex>
          <Flex direction="column" align="center" gap={4}>
            <SpinnerIcon size="xl" spin />
            <Text size="xs" color="var(--vf-text-4)">
              spin
            </Text>
          </Flex>
          <Flex direction="column" align="center" gap={4}>
            <HeartIcon size="xl" pulse />
            <Text size="xs" color="var(--vf-text-4)">
              pulse
            </Text>
          </Flex>
          <Flex direction="column" align="center" gap={4}>
            <LoadingDotsIcon size="xl" />
            <Text size="xs" color="var(--vf-text-4)">
              dots
            </Text>
          </Flex>
        </Flex>
      </Block>
      <Block label="Custom Icon (consumer draws SVG children)">
        <Flex gap={16} align="center">
          <Icon size="xl" label="Diamond">
            <path d="M12 3l9 9-9 9-9-9z" />
          </Icon>
          <Icon size="xl" label="Tile">
            <rect x="4" y="4" width="8" height="8" />
            <rect x="12" y="12" width="8" height="8" />
          </Icon>
        </Flex>
      </Block>
    </Frame>
  );
}

function IconsSetSection() {
  const icons: { name: string; Comp: typeof SearchIcon }[] = [
    { name: "Plus", Comp: PlusIcon },
    { name: "Check", Comp: CheckIcon },
    { name: "X", Comp: XIcon },
    { name: "Edit", Comp: EditIcon },
    { name: "Trash", Comp: TrashIcon },
    { name: "Copy", Comp: CopyIcon },
    { name: "Download", Comp: DownloadIcon },
    { name: "Upload", Comp: UploadIcon },
    { name: "Refresh", Comp: RefreshIcon },
    { name: "Save", Comp: SaveIcon },
    { name: "Share", Comp: ShareIcon },
    { name: "Send", Comp: SendIcon },
    { name: "Pin", Comp: PinIcon },
    { name: "ChevronUp", Comp: ChevronUpIcon },
    { name: "ChevronDown", Comp: ChevronDownIcon },
    { name: "ChevronLeft", Comp: ChevronLeftIcon },
    { name: "ChevronRight", Comp: ChevronRightIcon },
    { name: "ArrowLeft", Comp: ArrowLeftIcon },
    { name: "ArrowRight", Comp: ArrowRightIcon },
    { name: "Home", Comp: HomeIcon },
    { name: "More", Comp: MoreHorizontalIcon },
    { name: "Menu", Comp: MenuIcon },
    { name: "File", Comp: FileIcon },
    { name: "Folder", Comp: FolderIcon },
    { name: "Bold", Comp: BoldIcon },
    { name: "Code", Comp: CodeIcon },
    { name: "Link", Comp: LinkIcon },
    { name: "Info", Comp: InfoIcon },
    { name: "Warning", Comp: WarningIcon },
    { name: "Error", Comp: ErrorIcon },
    { name: "Success", Comp: SuccessIcon },
    { name: "Question", Comp: QuestionIcon },
    { name: "Star", Comp: StarIcon },
    { name: "Heart", Comp: HeartIcon },
    { name: "Settings", Comp: SettingsIcon },
    { name: "User", Comp: UserIcon },
    { name: "Users", Comp: UsersIcon },
    { name: "Lock", Comp: LockIcon },
    { name: "Eye", Comp: EyeIcon },
    { name: "Search", Comp: SearchIcon },
    { name: "Filter", Comp: FilterIcon },
    { name: "Sort", Comp: SortIcon },
    { name: "Mail", Comp: MailIcon },
    { name: "Bell", Comp: BellIcon },
    { name: "Message", Comp: MessageIcon },
    { name: "Play", Comp: PlayIcon },
    { name: "Pause", Comp: PauseIcon },
    { name: "Stop", Comp: StopIcon },
    { name: "Clock", Comp: ClockIcon },
    { name: "Calendar", Comp: CalendarIcon },
    { name: "Sun", Comp: SunIcon },
    { name: "Moon", Comp: MoonIcon },
    { name: "ChartBar", Comp: ChartBarIcon },
    { name: "Database", Comp: DatabaseIcon },
    { name: "Terminal", Comp: TerminalIcon },
    { name: "Cloud", Comp: CloudIcon },
    { name: "Caret", Comp: CaretIcon },
  ];
  return (
    <Frame
      title="Icons — Bundled set"
      description="~60 core icons across actions, navigation, files, editors, status, shapes, system, communication, media, time, and data."
    >
      <Block label="Core library">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(96px, 1fr))",
            gap: 8,
          }}
        >
          {icons.map(({ name, Comp }) => (
            <div
              key={name}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6,
                padding: 8,
                border: "1px solid var(--vf-border-1)",
                background: "var(--vf-bg-2)",
              }}
            >
              <Comp size="xl" />
              <Text size="xs" color="var(--vf-text-3)">
                {name}
              </Text>
            </div>
          ))}
        </div>
      </Block>
    </Frame>
  );
}

function IconsButtonSection() {
  const [bold, setBold] = useState(false);
  const [italic, setItalic] = useState(true);
  return (
    <Frame
      title="Icons — IconButton + IconGroup"
      description="Square icon-only buttons with required aria-label. IconGroup composes rows with optional separators."
    >
      <Block label="IconButton variants + sizes">
        <Flex gap={8} align="center">
          <IconButton aria-label="Search">
            <SearchIcon />
          </IconButton>
          <IconButton aria-label="Edit" variant="ghost">
            <EditIcon />
          </IconButton>
          <IconButton aria-label="Save" variant="solid" accent="#4ade80">
            <SaveIcon />
          </IconButton>
          <IconButton aria-label="Refresh" variant="accent" accent="#60a5fa">
            <RefreshIcon />
          </IconButton>
          <IconButton aria-label="Disabled" disabled>
            <CopyIcon />
          </IconButton>
        </Flex>
        <Flex gap={8} align="center" style={{ marginTop: 8 }}>
          <IconButton size="xs" aria-label="Tiny">
            <PlusIcon />
          </IconButton>
          <IconButton size="sm" aria-label="Small">
            <PlusIcon />
          </IconButton>
          <IconButton size="md" aria-label="Medium">
            <PlusIcon />
          </IconButton>
          <IconButton size="lg" aria-label="Large">
            <PlusIcon />
          </IconButton>
        </Flex>
      </Block>
      <Block label="Toggle + tooltip">
        <Flex gap={8} align="center">
          <IconButton
            aria-label="Bold"
            active={bold}
            onClick={() => setBold((b) => !b)}
            tooltip="Bold (⌘B)"
          >
            <BoldIcon />
          </IconButton>
          <IconButton
            aria-label="Italic"
            active={italic}
            onClick={() => setItalic((b) => !b)}
            tooltip="Italic (⌘I)"
          >
            <Icon size="md">
              <path d="M10 4h8" />
              <path d="M6 20h8" />
              <path d="M14 4l-4 16" />
            </Icon>
          </IconButton>
        </Flex>
      </Block>
      <Block label="IconGroup">
        <IconGroup gap={8}>
          <FileIcon />
          <Text size="sm">demo/App.tsx</Text>
          <SuccessIcon size="sm" color="var(--vf-success)" />
        </IconGroup>
        <IconGroup gap={8} separator="·" style={{ marginTop: 8 }}>
          <Text size="sm">Home</Text>
          <Text size="sm">Dashboard</Text>
          <Text size="sm">Settings</Text>
        </IconGroup>
      </Block>
    </Frame>
  );
}

// ─────────────────────────────────────────────────────────────
// PHASE 13 — SPECIALTY
// ─────────────────────────────────────────────────────────────

function SpecialtyDevToolsSection() {
  const [pairs, setPairs] = useState<
    import("../src").KeyValuePair[]
  >([
    { id: "1", key: "Authorization", value: "Bearer …" },
    { id: "2", key: "Accept", value: "application/json" },
  ]);
  const [query, setQuery] = useState<import("../src").QueryGroup>({
    id: "root",
    combinator: "AND",
    rules: [
      { id: "r1", field: "status", operator: "=", value: "active" },
    ],
  });
  const [shortcut, setShortcut] = useState("mod+shift+k");
  const [debugFormat, setDebugFormat] = useState<"json" | "yaml">("json");
  return (
    <Frame
      title="Specialty — Dev Tools"
      description="CommitGraph, NetworkInspector, ConsoleOutput, DebugTree, KeyValueEditor, QueryBuilder, ShortcutEditor."
    >
      <Block label="CommitGraph">
        <CommitGraph
          activeId="c2"
          commits={[
            { id: "c1abcdef", message: "Phase 13 kickoff", branch: "main" },
            { id: "c2abcdef", message: "Add specialty CSS", tone: "info" },
            { id: "c3abcdef", message: "Fix flaky test", tone: "warning" },
            { id: "c4abcdef", message: "Ship Phase 12", tone: "success" },
          ]}
        />
      </Block>
      <Block label="NetworkInspector">
        <NetworkInspector
          requests={[
            {
              id: "1",
              method: "GET",
              url: "/api/sessions",
              status: 200,
              duration: 42,
              size: 1800,
              type: "json",
              requestHeaders: { accept: "application/json" },
              responseBody: { sessions: 3 },
            },
            {
              id: "2",
              method: "POST",
              url: "/api/messages",
              status: 429,
              duration: 310,
              size: 200,
              type: "json",
            },
            {
              id: "3",
              method: "GET",
              url: "/api/stream",
              state: "pending",
              type: "stream",
            },
          ]}
          selectedId="1"
        />
      </Block>
      <Block label="ConsoleOutput">
        <ConsoleOutput
          filter="info+"
          entries={[
            { level: "debug", message: "tick" },
            {
              level: "info",
              message: "Worker started",
              timestamp: new Date(Date.now() - 30_000),
            },
            {
              level: "warn",
              message: "Queue backing up",
              timestamp: new Date(Date.now() - 10_000),
              source: "worker",
            },
            {
              level: "error",
              message: "Job 42 failed",
              timestamp: Date.now(),
            },
          ]}
        />
      </Block>
      <Block label="DebugTree">
        <Flex gap={12} align="center" style={{ marginBottom: 8 }}>
          <ButtonGroup
            options={[
              { key: "json", label: "JSON" },
              { key: "yaml", label: "YAML" },
            ]}
            value={debugFormat}
            onChange={(k) => setDebugFormat(k as "json" | "yaml")}
          />
        </Flex>
        <DebugTree
          rootLabel="state"
          format={debugFormat}
          data={{
            count: 3,
            user: { id: "u1", role: "admin", tags: ["alpha", "beta"] },
            pending: [1, 2],
            settings: { dense: true, theme: null },
          }}
          defaultExpanded={2}
        />
      </Block>
      <Block label="KeyValueEditor">
        <KeyValueEditor entries={pairs} onChange={setPairs} />
      </Block>
      <Block label="QueryBuilder">
        <QueryBuilder
          fields={[
            { id: "status", label: "Status" },
            { id: "owner", label: "Owner" },
            { id: "score", label: "Score", type: "number" },
          ]}
          value={query}
          onChange={setQuery}
        />
      </Block>
      <Block label="ShortcutEditor">
        <ShortcutEditor
          value={shortcut}
          onChange={setShortcut}
          conflicts={["mod+shift+p"]}
        />
      </Block>
    </Frame>
  );
}

function SpecialtyIdentitySection() {
  const [selected, setSelected] = useState("#4ade80");
  return (
    <Frame
      title="Specialty — Identity"
      description="UserCard, TeamCard, OrganizationCard, Identicon, PresenceList, ColorSwatch, Palette."
    >
      <Block label="UserCard / TeamCard / OrganizationCard">
        <Flex gap={16} wrap>
          <UserCard
            user={{
              name: "Ada Lovelace",
              title: "Principal engineer",
              team: "Platform",
              email: "ada@example.com",
              status: "online",
            }}
            actions={<Button variant="ghost">Follow</Button>}
          />
          <TeamCard
            team={{
              name: "Platform",
              description: "Infrastructure + tooling",
              memberCount: 8,
              lead: "Ada",
            }}
          />
          <OrganizationCard
            organization={{
              name: "Acme",
              description: "The public benefit corporation.",
              website: "https://acme.test",
              members: 240,
              plan: "Enterprise",
            }}
          />
        </Flex>
      </Block>
      <Block label="Identicon">
        <Flex gap={12} align="center">
          {["ada@example.com", "linus@example.com", "grace@example.com"].map(
            (v) => (
              <Flex key={v} direction="column" align="center" gap={4}>
                <Identicon value={v} size={40} />
                <Text size="xs" color="var(--vf-text-3)">
                  {v}
                </Text>
              </Flex>
            )
          )}
        </Flex>
      </Block>
      <Block label="PresenceList (grouped by status)">
        <PresenceList
          groupByStatus
          users={[
            { id: "1", name: "Ada", status: "online", statusMessage: "shipping" },
            { id: "2", name: "Linus", status: "busy" },
            { id: "3", name: "Grace", status: "away" },
            { id: "4", name: "Tim", status: "offline" },
          ]}
        />
      </Block>
      <Block label="ColorSwatch + Palette">
        <Flex gap={16} align="center">
          <ColorSwatch color={selected} size="lg" showLabel />
          <Palette
            colors={[
              "#0f0f0f",
              "#222",
              "#4ade80",
              "#60a5fa",
              "#f472b6",
              "#fbbf24",
              "#a78bfa",
              "#2dd4bf",
              "#fb7185",
            ]}
            value={selected}
            onSelect={setSelected}
            size="md"
          />
        </Flex>
      </Block>
    </Frame>
  );
}

function SpecialtyNumericSection() {
  return (
    <Frame
      title="Specialty — Numeric"
      description="NumberDisplay, CurrencyDisplay, PercentDisplay, BigNumber."
    >
      <Block label="Primitives">
        <Flex gap={24} wrap align="baseline">
          <Text>
            Sessions <NumberDisplay value={12_845} compact />
          </Text>
          <Text>
            Revenue{" "}
            <CurrencyDisplay value={1_234_567.89} currency="USD" compact />
          </Text>
          <Text>
            Growth{" "}
            <PercentDisplay value={0.124} decimals={1} signed autoTone />
          </Text>
        </Flex>
      </Block>
      <Block label="BigNumber">
        <Flex gap={16} wrap>
          <BigNumber
            label="Active users"
            value={<NumberDisplay value={12_845} compact />}
            unit="total"
            delta="+5.4%"
            deltaTone="success"
          />
          <BigNumber
            label="Revenue"
            value={
              <CurrencyDisplay value={1_234_567.89} currency="USD" compact />
            }
            unit="MTD"
            delta="-1.2%"
            deltaTone="danger"
          />
          <BigNumber
            label="Latency p50"
            value="42ms"
            unit="p50"
            delta="-8%"
            deltaTone="info"
            size="md"
          />
        </Flex>
      </Block>
    </Frame>
  );
}

function SpecialtyTimeSection() {
  const [zone, setZone] = useState("UTC");
  return (
    <Frame
      title="Specialty — Time"
      description="TimeZoneSelect, RelativeTime, DurationDisplay, Countdown."
    >
      <Block label="TimeZoneSelect">
        <TimeZoneSelect value={zone} onChange={setZone} />
      </Block>
      <Block label="RelativeTime / DurationDisplay / Countdown">
        <Flex gap={24} wrap>
          <Text>
            Updated{" "}
            <RelativeTime date={Date.now() - 125_000} />
          </Text>
          <Text>
            Duration <DurationDisplay seconds={3725} />
          </Text>
          <Text>
            Duration (long){" "}
            <DurationDisplay seconds={3725} format="long" />
          </Text>
          <Text>
            Until launch <Countdown target={Date.now() + 60 * 60 * 1000} />
          </Text>
        </Flex>
      </Block>
    </Frame>
  );
}

function SpecialtyHelpSection() {
  return (
    <Frame
      title="Specialty — Help & What's New"
      description="HelpTooltip, ContextHelp, Changelog, WhatsNewPopover, LegalText."
    >
      <Block label="HelpTooltip">
        <Flex gap={8} align="center">
          <Text>Enable autopilot</Text>
          <HelpTooltip content="Autopilot runs scheduled deploys in the background. Disable if you need manual gatekeeping." />
        </Flex>
      </Block>
      <Block label="ContextHelp (side panel)">
        <div
          style={{
            height: 180,
            display: "grid",
            gridTemplateColumns: "1fr auto",
            border: "1px solid var(--vf-border-1)",
          }}
        >
          <div style={{ padding: 16 }}>
            <Text>Focused element documentation goes here.</Text>
          </div>
          <ContextHelp titleLabel="Autopilot">
            <Text size="sm">
              Autopilot handles scheduled deploys, retries, and rollbacks based
              on your thresholds.
            </Text>
          </ContextHelp>
        </div>
      </Block>
      <Block label="Changelog">
        <Changelog
          collapsed
          entries={[
            {
              version: "1.3.0",
              date: "2026-04-14",
              title: "Phase 13 — specialty",
              changes: [
                { kind: "added", description: "Widget shell + dashboard grid" },
                { kind: "added", description: "Identity cards + presence" },
                { kind: "added", description: "Numeric, time, help, print" },
              ],
            },
            {
              version: "1.2.0",
              date: "2026-04-14",
              title: "Phase 12 — chat & AI",
              changes: [
                { kind: "added", description: "50+ chat/agent components" },
                { kind: "fixed", description: "Tabs demo API mismatch" },
              ],
            },
          ]}
        />
      </Block>
      <Block label="WhatsNewPopover (in-place preview)">
        <WhatsNewPopover
          version="1.3.0"
          features={[
            { icon: "◆", title: "Dashboard grid", description: "Drag + resize widgets" },
            { icon: "●", title: "Chat surface", description: "50+ components" },
            { icon: "▲", title: "Identity cards", description: "User / team / org" },
          ]}
          storage={{
            get: () => null,
            set: () => undefined,
          }}
        />
      </Block>
      <Block label="LegalText">
        <LegalText>
          By using Voidframe you agree to the MIT license. Third-party peer
          dependencies (mermaid, qrcode-generator, jsbarcode) remain the
          property of their respective owners.
        </LegalText>
      </Block>
    </Frame>
  );
}

function SpecialtyEncodingSection() {
  return (
    <Frame
      title="Specialty — Encoding"
      description="QRCode + Barcode. Supply a real generator via `matrix` or `pattern` props — placeholders shown here."
    >
      <Block label="QRCode (placeholder pattern)">
        <Flex gap={16} align="center">
          <QRCode value="https://voidframe.dev" size={140} />
          <QRCode value="order-42" size={100} ecc="M" />
        </Flex>
      </Block>
      <Block label="Barcode (placeholder pattern)">
        <Barcode value="SKU-VOIDFRAME-001" format="code128" />
      </Block>
    </Frame>
  );
}

function SpecialtyWidgetsSection() {
  // Sub-cell positions: each card occupies a (w × h) block of 1×1 sub-cells.
  // Drag picks up the card and snaps it to any free sub-cell where it fits,
  // or swaps with another card if the cursor is dropped onto it.
  const initialLayout: import("../src").DashboardLayoutItem[] = [
    { id: "users", x: 0, y: 0, w: 8, h: 5 },
    { id: "revenue", x: 8, y: 0, w: 8, h: 5 },
    { id: "errors", x: 0, y: 5, w: 6, h: 4 },
    { id: "deploys", x: 6, y: 5, w: 10, h: 4 },
  ];
  const [layout, setLayout] = useState(initialLayout);
  return (
    <Frame
      title="Specialty — Widgets + Print"
      description="WidgetShell, DashboardGrid, PrintLayout, PrintButton."
    >
      <Block label="DashboardGrid (open canvas, snap-to-sub-cell drag, swap-on-drop, corner resize)">
        <DashboardGrid
          items={layout}
          onLayoutChange={setLayout}
          movable
          resizable
          cols={24}
          cellSize={28}
          gap={4}
          bounds="auto"
          renderItem={(id) => {
            const labels: Record<string, string> = {
              users: "Active users",
              revenue: "Revenue",
              errors: "Errors",
              deploys: "Deploys",
            };
            return (
              <WidgetShell
                title={labels[id] ?? id}
                actions={
                  <Button variant="ghost" size="sm">
                    ⋯
                  </Button>
                }
              >
                <BigNumber value="12,345" unit="this week" size="md" />
              </WidgetShell>
            );
          }}
        />
      </Block>
      <Block label="PrintLayout + PrintButton">
        <PrintLayout title="Quarterly Report" subtitle="Q1 2026">
          <Text>Report body — styles are preserved through print.</Text>
        </PrintLayout>
        <PrintButton documentTitle="Quarterly Report">Print report</PrintButton>
      </Block>
    </Frame>
  );
}

// ─────────────────────────────────────────────────────────────
// PHASE 12 — CHAT & AI
// ─────────────────────────────────────────────────────────────

function ChatMessagesSection() {
  return (
    <Frame
      title="Chat — Messages"
      description="Conversation, Message, MessageContent, StreamingText, ThinkingIndicator, ReasoningTrace, actions + feedback + reactions + edit."
    >
      <Block label="Conversation with mixed messages">
        <Conversation status="streaming" style={{ height: 320 }}>
          <MessageList>
            <MessageGroup author={{ name: "Ops", avatar: "▲" }}>
              <Message
                role="user"
                content="Summarize today's incident report."
              />
            </MessageGroup>
            <MessageGroup author={{ name: "Claude", avatar: "◆" }}>
              <Message
                role="assistant"
                content={
                  <>
                    <ReasoningTrace
                      content="First I'll list incidents, then dedupe and rank by impact."
                      duration={3200}
                    />
                    <MessageContent
                      content="3 incidents overnight. Two network blips and one disk-space warning on db-2."
                      streaming
                    />
                  </>
                }
                actions={
                  <MessageActions>
                    <MessageActions.Copy />
                    <MessageActions.Regenerate />
                  </MessageActions>
                }
                reactions={
                  <ReactionBar
                    reactions={[
                      { emoji: "👍", count: 2, reacted: true },
                      { emoji: "❤", count: 1 },
                    ]}
                  />
                }
              />
            </MessageGroup>
            <ThinkingIndicator duration={1800} />
          </MessageList>
        </Conversation>
      </Block>
      <Block label="StreamingText (instant)">
        <StreamingText text="Token stream rendering, with a blinking cursor." />
      </Block>
      <Block label="MessageFeedback + MessageEdit">
        <Flex gap={16} align="flex-start">
          <MessageFeedback
            reasons={[
              { id: "wrong", label: "Incorrect" },
              { id: "vague", label: "Too vague" },
              { id: "long", label: "Too long" },
            ]}
          />
          <MessageEditDemo />
        </Flex>
      </Block>
    </Frame>
  );
}

function MessageEditDemo() {
  const [value, setValue] = useState("Edit me with cmd+Enter to save.");
  return (
    <MessageEdit
      value={value}
      onChange={setValue}
      onSave={(v) => toast.success(`Saved: ${v.slice(0, 24)}…`)}
      onCancel={() => toast.info("Cancelled")}
      autoFocus={false}
    />
  );
}

function ChatAgentSection() {
  return (
    <Frame
      title="Chat — Agents"
      description="ToolCall, ToolCallGroup, AgentStep, AgentTrace, PlanDisplay."
    >
      <Block label="Tool call states">
        <Flex gap={16} direction="column">
          <ToolCall name="search_web" status="running" args={{ query: "voidframe" }} />
          <ToolCall
            name="read_file"
            status="complete"
            duration={412}
            args={{ path: "README.md" }}
            result="A monospace React UI framework…"
            defaultExpanded
          />
          <ToolCall
            name="post_message"
            status="error"
            errorMessage="429 Too Many Requests"
            defaultExpanded
            onRetry={() => toast.info("Retrying…")}
          />
        </Flex>
      </Block>
      <Block label="ToolCallGroup + AgentStep">
        <ToolCallGroup title="Searching the web" status="complete">
          <ToolCall name="search_web" status="complete" duration={320} />
          <ToolCall name="fetch_page" status="complete" duration={700} />
        </ToolCallGroup>
        <AgentStep
          number={1}
          title="Gather logs"
          status="complete"
          duration={1200}
          output="12 events collected"
          defaultExpanded
        />
        <AgentStep
          number={2}
          title="Summarize"
          status="running"
          toolCalls={<ToolCall name="summarize" status="running" />}
        />
      </Block>
      <Block label="AgentTrace + PlanDisplay">
        <AgentTrace
          tokens={{ input: 1234, output: 512 }}
          cost="$0.0042"
          duration={4800}
          status="complete"
          steps={
            <>
              <AgentStep number={1} title="Plan" status="complete" duration={400} />
              <AgentStep number={2} title="Execute" status="complete" duration={1800} />
              <AgentStep number={3} title="Report" status="complete" duration={200} />
            </>
          }
        />
        <PlanDisplay
          title="Plan"
          steps={[
            { id: "1", title: "Analyze context", status: "done" },
            { id: "2", title: "Draft response", status: "active" },
            { id: "3", title: "Cite sources", status: "pending" },
          ]}
        />
      </Block>
      <Block label="TraceViewer">
        <TraceViewer
          spans={[
            { id: "a", name: "plan", startMs: 0, durationMs: 400 },
            { id: "b", name: "search_web", startMs: 400, durationMs: 900 },
            { id: "c", name: "summarize", startMs: 1300, durationMs: 1200 },
            { id: "d", name: "render", startMs: 2500, durationMs: 300 },
          ]}
        />
      </Block>
    </Frame>
  );
}

function ChatAttachmentsSection() {
  return (
    <Frame
      title="Chat — Attachments + Mentions"
      description="AttachmentList, ImageAttachment, FileAttachment, Mention."
    >
      <Block label="AttachmentList">
        <AttachmentList>
          <FileAttachment name="design.pdf" extension="pdf" size="2.3 MB" />
          <FileAttachment name="spec.md" extension="md" size="14 KB" />
          <ImageAttachment
            src="https://picsum.photos/seed/voidframe/300/180"
            alt="Screenshot"
            width={180}
          />
        </AttachmentList>
      </Block>
      <Block label="Mentions inside content">
        <Text>
          Ping <Mention value="alice" kind="user" /> in{" "}
          <Mention value="ops" kind="channel" /> about{" "}
          <Mention value="deploy.yml" kind="file" />.
        </Text>
      </Block>
    </Frame>
  );
}

function ChatCitationsSection() {
  const sources = [
    {
      id: 1,
      title: "Voidframe — README",
      url: "https://example.com/readme",
      snippet: "A dark-monochrome React UI framework.",
      publisher: "git.ahadley.local",
    },
    {
      id: 2,
      title: "Phase plan 12",
      url: "https://example.com/plan",
      snippet: "Ship ~50 chat/AI components.",
      publisher: "internal",
    },
  ];
  return (
    <Frame
      title="Chat — Citations & Sources"
      description="Citation, CitationList, SourceCard, SourceGrid, RAGContext."
    >
      <Block label="Inline Citation + CitationList">
        <Text>
          The answer is grounded in two sources{" "}
          <Citation index={1} source={sources[0]} />
          <Citation index={2} source={sources[1]} />.
        </Text>
        <CitationList sources={sources} />
      </Block>
      <Block label="SourceCard + SourceGrid">
        <SourceCard
          title="Example — Voidframe"
          url="https://example.com/readme"
          snippet="A dark-monochrome React UI framework. Terminal-brutalist. Data-dense."
          publisher="example.com"
          publishedAt="today"
        />
        <SourceGrid sources={sources} />
      </Block>
      <Block label="RAGContext">
        <RAGContext
          chunks={[
            {
              source: "README.md · §Install",
              content: "npm install voidframe\n\nPeer deps: react 18+, react-dom 18+.",
              score: 0.92,
            },
            {
              source: "README.md · §Theming",
              content: "Wrap in VoidframeProvider. Override tokens via createTheme.",
              score: 0.71,
            },
          ]}
        />
      </Block>
    </Frame>
  );
}

function ChatComposerSection() {
  const [draft, setDraft] = useState("");
  const [streaming, setStreaming] = useState(false);
  return (
    <Frame
      title="Chat — Composer"
      description="Composer compound, SubmitButton, StopButton, RegenerateButton, SuggestionChips, SlashCommandPicker."
    >
      <Block label="Composer with toolbar, mic, token counter, submit">
        <Composer
          value={draft}
          onChange={setDraft}
          status={streaming ? "streaming" : "idle"}
          maxLength={500}
          onSubmit={(v) => {
            setStreaming(true);
            toast.info(`Sent: ${v}`);
            setTimeout(() => {
              setStreaming(false);
              setDraft("");
            }, 1500);
          }}
          onStop={() => {
            setStreaming(false);
            toast.warning("Stopped");
          }}
        >
          <Composer.Toolbar>
            <Composer.AttachButton />
            <ComposerMicButton />
            <Composer.SlashButton />
          </Composer.Toolbar>
          <ComposerAttachment name="diagram.png" progress={72} />
          <Composer.Input placeholder="Message… (Enter to send, Shift+Enter for newline)" />
          <Composer.Footer>
            <Composer.TokenCounter />
            <Composer.Submit />
          </Composer.Footer>
        </Composer>
      </Block>
      <Block label="Standalone buttons">
        <Flex gap={8}>
          <SubmitButton status="idle" onSubmit={() => toast.info("send")} />
          <SubmitButton status="streaming" onStop={() => toast.info("stop")} />
          <StopButton onStop={() => toast.info("stop")} />
          <RegenerateButton onRegenerate={() => toast.info("regen")} />
        </Flex>
      </Block>
      <Block label="SuggestionChips">
        <SuggestionChips
          suggestions={[
            "Summarize this chat",
            "Translate to Spanish",
            "Draft a response",
            "Explain like I'm five",
          ]}
          onSelect={(s) => toast.info(`Picked: ${typeof s === "string" ? s : "custom"}`)}
        />
      </Block>
      <Block label="SlashCommandPicker">
        <SlashCommandPicker
          commands={[
            { id: "clear", command: "clear", description: "Clear the conversation" },
            { id: "model", command: "model", description: "Switch model" },
            { id: "summarize", command: "summarize", description: "TL;DR" },
          ]}
          onSelect={(cmd) => toast.info(`/${cmd.command}`)}
        />
      </Block>
    </Frame>
  );
}

function ChatSessionSection() {
  const [activeId, setActiveId] = useState("1");
  const sessions = [
    {
      id: "1",
      title: "Voidframe launch plan",
      lastMessage: "Phase 12 is under way.",
      updatedAt: Date.now() - 5 * 60 * 1000,
      pinned: true,
    },
    {
      id: "2",
      title: "Infra migration",
      lastMessage: "Proxmox cluster is healthy.",
      updatedAt: Date.now() - 2 * 60 * 60 * 1000,
    },
    {
      id: "3",
      title: "Onboarding notes",
      lastMessage: "Start with the demo.",
      updatedAt: Date.now() - 8 * 86_400_000,
    },
  ];
  return (
    <Frame
      title="Chat — Session + Model"
      description="SessionList, ConversationHeader, ConversationEmptyState, ModelSelector, SystemPromptEditor, TokenCounter, ContextWindow, CostDisplay."
    >
      <Block label="SessionList (grouped by day)">
        <div style={{ height: 280, width: 280 }}>
          <SessionList
            sessions={sessions}
            activeId={activeId}
            onSelect={setActiveId}
            onDelete={(id) => toast.danger(`Delete ${id}`)}
            onRename={(id) => toast.info(`Rename ${id}`)}
            onPin={(id) => toast.info(`Pin ${id}`)}
            searchable
          />
        </div>
      </Block>
      <Block label="ConversationHeader (editable title)">
        <ConversationHeader
          title="Voidframe launch plan"
          onTitleChange={(t) => toast.info(`Renamed to ${t}`)}
          model="opus-4.6"
          tokens={<ChatTokenCounter input={1234} output={212} max={8000} />}
          cost={<CostDisplay total={0.0042} />}
          status="streaming"
        />
      </Block>
      <Block label="ConversationEmptyState">
        <ConversationEmptyState
          title="Start a new conversation"
          description="Ask a question, run a task, or pick a suggestion below."
          logo="◆"
          suggestions={[
            { text: "Summarize the latest docs", description: "TL;DR of recent changes" },
            { text: "Generate a changelog", description: "From today's commits" },
            { text: "Draft a retro", description: "Last week's incidents" },
          ]}
          onSuggestionSelect={(s) =>
            toast.info(`Picked: ${typeof s.text === "string" ? s.text : "suggestion"}`)
          }
        />
      </Block>
      <Block label="Model / System prompt / Context / Cost">
        <ModelSelector
          showCapabilities
          models={[
            { id: "opus-4.6", name: "Opus 4.6", provider: "Anthropic", contextWindow: 1_000_000, capabilities: ["vision", "tool-use"] },
            { id: "sonnet-4.6", name: "Sonnet 4.6", provider: "Anthropic", contextWindow: 200_000 },
            { id: "haiku-4.5", name: "Haiku 4.5", provider: "Anthropic", contextWindow: 200_000 },
          ]}
        />
        <SystemPromptEditor
          placeholder="You are a helpful, concise assistant…"
          templates={[
            { id: "helpful", title: "Helpful", body: "You are a helpful, concise assistant." },
            { id: "code", title: "Code-focused", body: "You are a senior engineer. Prefer code." },
          ]}
        />
        <ContextWindow used={187_432} max={200_000} label="Context used" />
        <Flex gap={16} align="center">
          <LatencyIndicator value={420} label="p50" />
          <LatencyIndicator value={2_400} label="p95" />
          <LatencyIndicator value={7_100} label="p99" />
          <UnreadBadge count={12} />
        </Flex>
      </Block>
    </Frame>
  );
}

function ChatLayoutSection() {
  return (
    <Frame
      title="Chat — Layout patterns"
      description="ChatLayout, SimpleChat, AgentRunner, DebugPanel."
    >
      <Block label="ChatLayout (sidebar + conversation + inspector)">
        <div style={{ height: 320, border: "1px solid var(--vf-border-1)" }}>
          <ChatLayout
            sidebar={
              <SessionList
                sessions={[
                  { id: "1", title: "Session 1", updatedAt: Date.now() - 60_000 },
                  { id: "2", title: "Session 2", updatedAt: Date.now() - 3_600_000 },
                ]}
                activeId="1"
              />
            }
            conversation={
              <SimpleChat
                header={<ConversationHeader title="Session 1" model="opus-4.6" />}
                conversation={
                  <Conversation>
                    <MessageList>
                      <Message role="assistant" content="Hello. Ready to go." />
                    </MessageList>
                  </Conversation>
                }
              />
            }
            inspector={
              <DebugPanel
                events={[
                  { type: "request", message: "POST /messages", timestamp: Date.now() - 30_000 },
                  { type: "response", message: "200 OK", timestamp: Date.now() - 28_000 },
                ]}
              />
            }
          />
        </div>
      </Block>
      <Block label="AgentRunner (conversation + plan + trace)">
        <div style={{ height: 320, border: "1px solid var(--vf-border-1)" }}>
          <AgentRunner
            header={<ConversationHeader title="Agent run" model="opus-4.6" />}
            conversation={
              <Conversation>
                <MessageList>
                  <Message role="user" content="Run the deploy." />
                  <Message role="assistant" content="Starting deploy…" />
                </MessageList>
              </Conversation>
            }
            plan={
              <PlanDisplay
                title="Plan"
                steps={[
                  { id: "1", title: "Build", status: "done" },
                  { id: "2", title: "Migrate", status: "active" },
                  { id: "3", title: "Verify", status: "pending" },
                ]}
              />
            }
            trace={
              <TraceViewer
                spans={[
                  { id: "a", name: "build", startMs: 0, durationMs: 800 },
                  { id: "b", name: "migrate", startMs: 800, durationMs: 1400 },
                ]}
              />
            }
          />
        </div>
      </Block>
    </Frame>
  );
}

// ─────────────────────────────────────────────────────────────
// PHASE 25 — DEV EXPERIENCE
// ─────────────────────────────────────────────────────────────

function DevExperienceSection() {
  const [crash, setCrash] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [bumps, setBumps] = useState(0);
  const [showPanel, setShowPanel] = useState(true);
  const counterStats = useRenderProfiler("dev-demo-counter");

  function Boom() {
    if (crash) throw new Error("Demo: synthetic render error");
    return (
      <div style={{ color: "var(--vf-text-2)" }}>
        Component is rendering normally.
      </div>
    );
  }

  return (
    <Frame
      title="Dev Experience — Phase 25"
      description="ErrorBoundary + DevErrorFallback, render profiler, runtime misuse warnings, and the floating DevPanel."
    >
      <Block label="ErrorBoundary + DevErrorFallback">
        <Text size="sm" color="var(--vf-text-3)">
          Throw a render error and watch the boundary catch it. The fallback
          UI exposes the message, stack, and a Reset button. resetKeys
          auto-recover when an external value changes.
        </Text>
        <div style={{ display: "flex", gap: 8 }}>
          <Button onClick={() => setCrash(true)}>Throw error</Button>
          <Button
            variant="ghost"
            onClick={() => {
              setCrash(false);
              setResetKey((k) => k + 1);
            }}
          >
            Reset via key
          </Button>
        </div>
        <ErrorBoundary
          resetKeys={[resetKey]}
          fallback={(err, reset) => (
            <DevErrorFallback
              error={err}
              reset={() => {
                setCrash(false);
                reset();
              }}
            />
          )}
        >
          <Boom />
        </ErrorBoundary>
      </Block>

      <Block label="ProfilerScope + useRenderProfiler">
        <Text size="sm" color="var(--vf-text-3)">
          Wrap any subtree in <code>&lt;ProfilerScope id=&quot;…&quot;&gt;</code> to
          capture render timings. Read them via <code>useRenderProfiler(id)</code>
          (mounted outside the scope) or via the DevPanel below.
        </Text>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <Button onClick={() => setBumps((b) => b + 1)}>
            Trigger re-render ({bumps})
          </Button>
          <Text size="sm" color="var(--vf-text-2)">
            renders: {counterStats.renderCount} · last:{" "}
            {counterStats.lastDuration.toFixed(2)}ms · avg:{" "}
            {counterStats.avgDuration.toFixed(2)}ms
          </Text>
        </div>
        <ProfilerScope id="dev-demo-counter">
          <div
            style={{
              padding: 8,
              border: "1px solid var(--vf-border-1)",
              background: "var(--vf-bg-0)",
              fontFamily: "var(--vf-font-family)",
              fontSize: "var(--vf-fs-1)",
              color: "var(--vf-text-1)",
            }}
          >
            scope payload · bumps={bumps}
          </div>
        </ProfilerScope>
      </Block>

      <Block label="Runtime misuse warnings">
        <Text size="sm" color="var(--vf-text-3)">
          Misuse warnings fire from within components when their props are
          inconsistent (empty options, duplicate keys, unknown active values).
          They land in <code>console.warn</code> and stream into the DevPanel
          Warnings tab.
        </Text>
        <Button
          onClick={() =>
            warnOnce(
              `dev-demo:emit:${Date.now()}`,
              `Demo: synthetic warning at ${new Date().toLocaleTimeString()}`
            )
          }
        >
          Emit synthetic warning
        </Button>
      </Block>

      <Block label="DevPanel">
        <Text size="sm" color="var(--vf-text-3)">
          Drop <code>&lt;DevPanel /&gt;</code> at your app root. It floats in
          a corner with tabs for Renders, Warnings, Theme tokens, and About.
          Production builds render nothing unless <code>showInProduction</code>
          {" "}is set.
        </Text>
        <Button
          variant="ghost"
          onClick={() => setShowPanel((v) => !v)}
        >
          {showPanel ? "Hide DevPanel" : "Show DevPanel"}
        </Button>
        {showPanel && <DevPanel position="br" version="1.0.0" />}
      </Block>
    </Frame>
  );
}

// ─────────────────────────────────────────────────────────────
// REGISTRY + APP SHELL
// ─────────────────────────────────────────────────────────────

const SECTIONS: DemoSection[] = [
  { id: "foundations", group: "Core", title: "Foundations", render: () => <FoundationsSection /> },
  { id: "layout", group: "Core", title: "Layout", render: () => <LayoutSection /> },
  { id: "buttons", group: "Core", title: "Buttons & Indicators", render: () => <ButtonsSection /> },
  { id: "containers", group: "Core", title: "Containers", render: () => <ContainersSection /> },

  { id: "forms-core", group: "Forms", title: "Core", render: () => <FormsCoreSection /> },
  { id: "forms-extended", group: "Forms", title: "Extended", render: () => <FormsExtendedSection /> },
  { id: "forms-datetime", group: "Forms", title: "Date & Time", render: () => <FormsDateTimeSection /> },
  { id: "forms-complex", group: "Forms", title: "Complex selects", render: () => <FormsComplexSection /> },
  { id: "forms-editors", group: "Forms", title: "Editors", render: () => <FormsEditorsSection /> },
  { id: "forms-capture", group: "Forms", title: "Capture", render: () => <FormsCaptureSection /> },

  { id: "navigation", group: "Navigation", title: "Navigation", render: () => <NavigationSection /> },

  { id: "data-tables", group: "Data", title: "Tables", render: () => <DataTablesSection /> },
  { id: "data-lists", group: "Data", title: "Trees & Lists", render: () => <DataListsSection /> },
  { id: "data-metrics", group: "Data", title: "Metrics", render: () => <MetricsSection /> },
  { id: "data-charts", group: "Data", title: "Charts", render: () => <ChartsSection /> },
  { id: "data-chart-advanced", group: "Data", title: "Advanced charts (Phase 23)", render: () => <AdvancedChartsSection /> },
  { id: "data-chart-geonet", group: "Data", title: "Geo + Network (Phase 24)", render: () => <GeoNetworkChartsSection /> },
  { id: "data-chart-primitives", group: "Data", title: "Chart primitives (Phase 21)", render: () => <ChartPrimitivesSection /> },
  { id: "data-viewers", group: "Data", title: "Viewers", render: () => <ViewersSection /> },
  { id: "data-calendars", group: "Data", title: "Calendars", render: () => <CalendarsSection /> },
  { id: "data-avatars", group: "Data", title: "Avatars + Misc", render: () => <AvatarsSection /> },
  { id: "kanban", group: "Data", title: "Kanban", render: () => <KanbanSection /> },

  { id: "overlays", group: "Overlays", title: "Dialogs / Drawers / Popovers", render: () => <OverlaysSection /> },
  { id: "command", group: "Overlays", title: "Command + Onboarding", render: () => <CommandPaletteSection /> },
  { id: "notifications", group: "Overlays", title: "Notifications", render: () => <NotificationsSection /> },
  { id: "loading", group: "Overlays", title: "Loading & Status", render: () => <LoadingStatusSection /> },

  { id: "interactive", group: "Interactive", title: "Patterns", render: () => <InteractiveSection /> },
  { id: "animation", group: "Interactive", title: "Animation atoms", render: () => <AnimationSection /> },
  { id: "media", group: "Interactive", title: "Media", render: () => <MediaSection /> },
  { id: "utility", group: "Interactive", title: "Utility", render: () => <UtilitySection /> },

  { id: "i18n", group: "i18n", title: "Locales + Formatters + RTL", render: () => <I18nSection /> },

  { id: "responsive", group: "Responsive", title: "Breakpoints + Show/Hide", render: () => <ResponsiveSection /> },

  { id: "theming", group: "Theming", title: "Scope + Density + Contrast", render: () => <ThemingSection /> },

  { id: "icons-primitive", group: "Icons", title: "Primitive", render: () => <IconsPrimitiveSection /> },
  { id: "icons-set", group: "Icons", title: "Bundled set", render: () => <IconsSetSection /> },
  { id: "icons-button", group: "Icons", title: "IconButton + Group", render: () => <IconsButtonSection /> },

  { id: "specialty-devtools", group: "Specialty", title: "Dev tools", render: () => <SpecialtyDevToolsSection /> },
  { id: "specialty-identity", group: "Specialty", title: "Identity + Color", render: () => <SpecialtyIdentitySection /> },
  { id: "specialty-numeric", group: "Specialty", title: "Numeric", render: () => <SpecialtyNumericSection /> },
  { id: "specialty-time", group: "Specialty", title: "Time", render: () => <SpecialtyTimeSection /> },
  { id: "specialty-help", group: "Specialty", title: "Help & Changelog", render: () => <SpecialtyHelpSection /> },
  { id: "specialty-encoding", group: "Specialty", title: "Encoding", render: () => <SpecialtyEncodingSection /> },
  { id: "specialty-widgets", group: "Specialty", title: "Widgets + Print", render: () => <SpecialtyWidgetsSection /> },
  { id: "specialty-dev", group: "Specialty", title: "Dev Experience (Phase 25)", render: () => <DevExperienceSection /> },

  { id: "chat-messages", group: "Chat & AI", title: "Messages", render: () => <ChatMessagesSection /> },
  { id: "chat-agents", group: "Chat & AI", title: "Agents & Tools", render: () => <ChatAgentSection /> },
  { id: "chat-attachments", group: "Chat & AI", title: "Attachments + Mentions", render: () => <ChatAttachmentsSection /> },
  { id: "chat-citations", group: "Chat & AI", title: "Citations & Sources", render: () => <ChatCitationsSection /> },
  { id: "chat-composer", group: "Chat & AI", title: "Composer", render: () => <ChatComposerSection /> },
  { id: "chat-session", group: "Chat & AI", title: "Session + Model", render: () => <ChatSessionSection /> },
  { id: "chat-layout", group: "Chat & AI", title: "Layouts", render: () => <ChatLayoutSection /> },
];

function App() {
  const [activeId, setActiveId] = useState(SECTIONS[0]!.id);
  const [collapsed, setCollapsed] = useState(false);
  const { theme: themeName, setTheme: setThemeName } = useThemePersistence<
    "dark" | "light" | "midnight" | "grey" | "system"
  >({
    key: "voidframe-demo-theme",
    defaultTheme: "dark",
    allowed: ["dark", "light", "midnight", "grey", "system"] as const,
  });
  const [localeTag, setLocaleTag] = useState<string>("en");
  const localePack = LOCALE_PACKS[localeTag] ?? LOCALE_PACKS.en!;
  const active = SECTIONS.find((s) => s.id === activeId) ?? SECTIONS[0]!;

  // Group sidebar by group label.
  const groups = new Map<string, DemoSection[]>();
  for (const s of SECTIONS) {
    const list = groups.get(s.group);
    if (list) list.push(s);
    else groups.set(s.group, [s]);
  }

  return (
    <VoidframeProvider themeName={themeName} locale={localePack}>
      <ConfirmProvider>
        <ShortcutProvider>
          <AppShell
            sidebarCollapsible
            sidebarCollapsed={collapsed}
            onSidebarCollapsedChange={setCollapsed}
            sidebarWidth={240}
            header={
              <Flex gap={16} align="center" style={{ width: "100%" }}>
                <Text size="md" upper spacing={3} color="var(--vf-text-0)">
                  VOIDFRAME · DEMO
                </Text>
                <span style={{ flex: 1 }} />
                <ThemeSelector
                  size="sm"
                  value={themeName}
                  onChange={(v) => setThemeName(v as typeof themeName)}
                  themes={[
                    { id: "dark", label: "Dark" },
                    { id: "light", label: "Light" },
                    { id: "midnight", label: "Midnight" },
                    { id: "grey", label: "Grey" },
                    { id: "system", label: "Auto" },
                  ]}
                />
                <Select
                  value={localeTag}
                  onChange={setLocaleTag}
                  options={Object.keys(LOCALE_PACKS).map((tag) => ({
                    value: tag,
                    label: tag,
                  }))}
                  width={96}
                  aria-label="Locale"
                />
                <Text size="xs" color="var(--vf-text-3)">
                  {SECTIONS.length} sections · 230+ components
                </Text>
              </Flex>
            }
            sidebar={
              <Sidebar collapsed={collapsed}>
                <Sidebar.Brand>VOIDFRAME</Sidebar.Brand>
                {[...groups.entries()].map(([group, list]) => (
                  <Sidebar.Section key={group} label={group}>
                    {list.map((s) => (
                      <NavItem
                        key={s.id}
                        active={s.id === activeId}
                        onClick={() => setActiveId(s.id)}
                      >
                        {s.title}
                      </NavItem>
                    ))}
                  </Sidebar.Section>
                ))}
              </Sidebar>
            }
            footer={
              <Flex gap={12} align="center">
                <ConnectionStatus status="connected" />
                <span style={{ flex: 1 }} />
                <Text size="xs" color="var(--vf-text-3)">
                  Press <Shortcut keys="?" /> for shortcuts
                </Text>
              </Flex>
            }
          >
            <PageHeader
              eyebrow={active.group}
              title={active.title}
              description="Voidframe component showcase"
            />
            <div style={{ marginTop: 24 }}>{active.render()}</div>
          </AppShell>
          <Toaster position="top-right" />
        </ShortcutProvider>
      </ConfirmProvider>
    </VoidframeProvider>
  );
}

export default App;

// Keep ComponentProps imported to satisfy types in some IDE setups.
type _Probe = ComponentProps<typeof Button>;
