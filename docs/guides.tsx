import type { ReactNode } from "react";
import { Text } from "../src";
import { Playground } from "../src/dev";
import { playgroundScope } from "./scope";
import { SandboxButtons } from "./sandbox/SandboxButtons";

export interface Guide {
  id: string;
  title: string;
  subtitle?: string;
  render: () => ReactNode;
}

function CodeBlock({ children }: { children: string }) {
  return (
    <pre
      style={{
        padding: "8px 12px",
        background: "var(--vf-bg-0)",
        border: "1px solid var(--vf-border-1)",
        fontFamily: "var(--vf-font-family)",
        fontSize: "var(--vf-fs-1)",
        color: "var(--vf-text-0)",
        overflowX: "auto",
        whiteSpace: "pre",
      }}
    >
      {children}
    </pre>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="vf-docs__block">
      <Text size="sm" upper spacing={2} color="var(--vf-text-2)">
        {title}
      </Text>
      {children}
    </section>
  );
}

// ── Guides ─────────────────────────────────────────────────────

function GettingStartedGuide() {
  return (
    <>
      <Section title="Install">
        <Text>
          Voidframe is a regular npm package with React 18+ as a peer
          dependency.
        </Text>
        <CodeBlock>{`npm install voidframe-ui`}</CodeBlock>
      </Section>
      <Section title="Import the stylesheet">
        <Text>
          The entire component library lives in one bundled CSS file. Import
          it once at your entry point.
        </Text>
        <CodeBlock>{`import "voidframe-ui/styles.css";`}</CodeBlock>
      </Section>
      <Section title="Wrap your app in VoidframeProvider">
        <Text>
          The provider installs the active theme, density, direction, and
          reduced-motion preferences onto the DOM as CSS custom properties
          and data attributes. Every voidframe-ui component reads from these.
        </Text>
        <CodeBlock>{`import { createRoot } from "react-dom/client";
import { VoidframeProvider } from "voidframe-ui";
import "voidframe-ui/styles.css";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <VoidframeProvider>
    <App />
  </VoidframeProvider>
);`}</CodeBlock>
      </Section>
      <Section title="First component">
        <Playground
          title="Hello, voidframe-ui"
          scope={playgroundScope}
          paneHeight={200}
          code={`<Card style={{ padding: 16, maxWidth: 320 }}>
  <Text size="lg" color="var(--vf-text-0)">Welcome to Voidframe</Text>
  <Text size="sm" color="var(--vf-text-3)">Edit the code on the left.</Text>
  <div style={{ marginTop: 12 }}>
    <Button variant="solid">Ship it</Button>
  </div>
</Card>`}
          actions={(code) => <SandboxButtons code={code} title="Hello, voidframe-ui" />}
        />
      </Section>
      <Section title="Next">
        <Text>
          Browse the <b>Components</b> section in the sidebar for every
          component's live API, or jump to the <b>Theming</b> guide to see
          how to override tokens.
        </Text>
      </Section>
      <Section title="Contributing">
        <Text>
          The canonical repository lives at{" "}
          <a href="https://github.com/DaxAvalon/voidframe-ui">
            github.com/DaxAvalon/voidframe-ui
          </a>
          . Clone, <code>npm install</code>, then <code>npm test</code>. See{" "}
          <code>CONTRIBUTING.md</code> for the full contributor workflow.
        </Text>
      </Section>
    </>
  );
}

function ThemingGuide() {
  return (
    <>
      <Section title="Token-driven theming">
        <Text>
          Every component reads its colors, spacing, and typography from CSS
          custom properties prefixed <code>--vf-*</code>. The
          <code> VoidframeProvider </code> sets those properties on a wrapper
          element; swapping the active theme is a one-line change.
        </Text>
      </Section>
      <Section title="Built-in themes">
        <Text>
          Six bundled themes ship out of the box. <code>soft</code> and{" "}
          <code>soft-light</code> are the rounded, lower-contrast pair — they
          set non-zero radius tokens, so corners round across the whole UI
          while keeping the monospace identity. Pick one via the{" "}
          <code>themeName</code> prop on the provider.
        </Text>
        <CodeBlock>{`import { VoidframeProvider } from "voidframe-ui";

<VoidframeProvider themeName="dark">      {/* default */}
<VoidframeProvider themeName="light">
<VoidframeProvider themeName="midnight">
<VoidframeProvider themeName="grey">
<VoidframeProvider themeName="soft">       {/* rounded dark */}
<VoidframeProvider themeName="soft-light"> {/* rounded light */}`}</CodeBlock>
      </Section>
      <Section title="Overriding tokens">
        <Text>
          Pass a <code>ThemeOverrides</code> object to merge on top of a base
          theme. Unlisted tokens fall through.
        </Text>
        <CodeBlock>{`import { darkTheme, VoidframeProvider } from "voidframe-ui";

const theme = {
  ...darkTheme,
  "--vf-accent": "#ff7a00",
  "--vf-border-2": "#2b2b2b",
};

<VoidframeProvider theme={theme}>...</VoidframeProvider>`}</CodeBlock>
      </Section>
      <Section title="Scoped theme swaps">
        <Text>
          Use <code>&lt;ThemeScope&gt;</code> to apply a different theme to
          just part of the tree — useful for rendering a light-mode preview
          inside a dark app.
        </Text>
        <CodeBlock>{`import { ThemeScope, lightTheme } from "voidframe-ui";

<ThemeScope theme={lightTheme}>
  {/* everything in here reads the light tokens */}
</ThemeScope>`}</CodeBlock>
      </Section>
      <Section title="Generating a custom theme file">
        <Text>
          The <code>voidframe-ui</code> CLI can drop a theme override stub into
          your project:
        </Text>
        <CodeBlock>{`npx voidframe-ui theme dark
# writes voidframe.theme.ts`}</CodeBlock>
      </Section>
    </>
  );
}

function ProviderGuide() {
  return (
    <>
      <Section title="VoidframeProvider">
        <Text>
          The top-level provider. Installs the current theme, density,
          contrast, text direction, and reduced-motion preferences on a
          wrapper element. Every voidframe-ui component reads from these.
        </Text>
      </Section>
      <Section title="Props at a glance">
        <CodeBlock>{`<VoidframeProvider
  theme="dark"                  // "dark" | "light" | "midnight" | "grey" | ThemeOverrides
  density="compact"             // "compact" | "comfortable" | "spacious"
  contrast="normal"             // "normal" | "high"
  direction="ltr"               // "ltr" | "rtl"
  reducedMotion="auto"          // "auto" | "reduce" | "no-preference"
  locale="en"                   // locale key for i18n messages
>
  <App />
</VoidframeProvider>`}</CodeBlock>
      </Section>
      <Section title="Density">
        <Text>
          The density prop tightens or loosens spacing across every
          component. It's implemented via a <code>[data-vf-density]</code>{" "}
          attribute + CSS variable overrides — no component re-mounts.
        </Text>
      </Section>
      <Section title="Reduced motion">
        <Text>
          When reducedMotion is <code>"reduce"</code>, or the OS-level
          preference is set via <code>"auto"</code>, voidframe-ui disables
          transitions on overlays, toasts, and interactive animation atoms.
        </Text>
      </Section>
      <Section title="Theme persistence">
        <Text>
          Pair with <code>useThemePersistence()</code> to store the user's
          chosen theme in <code>localStorage</code> so it survives reloads.
        </Text>
        <CodeBlock>{`import { VoidframeProvider, useThemePersistence } from "voidframe-ui";

function Root({ children }) {
  const [theme, setTheme] = useThemePersistence("dark");
  return <VoidframeProvider theme={theme}>{children}</VoidframeProvider>;
}`}</CodeBlock>
      </Section>
    </>
  );
}

function I18nGuide() {
  return (
    <>
      <Section title="Locale packs">
        <Text>
          Voidframe ships with translation packs for English, Spanish,
          French, German, Japanese, Simplified Chinese, Arabic, and Hebrew,
          plus a pseudo-locale (enXA) for identifying unlocalized strings.
        </Text>
        <CodeBlock>{`import {
  VoidframeProvider,
  MessagesProvider,
  LOCALE_PACKS,
} from "voidframe-ui";

<VoidframeProvider locale="fr">
  <MessagesProvider messages={LOCALE_PACKS.fr.messages}>
    <App />
  </MessagesProvider>
</VoidframeProvider>`}</CodeBlock>
      </Section>
      <Section title="Overriding individual strings">
        <Text>
          Merge partial overrides on top of a locale pack with{" "}
          <code>mergeMessages</code>:
        </Text>
        <CodeBlock>{`import { enMessages, mergeMessages, MessagesProvider } from "voidframe-ui";

const messages = mergeMessages(enMessages, {
  dialog: { close: "Dismiss" },
});

<MessagesProvider messages={messages}>
  <App />
</MessagesProvider>`}</CodeBlock>
      </Section>
      <Section title="Formatters">
        <Text>
          Voidframe exposes locale-aware formatters for numbers, currency,
          percents, dates, relative times, and lists. They all read the
          active locale from the provider.
        </Text>
        <CodeBlock>{`import { formatCurrency, formatRelativeTime, useI18n } from "voidframe-ui";

formatCurrency(1234.56, { locale: "fr", currency: "EUR" });
// "1 234,56 €"

formatRelativeTime(new Date(Date.now() - 3600_000), { locale: "en" });
// "1 hour ago"

function Tag() {
  const { t, formatList } = useI18n();
  return <>{formatList(["a", "b", "c"])}</>;  // "a, b, and c"
}`}</CodeBlock>
      </Section>
      <Section title="RTL">
        <Text>
          Set <code>direction="rtl"</code> on the provider. Layout and
          overlays respect logical properties, so Popovers, Drawers, and
          Dropdowns mirror automatically.
        </Text>
      </Section>
    </>
  );
}

function DevToolsGuide() {
  return (
    <>
      <Section title="DevPanel">
        <Text>
          Drop-in floating HUD. In development builds it shows render
          profiler scopes, captured dev warnings, the full{" "}
          <code>--vf-*</code> token list, and build metadata. In production
          it renders <code>null</code> unless{" "}
          <code>showInProduction</code> is set.
        </Text>
        <CodeBlock>{`import { DevPanel } from "voidframe-ui";

<App>
  {children}
  <DevPanel position="br" />
</App>`}</CodeBlock>
      </Section>
      <Section title="ErrorBoundary + DevErrorFallback">
        <Text>
          The primitive <code>&lt;ErrorBoundary&gt;</code> catches render
          errors in its children. Pair it with{" "}
          <code>&lt;DevErrorFallback&gt;</code> for a brutalist overlay
          that surfaces the error name, message, collapsible stack, and a
          reset button.
        </Text>
        <CodeBlock>{`import { ErrorBoundary, DevErrorFallback } from "voidframe-ui";

<ErrorBoundary
  fallback={(err, reset) => (
    <DevErrorFallback error={err} reset={reset} />
  )}
  resetKeys={[currentRoute]}
>
  <App />
</ErrorBoundary>`}</CodeBlock>
      </Section>
      <Section title="ProfilerScope + useRenderProfiler">
        <Text>
          Wrap a subtree in <code>&lt;ProfilerScope id="..."&gt;</code> to
          collect mount / update / actualDuration stats. Read the stats from
          anywhere outside the scope with{" "}
          <code>useRenderProfiler("id")</code>, or just open the DevPanel
          <b> Renders </b> tab.
        </Text>
      </Section>
      <Section title="Runtime misuse warnings">
        <Text>
          Core components emit one-shot dev warnings when their props are
          inconsistent (empty options, duplicate keys, unknown controlled
          values, etc). Warnings stream live into the DevPanel Warnings tab.
          Subscribe from your own code with{" "}
          <code>subscribeWarnings()</code> or read the buffer via{" "}
          <code>getWarningHistory()</code>.
        </Text>
        <CodeBlock>{`import { subscribeWarnings } from "voidframe-ui";

const unsub = subscribeWarnings((entry) => {
  // forward to Sentry / Datadog / a test harness
  console.log(entry.level, entry.message);
});`}</CodeBlock>
      </Section>
    </>
  );
}

function TailwindGuide() {
  return (
    <>
      <Section title="What the preset gives you">
        <Text>
          Voidframe ships a Tailwind preset that maps its{" "}
          <code>--vf-*</code> design tokens onto Tailwind's theme scales. You
          get utilities like <code>bg-vf-bg-1</code>,{" "}
          <code>text-vf-text-0</code>, <code>border-vf-border-2</code>,{" "}
          <code>p-vf-4</code>, and <code>font-vf-mono</code> — and because each
          one resolves to a CSS custom property, they re-theme automatically
          whenever <code>VoidframeProvider</code> swaps the active theme.
        </Text>
      </Section>
      <Section title="Install">
        <Text>
          Add the preset to your Tailwind config. It only extends the theme, so
          it composes with your existing config and other presets.
        </Text>
        <CodeBlock>{`// tailwind.config.js
module.exports = {
  presets: [require("voidframe-ui/tailwind")],
  content: ["./src/**/*.{ts,tsx}"],
};`}</CodeBlock>
        <Text>
          ESM configs work too:{" "}
          <code>import vf from "voidframe-ui/tailwind"</code> then{" "}
          <code>presets: [vf]</code>.
        </Text>
      </Section>
      <Section title="Available utilities">
        <CodeBlock>{`<div class="bg-vf-bg-1 text-vf-text-0 border border-vf-border-2 p-vf-4">
  <h2 class="font-vf-mono text-vf-xl tracking-vf-heading">Status</h2>
  <span class="text-vf-green bg-vf-green-10 px-vf-2">OK</span>
</div>`}</CodeBlock>
        <Text>
          Scales: colors (<code>vf-bg-*</code>, <code>vf-text-*</code>,{" "}
          <code>vf-border-*</code>, accents with <code>5/10/20/40/60</code>{" "}
          opacity steps, and <code>vf-success|danger|warning|info</code>),
          spacing (<code>vf-1</code>…<code>vf-12</code>), font family/size,
          line-height, letter-spacing, border radius, border width, and{" "}
          <code>vf-sm</code>…<code>vf-xxl</code> breakpoints.
        </Text>
      </Section>
      <Section title="How re-theming works">
        <Text>
          The preset's color, spacing, and typography values are{" "}
          <code>var(--vf-*)</code> references — not hard-coded hex. Mount{" "}
          <code>VoidframeProvider</code> (or apply the theme's CSS variables)
          and every Tailwind utility above follows the active theme with no
          rebuild. Breakpoints are the one exception: CSS media queries can't
          read custom properties, so <code>vf-*</code> screens are emitted as
          literal pixels from the default theme.
        </Text>
      </Section>
    </>
  );
}

// ── Index ─────────────────────────────────────────────────────

export const guides: Guide[] = [
  {
    id: "getting-started",
    title: "Getting started",
    subtitle: "Install voidframe-ui, import the stylesheet, mount the provider.",
    render: () => <GettingStartedGuide />,
  },
  {
    id: "theming",
    title: "Theming",
    subtitle: "Tokens, built-in themes, overrides, scoped theme swaps.",
    render: () => <ThemingGuide />,
  },
  {
    id: "provider",
    title: "Provider",
    subtitle: "VoidframeProvider options and how they flow into components.",
    render: () => <ProviderGuide />,
  },
  {
    id: "i18n",
    title: "i18n",
    subtitle: "Locale packs, message overrides, formatters, RTL.",
    render: () => <I18nGuide />,
  },
  {
    id: "dev-tools",
    title: "Dev tools",
    subtitle: "DevPanel, ErrorBoundary, render profiler, misuse warnings.",
    render: () => <DevToolsGuide />,
  },
  {
    id: "tailwind",
    title: "Tailwind preset",
    subtitle: "Use voidframe's --vf-* tokens as Tailwind utilities.",
    render: () => <TailwindGuide />,
  },
];
