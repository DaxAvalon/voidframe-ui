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
  ChartContainer,
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
  Heatmap,
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
  Sparkline,
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
      <Block label="SplitView (legacy)">
        <div style={{ height: 120 }}>
          <SplitView>
            <div style={{ padding: 8 }}>A</div>
            <div style={{ padding: 8 }}>B</div>
          </SplitView>
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
  return (
    <Frame title="Data — Charts" description="Sparkline, Heatmap, ChartContainer.">
      <Block label="Sparkline">
        <Sparkline data={[3, 5, 2, 8, 6, 9, 7, 11]} showArea showTrend />
      </Block>
      <Block label="Heatmap">
        <Heatmap
          rows={["Mon", "Tue", "Wed"]}
          columns={["00", "06", "12", "18"]}
          data={[
            { x: "00", y: "Mon", value: 1 },
            { x: "06", y: "Mon", value: 4 },
            { x: "12", y: "Tue", value: 8 },
            { x: "18", y: "Wed", value: 3 },
          ]}
        />
      </Block>
      <Block label="ChartContainer">
        <ChartContainer title="Revenue" description="Last 30 days">
          <Sparkline data={[1, 3, 2, 6, 4, 8, 7]} showArea />
        </ChartContainer>
      </Block>
    </Frame>
  );
}

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
    <Frame title="Data — Avatars + Misc" description="Avatar, Tag, Code, Skeleton, EmptyState.">
      <Block label="Avatar / AvatarGroup">
        <Flex gap={16}>
          <Avatar name="Alice" />
          <Avatar name="Bob" status="online" />
          <Avatar name="Carol" square />
          <AvatarGroup
            items={[{ name: "Alice" }, { name: "Bob" }, { name: "Carol" }, { name: "Dan" }]}
            max={3}
          />
        </Flex>
      </Block>
      <Block label="Tag / Code / Skeleton / EmptyState">
        <Flex gap={8}>
          <Tag>Default</Tag>
          <Tag color="#4ade80" onRemove={() => {}}>Removable</Tag>
        </Flex>
        <Code inline>inline code</Code>
        <Skeleton lines={3} />
        <EmptyState
          title="Nothing here yet"
          description="Create something to get started."
          action={<Button>Create</Button>}
        />
      </Block>
    </Frame>
  );
}

function KanbanSection() {
  const [items, setItems] = useState([
    { id: "t1", columnId: "todo", label: "Write spec" },
    { id: "t2", columnId: "doing", label: "Build feature" },
    { id: "t3", columnId: "done", label: "Ship release" },
  ]);
  return (
    <Frame title="Kanban" description="Drag-drop board with WIP limits.">
      <Block label="Kanban (drag rows; Ctrl+Arrow to move with keyboard)">
        <Kanban
          columns={[
            { id: "todo", title: "Todo" },
            { id: "doing", title: "Doing", wip: 3 },
            { id: "done", title: "Done" },
          ]}
          items={items}
          renderItem={(it) => <Card title={String(it.label ?? it.id)}> </Card>}
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
          <Dialog.Trigger>Open dialog</Dialog.Trigger>
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
        <DrawerV2>
          <DrawerV2.Trigger>Open drawer</DrawerV2.Trigger>
          <DrawerV2.Content>
            <DrawerV2.Header>
              <DrawerV2.Title>Settings</DrawerV2.Title>
            </DrawerV2.Header>
            <DrawerV2.Body>Drawer content here.</DrawerV2.Body>
          </DrawerV2.Content>
        </DrawerV2>
        <Sheet>
          <Sheet.Trigger>Open sheet</Sheet.Trigger>
          <Sheet.Content>
            <Sheet.Handle />
            <Sheet.Header>
              <Sheet.Title>Bottom sheet</Sheet.Title>
            </Sheet.Header>
            <Sheet.Body>Drag the handle to resize.</Sheet.Body>
          </Sheet.Content>
        </Sheet>
      </Block>
      <Block label="PopoverV2 / HoverCard">
        <PopoverV2 open={popOpen} onOpenChange={setPopOpen}>
          <PopoverV2.Trigger>Open popover</PopoverV2.Trigger>
          <PopoverV2.Content>
            <Text>Popover body</Text>
          </PopoverV2.Content>
        </PopoverV2>
        <HoverCard>
          <HoverCard.Trigger asChild>
            <a href="#" style={{ color: "var(--vf-accent, var(--vf-green))" }}>
              Hover me
            </a>
          </HoverCard.Trigger>
          <HoverCard.Content>
            <Text size="sm">Card preview content.</Text>
          </HoverCard.Content>
        </HoverCard>
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
  return (
    <Frame title="CommandPalette + ShortcutGuide" description="Discovery + onboarding overlays.">
      <Block label="CommandPalette (mod+k or button)">
        <Button onClick={() => setOpen(true)}>Open palette</Button>
        <CommandPalette open={open} onOpenChange={setOpen}>
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
    <Frame title="Loading & Status" description="LoadingOverlay, SpinnerV2, Shimmer, ErrorState, OfflineBanner, ConnectionStatus.">
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
      <Block label="Shimmer / ErrorState">
        <Shimmer lines={3} rounded />
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
        <DebugTree
          rootLabel="state"
          data={{ count: 3, user: { id: "u1", role: "admin" }, pending: [1, 2] }}
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
  const items = useMemo(
    () => packLayout(["users", "revenue", "errors", "deploys"], 12, { w: 6, h: 3 }),
    []
  );
  const [layout, setLayout] = useState(items);
  return (
    <Frame
      title="Specialty — Widgets + Print"
      description="WidgetShell, DashboardGrid, PrintLayout, PrintButton."
    >
      <Block label="DashboardGrid (swap widgets)">
        <DashboardGrid
          items={layout}
          onLayoutChange={setLayout}
          swappable
          cols={12}
          rowHeight={56}
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
                draggable
                resizable
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
  const active = SECTIONS.find((s) => s.id === activeId) ?? SECTIONS[0]!;

  // Group sidebar by group label.
  const groups = new Map<string, DemoSection[]>();
  for (const s of SECTIONS) {
    const list = groups.get(s.group);
    if (list) list.push(s);
    else groups.set(s.group, [s]);
  }

  return (
    <VoidframeProvider>
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
                <Text size="xs" color="var(--vf-text-3)">
                  {SECTIONS.length} sections · 150+ components
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
