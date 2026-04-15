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
};
