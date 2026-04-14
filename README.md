# VOIDFRAME

Dark monochrome React UI framework. Terminal-brutalist. Data-dense. Zero border-radius. Monospace-first.

Built for dashboards, dev tools, data interfaces, and anything that needs to feel like it was forged from the void.

---

## Install

```bash
npm install voidframe
```

Peer dependencies: `react >= 18.0.0`, `react-dom >= 18.0.0`

## Quick Start

```jsx
import {
  VoidframeProvider,
  Card,
  Button,
  Badge,
  Table,
  Stat,
} from "voidframe";

function App() {
  return (
    <VoidframeProvider>
      <div style={{ padding: 24 }}>
        <Card title="DASHBOARD">
          <Stat label="USERS" value="12,847" color="#4ade80" sub="last 30 days" />
          <Button variant="accent" accent="#4ade80">REFRESH</Button>
        </Card>
      </div>
    </VoidframeProvider>
  );
}
```

---

## Theming

### Provider

Wrap your app (or any subtree) in `VoidframeProvider`. All child components read tokens from context.

```jsx
import { VoidframeProvider } from "voidframe";

<VoidframeProvider>
  <App />
</VoidframeProvider>
```

### Custom Themes

Override any token via `createTheme()`:

```jsx
import { VoidframeProvider, createTheme } from "voidframe";

const warmVoid = createTheme({
  bg0: "#0a0806",
  bg1: "#0e0c0a",
  green: "#86efac",
  fontFamily: "'IBM Plex Mono', monospace",
});

<VoidframeProvider theme={warmVoid}>
  <App />
</VoidframeProvider>
```

### Light Theme

A built-in light theme is included:

```jsx
import { VoidframeProvider, lightTheme } from "voidframe";

<VoidframeProvider theme={lightTheme}>
  <App />
</VoidframeProvider>
```

### Accessing Tokens

Use the `useTokens()` hook inside any component to get the current theme:

```jsx
import { useTokens } from "voidframe";

function MyComponent() {
  const t = useTokens();
  return <div style={{ color: t.green, fontFamily: t.fontFamily }}>OK</div>;
}
```

---

## Design Tokens

| Category   | Tokens                                    | Purpose                        |
|------------|-------------------------------------------|--------------------------------|
| Surfaces   | `bg0` → `bg5`                             | 6 depth layers, no shadows     |
| Borders    | `border0` → `border4`                     | 5 tiers, subtle to prominent   |
| Text       | `text0` → `text5`                         | 6 levels, white to invisible   |
| Accents    | `green red amber blue purple cyan rose`   | Semantic color only             |
| Aliases    | `success danger warning info`             | Semantic shortcuts              |
| Typography | `fontFamily`, `fontXxs` → `font3xl`       | 8 sizes, monospace only        |
| Spacing    | `sp1` (2px) → `sp12` (48px)               | 12-step scale                  |
| Misc       | `radius` (always 0), `transition`         | Framework constants            |

---

## Components

### Primitives

#### `<Text>`
Generic text with token-aware sizing.

```jsx
<Text size="xl" color={t.green} upper>HEADING</Text>
<Text size="sm" color={t.text3}>Secondary text</Text>
<Text as="h1" size="xxl">Page Title</Text>
```

| Prop     | Type    | Default | Description              |
|----------|---------|---------|--------------------------|
| size     | string  | "md"    | xxs/xs/sm/md/lg/xl/xxl/3xl |
| color    | string  | text1   | Any color                |
| weight   | number  | 400     | Font weight              |
| spacing  | number  | 0       | Letter spacing           |
| upper    | boolean | false   | Uppercase transform      |
| as       | string  | "span"  | HTML element tag         |

#### `<Label>`
Uppercase metadata text (9px, letter-spaced).

```jsx
<Label>SECTION TITLE</Label>
<Label color={t.green}>ACTIVE</Label>
```

#### `<Divider>`, `<Spacer>`
```jsx
<Divider color={t.border2} spacing={16} />
<Spacer size={24} />
```

---

### Buttons

#### `<Button>`

```jsx
<Button>DEFAULT</Button>
<Button variant="accent" accent={t.green}>ACCENT</Button>
<Button variant="solid" accent={t.amber}>SOLID</Button>
<Button variant="ghost">GHOST</Button>
<Button active>ACTIVE</Button>
<Button disabled>DISABLED</Button>
<Button size="sm">SMALL</Button>
```

| Prop     | Type    | Default   | Description                    |
|----------|---------|-----------|--------------------------------|
| variant  | string  | "default" | default/ghost/accent/solid     |
| accent   | string  | text1     | Color for accent/solid         |
| size     | string  | "md"      | sm/md/lg                       |
| active   | boolean | false     | Toggle state                   |
| disabled | boolean | false     | Disabled state                 |

#### `<ButtonGroup>`

```jsx
<ButtonGroup
  options={[
    { key: "all", label: "ALL" },
    { key: "dps", label: "DPS" },
    { key: "tank", label: "TANK" },
  ]}
  value={selected}
  onChange={setSelected}
/>
```

---

### Indicators

#### `<Badge>`
```jsx
<Badge color={t.green}>ACTIVE</Badge>
<Badge color={t.red}>ERROR</Badge>
```

#### `<Dots>`
```jsx
<Dots count={3} color={t.amber} />  {/* ● ● ● */}
<Dots count={7} color={t.red} max={8} />
```

---

### Containers

#### `<Card>`
```jsx
<Card title="SECTION" subtitle="Optional subtitle" headerRight={<Badge color={t.green}>OK</Badge>}>
  Content here
</Card>
```

#### `<StatusBar>`
```jsx
<StatusBar items={[
  { label: "STATUS", value: "ONLINE", color: t.green },
  { label: "UPTIME", value: "99.7%" },
  { value: "3 warnings", color: t.amber },
]} />
```

#### `<SegmentBar>`
```jsx
<SegmentBar segments={[
  { label: "PHASE 1", span: 4, color: "#3d5a3d" },
  { label: "PHASE 2", span: 6, color: "#7a6a2a" },
  { label: "PHASE 3", span: 3, color: "#6a1a1a" },
]} />
```

#### `<ScrollRow>`
```jsx
<ScrollRow>
  <Card>Item 1</Card>
  <Card>Item 2</Card>
  <Card>Item 3</Card>
</ScrollRow>
```

---

### Form Controls

#### `<Input>`, `<Textarea>`, `<Select>`
```jsx
<Input label="NAME" value={name} onChange={e => setName(e.target.value)} placeholder="Enter name" />
<Textarea label="NOTES" value={notes} onChange={e => setNotes(e.target.value)} rows={4} />
<Select
  label="ROLE"
  value={role}
  onChange={setRole}
  options={[
    { value: "dps", label: "DPS" },
    { value: "tank", label: "Tank" },
    { value: "healer", label: "Healer" },
  ]}
/>
```

#### `<Toggle>`
```jsx
<Toggle checked={enabled} onChange={setEnabled} label="DARK MODE" accent={t.cyan} />
```

---

### Data Display

#### `<Table>`
```jsx
<Table
  columns={[
    { key: "name", header: "NAME", width: "1fr" },
    { key: "score", header: "SCORE", width: "80px", bold: true, color: r => r.score > 50 ? t.green : t.red },
    { key: "status", header: "STATUS", width: "100px", render: r => <Badge color={r.ok ? t.green : t.red}>{r.ok ? "PASS" : "FAIL"}</Badge> },
  ]}
  data={rows}
/>
```

#### `<Stat>`
```jsx
<Stat label="REVENUE" value="$1.2M" color={t.green} sub="vs $980k last quarter" />
```

#### `<Progress>`
```jsx
<Progress value={72} max={100} label="COMPLETION" showValue color={t.green} />
```

---

### Interactive

#### `<Tabs>`
```jsx
<Tabs
  tabs={[
    { key: "overview", label: "OVERVIEW" },
    { key: "details", label: "DETAILS" },
    { key: "logs", label: "LOGS" },
  ]}
  active={tab}
  onChange={setTab}
/>
```

#### `<Collapsible>`
```jsx
<Collapsible title="ADVANCED SETTINGS" accent={t.amber}>
  <p>Hidden content here</p>
</Collapsible>
```

#### `<Modal>`
```jsx
<Modal open={showModal} onClose={() => setShowModal(false)} title="CONFIRM ACTION" width="400px">
  <Text>Are you sure?</Text>
  <Button variant="solid" accent={t.red} onClick={handleConfirm}>CONFIRM</Button>
</Modal>
```

#### `<Toast>`
```jsx
<Toast type="success" message="Operation completed." onDismiss={() => setShow(false)} />
<Toast type="danger" message="Connection lost." />
```

#### `<Kbd>`
```jsx
<Kbd keys="⌘K" />
<Kbd keys="Esc" />
```

---

## Utility Hooks

| Hook              | Returns                              | Purpose                        |
|-------------------|--------------------------------------|--------------------------------|
| `useTokens()`     | `tokens`                             | Access current theme           |
| `useHover()`      | `{ hovered, bind }`                  | Track hover on elements        |
| `useFocus()`      | `{ focused, bind }`                  | Track focus on inputs          |
| `useToggle(init)` | `[value, toggle, setValue]`          | Boolean toggle with opt. key   |
| `useClickOutside(fn)` | `ref`                            | Detect outside clicks          |
| `useDebounce(val, ms)` | `debouncedValue`                | Debounce values for search     |

---

## Utilities

### `tint(hex, opacity)`
Generate translucent background from any hex color:

```jsx
import { tint } from "voidframe";

tint("#4ade80", "12")  // → "#4ade8012"
tint("#f87171", "33")  // → "#f8717133"
```

---

## Design Principles

1. **Monospace everything** — One typeface. Numbers, labels, body text share the same grid.
2. **Zero border radius** — Sharp edges. No pills, no rounding. Precision over friendliness.
3. **Five-layer depth** — bg0→bg5 creates hierarchy without box-shadows.
4. **Accent by exception** — 95% grayscale. Color is semantic, never decorative.
5. **Information density** — Tight spacing. Dense tables. Trust the user to parse.
6. **Uppercase chrome** — Labels and metadata are uppercase with letter-spacing. Content is mixed-case.

---

## Project Structure

```
voidframe/
├── src/
│   ├── index.js                 # Barrel export
│   ├── tokens.js                # Design tokens + createTheme
│   ├── provider/
│   │   └── VoidframeProvider.jsx # Theme context provider
│   ├── hooks/
│   │   └── index.js             # useHover, useFocus, useToggle, etc.
│   └── components/
│       ├── index.js             # Component barrel
│       ├── Text.jsx             # Text, Label, Divider, Spacer
│       ├── Button.jsx           # Button, ButtonGroup
│       ├── Badge.jsx            # Badge, Dots
│       ├── Card.jsx             # Card, ScrollRow, StatusBar, SegmentBar
│       ├── Form.jsx             # Input, Textarea, Toggle, Select
│       ├── Data.jsx             # Table, Stat, Progress
│       └── Interactive.jsx      # Tabs, Collapsible, Modal, Toast, Kbd
├── package.json
├── vite.config.js
└── README.md
```

## Build

```bash
npm install
npm run build    # outputs dist/voidframe.es.js + dist/voidframe.cjs.js
```

## License

MIT
