import type { ComponentDoc, PropDoc } from "../src/dev";

/**
 * Hand-crafted playground overrides for components that need specific examples.
 * These take priority over auto-generation.
 */
const COMPONENT_OVERRIDES: Record<string, string> = {
  // ── Layout ──────────────────────────────────────────────────────────
  Flex: '<Flex gap={8}>\n  <div style={{ padding: 8, background: "var(--vf-bg-3)" }}>Item 1</div>\n  <div style={{ padding: 8, background: "var(--vf-bg-3)" }}>Item 2</div>\n  <div style={{ padding: 8, background: "var(--vf-bg-3)" }}>Item 3</div>\n</Flex>',
  HStack: '<HStack gap={8}>\n  <Badge>Tag 1</Badge>\n  <Badge>Tag 2</Badge>\n  <Badge>Tag 3</Badge>\n</HStack>',
  VStack: '<VStack gap={8}>\n  <div style={{ padding: 8, background: "var(--vf-bg-3)" }}>Item 1</div>\n  <div style={{ padding: 8, background: "var(--vf-bg-3)" }}>Item 2</div>\n  <div style={{ padding: 8, background: "var(--vf-bg-3)" }}>Item 3</div>\n</VStack>',
  Grid: '<Grid cols={3} gap={8}>\n  <div style={{ padding: 12, background: "var(--vf-bg-3)" }}>Cell 1</div>\n  <div style={{ padding: 12, background: "var(--vf-bg-3)" }}>Cell 2</div>\n  <div style={{ padding: 12, background: "var(--vf-bg-3)" }}>Cell 3</div>\n</Grid>',
  Container: '<Container maxWidth={400} style={{ border: "1px dashed var(--vf-border-2)", padding: 12 }}>\n  <Text>Centered container with max-width 400px</Text>\n</Container>',
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
  Button: '<div style={{ display: "flex", gap: 8 }}>\n  <Button variant="solid">Solid</Button>\n  <Button variant="outline">Outline</Button>\n  <Button variant="ghost">Ghost</Button>\n  <Button variant="subtle" accent="var(--vf-red)">Danger</Button>\n</div>',
  IconButton: '<div style={{ display: "flex", gap: 8 }}>\n  <IconButton aria-label="Settings"><Text>&#9881;</Text></IconButton>\n  <IconButton aria-label="Close"><Text>&#10005;</Text></IconButton>\n</div>',
  ButtonGroup: '<ButtonGroup\n  options={[\n    { value: "left", label: "Left" },\n    { value: "center", label: "Center" },\n    { value: "right", label: "Right" },\n  ]}\n  value="center"\n  onValueChange={() => {}}\n/>',
  CopyButton: '<CopyButton text="npm install voidframe-ui" />',
  CloseButton: '<CloseButton onClick={() => {}} />',
  ActionButton: '<ActionButton label="Submit" onClick={() => {}} />',
  FloatingActionButton: '<FloatingActionButton label="Add" onClick={() => {}} />',

  // ── Form components ─────────────────────────────────────────────────
  Input: '<Input label="Name" placeholder="Enter your name..." value="Jane Doe" onValueChange={() => {}} />',
  Checkbox: '<Checkbox checked={true} label="Accept terms" onValueChange={() => {}} />',
  Toggle: '<Toggle checked={true} label="Enable notifications" onValueChange={() => {}} />',
  Switch: '<Toggle checked={true} label="Dark mode" onValueChange={() => {}} />',
  RadioGroup: '<RadioGroup\n  options={[\n    { value: "sm", label: "Small" },\n    { value: "md", label: "Medium" },\n    { value: "lg", label: "Large" },\n  ]}\n  value="md"\n  onValueChange={() => {}}\n/>',
  Radio: '<VStack gap={4}>\n  <Radio name="size" value="sm" label="Small" checked={false} onValueChange={() => {}} />\n  <Radio name="size" value="md" label="Medium" checked={true} onValueChange={() => {}} />\n  <Radio name="size" value="lg" label="Large" checked={false} onValueChange={() => {}} />\n</VStack>',
  Slider: '<Slider value={60} min={0} max={100} onValueChange={() => {}} label="Volume" />',
  RangeSlider: '<RangeSlider value={[20, 80]} min={0} max={100} onValueChange={() => {}} label="Price range" />',
  Textarea: '<Textarea label="Description" placeholder="Write something..." value="Hello world" onValueChange={() => {}} />',
  PasswordInput: '<PasswordInput label="Password" value="VF-EXAMPLE-1234" onValueChange={() => {}} />',
  PinInput: '<PinInput length={6} value="1234" onValueChange={() => {}} />',
  TagInput: '<TagInput value={["React", "Vue", "Svelte"]} onValueChange={() => {}} placeholder="Add framework..." />',
  SearchInput: '<SearchInput value="" onValueChange={() => {}} placeholder="Search..." />',
  NumberInput: '<NumberInput label="Quantity" value={5} min={0} max={99} onValueChange={() => {}} />',
  Select: '<Select\n  label="Country"\n  options={[\n    { value: "us", label: "United States" },\n    { value: "uk", label: "United Kingdom" },\n    { value: "de", label: "Germany" },\n  ]}\n  value="us"\n  onValueChange={() => {}}\n/>',
  MultiSelect: '<MultiSelect\n  label="Tags"\n  options={[\n    { value: "react", label: "React" },\n    { value: "vue", label: "Vue" },\n    { value: "svelte", label: "Svelte" },\n  ]}\n  value={["react"]}\n  onValueChange={() => {}}\n/>',
  Combobox: '<Combobox\n  label="Framework"\n  options={[\n    { value: "react", label: "React" },\n    { value: "vue", label: "Vue" },\n    { value: "svelte", label: "Svelte" },\n  ]}\n  value="react"\n  onValueChange={() => {}}\n/>',
  Autocomplete: '<Autocomplete\n  label="City"\n  options={["New York", "London", "Tokyo", "Paris", "Berlin"]}\n  value=""\n  onValueChange={() => {}}\n  placeholder="Type a city..."\n/>',
  DatePicker: '<DatePicker label="Date" onValueChange={() => {}} />',
  TimePicker: '<TimePicker label="Time" onValueChange={() => {}} />',
  DateTimePicker: '<DateTimePicker label="Date and time" onValueChange={() => {}} />',
  DateRangePicker: '<DateRangePicker label="Date range" onValueChange={() => {}} />',
  ColorPicker: '<ColorPicker value="#4ade80" onValueChange={() => {}} />',
  ColorInput: '<ColorInput label="Brand color" value="#4ade80" onValueChange={() => {}} />',
  FormField: '<FormField label="Email" hint="We will never share your email" error="">\n  <Input placeholder="you@example.com" />\n</FormField>',
  SegmentedControl: '<SegmentedControl\n  options={[\n    { value: "day", label: "Day" },\n    { value: "week", label: "Week" },\n    { value: "month", label: "Month" },\n  ]}\n  value="week"\n  onValueChange={() => {}}\n/>',
  FileUpload: '<FileUpload onFiles={() => {}} accept="image/*" label="Upload image" />',
  FileDropzone: '<FileDropzone onFiles={() => {}} label="Drop files here or click to browse" />',
  StarRating: '<StarRating value={3} max={5} onValueChange={() => {}} />',
  Rating: '<Rating value={4} max={5} onValueChange={() => {}} />',
  TransferList: '<TransferList\n  available={[\n    { value: "a", label: "Alpha" },\n    { value: "b", label: "Beta" },\n    { value: "c", label: "Gamma" },\n  ]}\n  selected={["a"]}\n  onValueChange={() => {}}\n/>',
  OtpInput: '<OtpInput length={6} value="" onValueChange={() => {}} />',
  PhoneInput: '<PhoneInput value="" onValueChange={() => {}} label="Phone number" />',
  CurrencyInput: '<CurrencyInput value={1299} currency="USD" onValueChange={() => {}} label="Amount" />',
  MaskInput: '<MaskInput mask="(999) 999-9999" value="" onValueChange={() => {}} label="Phone" placeholder="(___) ___-____" />',
  RichTextEditor: '<RichTextEditor\n  value="<p>Edit this <strong>rich text</strong> content.</p>"\n  onValueChange={() => {}}\n  style={{ height: 120 }}\n/>',

  // ── Data display ────────────────────────────────────────────────────
  Avatar: '<div style={{ display: "flex", gap: 8, alignItems: "center" }}>\n  <Avatar initials="JD" />\n  <Avatar initials="AB" status="online" />\n  <Avatar initials="CD" status="away" />\n</div>',
  AvatarGroup: '<AvatarGroup\n  items={[\n    { initials: "JD" },\n    { initials: "AB" },\n    { initials: "CD" },\n    { initials: "EF" },\n    { initials: "GH" },\n  ]}\n  max={3}\n/>',
  Badge: '<div style={{ display: "flex", gap: 8 }}>\n  <Badge>Default</Badge>\n  <Badge variant="subtle">Accent</Badge>\n  <Badge tone="success">Success</Badge>\n  <Badge tone="danger">Danger</Badge>\n</div>',
  Tag: '<div style={{ display: "flex", gap: 8 }}>\n  <Tag label="React" />\n  <Tag label="Error" variant="danger" />\n  <Tag label="Done" variant="success" onRemove={() => {}} />\n</div>',
  Chip: '<div style={{ display: "flex", gap: 8 }}>\n  <Chip label="Frontend" />\n  <Chip label="Active" variant="success" />\n  <Chip label="Removable" onRemove={() => {}} />\n</div>',
  Tooltip: '<Tooltip content="This is a tooltip">\n  <Button>Hover me</Button>\n</Tooltip>',
  Popover: '<Popover trigger={<Button>Click me</Button>}>\n  <Text size="sm">Popover content here</Text>\n</Popover>',
  Code: '<Code>const x = 42;</Code>',
  Kbd: '<div style={{ display: "flex", gap: 4 }}>\n  <Kbd>Ctrl</Kbd><Kbd>Shift</Kbd><Kbd>P</Kbd>\n</div>',
  Skeleton: '<VStack gap={8}>\n  <Skeleton shape="rect" style={{ width: 200, height: 16 }} />\n  <Skeleton shape="rect" style={{ width: 160, height: 16 }} />\n  <Skeleton shape="circle" style={{ width: 40, height: 40 }} />\n</VStack>',
  EmptyState: '<EmptyState\n  title="No items yet"\n  description="Get started by creating your first item."\n  action={<Button>Create Item</Button>}\n/>',
  Progress: '<VStack gap={8}>\n  <Progress value={72} max={100} label="Upload" showValue />\n  <Progress value={30} max={100} tone="warning" />\n</VStack>',
  ProgressBar: '<VStack gap={8}>\n  <ProgressBar value={72} max={100} />\n  <ProgressBar value={30} max={100} tone="warning" />\n</VStack>',
  Stat: '<div style={{ display: "flex", gap: 16 }}>\n  <Stat label="Users" value="12,847" change={12.5} />\n  <Stat label="Revenue" value="$48K" change={-3.2} />\n</div>',
  Spinner: '<div style={{ display: "flex", gap: 12, alignItems: "center" }}>\n  <Spinner size="sm" />\n  <Spinner />\n  <Spinner size="lg" />\n</div>',
  StatusIndicator: '<div style={{ display: "flex", gap: 12 }}>\n  <StatusIndicator status="online" label="Online" />\n  <StatusIndicator status="offline" label="Offline" />\n  <StatusIndicator status="busy" label="Busy" />\n</div>',
  CircularProgress: '<div style={{ display: "flex", gap: 16 }}>\n  <CircularProgress value={75} />\n  <CircularProgress value={30} tone="warning" />\n  <CircularProgress value={90} tone="success" />\n</div>',
  Timeline: '<Timeline\n  items={[\n    { key: "1", title: "Created", description: "Project initialized", date: "Jan 1" },\n    { key: "2", title: "In Progress", description: "Development started", date: "Jan 15" },\n    { key: "3", title: "Completed", description: "Shipped to production", date: "Feb 1" },\n  ]}\n/>',
  KeyValue: '<KeyValue\n  items={[\n    { key: "Name", value: "Jane Doe" },\n    { key: "Role", value: "Engineer" },\n    { key: "Status", value: "Active" },\n  ]}\n/>',
  MetricCard: '<MetricCard title="Active Users" value="1,234" change={8.5} />',
  TrendIndicator: '<div style={{ display: "flex", gap: 16 }}>\n  <TrendIndicator value={12.5} direction="up" />\n  <TrendIndicator value={-3.2} direction="down" />\n</div>',
  DataList: '<DataList\n  items={[\n    { label: "Name", value: "Jane Doe" },\n    { label: "Email", value: "jane@example.com" },\n    { label: "Role", value: "Engineer" },\n  ]}\n/>',
  DescriptionList: '<DescriptionList>\n  <DescriptionList.Term>Framework</DescriptionList.Term>\n  <DescriptionList.Description>Voidframe</DescriptionList.Description>\n  <DescriptionList.Term>Language</DescriptionList.Term>\n  <DescriptionList.Description>TypeScript</DescriptionList.Description>\n  <DescriptionList.Term>License</DescriptionList.Term>\n  <DescriptionList.Description>MIT</DescriptionList.Description>\n</DescriptionList>',
  CountUp: '<CountUp end={1234} duration={2000} />',
  Meter: '<Meter value={72} min={0} max={100} label="Storage used" />',
  Gauge: '<Gauge value={72} min={0} max={100} label="CPU" />',

  // ── Navigation ──────────────────────────────────────────────────────
  Breadcrumb: '<Breadcrumb\n  items={[\n    { label: "Home", href: "#" },\n    { label: "Products", href: "#" },\n    { label: "Widget", isCurrent: true },\n  ]}\n/>',
  Pagination: '<Pagination value={3} totalPages={10} onValueChange={() => {}} />',
  Stepper: '<Stepper\n  steps={[\n    { label: "Account" },\n    { label: "Profile" },\n    { label: "Review" },\n  ]}\n  current={1}\n/>',
  Tabs: '<Tabs defaultValue="tab1">\n  <Tabs.List aria-label="Sections">\n    <Tabs.Trigger value="tab1">Overview</Tabs.Trigger>\n    <Tabs.Trigger value="tab2">Details</Tabs.Trigger>\n    <Tabs.Trigger value="tab3">Settings</Tabs.Trigger>\n  </Tabs.List>\n  <Tabs.Panel value="tab1"><Text>Overview content</Text></Tabs.Panel>\n  <Tabs.Panel value="tab2"><Text>Details content</Text></Tabs.Panel>\n  <Tabs.Panel value="tab3"><Text>Settings content</Text></Tabs.Panel>\n</Tabs>',
  NavItem: '<VStack gap={2}>\n  <NavItem active>Dashboard</NavItem>\n  <NavItem>Settings</NavItem>\n  <NavItem>Profile</NavItem>\n</VStack>',
  NavGroup: '<NavGroup title="Main">\n  <NavItem active>Dashboard</NavItem>\n  <NavItem>Analytics</NavItem>\n  <NavItem>Settings</NavItem>\n</NavGroup>',
  Link: '<Link href="#">Visit documentation</Link>',
  Anchor: '<Anchor\n  activeKey="getting-started"\n  items={[\n    { key: "intro", label: "Introduction", href: "#intro" },\n    { key: "getting-started", label: "Getting Started", href: "#getting-started" },\n    { key: "api", label: "API Reference", href: "#api" },\n  ]}\n/>',
  BackButton: '<BackButton onClick={() => {}} />',

  // ── Feedback / Overlays ─────────────────────────────────────────────
  Modal: 'function Example() {\n  const [open, setOpen] = useState(false);\n  return (\n    <>\n      <Button onClick={() => setOpen(true)}>Open Modal</Button>\n      <Modal open={open} onDismiss={() => setOpen(false)} title="Example Modal">\n        <VStack gap={8} style={{ padding: 12 }}>\n          <Text>Modal content goes here.</Text>\n          <Button onClick={() => setOpen(false)}>Close</Button>\n        </VStack>\n      </Modal>\n    </>\n  );\n}\nrender(<Example />);',
  Dialog: '<Text size="sm" color="var(--vf-text-3)">Dialog requires controlled open state. Use open + onOpenChange props to manage visibility.</Text>',
  Drawer: 'function Example() {\n  const [open, setOpen] = useState(false);\n  return (\n    <>\n      <Button onClick={() => setOpen(true)}>Open Drawer</Button>\n      <Drawer open={open} onDismiss={() => setOpen(false)} title="Drawer">\n        <VStack gap={8} style={{ padding: 12 }}>\n          <Text>Drawer content</Text>\n          <Button onClick={() => setOpen(false)}>Close</Button>\n        </VStack>\n      </Drawer>\n    </>\n  );\n}\nrender(<Example />);',
  DrawerV2: 'function Example() {\n  const [open, setOpen] = useState(false);\n  return (\n    <DrawerV2 open={open} onOpenChange={setOpen} side="right">\n      <DrawerV2.Trigger asChild>\n        <Button onClick={() => setOpen(true)}>Open DrawerV2</Button>\n      </DrawerV2.Trigger>\n      <DrawerV2.Content>\n        <DrawerV2.Header>\n          <DrawerV2.Title>Drawer Title</DrawerV2.Title>\n        </DrawerV2.Header>\n        <DrawerV2.Body>\n          <Text>Compound drawer with focus trap and accessible title.</Text>\n        </DrawerV2.Body>\n        <DrawerV2.Footer>\n          <DrawerV2.Close asChild>\n            <Button variant="ghost">Close</Button>\n          </DrawerV2.Close>\n        </DrawerV2.Footer>\n      </DrawerV2.Content>\n    </DrawerV2>\n  );\n}\nrender(<Example />);',
  Sheet: 'function Example() {\n  const [open, setOpen] = useState(false);\n  return (\n    <Sheet open={open} onOpenChange={setOpen}>\n      <Sheet.Trigger asChild>\n        <Button onClick={() => setOpen(true)}>Open Sheet</Button>\n      </Sheet.Trigger>\n      <Sheet.Content>\n        <Sheet.Handle />\n        <Sheet.Header>\n          <Sheet.Title>Sheet Title</Sheet.Title>\n        </Sheet.Header>\n        <Sheet.Body>\n          <Text>Bottom sheet content with snap points.</Text>\n        </Sheet.Body>\n      </Sheet.Content>\n    </Sheet>\n  );\n}\nrender(<Example />);',
  Alert: '<Alert tone="warning" title="Warning" description="This action cannot be undone." onDismiss={() => {}} />',
  AlertDialog: 'function Example() {\n  const [open, setOpen] = useState(false);\n  return (\n    <>\n      <Button onClick={() => setOpen(true)}>Delete Item</Button>\n      <AlertDialog\n        open={open}\n        onOpenChange={setOpen}\n        title="Delete item?"\n        description="This cannot be undone."\n        confirmLabel="Delete"\n        onConfirm={() => setOpen(false)}\n        onCancel={() => setOpen(false)}\n      />\n    </>\n  );\n}\nrender(<Example />);',
  Callout: '<Callout tone="info" title="Note">\n  This is an informational callout with rich content support.\n</Callout>',
  BannerAlert: '<BannerAlert tone="success" title="Deployment complete" description="v1.0.0 shipped to production." onDismiss={() => {}} />',
  Banner: '<Banner tone="info" title="New feature available" description="Check out the latest update." onDismiss={() => {}} />',
  Notification: '<Notification title="New message" description="You have 3 unread messages" tone="info" />',
  Toast: '<div style={{ padding: "8px 12px", background: "var(--vf-bg-3)", border: "1px solid var(--vf-blue)", borderInlineStart: "3px solid var(--vf-blue)", display: "flex", justifyContent: "space-between", maxWidth: 300 }}>\n  <Text size="sm">New message received</Text>\n  <Button variant="ghost" size="sm">View</Button>\n</div>',

  // ── Interactive ─────────────────────────────────────────────────────
  Accordion: '<Accordion\n  items={[\n    { key: "1", title: "What is Voidframe UI?", content: "A dark, monochrome React UI framework." },\n    { key: "2", title: "How do I install it?", content: "npm install voidframe-ui" },\n    { key: "3", title: "Is it accessible?", content: "Yes. All components are tested with jest-axe." },\n  ]}\n/>',
  Collapsible: '<Collapsible title="Click to expand">\n  <Text>This content is inside a collapsible section.</Text>\n</Collapsible>',
  Card: '<Card style={{ maxWidth: 300 }}>\n  <VStack gap={8}>\n    <Text size="lg" style={{ fontWeight: 700 }}>Card Title</Text>\n    <Text size="sm" color="var(--vf-text-3)">Card content with description text.</Text>\n    <Button size="sm">Action</Button>\n  </VStack>\n</Card>',
  Dropdown: '<Dropdown\n  trigger={<Button>Dropdown</Button>}\n  items={[\n    { label: "Option 1", onClick: () => {} },\n    { label: "Option 2", onClick: () => {} },\n    { divider: true },\n    { label: "Delete", danger: true, onClick: () => {} },\n  ]}\n/>',
  DropdownMenu: '<Text size="sm" color="var(--vf-text-3)">DropdownMenu opens from a trigger button. Use the compound pattern with DropdownMenu.Trigger and .Content.</Text>',

  // ── Behavioral / invisible ─────────────────────────────────────────
  Portal: '<div style={{ padding: 12, border: "1px solid var(--vf-border-1)", background: "var(--vf-bg-2)" }}>\n  <Text size="sm">Portal renders children into document.body via React createPortal. Used by all overlay components.</Text>\n</div>',
  ScrollLock: '<div style={{ padding: 12, border: "1px solid var(--vf-border-1)", background: "var(--vf-bg-2)" }}>\n  <Text size="sm">ScrollLock prevents body scrolling when mounted. Used by Modal and Drawer to prevent background scroll.</Text>\n</div>',
  FocusScope: '<FocusScope>\n  <div style={{ padding: 12, border: "2px dashed var(--vf-border-2)", display: "flex", gap: 8 }}>\n    <Button size="sm">First</Button>\n    <Button size="sm">Second</Button>\n    <Button size="sm">Third</Button>\n  </div>\n</FocusScope>',
  FocusTrap: '<Text size="sm" color="var(--vf-text-3)">FocusTrap traps Tab focus within its children. Used by Dialog and Modal.</Text>',
  DismissableLayer: '<div style={{ padding: 12, border: "1px solid var(--vf-border-1)", background: "var(--vf-bg-2)" }}>\n  <Text size="sm">DismissableLayer detects Escape and outside clicks. Used internally by Dialog, Popover, and Menu overlays.</Text>\n</div>',
  Presence: 'function Example() {\n  const [show, setShow] = useState(true);\n  return (\n    <VStack gap={8}>\n      <Button onClick={() => setShow(!show)}>{show ? "Unmount" : "Mount"}</Button>\n      <Presence present={show}>\n        <div style={{ padding: 12, background: "var(--vf-bg-3)", border: "1px solid var(--vf-border-1)" }}>Managed by Presence</div>\n      </Presence>\n    </VStack>\n  );\n}\nrender(<Example />);',
  VisuallyHidden: '<div>\n  <Button>\n    <VisuallyHidden>Accessible label for screen readers</VisuallyHidden>\n    <span aria-hidden="true">&#9733;</span>\n  </Button>\n  <Text size="sm" color="var(--vf-text-3)">Button has a hidden label: inspect with dev tools to see it</Text>\n</div>',
  LiveRegion: 'function Example() {\n  const [msg, setMsg] = useState("");\n  return (\n    <VStack gap={8}>\n      <Button onClick={() => setMsg("Notification: 3 new messages!")}>Announce</Button>\n      <LiveRegion message={msg} />\n      <Text size="sm">Screen reader announcement: {msg || "(click button)"}</Text>\n    </VStack>\n  );\n}\nrender(<Example />);',
  ErrorBoundary: 'function Example() {\n  const [throwError, setThrowError] = useState(false);\n  if (throwError) throw new Error("Demo error");\n  return (\n    <ErrorBoundary fallback={<Text color="var(--vf-red)">Something went wrong! This is the error fallback.</Text>}>\n      <Button onClick={() => setThrowError(true)}>Trigger Error</Button>\n    </ErrorBoundary>\n  );\n}\nrender(<Example />);',
  Slot: '<Slot style={{ color: "var(--vf-green)", fontWeight: 700 }}>\n  <Text>This Text got Slot-merged styles (green, bold)</Text>\n</Slot>',
  HydrationBoundary: '<HydrationBoundary>\n  <div style={{ padding: 12, border: "1px solid var(--vf-border-1)", background: "var(--vf-bg-2)" }}>\n    <Text size="sm">HydrationBoundary suppresses React hydration mismatch warnings for SSR content.</Text>\n  </div>\n</HydrationBoundary>',
  ClientOnly: '<Text size="sm" color="var(--vf-text-3)">ClientOnly renders children only on the client side, skipping SSR.</Text>',
  Suspense: '<Text size="sm" color="var(--vf-text-3)">Suspense wraps lazy-loaded content with a fallback while loading.</Text>',
  ConditionalWrap: '<Text size="sm" color="var(--vf-text-3)">ConditionalWrap wraps children with a wrapper element only when a condition is true.</Text>',
  RenderCount: '<Text size="sm" color="var(--vf-text-3)">RenderCount displays a debug counter showing how many times its parent re-renders.</Text>',

  // ── Loading states ─────────────────────────────────────────────────
  LoadingOverlay: '<div style={{ position: "relative", height: 100, border: "1px solid var(--vf-border-1)" }}>\n  <Text>Content underneath</Text>\n  <LoadingOverlay loading message="Loading..." />\n</div>',
  Shimmer: '<div style={{ display: "flex", flexDirection: "column", gap: 8 }}>\n  <Shimmer style={{ width: 200, height: 16, borderRadius: 2 }} />\n  <Shimmer style={{ width: 160, height: 16, borderRadius: 2 }} />\n  <Shimmer style={{ width: 120, height: 16, borderRadius: 2 }} />\n</div>',
  SpinnerV2: '<div style={{ display: "flex", gap: 12 }}>\n  <SpinnerV2 size="sm" />\n  <SpinnerV2 />\n  <SpinnerV2 size="lg" />\n</div>',
  ErrorState: '<ErrorState title="Something went wrong" message="Please try again later." action={<Button size="sm">Retry</Button>} />',
  LoadingDots: '<LoadingDots />',
  SkeletonText: '<SkeletonText lines={3} />',
  SkeletonAvatar: '<div style={{ display: "flex", gap: 12 }}>\n  <SkeletonAvatar size="sm" />\n  <SkeletonAvatar size="md" />\n  <SkeletonAvatar size="lg" />\n</div>',
  SkeletonButton: '<SkeletonButton width="120px" />',
  SkeletonCard: '<SkeletonCard hasImage lines={3} hasActions />',
  SkeletonForm: '<SkeletonForm fields={3} hasSubmit />',
  SkeletonTable: '<SkeletonTable rows={4} columns={3} />',

  // ── Code/viewers ────────────────────────────────────────────────────
  CodeBlock: '<CodeBlock language="javascript" code={"const greeting = \\"Hello, Voidframe!\\"\\nconsole.log(greeting)"} />',
  JSONViewer: '<JSONViewer data={{ name: "Voidframe", version: "1.0.0", components: 260, themes: ["dark", "light", "midnight", "grey"] }} />',
  DiffViewer: '<DiffViewer\n  oldValue={"const x = 1;\\nconst y = 2;"}\n  newValue={"const x = 1;\\nconst y = 3;\\nconst z = 4;"}\n  kind="split"\n  showLineNumbers\n/>',
  Terminal: '<Terminal lines={["npm install voidframe-ui", "added 1 package in 1.2s", "npm run build", "vite v5.0.0 building...", "built in 2.1s"]} />',
  LogViewer: '<LogViewer\n  entries={[\n    { level: "info", message: "Server started on port 3000", timestamp: "10:00:01" },\n    { level: "warn", message: "Deprecated API called", timestamp: "10:00:05" },\n    { level: "error", message: "Connection refused", timestamp: "10:00:12" },\n  ]}\n  height={200}\n/>',
  CodeEditor: '<CodeEditor\n  value={"function hello() {\\n  console.log(\\"Hi\\");\\n}"}\n  language="javascript"\n  onValueChange={() => {}}\n  style={{ height: 120 }}\n/>',
  MarkdownViewer: '<MarkdownRenderer content={"# Hello\\n\\nThis is **bold** and this is _italic_.\\n\\n- Item one\\n- Item two"} />',
  SyntaxHighlighter: '<SyntaxHighlighter language="typescript" code={"interface Props {\\n  name: string;\\n  count: number;\\n}"} />',

  // ── Media ───────────────────────────────────────────────────────────
  VideoPlayer: '<VideoPlayer\n  src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"\n  poster="data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'400\' height=\'225\'%3E%3Crect fill=\'%23222\' width=\'400\' height=\'225\'/%3E%3Ctext fill=\'%23666\' x=\'50%25\' y=\'50%25\' dominant-baseline=\'middle\' text-anchor=\'middle\' font-family=\'monospace\' font-size=\'14\'%3EVideo%3C/text%3E%3C/svg%3E"\n  style={{ maxWidth: 400 }}\n/>',
  AudioPlayer: '<AudioPlayer\n  src="https://commondatastorage.googleapis.com/codeskulptor-demos/DDR_assets/Sevish_-__nbsp_.mp3"\n  style={{ maxWidth: 300 }}\n/>',
  VoiceWaveform: '<VoiceWaveform\n  audioData={[0.2, 0.5, 0.8, 0.4, 0.9, 0.3, 0.7, 0.6, 0.4, 0.8, 0.5, 0.3, 0.7, 0.9, 0.4, 0.6, 0.2, 0.5, 0.8, 0.3, 0.6, 0.9, 0.4, 0.7, 0.5, 0.3, 0.8, 0.6, 0.4, 0.7, 0.2, 0.5, 0.9, 0.3, 0.6, 0.8, 0.4, 0.7, 0.5, 0.3, 0.8, 0.6, 0.4, 0.7, 0.2, 0.5, 0.9, 0.3]}\n  progress={0.4}\n  height={36}\n  bars={48}\n/>',
  Carousel: 'function Example() {\n  return (\n    <Carousel style={{ maxWidth: 400 }}>\n      <div style={{ padding: 40, background: "var(--vf-bg-3)", textAlign: "center" }}><Text>Slide 1</Text></div>\n      <div style={{ padding: 40, background: "var(--vf-bg-2)", textAlign: "center" }}><Text>Slide 2</Text></div>\n      <div style={{ padding: 40, background: "var(--vf-bg-3)", textAlign: "center" }}><Text>Slide 3</Text></div>\n    </Carousel>\n  );\n}\nrender(<Example />);',
  CarouselImageGallery: '<CarouselImageGallery\n  images={[\n    { src: "data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'400\' height=\'250\'%3E%3Crect fill=\'%231a1a1a\' width=\'400\' height=\'250\'/%3E%3Ctext fill=\'%23666\' x=\'50%25\' y=\'50%25\' dominant-baseline=\'middle\' text-anchor=\'middle\' font-family=\'monospace\' font-size=\'14\'%3ESlide 1%3C/text%3E%3C/svg%3E", alt: "Slide 1" },\n    { src: "data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'400\' height=\'250\'%3E%3Crect fill=\'%23222\' width=\'400\' height=\'250\'/%3E%3Ctext fill=\'%23888\' x=\'50%25\' y=\'50%25\' dominant-baseline=\'middle\' text-anchor=\'middle\' font-family=\'monospace\' font-size=\'14\'%3ESlide 2%3C/text%3E%3C/svg%3E", alt: "Slide 2" },\n    { src: "data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'400\' height=\'250\'%3E%3Crect fill=\'%23111\' width=\'400\' height=\'250\'/%3E%3Ctext fill=\'%23555\' x=\'50%25\' y=\'50%25\' dominant-baseline=\'middle\' text-anchor=\'middle\' font-family=\'monospace\' font-size=\'14\'%3ESlide 3%3C/text%3E%3C/svg%3E", alt: "Slide 3" },\n  ]}\n  style={{ maxWidth: 400 }}\n/>',
  Lightbox: 'function Example() {\n  const [open, setOpen] = useState(false);\n  const images = [\n    { src: "data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'400\' height=\'300\'%3E%3Crect fill=\'%23222\' width=\'400\' height=\'300\'/%3E%3Ctext fill=\'%23666\' x=\'50%25\' y=\'50%25\' dominant-baseline=\'middle\' text-anchor=\'middle\' font-family=\'monospace\' font-size=\'14\'%3EPhoto 1%3C/text%3E%3C/svg%3E", alt: "Photo 1" },\n    { src: "data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'400\' height=\'300\'%3E%3Crect fill=\'%23333\' width=\'400\' height=\'300\'/%3E%3Ctext fill=\'%23888\' x=\'50%25\' y=\'50%25\' dominant-baseline=\'middle\' text-anchor=\'middle\' font-family=\'monospace\' font-size=\'14\'%3EPhoto 2%3C/text%3E%3C/svg%3E", alt: "Photo 2" },\n  ];\n  return (\n    <>\n      <img src={images[0].src} style={{ cursor: "pointer", border: "1px solid var(--vf-border-1)", width: 120, height: 80, objectFit: "cover" }} onClick={() => setOpen(true)} alt="Click to enlarge" />\n      <Lightbox images={images} open={open} onOpenChange={setOpen} />\n    </>\n  );\n}\nrender(<Example />);',
  ImageGallery: '<ImageGallery\n  images={[\n    { src: "data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'200\' height=\'150\'%3E%3Crect fill=\'%231a1a1a\' width=\'200\' height=\'150\'/%3E%3Ctext fill=\'%23666\' x=\'50%25\' y=\'50%25\' dominant-baseline=\'middle\' text-anchor=\'middle\' font-family=\'monospace\' font-size=\'14\'%3EA%3C/text%3E%3C/svg%3E", alt: "Image A" },\n    { src: "data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'200\' height=\'150\'%3E%3Crect fill=\'%23222\' width=\'200\' height=\'150\'/%3E%3Ctext fill=\'%23888\' x=\'50%25\' y=\'50%25\' dominant-baseline=\'middle\' text-anchor=\'middle\' font-family=\'monospace\' font-size=\'14\'%3EB%3C/text%3E%3C/svg%3E", alt: "Image B" },\n    { src: "data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'200\' height=\'150\'%3E%3Crect fill=\'%23111\' width=\'200\' height=\'150\'/%3E%3Ctext fill=\'%23555\' x=\'50%25\' y=\'50%25\' dominant-baseline=\'middle\' text-anchor=\'middle\' font-family=\'monospace\' font-size=\'14\'%3EC%3C/text%3E%3C/svg%3E", alt: "Image C" },\n  ]}\n  columns={3}\n  gap={8}\n  style={{ maxWidth: 400 }}\n/>',
  IFrame: '<IFrame\n  src="https://example.com"\n  title="External content"\n  style={{ width: "100%", height: 150, border: "1px solid var(--vf-border-1)" }}\n/>',
  Marquee: '<Marquee speed={30}>\n  <HStack gap={16}>\n    <Badge>Breaking</Badge>\n    <Text size="sm">Voidframe 1.0 released with 260+ components, 55+ hooks, and 35+ chart types.</Text>\n  </HStack>\n</Marquee>',
  Image: '<Image src="data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'200\' height=\'120\'%3E%3Crect fill=\'%231a1a1a\' width=\'200\' height=\'120\'/%3E%3Ctext fill=\'%23666\' x=\'50%25\' y=\'50%25\' dominant-baseline=\'middle\' text-anchor=\'middle\' font-family=\'monospace\' font-size=\'14\'%3EImage%3C/text%3E%3C/svg%3E" alt="Placeholder" style={{ borderRadius: 8 }} />',
  ImageCompare: '<Text size="sm" color="var(--vf-text-3)">ImageCompare shows a before/after image slider. Provide before and after image URLs.</Text>',
  Gallery: '<Text size="sm" color="var(--vf-text-3)">Gallery renders a grid of images with optional lightbox. Provide an images array.</Text>',

  // ── Compound component parts ────────────────────────────────────────
  ToolbarButton: '<Text size="sm" color="var(--vf-text-3)">ToolbarButton is used inside a Toolbar component.</Text>',
  SidebarSection: '<Text size="sm" color="var(--vf-text-3)">SidebarSection is used inside a Sidebar component to group NavItems.</Text>',
  TabPanel: '<Text size="sm" color="var(--vf-text-3)">TabPanel is the content panel for a Tab. Used inside Tabs compound component.</Text>',
  TabList: '<Text size="sm" color="var(--vf-text-3)">TabList contains Tab triggers. Used inside Tabs compound component.</Text>',
  MenuItem: '<Button variant="ghost" style={{ width: "100%", justifyContent: "start" }}>Menu Item</Button>',
  MenuGroup: '<Text size="sm" color="var(--vf-text-3)">MenuGroup groups MenuItems with an optional label.</Text>',
  MenuSeparator: '<VStack gap={0}>\n  <Text size="sm" style={{ padding: "4px 8px" }}>Above</Text>\n  <Divider />\n  <Text size="sm" style={{ padding: "4px 8px" }}>Below</Text>\n</VStack>',
  ListItem: '<Text size="sm" color="var(--vf-text-3)">ListItem is used inside a List component.</Text>',
  AccordionItem: '<Text size="sm" color="var(--vf-text-3)">AccordionItem is used inside an Accordion compound component.</Text>',
  DialogHeader: '<Text size="sm" color="var(--vf-text-3)">DialogHeader is used inside Dialog for the title area.</Text>',
  DialogFooter: '<Text size="sm" color="var(--vf-text-3)">DialogFooter is used inside Dialog for action buttons.</Text>',
  DialogBody: '<Text size="sm" color="var(--vf-text-3)">DialogBody is used inside Dialog for the main content area.</Text>',
  CardHeader: '<Text size="sm" color="var(--vf-text-3)">CardHeader is used inside Card for the header area.</Text>',
  CardBody: '<Text size="sm" color="var(--vf-text-3)">CardBody is used inside Card for the main content.</Text>',
  CardFooter: '<Text size="sm" color="var(--vf-text-3)">CardFooter is used inside Card for the footer/actions.</Text>',
  ResizablePanel: '<div style={{ display: "flex", height: 80 }}>\n  <div style={{ flex: 1, padding: 8, background: "var(--vf-bg-3)" }}>Panel A</div>\n  <div style={{ width: 4, background: "var(--vf-border-2)" }} />\n  <div style={{ flex: 2, padding: 8, background: "var(--vf-bg-2)" }}>Panel B (wider)</div>\n</div>',
  ResizableHandle: '<div style={{ display: "flex", height: 80 }}>\n  <div style={{ flex: 1, padding: 8, background: "var(--vf-bg-3)" }}>Left</div>\n  <div style={{ width: 4, background: "var(--vf-border-2)", cursor: "col-resize" }} />\n  <div style={{ flex: 1, padding: 8, background: "var(--vf-bg-2)" }}>Right</div>\n</div>',
  StepperStep: '<Text size="sm" color="var(--vf-text-3)">StepperStep is a single step inside a Stepper component.</Text>',

  // ── Providers ───────────────────────────────────────────────────────
  VoidframeProvider: '<VStack gap={4} style={{ padding: 12, border: "1px solid var(--vf-border-1)" }}>\n  <Text size="sm" style={{ fontWeight: 600 }}>Inside VoidframeProvider:</Text>\n  <HStack gap={8}>\n    <Button size="sm">Themed Button</Button>\n    <Badge tone="success">Themed Badge</Badge>\n    <Toggle checked={true} label="Toggle" onValueChange={() => {}} />\n  </HStack>\n  <Text size="xs" color="var(--vf-text-3)">All components inherit theme, density, contrast, and locale from the provider.</Text>\n</VStack>',
  ThemeProvider: '<Text size="sm" color="var(--vf-text-3)">ThemeProvider supplies theme context to all voidframe-ui components.</Text>',
  ConfirmProvider: '<VStack gap={8}>\n  <Button>Show Confirm</Button>\n  <Text size="xs" color="var(--vf-text-3)">Wrap your app in ConfirmProvider, then call useConfirm() in any child.</Text>\n</VStack>',
  ShortcutProvider: '<VStack gap={4} style={{ padding: 12, border: "1px solid var(--vf-border-1)" }}>\n  <Text size="sm" style={{ fontWeight: 600 }}>Keyboard Shortcuts</Text>\n  <HStack gap={8}>\n    <HStack gap={2}><Kbd>Ctrl</Kbd><Kbd>K</Kbd><Text size="xs">Search</Text></HStack>\n    <HStack gap={2}><Kbd>Ctrl</Kbd><Kbd>S</Kbd><Text size="xs">Save</Text></HStack>\n  </HStack>\n  <Text size="xs" color="var(--vf-text-3)">Enables useShortcut() for registering global hotkeys.</Text>\n</VStack>',
  MessagesProvider: '<VStack gap={4} style={{ padding: 12, border: "1px solid var(--vf-border-1)" }}>\n  <Text size="sm" style={{ fontWeight: 600 }}>i18n Provider</Text>\n  <HStack gap={8}>\n    <Badge>English</Badge>\n    <Badge>Spanish</Badge>\n    <Badge>French</Badge>\n    <Badge>Arabic</Badge>\n    <Badge>Japanese</Badge>\n  </HStack>\n  <Text size="xs" color="var(--vf-text-3)">Supplies translated strings to all voidframe-ui components.</Text>\n</VStack>',
  TooltipProvider: '<Tooltip content="Tooltip text">\n  <Button>Hover for tooltip</Button>\n</Tooltip>',
  NotificationProvider: '<Text size="sm" color="var(--vf-text-3)">NotificationProvider enables the useNotification() hook for push-style notifications.</Text>',
  ModalProvider: '<Text size="sm" color="var(--vf-text-3)">ModalProvider enables imperative modal APIs via useModal().</Text>',

  // ── Notifications ───────────────────────────────────────────────────
  Toaster: '<VStack gap={4} style={{ maxWidth: 300 }}>\n  <div style={{ padding: "8px 12px", background: "var(--vf-bg-3)", border: "1px solid var(--vf-green)", borderInlineStart: "3px solid var(--vf-green)", display: "flex", justifyContent: "space-between" }}>\n    <Text size="sm">Saved successfully</Text>\n    <Text size="xs" color="var(--vf-text-3)">x</Text>\n  </div>\n  <div style={{ padding: "8px 12px", background: "var(--vf-bg-3)", border: "1px solid var(--vf-red)", borderInlineStart: "3px solid var(--vf-red)", display: "flex", justifyContent: "space-between" }}>\n    <Text size="sm">Connection failed</Text>\n    <Text size="xs" color="var(--vf-text-3)">x</Text>\n  </div>\n</VStack>',

  // ── AppShell / page layout ──────────────────────────────────────────
  AppShell: '<div style={{ height: 200, border: "1px solid var(--vf-border-1)", overflow: "hidden" }}>\n  <AppShell\n    header={<Text size="sm" style={{ padding: "4px 8px" }}>Header</Text>}\n    sidebar={<div style={{ padding: 8 }}><Text size="sm">Sidebar</Text></div>}\n    footer={<Text size="xs" style={{ padding: "4px 8px" }}>Footer</Text>}\n  >\n    <Text>Main content</Text>\n  </AppShell>\n</div>',
  Navbar: '<div style={{ border: "1px solid var(--vf-border-1)" }}>\n  <Navbar>\n    <Text size="sm" style={{ fontWeight: 700 }}>MyApp</Text>\n    <NavItem active>Home</NavItem>\n    <NavItem>About</NavItem>\n    <NavItem>Contact</NavItem>\n  </Navbar>\n</div>',
  Sidebar: '<div style={{ display: "flex", height: 200, border: "1px solid var(--vf-border-1)" }}>\n  <Sidebar style={{ width: 180 }}>\n    <Sidebar.Brand>APP</Sidebar.Brand>\n    <Sidebar.Section label="Main">\n      <NavItem active>Dashboard</NavItem>\n      <NavItem>Analytics</NavItem>\n      <NavItem>Settings</NavItem>\n    </Sidebar.Section>\n  </Sidebar>\n  <div style={{ flex: 1, padding: 12 }}>\n    <Text>Main content area</Text>\n  </div>\n</div>',
  Footer: '<Text size="sm" color="var(--vf-text-3)">Footer renders a page footer. Typically placed in AppShell footer slot.</Text>',
  Header: '<Text size="sm" color="var(--vf-text-3)">Header renders a page header. Typically placed in AppShell header slot.</Text>',
  PageHeader: '<PageHeader eyebrow="Settings" title="User Profile" description="Manage your account settings and preferences" />',
  SectionHeader: '<SectionHeader title="Recent Activity" action={<Button size="sm">View All</Button>} />',

  // ── Wizard ──────────────────────────────────────────────────────────
  Wizard: 'function Example() {\n  const [step, setStep] = useState("account");\n  return (\n    <Wizard value={step} onValueChange={setStep}>\n      <Wizard.Step id="account" label="Account">\n        <Input label="Email" placeholder="you@example.com" />\n      </Wizard.Step>\n      <Wizard.Step id="profile" label="Profile">\n        <Input label="Name" placeholder="Jane Doe" />\n      </Wizard.Step>\n      <Wizard.Step id="done" label="Done">\n        <Text>All set!</Text>\n      </Wizard.Step>\n      <Wizard.Footer>\n        <Wizard.Previous>Back</Wizard.Previous>\n        <Wizard.Next>Next</Wizard.Next>\n      </Wizard.Footer>\n    </Wizard>\n  );\n}\nrender(<Example />);',
  WizardStep: '<Text size="sm" color="var(--vf-text-3)">WizardStep is a single step inside a Wizard component.</Text>',

  // ── Scroll/responsive ───────────────────────────────────────────────
  ScrollArea: '<ScrollArea style={{ height: 120, border: "1px solid var(--vf-border-1)" }}>\n  <VStack gap={4} style={{ padding: 8 }}>\n    {Array.from({ length: 20 }, (_, i) => (\n      <Text key={i} size="sm">Scrollable item {i + 1}</Text>\n    ))}\n  </VStack>\n</ScrollArea>',
  ScrollRow: '<ScrollRow style={{ maxWidth: 300 }}>\n  {Array.from({ length: 10 }, (_, i) => (\n    <Badge key={i}>Tag {i + 1}</Badge>\n  ))}\n</ScrollRow>',
  InfiniteScroll: '<VStack gap={4} style={{ height: 120, overflow: "auto", border: "1px solid var(--vf-border-1)", padding: 8 }}>\n  {Array.from({ length: 20 }, (_, i) => <Text key={i} size="sm">Item {i + 1}</Text>)}\n  <Text size="xs" color="var(--vf-text-3)" style={{ textAlign: "center", padding: 8 }}>Loading more...</Text>\n</VStack>',
  VirtualList: '<VirtualList\n  items={Array.from({ length: 100 }, (_, i) => "Item " + (i + 1))}\n  itemHeight={32}\n  style={{ height: 160 }}\n  renderItem={(item, _i, style) => (\n    <div style={{ ...style, padding: "6px 8px", borderBottom: "1px solid var(--vf-border-0)" }}>{item}</div>\n  )}\n/>',

  // ── Icons ───────────────────────────────────────────────────────────
  Icon: '<div style={{ display: "flex", gap: 8 }}>\n  <Icon name="check" />\n  <Icon name="alert" />\n  <Icon name="info" />\n</div>',

  // ── Context/Menu ────────────────────────────────────────────────────
  ContextMenu: 'function Example() {\n  return (\n    <ContextMenu\n      items={[\n        { key: "edit", label: "Edit" },\n        { key: "copy", label: "Copy" },\n        { key: "delete", label: "Delete", danger: true },\n      ]}\n      onSelect={() => {}}\n    >\n      <div style={{ padding: 24, border: "1px dashed var(--vf-border-2)", textAlign: "center" }}>\n        <Text size="sm">Right-click this area</Text>\n      </div>\n    </ContextMenu>\n  );\n}\nrender(<Example />);',
  Menu: 'function Example() {\n  const [open, setOpen] = useState(false);\n  return (\n    <Menu open={open} onOpenChange={setOpen}>\n      <Menu.Trigger><Button onClick={() => setOpen(!open)}>Open Menu</Button></Menu.Trigger>\n      <Menu.Content>\n        <Menu.Item onSelect={() => {}}>Cut</Menu.Item>\n        <Menu.Item onSelect={() => {}}>Copy</Menu.Item>\n        <Menu.Item onSelect={() => {}}>Paste</Menu.Item>\n        <Menu.Separator />\n        <Menu.Item onSelect={() => {}}>Select All</Menu.Item>\n      </Menu.Content>\n    </Menu>\n  );\n}\nrender(<Example />);',
  MenuCheckboxItem: 'function Example() {\n  const [open, setOpen] = useState(false);\n  const [checked, setChecked] = useState(true);\n  return (\n    <Menu open={open} onOpenChange={setOpen}>\n      <Menu.Trigger><Button onClick={() => setOpen(!open)}>Menu with Checkbox</Button></Menu.Trigger>\n      <Menu.Content>\n        <Menu.CheckboxItem checked={checked} onCheckedChange={setChecked}>Show Grid</Menu.CheckboxItem>\n        <Menu.CheckboxItem checked={false}>Show Labels</Menu.CheckboxItem>\n      </Menu.Content>\n    </Menu>\n  );\n}\nrender(<Example />);',
  MenuContent: '<VStack gap={2} style={{ padding: 8, border: "1px solid var(--vf-border-1)", minWidth: 150 }}>\n  <Button variant="ghost" style={{ width: "100%", justifyContent: "start" }}>Cut</Button>\n  <Button variant="ghost" style={{ width: "100%", justifyContent: "start" }}>Copy</Button>\n  <Button variant="ghost" style={{ width: "100%", justifyContent: "start" }}>Paste</Button>\n</VStack>',
  MenuLabel: '<Text size="xs" upper spacing={2} color="var(--vf-text-3)" style={{ padding: "4px 8px" }}>SECTION LABEL</Text>',
  MenuRadioGroup: '<VStack gap={2} style={{ padding: 8, border: "1px solid var(--vf-border-1)" }}>\n  <RadioGroup options={[{ value: "a", label: "Option A" }, { value: "b", label: "Option B" }]} value="a" onValueChange={() => {}} />\n</VStack>',
  MenuRadioItem: '<RadioGroup options={[{ value: "a", label: "Radio Item" }]} value="a" onValueChange={() => {}} />',
  MenuSub: '<VStack gap={2} style={{ padding: 8, border: "1px solid var(--vf-border-1)" }}>\n  <Button variant="ghost" style={{ width: "100%", justifyContent: "space-between" }}>Submenu <Text size="xs">&#9656;</Text></Button>\n</VStack>',
  MenuSubContent: '<VStack gap={2} style={{ padding: 8, border: "1px solid var(--vf-border-1)", marginInlineStart: 8 }}>\n  <Button variant="ghost" size="sm" style={{ width: "100%", justifyContent: "start" }}>Sub Item 1</Button>\n  <Button variant="ghost" size="sm" style={{ width: "100%", justifyContent: "start" }}>Sub Item 2</Button>\n</VStack>',
  MenuSubTrigger: '<Button variant="ghost" style={{ width: "100%", justifyContent: "space-between" }}>Open Submenu <Text size="xs">&#9656;</Text></Button>',
  MenuTrigger: '<Button>Open Menu &#9662;</Button>',
  CommandPalette: 'function Example() {\n  const [open, setOpen] = useState(false);\n  return (\n    <VStack gap={8}>\n      <Button onClick={() => setOpen(true)}>Open Command Palette</Button>\n      <CommandPalette\n        open={open}\n        onOpenChange={setOpen}\n        items={[\n          { id: "1", title: "Go to Dashboard", section: "Navigation" },\n          { id: "2", title: "Create New Project", section: "Actions" },\n          { id: "3", title: "Toggle Dark Mode", section: "Settings" },\n        ]}\n        onSelect={() => setOpen(false)}\n      />\n    </VStack>\n  );\n}\nrender(<Example />);',
  CommandBar: '<Text size="sm" color="var(--vf-text-3)">CommandBar is a command palette for quick actions. Controlled via open/onOpenChange.</Text>',

  // ── Chat ────────────────────────────────────────────────────────────
  Conversation: '<VStack gap={4} style={{ border: "1px solid var(--vf-border-1)", padding: 12 }}>\n  <div style={{ padding: "6px 10px", background: "var(--vf-bg-3)", alignSelf: "start" }}><Text size="sm">What is voidframe-ui?</Text></div>\n  <div style={{ padding: "6px 10px", background: "var(--vf-bg-2)", borderInlineStart: "2px solid var(--vf-blue)", alignSelf: "start" }}><Text size="sm">A dark, monochrome React UI framework.</Text></div>\n</VStack>',
  Message: '<Message\n  role="assistant"\n  content="Hello! How can I help you today?"\n/>',
  MessageList: '<VStack gap={8} style={{ height: 120, overflow: "auto", padding: 8, border: "1px solid var(--vf-border-1)" }}>\n  <div style={{ padding: "4px 8px", background: "var(--vf-bg-3)" }}><Text size="sm">Hello!</Text></div>\n  <div style={{ padding: "4px 8px", background: "var(--vf-bg-2)", borderInlineStart: "2px solid var(--vf-blue)" }}><Text size="sm">Hi there! How can I help?</Text></div>\n  <div style={{ padding: "4px 8px", background: "var(--vf-bg-3)" }}><Text size="sm">Tell me about voidframe-ui</Text></div>\n</VStack>',
  ChatInput: '<Text size="sm" color="var(--vf-text-3)">ChatInput is the text input area for sending chat messages.</Text>',
  MessageBubble: '<Text size="sm" color="var(--vf-text-3)">MessageBubble wraps a single chat message with styling and alignment.</Text>',
  TypingIndicator: '<TypingIndicator />',
  ToolCall: '<ToolCall\n  name="search_database"\n  args={{ query: "active users", limit: 10 }}\n  result={{ count: 42, results: ["..."] }}\n  status="complete"\n/>',
  Citation: '<Citation index={1} />',
  Mention: '<Text>Ask <Mention value="@alice" /> about the deployment.</Text>',
  StreamingText: '<StreamingText text="Hello! I am an AI assistant. I can help you with various tasks including writing code, answering questions, and more." speed={30} />',
  ThinkingIndicator: '<ThinkingIndicator />',
  SuggestionChips: '<SuggestionChips\n  suggestions={[\n    { text: "Tell me more" },\n    { text: "Show code" },\n    { text: "Explain" },\n  ]}\n  onSelect={() => {}}\n/>',
  QuickReplies: '<SuggestionChips\n  suggestions={[\n    { text: "Yes" },\n    { text: "No" },\n    { text: "Maybe later" },\n  ]}\n  onSelect={() => {}}\n/>',

  // ── Table ───────────────────────────────────────────────────────────
  Table: '<Table\n  columns={[\n    { key: "name", header: "Name" },\n    { key: "role", header: "Role" },\n    { key: "status", header: "Status" },\n  ]}\n  data={[\n    { name: "Alice", role: "Engineer", status: "Active" },\n    { name: "Bob", role: "Designer", status: "Away" },\n    { name: "Charlie", role: "Manager", status: "Active" },\n  ]}\n/>',
  DataTable: '<DataTable\n  columns={[\n    { key: "name", header: "Name" },\n    { key: "email", header: "Email" },\n  ]}\n  data={[\n    { name: "Alice", email: "alice@example.com" },\n    { name: "Bob", email: "bob@example.com" },\n  ]}\n/>',
  DataGrid: '<DataGrid\n  columns={[\n    { key: "name", header: "Name" },\n    { key: "role", header: "Role" },\n    { key: "status", header: "Status" },\n  ]}\n  data={[\n    { name: "Alice", role: "Engineer", status: "Active" },\n    { name: "Bob", role: "Designer", status: "Away" },\n    { name: "Charlie", role: "Manager", status: "Active" },\n    { name: "Diana", role: "Analyst", status: "Offline" },\n  ]}\n  rowKey={(row) => row.name}\n/>',

  // ── List components ─────────────────────────────────────────────────
  List: '<List\n  items={["Dashboard", "Analytics", "Settings", "Profile", "Help"]}\n/>',
  OrderedList: '<OrderedList>\n  <ListItem>Step one</ListItem>\n  <ListItem>Step two</ListItem>\n  <ListItem>Step three</ListItem>\n</OrderedList>',
  UnorderedList: '<UnorderedList>\n  <ListItem>Feature A</ListItem>\n  <ListItem>Feature B</ListItem>\n  <ListItem>Feature C</ListItem>\n</UnorderedList>',
  DefinitionList: '<DefinitionList\n  items={[\n    { term: "HTML", description: "HyperText Markup Language" },\n    { term: "CSS", description: "Cascading Style Sheets" },\n  ]}\n/>',

  // ── Misc display ────────────────────────────────────────────────────
  Quote: '<Quote cite="Alan Kay">The best way to predict the future is to invent it.</Quote>',
  Blockquote: '<Blockquote cite="Alan Kay">The best way to predict the future is to invent it.</Blockquote>',
  Clipboard: '<Clipboard text="npm install voidframe-ui" label="Install command" />',
  RelativeTime: '<RelativeTime date={new Date(Date.now() - 3600000)} />',
  Countdown: '<Countdown target={new Date(Date.now() + 86400000)} format="hms" />',
  ThemeSelector: '<ThemeSelector\n  value="dark"\n  onValueChange={() => {}}\n  themes={[\n    { id: "dark", label: "Dark" },\n    { id: "light", label: "Light" },\n  ]}\n/>',
  Shortcut: '<div style={{ display: "flex", gap: 8, alignItems: "center" }}>\n  <Text size="sm">Press</Text>\n  <Shortcut keys="mod+k" />\n  <Text size="sm">to search</Text>\n</div>',
  ScrollIndicator: '<Progress value={45} max={100} size="sm" style={{ height: 3 }} />',
  BackToTop: '<div style={{ position: "relative", height: 40 }}>\n  <Button size="sm" style={{ position: "absolute", insetInlineEnd: 0, bottom: 0 }} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>&#8593; Top</Button>\n</div>',
  PrintButton: '<PrintButton />',
  ShareButton: '<ShareButton title="Voidframe" text="Check out this UI framework" />',
  Pill: '<div style={{ display: "flex", gap: 8 }}>\n  <Pill>Default</Pill>\n  <Pill variant="subtle">Accent</Pill>\n  <Pill variant="success">Success</Pill>\n</div>',
  ColorSwatch: '<div style={{ display: "flex", gap: 8 }}>\n  <ColorSwatch color="#4ade80" />\n  <ColorSwatch color="#3b82f6" />\n  <ColorSwatch color="#f59e0b" />\n</div>',
  QRCode: '<QRCode value="https://voidframe.dev" size={120} />',
  Barcode: '<Barcode value="1234567890" />',
  Calendar: '<Calendar onRangeChange={() => {}} />',
  MiniCalendar: '<MiniCalendar onValueChange={() => {}} />',
  CronBuilder: '<CronBuilder value="0 * * * *" onValueChange={() => {}} />',
  TokenDisplay: '<TokenDisplay tokens={["Hello", " ", "world", "!"]} />',
  Heatmap: '<Heatmap\n  rows={["AM", "PM"]}\n  columns={["Mon", "Tue", "Wed", "Thu", "Fri"]}\n  data={[\n    { x: "Mon", y: "AM", value: 5 },\n    { x: "Mon", y: "PM", value: 12 },\n    { x: "Tue", y: "AM", value: 8 },\n    { x: "Tue", y: "PM", value: 15 },\n    { x: "Wed", y: "AM", value: 3 },\n    { x: "Wed", y: "PM", value: 20 },\n    { x: "Thu", y: "AM", value: 10 },\n    { x: "Thu", y: "PM", value: 7 },\n    { x: "Fri", y: "AM", value: 14 },\n    { x: "Fri", y: "PM", value: 18 },\n  ]}\n/>',
  Sparkline: '<div style={{ display: "flex", gap: 16, alignItems: "center" }}>\n  <Text size="sm">Revenue</Text>\n  <Sparkline data={[10, 25, 18, 35, 28, 32, 40]} width={120} height={30} />\n</div>',
  Chart: '<BarChart\n  data={[\n    { category: "Mon", v: 12 },\n    { category: "Tue", v: 22 },\n    { category: "Wed", v: 18 },\n  ]}\n  series={[{ key: "v", label: "Value" }]}\n  width={300}\n  height={150}\n/>',
  TreeView: '<TreeView\n  items={[\n    { id: "src", label: "src", children: [\n      { id: "components", label: "components", children: [\n        { id: "Button", label: "Button.tsx" },\n        { id: "Input", label: "Input.tsx" },\n      ]},\n      { id: "index", label: "index.ts" },\n    ]},\n    { id: "package", label: "package.json" },\n  ]}\n/>',
  Kanban: '<Kanban\n  columns={[\n    { id: "todo", title: "To Do" },\n    { id: "doing", title: "In Progress" },\n    { id: "done", title: "Done" },\n  ]}\n  items={[\n    { id: "1", columnId: "todo", title: "Design review" },\n    { id: "2", columnId: "todo", title: "Write tests" },\n    { id: "3", columnId: "doing", title: "Build API" },\n    { id: "4", columnId: "done", title: "Deploy v1" },\n  ]}\n  renderItem={(item) => <Card style={{ padding: 8 }}><Text size="sm">{item.title}</Text></Card>}\n/>',
  SortableList: '<Text size="sm" color="var(--vf-text-3)">SortableList provides drag-and-drop reordering. Requires items and onReorder props.</Text>',
  DragHandle: '<Text size="sm" color="var(--vf-text-3)">DragHandle is the grab icon for sortable/draggable items.</Text>',
  Toolbar: '<Toolbar>\n  <Button size="sm">Bold</Button>\n  <Button size="sm">Italic</Button>\n  <Divider orientation="vertical" />\n  <Button size="sm">Link</Button>\n</Toolbar>',

  // ── Resizable ───────────────────────────────────────────────────────
  ResizableGroup: '<ResizableGroup direction="horizontal" style={{ height: 100, border: "1px solid var(--vf-border-1)" }}>\n  <ResizablePanel defaultSize={50}>\n    <div style={{ padding: 8, height: "100%" }}><Text size="sm">Left panel</Text></div>\n  </ResizablePanel>\n  <ResizableHandle />\n  <ResizablePanel defaultSize={50}>\n    <div style={{ padding: 8, height: "100%" }}><Text size="sm">Right panel</Text></div>\n  </ResizablePanel>\n</ResizableGroup>',

  // ── Misc utility components ─────────────────────────────────────────
  Overlay: '<Text size="sm" color="var(--vf-text-3)">Overlay renders a semi-transparent backdrop. Used internally by Modal and Drawer.</Text>',
  Backdrop: '<div style={{ position: "relative", height: 100 }}>\n  <Text>Content behind backdrop</Text>\n  <Backdrop visible style={{ position: "absolute" }} />\n</div>',
  ClickOutside: '<Text size="sm" color="var(--vf-text-3)">ClickOutside detects clicks outside its children and calls onClickOutside.</Text>',
  Transition: 'function Example() {\n  const [show, setShow] = useState(true);\n  return (\n    <VStack gap={8}>\n      <Button onClick={() => setShow(!show)}>{show ? "Hide" : "Show"}</Button>\n      <Transition show={show} type="fade">\n        <div style={{ padding: 16, background: "var(--vf-bg-3)", border: "1px solid var(--vf-border-1)" }}>Animated content</div>\n      </Transition>\n    </VStack>\n  );\n}\nrender(<Example />);',
  Collapse: '<Text size="sm" color="var(--vf-text-3)">Collapse animates height between 0 and auto for show/hide transitions.</Text>',
  FadeIn: '<FadeIn>\n  <Text>This content fades in on mount</Text>\n</FadeIn>',
  SlideIn: '<SlideIn direction="left">\n  <Text>This content slides in from the left</Text>\n</SlideIn>',
  ScaleIn: '<ScaleIn>\n  <Text>This content scales in on mount</Text>\n</ScaleIn>',
  Affix: '<Text size="sm" color="var(--vf-text-3)">Affix pins an element to a fixed position on scroll.</Text>',
  Sticky: '<div style={{ height: 120, overflow: "auto", border: "1px solid var(--vf-border-1)" }}>\n  <Sticky style={{ padding: 8, background: "var(--vf-bg-2)", borderBottom: "1px solid var(--vf-border-1)" }}>\n    <Text size="sm" style={{ fontWeight: 600 }}>Sticky header (scroll down)</Text>\n  </Sticky>\n  <VStack gap={4} style={{ padding: 8 }}>\n    {Array.from({ length: 15 }, (_, i) => <Text key={i} size="sm">Content row {i + 1}</Text>)}\n  </VStack>\n</div>',
  ResponsiveContainer: '<Text size="sm" color="var(--vf-text-3)">ResponsiveContainer provides breakpoint-aware rendering for adaptive layouts.</Text>',
  Show: '<Show when={true}>\n  <Text>Conditionally rendered content</Text>\n</Show>',
  Hide: 'function Example() {\n  const [hidden, setHidden] = useState(false);\n  return (\n    <VStack gap={8}>\n      <Button size="sm" onClick={() => setHidden(!hidden)}>{hidden ? "Show" : "Hide"} content</Button>\n      {!hidden && <div style={{ padding: 12, background: "var(--vf-bg-3)", border: "1px solid var(--vf-border-1)" }}>This content can be hidden</div>}\n    </VStack>\n  );\n}\nrender(<Example />);',
  MediaQuery: '<Text size="sm" color="var(--vf-text-3)">MediaQuery renders children only when a CSS media query matches.</Text>',
  Measure: '<Text size="sm" color="var(--vf-text-3)">Measure reports its bounding rect to a callback. Used for dynamic layout calculations.</Text>',
  CopyToClipboard: '<CopyToClipboard text="Copied text!"><Button size="sm">Copy</Button></CopyToClipboard>',

  // ── Layout (additional) ────────────────────────────────────────────
  GridItem: '<Grid cols={3} gap={8}>\n  <GridItem span={2} style={{ padding: 8, background: "var(--vf-bg-3)" }}>Span 2</GridItem>\n  <GridItem style={{ padding: 8, background: "var(--vf-bg-3)" }}>Span 1</GridItem>\n</Grid>',
  Masonry: '<Masonry columns={3} gap={8}>\n  <div style={{ padding: 12, background: "var(--vf-bg-3)", height: 60 }}>Short</div>\n  <div style={{ padding: 12, background: "var(--vf-bg-3)", height: 100 }}>Tall</div>\n  <div style={{ padding: 12, background: "var(--vf-bg-3)", height: 40 }}>Small</div>\n  <div style={{ padding: 12, background: "var(--vf-bg-3)", height: 80 }}>Medium</div>\n  <div style={{ padding: 12, background: "var(--vf-bg-3)", height: 60 }}>Short</div>\n  <div style={{ padding: 12, background: "var(--vf-bg-3)", height: 120 }}>Tallest</div>\n</Masonry>',
  ResizableBox: '<div style={{ width: 200, height: 100, border: "2px dashed var(--vf-border-2)", padding: 8, resize: "both", overflow: "auto" }}>\n  <Text size="sm">Drag corner to resize</Text>\n</div>',
  ResponsiveBox: '<ResponsiveBox display={{ base: "block", md: "flex" }} gap={8}>\n  <div style={{ padding: 8, background: "var(--vf-bg-3)", flex: 1 }}>Panel A</div>\n  <div style={{ padding: 8, background: "var(--vf-bg-3)", flex: 1 }}>Panel B</div>\n</ResponsiveBox>',
  SafeArea: '<SafeArea style={{ padding: 8, border: "1px solid var(--vf-border-1)" }}>\n  <Text size="sm">Content with safe-area padding for mobile notches</Text>\n</SafeArea>',
  Section: '<Section style={{ padding: 12, border: "1px solid var(--vf-border-1)" }}>\n  <VStack gap={8}>\n    <Text size="lg" style={{ fontWeight: 700 }}>Section Title</Text>\n    <Text size="sm">Section content with semantic HTML structure.</Text>\n  </VStack>\n</Section>',
  EmptyLayout: '<EmptyLayout style={{ height: 100, border: "1px dashed var(--vf-border-2)" }}>\n  <Text>Full-screen layout wrapper</Text>\n</EmptyLayout>',

  // ── Navigation (additional) ────────────────────────────────────────
  TabBar: 'function Example() {\n  const [tab, setTab] = useState("home");\n  return (\n    <div style={{ border: "1px solid var(--vf-border-1)", borderRadius: 0 }}>\n      <TabBar value={tab} onValueChange={setTab}>\n        <TabBar.Item value="home">\u2302 Home</TabBar.Item>\n        <TabBar.Item value="search">\u2315 Search</TabBar.Item>\n        <TabBar.Item value="profile">\u263B Profile</TabBar.Item>\n      </TabBar>\n    </div>\n  );\n}\nrender(<Example />);',
  MegaMenu: '<div style={{ border: "1px solid var(--vf-border-1)" }}>\n  <HStack gap={8} style={{ padding: "6px 12px", background: "var(--vf-bg-2)" }}>\n    <Button variant="ghost" size="sm">Products &#9662;</Button>\n    <Button variant="ghost" size="sm">Solutions &#9662;</Button>\n    <Button variant="ghost" size="sm">Resources &#9662;</Button>\n  </HStack>\n  <div style={{ padding: 12, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>\n    <VStack gap={4}><Text size="sm" style={{ fontWeight: 600 }}>Category A</Text><Text size="xs">Item 1</Text><Text size="xs">Item 2</Text></VStack>\n    <VStack gap={4}><Text size="sm" style={{ fontWeight: 600 }}>Category B</Text><Text size="xs">Item 3</Text><Text size="xs">Item 4</Text></VStack>\n    <VStack gap={4}><Text size="sm" style={{ fontWeight: 600 }}>Category C</Text><Text size="xs">Item 5</Text><Text size="xs">Item 6</Text></VStack>\n  </div>\n</div>',
  MenuBar: '<HStack gap={0} style={{ border: "1px solid var(--vf-border-1)", background: "var(--vf-bg-2)" }}>\n  <Button variant="ghost" size="sm">File</Button>\n  <Button variant="ghost" size="sm">Edit</Button>\n  <Button variant="ghost" size="sm">View</Button>\n  <Button variant="ghost" size="sm">Help</Button>\n</HStack>',
  MenuBarMenu: '<HStack gap={0} style={{ borderBottom: "1px solid var(--vf-border-1)", background: "var(--vf-bg-2)" }}>\n  <Button variant="ghost" size="sm" style={{ borderBottom: "2px solid var(--vf-accent, var(--vf-blue))" }}>File</Button>\n  <Button variant="ghost" size="sm">Edit</Button>\n</HStack>',
  ScrollSpy: '<VStack gap={4}>\n  <Anchor items={[{ key: "a", label: "Section A", href: "#a" }, { key: "b", label: "Section B", href: "#b" }]} activeKey="a" indicator="line" />\n</VStack>',
  UserMenu: '<UserMenu\n  user={{ name: "Jane Doe", email: "jane@example.com", initials: "JD" }}\n  items={[\n    { key: "profile", label: "Profile" },\n    { key: "settings", label: "Settings" },\n    { key: "logout", label: "Sign out" },\n  ]}\n  onSelect={() => {}}\n/>',

  // ── Form structure (additional) ────────────────────────────────────
  Field: '<Field label="Email address">\n  <Input placeholder="you@example.com" />\n</Field>',
  FieldSet: '<FieldSet legend="Contact Information" style={{ padding: 12, border: "1px solid var(--vf-border-1)" }}>\n  <VStack gap={8}>\n    <Input label="Name" placeholder="Jane Doe" />\n    <Input label="Email" placeholder="jane@example.com" />\n  </VStack>\n</FieldSet>',
  FormActions: '<FormActions>\n  <Button variant="ghost">Cancel</Button>\n  <Button>Submit</Button>\n</FormActions>',
  'InputGroup.Addon': '<HStack gap={0} style={{ border: "1px solid var(--vf-border-1)" }}>\n  <div style={{ padding: "4px 8px", background: "var(--vf-bg-3)", borderInlineEnd: "1px solid var(--vf-border-1)" }}><Text size="sm">@</Text></div>\n  <Input placeholder="username" style={{ border: "none" }} />\n</HStack>',
  Legend: '<Legend>Form Section Title</Legend>',
  Form: 'function Example() {\n  return (\n    <Form onSubmit={(values) => alert(JSON.stringify(values))}>\n      <VStack gap={8}>\n        <Input label="Name" name="name" placeholder="Jane Doe" />\n        <Input label="Email" name="email" placeholder="jane@example.com" />\n        <Button type="submit">Submit</Button>\n      </VStack>\n    </Form>\n  );\n}\nrender(<Example />);',

  // ── Overlays (additional) ──────────────────────────────────────────
  CoachMark: '<div style={{ position: "relative", padding: 16 }}>\n  <Button>Target Element</Button>\n  <div style={{ position: "absolute", top: -8, insetInlineStart: "100%", marginInlineStart: 8, padding: 8, background: "var(--vf-bg-3)", border: "1px solid var(--vf-border-2)", minWidth: 150 }}>\n    <Text size="sm" style={{ fontWeight: 600 }}>Step 1 of 3</Text>\n    <Text size="xs">Click this button to continue</Text>\n  </div>\n</div>',
  ConfirmDialog: 'function Example() {\n  const [open, setOpen] = useState(false);\n  return (\n    <>\n      <Button onClick={() => setOpen(true)}>Confirm Action</Button>\n      {open && <div style={{ padding: 16, border: "1px solid var(--vf-border-2)", background: "var(--vf-bg-2)", marginTop: 8 }}>\n        <Text style={{ marginBottom: 8 }}>Are you sure?</Text>\n        <HStack gap={8}><Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => setOpen(false)}>Confirm</Button></HStack>\n      </div>}\n    </>\n  );\n}\nrender(<Example />);',
  ConfirmDialogV2: 'function Example() {\n  const [open, setOpen] = useState(false);\n  return (\n    <>\n      <Button onClick={() => setOpen(true)}>Delete Item</Button>\n      {open && <div style={{ padding: 16, border: "1px solid var(--vf-red)", background: "var(--vf-bg-2)", marginTop: 8 }}>\n        <Text style={{ fontWeight: 600, marginBottom: 4 }}>Delete permanently?</Text>\n        <Text size="sm" style={{ marginBottom: 8, color: "var(--vf-text-3)" }}>This cannot be undone.</Text>\n        <HStack gap={8}><Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button style={{ "--vf-accent": "var(--vf-red)" }} onClick={() => setOpen(false)}>Delete</Button></HStack>\n      </div>}\n    </>\n  );\n}\nrender(<Example />);',
  HoverCard: 'function Example() {\n  return (\n    <HoverCard\n      trigger={<Button variant="ghost">Hover me</Button>}\n    >\n      <VStack gap={4} style={{ padding: 8 }}>\n        <Text size="sm" style={{ fontWeight: 600 }}>Jane Doe</Text>\n        <Text size="xs" color="var(--vf-text-3)">Engineer at Voidframe</Text>\n      </VStack>\n    </HoverCard>\n  );\n}\nrender(<Example />);',
  OfflineBanner: '<VStack gap={8}>\n  <Text size="sm" color="var(--vf-text-3)">OfflineBanner only renders when the browser is offline. Simulate by toggling DevTools network mode. The banner below is a static preview:</Text>\n  <div role="alert" style={{ padding: "8px 12px", background: "var(--vf-bg-3)", border: "1px solid var(--vf-amber)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>\n    <Text size="sm">You are offline.</Text>\n    <Button variant="ghost" size="sm">Dismiss</Button>\n  </div>\n</VStack>',
  Snackbar: '<div style={{ padding: 12, background: "var(--vf-bg-3)", border: "1px solid var(--vf-border-1)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>\n  <Text size="sm">Item saved successfully</Text>\n  <Button variant="ghost" size="sm">Undo</Button>\n</div>',

  // ── Media (additional) ─────────────────────────────────────────────
  LegalText: '<LegalText>Copyright 2026 Voidframe. All rights reserved. MIT License.</LegalText>',

  // ── Data (additional) ──────────────────────────────────────────────
  Activity: '<Activity>\n  <Activity.Item actor="Alice" action="created" target="Project Alpha" time="2 hours ago" />\n  <Activity.Item actor="Bob" action="commented on" target="Issue #42" time="1 hour ago" />\n  <Activity.Item actor="Charlie" action="merged" target="PR #18" time="30 min ago" />\n</Activity>',
  CommentList: '<CommentList>\n  <Comment author="Alice" content="Great work!" datetime="2 hours ago" />\n  <Comment author="Bob" content="Thanks!" datetime="1 hour ago" />\n</CommentList>',
  StatGroup: '<StatGroup>\n  <Stat label="Users" value="12,847" change={12.5} />\n  <Stat label="Revenue" value="48K" change={-3.2} />\n  <Stat label="Orders" value="1,024" />\n</StatGroup>',

  // ── Icons (additional) ─────────────────────────────────────────────
  IconGroup: '<IconGroup>\n  <IconButton aria-label="Bold"><Text>B</Text></IconButton>\n  <IconButton aria-label="Italic"><Text>I</Text></IconButton>\n  <IconButton aria-label="Underline"><Text>U</Text></IconButton>\n</IconGroup>',
  Identicon: '<div style={{ display: "flex", gap: 8 }}>\n  <Identicon value="user-123" size={40} />\n  <Identicon value="user-456" size={40} />\n  <Identicon value="user-789" size={40} />\n</div>',
  PrintLayout: '<PrintLayout>\n  <VStack gap={8}>\n    <Text size="lg" style={{ fontWeight: 700 }}>Print-Optimized Content</Text>\n    <Text size="sm">This wrapper applies print-friendly CSS when the page is printed.</Text>\n  </VStack>\n</PrintLayout>',
  ShortcutGuide: '<VStack gap={4} style={{ border: "1px solid var(--vf-border-1)", padding: 12, maxWidth: 300 }}>\n  <Text size="sm" style={{ fontWeight: 600 }}>Keyboard Shortcuts</Text>\n  <Divider />\n  <HStack style={{ justifyContent: "space-between" }}><Text size="xs">Search</Text><HStack gap={2}><Kbd>Ctrl</Kbd><Kbd>K</Kbd></HStack></HStack>\n  <HStack style={{ justifyContent: "space-between" }}><Text size="xs">Save</Text><HStack gap={2}><Kbd>Ctrl</Kbd><Kbd>S</Kbd></HStack></HStack>\n  <HStack style={{ justifyContent: "space-between" }}><Text size="xs">Close</Text><Kbd>Esc</Kbd></HStack>\n</VStack>',
  WidgetShell: '<WidgetShell title="Active Users" actions={<Button size="sm" variant="ghost">Refresh</Button>}>\n  <VStack gap={4}>\n    <Stat label="Online Now" value="1,234" />\n    <Progress value={72} max={100} size="sm" />\n  </VStack>\n</WidgetShell>',

  // ── Chat (additional) ──────────────────────────────────────────────
  AgentRunner: '<VStack gap={8} style={{ border: "1px solid var(--vf-border-1)", padding: 12 }}>\n  <HStack gap={8}><Spinner size="sm" /><Text size="sm">Thinking...</Text></HStack>\n  <div style={{ padding: 8, background: "var(--vf-bg-2)", border: "1px solid var(--vf-border-0)" }}>\n    <Text size="xs" color="var(--vf-text-3)">Tool: search_database</Text>\n    <Text size="sm">Found 42 matching records</Text>\n  </div>\n  <Text size="sm">Based on the results, here are the top items...</Text>\n</VStack>',
  AgentTrace: '<VStack gap={4} style={{ border: "1px solid var(--vf-border-1)", padding: 8 }}>\n  <HStack gap={4}><Badge tone="info" size="sm">Think</Badge><Text size="xs">Analyzing the query...</Text></HStack>\n  <HStack gap={4}><Badge tone="success" size="sm">Tool</Badge><Text size="xs">search_db({" query: users "})</Text></HStack>\n  <HStack gap={4}><Badge tone="info" size="sm">Think</Badge><Text size="xs">Found results, formatting response</Text></HStack>\n  <HStack gap={4}><Badge size="sm">Reply</Badge><Text size="xs">Here are the results...</Text></HStack>\n</VStack>',
  AttachmentList: '<AttachmentList>\n  <ImageAttachment src="data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'120\' height=\'80\'%3E%3Crect fill=\'%231a1a1a\' width=\'120\' height=\'80\'/%3E%3Ctext fill=\'%23666\' x=\'50%25\' y=\'50%25\' dominant-baseline=\'middle\' text-anchor=\'middle\' font-family=\'monospace\' font-size=\'12\'%3EPhoto%3C/text%3E%3C/svg%3E" alt="Photo" />\n  <ComposerAttachment name="report.pdf" kind="pdf" />\n</AttachmentList>',
  ChatLayout: '<div style={{ display: "grid", gridTemplateColumns: "160px 1fr", height: 150, border: "1px solid var(--vf-border-1)" }}>\n  <div style={{ borderInlineEnd: "1px solid var(--vf-border-1)", padding: 8, background: "var(--vf-bg-1)" }}>\n    <Text size="xs" style={{ fontWeight: 600, marginBottom: 8 }}>Sessions</Text>\n    <VStack gap={2}>\n      <Text size="xs" style={{ padding: 4, background: "var(--vf-bg-3)" }}>Chat 1</Text>\n      <Text size="xs" style={{ padding: 4 }}>Chat 2</Text>\n    </VStack>\n  </div>\n  <VStack style={{ padding: 8, justifyContent: "space-between" }}>\n    <VStack gap={4}>\n      <Text size="sm">Hello! How can I help?</Text>\n    </VStack>\n    <Input placeholder="Type a message..." size="sm" />\n  </VStack>\n</div>',
  Composer: '<div style={{ border: "1px solid var(--vf-border-1)", padding: 8 }}>\n  <Textarea placeholder="Type your message..." style={{ minHeight: 60, marginBottom: 8 }} />\n  <HStack style={{ justifyContent: "space-between" }}>\n    <HStack gap={4}><Button variant="ghost" size="sm">Attach</Button><Button variant="ghost" size="sm">Format</Button></HStack>\n    <Button size="sm">Send</Button>\n  </HStack>\n</div>',
  ComposerAttachment: '<ComposerAttachment name="design-spec.pdf" kind="pdf" />',
  ImageAttachment: '<ImageAttachment\n  src="data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'120\' height=\'80\'%3E%3Crect fill=\'%231a1a1a\' width=\'120\' height=\'80\'/%3E%3Ctext fill=\'%23666\' x=\'50%25\' y=\'50%25\' dominant-baseline=\'middle\' text-anchor=\'middle\' font-family=\'monospace\' font-size=\'12\'%3EPreview%3C/text%3E%3C/svg%3E"\n  alt="Preview"\n  name="screenshot.png"\n/>',
  SimpleChat: '<VStack style={{ height: 150, border: "1px solid var(--vf-border-1)" }}>\n  <VStack gap={4} style={{ flex: 1, padding: 8, overflow: "auto" }}>\n    <div style={{ alignSelf: "start", padding: "4px 8px", background: "var(--vf-bg-3)", maxWidth: "70%" }}><Text size="sm">How do I install voidframe-ui?</Text></div>\n    <div style={{ alignSelf: "end", padding: "4px 8px", background: "var(--vf-bg-2)", borderInlineStart: "2px solid var(--vf-blue)", maxWidth: "70%" }}><Text size="sm">Run npm install voidframe-ui</Text></div>\n  </VStack>\n  <div style={{ padding: 8, borderTop: "1px solid var(--vf-border-1)" }}><Input placeholder="Type a message..." size="sm" /></div>\n</VStack>',
  SourceCard: '<SourceCard\n  title="React Documentation"\n  url="https://react.dev"\n  snippet="The library for web and native user interfaces"\n/>',
  ToolCallGroup: '<VStack gap={4} style={{ border: "1px solid var(--vf-border-1)", padding: 8 }}>\n  <HStack gap={4}><Badge tone="success" size="sm">Done</Badge><Text size="sm">search_db</Text></HStack>\n  <HStack gap={4}><Badge tone="success" size="sm">Done</Badge><Text size="sm">format_results</Text></HStack>\n  <HStack gap={4}><Spinner size="sm" /><Text size="sm">generate_report</Text></HStack>\n</VStack>',
  UnreadBadge: '<UnreadBadge count={7} />',
  MessageActions: '<HStack gap={4}>\n  <Button variant="ghost" size="sm">Copy</Button>\n  <Button variant="ghost" size="sm">Edit</Button>\n  <Button variant="ghost" size="sm">Regenerate</Button>\n  <Button variant="ghost" size="sm">Delete</Button>\n</HStack>',
  MessageGroup: '<VStack gap={2} style={{ borderInlineStart: "2px solid var(--vf-border-1)", paddingInlineStart: 8 }}>\n  <Text size="xs" color="var(--vf-text-3)">Assistant</Text>\n  <Text size="sm">First message in group</Text>\n  <Text size="sm">Second message (same author)</Text>\n</VStack>',

  // ── Gestures ───────────────────────────────────────────────────────
  DragDropContext: '<DragDropContext onDragEnd={() => {}}>\n  <VStack gap={4} style={{ border: "1px solid var(--vf-border-1)", padding: 8 }}>\n    <Draggable id="item-1">\n      {({ dragRef, dragHandleProps }) => (\n        <div ref={dragRef} {...dragHandleProps} style={{ padding: 8, background: "var(--vf-bg-3)", cursor: "grab", border: "1px solid var(--vf-border-0)" }}>\u2630 Draggable Item 1</div>\n      )}\n    </Draggable>\n    <Draggable id="item-2">\n      {({ dragRef, dragHandleProps }) => (\n        <div ref={dragRef} {...dragHandleProps} style={{ padding: 8, background: "var(--vf-bg-3)", cursor: "grab", border: "1px solid var(--vf-border-0)" }}>\u2630 Draggable Item 2</div>\n      )}\n    </Draggable>\n  </VStack>\n</DragDropContext>',
  Swipeable: '<Swipeable onSwipeLeft={() => {}} onSwipeRight={() => {}} style={{ padding: 24, border: "1px dashed var(--vf-border-2)", textAlign: "center" }}>\n  <Text size="sm">Swipe left or right (touch/mobile)</Text>\n</Swipeable>',
  SwipeActions: '<div style={{ position: "relative", overflow: "hidden" }}>\n  <div style={{ padding: 12, background: "var(--vf-bg-2)", border: "1px solid var(--vf-border-1)", display: "flex", justifyContent: "space-between" }}>\n    <Text size="sm">Swipe this item</Text>\n    <Text size="xs" color="var(--vf-text-3)">&#8592; swipe</Text>\n  </div>\n  <div style={{ position: "absolute", insetInlineEnd: 0, top: 0, bottom: 0, display: "flex" }}>\n    <div style={{ padding: "0 12px", background: "var(--vf-red)", display: "flex", alignItems: "center" }}><Text size="xs" color="#fff">Delete</Text></div>\n  </div>\n</div>',

  // ── Misc (additional) ──────────────────────────────────────────────
  ThemeScope: '<ThemeScope themeName="midnight">\n  <VStack gap={4} style={{ padding: 12, background: "var(--vf-bg-2)" }}>\n    <Text>This subtree has overridden theme tokens</Text>\n    <Badge tone="success">Custom green</Badge>\n  </VStack>\n</ThemeScope>',
  AsyncData: 'function Example() {\n  const [status, setStatus] = useState("success");\n  return (\n    <VStack gap={8}>\n      <HStack gap={4}>\n        <Button size="sm" onClick={() => setStatus("loading")}>Loading</Button>\n        <Button size="sm" onClick={() => setStatus("success")}>Success</Button>\n        <Button size="sm" onClick={() => setStatus("error")}>Error</Button>\n      </HStack>\n      <AsyncData\n        status={status}\n        data="Loaded content!"\n        error="Something went wrong"\n        loading={<Spinner />}\n        renderError={(err) => <Text color="var(--vf-red)">{String(err)}</Text>}\n      >\n        {(data) => <Text>{data}</Text>}\n      </AsyncData>\n    </VStack>\n  );\n}\nrender(<Example />);',
  RovingFocusGroup: '<div role="group" style={{ display: "flex", gap: 4 }}>\n  <Button size="sm">Item 1</Button>\n  <Button size="sm">Item 2</Button>\n  <Button size="sm">Item 3</Button>\n</div>',

  // ── Chart components (separate entry point) ─────────────────────────
  Arc: '<PieChart\n  data={[{ key: "a", value: 60, label: "Done" }, { key: "b", value: 40, label: "Left" }]}\n  size={120}\n/>',
  Area: '<AreaChart\n  data={[{ x: 0, y: 5 }, { x: 1, y: 12 }, { x: 2, y: 8 }, { x: 3, y: 18 }]}\n  series={[{ key: "y" }]}\n  width={200}\n  height={80}\n/>',
  AreaChart: '<AreaChart\n  data={[\n    { x: 0, revenue: 10 },\n    { x: 1, revenue: 25 },\n    { x: 2, revenue: 18 },\n    { x: 3, revenue: 35 },\n    { x: 4, revenue: 28 },\n  ]}\n  series={[{ key: "revenue", label: "Revenue" }]}\n  width={400}\n  height={200}\n/>',
  Axis: '<BarChart\n  data={[{ category: "A", v: 10 }, { category: "B", v: 20 }, { category: "C", v: 15 }]}\n  series={[{ key: "v" }]}\n  width={200}\n  height={100}\n/>',
  Bar: '<BarChart\n  data={[{ category: "X", v: 30 }, { category: "Y", v: 50 }, { category: "Z", v: 40 }]}\n  series={[{ key: "v" }]}\n  width={200}\n  height={100}\n/>',
  BarChart: '<BarChart\n  data={[\n    { category: "Mon", visits: 120 },\n    { category: "Tue", visits: 220 },\n    { category: "Wed", visits: 180 },\n    { category: "Thu", visits: 300 },\n    { category: "Fri", visits: 260 },\n  ]}\n  series={[{ key: "visits", label: "Visits" }]}\n  width={400}\n  height={200}\n/>',
  BoxPlot: '<BoxPlot\n  groups={[\n    { key: "a", label: "Group A", values: [12, 15, 18, 20, 22, 25, 28, 30, 35, 40, 55] },\n    { key: "b", label: "Group B", values: [8, 10, 14, 16, 18, 20, 22, 24, 26, 30] },\n    { key: "c", label: "Group C", values: [20, 25, 28, 30, 32, 35, 38, 42, 45, 48, 50] },\n  ]}\n  width={400}\n  height={200}\n/>',
  Brush: '<LineChart\n  data={[{ x: 0, y: 10 }, { x: 1, y: 18 }, { x: 2, y: 14 }, { x: 3, y: 22 }, { x: 4, y: 19 }]}\n  series={[{ key: "y" }]}\n  width={300}\n  height={120}\n/>',
  BubbleChart: '<BubbleChart\n  data={[\n    { x: 10, y: 20, size: 8 },\n    { x: 25, y: 35, size: 15 },\n    { x: 15, y: 28, size: 5 },\n    { x: 30, y: 45, size: 20 },\n    { x: 20, y: 15, size: 12 },\n  ]}\n  width={400}\n  height={200}\n/>',
  BubbleMap: '<TileGridMap\n  cells={[\n    { id: "CA", label: "CA", col: 0, row: 1 },\n    { id: "TX", label: "TX", col: 2, row: 2 },\n    { id: "FL", label: "FL", col: 4, row: 2 },\n  ]}\n  values={{ CA: 39, TX: 29, FL: 22 }}\n  tileSize={44}\n/>',
  CalendarHeatmap: 'function Example() {\n  const start = new Date(2025, 0, 1);\n  const end = new Date(2025, 2, 31);\n  const data = Array.from({ length: 90 }, (_, i) => ({\n    date: new Date(2025, 0, i + 1),\n    value: Math.floor(Math.random() * 10),\n  }));\n  return <CalendarHeatmap start={start} end={end} data={data} />;\n}\nrender(<Example />);',
  CandlestickChart: '<CandlestickChart\n  data={[\n    { x: "Jan", open: 100, high: 115, low: 95, close: 110 },\n    { x: "Feb", open: 110, high: 120, low: 105, close: 108 },\n    { x: "Mar", open: 108, high: 125, low: 100, close: 122 },\n    { x: "Apr", open: 122, high: 130, low: 118, close: 125 },\n    { x: "May", open: 125, high: 135, low: 115, close: 118 },\n  ]}\n  width={400}\n  height={220}\n/>',
  ChartFrame: '<BarChart\n  data={[{ category: "Q1", v: 40 }, { category: "Q2", v: 65 }, { category: "Q3", v: 55 }]}\n  series={[{ key: "v", label: "Sales" }]}\n  width={300}\n  height={150}\n/>',
  ChartLegend: '<ChartLegend\n  items={[\n    { key: "a", label: "Revenue", color: "var(--vf-green)" },\n    { key: "b", label: "Expenses", color: "var(--vf-red)" },\n    { key: "c", label: "Profit", color: "var(--vf-blue)" },\n  ]}\n/>',
  ChartTooltip: '<LineChart\n  data={[{ x: 0, y: 8 }, { x: 1, y: 20 }, { x: 2, y: 14 }, { x: 3, y: 25 }]}\n  series={[{ key: "y", label: "Value" }]}\n  width={300}\n  height={120}\n/>',
  ChartTooltipBody: '<LineChart\n  data={[{ x: 0, y: 8 }, { x: 1, y: 20 }, { x: 2, y: 14 }, { x: 3, y: 25 }]}\n  series={[{ key: "y", label: "Value" }]}\n  width={300}\n  height={120}\n/>',
  ChordDiagram: '<ChordDiagram\n  groups={[\n    { key: "a", label: "Email" },\n    { key: "b", label: "Social" },\n    { key: "c", label: "Search" },\n    { key: "d", label: "Direct" },\n  ]}\n  matrix={[\n    [0, 20, 10, 5],\n    [15, 0, 8, 12],\n    [5, 10, 0, 18],\n    [8, 6, 14, 0],\n  ]}\n  size={280}\n/>',
  ChoroplethMap: '<TileGridMap\n  cells={[\n    { id: "CA", label: "CA", col: 0, row: 1 },\n    { id: "TX", label: "TX", col: 2, row: 2 },\n    { id: "NY", label: "NY", col: 4, row: 0 },\n  ]}\n  values={{ CA: 39, TX: 29, NY: 20 }}\n  tileSize={44}\n/>',
  ComposedChart: '<ComposedChart\n  data={[\n    { x: "Jan", revenue: 40, users: 12 },\n    { x: "Feb", revenue: 55, users: 18 },\n    { x: "Mar", revenue: 48, users: 15 },\n    { x: "Apr", revenue: 70, users: 24 },\n    { x: "May", revenue: 65, users: 22 },\n  ]}\n  series={[\n    { key: "revenue", type: "bar", label: "Revenue" },\n    { key: "users", type: "line", label: "Users" },\n  ]}\n  xKind="category"\n  width={400}\n  height={220}\n/>',
  Crosshair: '<LineChart\n  data={[{ x: 0, y: 10 }, { x: 1, y: 18 }, { x: 2, y: 14 }, { x: 3, y: 22 }]}\n  series={[{ key: "y" }]}\n  width={300}\n  height={120}\n/>',
  DependencyGraph: '<DependencyGraph\n  nodes={[\n    { id: "app", label: "App" },\n    { id: "api", label: "API" },\n    { id: "db", label: "Database" },\n    { id: "cache", label: "Cache" },\n    { id: "auth", label: "Auth" },\n  ]}\n  edges={[\n    { source: "app", target: "api" },\n    { source: "api", target: "db" },\n    { source: "api", target: "cache" },\n    { source: "api", target: "auth" },\n    { source: "auth", target: "db" },\n  ]}\n/>',
  DonutChart: '<DonutChart\n  data={[\n    { key: "used", value: 72, label: "Used" },\n    { key: "free", value: 28, label: "Free" },\n  ]}\n  size={200}\n/>',
  FunnelChart: '<FunnelChart\n  steps={[\n    { key: "visit", label: "Visitors", value: 10000 },\n    { key: "signup", label: "Signups", value: 5200 },\n    { key: "trial", label: "Trials", value: 2800 },\n    { key: "paid", label: "Paid", value: 1200 },\n  ]}\n  width={400}\n  height={240}\n/>',
  Gridlines: '<BarChart\n  data={[{ category: "A", v: 30 }, { category: "B", v: 50 }, { category: "C", v: 40 }]}\n  series={[{ key: "v" }]}\n  width={300}\n  height={150}\n/>',
  Histogram: '<Histogram\n  values={[12, 15, 18, 20, 22, 22, 24, 25, 27, 28, 30, 30, 31, 33, 35, 38, 40, 42, 45, 50, 55, 60]}\n  bins={8}\n  width={400}\n  height={200}\n/>',
  HorizonChart: '<HorizonChart\n  data={[\n    { x: 0, y: 5 },\n    { x: 1, y: 12 },\n    { x: 2, y: -3 },\n    { x: 3, y: 18 },\n    { x: 4, y: -8 },\n    { x: 5, y: 15 },\n    { x: 6, y: 7 },\n    { x: 7, y: -2 },\n    { x: 8, y: 20 },\n    { x: 9, y: 10 },\n  ]}\n  width={400}\n  height={60}\n/>',
  Line: '<LineChart\n  data={[{ x: 0, y: 5 }, { x: 1, y: 15 }, { x: 2, y: 10 }, { x: 3, y: 20 }]}\n  series={[{ key: "y" }]}\n  width={200}\n  height={80}\n/>',
  LineChart: '<LineChart\n  data={[\n    { x: 0, temp: 10 },\n    { x: 1, temp: 25 },\n    { x: 2, temp: 18 },\n    { x: 3, temp: 35 },\n    { x: 4, temp: 28 },\n  ]}\n  series={[{ key: "temp", label: "Temperature" }]}\n  width={400}\n  height={200}\n/>',
  NetworkGraph: '<NetworkGraph\n  nodes={[\n    { id: "a", label: "API" },\n    { id: "b", label: "Auth" },\n    { id: "c", label: "DB" },\n    { id: "d", label: "Cache" },\n    { id: "e", label: "Worker" },\n  ]}\n  links={[\n    { source: "a", target: "b" },\n    { source: "a", target: "c" },\n    { source: "a", target: "d" },\n    { source: "b", target: "c" },\n    { source: "e", target: "c" },\n    { source: "e", target: "d" },\n  ]}\n  width={400}\n  height={280}\n/>',
  OHLCChart: '<CandlestickChart\n  variant="ohlc"\n  data={[\n    { x: "Jan", open: 100, high: 115, low: 95, close: 110 },\n    { x: "Feb", open: 110, high: 120, low: 105, close: 108 },\n    { x: "Mar", open: 108, high: 125, low: 100, close: 122 },\n    { x: "Apr", open: 122, high: 130, low: 118, close: 125 },\n    { x: "May", open: 125, high: 135, low: 115, close: 118 },\n  ]}\n  width={400}\n  height={220}\n/>',
  ParallelCoordinates: '<ParallelCoordinates\n  data={[\n    { id: 1, values: { speed: 80, power: 65, range: 90, defense: 45 }, label: "Unit A" },\n    { id: 2, values: { speed: 50, power: 85, range: 60, defense: 80 }, label: "Unit B" },\n    { id: 3, values: { speed: 70, power: 70, range: 75, defense: 60 }, label: "Unit C" },\n  ]}\n  axes={[\n    { key: "speed", label: "Speed" },\n    { key: "power", label: "Power" },\n    { key: "range", label: "Range" },\n    { key: "defense", label: "Defense" },\n  ]}\n  width={400}\n  height={220}\n/>',
  PieChart: '<PieChart\n  data={[\n    { key: "react", value: 45, label: "React" },\n    { key: "vue", value: 25, label: "Vue" },\n    { key: "angular", value: 20, label: "Angular" },\n    { key: "svelte", value: 10, label: "Svelte" },\n  ]}\n  size={220}\n/>',
  Point: '<ScatterPlot\n  data={[{ x: 5, y: 10 }, { x: 15, y: 25 }, { x: 10, y: 18 }, { x: 20, y: 30 }]}\n  width={200}\n  height={100}\n/>',
  RadarChart: '<RadarChart\n  axes={["Speed", "Power", "Range", "Defense", "Magic"]}\n  series={[{ key: "hero", label: "Hero", values: [80, 65, 90, 45, 70] }]}\n  size={280}\n/>',
  ReferenceBand: '<AreaChart\n  data={[{ x: 0, y: 10 }, { x: 1, y: 20 }, { x: 2, y: 15 }, { x: 3, y: 25 }]}\n  series={[{ key: "y" }]}\n  width={300}\n  height={120}\n/>',
  ReferenceLine: '<LineChart\n  data={[{ x: 0, y: 10 }, { x: 1, y: 20 }, { x: 2, y: 15 }, { x: 3, y: 25 }]}\n  series={[{ key: "y" }]}\n  width={300}\n  height={120}\n/>',
  Sankey: '<Sankey\n  nodes={[\n    { key: "budget", label: "Budget" },\n    { key: "eng", label: "Engineering" },\n    { key: "design", label: "Design" },\n    { key: "marketing", label: "Marketing" },\n    { key: "salaries", label: "Salaries" },\n    { key: "tools", label: "Tools" },\n  ]}\n  links={[\n    { source: "budget", target: "eng", value: 50 },\n    { source: "budget", target: "design", value: 25 },\n    { source: "budget", target: "marketing", value: 25 },\n    { source: "eng", target: "salaries", value: 35 },\n    { source: "eng", target: "tools", value: 15 },\n    { source: "design", target: "salaries", value: 20 },\n    { source: "design", target: "tools", value: 5 },\n  ]}\n  width={400}\n  height={220}\n/>',
  ScatterMatrix: '<ScatterMatrix\n  data={[\n    { id: 1, values: { height: 170, weight: 68, age: 25 } },\n    { id: 2, values: { height: 180, weight: 82, age: 30 } },\n    { id: 3, values: { height: 165, weight: 55, age: 22 } },\n    { id: 4, values: { height: 175, weight: 75, age: 28 } },\n    { id: 5, values: { height: 190, weight: 90, age: 35 } },\n  ]}\n  dimensions={["height", "weight", "age"]}\n/>',
  ScatterPlot: '<ScatterPlot\n  data={[\n    { x: 10, y: 20 },\n    { x: 25, y: 35 },\n    { x: 15, y: 28 },\n    { x: 30, y: 45 },\n    { x: 20, y: 15 },\n    { x: 35, y: 40 },\n    { x: 5, y: 12 },\n  ]}\n  width={400}\n  height={200}\n/>',
  SmallMultiples: '<SmallMultiples\n  items={["Revenue", "Users", "Orders"]}\n  renderItem={(label) => (\n    <div style={{ padding: 8, border: "1px solid var(--vf-border-1)", textAlign: "center" }}>\n      <Text size="sm" style={{ fontWeight: 600 }}>{label}</Text>\n      <Sparkline data={[10, 25, 18, 35, 28]} width={100} height={24} />\n    </div>\n  )}\n  columns={3}\n  gap={8}\n/>',
  StreamGraph: '<StreamGraph\n  data={[\n    { x: 0, rock: 10, pop: 15, jazz: 8 },\n    { x: 1, rock: 14, pop: 20, jazz: 6 },\n    { x: 2, rock: 18, pop: 18, jazz: 10 },\n    { x: 3, rock: 12, pop: 25, jazz: 12 },\n    { x: 4, rock: 16, pop: 22, jazz: 9 },\n  ]}\n  series={[\n    { key: "rock", label: "Rock" },\n    { key: "pop", label: "Pop" },\n    { key: "jazz", label: "Jazz" },\n  ]}\n  width={400}\n  height={200}\n/>',
  Sunburst: '<Sunburst\n  data={{\n    name: "Total",\n    children: [\n      { name: "Frontend", children: [\n        { name: "React", value: 40 },\n        { name: "CSS", value: 20 },\n      ]},\n      { name: "Backend", children: [\n        { name: "API", value: 35 },\n        { name: "DB", value: 25 },\n      ]},\n      { name: "Infra", value: 15 },\n    ],\n  }}\n  size={280}\n/>',
  TileGridMap: '<TileGridMap\n  cells={[\n    { id: "CA", label: "CA", col: 0, row: 3 },\n    { id: "TX", label: "TX", col: 3, row: 4 },\n    { id: "NY", label: "NY", col: 8, row: 1 },\n    { id: "FL", label: "FL", col: 8, row: 4 },\n    { id: "IL", label: "IL", col: 5, row: 1 },\n    { id: "WA", label: "WA", col: 0, row: 0 },\n  ]}\n  values={{ CA: 39, TX: 29, NY: 20, FL: 22, IL: 13, WA: 8 }}\n  tileSize={44}\n/>',
  TreeMap: '<TreeMap\n  data={{\n    name: "root",\n    children: [\n      { name: "Components", value: 120 },\n      { name: "Hooks", value: 45 },\n      { name: "Utils", value: 30 },\n      { name: "Charts", value: 65 },\n      { name: "Styles", value: 20 },\n    ],\n  }}\n/>',
  ViolinPlot: '<ViolinPlot\n  groups={[\n    { key: "a", label: "Setosa", values: [5.1, 4.9, 4.7, 4.6, 5.0, 5.4, 4.6, 5.0, 4.4, 4.9, 5.4, 4.8, 4.8, 4.3, 5.8, 5.7, 5.4, 5.1, 5.7, 5.1] },\n    { key: "b", label: "Versicolor", values: [7.0, 6.4, 6.9, 5.5, 6.5, 5.7, 6.3, 4.9, 6.6, 5.2, 5.0, 5.9, 6.0, 6.1, 5.6, 6.7, 5.6, 5.8, 6.2, 5.6] },\n  ]}\n  width={400}\n  height={200}\n/>',
  WaterfallChart: '<WaterfallChart\n  steps={[\n    { key: "start", label: "Starting", value: "total" },\n    { key: "sales", label: "Sales", value: 420 },\n    { key: "services", label: "Services", value: 210 },\n    { key: "costs", label: "Costs", value: -320 },\n    { key: "tax", label: "Tax", value: -80 },\n    { key: "end", label: "Net", value: "total" },\n  ]}\n  width={400}\n  height={220}\n/>',

  // ── Compound sub-components ─────────────────────────────────────────
  'Field.Error': '<Field label="Example">\n  <Input placeholder="Required field" />\n  <Field.Error>This field is required</Field.Error>\n</Field>',
  'Field.Help': '<Field label="Email">\n  <Input placeholder="you@example.com" />\n  <Field.Help>We will never share your email</Field.Help>\n</Field>',
  'Field.Label': '<Field label="Username">\n  <Input placeholder="Enter username" />\n</Field>',
  FieldControl: '<Field label="Username">\n  <Input placeholder="Enter username" />\n</Field>',
  FormErrorSummary: '<VStack gap={4} style={{ padding: 8, border: "1px solid var(--vf-red)", background: "var(--vf-bg-2)" }}>\n  <Text size="sm" style={{ fontWeight: 600, color: "var(--vf-red)" }}>2 errors found</Text>\n  <VStack gap={2}>\n    <Text size="xs" color="var(--vf-red)">Email: Required field</Text>\n    <Text size="xs" color="var(--vf-red)">Password: Must be at least 8 characters</Text>\n  </VStack>\n</VStack>',
  'RovingFocusGroup.Item': '<div role="group" style={{ display: "flex", gap: 4 }}>\n  <Button size="sm">Focusable 1</Button>\n  <Button size="sm">Focusable 2</Button>\n</div>',
  Draggable: '<DragDropContext onDragEnd={() => {}}>\n  <Draggable id="demo">\n    {({ dragRef, dragHandleProps }) => (\n      <div ref={dragRef} {...dragHandleProps} style={{ padding: 8, background: "var(--vf-bg-3)", cursor: "grab", border: "1px dashed var(--vf-border-2)", display: "inline-flex", gap: 8, alignItems: "center" }}>\u2630 <Text size="sm">Drag me</Text></div>\n    )}\n  </Draggable>\n</DragDropContext>',
  Droppable: '<div style={{ padding: 16, border: "2px dashed var(--vf-border-2)", background: "var(--vf-bg-1)", textAlign: "center", minHeight: 60, display: "flex", alignItems: "center", justifyContent: "center" }}>\n  <Text size="sm" color="var(--vf-text-3)">Drop zone -- drag items here</Text>\n</div>',

  // ── Missing required data overrides ─────────────────────────────────
  CheckboxGroup: '<CheckboxGroup\n  options={[\n    { value: "email", label: "Email" },\n    { value: "sms", label: "SMS" },\n    { value: "push", label: "Push" },\n  ]}\n  value={["email"]}\n  onValueChange={() => {}}\n/>',
  BreadcrumbMenu: '<BreadcrumbMenu\n  items={[\n    { label: "Home", href: "#", children: [{ label: "Dashboard", href: "#" }, { label: "Settings", href: "#" }] },\n    { label: "Products", href: "#" },\n    { label: "Widget", href: "#", isCurrent: true },\n  ]}\n/>',
  TreeNav: '<TreeNav\n  items={[\n    { key: "src", label: "src", children: [\n      { key: "components", label: "components", children: [\n        { key: "button", label: "Button.tsx" },\n        { key: "input", label: "Input.tsx" },\n      ]},\n      { key: "hooks", label: "hooks", children: [\n        { key: "useToggle", label: "useToggle.ts" },\n      ]},\n    ]},\n    { key: "package", label: "package.json" },\n  ]}\n/>',
  Changelog: '<Changelog\n  entries={[\n    { version: "1.1.0", date: "2026-04-15", changes: [\n      { kind: "added", description: "Transfer component" },\n      { kind: "fixed", description: "DatePicker range mode" },\n    ]},\n  ]}\n/>',
  WhatsNewPopover: 'function Example() {\n  const [show, setShow] = useState(true);\n  return (\n    <VStack gap={8}>\n      <Button size="sm" onClick={() => setShow(!show)}>Toggle Updates</Button>\n      {show && <VStack gap={4} style={{ padding: 12, border: "1px solid var(--vf-border-2)", maxWidth: 280 }}>\n        <Text size="sm" style={{ fontWeight: 600 }}>What is New</Text>\n        <Divider />\n        <VStack gap={2}>\n          <HStack gap={4}><Badge tone="info" size="sm">New</Badge><Text size="xs">Transfer component</Text></HStack>\n          <HStack gap={4}><Badge tone="success" size="sm">Fix</Badge><Text size="xs">DatePicker range mode</Text></HStack>\n          <HStack gap={4}><Badge tone="info" size="sm">New</Badge><Text size="xs">19 new hooks</Text></HStack>\n        </VStack>\n      </VStack>}\n    </VStack>\n  );\n}\nrender(<Example />);',
  CommitGraph: '<CommitGraph\n  commits={[\n    { id: "abc123", message: "Initial commit", branch: "main" },\n    { id: "def456", message: "Add feature", tone: "info" },\n    { id: "ghi789", message: "Fix bug", tone: "success" },\n  ]}\n/>',
  ConsoleOutput: '<ConsoleOutput\n  entries={[\n    { level: "info", message: "Server started on port 3000", timestamp: new Date("2026-01-01T10:00:01") },\n    { level: "warn", message: "Deprecated API called", timestamp: new Date("2026-01-01T10:00:05") },\n    { level: "error", message: "Connection refused", timestamp: new Date("2026-01-01T10:00:12") },\n  ]}\n/>',
  DashboardGrid: 'function Example() {\n  const [items, setItems] = useState([\n    { id: "users", x: 0, y: 0, w: 6, h: 3 },\n    { id: "revenue", x: 6, y: 0, w: 6, h: 3 },\n    { id: "cpu", x: 0, y: 3, w: 6, h: 3 },\n    { id: "memory", x: 6, y: 3, w: 6, h: 3 },\n  ]);\n  return (\n    <DashboardGrid\n      cols={12}\n      cellSize={32}\n      gap={4}\n      items={items}\n      onLayoutChange={setItems}\n      resizable\n      renderItem={(id) => (\n        <WidgetShell title={id}>\n          <Progress value={60} max={100} showValue size="sm" />\n        </WidgetShell>\n      )}\n    />\n  );\n}\nrender(<Example />);',
  Gantt: '<div style={{ border: "1px solid var(--vf-border-1)" }}>\n  <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", borderBottom: "1px solid var(--vf-border-0)" }}>\n    <Text size="xs" style={{ padding: 4, fontWeight: 600 }}>Task</Text>\n    <Text size="xs" style={{ padding: 4, fontWeight: 600 }}>Timeline</Text>\n  </div>\n  <div style={{ display: "grid", gridTemplateColumns: "120px 1fr" }}>\n    <Text size="xs" style={{ padding: 4 }}>Design</Text>\n    <div style={{ padding: 4 }}><div style={{ background: "var(--vf-green)", height: 16, width: "40%", borderRadius: 2 }} /></div>\n  </div>\n  <div style={{ display: "grid", gridTemplateColumns: "120px 1fr" }}>\n    <Text size="xs" style={{ padding: 4 }}>Develop</Text>\n    <div style={{ padding: 4 }}><div style={{ background: "var(--vf-blue)", height: 16, width: "60%", marginInlineStart: "20%", borderRadius: 2 }} /></div>\n  </div>\n  <div style={{ display: "grid", gridTemplateColumns: "120px 1fr" }}>\n    <Text size="xs" style={{ padding: 4 }}>Test</Text>\n    <div style={{ padding: 4 }}><div style={{ background: "var(--vf-amber)", height: 16, width: "30%", marginInlineStart: "60%", borderRadius: 2 }} /></div>\n  </div>\n</div>',
  KeyValueEditor: '<KeyValueEditor\n  value={[\n    { key: "Authorization", value: "Bearer token..." },\n    { key: "Content-Type", value: "application/json" },\n  ]}\n  onValueChange={() => {}}\n/>',
  NetworkInspector: '<NetworkInspector\n  requests={[\n    { id: "1", method: "GET", url: "/api/users", status: 200, duration: 42, size: 1800, type: "json" },\n    { id: "2", method: "POST", url: "/api/login", status: 401, duration: 120, size: 84, type: "json" },\n  ]}\n/>',
  NotificationCenter: 'function Example() {\n  return (\n    <VStack gap={4} style={{ border: "1px solid var(--vf-border-1)", padding: 8, maxWidth: 300 }}>\n      <HStack style={{ justifyContent: "space-between" }}><Text size="sm" style={{ fontWeight: 600 }}>Notifications</Text><Badge count={3} size="sm" /></HStack>\n      <Divider />\n      <VStack gap={4}>\n        <HStack gap={8}><Badge dot tone="info" /><VStack gap={0}><Text size="sm">New deployment</Text><Text size="xs" color="var(--vf-text-3)">2 min ago</Text></VStack></HStack>\n        <HStack gap={8}><Badge dot tone="success" /><VStack gap={0}><Text size="sm">Tests passed</Text><Text size="xs" color="var(--vf-text-3)">15 min ago</Text></VStack></HStack>\n        <HStack gap={8}><Badge dot tone="warning" /><VStack gap={0}><Text size="sm">Disk usage 90%</Text><Text size="xs" color="var(--vf-text-3)">1 hr ago</Text></VStack></HStack>\n      </VStack>\n    </VStack>\n  );\n}\nrender(<Example />);',
  Palette: '<Palette\n  colors={[\n    { color: "#4ade80", label: "Green" },\n    { color: "#f87171", label: "Red" },\n    { color: "#6b9fdd", label: "Blue" },\n    { color: "#a855f7", label: "Purple" },\n    { color: "#c8aa3e", label: "Amber" },\n  ]}\n  showLabels\n/>',
  PlanDisplay: '<PlanDisplay\n  steps={[\n    { id: "1", title: "Analyze requirements", status: "done" },\n    { id: "2", title: "Write implementation", status: "active" },\n    { id: "3", title: "Run tests", status: "pending" },\n  ]}\n/>',
  PresenceList: '<PresenceList\n  users={[\n    { id: "1", name: "Alice", status: "online" },\n    { id: "2", name: "Bob", status: "away" },\n    { id: "3", name: "Charlie", status: "offline" },\n  ]}\n/>',
  PromptTemplateList: '<PromptTemplateList\n  templates={[\n    { id: "1", title: "Code Review", body: "Review this code for bugs", description: "Review this code for bugs" },\n    { id: "2", title: "Summarize", body: "Summarize this document", description: "Summarize this document" },\n    { id: "3", title: "Translate", body: "Translate to another language", description: "Translate to another language" },\n  ]}\n  onSelect={() => {}}\n/>',
  QueryBuilder: '<QueryBuilder\n  value={{ id: "root", combinator: "AND", rules: [\n    { id: "r1", field: "status", operator: "=", value: "active" },\n    { id: "r2", field: "age", operator: ">", value: "18" },\n  ]}}\n  fields={[\n    { id: "status", label: "Status" },\n    { id: "age", label: "Age" },\n    { id: "name", label: "Name" },\n  ]}\n  onValueChange={() => {}}\n/>',
  RAGContext: '<VStack gap={4} style={{ border: "1px solid var(--vf-border-1)", padding: 8 }}>\n  <Text size="xs" style={{ fontWeight: 600 }}>Retrieved Context</Text>\n  <div style={{ padding: 8, background: "var(--vf-bg-2)", borderInlineStart: "2px solid var(--vf-blue)" }}>\n    <Text size="xs">React is a JavaScript library for building user interfaces. It uses a virtual DOM...</Text>\n    <Text size="xs" color="var(--vf-text-3)">Relevance: 0.94</Text>\n  </div>\n  <div style={{ padding: 8, background: "var(--vf-bg-2)", borderInlineStart: "2px solid var(--vf-blue)" }}>\n    <Text size="xs">Components are the building blocks of React applications...</Text>\n    <Text size="xs" color="var(--vf-text-3)">Relevance: 0.87</Text>\n  </div>\n</VStack>',
  ReactionBar: '<ReactionBar\n  reactions={[\n    { emoji: "\ud83d\udc4d", count: 5, reacted: true },\n    { emoji: "\u2764\ufe0f", count: 3 },\n    { emoji: "\ud83c\udf89", count: 1 },\n  ]}\n  onReact={() => {}}\n/>',
  ReactionPicker: '<HStack gap={4} style={{ padding: 8, border: "1px solid var(--vf-border-1)", background: "var(--vf-bg-2)" }}>\n  <Button variant="ghost" size="sm">&#128077;</Button>\n  <Button variant="ghost" size="sm">&#10084;&#65039;</Button>\n  <Button variant="ghost" size="sm">&#128514;</Button>\n  <Button variant="ghost" size="sm">&#128558;</Button>\n  <Button variant="ghost" size="sm">&#128546;</Button>\n  <Button variant="ghost" size="sm">&#127881;</Button>\n</HStack>',
  ReorderList: 'function Example() {\n  const [items, setItems] = useState([\n    { id: "a", label: "First item" },\n    { id: "b", label: "Second item" },\n    { id: "c", label: "Third item" },\n  ]);\n  return (\n    <ReorderList\n      value={items}\n      getKey={(item) => item.id}\n      onValueChange={setItems}\n      renderItem={(item, _i, { dragHandleProps }) => (\n        <div {...dragHandleProps} style={{ padding: 8, background: "var(--vf-bg-3)", cursor: "grab", border: "1px solid var(--vf-border-0)" }}>\u2630 {item.label}</div>\n      )}\n    />\n  );\n}\nrender(<Example />);',
  Sortable: 'function Example() {\n  const [items, setItems] = useState([\n    { id: "a", label: "Sortable A" },\n    { id: "b", label: "Sortable B" },\n    { id: "c", label: "Sortable C" },\n  ]);\n  return (\n    <Sortable\n      value={items}\n      getKey={(item) => item.id}\n      onValueChange={setItems}\n      renderItem={(item, _i, { dragHandleProps }) => (\n        <div {...dragHandleProps} style={{ padding: 8, background: "var(--vf-bg-3)", cursor: "grab", border: "1px solid var(--vf-border-0)" }}>\u2630 {item.label}</div>\n      )}\n    />\n  );\n}\nrender(<Example />);',
  SegmentBar: '<SegmentBar\n  segments={[\n    { span: 60, color: "var(--vf-green)", label: "Used" },\n    { span: 25, color: "var(--vf-amber)", label: "Reserved" },\n    { span: 15, color: "var(--vf-bg-4)", label: "Free" },\n  ]}\n/>',
  SegmentedProgress: '<SegmentedProgress\n  segments={[\n    { value: 40, tone: "success", label: "Passed" },\n    { value: 10, tone: "warning", label: "Warnings" },\n    { value: 5, tone: "danger", label: "Failed" },\n  ]}\n/>',
  SessionList: '<VStack gap={2} style={{ border: "1px solid var(--vf-border-1)", padding: 8, maxWidth: 250 }}>\n  <Text size="xs" style={{ fontWeight: 600, marginBottom: 4 }}>Recent Chats</Text>\n  <div style={{ padding: "6px 8px", background: "var(--vf-bg-3)", borderInlineStart: "2px solid var(--vf-blue)" }}><Text size="xs">API integration help</Text><Text size="xs" color="var(--vf-text-3)">2 hours ago</Text></div>\n  <div style={{ padding: "6px 8px" }}><Text size="xs">Debug memory leak</Text><Text size="xs" color="var(--vf-text-3)">Yesterday</Text></div>\n  <div style={{ padding: "6px 8px" }}><Text size="xs">Code review</Text><Text size="xs" color="var(--vf-text-3)">2 days ago</Text></div>\n</VStack>',
  SessionListItem: '<SessionListItem\n  session={{ id: "1", title: "Debugging async code", lastMessage: "Try adding await...", updatedAt: new Date(Date.now() - 3600000) }}\n  onSelect={() => {}}\n/>',
  SlashCommandPicker: '<SlashCommandPicker\n  commands={[\n    { id: "1", command: "/summarize", description: "Summarize the conversation" },\n    { id: "2", command: "/code", description: "Generate code snippet" },\n    { id: "3", command: "/translate", description: "Translate text" },\n  ]}\n  onSelect={() => {}}\n/>',
  SourceGrid: '<SourceGrid\n  sources={[\n    { id: "1", title: "React Docs", url: "https://react.dev", snippet: "The library for web and native user interfaces" },\n    { id: "2", title: "TypeScript Handbook", url: "https://typescriptlang.org", snippet: "Typed superset of JavaScript" },\n  ]}\n/>',
  CitationList: '<VStack gap={4}>\n  <HStack gap={4}><Badge size="sm">1</Badge><Text size="xs">React Documentation - react.dev</Text></HStack>\n  <HStack gap={4}><Badge size="sm">2</Badge><Text size="xs">MDN Web Docs - developer.mozilla.org</Text></HStack>\n  <HStack gap={4}><Badge size="sm">3</Badge><Text size="xs">TypeScript Handbook - typescriptlang.org</Text></HStack>\n</VStack>',
  Spotlight: 'function Example() {\n  const [open, setOpen] = useState(false);\n  return (\n    <VStack gap={8}>\n      <Button id="spotlight-target" onClick={() => setOpen(true)}>Start Tour</Button>\n      <Spotlight\n        open={open}\n        onOpenChange={setOpen}\n        onComplete={() => setOpen(false)}\n        steps={[\n          { target: "#spotlight-target", title: "Welcome!", content: "Click here to get started.", placement: "bottom" },\n        ]}\n      />\n    </VStack>\n  );\n}\nrender(<Example />);',
  StatusBar: '<StatusBar\n  items={[\n    { label: "main" },\n    { label: "Ready", color: "var(--vf-green)" },\n    { label: "TypeScript" },\n    { label: "Ln 42, Col 8" },\n  ]}\n/>',
  TraceViewer: '<VStack gap={2} style={{ border: "1px solid var(--vf-border-1)", padding: 8, fontFamily: "var(--vf-font-family)" }}>\n  <HStack gap={4}><Text size="xs" color="var(--vf-text-3)">0ms</Text><Text size="xs">Request sent</Text></HStack>\n  <HStack gap={4}><Text size="xs" color="var(--vf-text-3)">120ms</Text><Text size="xs">Tool: search_db (42 results)</Text></HStack>\n  <HStack gap={4}><Text size="xs" color="var(--vf-text-3)">450ms</Text><Text size="xs">Streaming response started</Text></HStack>\n  <HStack gap={4}><Text size="xs" color="var(--vf-text-3)">1200ms</Text><Text size="xs">Response complete (567 tokens)</Text></HStack>\n</VStack>',
  TreeSelect: '<TreeSelect\n  label="Category"\n  nodes={[\n    { value: "fruit", label: "Fruits", children: [\n      { value: "apple", label: "Apple" },\n      { value: "banana", label: "Banana" },\n    ]},\n    { value: "veg", label: "Vegetables", children: [\n      { value: "carrot", label: "Carrot" },\n    ]},\n  ]}\n/>',
  TreeTable: '<Table\n  columns={[\n    { key: "name", header: "Name" },\n    { key: "type", header: "Type" },\n    { key: "size", header: "Size" },\n  ]}\n  data={[\n    { name: "\\u25BE src/", type: "folder", size: "--" },\n    { name: "   components/", type: "folder", size: "--" },\n    { name: "      Button.tsx", type: "file", size: "2.1 KB" },\n    { name: "   hooks/", type: "folder", size: "--" },\n    { name: "package.json", type: "file", size: "1.4 KB" },\n  ]}\n/>',
  VirtualGrid: '<div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 4, height: 120, overflow: "auto", border: "1px solid var(--vf-border-1)", padding: 4 }}>\n  {Array.from({ length: 40 }, (_, i) => <div key={i} style={{ padding: 8, background: "var(--vf-bg-3)", textAlign: "center", fontSize: 10 }}>{i + 1}</div>)}\n</div>',
  ContextWindow: '<div style={{ border: "1px solid var(--vf-border-1)", padding: 8 }}>\n  <HStack style={{ justifyContent: "space-between", marginBottom: 4 }}><Text size="xs">Context Used</Text><Text size="xs">32K / 128K tokens</Text></HStack>\n  <Progress value={32} max={128} size="sm" />\n</div>',
  AccessibleIcon: '<AccessibleIcon label="Settings icon">\n  <span style={{ fontSize: 24 }}>&#9881;</span>\n</AccessibleIcon>',
  OrganizationCard: '<OrganizationCard\n  organization={{ name: "Voidframe Labs", description: "Open source UI framework", members: 12 }}\n/>',
  TeamCard: '<TeamCard\n  team={{ name: "Engineering", description: "Core framework team", memberCount: 5 }}\n/>',
  UserCard: '<UserCard\n  user={{ name: "Jane Doe", title: "Staff Engineer", status: "online" }}\n/>',
  TokenCounter: '<HStack gap={12} style={{ padding: 8, background: "var(--vf-bg-2)", border: "1px solid var(--vf-border-1)" }}>\n  <VStack gap={0}><Text size="xs" color="var(--vf-text-3)">Input</Text><Text size="sm" style={{ fontWeight: 600 }}>1,234</Text></VStack>\n  <VStack gap={0}><Text size="xs" color="var(--vf-text-3)">Output</Text><Text size="sm" style={{ fontWeight: 600 }}>567</Text></VStack>\n  <VStack gap={0}><Text size="xs" color="var(--vf-text-3)">Total</Text><Text size="sm" style={{ fontWeight: 600 }}>1,801</Text></VStack>\n</HStack>',
  RESPONSIVE_SIZE_PRESETS: '<Text size="sm" color="var(--vf-text-3)">RESPONSIVE_SIZE_PRESETS is a configuration constant, not a component.</Text>',
  ReactNode: '<Text size="sm" color="var(--vf-text-3)">ReactNode is a TypeScript type, not a component.</Text>',

  // ── Dialog compound sub-components ─────────────────────────────────
  DialogTrigger: '<Dialog>\n  <Dialog.Trigger><Button>Open</Button></Dialog.Trigger>\n  <Dialog.Content>\n    <Dialog.Header><Dialog.Title>Title</Dialog.Title></Dialog.Header>\n    <Dialog.Body><Text>Dialog body content.</Text></Dialog.Body>\n    <Dialog.Footer>\n      <Dialog.Cancel>Cancel</Dialog.Cancel>\n      <Dialog.Action>Confirm</Dialog.Action>\n    </Dialog.Footer>\n  </Dialog.Content>\n</Dialog>',
  DialogContent: '<Text size="sm" color="var(--vf-text-3)">DialogContent is used inside a Dialog compound. See the Dialog page for usage.</Text>',
  DialogTitle: '<Text size="sm" color="var(--vf-text-3)">DialogTitle is used inside Dialog.Header. See the Dialog page for usage.</Text>',
  DialogClose: '<Text size="sm" color="var(--vf-text-3)">DialogClose is a dismiss button inside Dialog.Content. See the Dialog page.</Text>',
  DialogAction: '<Text size="sm" color="var(--vf-text-3)">DialogAction is the confirm button inside Dialog.Footer. See the Dialog page.</Text>',
  DialogCancel: '<Text size="sm" color="var(--vf-text-3)">DialogCancel is the cancel button inside Dialog.Footer. See the Dialog page.</Text>',
  DialogDescription: '<Text size="sm" color="var(--vf-text-3)">DialogDescription provides an accessible description. See the Dialog page.</Text>',

  // ── DrawerV2 compound sub-components ───────────────────────────────
  DrawerRoot: '<Text size="sm" color="var(--vf-text-3)">DrawerRoot is the root provider for DrawerV2. See the DrawerV2 page for usage.</Text>',
  DrawerV2Content: '<Text size="sm" color="var(--vf-text-3)">DrawerV2Content wraps drawer body inside DrawerV2. See the DrawerV2 page.</Text>',
  DrawerV2Title: '<Text size="sm" color="var(--vf-text-3)">DrawerV2Title provides the drawer heading. See the DrawerV2 page.</Text>',
  DrawerV2Trigger: '<Text size="sm" color="var(--vf-text-3)">DrawerV2Trigger opens the drawer. See the DrawerV2 page.</Text>',
  DrawerBody: '<Text size="sm" color="var(--vf-text-3)">DrawerBody wraps content inside DrawerV2.Content. See the DrawerV2 page.</Text>',
  DrawerClose: '<Text size="sm" color="var(--vf-text-3)">DrawerClose dismisses the drawer. See the DrawerV2 page.</Text>',
  DrawerFooter: '<Text size="sm" color="var(--vf-text-3)">DrawerFooter wraps actions inside DrawerV2.Content. See the DrawerV2 page.</Text>',
  DrawerHeader: '<Text size="sm" color="var(--vf-text-3)">DrawerHeader wraps the title inside DrawerV2.Content. See the DrawerV2 page.</Text>',

  // ── Popover compound sub-components ────────────────────────────────
  PopoverRoot: '<Text size="sm" color="var(--vf-text-3)">PopoverRoot is the root provider. See the PopoverV2 page for compound usage.</Text>',
  PopoverTrigger: '<Text size="sm" color="var(--vf-text-3)">PopoverTrigger opens the popover. See the PopoverV2 page for usage.</Text>',
  PopoverContent: '<Text size="sm" color="var(--vf-text-3)">PopoverContent wraps the popover body. See the PopoverV2 page for usage.</Text>',

  // ── Select compound sub-components ─────────────────────────────────
  SelectRoot: '<Text size="sm" color="var(--vf-text-3)">SelectRoot is the root provider. See the Select page for compound usage.</Text>',

  // ── Tooltip compound sub-components ────────────────────────────────
  TooltipRoot: '<Text size="sm" color="var(--vf-text-3)">TooltipRoot is the root provider. See the Tooltip page for compound usage.</Text>',
  TooltipTrigger: '<Text size="sm" color="var(--vf-text-3)">TooltipTrigger wraps the element that triggers the tooltip. See the Tooltip page.</Text>',
  TooltipContent: '<Text size="sm" color="var(--vf-text-3)">TooltipContent wraps the tooltip body. See the Tooltip page for usage.</Text>',

  // Tabs sub-components (TabsList, TabsTrigger, TabsContent already defined above)

  // ── AlertDialog compound sub-components ────────────────────────────
  AlertDialogAction: '<Text size="sm" color="var(--vf-text-3)">AlertDialogAction is the confirm button. See the AlertDialog page.</Text>',
  AlertDialogCancel: '<Text size="sm" color="var(--vf-text-3)">AlertDialogCancel is the cancel button. See the AlertDialog page.</Text>',
  AlertDialogContent: '<Text size="sm" color="var(--vf-text-3)">AlertDialogContent wraps the dialog body. See the AlertDialog page.</Text>',
  AlertDialogDescription: '<Text size="sm" color="var(--vf-text-3)">AlertDialogDescription provides accessible description. See AlertDialog.</Text>',
  AlertDialogFooter: '<Text size="sm" color="var(--vf-text-3)">AlertDialogFooter wraps action buttons. See the AlertDialog page.</Text>',
  AlertDialogHeader: '<Text size="sm" color="var(--vf-text-3)">AlertDialogHeader wraps the title. See the AlertDialog page.</Text>',
  AlertDialogTitle: '<Text size="sm" color="var(--vf-text-3)">AlertDialogTitle provides the dialog heading. See the AlertDialog page.</Text>',
  AlertDialogTrigger: '<Text size="sm" color="var(--vf-text-3)">AlertDialogTrigger opens the alert dialog. See the AlertDialog page.</Text>',

  // ── Card compound sub-components ───────────────────────────────────
  CardContent: '<Text size="sm" color="var(--vf-text-3)">CardContent wraps the card body. See the Card page for usage.</Text>',
  CardDescription: '<Text size="sm" color="var(--vf-text-3)">CardDescription provides a subtitle. See the Card page for usage.</Text>',
  CardTitle: '<Text size="sm" color="var(--vf-text-3)">CardTitle provides the card heading. See the Card page for usage.</Text>',

  // ── DropdownMenu compound sub-components ───────────────────────────
  DropdownMenuContent: '<Text size="sm" color="var(--vf-text-3)">DropdownMenuContent wraps menu items. See the DropdownMenu page.</Text>',
  DropdownMenuItem: '<Text size="sm" color="var(--vf-text-3)">DropdownMenuItem is a menu action. See the DropdownMenu page.</Text>',
  DropdownMenuTrigger: '<Text size="sm" color="var(--vf-text-3)">DropdownMenuTrigger opens the menu. See the DropdownMenu page.</Text>',
  DropdownMenuLabel: '<Text size="sm" color="var(--vf-text-3)">DropdownMenuLabel is a non-interactive label. See the DropdownMenu page.</Text>',
  DropdownMenuSeparator: '<Text size="sm" color="var(--vf-text-3)">DropdownMenuSeparator divides menu sections. See the DropdownMenu page.</Text>',
  DropdownMenuCheckboxItem: '<Text size="sm" color="var(--vf-text-3)">DropdownMenuCheckboxItem is a toggleable item. See the DropdownMenu page.</Text>',
  DropdownMenuRadioGroup: '<Text size="sm" color="var(--vf-text-3)">DropdownMenuRadioGroup groups radio items. See the DropdownMenu page.</Text>',
  DropdownMenuRadioItem: '<Text size="sm" color="var(--vf-text-3)">DropdownMenuRadioItem is a radio option. See the DropdownMenu page.</Text>',
  DropdownMenuSub: '<Text size="sm" color="var(--vf-text-3)">DropdownMenuSub is a submenu container. See the DropdownMenu page.</Text>',
  DropdownMenuSubContent: '<Text size="sm" color="var(--vf-text-3)">DropdownMenuSubContent wraps submenu items. See the DropdownMenu page.</Text>',
  DropdownMenuSubTrigger: '<Text size="sm" color="var(--vf-text-3)">DropdownMenuSubTrigger opens a submenu. See the DropdownMenu page.</Text>',

  // ── Sheet compound sub-components ──────────────────────────────────
  SheetBody: '<Text size="sm" color="var(--vf-text-3)">SheetBody wraps content inside Sheet.Content. See the Sheet page.</Text>',
  SheetClose: '<Text size="sm" color="var(--vf-text-3)">SheetClose dismisses the sheet. See the Sheet page for usage.</Text>',
  SheetContent: '<Text size="sm" color="var(--vf-text-3)">SheetContent wraps the sheet body. See the Sheet page for usage.</Text>',
  SheetDescription: '<Text size="sm" color="var(--vf-text-3)">SheetDescription provides accessible description. See the Sheet page.</Text>',
  SheetFooter: '<Text size="sm" color="var(--vf-text-3)">SheetFooter wraps action buttons. See the Sheet page for usage.</Text>',
  SheetHeader: '<Text size="sm" color="var(--vf-text-3)">SheetHeader wraps the title. See the Sheet page for usage.</Text>',
  SheetTitle: '<Text size="sm" color="var(--vf-text-3)">SheetTitle provides the sheet heading. See the Sheet page for usage.</Text>',
  SheetTrigger: '<Text size="sm" color="var(--vf-text-3)">SheetTrigger opens the sheet. See the Sheet page for usage.</Text>',

  // Other sub-components (Link, ChartScales, MessageMarkdown already defined above)
  CodeContextView: '<CodeContextView\n  file="src/App.tsx"\n  line={42}\n  context="const result = await fetchData();"\n/>',
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
    return '{[{ key: "API_KEY", value: "VF-EXAMPLE-1234", secret: true }, { key: "PORT", value: "3000" }]}';

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
  if (prop.name === "before") return '"data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'300\' height=\'200\'%3E%3Crect fill=\'%23111\' width=\'300\' height=\'200\'/%3E%3Ctext fill=\'%23333\' x=\'50%25\' y=\'50%25\' dominant-baseline=\'middle\' text-anchor=\'middle\' font-family=\'monospace\' font-size=\'14\'%3EBefore%3C/text%3E%3C/svg%3E"';
  if (prop.name === "after") return '"data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'300\' height=\'200\'%3E%3Crect fill=\'%23111\' width=\'300\' height=\'200\'/%3E%3Ctext fill=\'%23666\' x=\'50%25\' y=\'50%25\' dominant-baseline=\'middle\' text-anchor=\'middle\' font-family=\'monospace\' font-size=\'14\'%3EAfter%3C/text%3E%3C/svg%3E"';
  if (prop.name === "pattern") return '"\\d+"';
  if (prop.name === "testString") return '"The answer is 42 and also 100"';
  if (prop.name === "expression") return '"0 * * * *"';
  if (prop.name === "src" && t === "string") return '"data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'200\' height=\'120\'%3E%3Crect fill=\'%23222\' width=\'200\' height=\'120\'/%3E%3Ctext fill=\'%23666\' x=\'50%25\' y=\'50%25\' dominant-baseline=\'middle\' text-anchor=\'middle\' font-family=\'monospace\' font-size=\'14\'%3EImage%3C/text%3E%3C/svg%3E"';
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
  if (prop.name === "variant") return '"subtle"';
  if (prop.name === "size") return '"md"';
  if (prop.name === "tone") return '"success"';
  if (prop.name === "status") return '"success"';
  if (prop.name === "mode") return '"slider"';
  if (prop.name === "orientation") return '"horizontal"';
  if (prop.name === "label") return '"Example"';
  return null;
}
