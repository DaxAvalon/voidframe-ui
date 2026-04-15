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

import { useState, type ComponentProps, type ReactNode } from "react";
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
