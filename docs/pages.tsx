import type { ReactNode } from "react";
import {
  Button,
  Badge,
  BarChart,
  Tabs,
  DevPanel,
  PopoverV2,
  Dialog,
  Select,
  Playground,
  PropsTable,
  Text,
} from "../src";
import { playgroundScope } from "./scope";
import { getPropsFor } from "./App";

export interface DocPage {
  id: string;
  title: string;
  subtitle?: string;
  group?: string;
  render: () => ReactNode;
}

function IntroPage() {
  return (
    <div className="vf-docs__block">
      <Text>
        Voidframe is a dark, monochrome, terminal-brutalist React UI framework.
        Every component is hand-rolled, themed through a single set of
        <code> --vf-* </code> CSS custom properties, and designed for
        data-dense interfaces.
      </Text>
      <Text>
        Use the sidebar to browse component docs. Each entry ships with a
        live <b>Playground</b> you can edit in-browser, plus an auto-generated
        props table. The 491 components indexed here come from the surface
        exported by <code>voidframe</code>.
      </Text>
      <Text>
        <b>Getting started:</b>
      </Text>
      <pre
        style={{
          padding: "8px 12px",
          background: "var(--vf-bg-0)",
          border: "1px solid var(--vf-border-1)",
          fontFamily: "var(--vf-font-family)",
          fontSize: "var(--vf-fs-1)",
          color: "var(--vf-text-0)",
          overflowX: "auto",
        }}
      >
{`npm install voidframe
import "voidframe/styles.css";
import { VoidframeProvider, Button } from "voidframe";`}
      </pre>
    </div>
  );
}

function Block({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="vf-docs__block">
      <Text
        size="sm"
        upper
        spacing={2}
        color="var(--vf-text-2)"
        style={{ marginBottom: 8 }}
      >
        {title}
      </Text>
      {children}
    </section>
  );
}

function ComponentPage({
  name,
  summary,
  examples,
}: {
  name: string;
  summary: ReactNode;
  examples: { title: string; code: string; noInline?: boolean }[];
}) {
  const doc = getPropsFor(name);
  return (
    <div>
      <Block title="Summary">{summary}</Block>
      {examples.map((ex) => (
        <Block key={ex.title} title={ex.title}>
          <Playground
            title={ex.title}
            code={ex.code}
            scope={playgroundScope}
            paneHeight={220}
            // Auto-detect: any snippet that calls `render(` needs noInline mode.
            noInline={ex.noInline ?? /\brender\s*\(/.test(ex.code)}
          />
        </Block>
      ))}
      <Block title="Props">
        <PropsTable
          doc={doc}
          exclude={["className", "style", "children"]}
        />
      </Block>
    </div>
  );
}

export const pages: DocPage[] = [
  {
    id: "intro",
    title: "Introduction",
    group: "Overview",
    render: () => <IntroPage />,
  },
  {
    id: "button",
    title: "Button",
    group: "Core",
    render: () => (
      <ComponentPage
        name="Button"
        summary={
          <Text>
            The canonical interactive element. Supports several tones
            (default / primary / ghost / danger) and can accept a tone accent
            that recolors the border and focus ring.
          </Text>
        }
        examples={[
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
        ]}
      />
    ),
  },
  {
    id: "badge",
    title: "Badge",
    group: "Core",
    render: () => (
      <ComponentPage
        name="Badge"
        summary={
          <Text>
            Compact inline label for status, counts, and tags. Five tones mirror
            the platform semantic colors.
          </Text>
        }
        examples={[
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
        ]}
      />
    ),
  },
  {
    id: "tabs",
    title: "Tabs",
    group: "Navigation",
    render: () => (
      <ComponentPage
        name="Tabs"
        summary={
          <Text>
            Keyboard-navigable tablist. Arrow keys cycle between tabs, Home/End
            jump to the first/last. The <code>active</code> value is controlled.
          </Text>
        }
        examples={[
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
        ]}
      />
    ),
  },
  {
    id: "select",
    title: "Select",
    group: "Forms",
    render: () => (
      <ComponentPage
        name="Select"
        summary={
          <Text>
            Thin wrapper over the native <code>&lt;select&gt;</code>. Issues a
            runtime warning if options have duplicate values or if the
            controlled value doesn't match any option.
          </Text>
        }
        examples={[
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
        ]}
      />
    ),
  },
  {
    id: "popover",
    title: "PopoverV2",
    group: "Overlays",
    render: () => (
      <ComponentPage
        name="PopoverV2"
        summary={
          <Text>
            Anchored popover with viewport-flip + edge-clamp positioning. Reuses
            the shared <code>computeAnchoredPosition</code> from
            {" "}<code>src/utils/anchor.ts</code>.
          </Text>
        }
        examples={[
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
        ]}
      />
    ),
  },
  {
    id: "dialog",
    title: "Dialog",
    group: "Overlays",
    render: () => (
      <ComponentPage
        name="Dialog"
        summary={
          <Text>
            Modal overlay with focus trap and escape-to-close. The content is
            portaled to the document body.
          </Text>
        }
        examples={[
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
        ]}
      />
    ),
  },
  {
    id: "barchart",
    title: "BarChart",
    group: "Charts",
    render: () => (
      <ComponentPage
        name="BarChart"
        summary={
          <Text>
            Vertical bar chart with tooltip, legend, and axis primitives. Pairs
            with <code>AreaChart</code>, <code>LineChart</code>, and other
            core-chart surfaces.
          </Text>
        }
        examples={[
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
        ]}
      />
    ),
  },
  {
    id: "devpanel",
    title: "DevPanel",
    group: "Dev",
    render: () => (
      <ComponentPage
        name="DevPanel"
        summary={
          <Text>
            Floating dev HUD that surfaces render profiler scopes, captured
            warnings, and theme tokens. Production builds render nothing unless
            {" "}<code>showInProduction</code> is set.
          </Text>
        }
        examples={[
          {
            title: "Drop into any app root",
            code: `<DevPanel position="br" defaultTab="theme" />`,
          },
        ]}
      />
    ),
  },
];
