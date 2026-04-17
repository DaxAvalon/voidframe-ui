import type { ComponentDoc, PropDoc } from "../src/dev";

/**
 * Hand-crafted playground overrides for components that need specific examples.
 * These take priority over auto-generation.
 */
const COMPONENT_OVERRIDES: Record<string, string> = {
  // ── Layout ──────────────────────────────────────────────────────────
  Flex: '<Flex gap={8}>\n  <div style={{ padding: 8, background: "var(--vf-bg-3)" }}>Item 1</div>\n  <div style={{ padding: 8, background: "var(--vf-bg-3)" }}>Item 2</div>\n  <div style={{ padding: 8, background: "var(--vf-bg-3)" }}>Item 3</div>\n</Flex>',
  HStack: '<HStack gap={8}>\n  <Badge>Tag 1</Badge>\n  <Badge>Tag 2</Badge>\n  <Badge>Tag 3</Badge>\n</HStack>',
  VStack: '<VStack gap={8}>\n  <Text>Line one</Text>\n  <Text>Line two</Text>\n  <Text>Line three</Text>\n</VStack>',
  Grid: '<Grid cols={3} gap={8}>\n  <div style={{ padding: 12, background: "var(--vf-bg-3)" }}>Cell 1</div>\n  <div style={{ padding: 12, background: "var(--vf-bg-3)" }}>Cell 2</div>\n  <div style={{ padding: 12, background: "var(--vf-bg-3)" }}>Cell 3</div>\n</Grid>',
  Container: '<Container maxWidth={600}>\n  <Text>Centered content with a max-width constraint.</Text>\n</Container>',
  Center: '<Center style={{ height: 100, border: "1px dashed var(--vf-border-2)" }}>\n  <Text>Centered</Text>\n</Center>',
  Box: '<Box style={{ padding: 12, background: "var(--vf-bg-2)", border: "1px solid var(--vf-border-1)" }}>\n  Box content\n</Box>',
  Stretch: '<Flex gap={8}>\n  <div style={{ padding: 8, background: "var(--vf-bg-3)" }}>Fixed</div>\n  <Stretch style={{ padding: 8, background: "var(--vf-bg-2)" }}>Stretched to fill</Stretch>\n</Flex>',
  SplitView: '<SplitView ratio="1:2" style={{ height: 100 }}>\n  <div style={{ padding: 8, background: "var(--vf-bg-3)" }}>Left</div>\n  <div style={{ padding: 8, background: "var(--vf-bg-2)" }}>Right (wider)</div>\n</SplitView>',
  AspectRatio: '<AspectRatio ratio={16/9} style={{ maxWidth: 300, background: "var(--vf-bg-3)", display: "flex", alignItems: "center", justifyContent: "center" }}>\n  <Text>16:9</Text>\n</AspectRatio>',
  Wrap: '<Wrap gap={8}>\n  <Badge>Alpha</Badge>\n  <Badge>Beta</Badge>\n  <Badge>Gamma</Badge>\n  <Badge>Delta</Badge>\n  <Badge>Epsilon</Badge>\n</Wrap>',
  Stack: '<Stack gap={8}>\n  <div style={{ padding: 8, background: "var(--vf-bg-3)" }}>First</div>\n  <div style={{ padding: 8, background: "var(--vf-bg-3)" }}>Second</div>\n  <div style={{ padding: 8, background: "var(--vf-bg-3)" }}>Third</div>\n</Stack>',
  SimpleGrid: '<SimpleGrid cols={2} gap={8}>\n  <div style={{ padding: 12, background: "var(--vf-bg-3)" }}>A</div>\n  <div style={{ padding: 12, background: "var(--vf-bg-3)" }}>B</div>\n  <div style={{ padding: 12, background: "var(--vf-bg-3)" }}>C</div>\n  <div style={{ padding: 12, background: "var(--vf-bg-3)" }}>D</div>\n</SimpleGrid>',
  Inset: '<Card>\n  <Inset side="top">\n    <div style={{ height: 60, background: "var(--vf-bg-3)" }} />\n  </Inset>\n  <Text size="sm" style={{ marginTop: 8 }}>Content below inset</Text>\n</Card>',

  // ── Text & typography ───────────────────────────────────────────────
  Text: '<VStack gap={4}>\n  <Text size="xl">Extra Large</Text>\n  <Text size="lg">Large text</Text>\n  <Text size="md">Medium text (default)</Text>\n  <Text size="sm">Small text</Text>\n  <Text size="xs">Extra small</Text>\n</VStack>',
  Heading: '<VStack gap={4}>\n  <Heading level={1}>Heading 1</Heading>\n  <Heading level={2}>Heading 2</Heading>\n  <Heading level={3}>Heading 3</Heading>\n</VStack>',
  Label: '<VStack gap={4}>\n  <Label>FIELD LABEL</Label>\n  <Label htmlFor="example">Label with htmlFor</Label>\n</VStack>',
  Divider: '<VStack gap={8}>\n  <Text>Content above</Text>\n  <Divider />\n  <Text>Content below</Text>\n</VStack>',
  Spacer: '<VStack gap={0}>\n  <Text>Before spacer</Text>\n  <Spacer size={24} />\n  <Text>After 24px spacer</Text>\n</VStack>',
  Separator: '<VStack gap={8}>\n  <Text>Content above</Text>\n  <Separator />\n  <Text>Content below</Text>\n</VStack>',
  Truncate: '<div style={{ maxWidth: 180 }}>\n  <Truncate>This is a long piece of text that will be truncated when it overflows</Truncate>\n</div>',
  Highlight: '<Text>Search results for: <Highlight query="void">Voidframe UI</Highlight></Text>',
  TextGradient: '<TextGradient from="#4ade80" to="#3b82f6" size="xl" style={{ fontWeight: 700 }}>Gradient Text</TextGradient>',
  TypingAnimation: '<TypingAnimation text="Hello, welcome to Voidframe..." speed={50} />',

  // ── Buttons ─────────────────────────────────────────────────────────
  Button: '<div style={{ display: "flex", gap: 8 }}>\n  <Button>Default</Button>\n  <Button variant="accent">Accent</Button>\n  <Button variant="ghost">Ghost</Button>\n  <Button variant="danger">Danger</Button>\n</div>',
  IconButton: '<div style={{ display: "flex", gap: 8 }}>\n  <IconButton aria-label="Settings"><Text>&#9881;</Text></IconButton>\n  <IconButton aria-label="Close"><Text>&#10005;</Text></IconButton>\n</div>',
  ButtonGroup: '<ButtonGroup>\n  <Button>Left</Button>\n  <Button>Center</Button>\n  <Button>Right</Button>\n</ButtonGroup>',
  CopyButton: '<CopyButton text="npm install @voidframe/ui" />',
  CloseButton: '<CloseButton onClick={() => {}} />',
  ActionButton: '<ActionButton label="Submit" onClick={() => {}} />',
  FloatingActionButton: '<FloatingActionButton label="Add" onClick={() => {}} />',

  // ── Form components ─────────────────────────────────────────────────
  Input: '<Input label="Name" placeholder="Enter your name..." value="Jane Doe" onChange={() => {}} />',
  Checkbox: '<Checkbox checked={true} label="Accept terms" onChange={() => {}} />',
  Toggle: '<Toggle checked={true} label="Enable notifications" onChange={() => {}} />',
  Switch: '<Toggle checked={true} label="Dark mode" onChange={() => {}} />',
  RadioGroup: '<RadioGroup\n  options={[\n    { value: "sm", label: "Small" },\n    { value: "md", label: "Medium" },\n    { value: "lg", label: "Large" },\n  ]}\n  value="md"\n  onChange={() => {}}\n/>',
  Radio: '<VStack gap={4}>\n  <Radio name="size" value="sm" label="Small" checked={false} onChange={() => {}} />\n  <Radio name="size" value="md" label="Medium" checked={true} onChange={() => {}} />\n  <Radio name="size" value="lg" label="Large" checked={false} onChange={() => {}} />\n</VStack>',
  Slider: '<Slider value={60} min={0} max={100} onChange={() => {}} label="Volume" />',
  RangeSlider: '<RangeSlider value={[20, 80]} min={0} max={100} onChange={() => {}} label="Price range" />',
  Textarea: '<Textarea label="Description" placeholder="Write something..." value="Hello world" onChange={() => {}} />',
  PasswordInput: '<PasswordInput label="Password" value="secret123" onChange={() => {}} />',
  PinInput: '<PinInput length={6} value="1234" onChange={() => {}} />',
  TagInput: '<TagInput value={["React", "Vue", "Svelte"]} onChange={() => {}} placeholder="Add framework..." />',
  SearchInput: '<SearchInput value="" onChange={() => {}} placeholder="Search..." />',
  NumberInput: '<NumberInput label="Quantity" value={5} min={0} max={99} onChange={() => {}} />',
  Select: '<Select\n  label="Country"\n  options={[\n    { value: "us", label: "United States" },\n    { value: "uk", label: "United Kingdom" },\n    { value: "de", label: "Germany" },\n  ]}\n  value="us"\n  onChange={() => {}}\n/>',
  MultiSelect: '<MultiSelect\n  label="Tags"\n  options={[\n    { value: "react", label: "React" },\n    { value: "vue", label: "Vue" },\n    { value: "svelte", label: "Svelte" },\n  ]}\n  value={["react"]}\n  onChange={() => {}}\n/>',
  Combobox: '<Combobox\n  label="Framework"\n  options={[\n    { value: "react", label: "React" },\n    { value: "vue", label: "Vue" },\n    { value: "svelte", label: "Svelte" },\n  ]}\n  value="react"\n  onChange={() => {}}\n/>',
  Autocomplete: '<Autocomplete\n  label="City"\n  options={["New York", "London", "Tokyo", "Paris", "Berlin"]}\n  value=""\n  onChange={() => {}}\n  placeholder="Type a city..."\n/>',
  DatePicker: '<DatePicker label="Date" onChange={() => {}} />',
  TimePicker: '<TimePicker label="Time" onChange={() => {}} />',
  DateTimePicker: '<DateTimePicker label="Date and time" onChange={() => {}} />',
  DateRangePicker: '<DateRangePicker label="Date range" onChange={() => {}} />',
  ColorPicker: '<ColorPicker value="#4ade80" onChange={() => {}} />',
  ColorInput: '<ColorInput label="Brand color" value="#4ade80" onChange={() => {}} />',
  FormField: '<FormField label="Email" hint="We will never share your email" error="">\n  <Input placeholder="you@example.com" />\n</FormField>',
  SegmentedControl: '<SegmentedControl\n  options={[\n    { value: "day", label: "Day" },\n    { value: "week", label: "Week" },\n    { value: "month", label: "Month" },\n  ]}\n  value="week"\n  onChange={() => {}}\n/>',
  FileUpload: '<FileUpload onFiles={() => {}} accept="image/*" label="Upload image" />',
  FileDropzone: '<FileDropzone onFiles={() => {}} label="Drop files here or click to browse" />',
  StarRating: '<StarRating value={3} max={5} onChange={() => {}} />',
  Rating: '<Rating value={4} max={5} onChange={() => {}} />',
  TransferList: '<TransferList\n  available={[\n    { value: "a", label: "Alpha" },\n    { value: "b", label: "Beta" },\n    { value: "c", label: "Gamma" },\n  ]}\n  selected={["a"]}\n  onChange={() => {}}\n/>',
  OtpInput: '<OtpInput length={6} value="" onChange={() => {}} />',
  PhoneInput: '<PhoneInput value="" onChange={() => {}} label="Phone number" />',
  CurrencyInput: '<CurrencyInput value={1299} currency="USD" onChange={() => {}} label="Amount" />',
  MaskInput: '<MaskInput mask="(999) 999-9999" value="" onChange={() => {}} label="Phone" placeholder="(___) ___-____" />',
  RichTextEditor: '<Text size="sm" color="var(--vf-text-3)">RichTextEditor provides a WYSIWYG editing experience. See the Editor section for a full example.</Text>',

  // ── Data display ────────────────────────────────────────────────────
  Avatar: '<div style={{ display: "flex", gap: 8, alignItems: "center" }}>\n  <Avatar initials="JD" />\n  <Avatar initials="AB" status="online" />\n  <Avatar src="https://i.pravatar.cc/40?u=1" />\n</div>',
  AvatarGroup: '<AvatarGroup max={3}>\n  <Avatar initials="JD" />\n  <Avatar initials="AB" />\n  <Avatar initials="CD" />\n  <Avatar initials="EF" />\n</AvatarGroup>',
  Badge: '<div style={{ display: "flex", gap: 8 }}>\n  <Badge>Default</Badge>\n  <Badge variant="accent">Accent</Badge>\n  <Badge variant="success">Success</Badge>\n  <Badge variant="danger">Danger</Badge>\n</div>',
  Tag: '<div style={{ display: "flex", gap: 8 }}>\n  <Tag label="React" />\n  <Tag label="Error" variant="danger" />\n  <Tag label="Done" variant="success" onRemove={() => {}} />\n</div>',
  Chip: '<div style={{ display: "flex", gap: 8 }}>\n  <Chip label="Frontend" />\n  <Chip label="Active" variant="success" />\n  <Chip label="Removable" onRemove={() => {}} />\n</div>',
  Tooltip: '<Tooltip content="This is a tooltip">\n  <Button>Hover me</Button>\n</Tooltip>',
  Popover: '<Popover content={<Text size="sm">Popover content here</Text>}>\n  <Button>Click me</Button>\n</Popover>',
  Code: '<Code>const x = 42;</Code>',
  Kbd: '<div style={{ display: "flex", gap: 4 }}>\n  <Kbd>Ctrl</Kbd><Kbd>Shift</Kbd><Kbd>P</Kbd>\n</div>',
  Skeleton: '<VStack gap={8}>\n  <Skeleton shape="rect" style={{ width: 200, height: 16 }} />\n  <Skeleton shape="rect" style={{ width: 160, height: 16 }} />\n  <Skeleton shape="circle" style={{ width: 40, height: 40 }} />\n</VStack>',
  EmptyState: '<EmptyState\n  title="No items yet"\n  description="Get started by creating your first item."\n  action={<Button>Create Item</Button>}\n/>',
  Progress: '<VStack gap={8}>\n  <Progress value={72} max={100} label="Upload" showValue />\n  <Progress value={30} max={100} tone="warning" />\n</VStack>',
  ProgressBar: '<VStack gap={8}>\n  <ProgressBar value={72} max={100} />\n  <ProgressBar value={30} max={100} tone="warning" />\n</VStack>',
  Stat: '<div style={{ display: "flex", gap: 16 }}>\n  <Stat label="Users" value="12,847" change={12.5} />\n  <Stat label="Revenue" value="$48K" change={-3.2} />\n</div>',
  Spinner: '<div style={{ display: "flex", gap: 12, alignItems: "center" }}>\n  <Spinner size="sm" />\n  <Spinner />\n  <Spinner size="lg" />\n</div>',
  StatusIndicator: '<div style={{ display: "flex", gap: 12 }}>\n  <StatusIndicator status="online" label="Online" />\n  <StatusIndicator status="offline" label="Offline" />\n  <StatusIndicator status="busy" label="Busy" />\n</div>',
  CircularProgress: '<div style={{ display: "flex", gap: 12 }}>\n  <CircularProgress value={75} />\n  <CircularProgress value={30} tone="warning" />\n</div>',
  Timeline: '<Timeline\n  items={[\n    { key: "1", title: "Created", description: "Project initialized", date: "Jan 1" },\n    { key: "2", title: "In Progress", description: "Development started", date: "Jan 15" },\n    { key: "3", title: "Completed", description: "Shipped to production", date: "Feb 1" },\n  ]}\n/>',
  KeyValue: '<KeyValue\n  pairs={[\n    { key: "Name", value: "Jane Doe" },\n    { key: "Role", value: "Engineer" },\n    { key: "Status", value: "Active" },\n  ]}\n/>',
  MetricCard: '<MetricCard title="Active Users" value="1,234" change={8.5} />',
  TrendIndicator: '<div style={{ display: "flex", gap: 16 }}>\n  <TrendIndicator value={12.5} direction="up" />\n  <TrendIndicator value={-3.2} direction="down" />\n</div>',
  DataList: '<DataList\n  items={[\n    { label: "Name", value: "Jane Doe" },\n    { label: "Email", value: "jane@example.com" },\n    { label: "Role", value: "Engineer" },\n  ]}\n/>',
  DescriptionList: '<DescriptionList\n  items={[\n    { term: "Framework", description: "Voidframe" },\n    { term: "Language", description: "TypeScript" },\n    { term: "License", description: "MIT" },\n  ]}\n/>',
  CountUp: '<CountUp end={1234} duration={2000} />',
  Meter: '<Meter value={72} min={0} max={100} label="Storage used" />',
  Gauge: '<Gauge value={72} min={0} max={100} label="CPU" />',

  // ── Navigation ──────────────────────────────────────────────────────
  Breadcrumb: '<Breadcrumb\n  items={[\n    { label: "Home", href: "#" },\n    { label: "Products", href: "#" },\n    { label: "Widget", isCurrent: true },\n  ]}\n/>',
  Pagination: '<Pagination page={3} totalPages={10} onChange={() => {}} />',
  Stepper: '<Stepper\n  steps={[\n    { label: "Account" },\n    { label: "Profile" },\n    { label: "Review" },\n  ]}\n  current={1}\n/>',
  Tabs: '<Tabs\n  tabs={[\n    { key: "tab1", label: "Overview", content: <Text>Overview content</Text> },\n    { key: "tab2", label: "Details", content: <Text>Details content</Text> },\n    { key: "tab3", label: "Settings", content: <Text>Settings content</Text> },\n  ]}\n  activeKey="tab1"\n  onChange={() => {}}\n/>',
  NavItem: '<VStack gap={2}>\n  <NavItem label="Dashboard" active />\n  <NavItem label="Settings" />\n  <NavItem label="Profile" />\n</VStack>',
  NavGroup: '<NavGroup label="Main">\n  <NavItem label="Dashboard" active />\n  <NavItem label="Analytics" />\n  <NavItem label="Settings" />\n</NavGroup>',
  Link: '<Link href="#">Visit documentation</Link>',
  Anchor: '<Anchor href="#">Styled anchor link</Anchor>',
  BackButton: '<BackButton onClick={() => {}} />',

  // ── Feedback / Overlays ─────────────────────────────────────────────
  Modal: '<Text size="sm" color="var(--vf-text-3)">Modal requires controlled open state. Use open + onClose props to manage visibility.</Text>',
  Dialog: '<Text size="sm" color="var(--vf-text-3)">Dialog requires controlled open state. Use open + onClose props to manage visibility.</Text>',
  Drawer: '<Text size="sm" color="var(--vf-text-3)">Drawer requires controlled open state. Consider using DrawerV2 for the compound pattern.</Text>',
  DrawerV2: '<Text size="sm" color="var(--vf-text-3)">DrawerV2 uses a compound pattern. See the Overlays section for a full example.</Text>',
  Sheet: '<Text size="sm" color="var(--vf-text-3)">Sheet is a bottom drawer for mobile. Controlled via open + onClose.</Text>',
  Alert: '<Alert tone="warning" title="Warning" description="This action cannot be undone." onDismiss={() => {}} />',
  AlertDialog: '<Text size="sm" color="var(--vf-text-3)">AlertDialog is a confirmation dialog. Use open + onConfirm + onCancel props.</Text>',
  Callout: '<Callout tone="info" title="Note">\n  This is an informational callout with rich content support.\n</Callout>',
  BannerAlert: '<BannerAlert tone="success" title="Deployment complete" description="v1.0.0 shipped to production." onDismiss={() => {}} />',
  Banner: '<Banner tone="info" title="New feature available" description="Check out the latest update." onDismiss={() => {}} />',
  Notification: '<Notification title="New message" description="You have 3 unread messages" tone="info" />',
  Toast: '<Text size="sm" color="var(--vf-text-3)">Toast is triggered programmatically via toast(). Mount Toaster at your app root.</Text>',

  // ── Interactive ─────────────────────────────────────────────────────
  Accordion: '<Accordion\n  items={[\n    { key: "1", title: "What is Voidframe?", content: "A dark, monochrome React UI framework." },\n    { key: "2", title: "How do I install it?", content: "npm install @voidframe/ui" },\n    { key: "3", title: "Is it accessible?", content: "Yes. All components are tested with jest-axe." },\n  ]}\n/>',
  Collapsible: '<Collapsible title="Click to expand">\n  <Text>This content is inside a collapsible section.</Text>\n</Collapsible>',
  Card: '<Card style={{ maxWidth: 300 }}>\n  <VStack gap={8}>\n    <Text size="lg" style={{ fontWeight: 700 }}>Card Title</Text>\n    <Text size="sm" color="var(--vf-text-3)">Card content with description text.</Text>\n    <Button size="sm">Action</Button>\n  </VStack>\n</Card>',
  Dropdown: '<Text size="sm" color="var(--vf-text-3)">Dropdown is a compound component. Use Dropdown.Trigger, Dropdown.Content, and Dropdown.Item.</Text>',
  DropdownMenu: '<Text size="sm" color="var(--vf-text-3)">DropdownMenu opens from a trigger button. Use the compound pattern with DropdownMenu.Trigger and .Content.</Text>',

  // ── Behavioral / invisible ─────────────────────────────────────────
  Portal: '<Text size="sm" color="var(--vf-text-3)">Portal renders children into document.body. No visual output in this preview.</Text>',
  ScrollLock: '<Text size="sm" color="var(--vf-text-3)">ScrollLock prevents body scroll when mounted. Used internally by modals and drawers.</Text>',
  FocusScope: '<Text size="sm" color="var(--vf-text-3)">FocusScope traps Tab focus within its children. Used by Dialog and Modal.</Text>',
  FocusTrap: '<Text size="sm" color="var(--vf-text-3)">FocusTrap traps Tab focus within its children. Used by Dialog and Modal.</Text>',
  DismissableLayer: '<Text size="sm" color="var(--vf-text-3)">DismissableLayer detects Escape key and outside clicks. Used by overlays.</Text>',
  Presence: '<Text size="sm" color="var(--vf-text-3)">Presence manages mount/unmount animations. Wraps content that enters/exits.</Text>',
  VisuallyHidden: '<div>\n  <VisuallyHidden>This text is only visible to screen readers</VisuallyHidden>\n  <Text size="sm" color="var(--vf-text-3)">VisuallyHidden content above (invisible but accessible to screen readers).</Text>\n</div>',
  LiveRegion: '<VStack gap={8}>\n  <LiveRegion message="3 new notifications" />\n  <Text size="sm" color="var(--vf-text-3)">LiveRegion announces to screen readers. The message above is invisible but announced.</Text>\n</VStack>',
  ErrorBoundary: '<Text size="sm" color="var(--vf-text-3)">ErrorBoundary catches React errors in children and shows a fallback UI.</Text>',
  Slot: '<Text size="sm" color="var(--vf-text-3)">Slot merges props onto its single child element. Used for the asChild pattern.</Text>',
  HydrationBoundary: '<Text size="sm" color="var(--vf-text-3)">HydrationBoundary handles SSR hydration mismatches gracefully.</Text>',
  ClientOnly: '<Text size="sm" color="var(--vf-text-3)">ClientOnly renders children only on the client side, skipping SSR.</Text>',
  Suspense: '<Text size="sm" color="var(--vf-text-3)">Suspense wraps lazy-loaded content with a fallback while loading.</Text>',
  ConditionalWrap: '<Text size="sm" color="var(--vf-text-3)">ConditionalWrap wraps children with a wrapper element only when a condition is true.</Text>',
  RenderCount: '<Text size="sm" color="var(--vf-text-3)">RenderCount displays a debug counter showing how many times its parent re-renders.</Text>',

  // ── Loading states ─────────────────────────────────────────────────
  LoadingOverlay: '<div style={{ position: "relative", height: 100, border: "1px solid var(--vf-border-1)" }}>\n  <Text>Content underneath</Text>\n  <LoadingOverlay loading message="Loading..." />\n</div>',
  Shimmer: '<Shimmer style={{ width: 200, height: 16 }} />',
  SpinnerV2: '<div style={{ display: "flex", gap: 12 }}>\n  <SpinnerV2 size="sm" />\n  <SpinnerV2 />\n  <SpinnerV2 size="lg" />\n</div>',
  ErrorState: '<ErrorState title="Something went wrong" message="Please try again later." action={<Button size="sm">Retry</Button>} />',
  LoadingDots: '<LoadingDots />',
  SkeletonText: '<VStack gap={4}>\n  <SkeletonText lines={3} />\n</VStack>',
  SkeletonAvatar: '<SkeletonAvatar />',
  SkeletonButton: '<SkeletonButton />',

  // ── Code/viewers ────────────────────────────────────────────────────
  CodeBlock: '<CodeBlock language="javascript" code={"const greeting = \\"Hello, Voidframe!\\"\\nconsole.log(greeting)"} />',
  JSONViewer: '<JSONViewer data={{ name: "Voidframe", version: "1.0.0", components: 260, themes: ["dark", "light", "midnight", "grey"] }} />',
  DiffViewer: '<DiffViewer\n  before={"const x = 1;\\nconst y = 2;"}\n  after={"const x = 1;\\nconst y = 3;\\nconst z = 4;"}\n/>',
  Terminal: '<Terminal lines={["npm install @voidframe/ui", "added 1 package in 1.2s", "npm run build", "vite v5.0.0 building...", "built in 2.1s"]} />',
  LogViewer: '<LogViewer\n  logs={[\n    { level: "info", message: "Server started on port 3000", timestamp: "10:00:01" },\n    { level: "warn", message: "Deprecated API called", timestamp: "10:00:05" },\n    { level: "error", message: "Connection refused", timestamp: "10:00:12" },\n  ]}\n/>',
  CodeEditor: '<Text size="sm" color="var(--vf-text-3)">CodeEditor provides a Monaco-like editing experience. See the Editor section for a full example.</Text>',
  MarkdownViewer: '<MarkdownViewer content={"# Hello\\n\\nThis is **bold** and this is _italic_.\\n\\n- Item one\\n- Item two"} />',
  SyntaxHighlighter: '<SyntaxHighlighter language="typescript" code={"interface Props {\\n  name: string;\\n  count: number;\\n}"} />',

  // ── Media ───────────────────────────────────────────────────────────
  Carousel: '<Text size="sm" color="var(--vf-text-3)">Carousel displays a slideshow of images with navigation controls.</Text>',
  Lightbox: '<Text size="sm" color="var(--vf-text-3)">Lightbox opens a full-screen image viewer. Triggered by clicking gallery images.</Text>',
  Image: '<Image src="https://via.placeholder.com/200x120/1a1a1a/666?text=Image" alt="Placeholder" style={{ borderRadius: 8 }} />',
  VideoPlayer: '<Text size="sm" color="var(--vf-text-3)">VideoPlayer wraps a video element with custom controls. Provide a src URL.</Text>',
  AudioPlayer: '<Text size="sm" color="var(--vf-text-3)">AudioPlayer wraps an audio element with custom controls. Provide a src URL.</Text>',
  ImageCompare: '<Text size="sm" color="var(--vf-text-3)">ImageCompare shows a before/after image slider. Provide before and after image URLs.</Text>',
  Gallery: '<Text size="sm" color="var(--vf-text-3)">Gallery renders a grid of images with optional lightbox. Provide an images array.</Text>',

  // ── Compound component parts ────────────────────────────────────────
  ToolbarButton: '<Text size="sm" color="var(--vf-text-3)">ToolbarButton is used inside a Toolbar component.</Text>',
  SidebarSection: '<Text size="sm" color="var(--vf-text-3)">SidebarSection is used inside a Sidebar component to group NavItems.</Text>',
  TabPanel: '<Text size="sm" color="var(--vf-text-3)">TabPanel is the content panel for a Tab. Used inside Tabs compound component.</Text>',
  TabList: '<Text size="sm" color="var(--vf-text-3)">TabList contains Tab triggers. Used inside Tabs compound component.</Text>',
  MenuItem: '<Text size="sm" color="var(--vf-text-3)">MenuItem is used inside Menu or DropdownMenu.</Text>',
  MenuGroup: '<Text size="sm" color="var(--vf-text-3)">MenuGroup groups MenuItems with an optional label.</Text>',
  MenuSeparator: '<Text size="sm" color="var(--vf-text-3)">MenuSeparator is a divider line inside a Menu.</Text>',
  ListItem: '<Text size="sm" color="var(--vf-text-3)">ListItem is used inside a List component.</Text>',
  AccordionItem: '<Text size="sm" color="var(--vf-text-3)">AccordionItem is used inside an Accordion compound component.</Text>',
  DialogHeader: '<Text size="sm" color="var(--vf-text-3)">DialogHeader is used inside Dialog for the title area.</Text>',
  DialogFooter: '<Text size="sm" color="var(--vf-text-3)">DialogFooter is used inside Dialog for action buttons.</Text>',
  DialogBody: '<Text size="sm" color="var(--vf-text-3)">DialogBody is used inside Dialog for the main content area.</Text>',
  CardHeader: '<Text size="sm" color="var(--vf-text-3)">CardHeader is used inside Card for the header area.</Text>',
  CardBody: '<Text size="sm" color="var(--vf-text-3)">CardBody is used inside Card for the main content.</Text>',
  CardFooter: '<Text size="sm" color="var(--vf-text-3)">CardFooter is used inside Card for the footer/actions.</Text>',
  ResizablePanel: '<Text size="sm" color="var(--vf-text-3)">ResizablePanel is used inside ResizableGroup.</Text>',
  ResizableHandle: '<Text size="sm" color="var(--vf-text-3)">ResizableHandle is the drag handle between ResizablePanels.</Text>',
  StepperStep: '<Text size="sm" color="var(--vf-text-3)">StepperStep is a single step inside a Stepper component.</Text>',

  // ── Providers ───────────────────────────────────────────────────────
  VoidframeProvider: '<Text size="sm" color="var(--vf-text-3)">VoidframeProvider wraps your app root to provide theme tokens, density, contrast, and locale context.</Text>',
  ThemeProvider: '<Text size="sm" color="var(--vf-text-3)">ThemeProvider supplies theme context to all voidframe components.</Text>',
  ConfirmProvider: '<Text size="sm" color="var(--vf-text-3)">ConfirmProvider enables the useConfirm() hook for promise-based confirmation dialogs.</Text>',
  ShortcutProvider: '<Text size="sm" color="var(--vf-text-3)">ShortcutProvider enables the useShortcut() hook for global keyboard shortcut registration.</Text>',
  MessagesProvider: '<Text size="sm" color="var(--vf-text-3)">MessagesProvider supplies i18n message packs to all voidframe components.</Text>',
  TooltipProvider: '<Text size="sm" color="var(--vf-text-3)">TooltipProvider batches tooltip setup for improved performance with many tooltips.</Text>',
  NotificationProvider: '<Text size="sm" color="var(--vf-text-3)">NotificationProvider enables the useNotification() hook for push-style notifications.</Text>',
  ModalProvider: '<Text size="sm" color="var(--vf-text-3)">ModalProvider enables imperative modal APIs via useModal().</Text>',

  // ── Notifications ───────────────────────────────────────────────────
  Toaster: '<Text size="sm" color="var(--vf-text-3)">Toaster is the container for toast notifications. Mount once at your app root.</Text>',

  // ── AppShell / page layout ──────────────────────────────────────────
  AppShell: '<Text size="sm" color="var(--vf-text-3)">AppShell provides the header + sidebar + main + footer page layout. See the Patterns section for a full example.</Text>',
  Navbar: '<Text size="sm" color="var(--vf-text-3)">Navbar renders a horizontal navigation bar. Typically placed in AppShell header slot.</Text>',
  Sidebar: '<Text size="sm" color="var(--vf-text-3)">Sidebar renders a vertical navigation panel. Typically placed in AppShell sidebar slot.</Text>',
  Footer: '<Text size="sm" color="var(--vf-text-3)">Footer renders a page footer. Typically placed in AppShell footer slot.</Text>',
  Header: '<Text size="sm" color="var(--vf-text-3)">Header renders a page header. Typically placed in AppShell header slot.</Text>',
  PageHeader: '<PageHeader title="Dashboard" description="Overview of your project" />',
  SectionHeader: '<SectionHeader title="Recent Activity" action={<Button size="sm">View All</Button>} />',

  // ── Wizard ──────────────────────────────────────────────────────────
  Wizard: '<Text size="sm" color="var(--vf-text-3)">Wizard manages multi-step form flows. See the Onboarding Wizard pattern for a complete example.</Text>',
  WizardStep: '<Text size="sm" color="var(--vf-text-3)">WizardStep is a single step inside a Wizard component.</Text>',

  // ── Scroll/responsive ───────────────────────────────────────────────
  ScrollArea: '<ScrollArea style={{ height: 100 }}>\n  <VStack gap={4}>\n    {Array.from({length: 20}, (_, i) => <Text key={i} size="sm">Scrollable item {i + 1}</Text>)}\n  </VStack>\n</ScrollArea>',
  ScrollRow: '<Text size="sm" color="var(--vf-text-3)">ScrollRow provides horizontal scrolling with arrow navigation for overflow content.</Text>',
  InfiniteScroll: '<Text size="sm" color="var(--vf-text-3)">InfiniteScroll loads more content as the user scrolls down. Requires a loadMore callback.</Text>',
  VirtualList: '<Text size="sm" color="var(--vf-text-3)">VirtualList renders large lists efficiently by only mounting visible rows.</Text>',

  // ── Icons ───────────────────────────────────────────────────────────
  Icon: '<div style={{ display: "flex", gap: 8 }}>\n  <Icon name="check" />\n  <Icon name="alert" />\n  <Icon name="info" />\n</div>',

  // ── Context/Menu ────────────────────────────────────────────────────
  ContextMenu: '<Text size="sm" color="var(--vf-text-3)">ContextMenu opens on right-click. Wrap an element to add a context menu.</Text>',
  Menu: '<Text size="sm" color="var(--vf-text-3)">Menu is a compound component. Use Menu.Trigger, Menu.Content, and Menu.Item together.</Text>',
  CommandPalette: '<Text size="sm" color="var(--vf-text-3)">CommandPalette is a global search overlay (Cmd+K). Controlled via open/onOpenChange.</Text>',
  CommandBar: '<Text size="sm" color="var(--vf-text-3)">CommandBar is a command palette for quick actions. Controlled via open/onOpenChange.</Text>',

  // ── Chat ────────────────────────────────────────────────────────────
  Conversation: '<Text size="sm" color="var(--vf-text-3)">Conversation is the root context for a chat message thread. See Chat section for examples.</Text>',
  Message: '<Text size="sm" color="var(--vf-text-3)">Message renders an individual chat message. Used inside MessageList.</Text>',
  MessageList: '<Text size="sm" color="var(--vf-text-3)">MessageList renders a scrollable list of Message components.</Text>',
  ChatInput: '<Text size="sm" color="var(--vf-text-3)">ChatInput is the text input area for sending chat messages.</Text>',
  MessageBubble: '<Text size="sm" color="var(--vf-text-3)">MessageBubble wraps a single chat message with styling and alignment.</Text>',
  TypingIndicator: '<TypingIndicator />',

  // ── Table ───────────────────────────────────────────────────────────
  Table: '<Table\n  columns={[\n    { key: "name", header: "Name" },\n    { key: "role", header: "Role" },\n    { key: "status", header: "Status" },\n  ]}\n  data={[\n    { name: "Alice", role: "Engineer", status: "Active" },\n    { name: "Bob", role: "Designer", status: "Away" },\n    { name: "Charlie", role: "Manager", status: "Active" },\n  ]}\n/>',
  DataTable: '<DataTable\n  columns={[\n    { key: "name", header: "Name" },\n    { key: "email", header: "Email" },\n  ]}\n  data={[\n    { name: "Alice", email: "alice@example.com" },\n    { name: "Bob", email: "bob@example.com" },\n  ]}\n/>',
  DataGrid: '<Text size="sm" color="var(--vf-text-3)">DataGrid provides an Excel-like grid with editing, sorting, and filtering. See Data section for examples.</Text>',

  // ── List components ─────────────────────────────────────────────────
  List: '<List>\n  <ListItem>First item</ListItem>\n  <ListItem>Second item</ListItem>\n  <ListItem>Third item</ListItem>\n</List>',
  OrderedList: '<OrderedList>\n  <ListItem>Step one</ListItem>\n  <ListItem>Step two</ListItem>\n  <ListItem>Step three</ListItem>\n</OrderedList>',
  UnorderedList: '<UnorderedList>\n  <ListItem>Feature A</ListItem>\n  <ListItem>Feature B</ListItem>\n  <ListItem>Feature C</ListItem>\n</UnorderedList>',
  DefinitionList: '<DefinitionList\n  items={[\n    { term: "HTML", description: "HyperText Markup Language" },\n    { term: "CSS", description: "Cascading Style Sheets" },\n  ]}\n/>',

  // ── Misc display ────────────────────────────────────────────────────
  Quote: '<Quote cite="Alan Kay">The best way to predict the future is to invent it.</Quote>',
  Blockquote: '<Blockquote cite="Alan Kay">The best way to predict the future is to invent it.</Blockquote>',
  Clipboard: '<Clipboard text="npm install @voidframe/ui" label="Install command" />',
  RelativeTime: '<RelativeTime date={new Date(Date.now() - 3600000)} />',
  Countdown: '<Countdown targetDate={new Date(Date.now() + 86400000)} />',
  ThemeSelector: '<ThemeSelector\n  value="dark"\n  onChange={() => {}}\n  themes={[\n    { id: "dark", label: "Dark" },\n    { id: "light", label: "Light" },\n  ]}\n/>',
  Shortcut: '<div style={{ display: "flex", gap: 8, alignItems: "center" }}>\n  <Text size="sm">Press</Text>\n  <Shortcut keys="mod+k" />\n  <Text size="sm">to search</Text>\n</div>',
  ScrollIndicator: '<Text size="sm" color="var(--vf-text-3)">ScrollIndicator shows a progress bar at the top of the page based on scroll position.</Text>',
  BackToTop: '<Text size="sm" color="var(--vf-text-3)">BackToTop renders a floating button that scrolls to the top of the page.</Text>',
  PrintButton: '<PrintButton />',
  ShareButton: '<ShareButton title="Voidframe" text="Check out this UI framework" />',
  Pill: '<div style={{ display: "flex", gap: 8 }}>\n  <Pill>Default</Pill>\n  <Pill variant="accent">Accent</Pill>\n  <Pill variant="success">Success</Pill>\n</div>',
  ColorSwatch: '<div style={{ display: "flex", gap: 8 }}>\n  <ColorSwatch color="#4ade80" />\n  <ColorSwatch color="#3b82f6" />\n  <ColorSwatch color="#f59e0b" />\n</div>',
  QRCode: '<QRCode value="https://voidframe.dev" size={120} />',
  Barcode: '<Barcode value="1234567890" />',
  Calendar: '<Calendar onChange={() => {}} />',
  MiniCalendar: '<MiniCalendar onChange={() => {}} />',
  CronBuilder: '<CronBuilder value="0 * * * *" onChange={() => {}} />',
  TokenDisplay: '<TokenDisplay tokens={["Hello", " ", "world", "!"]} />',
  Heatmap: '<Text size="sm" color="var(--vf-text-3)">Heatmap renders a grid of colored cells based on value intensity.</Text>',
  Sparkline: '<Sparkline data={[4, 8, 15, 16, 23, 42, 38, 30, 25, 20]} width={120} height={30} />',
  Chart: '<Text size="sm" color="var(--vf-text-3)">Chart renders data visualizations. See the Charts section for bar, line, pie, and area examples.</Text>',
  TreeView: '<TreeView\n  data={[\n    { id: "1", label: "src", children: [\n      { id: "2", label: "components" },\n      { id: "3", label: "hooks" },\n    ]},\n    { id: "4", label: "docs" },\n  ]}\n/>',
  Kanban: '<Text size="sm" color="var(--vf-text-3)">Kanban renders a drag-and-drop board with columns and cards. See Patterns for a full example.</Text>',
  SortableList: '<Text size="sm" color="var(--vf-text-3)">SortableList provides drag-and-drop reordering. Requires items and onReorder props.</Text>',
  DragHandle: '<Text size="sm" color="var(--vf-text-3)">DragHandle is the grab icon for sortable/draggable items.</Text>',
  Toolbar: '<Toolbar>\n  <Button size="sm">Bold</Button>\n  <Button size="sm">Italic</Button>\n  <Divider orientation="vertical" />\n  <Button size="sm">Link</Button>\n</Toolbar>',

  // ── Resizable ───────────────────────────────────────────────────────
  ResizableGroup: '<Text size="sm" color="var(--vf-text-3)">ResizableGroup contains ResizablePanels with draggable dividers. See Layout section for examples.</Text>',

  // ── Misc utility components ─────────────────────────────────────────
  Overlay: '<Text size="sm" color="var(--vf-text-3)">Overlay renders a semi-transparent backdrop. Used internally by Modal and Drawer.</Text>',
  Backdrop: '<Text size="sm" color="var(--vf-text-3)">Backdrop renders a dimmed background layer. Used by overlays and modals.</Text>',
  ClickOutside: '<Text size="sm" color="var(--vf-text-3)">ClickOutside detects clicks outside its children and calls onClickOutside.</Text>',
  Transition: '<Text size="sm" color="var(--vf-text-3)">Transition wraps content with enter/exit CSS animations.</Text>',
  Collapse: '<Text size="sm" color="var(--vf-text-3)">Collapse animates height between 0 and auto for show/hide transitions.</Text>',
  FadeIn: '<FadeIn>\n  <Text>This content fades in on mount</Text>\n</FadeIn>',
  SlideIn: '<SlideIn direction="left">\n  <Text>This content slides in from the left</Text>\n</SlideIn>',
  ScaleIn: '<ScaleIn>\n  <Text>This content scales in on mount</Text>\n</ScaleIn>',
  Affix: '<Text size="sm" color="var(--vf-text-3)">Affix pins an element to a fixed position on scroll.</Text>',
  Sticky: '<Text size="sm" color="var(--vf-text-3)">Sticky pins an element when it reaches a scroll threshold.</Text>',
  ResponsiveContainer: '<Text size="sm" color="var(--vf-text-3)">ResponsiveContainer provides breakpoint-aware rendering for adaptive layouts.</Text>',
  Show: '<Show when={true}>\n  <Text>Conditionally rendered content</Text>\n</Show>',
  Hide: '<Text size="sm" color="var(--vf-text-3)">Hide conditionally hides children based on breakpoints or a when prop.</Text>',
  MediaQuery: '<Text size="sm" color="var(--vf-text-3)">MediaQuery renders children only when a CSS media query matches.</Text>',
  Measure: '<Text size="sm" color="var(--vf-text-3)">Measure reports its bounding rect to a callback. Used for dynamic layout calculations.</Text>',
  CopyToClipboard: '<CopyToClipboard text="Copied text!"><Button size="sm">Copy</Button></CopyToClipboard>',
};

/**
 * Generate a default playground code snippet for a component
 * based on its extracted prop documentation. Never returns null.
 */
export function generatePlaygroundCode(doc: ComponentDoc): string {
  const name = doc.name;

  // 1. Check hand-crafted overrides first
  if (COMPONENT_OVERRIDES[name]) {
    return COMPONENT_OVERRIDES[name];
  }

  // 2. Icon components — anything ending in "Icon"
  if (name.endsWith("Icon")) {
    return `<div style={{ display: "flex", gap: 8, alignItems: "center" }}>\n  <${name} />\n  <Text size="sm">${name}</Text>\n</div>`;
  }

  // 3. If no props at all, generate a basic example
  if (!doc.props || doc.props.length === 0) {
    return `<${name} />`;
  }

  // 4. Auto-generate from props
  const requiredProps = doc.props.filter((p) => p.required);
  const optionalHighlights = doc.props.filter(
    (p) =>
      !p.required &&
      ["variant", "size", "tone", "status", "mode", "orientation", "label"].includes(p.name),
  );

  // Build props string
  const propsEntries: string[] = [];

  for (const prop of requiredProps) {
    const val = getDefaultValueForProp(prop);
    if (val) propsEntries.push(`${prop.name}=${val}`);
  }

  // Add a few interesting optional props with example values
  for (const prop of optionalHighlights.slice(0, 3)) {
    const val = getExampleValueForProp(prop);
    if (val) propsEntries.push(`${prop.name}=${val}`);
  }

  const propsStr = propsEntries.length > 0 ? " " + propsEntries.join(" ") : "";

  // Determine if component needs children
  const hasChildren = doc.props.some((p) => p.name === "children");

  if (hasChildren) {
    return `<${name}${propsStr}>\n  Sample content\n</${name}>`;
  }

  return `<${name}${propsStr} />`;
}

/**
 * Return a JSX attribute value string including the { } wrapper.
 * e.g. '{"hello"}' or '{42}' or '{[...]}' or '{() => {}}'
 */
function getDefaultValueForProp(prop: PropDoc): string | null {
  const t = prop.type?.toLowerCase() ?? "";

  // Arrays / objects
  if (prop.name === "items" && t.includes("array"))
    return '{[{ key: "a", label: "Alpha" }, { key: "b", label: "Beta" }, { key: "c", label: "Charlie" }]}';
  if (prop.name === "options" && t.includes("array"))
    return '{[{ value: "a", label: "Alpha" }, { value: "b", label: "Beta" }]}';
  if (prop.name === "data" && t.includes("string[][]"))
    return '{[["Name", "Age"], ["Alice", "30"], ["Bob", "25"]]}';
  if (prop.name === "data" && t.includes("uint8array"))
    return "{new Uint8Array([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100])}";
  if (prop.name === "tokens" && t.includes("array"))
    return '{["Hello", " ", "world", "!", " ", "This", " ", "is", " ", "a", " ", "test"]}';
  if (prop.name === "models")
    return '{[{ id: "a", name: "Model A" }, { id: "b", name: "Model B" }]}';
  if (prop.name === "fields" && t.includes("array"))
    return '{[{ key: "name", label: "Name", type: "string" }, { key: "age", label: "Age", type: "number" }]}';
  if (prop.name === "events" && t.includes("array"))
    return '{[{ key: "1", label: "Start", status: "completed" }, { key: "2", label: "Middle", status: "active" }, { key: "3", label: "End", status: "pending" }]}';
  if (prop.name === "variables" && t.includes("array"))
    return '{[{ key: "API_KEY", value: "sk-1234", secret: true }, { key: "PORT", value: "3000" }]}';

  // Callbacks
  if (prop.name === "onSubmit" || prop.name === "onConfirm" || prop.name === "onClick")
    return '{() => alert("Clicked!")}';
  if (prop.name === "onSave") return '{(v) => alert("Saved: " + v)}';
  if (prop.name === "onAction") return '{(key) => alert("Action: " + key)}';
  if (prop.name.startsWith("on") && (t.includes("=>") || t.includes("function"))) return "{() => {}}";

  // Strings — use JSX string syntax (quotes, no braces)
  if (prop.name === "value" && t.includes("string")) return '"Hello world"';
  if (prop.name === "text") return '"Copy this text"';
  if (prop.name === "title") return '"Title"';
  if (prop.name === "label") return '"Label"';
  if (prop.name === "author") return '"Alice"';
  if (prop.name === "content" && t.includes("string")) return '"This is the content"';
  if (prop.name === "status") return '"success"';
  if (prop.name === "foreground") return '"#000000"';
  if (prop.name === "background") return '"#ffffff"';
  if (prop.name === "before") return '"https://via.placeholder.com/300x200/111/333?text=Before"';
  if (prop.name === "after") return '"https://via.placeholder.com/300x200/111/666?text=After"';
  if (prop.name === "pattern") return '"\\d+"';
  if (prop.name === "testString") return '"The answer is 42 and also 100"';
  if (prop.name === "expression") return '"0 * * * *"';
  if (prop.name === "src" && t === "string") return '"https://via.placeholder.com/200"';
  if (prop.name === "href" && t === "string") return '"#"';
  if (prop.name === "name" && t === "string") return '"Example"';
  if (prop.name === "description" && t === "string") return '"A description"';
  if (prop.name === "placeholder" && t === "string") return '"Type here..."';

  // Numbers — use braces
  if (prop.name === "value" && t.includes("number")) return "{50}";
  if (prop.name === "min") return "{0}";
  if (prop.name === "max") return "{100}";
  if (prop.name === "step") return "{1}";
  if (prop.name === "count") return "{5}";
  if (prop.name === "length") return "{6}";
  if (prop.name === "columns" && t.includes("number")) return "{3}";
  if (prop.name === "rows" && t.includes("number")) return "{5}";

  // Booleans
  if (t === "boolean" || t === "true | false") return "{true}";

  // Generic fallbacks by type
  if (t === "string" || t.includes("string")) return '"example"';
  if (t === "number") return "{42}";

  // Cannot determine — skip this prop
  return null;
}

/**
 * Return a JSX attribute value for optional "highlight" props.
 * These are always simple string literals.
 */
function getExampleValueForProp(prop: PropDoc): string | null {
  if (prop.name === "variant") return '"accent"';
  if (prop.name === "size") return '"md"';
  if (prop.name === "tone") return '"success"';
  if (prop.name === "status") return '"success"';
  if (prop.name === "mode") return '"slider"';
  if (prop.name === "orientation") return '"horizontal"';
  if (prop.name === "label") return '"Example"';
  return null;
}
