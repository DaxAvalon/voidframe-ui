/**
 * Static usage snippets for docs entries that cannot honestly demo in
 * a live playground — invisible behavioral primitives and providers.
 * Shown as read-only code on the component page instead of a fake
 * "demo" that renders explanatory text or mock markup.
 *
 * Non-element entries NOT listed here keep their live playground via
 * LIVE_NON_ELEMENTS — layout utilities arranging real children, and
 * primitives whose behavior is genuinely observable (FocusScope,
 * Presence, ErrorBoundary…).
 */

export const usageSnippets: Record<string, string> = {
  Portal: `import { Portal } from "voidframe-ui/primitives";

// Renders children into document.body (or a custom container)
// via React createPortal. All voidframe overlays use it internally.
<Portal>
  <div className="my-overlay">Escapes any overflow/transform context</div>
</Portal>`,

  ScrollLock: `import { ScrollLock } from "voidframe-ui/primitives";

// Prevents body scrolling while mounted. Modal and Drawer mount one
// automatically — reach for it directly in custom overlays.
{isOverlayOpen && <ScrollLock />}`,

  DismissableLayer: `import { DismissableLayer } from "voidframe-ui/primitives";

// Calls onDismiss on Escape or on pointer-down outside the layer.
// The building block under Dialog, Popover, and Menu.
<DismissableLayer onDismiss={() => setOpen(false)}>
  <div role="dialog">…</div>
</DismissableLayer>`,

  HydrationBoundary: `import { HydrationBoundary } from "voidframe-ui/primitives";

// Defers children to the client commit so SSR markup that legitimately
// differs (timestamps, locale formatting) doesn't warn on hydration.
<HydrationBoundary fallback={<Skeleton />}>
  <LocalTime value={timestamp} />
</HydrationBoundary>`,

  RovingFocusGroup: `import { RovingFocusGroup } from "voidframe-ui/primitives";

// One tab stop for the whole group; Arrow keys move focus between
// items (the pattern behind Menu, Toolbar, and TabBar).
<RovingFocusGroup orientation="horizontal">
  <RovingFocusGroup.Item><Button size="sm">Cut</Button></RovingFocusGroup.Item>
  <RovingFocusGroup.Item><Button size="sm">Copy</Button></RovingFocusGroup.Item>
  <RovingFocusGroup.Item><Button size="sm">Paste</Button></RovingFocusGroup.Item>
</RovingFocusGroup>`,

  SkipToContent: `import { SkipToContent } from "voidframe-ui/primitives";

// Visually hidden until keyboard-focused; place it first in the page
// so keyboard users can jump past the navigation.
<SkipToContent href="#main">Skip to content</SkipToContent>
<nav>…</nav>
<main id="main">…</main>`,

  ChartScales: `import { ChartScales } from "voidframe-ui/charts";

// Low-level context bridge: exposes the active chart's scales to
// custom layers rendered inside a chart frame.
<LineChart data={data}>
  <ChartScales>
    {({ x, y }) => <MyAnnotationLayer xScale={x} yScale={y} />}
  </ChartScales>
</LineChart>`,

  VoidframeProvider: `import { VoidframeProvider } from "voidframe-ui";
import "voidframe-ui/styles.css";

// Wrap your app once. Supplies theme tokens, density, contrast,
// and locale context to every voidframe component.
<VoidframeProvider theme="dark" density="compact">
  <App />
</VoidframeProvider>`,

  MessagesProvider: `import { MessagesProvider } from "voidframe-ui";

// Overrides the built-in UI strings (labels, aria text) — supply
// translations for the locales your app ships.
<MessagesProvider messages={{ "dialog.close": "Cerrar" }}>
  <App />
</MessagesProvider>`,

  ShortcutProvider: `import { ShortcutProvider, useShortcuts } from "voidframe-ui";

// Enables global hotkey registration via useShortcuts() anywhere below.
<ShortcutProvider>
  <App />
</ShortcutProvider>

// …in a child component:
useShortcuts([{ keys: "mod+k", onTrigger: openCommandPalette }]);`,

  ConfirmProvider: `import { ConfirmProvider, useConfirm } from "voidframe-ui";

// Enables the imperative confirm() API anywhere below.
<ConfirmProvider>
  <App />
</ConfirmProvider>

// …in a child component:
const confirm = useConfirm();
const ok = await confirm({ title: "Delete item?", danger: true });`,

  TooltipProvider: `import { TooltipProvider } from "voidframe-ui";

// Optional: shares delay/skip timing across all tooltips below so
// adjacent tooltips open instantly once one is shown.
<TooltipProvider delayDuration={300}>
  <App />
</TooltipProvider>`,

  VoidframeReactFlowTheme: `import { VoidframeReactFlowTheme } from "voidframe-ui/reactflow";
import { ReactFlow } from "@xyflow/react"; // optional peer

// Themes a React Flow canvas with voidframe tokens (nodes, edges,
// controls, minimap). Renders nothing itself.
<VoidframeReactFlowTheme>
  <ReactFlow nodes={nodes} edges={edges} />
</VoidframeReactFlowTheme>`,
};

/**
 * Non-element entries that keep a live playground because their
 * existing demo genuinely exercises the component: layout utilities
 * arranging real children, and primitives/providers with observable
 * behavior. Everything else non-element renders usageSnippets[name]
 * as read-only code.
 */
export const LIVE_NON_ELEMENTS: ReadonlySet<string> = new Set([
  // Layout — demos arrange real children with the real component.
  "AspectRatio",
  "Box",
  "Center",
  "Container",
  "EmptyLayout",
  "Flex",
  "Grid",
  "GridItem",
  "HStack",
  "SafeArea",
  "Section",
  "Spacer",
  "SplitView",
  "Stack",
  "Sticky",
  "Stretch",
  "VStack",
  "Hide",
  "Show",
  "ResponsiveBox",
  // Primitives with genuinely observable demos.
  "AccessibleIcon",
  "ErrorBoundary",
  "FocusScope",
  "LiveRegion",
  "Presence",
  "Separator",
  "Slot",
  "Transition",
  "VisuallyHidden",
  // ThemeScope visibly re-themes its subtree.
  "ThemeScope",
]);
