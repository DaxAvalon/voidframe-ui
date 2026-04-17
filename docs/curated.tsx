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
    <PopoverV2
      open={open}
      onOpenChange={setOpen}
      trigger={<Button onClick={() => setOpen(!open)}>Open popover</Button>}
    >
      <div style={{ padding: 8 }}>
        <div>Hello from a popover.</div>
      </div>
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
        core-chart surfaces.
      </p>
    ),
    examples: [
      {
        title: "Single series",
        code: `<div style={{ width: "100%", maxWidth: 520 }}>
  <BarChart
    width={480}
    height={220}
    data={[
      { name: "Mon", value: 12 },
      { name: "Tue", value: 22 },
      { name: "Wed", value: 18 },
      { name: "Thu", value: 30 },
      { name: "Fri", value: 26 },
    ]}
    xKey="name"
    yKeys={["value"]}
  />
</div>`,
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
};
