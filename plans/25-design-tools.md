# 25 — Design Tools

**Goal:** Bridge Voidframe to the design side — Figma library, Style Dictionary token export, VSCode extension, and other integrations that make design/dev parity trivial.

**Depends on:** stable component surface (post-Track B).
**Effort:** 2-3 days + ongoing.

## Figma Library

A published Figma library mirroring Voidframe 1:1.

### Contents

- **Tokens**: all color/typography/spacing tokens as Figma variables.
- **Text styles**: each font size tied to a variable.
- **Color styles**: each semantic color + accent as a style.
- **Effect styles**: focus rings, animations as effect styles.
- **Components**: every component with variants matching the TSX API.
- **Instance swap properties** for composition (icon slots, children slots).

### Structure

```
Voidframe UI Kit (Figma)
├── 01 Foundations
│   ├── Colors (variables)
│   ├── Typography (styles)
│   ├── Spacing (variables)
│   ├── Icons (master set)
│   └── Grid & layout
├── 02 Primitives
│   ├── Button
│   ├── Input
│   ├── Badge
│   └── ...
├── 03 Patterns
│   ├── Forms
│   ├── Modals
│   ├── Tables
│   └── ...
├── 04 Templates
│   ├── Dashboard
│   ├── Chat
│   └── ...
└── Changelog
```

### Variant Matching

Each Figma component maps to TSX variants. Example Button:

```
Button
├── Variant: default / ghost / accent / solid
├── Size: xs / sm / md / lg
├── State: default / hover / focus / active / disabled
└── Has Icon: leading / trailing / both / none
```

Design → code parity: naming conventions match prop names exactly.

### Publishing

Published to Figma Community + available as a paid Figma library for enterprises (optional monetization).

---

## Figma Plugin (optional, advanced)

A plugin that:

- **Exports** selected Figma layers to Voidframe JSX code.
- **Syncs** Figma variables from the token source of truth (prevents drift).
- **Validates** designs against Voidframe's aesthetic rules (no rounded corners, monospace only, accent palette restricted).

Implementation: Figma plugin API (TypeScript). Distributed on Figma Community.

---

## Style Dictionary / Tokens Studio Export

Export tokens in the Style Dictionary / Tokens Studio format for ingestion by any design tool.

Build script `scripts/export-tokens.ts`:

```ts
import { defaultTokens } from "../src/tokens";

const output = {
  color: {
    bg: {
      "0": { value: defaultTokens.bg0 },
      "1": { value: defaultTokens.bg1 },
      ...
    },
    text: { ... },
    accent: {
      green: { value: defaultTokens.green },
      ...
    },
  },
  typography: { ... },
  spacing: { ... },
  // ...
};

fs.writeFileSync("dist/tokens/voidframe.tokens.json", JSON.stringify(output, null, 2));
```

Output published to:
- `dist/tokens/voidframe.tokens.json` (in npm package).
- `https://voidframe.dev/tokens.json` (CDN).
- `https://voidframe.dev/tokens.css` (CSS custom properties).

Tokens can be consumed by:
- Figma (via Tokens Studio plugin).
- Sketch (via Style Dictionary integration).
- Android / iOS designers who want the palette.
- Other web projects.

---

## CSS Export

For non-React consumers wanting the design tokens:

```css
/* voidframe.tokens.css */
:root {
  --vf-bg-0: #050505;
  --vf-bg-1: #0a0a0a;
  --vf-green: #4ade80;
  /* ... */
}
```

Plus individual component CSS files (Phase 04 already emits these).

---

## VSCode Extension

### Features

**Snippets**

- `vf-button` → `<Button variant="solid">$1</Button>`
- `vf-modal` → compound Modal skeleton.
- `vf-form` → Form + Field structure.
- Full list: one snippet per complex component.

**Token preview**

- Hover over `tokens.bg2` in JS/TS → shows color swatch + contrast hints.
- Hover over `var(--vf-bg-2)` in CSS → same.

**Component docs**

- Hover over `<Button>` → shows Voidframe docs link + prop summary.
- `Cmd+Click` on component → opens docs in browser (optional).

**Auto-import**

- Configured via VSCode's "Auto Imports" — Voidframe's exports surface cleanly when typing.

**Lint integration**

- Runs `eslint-plugin-voidframe` inline (Phase 21).
- Shows warnings in editor for a11y / deprecated props.

### Publishing

- Visual Studio Marketplace.
- OpenVSX (for VS Code alternatives).

---

## JetBrains / WebStorm Plugin (optional)

Similar feature set for JetBrains IDEs. Lower priority — community-contributed.

---

## CLI Integration for Design

`voidframe design export-tokens` — exports tokens in multiple formats on demand (CSS, JSON, SCSS, Android XML, iOS Swift).

---

## Storybook MDX Integration (cross-link with docs)

Storybook stories include `<ComponentPreview>` that links to Figma frames for design ↔ code parity. Each story has a "View in Figma" button (via metadata).

```tsx
const meta: Meta<typeof Button> = {
  title: "Components/Button",
  component: Button,
  parameters: {
    figma: "https://www.figma.com/file/.../Voidframe?node-id=BUTTON",
  },
};
```

Chromatic or Storybook addon renders the link.

---

## Design System Documentation

Docs site (Phase 23) includes a "Design System" section:

- Voidframe's aesthetic principles.
- Token reference (visual swatches).
- Spacing scale (visual ruler).
- Typography scale (sizes shown at scale).
- Motion principles.
- Icon drawing guidelines.
- Accessibility principles.
- Brand kit examples (how to skin Voidframe for your team).

Designers should be able to read the docs site and build in Figma, staying in parity with dev.

---

## Figma ↔ Code Sync

Rule: **source of truth is the code (tokens.ts).** Figma mirrors it. Not the other way.

Workflow:
1. Token change in `src/tokens.ts`.
2. Build script regenerates `voidframe.tokens.json`.
3. Figma designers import updated tokens via Tokens Studio plugin.
4. Components in Figma re-render with new tokens automatically (due to variables).

Figma plugin (above) can automate step 3.

---

## Brand Kit Templates

For consumers skinning Voidframe for their brand:

- Figma file with color/typography overrides.
- CSS file with token overrides.
- Code example of `createTheme`.

Published as part of docs + optional Figma Community asset.

---

## Acceptance Criteria

- [ ] Figma library published covering tokens + all components.
- [ ] Figma variables match code tokens 1:1.
- [ ] Figma variants match code variants 1:1.
- [ ] Tokens exported in Style Dictionary format.
- [ ] `voidframe.tokens.json`, `voidframe.tokens.css` shipped.
- [ ] VSCode extension published with snippets + token preview + docs links.
- [ ] Storybook stories link to Figma frames.
- [ ] Design system section in docs site.
- [ ] Brand kit template published.

## Notes

- **Code is the source of truth.** Don't let Figma drift from code — automate the sync.
- **Ship the Figma library publicly** if possible — it's a major adoption driver.
- **VSCode extension is quick to build** but pays huge dividends in discoverability.
