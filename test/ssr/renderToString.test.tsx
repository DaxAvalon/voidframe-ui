// SSR smoke tests — verifies all major components render to an HTML string
// without errors (Next.js / Remix SSR compatibility).
//
// Each component is wrapped in VoidframeProvider and rendered via
// react-dom/server's `renderToString`. If any component references
// `window` / `document` at the top level or during render, this test
// surfaces it.

import { describe, expect, it } from "vitest";
import { renderToString } from "react-dom/server";
import React from "react";

// ── Provider ────────────────────────────────────────────────────
import { VoidframeProvider } from "../../src/provider/VoidframeProvider";

// ── Layout ──────────────────────────────────────────────────────
import {
  Flex,
  HStack,
  VStack,
  Grid,
  Container,
  Center,
  AspectRatio,
  SplitView,
  Stretch,
  Box,
} from "../../src/components/Layout";

// ── Text ────────────────────────────────────────────────────────
import { Text, Label, Divider, Spacer } from "../../src/components/Text";

// ── Button ──────────────────────────────────────────────────────
import { Button, ButtonGroup } from "../../src/components/Button";

// ── Form basics ─────────────────────────────────────────────────
import { Input, Textarea, Toggle, Select } from "../../src/components/Form";

// ── Data display ────────────────────────────────────────────────
import { Table, Stat, Progress } from "../../src/components/Data";

// ── Phase 1 new components ──────────────────────────────────────
import { Transfer } from "../../src/components/Transfer";
import { SplitButton } from "../../src/components/SplitButton";
import { InlineEdit } from "../../src/components/InlineEdit";
import { NotificationBadge } from "../../src/components/NotificationBadge";
import { ToggleGroup } from "../../src/components/ToggleGroup";
import { NumberStepper } from "../../src/components/NumberStepper";
import { CopyButton } from "../../src/components/CopyButton";
import { Result } from "../../src/components/Result";
import { Comment } from "../../src/components/Comment";
import { LiveIndicator } from "../../src/components/LiveIndicator";
import { MultiProgress } from "../../src/components/MultiProgress";
import { ConfidenceMeter } from "../../src/components/ConfidenceMeter";
import { ColorContrast } from "../../src/components/ColorContrast";
import { Anchor } from "../../src/components/Anchor";
import { Cascader } from "../../src/components/Cascader";
import { HorizontalTimeline } from "../../src/components/HorizontalTimeline";
import { Descriptions } from "../../src/components/Descriptions";
import { FloatingActionButton } from "../../src/components/FloatingActionButton";
import { CommandInput } from "../../src/components/CommandInput";
import { HexDump } from "../../src/components/HexDump";
import { CronBuilder } from "../../src/components/CronBuilder";
import { EnvironmentVars } from "../../src/components/EnvironmentVars";
import { FilterBuilder } from "../../src/components/FilterBuilder";
import { CSVViewer } from "../../src/components/CSVViewer";
import { ImageDiff } from "../../src/components/ImageDiff";
import { RegExpTester } from "../../src/components/RegExpTester";
import { ModelCompare } from "../../src/components/ModelCompare";
import { TokenVisualizer } from "../../src/components/TokenVisualizer";

// Popconfirm uses Portal — tested separately with error handling
import { Popconfirm } from "../../src/components/Popconfirm";

// ── Helper ──────────────────────────────────────────────────────

const wrap = (ui: React.ReactElement) =>
  renderToString(<VoidframeProvider>{ui}</VoidframeProvider>);

// ── Component definitions with minimal required props ───────────

const ssrComponents: Array<{ name: string; element: React.ReactElement }> = [
  // Layout
  { name: "Flex", element: <Flex>content</Flex> },
  { name: "HStack", element: <HStack>content</HStack> },
  { name: "VStack", element: <VStack>content</VStack> },
  { name: "Grid", element: <Grid>content</Grid> },
  { name: "Container", element: <Container>content</Container> },
  { name: "Center", element: <Center>content</Center> },
  { name: "AspectRatio", element: <AspectRatio ratio={16 / 9}><div>content</div></AspectRatio> },
  { name: "SplitView", element: <SplitView><div>left</div><div>right</div></SplitView> },
  { name: "Stretch", element: <Stretch>content</Stretch> },
  { name: "Box", element: <Box>content</Box> },

  // Text
  { name: "Text", element: <Text>Hello</Text> },
  { name: "Label", element: <Label>Label</Label> },
  { name: "Divider", element: <Divider /> },
  { name: "Spacer", element: <Spacer /> },

  // Button
  { name: "Button", element: <Button>Click</Button> },
  { name: "ButtonGroup", element: <ButtonGroup options={[{ value: "a", label: "A" }]} /> },

  // Form
  { name: "Input", element: <Input label="Name" /> },
  { name: "Textarea", element: <Textarea label="Bio" /> },
  { name: "Toggle", element: <Toggle label="On" /> },
  { name: "Select", element: <Select label="Choice" options={[{ value: "a", label: "A" }]} /> },

  // Data
  { name: "Stat", element: <Stat label="Users" value="1000" /> },
  { name: "Progress", element: <Progress value={50} /> },
  {
    name: "Table",
    element: (
      <Table
        columns={[{ key: "name", header: "Name" }]}
        data={[{ name: "Ada" }]}
      />
    ),
  },

  // Phase 1 new components
  {
    name: "Transfer",
    element: <Transfer items={[{ key: "a", label: "A" }, { key: "b", label: "B" }]} />,
  },
  {
    name: "SplitButton",
    element: (
      <SplitButton
        label="Save"
        onClick={() => {}}
        actions={[{ key: "draft", label: "Save as draft" }]}
        onAction={() => {}}
      />
    ),
  },
  { name: "InlineEdit", element: <InlineEdit value="test" onSave={() => {}} /> },
  {
    name: "NotificationBadge",
    element: <NotificationBadge count={5}><span>icon</span></NotificationBadge>,
  },
  {
    name: "ToggleGroup",
    element: (
      <ToggleGroup
        items={[
          { key: "a", label: "A" },
          { key: "b", label: "B" },
        ]}
      />
    ),
  },
  { name: "NumberStepper", element: <NumberStepper /> },
  { name: "CopyButton", element: <CopyButton text="copy me" /> },
  { name: "Result", element: <Result status="success" title="Done" /> },
  { name: "Comment", element: <Comment author="Alice" content="Hello" /> },
  { name: "LiveIndicator", element: <LiveIndicator /> },
  {
    name: "MultiProgress",
    element: (
      <MultiProgress
        items={[{ key: "a", label: "Upload", value: 50 }]}
      />
    ),
  },
  { name: "ConfidenceMeter", element: <ConfidenceMeter value={0.8} /> },
  {
    name: "ColorContrast",
    element: <ColorContrast foreground="#000000" background="#ffffff" />,
  },
  {
    name: "Anchor",
    element: (
      <Anchor
        items={[{ key: "intro", label: "Introduction", href: "#intro" }]}
      />
    ),
  },
  {
    name: "Cascader",
    element: (
      <Cascader
        options={[{ value: "us", label: "US", children: [{ value: "ca", label: "CA" }] }]}
      />
    ),
  },
  {
    name: "HorizontalTimeline",
    element: (
      <HorizontalTimeline
        events={[
          { key: "a", label: "Start", status: "completed" },
          { key: "b", label: "End", status: "pending" },
        ]}
      />
    ),
  },
  {
    name: "Descriptions",
    element: (
      <Descriptions
        items={[{ key: "name", label: "Name", value: "Ada" }]}
      />
    ),
  },
  {
    name: "FloatingActionButton",
    element: <FloatingActionButton icon="+" onClick={() => {}} />,
  },
  {
    name: "CommandInput",
    element: <CommandInput onSubmit={() => {}} />,
  },
  {
    name: "HexDump",
    element: <HexDump data={new Uint8Array([0x48, 0x65, 0x6c, 0x6c, 0x6f])} />,
  },
  { name: "CronBuilder", element: <CronBuilder /> },
  {
    name: "EnvironmentVars",
    element: (
      <EnvironmentVars
        value={[{ key: "NODE_ENV", value: "production" }]}
      />
    ),
  },
  {
    name: "FilterBuilder",
    element: (
      <FilterBuilder
        fields={[{ key: "name", label: "Name", type: "string" }]}
      />
    ),
  },
  {
    name: "CSVViewer",
    element: <CSVViewer data="name,age\nAda,36" />,
  },
  {
    name: "ImageDiff",
    element: (
      <ImageDiff
        before="data:image/gif;base64,R0lGODlhAQABAIAAAP8AAP8AACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=="
        after="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP8AACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=="
      />
    ),
  },
  { name: "RegExpTester", element: <RegExpTester /> },
  {
    name: "ModelCompare",
    element: (
      <ModelCompare
        models={[
          { id: "a", name: "Model A" },
          { id: "b", name: "Model B" },
        ]}
      />
    ),
  },
  {
    name: "TokenVisualizer",
    element: <TokenVisualizer tokens={["Hello", " world"]} />,
  },
];

// ── Tests ───────────────────────────────────────────────────────

describe("SSR: renderToString", () => {
  for (const { name, element } of ssrComponents) {
    it(`${name} renders to string without errors`, () => {
      expect(() => wrap(element)).not.toThrow();
    });

    it(`${name} produces non-empty HTML`, () => {
      const html = wrap(element);
      expect(html.length).toBeGreaterThan(0);
    });
  }

  it("VoidframeProvider renders wrapper with vf-root", () => {
    const html = renderToString(
      <VoidframeProvider>
        <div>test</div>
      </VoidframeProvider>
    );
    expect(html).toContain("vf-root");
  });

  // Popconfirm uses Portal which may behave differently in SSR.
  // Test it separately so a Portal-related failure is isolated.
  it("Popconfirm renders to string without errors (portal component)", () => {
    expect(() =>
      wrap(
        <Popconfirm title="Delete?" onConfirm={() => {}}>
          <button>Delete</button>
        </Popconfirm>
      )
    ).not.toThrow();
  });

  it("Popconfirm produces non-empty HTML", () => {
    const html = wrap(
      <Popconfirm title="Delete?" onConfirm={() => {}}>
        <button>Delete</button>
      </Popconfirm>
    );
    expect(html.length).toBeGreaterThan(0);
  });

  // Verify components that accept complex props render correctly
  it("Transfer with searchable and titles renders", () => {
    const html = wrap(
      <Transfer
        items={[
          { key: "1", label: "One" },
          { key: "2", label: "Two" },
          { key: "3", label: "Three" },
        ]}
        titles={["Source", "Target"]}
        searchable
      />
    );
    expect(html).toContain("Source");
    expect(html).toContain("Target");
  });

  it("Result with all status variants renders", () => {
    const statuses = ["success", "error", "warning", "info", "403", "404", "500"] as const;
    for (const status of statuses) {
      expect(() => wrap(<Result status={status} title={`Status: ${status}`} />)).not.toThrow();
    }
  });

  it("ConfidenceMeter variants all render", () => {
    const variants = ["bar", "gauge", "ring", "text-only"] as const;
    for (const variant of variants) {
      expect(() =>
        wrap(<ConfidenceMeter value={0.5} kind={variant} />)
      ).not.toThrow();
    }
  });

  it("NumberStepper with controlled value renders", () => {
    const html = wrap(<NumberStepper value={42} min={0} max={100} step={1} />);
    expect(html).toContain("42");
  });

  it("MultiProgress with multiple items renders all labels", () => {
    const html = wrap(
      <MultiProgress
        items={[
          { key: "a", label: "Upload", value: 80, status: "active" },
          { key: "b", label: "Process", value: 40, status: "success" },
          { key: "c", label: "Deploy", value: 0, status: "pending" },
        ]}
      />
    );
    expect(html).toContain("Upload");
    expect(html).toContain("Process");
    expect(html).toContain("Deploy");
  });
});
