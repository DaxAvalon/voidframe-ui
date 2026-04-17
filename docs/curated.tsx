import type { ReactNode } from "react";

export interface CuratedExample {
  title: string;
  code: string;
  noInline?: boolean;
}

export interface CuratedOverride {
  summary: ReactNode;
  examples: CuratedExample[];
}

// Hand-written blurbs + playground snippets that override the
// auto-generated component page when a curated entry exists for the
// component. The raw props table + description still render below.
export const curated: Record<string, CuratedOverride> = {
  Button: {
    summary: (
      <p>
        The canonical interactive element. Supports several tones (default /
        primary / ghost / danger) and can accept a tone accent that recolors
        the border and focus ring.
      </p>
    ),
    examples: [
      {
        title: "Variants",
        code: `<div style={{ display: "flex", gap: 8 }}>
  <Button>Default</Button>
  <Button variant="primary">Primary</Button>
  <Button variant="ghost">Ghost</Button>
  <Button variant="danger">Danger</Button>
</div>`,
      },
      {
        title: "Sizes",
        code: `<div style={{ display: "flex", gap: 8, alignItems: "center" }}>
  <Button size="sm">Small</Button>
  <Button>Default</Button>
  <Button size="lg">Large</Button>
</div>`,
      },
    ],
  },
  Badge: {
    summary: (
      <p>
        Compact inline label for status, counts, and tags. Five tones mirror
        the platform semantic colors.
      </p>
    ),
    examples: [
      {
        title: "Tones",
        code: `<div style={{ display: "flex", gap: 8 }}>
  <Badge>neutral</Badge>
  <Badge tone="success">success</Badge>
  <Badge tone="warning">warning</Badge>
  <Badge tone="danger">danger</Badge>
  <Badge tone="info">info</Badge>
</div>`,
      },
    ],
  },
  Tabs: {
    summary: (
      <p>
        Keyboard-navigable tablist. Arrow keys cycle between tabs, Home/End
        jump to the first/last. The <code>active</code> value is controlled.
      </p>
    ),
    examples: [
      {
        title: "Controlled tabs",
        code: `function Example() {
  const [active, setActive] = useState("overview");
  return (
    <Tabs
      tabs={[
        { key: "overview", label: "Overview" },
        { key: "activity", label: "Activity" },
        { key: "settings", label: "Settings" },
      ]}
      active={active}
      onChange={setActive}
    />
  );
}
render(<Example />);`,
      },
    ],
  },
  Select: {
    summary: (
      <p>
        Thin wrapper over the native <code>&lt;select&gt;</code>. Issues a
        runtime warning if options have duplicate values or if the controlled
        value doesn't match any option.
      </p>
    ),
    examples: [
      {
        title: "Controlled select",
        code: `function Example() {
  const [value, setValue] = useState("pacific");
  return (
    <Select
      label="Timezone"
      value={value}
      onChange={setValue}
      options={[
        { value: "pacific", label: "Pacific" },
        { value: "mountain", label: "Mountain" },
        { value: "central", label: "Central" },
        { value: "eastern", label: "Eastern" },
      ]}
    />
  );
}
render(<Example />);`,
      },
    ],
  },
  PopoverV2: {
    summary: (
      <p>
        Anchored popover with viewport-flip + edge-clamp positioning. Reuses
        the shared <code>computeAnchoredPosition</code> from{" "}
        <code>src/utils/anchor.ts</code>.
      </p>
    ),
    examples: [
      {
        title: "Open / close",
        code: `function Example() {
  const [open, setOpen] = useState(false);
  return (
    <PopoverV2 open={open} onOpenChange={setOpen}>
      <PopoverV2.Trigger asChild>
        <Button onClick={() => setOpen(!open)}>Open popover</Button>
      </PopoverV2.Trigger>
      <PopoverV2.Content>
        <div style={{ padding: 8 }}>
          <div>Hello from a popover.</div>
        </div>
      </PopoverV2.Content>
    </PopoverV2>
  );
}
render(<Example />);`,
      },
    ],
  },
  Dialog: {
    summary: (
      <p>
        Modal overlay with focus trap and escape-to-close. The content is
        portaled to the document body.
      </p>
    ),
    examples: [
      {
        title: "Confirm flow",
        code: `function Example() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open dialog</Button>
      <Dialog open={open} onOpenChange={setOpen} title="Are you sure?">
        <div style={{ padding: 12 }}>
          <div style={{ marginBottom: 12 }}>This action cannot be undone.</div>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="danger" onClick={() => setOpen(false)}>Delete</Button>
          </div>
        </div>
      </Dialog>
    </>
  );
}
render(<Example />);`,
      },
    ],
  },
  BarChart: {
    summary: (
      <p>
        Vertical bar chart with tooltip, legend, and axis primitives. Pairs
        with <code>AreaChart</code>, <code>LineChart</code>, and other
        core-chart surfaces. Available from <code>@voidframe/ui/charts</code>.
      </p>
    ),
    examples: [
      {
        title: "Usage",
        code: `<VStack gap={8}>
  <Text size="sm" color="var(--vf-text-2)">Chart components require D3 peer dependencies and are imported from the charts subpath:</Text>
  <Code>import {"{"} BarChart {"}"} from "@voidframe/ui/charts"</Code>
  <Text size="sm" color="var(--vf-text-3)">Props: width, height, data (array), xKey, yKeys, stacked, horizontal, tooltip, legend.</Text>
</VStack>`,
      },
    ],
  },
  DevPanel: {
    summary: (
      <p>
        Floating dev HUD that surfaces render profiler scopes, captured
        warnings, and theme tokens. Production builds render nothing unless{" "}
        <code>showInProduction</code> is set.
      </p>
    ),
    examples: [
      {
        title: "Drop into any app root",
        code: `<DevPanel position="br" defaultTab="theme" />`,
      },
    ],
  },
  Transfer: {
    summary: (
      <p>
        Dual-list shuttle for moving items between available and selected
        panels.
      </p>
    ),
    examples: [
      {
        title: "Basic transfer",
        code: `function Example() {
  const [selected, setSelected] = useState([]);
  const items = [
    { key: "react", label: "React" },
    { key: "vue", label: "Vue" },
    { key: "svelte", label: "Svelte" },
    { key: "angular", label: "Angular" },
    { key: "solid", label: "SolidJS" },
  ];
  return (
    <Transfer
      items={items}
      value={selected}
      onValueChange={setSelected}
      titles={["Available", "Selected"]}
      searchable
    />
  );
}
render(<Example />);`,
      },
    ],
  },
  SplitButton: {
    summary: (
      <p>
        Button with dropdown for alternative actions.
      </p>
    ),
    examples: [
      {
        title: "Save actions",
        code: `function Example() {
  const [msg, setMsg] = useState("Click an action");
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <SplitButton
        label="Save"
        onClick={() => setMsg("Saved!")}
        actions={[
          { key: "draft", label: "Save As Draft" },
          { key: "json", label: "Export as JSON" },
        ]}
        onAction={(key) => setMsg("Action: " + key)}
      />
      <div>{msg}</div>
    </div>
  );
}
render(<Example />);`,
      },
    ],
  },
  InlineEdit: {
    summary: (
      <p>
        Click-to-edit text that toggles between display and input.
      </p>
    ),
    examples: [
      {
        title: "Editable title",
        code: `function Example() {
  const [title, setTitle] = useState("Click me to edit");
  return (
    <InlineEdit
      value={title}
      onSave={setTitle}
      placeholder="Enter a title..."
    />
  );
}
render(<Example />);`,
      },
    ],
  },
  ToggleGroup: {
    summary: (
      <p>
        Multi-select toggle button group for filter controls.
      </p>
    ),
    examples: [
      {
        title: "Filter tags",
        code: `function Example() {
  const [active, setActive] = useState(["bug"]);
  return (
    <ToggleGroup
      items={[
        { key: "bug", label: "Bug" },
        { key: "feature", label: "Feature" },
        { key: "docs", label: "Docs" },
        { key: "chore", label: "Chore" },
      ]}
      value={active}
      onValueChange={setActive}
    />
  );
}
render(<Example />);`,
      },
    ],
  },
  NumberStepper: {
    summary: (
      <p>
        Quantity selector with increment/decrement buttons.
      </p>
    ),
    examples: [
      {
        title: "Quantity picker",
        code: `function Example() {
  const [qty, setQty] = useState(1);
  return (
    <NumberStepper
      value={qty}
      onValueChange={setQty}
      min={0}
      max={99}
      step={1}
      label="Quantity"
    />
  );
}
render(<Example />);`,
      },
    ],
  },
  CommandInput: {
    summary: (
      <p>
        Shell-like input with command history and tab completion.
      </p>
    ),
    examples: [
      {
        title: "Terminal input",
        code: `function Example() {
  const [log, setLog] = useState([]);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <CommandInput
        onSubmit={(cmd) => setLog((prev) => [...prev, cmd])}
        placeholder="Type a command..."
        suggestions={[
          { value: "build", description: "Run production build" },
          { value: "test", description: "Run test suite" },
          { value: "lint", description: "Lint source files" },
          { value: "deploy", description: "Deploy to staging" },
        ]}
      />
      <div style={{ fontFamily: "monospace", fontSize: 12 }}>
        {log.map((cmd, i) => (
          <div key={i}>\$ {cmd}</div>
        ))}
      </div>
    </div>
  );
}
render(<Example />);`,
      },
    ],
  },
  MultiProgress: {
    summary: (
      <p>
        Multiple concurrent progress bars with status indicators.
      </p>
    ),
    examples: [
      {
        title: "Build progress",
        code: `<MultiProgress
  items={[
    { key: "lint", label: "Lint", value: 100, max: 100, status: "success" },
    { key: "types", label: "Type check", value: 100, max: 100, status: "success" },
    { key: "build", label: "Build", value: 65, max: 100, status: "active" },
    { key: "deploy", label: "Deploy", value: 0, max: 100, status: "pending" },
  ]}
  showValues
/>`,
      },
    ],
  },
  CronBuilder: {
    summary: (
      <p>
        Visual cron expression builder with preview.
      </p>
    ),
    examples: [
      {
        title: "Schedule builder",
        code: `function Example() {
  const [expr, setExpr] = useState("0 * * * *");
  return (
    <CronBuilder
      value={expr}
      onValueChange={setExpr}
      showPreview
    />
  );
}
render(<Example />);`,
      },
    ],
  },
  FilterBuilder: {
    summary: (
      <p>
        Visual filter/query builder with field-operator-value rules.
      </p>
    ),
    examples: [
      {
        title: "Data filters",
        code: `function Example() {
  const [rules, setRules] = useState([]);
  return (
    <FilterBuilder
      fields={[
        { key: "name", label: "Name", type: "string" },
        { key: "age", label: "Age", type: "number" },
        { key: "active", label: "Active", type: "boolean" },
      ]}
      value={rules}
      onValueChange={setRules}
    />
  );
}
render(<Example />);`,
      },
    ],
  },
  HexDump: {
    summary: (
      <p>
        Binary data viewer with hex and ASCII columns.
      </p>
    ),
    examples: [
      {
        title: "Binary data",
        code: `<HexDump
  data={new Uint8Array([
    72,101,108,108,111,44,32,87,111,114,108,100,33,32,84,104,
    105,115,32,105,115,32,118,111,105,100,102,114,97,109,101,46,
  ])}
  bytesPerRow={16}
  showAscii
/>`,
      },
    ],
  },
  EnvironmentVars: {
    summary: (
      <p>
        Environment variable editor with secret masking and type badges.
      </p>
    ),
    examples: [
      {
        title: "Config editor",
        code: `function Example() {
  const [vars, setVars] = useState([
    { key: "API_KEY", value: "sk-abc123secret", secret: true, type: "string" },
    { key: "PORT", value: "3000", type: "number" },
    { key: "DEBUG", value: "true", type: "boolean" },
    { key: "DATABASE_URL", value: "postgres://localhost:5432/app", type: "url" },
  ]);
  return (
    <EnvironmentVars
      variables={vars}
      onChange={setVars}
      showTypes
    />
  );
}
render(<Example />);`,
      },
    ],
  },
  CSVViewer: {
    summary: (
      <p>
        Read-only spreadsheet view for CSV data.
      </p>
    ),
    examples: [
      {
        title: "Data preview",
        code: `<CSVViewer
  data={\`name,age,city
Alice,28,Portland
Bob,34,Seattle
Carol,25,Denver
Dave,41,Austin
Eve,30,Boston\`}
  hasHeader
  striped
  showRowNumbers
/>`,
      },
    ],
  },
  ColorContrast: {
    summary: (
      <p>
        WCAG contrast ratio checker with AA/AAA compliance.
      </p>
    ),
    examples: [
      {
        title: "Check contrast",
        code: `function Example() {
  const [fg, setFg] = useState("#1a1a2e");
  const [bg, setBg] = useState("#e0e0e0");
  return (
    <ColorContrast
      foreground={fg}
      background={bg}
      onForegroundChange={setFg}
      onBackgroundChange={setBg}
      editable
      showPreview
      showDetails
    />
  );
}
render(<Example />);`,
      },
    ],
  },
  ModelCompare: {
    summary: (
      <p>
        Side-by-side AI model output comparison.
      </p>
    ),
    examples: [
      {
        title: "Compare outputs",
        code: `<ModelCompare
  models={[
    { id: "model-a", name: "Claude 3.5 Sonnet" },
    { id: "model-b", name: "GPT-4o" },
  ]}
  responses={[
    {
      modelId: "model-a",
      content: "The key difference between TCP and UDP is reliability. TCP establishes a connection, guarantees delivery order, and retransmits lost packets. This makes it ideal for web traffic, file transfers, and email.",
      tokens: { input: 12, output: 38 },
      latency: 820,
      status: "complete",
    },
    {
      modelId: "model-b",
      content: "TCP and UDP are both transport-layer protocols. TCP is connection-oriented with built-in error checking and flow control. UDP is connectionless and lightweight, preferred for streaming and real-time applications where speed matters more than perfect delivery.",
      tokens: { input: 12, output: 44 },
      latency: 1150,
      status: "complete",
    },
  ]}
  showMetrics
/>`,
      },
    ],
  },
  ConfidenceMeter: {
    summary: (
      <p>
        Visual confidence score display with zones.
      </p>
    ),
    examples: [
      {
        title: "Confidence variants",
        code: `<div style={{ display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap" }}>
  <ConfidenceMeter value={0.75} variant="bar" label="Bar" showLabel showValue />
  <ConfidenceMeter value={0.75} variant="gauge" label="Gauge" showLabel showValue />
  <ConfidenceMeter value={0.75} variant="ring" label="Ring" showLabel showValue />
  <ConfidenceMeter value={0.75} variant="text-only" label="Text" showLabel showValue />
</div>`,
      },
    ],
  },
  Popconfirm: {
    summary: (
      <p>
        Lightweight inline confirmation popover. Wraps any trigger element and
        asks the user to confirm or cancel before proceeding.
      </p>
    ),
    examples: [
      {
        title: "Delete confirmation",
        code: `<Popconfirm
  title="Delete this item?"
  description="This action cannot be undone."
  confirmVariant="danger"
  onConfirm={() => {}}
>
  <Button variant="danger">Delete</Button>
</Popconfirm>`,
      },
    ],
  },
  NotificationBadge: {
    summary: (
      <p>
        Count or dot overlay anchored to the top-right corner of any child
        element. Automatically clamps large numbers with a configurable max.
      </p>
    ),
    examples: [
      {
        title: "Counts and dot",
        code: `<div style={{ display: "flex", gap: 32, alignItems: "center" }}>
  <NotificationBadge count={3}>
    <Button>Messages</Button>
  </NotificationBadge>
  <NotificationBadge count={120}>
    <Button>Notifications</Button>
  </NotificationBadge>
  <NotificationBadge dot>
    <Button>Updates</Button>
  </NotificationBadge>
</div>`,
      },
    ],
  },
  Anchor: {
    summary: (
      <p>
        Scrollspy table of contents that highlights the currently visible
        section. Supports nested items and smooth-scroll on click.
      </p>
    ),
    examples: [
      {
        title: "Static anchor nav",
        code: `<Anchor
  activeKey="getting-started"
  items={[
    { key: "intro", label: "Introduction", href: "#intro" },
    { key: "getting-started", label: "Getting Started", href: "#getting-started" },
    { key: "installation", label: "Installation", href: "#installation" },
    { key: "usage", label: "Usage", href: "#usage" },
    { key: "api", label: "API Reference", href: "#api" },
  ]}
/>`,
      },
    ],
  },
  CopyButton: {
    summary: (
      <p>
        One-click copy-to-clipboard with a brief "Copied" confirmation state.
        Accepts any text value and handles clipboard API errors gracefully.
      </p>
    ),
    examples: [
      {
        title: "Two copy targets",
        code: `<div style={{ display: "flex", gap: 12 }}>
  <CopyButton text="npm install voidframe" label="Copy install command" />
  <CopyButton text="import { Button } from 'voidframe';" variant="accent" />
</div>`,
      },
    ],
  },
  Cascader: {
    summary: (
      <p>
        Multi-level drill-down dropdown for hierarchical data. Each panel
        reveals the next level of options on selection.
      </p>
    ),
    examples: [
      {
        title: "Location hierarchy",
        code: `function Example() {
  const [value, setValue] = useState([]);
  return (
    <Cascader
      label="Location"
      placeholder="Select a city"
      value={value}
      onValueChange={(path) => setValue(path)}
      options={[
        {
          value: "na", label: "North America", children: [
            { value: "us", label: "United States", children: [
              { value: "nyc", label: "New York" },
              { value: "sf", label: "San Francisco" },
            ]},
            { value: "ca", label: "Canada", children: [
              { value: "tor", label: "Toronto" },
              { value: "van", label: "Vancouver" },
            ]},
          ],
        },
        {
          value: "eu", label: "Europe", children: [
            { value: "uk", label: "United Kingdom", children: [
              { value: "lon", label: "London" },
            ]},
            { value: "de", label: "Germany", children: [
              { value: "ber", label: "Berlin" },
            ]},
          ],
        },
      ]}
    />
  );
}
render(<Example />);`,
      },
    ],
  },
  HorizontalTimeline: {
    summary: (
      <p>
        Horizontal event timeline with status badges. Each event can show a
        date, label, and completion status.
      </p>
    ),
    examples: [
      {
        title: "Order tracking",
        code: `<HorizontalTimeline
  events={[
    { key: "ordered", label: "Ordered", date: "Mar 1", status: "completed" },
    { key: "packed", label: "Packed", date: "Mar 2", status: "completed" },
    { key: "shipped", label: "Shipped", date: "Mar 3", status: "active" },
    { key: "transit", label: "In Transit", status: "pending" },
    { key: "delivered", label: "Delivered", status: "pending" },
  ]}
/>`,
      },
    ],
  },
  Comment: {
    summary: (
      <p>
        Threaded comment block with author, avatar, timestamp, and nested
        replies. Nest <code>&lt;Comment&gt;</code> children to create reply
        trees.
      </p>
    ),
    examples: [
      {
        title: "Threaded replies",
        code: `<Comment
  author="Alice"
  content="This looks great! Can we ship it this week?"
  datetime="2 hours ago"
>
  <Comment
    author="Bob"
    content="I think so — just need to finish the tests."
    datetime="1 hour ago"
  />
  <Comment
    author="Alice"
    content="Perfect, let's aim for Thursday."
    datetime="45 min ago"
  />
</Comment>`,
      },
    ],
  },
  Result: {
    summary: (
      <p>
        Full-page result display for success, error, and HTTP status outcomes.
        Includes a status icon, title, description, and optional action area.
      </p>
    ),
    examples: [
      {
        title: "Success and 404",
        code: `<div style={{ display: "flex", gap: 24 }}>
  <Result
    status="success"
    title="Payment Complete"
    description="Your order has been placed successfully."
    extra={<Button variant="primary">View Order</Button>}
  />
  <Result
    status="404"
    title="Page Not Found"
    description="The page you visited does not exist."
    extra={<Button>Back Home</Button>}
  />
</div>`,
      },
    ],
  },
  Descriptions: {
    summary: (
      <p>
        Structured label-value layout for displaying read-only metadata.
        Supports multiple columns, bordered mode, and per-item column spans.
      </p>
    ),
    examples: [
      {
        title: "User profile",
        code: `<Descriptions
  title="User Profile"
  columns={2}
  bordered
  items={[
    { key: "name", label: "Name", value: "Jane Doe" },
    { key: "email", label: "Email", value: "jane@example.com" },
    { key: "role", label: "Role", value: "Admin" },
    { key: "joined", label: "Joined", value: "January 2024" },
    { key: "status", label: "Status", value: "Active" },
    { key: "team", label: "Team", value: "Engineering" },
  ]}
/>`,
      },
    ],
  },
  FloatingActionButton: {
    summary: (
      <p>
        Floating action button with optional speed-dial actions that fan out on
        click. Positioned fixed in a corner of the viewport.
      </p>
    ),
    examples: [
      {
        title: "FAB with speed dial",
        code: `<div style={{ position: "relative", height: 200, border: "1px dashed var(--vf-border)", borderRadius: 8, overflow: "hidden" }}>
  <FloatingActionButton
    icon="+"
    position="bottom-right"
    actions={[
      { key: "edit", label: "Edit", icon: "\u270F", onClick: () => {} },
      { key: "share", label: "Share", icon: "\u21AA", onClick: () => {} },
      { key: "delete", label: "Delete", icon: "\u2717", onClick: () => {} },
    ]}
  />
</div>`,
      },
    ],
  },
  LiveIndicator: {
    summary: (
      <p>
        Animated status indicator for typing, recording, active, and live
        states. Pairs well with chat UIs and real-time dashboards.
      </p>
    ),
    examples: [
      {
        title: "All variants",
        code: `<div style={{ display: "flex", gap: 24, alignItems: "center" }}>
  <LiveIndicator variant="typing" label="Typing" />
  <LiveIndicator variant="recording" label="Recording" />
  <LiveIndicator variant="active" label="Active" />
  <LiveIndicator variant="live" label="LIVE" />
</div>`,
      },
    ],
  },
  ImageDiff: {
    summary: (
      <p>
        Pixel-level image comparison with slider, overlay, and side-by-side
        modes. Drag the slider handle to reveal before/after differences.
      </p>
    ),
    examples: [
      {
        title: "Slider comparison",
        code: `<ImageDiff
  before="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200'%3E%3Crect fill='%23334155' width='300' height='200'/%3E%3Ctext x='150' y='105' text-anchor='middle' fill='%23cbd5e1' font-size='16'%3EBefore%3C/text%3E%3C/svg%3E"
  after="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200'%3E%3Crect fill='%23164e63' width='300' height='200'/%3E%3Ctext x='150' y='105' text-anchor='middle' fill='%2367e8f9' font-size='16'%3EAfter%3C/text%3E%3C/svg%3E"
  mode="slider"
  style={{ maxWidth: 400 }}
/>`,
      },
    ],
  },
  RegExpTester: {
    summary: (
      <p>
        Live regex testing surface with match highlighting, capture groups, and
        flag toggles. Pattern and test string are fully controlled.
      </p>
    ),
    examples: [
      {
        title: "Match numbers",
        code: `function Example() {
  const [pattern, setPattern] = useState("\\\\d+");
  const [text, setText] = useState("There are 42 cats and 7 dogs");
  return (
    <RegExpTester
      pattern={pattern}
      onPatternChange={setPattern}
      testString={text}
      onTestStringChange={setText}
      flags="g"
      showMatches
    />
  );
}
render(<Example />);`,
      },
    ],
  },
  TokenVisualizer: {
    summary: (
      <p>
        Token boundary display for LLM tokenization output. Supports
        alternating color mode, log-probability shading, and token IDs.
      </p>
    ),
    examples: [
      {
        title: "Alternating colors",
        code: `<TokenVisualizer
  tokens={[
    "The", " quick", " brown", " fox", " jumps", " over", " the", " lazy", " dog"
  ]}
  colorMode="alternating"
  showBoundaries
/>`,
      },
    ],
  },
  OrgChart: {
    summary: (
      <p>
        Hierarchical organization tree rendered as SVG. Supports collapsible
        nodes, click handlers, and multiple connector styles. Imported
        from <code>voidframe/charts</code>.
      </p>
    ),
    examples: [
      {
        title: "3-level org",
        code: `<OrgChart
  data={{
    id: "ceo",
    label: "CEO",
    description: "Alex Chen",
    children: [
      {
        id: "vp-eng",
        label: "VP Engineering",
        description: "Jordan Lee",
        children: [
          { id: "dir-fe", label: "Dir. Frontend", description: "Sam Park" },
          { id: "dir-be", label: "Dir. Backend", description: "Mia Torres" },
        ],
      },
      {
        id: "vp-product",
        label: "VP Product",
        description: "Riley Kim",
        children: [
          { id: "dir-design", label: "Dir. Design", description: "Casey Woo" },
        ],
      },
    ],
  }}
  connectorStyle="curved"
  nodeWidth={140}
  nodeHeight={60}
/>`,
      },
    ],
  },
  Input: {
    summary: (
      <p>
        Single-line text field with optional label. Wraps a
        native <code>&lt;input&gt;</code> with accessible labeling and the
        standard voidframe field layout.
      </p>
    ),
    examples: [
      {
        title: "Basic",
        code: `<Input label="Username" placeholder="Enter your username" />`,
      },
      {
        title: "With placeholder",
        code: `<Input label="Search" placeholder="Type to search..." type="search" />`,
      },
      {
        title: "Disabled",
        code: `<Input label="Email" value="locked@example.com" disabled />`,
      },
    ],
  },
  Checkbox: {
    summary: (
      <p>
        Styled checkbox with label, checked state, and disabled variant.
        Supports controlled and uncontrolled modes via <code>checked</code> or{" "}
        <code>defaultChecked</code>.
      </p>
    ),
    examples: [
      {
        title: "States",
        code: `function Example() {
  const [a, setA] = useState(true);
  const [b, setB] = useState(false);
  return (
    <VStack gap={8}>
      <Checkbox checked={a} onChange={() => setA(!a)} label="Enabled and checked" />
      <Checkbox checked={b} onChange={() => setB(!b)} label="Unchecked" />
      <Checkbox checked={true} disabled label="Disabled checked" />
    </VStack>
  );
}
render(<Example />);`,
      },
    ],
  },
  RadioGroup: {
    summary: (
      <p>
        Accessible radio group for single-selection from a list.
        Arrow keys cycle between options. Supports horizontal and vertical layouts.
      </p>
    ),
    examples: [
      {
        title: "Plan selection",
        code: `function Example() {
  const [plan, setPlan] = useState("pro");
  return (
    <RadioGroup
      label="Choose a plan"
      value={plan}
      onChange={setPlan}
      options={[
        { value: "free", label: "Free" },
        { value: "pro", label: "Pro" },
        { value: "enterprise", label: "Enterprise" },
      ]}
    />
  );
}
render(<Example />);`,
      },
    ],
  },
  Slider: {
    summary: (
      <p>
        Range slider with optional label and live value display.
        Wraps a native <code>&lt;input type="range"&gt;</code> with custom
        track and thumb styling.
      </p>
    ),
    examples: [
      {
        title: "Volume control",
        code: `function Example() {
  const [vol, setVol] = useState(50);
  return (
    <Slider
      label="Volume"
      value={vol}
      onChange={setVol}
      min={0}
      max={100}
      step={1}
      showValue
    />
  );
}
render(<Example />);`,
      },
    ],
  },
  Toggle: {
    summary: (
      <p>
        Binary on/off switch with keyboard support.
        Renders as <code>role="switch"</code> with accessible labeling.
      </p>
    ),
    examples: [
      {
        title: "Toggle states",
        code: `function Example() {
  const [a, setA] = useState(true);
  const [b, setB] = useState(false);
  return (
    <VStack gap={8}>
      <Toggle checked={a} onChange={setA} label="Notifications" />
      <Toggle checked={b} onChange={setB} label="Dark mode" />
      <Toggle checked={true} readOnly label="Read-only (locked)" />
    </VStack>
  );
}
render(<Example />);`,
      },
    ],
  },
  Textarea: {
    summary: (
      <p>
        Multi-line text field with configurable rows and optional label.
        Supports both <code>onChange</code> and <code>onValueChange</code> handlers.
      </p>
    ),
    examples: [
      {
        title: "With character count",
        code: `function Example() {
  const [text, setText] = useState("");
  const max = 200;
  return (
    <div>
      <Textarea
        label="Bio"
        placeholder="Tell us about yourself..."
        value={text}
        onValueChange={setText}
        rows={4}
      />
      <div style={{ textAlign: "right", fontSize: 12, color: text.length > max ? "var(--vf-red)" : "var(--vf-text-4)" }}>
        {text.length} / {max}
      </div>
    </div>
  );
}
render(<Example />);`,
      },
    ],
  },
  SearchInput: {
    summary: (
      <p>
        Text input with a search icon and built-in clear button.
        The clear button appears when the value is non-empty.
      </p>
    ),
    examples: [
      {
        title: "Stateful search",
        code: `function Example() {
  const [query, setQuery] = useState("");
  return (
    <SearchInput
      value={query}
      onValueChange={setQuery}
      placeholder="Search components..."
    />
  );
}
render(<Example />);`,
      },
    ],
  },
  PasswordInput: {
    summary: (
      <p>
        Password field with a visibility toggle button.
        Includes accessible labeling and configurable auto-complete.
      </p>
    ),
    examples: [
      {
        title: "With strength hint",
        code: `function Example() {
  const [pw, setPw] = useState("");
  const strength = pw.length < 4 ? "Weak" : pw.length < 8 ? "Fair" : "Strong";
  const color = pw.length < 4 ? "var(--vf-red)" : pw.length < 8 ? "var(--vf-amber)" : "var(--vf-green)";
  return (
    <div>
      <PasswordInput
        label="Password"
        value={pw}
        onValueChange={setPw}
        placeholder="Enter password"
      />
      {pw.length > 0 && (
        <div style={{ fontSize: 12, marginTop: 4, color }}>
          Strength: {strength}
        </div>
      )}
    </div>
  );
}
render(<Example />);`,
      },
    ],
  },
  PinInput: {
    summary: (
      <p>
        Multi-slot code entry with auto-advance, backspace navigation,
        and paste support. Fires <code>onComplete</code> when all digits
        are filled.
      </p>
    ),
    examples: [
      {
        title: "6-digit code",
        code: `function Example() {
  const [code, setCode] = useState("");
  const [done, setDone] = useState(false);
  return (
    <VStack gap={8}>
      <PinInput
        label="Verification code"
        length={6}
        value={code}
        onChange={setCode}
        onComplete={() => setDone(true)}
      />
      {done && <div style={{ color: "var(--vf-green)" }}>Code entered: {code}</div>}
    </VStack>
  );
}
render(<Example />);`,
      },
    ],
  },
  TagInput: {
    summary: (
      <p>
        Chip-based multi-entry field. Type and press Enter (or comma) to add
        tags. Backspace removes the last tag. Supports paste of multiple values.
      </p>
    ),
    examples: [
      {
        title: "Editable tags",
        code: `function Example() {
  const [tags, setTags] = useState(["react", "typescript"]);
  return (
    <TagInput
      label="Skills"
      value={tags}
      onChange={setTags}
      placeholder="Add a skill..."
      maxTags={8}
    />
  );
}
render(<Example />);`,
      },
    ],
  },
  DatePicker: {
    summary: (
      <p>
        Calendar-based date selector with keyboard navigation, min/max
        constraints, and configurable date format.
      </p>
    ),
    examples: [
      {
        title: "Pick a date",
        code: `function Example() {
  const [date, setDate] = useState(null);
  return (
    <VStack gap={8}>
      <DatePicker
        label="Start date"
        value={date}
        onChange={setDate}
        placeholder="YYYY-MM-DD"
      />
      {date && <div>Selected: {date.toLocaleDateString()}</div>}
    </VStack>
  );
}
render(<Example />);`,
      },
    ],
  },
  SegmentedControl: {
    summary: (
      <p>
        Pill-style radio group for switching between a small set of options.
        Supports arrow-key navigation and disabled segments.
      </p>
    ),
    examples: [
      {
        title: "View switcher",
        code: `function Example() {
  const [view, setView] = useState("grid");
  return (
    <SegmentedControl
      value={view}
      onChange={setView}
      options={[
        { value: "list", label: "List" },
        { value: "grid", label: "Grid" },
        { value: "board", label: "Board" },
      ]}
    />
  );
}
render(<Example />);`,
      },
    ],
  },
  FormField: {
    summary: (
      <p>
        Layout wrapper that adds a label, optional required marker,
        help text, and error message around any form control.
      </p>
    ),
    examples: [
      {
        title: "Complete field",
        code: `function Example() {
  const [val, setVal] = useState("");
  const error = val.length > 0 && val.length < 3 ? "Must be at least 3 characters" : "";
  return (
    <FormField
      label="Username"
      required
      error={error}
      help={!error ? "Choose a unique username" : undefined}
    >
      <Input value={val} onValueChange={setVal} placeholder="e.g. janedoe" />
    </FormField>
  );
}
render(<Example />);`,
      },
    ],
  },
  Avatar: {
    summary: (
      <p>
        Circular (or square) identity badge with image, initials fallback,
        and optional status indicator.
      </p>
    ),
    examples: [
      {
        title: "Sizes and status",
        code: `<div style={{ display: "flex", gap: 12, alignItems: "center" }}>
  <Avatar name="Alice Park" size={24} status="online" />
  <Avatar name="Bob Chen" size={32} status="busy" />
  <Avatar name="Carol Wu" size={40} status="away" />
  <Avatar name="Dan Kim" size={48} status="offline" />
  <Avatar name="Eve Rho" size={56} square />
</div>`,
      },
    ],
  },
  Tag: {
    summary: (
      <p>
        Compact inline label with optional remove button and accent color.
        Use for status tags, filter chips, and category markers.
      </p>
    ),
    examples: [
      {
        title: "Variants",
        code: `function Example() {
  const [tags, setTags] = useState(["Default", "Danger", "Success", "Removable"]);
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      <Tag>Default</Tag>
      <Tag color="var(--vf-red)">Danger</Tag>
      <Tag color="var(--vf-green)">Success</Tag>
      <Tag color="var(--vf-blue)" onRemove={() => {}}>Removable</Tag>
    </div>
  );
}
render(<Example />);`,
      },
    ],
  },
  Tooltip: {
    summary: (
      <p>
        Hover-triggered tooltip that displays contextual information above,
        below, or beside the trigger element.
      </p>
    ),
    examples: [
      {
        title: "Hover tooltip",
        code: `<div style={{ display: "flex", gap: 16 }}>
  <Tooltip content="Save your work" position="top">
    <Button>Hover me</Button>
  </Tooltip>
  <Tooltip content="Opens settings panel" position="bottom">
    <Button variant="ghost">Settings</Button>
  </Tooltip>
</div>`,
      },
    ],
  },
  Code: {
    summary: (
      <p>
        Inline or block code display. Use <code>inline</code> for short
        snippets within text, or the default block mode for multi-line output.
      </p>
    ),
    examples: [
      {
        title: "Inline and block",
        code: `<VStack gap={8}>
  <p>
    Run <Code inline>npm install voidframe</Code> to get started.
  </p>
  <Code>{"const x = 42;\\nconst y = x * 2;\\nconsole.log(y);"}</Code>
</VStack>`,
      },
    ],
  },
  Kbd: {
    summary: (
      <p>
        Keyboard key display styled as a physical keycap.
        Accepts a <code>keys</code> string for combos or children for a single key.
      </p>
    ),
    examples: [
      {
        title: "Keyboard shortcuts",
        code: `<div style={{ display: "flex", gap: 12, alignItems: "center" }}>
  <Kbd keys="Ctrl+Shift+P" />
  <Kbd keys="Cmd+K" />
  <Kbd>Esc</Kbd>
  <Kbd>Enter</Kbd>
</div>`,
      },
    ],
  },
  Skeleton: {
    summary: (
      <p>
        Animated placeholder shapes for content that has not loaded yet.
        Supports text lines, rectangles, and circles with pulse or shimmer
        animation.
      </p>
    ),
    examples: [
      {
        title: "Loading shapes",
        code: `<VStack gap={12}>
  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
    <Skeleton shape="circle" height={40} />
    <div style={{ flex: 1 }}>
      <Skeleton shape="text" lines={2} height={12} />
    </div>
  </div>
  <Skeleton shape="rect" height={120} width="100%" />
  <Skeleton shape="text" lines={3} animation="shimmer" />
</VStack>`,
      },
    ],
  },
  Progress: {
    summary: (
      <p>
        Horizontal progress bar with label, value display, and multiple
        tones. Supports determinate and indeterminate variants.
      </p>
    ),
    examples: [
      {
        title: "Multiple bars",
        code: `<VStack gap={12}>
  <Progress label="Upload" value={75} max={100} showValue tone="neutral" />
  <Progress label="Build" value={100} max={100} showValue tone="success" />
  <Progress label="Errors" value={30} max={100} showValue tone="danger" />
  <Progress label="Processing" variant="indeterminate" />
</VStack>`,
      },
    ],
  },
  Spinner: {
    summary: (
      <p>
        Spinning loading indicator in multiple sizes. Renders with{" "}
        <code>role="status"</code> for screen readers.
      </p>
    ),
    examples: [
      {
        title: "Sizes",
        code: `<div style={{ display: "flex", gap: 16, alignItems: "center" }}>
  <Spinner size={12} />
  <Spinner size={20} />
  <Spinner size={32} />
  <Spinner size={48} color="var(--vf-blue)" />
</div>`,
      },
    ],
  },
  StatusIndicator: {
    summary: (
      <p>
        Colored dot with an optional label to convey presence or
        system status at a glance.
      </p>
    ),
    examples: [
      {
        title: "All statuses",
        code: `<div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
  <StatusIndicator status="online" label="Online" />
  <StatusIndicator status="offline" label="Offline" />
  <StatusIndicator status="busy" label="Busy" />
  <StatusIndicator status="away" label="Away" />
  <StatusIndicator status="loading" label="Loading" />
</div>`,
      },
    ],
  },
  EmptyState: {
    summary: (
      <p>
        Centered placeholder for pages or panels with no data.
        Includes an optional icon, title, description, and call-to-action button.
      </p>
    ),
    examples: [
      {
        title: "No data",
        code: `<EmptyState
  icon={<span style={{ fontSize: 32 }}>📭</span>}
  title="No messages yet"
  description="When you receive messages they will appear here."
  action={<Button variant="primary">Compose</Button>}
/>`,
      },
    ],
  },
  Timeline: {
    summary: (
      <p>
        Vertical event timeline with colored dots, timestamps, and optional
        content. Use the compound <code>Timeline.Item</code> API for rich entries.
      </p>
    ),
    examples: [
      {
        title: "4-event timeline",
        code: `<Timeline>
  <Timeline.Item title="Created" time="9:00 AM" tone="success" description="Project repository initialized." />
  <Timeline.Item title="In Progress" time="10:30 AM" tone="warning" description="Development work started." />
  <Timeline.Item title="Review" time="2:00 PM" tone="neutral" description="Pull request opened for review." />
  <Timeline.Item title="Deployed" time="4:15 PM" tone="success" description="Released to production." />
</Timeline>`,
      },
    ],
  },
  MetricCard: {
    summary: (
      <p>
        KPI display card with title, large value, trend delta, and optional
        sparkline. Use inside a grid for dashboard layouts.
      </p>
    ),
    examples: [
      {
        title: "KPI with trend",
        code: `<div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
  <MetricCard
    title="Revenue"
    value="\$48,200"
    delta={{ value: 12.5, direction: "up" }}
    tone="success"
  />
  <MetricCard
    title="Churn"
    value="3.2%"
    delta={{ value: 0.8, direction: "down" }}
    tone="danger"
  />
  <MetricCard
    title="Users"
    value="1,284"
    subtitle="Last 30 days"
  />
</div>`,
      },
    ],
  },
  Table: {
    summary: (
      <p>
        Data table with sortable columns, striped rows, and adaptive
        mobile layout. Supports controlled and uncontrolled sort state.
      </p>
    ),
    examples: [
      {
        title: "Sortable table",
        code: `<Table
  striped
  bordered
  columns={[
    { key: "name", header: "Name", sortable: true },
    { key: "role", header: "Role", sortable: true },
    { key: "status", header: "Status" },
    { key: "joined", header: "Joined", sortable: true },
  ]}
  data={[
    { name: "Alice Park", role: "Engineer", status: "Active", joined: "2024-01" },
    { name: "Bob Chen", role: "Designer", status: "Active", joined: "2024-03" },
    { name: "Carol Wu", role: "PM", status: "On leave", joined: "2023-11" },
    { name: "Dan Kim", role: "Engineer", status: "Active", joined: "2024-06" },
    { name: "Eve Rho", role: "QA", status: "Active", joined: "2024-02" },
  ]}
  defaultSort={{ key: "name", direction: "asc" }}
/>`,
      },
    ],
  },
  Breadcrumb: {
    summary: (
      <p>
        Accessible breadcrumb navigation with separator customization
        and optional collapse for deep hierarchies.
      </p>
    ),
    examples: [
      {
        title: "3-level trail",
        code: `<Breadcrumb
  items={[
    { label: "Home", href: "#" },
    { label: "Projects", href: "#" },
    { label: "voidframe" },
  ]}
  separator="/"
/>`,
      },
    ],
  },
  Pagination: {
    summary: (
      <p>
        Page navigation with previous/next buttons, ellipsis collapse,
        and optional first/last jumps.
      </p>
    ),
    examples: [
      {
        title: "10-page navigation",
        code: `function Example() {
  const [page, setPage] = useState(1);
  return (
    <VStack gap={8}>
      <Pagination
        page={page}
        totalPages={10}
        onChange={setPage}
        showFirstLast
      />
      <div style={{ fontSize: 12, color: "var(--vf-text-4)" }}>
        Page {page} of 10
      </div>
    </VStack>
  );
}
render(<Example />);`,
      },
    ],
  },
  Stepper: {
    summary: (
      <p>
        Step-by-step wizard indicator with numbered or dotted bullets.
        Supports horizontal and vertical orientations and clickable steps.
      </p>
    ),
    examples: [
      {
        title: "4-step wizard",
        code: `function Example() {
  const [step, setStep] = useState(1);
  return (
    <VStack gap={12}>
      <Stepper
        steps={["Account", "Profile", "Settings", "Confirm"]}
        current={step}
        clickable
        onChange={setStep}
      />
      <div style={{ display: "flex", gap: 8 }}>
        <Button disabled={step <= 0} onClick={() => setStep(step - 1)}>Back</Button>
        <Button variant="primary" disabled={step >= 3} onClick={() => setStep(step + 1)}>Next</Button>
      </div>
    </VStack>
  );
}
render(<Example />);`,
      },
    ],
  },
  Accordion: {
    summary: (
      <p>
        Compound collapsible sections with WAI-ARIA keyboard navigation.
        Supports single or multiple open panels.
      </p>
    ),
    examples: [
      {
        title: "3 panels",
        code: `<Accordion type="single" defaultValue="item-1" collapsible>
  <Accordion.Item value="item-1">
    <Accordion.Trigger>What is voidframe?</Accordion.Trigger>
    <Accordion.Content>
      <div style={{ padding: "8px 0" }}>
        A developer-focused React component library with 200+ components, dark-first theming, and built-in dev tools.
      </div>
    </Accordion.Content>
  </Accordion.Item>
  <Accordion.Item value="item-2">
    <Accordion.Trigger>Is it accessible?</Accordion.Trigger>
    <Accordion.Content>
      <div style={{ padding: "8px 0" }}>
        Yes. All interactive components follow WAI-ARIA patterns with full keyboard support.
      </div>
    </Accordion.Content>
  </Accordion.Item>
  <Accordion.Item value="item-3">
    <Accordion.Trigger>How do I install it?</Accordion.Trigger>
    <Accordion.Content>
      <div style={{ padding: "8px 0" }}>
        Run npm install voidframe and import the components you need.
      </div>
    </Accordion.Content>
  </Accordion.Item>
</Accordion>`,
      },
    ],
  },
  Collapsible: {
    summary: (
      <p>
        Single collapsible panel with a clickable header.
        Supports controlled and uncontrolled open state.
      </p>
    ),
    examples: [
      {
        title: "Expand and collapse",
        code: `<Collapsible title="Advanced options" defaultOpen={false}>
  <div style={{ padding: "8px 0" }}>
    <VStack gap={8}>
      <Toggle label="Enable caching" defaultChecked />
      <Toggle label="Verbose logging" />
      <Toggle label="Experimental features" />
    </VStack>
  </div>
</Collapsible>`,
      },
    ],
  },
  Card: {
    summary: (
      <p>
        Bordered content container with optional title, subtitle, and
        footer actions. Add <code>hoverable</code> for interactive cards.
      </p>
    ),
    examples: [
      {
        title: "Card with actions",
        code: `<Card
  title="Deployment"
  subtitle="Production environment"
  padding={16}
  hoverable
  actions={
    <div style={{ display: "flex", gap: 8 }}>
      <Button variant="ghost">Cancel</Button>
      <Button variant="primary">Deploy</Button>
    </div>
  }
>
  <div style={{ padding: "8px 0", color: "var(--vf-text-3)" }}>
    Last deployed 2 hours ago. All health checks passing.
  </div>
</Card>`,
      },
    ],
  },
  AlertV2: {
    summary: (
      <p>
        Inline alert banner with tone-based coloring, optional icon,
        dismiss button, and action slot.
      </p>
    ),
    examples: [
      {
        title: "Warning with dismiss",
        code: `<VStack gap={8}>
  <AlertV2 tone="warning" title="Rate limit approaching" dismissible>
    You have used 90% of your API quota this month.
  </AlertV2>
  <AlertV2 tone="success" title="Deployment complete">
    Version 2.4.1 is now live in production.
  </AlertV2>
  <AlertV2 tone="danger" title="Build failed" action={<Button size="sm">View logs</Button>}>
    Exit code 1 in step 3 of 5.
  </AlertV2>
</VStack>`,
      },
    ],
  },
  Callout: {
    summary: (
      <p>
        Aside block for tips, notes, and warnings. Five tones match the
        platform semantic colors.
      </p>
    ),
    examples: [
      {
        title: "Info callout",
        code: `<Callout tone="info" title="Good to know" icon="i">
  <p style={{ margin: 0 }}>
    All voidframe components support the <code>className</code> and{" "}
    <code>style</code> props for custom overrides.
  </p>
</Callout>`,
      },
    ],
  },
  BannerAlert: {
    summary: (
      <p>
        Full-width banner for page-level announcements. Supports an icon,
        action button, and dismissible close.
      </p>
    ),
    examples: [
      {
        title: "Success banner",
        code: `<BannerAlert
  tone="success"
  dismissible
  icon={<span>✓</span>}
  action={<Button size="sm" variant="ghost">View</Button>}
>
  Your changes have been saved successfully.
</BannerAlert>`,
      },
    ],
  },
  CodeBlock: {
    summary: (
      <p>
        Syntax-highlighted code display with line numbers, line highlighting,
        copy button, and optional search.
      </p>
    ),
    examples: [
      {
        title: "JavaScript snippet",
        code: `<CodeBlock
  language="javascript"
  lineNumbers
  copyable
  fileName="example.js"
  code={\`function greet(name) {
  const message = "Hello, " + name + "!";
  console.log(message);
  return message;
}

greet("World");\`}
/>`,
      },
    ],
  },
  JSONViewer: {
    summary: (
      <p>
        Interactive JSON tree with expandable nodes, data type badges,
        and path copying. Configurable default expansion depth.
      </p>
    ),
    examples: [
      {
        title: "Nested object",
        code: `<JSONViewer
  data={{
    name: "voidframe",
    version: "1.0.0",
    features: ["components", "charts", "dev-tools"],
    config: {
      theme: "dark",
      locale: "en",
      debug: false,
    },
    stats: {
      components: 200,
      downloads: 15000,
    },
  }}
  defaultExpanded={2}
  showDataTypes
/>`,
      },
    ],
  },
  DiffViewer: {
    summary: (
      <p>
        Side-by-side or unified diff display with word-level highlighting
        for changed lines.
      </p>
    ),
    examples: [
      {
        title: "Code diff",
        code: `<DiffViewer
  variant="split"
  showLineNumbers
  oldValue={\`function add(a, b) {
  return a + b;
}

const result = add(1, 2);
console.log(result);\`}
  newValue={\`function add(a, b) {
  if (typeof a !== "number") throw new Error("a must be number");
  return a + b;
}

const result = add(1, 2);
console.log("Result:", result);\`}
/>`,
      },
    ],
  },
  Terminal: {
    summary: (
      <p>
        Terminal emulator with command input, history navigation (up/down
        arrows), and configurable prompt.
      </p>
    ),
    examples: [
      {
        title: "Interactive terminal",
        code: `function Example() {
  const [lines, setLines] = useState([
    "Welcome to voidframe terminal.",
    "Type a command and press Enter.",
  ]);
  return (
    <Terminal
      lines={lines}
      prompt="\$"
      height={200}
      autoFocus
      onCommand={(cmd) => {
        setLines((prev) => [...prev, "\$ " + cmd, "command not found: " + cmd]);
      }}
    />
  );
}
render(<Example />);`,
      },
    ],
  },
  LogViewer: {
    summary: (
      <p>
        Scrollable log output with level filtering, regex search, auto-scroll,
        and pause/resume for streaming logs.
      </p>
    ),
    examples: [
      {
        title: "Log entries",
        code: `<LogViewer
  height={200}
  entries={[
    { timestamp: "10:00:01", level: "info", message: "Server started on port 3000" },
    { timestamp: "10:00:02", level: "info", message: "Connected to database" },
    { timestamp: "10:00:05", level: "warn", message: "Cache miss for key: user_123" },
    { timestamp: "10:00:08", level: "error", message: "Failed to fetch /api/data: timeout" },
    { timestamp: "10:00:09", level: "debug", message: "Retrying request (attempt 2/3)" },
    { timestamp: "10:00:10", level: "info", message: "Request succeeded after retry" },
  ]}
/>`,
      },
    ],
  },
  Quote: {
    summary: (
      <p>
        Styled blockquote with optional citation source and author attribution.
      </p>
    ),
    examples: [
      {
        title: "With attribution",
        code: `<Quote source="Grace Hopper">
  The most dangerous phrase in the language is: we have always done it this way.
</Quote>`,
      },
    ],
  },
};
