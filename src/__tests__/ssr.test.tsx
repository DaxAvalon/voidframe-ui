// Phase 18 — SSR smoke test
//
// Renders a representative sample of every complexity tier to
// `renderToString`. If any component references `window` / `document`
// at the top level or in render, or throws during non-client execution,
// this test surfaces it.

import { describe, expect, it } from "vitest";
import { renderToString } from "react-dom/server";
import {
  VoidframeProvider,
  // Phase 0/1 — display primitives
  Text,
  Label,
  Divider,
  Badge,
  Button,
  Card,
  Code,
  Kbd,
  // Phase 1 — layout
  Flex,
  Grid,
  Container,
  Box,
  HStack,
  VStack,
  Stack,
  // Forms
  Input,
  Textarea,
  Toggle,
  Checkbox,
  RadioGroup,
  NumberInput,
  // Phase 9 — data display
  Table,
  Stat,
  Progress,
  EmptyState,
  // Phase 10 — toasts / overlays (non-portal renders)
  BannerAlert,
  Callout,
  AlertV2,
  // Phase 12 — chat
  Message,
  MessageContent,
  ThinkingIndicator,
  // Phase 13 — specialty
  BigNumber,
  DurationDisplay,
  UserCard,
  Identicon,
  QRCode,
  Barcode,
  // Phase 14 — icons
  Icon,
  SearchIcon,
  IconButton,
  // Phase 15 — theming
  ThemeSelector,
  ThemeScope,
  // Phase 16 — responsive
  Show,
  Hide,
  ResponsiveBox,
  // Phase 17 — i18n
  MessagesProvider,
  en,
  ja,
  ar,
  // Phase 18 — hydration
  HydrationBoundary,
  // Phase 10 — compound overlays
  Dialog,
  Combobox,
  Calendar,
  CommandPalette,
  DataGrid,
} from "..";

function wrap(node: React.ReactNode) {
  return <VoidframeProvider>{node}</VoidframeProvider>;
}

// Suppress React's "useLayoutEffect does nothing on the server" warning.
// happy-dom provides a window object so useIsomorphicLayoutEffect binds
// to useLayoutEffect at module load time. The warning is correct but
// noisy — the hook works correctly in real SSR (Node/Deno) where window
// is genuinely absent.
const _origError = console.error;
beforeAll(() => {
  console.error = (...args: unknown[]) => {
    if (String(args[0]).includes("useLayoutEffect does nothing")) return;
    _origError(...args);
  };
});
afterAll(() => {
  console.error = _origError;
});

describe("SSR — renderToString smoke tests", () => {
  it("renders the base provider", () => {
    expect(() => renderToString(wrap(<div>hello</div>))).not.toThrow();
  });

  it("renders display primitives (Text / Label / Divider)", () => {
    expect(() =>
      renderToString(
        wrap(
          <>
            <Text size="md">Body</Text>
            <Label>LABEL</Label>
            <Divider />
            <Code>code</Code>
            <Kbd keys="⌘K" />
            <Badge tone="success">Ok</Badge>
          </>
        )
      )
    ).not.toThrow();
  });

  it("renders layout primitives (Flex / Grid / Container)", () => {
    expect(() =>
      renderToString(
        wrap(
          <>
            <Flex direction="row" gap={8}>
              <Box>a</Box>
              <Box>b</Box>
            </Flex>
            <Grid columns={3} gap={8}>
              <div>1</div>
              <div>2</div>
              <div>3</div>
            </Grid>
            <Container maxWidth="1200px">x</Container>
            <HStack gap={4}>
              <div>h</div>
            </HStack>
            <VStack gap={4}>
              <div>v</div>
            </VStack>
            <Stack gap={4}>
              <div>s</div>
            </Stack>
          </>
        )
      )
    ).not.toThrow();
  });

  it("renders responsive Flex / Grid values", () => {
    expect(() =>
      renderToString(
        wrap(
          <Grid columns={{ base: 1, md: 3 }} gap={{ base: 4, md: 8 }}>
            <div>a</div>
            <div>b</div>
          </Grid>
        )
      )
    ).not.toThrow();
  });

  it("renders buttons and form controls in their idle state", () => {
    expect(() =>
      renderToString(
        wrap(
          <>
            <Button>OK</Button>
            <Input label="Name" value="" onChange={() => {}} />
            <Textarea label="Notes" value="" onChange={() => {}} />
            <Toggle label="Enable" checked={false} onValueChange={() => {}} />
            <Checkbox label="Agree" checked={false} onValueChange={() => {}} />
            <RadioGroup
              label="Size"
              value="a"
              onValueChange={() => {}}
              options={[{ value: "a", label: "A" }]}
            />
            <NumberInput label="Count" value={0} onValueChange={() => {}} />
          </>
        )
      )
    ).not.toThrow();
  });

  it("renders data display (Table / Stat / Progress / Card / EmptyState)", () => {
    expect(() =>
      renderToString(
        wrap(
          <>
            <Card title="Card">body</Card>
            <Stat label="Users" value="12" />
            <Progress value={40} label="Progress" />
            <Table
              columns={[{ key: "name", header: "Name" }]}
              data={[{ name: "Ada" }]}
            />
            <EmptyState title="Empty" />
          </>
        )
      )
    ).not.toThrow();
  });

  it("renders feedback banners (BannerAlert / Callout / AlertV2)", () => {
    expect(() =>
      renderToString(
        wrap(
          <>
            <BannerAlert tone="info" title="Heads up" />
            <Callout title="Note">hi</Callout>
            <AlertV2 tone="success">Saved</AlertV2>
          </>
        )
      )
    ).not.toThrow();
  });

  it("renders Phase 12 chat scaffolds (Message / MessageContent / ThinkingIndicator)", () => {
    expect(() =>
      renderToString(
        wrap(
          <>
            <Message role="assistant" content="Hello" />
            <MessageContent
              content={[
                { type: "text", text: "hi" },
                { type: "tool_use", name: "search_web" },
              ]}
            />
            <ThinkingIndicator duration={1200} />
          </>
        )
      )
    ).not.toThrow();
  });

  it("renders Phase 13 specialty (BigNumber / DurationDisplay / UserCard / Identicon)", () => {
    expect(() =>
      renderToString(
        wrap(
          <>
            <BigNumber value="12,345" unit="users" />
            <DurationDisplay seconds={3661} format="long" />
            <UserCard
              user={{ name: "Ada Lovelace", status: "online", title: "Eng" }}
            />
            <Identicon value="ada@example.com" />
            <QRCode value="https://voidframe.dev" />
            <Barcode value="SKU-001" />
          </>
        )
      )
    ).not.toThrow();
  });

  it("renders Phase 14 icons (Icon + bundled + IconButton)", () => {
    expect(() =>
      renderToString(
        wrap(
          <>
            <Icon size="md" label="Shape">
              <path d="M4 4h16v16H4z" />
            </Icon>
            <SearchIcon />
            <IconButton aria-label="Search">
              <SearchIcon />
            </IconButton>
          </>
        )
      )
    ).not.toThrow();
  });

  it("renders Phase 15 theming controls (ThemeSelector + ThemeScope)", () => {
    expect(() =>
      renderToString(
        wrap(
          <>
            <ThemeSelector
              defaultValue="dark"
              themes={[
                { id: "dark", label: "Dark" },
                { id: "light", label: "Light" },
              ]}
            />
            <ThemeScope themeName="midnight">
              <Text>scoped</Text>
            </ThemeScope>
          </>
        )
      )
    ).not.toThrow();
  });

  it("renders Phase 16 responsive primitives (Show / Hide / ResponsiveBox)", () => {
    expect(() =>
      renderToString(
        wrap(
          <>
            <Show above="md">desktop</Show>
            <Hide above="md">mobile</Hide>
            <ResponsiveBox display="grid" columns={{ base: 1, md: 2 }}>
              <div>a</div>
              <div>b</div>
            </ResponsiveBox>
          </>
        )
      )
    ).not.toThrow();
  });

  it("renders i18n provider scopes (en / ja / ar)", () => {
    for (const pack of [en, ja, ar]) {
      expect(() =>
        renderToString(
          <VoidframeProvider locale={pack}>
            <Text>
              <MessagesProvider locale={pack}>x</MessagesProvider>
            </Text>
          </VoidframeProvider>
        )
      ).not.toThrow();
    }
  });

  it("renders Dialog compound (closed state)", () => {
    expect(() =>
      renderToString(
        wrap(
          <Dialog>
            <Dialog.Trigger>Open</Dialog.Trigger>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>Hello</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>Body</Dialog.Body>
            </Dialog.Content>
          </Dialog>
        )
      )
    ).not.toThrow();
  });

  it("renders Combobox with minimal props", () => {
    expect(() =>
      renderToString(
        wrap(
          <Combobox
            label="Fruit"
            options={[
              { value: "apple", label: "Apple" },
              { value: "banana", label: "Banana" },
            ]}
          />
        )
      )
    ).not.toThrow();
  });

  it("renders Calendar with no props", () => {
    expect(() =>
      renderToString(wrap(<Calendar />))
    ).not.toThrow();
  });

  it("renders CommandPalette (closed state)", () => {
    expect(() =>
      renderToString(
        wrap(
          <CommandPalette shortcut={null}>
            <CommandPalette.Input placeholder="Search..." />
          </CommandPalette>
        )
      )
    ).not.toThrow();
  });

  it("renders DataGrid with minimal props", () => {
    expect(() =>
      renderToString(
        wrap(
          <DataGrid
            columns={[{ key: "name", header: "Name" }]}
            data={[{ name: "Ada" }]}
            rowKey={(row) => String(row.name)}
          />
        )
      )
    ).not.toThrow();
  });

  it("HydrationBoundary renders the fallback on server", () => {
    const html = renderToString(
      wrap(
        <HydrationBoundary fallback={<span>loading</span>}>
          <span>client content</span>
        </HydrationBoundary>
      )
    );
    expect(html).toContain("loading");
    expect(html).not.toContain("client content");
  });
});
