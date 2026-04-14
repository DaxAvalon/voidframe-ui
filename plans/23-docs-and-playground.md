# 23 — Docs Site & Playground

**Goal:** A dogfooded docs site built with Voidframe itself, featuring live playground, every component documented with interactive examples, recipe cookbook, migration guides, and accessibility statement.

**Depends on:** all component phases; 22 (Storybook).
**Effort:** 4-6 days.

## Stack

- **Docs framework**: Next.js 14 app router (SSG) OR Astro (content-heavy).
  - Recommendation: **Astro** — better for content sites, smaller payloads, trivial to integrate React islands for playgrounds.
- **Content**: MDX for component pages.
- **Playground**: Sandpack (CodeSandbox's embeddable editor) OR custom Monaco + iframe.
  - Recommendation: **Sandpack** — battle-tested, supports live JSX, good DX.
- **Search**: Algolia DocSearch (free for OSS) or local Pagefind (no network).
- **Hosting**: Vercel or Cloudflare Pages.

URL: `voidframe.dev` (or subdomain / path under main brand).

## Structure

```
docs/
├── astro.config.mjs
├── src/
│   ├── content/
│   │   ├── docs/
│   │   │   ├── getting-started/
│   │   │   │   ├── introduction.mdx
│   │   │   │   ├── installation.mdx
│   │   │   │   ├── quickstart.mdx
│   │   │   │   └── framework-integration/
│   │   │   │       ├── next-app-router.mdx
│   │   │   │       ├── next-pages-router.mdx
│   │   │   │       ├── remix.mdx
│   │   │   │       └── astro.mdx
│   │   │   ├── components/
│   │   │   │   ├── overview.mdx
│   │   │   │   ├── button.mdx
│   │   │   │   ├── input.mdx
│   │   │   │   └── ... (one per component)
│   │   │   ├── primitives/
│   │   │   ├── hooks/
│   │   │   ├── theming/
│   │   │   ├── accessibility/
│   │   │   ├── i18n/
│   │   │   ├── recipes/
│   │   │   │   ├── auth-form.mdx
│   │   │   │   ├── dashboard.mdx
│   │   │   │   ├── chat-interface.mdx
│   │   │   │   └── ...
│   │   │   └── migration/
│   │   │       ├── from-radix.mdx
│   │   │       ├── from-chakra.mdx
│   │   │       └── v1-to-v2.mdx
│   ├── components/
│   │   ├── Playground.tsx          // wraps Sandpack
│   │   ├── TokenSwatch.tsx
│   │   ├── ComponentPreview.tsx
│   │   └── ...
│   └── layouts/
│       └── DocsLayout.astro
├── public/
│   └── images/
└── package.json
```

## Component Page Template

Every component page follows this shape:

```mdx
---
title: Button
description: Primary interactive control.
category: Inputs
since: "1.0.0"
---

# Button

Primary interactive control. Supports variants, sizes, icons, and polymorphic rendering.

<ComponentPreview code={`
  <Button variant="solid">Save</Button>
  <Button variant="ghost">Cancel</Button>
`} />

## Installation

<Installation name="Button" />

## Usage

<Playground template="react" dependencies={{ voidframe: "latest" }}>
{`
import { Button } from "voidframe";

export default function App() {
  return <Button>Click me</Button>;
}
`}
</Playground>

## Variants

<ComponentGrid>
  <Example title="Default"><Button>Default</Button></Example>
  <Example title="Ghost"><Button variant="ghost">Ghost</Button></Example>
  <Example title="Solid"><Button variant="solid">Solid</Button></Example>
  <Example title="Accent"><Button variant="accent" accent="#4ade80">Accent</Button></Example>
</ComponentGrid>

## Sizes

<ComponentGrid>
  <Button size="xs">XS</Button>
  <Button size="sm">SM</Button>
  <Button size="md">MD</Button>
  <Button size="lg">LG</Button>
</ComponentGrid>

## With icons

<Playground>
{`
<Button leadingIcon={<PlusIcon />}>Create</Button>
<Button trailingIcon={<ArrowRightIcon />}>Continue</Button>
`}
</Playground>

## Polymorphic

Render as an anchor:

<Playground>
{`
<Button as="a" href="/">Home</Button>
`}
</Playground>

## Loading

<Playground>
{`
<Button loading>Saving...</Button>
`}
</Playground>

## API

<PropsTable component="Button" />

## Accessibility

- Uses native \`<button>\` element.
- Space / Enter activate.
- \`:focus-visible\` ring on keyboard focus.
- When using icon-only content, requires \`aria-label\`.
- \`disabled\` prevents click; \`aria-disabled\` applied.

## Recipes

- [Form with submit button](/docs/recipes/forms)
- [Button group](/docs/components/button-group)

## Related

- [IconButton](/docs/components/icon-button)
- [Link](/docs/components/link)
```

## Components for Docs Site

### `<Playground>`

Wraps Sandpack. Consumer passes code; Sandpack renders live with Voidframe preloaded.

```tsx
<Playground template="react" code={`...`} />
```

### `<ComponentPreview>`

Renders code + live preview side-by-side (non-editable).

### `<PropsTable>`

Auto-generated from TS types (via `react-docgen-typescript` build step that emits JSON).

```tsx
<PropsTable component="Button" />
```

Produces a table with: prop name, type, default, description (from JSDoc), required.

### `<Example>` / `<ExampleGrid>`

Simple wrappers for laying out static examples.

### `<TokenSwatch>`

```tsx
<TokenSwatch name="bg-2" />
```

Renders a color swatch with the token name, hex value, and rendered preview.

### `<Installation>`

Shows install command per package manager (npm / yarn / pnpm / bun) with copy button.

### `<KbdLegend>` / `<A11yCallout>`

Structured callouts for keyboard shortcuts and a11y notes.

---

## Auto-generated Content

### API Reference from types

Build step reads TS declaration files, extracts:
- Component name.
- Props interface with JSDoc.
- Default values.
- Example code from JSDoc `@example` tags.

Outputs `docs/src/data/api.json` consumed by `<PropsTable>`.

### Changelog

Generated from changesets. Per-version entries with links to PRs and contributors.

## Sections

### Introduction
- Philosophy (brutalist aesthetic, monospace-first, density).
- When to use Voidframe vs. other libs.
- Feature overview.

### Installation
- npm install command.
- CSS import instruction.
- First component rendered.

### Framework Integration
- Next.js (app + pages).
- Remix.
- Astro.
- Vite / CRA.
- With notes on SSR, RSC boundaries, theme pre-hydration.

### Theming
- Design principles (inviolable).
- Token reference (visual swatches).
- `createTheme` examples.
- Theme scopes.
- Density modes.
- High-contrast.
- Consumer "brand kit" example.

### Components
- Categorized landing page (Forms, Layout, Data, etc.).
- Per-component pages (above template).

### Primitives
- Each primitive documented.
- Composition examples.

### Hooks
- Each hook with example + edge cases.

### Recipes (cookbook)
- Auth form (sign-in / sign-up).
- Dashboard layout with sidebar + stats + charts.
- Chat interface.
- Settings page.
- Data table with filters + pagination.
- Onboarding tour.
- Command palette integration.
- Multi-step wizard.
- Image gallery with lightbox.
- Dark/light theme switcher.
- Form with RHF + zod.
- Server-driven UI.

### Accessibility
- Overall statement (WCAG 2.1 AA).
- Keyboard shortcut conventions.
- Screen-reader support.
- Per-component a11y notes (linked from each component page).

### i18n & RTL
- Adding a locale.
- Pluralization.
- RTL mirroring.
- Locale-aware formatting.

### Icons
- Using bundled icons.
- Custom SVG integration.
- Third-party icon lib adapters.

### Migration
- From Radix.
- From Chakra.
- From MUI.
- Major-version migrations.

### Contributing
- Repository setup.
- Adding a component.
- Writing docs.
- A11y checklist.
- Releasing.

## Live Editor Features

- Syntax highlighting.
- TypeScript support.
- Auto-preview with debounced update.
- Error display inline.
- Copy button.
- "Open in CodeSandbox" / "Open in StackBlitz" buttons.
- Viewport resizer (sm / md / lg / xl preview).
- Theme toggle (dark / light) per preview.
- RTL toggle per preview.

## Search

- Algolia DocSearch (recommended for public site).
- Pagefind (static, privacy-friendly alt).
- Indexed: all docs, all component props, all examples.

## Deployment

- Build on PR → preview URL (Vercel/CF Pages).
- Merge to main → production deploy.
- Versioned docs: `/v1`, `/v2` for major versions.

## Performance

- Pre-rendered HTML for every page.
- React islands only for interactive (playground).
- Code highlighting built at build time (shiki).
- Minimal JS per page (<30KB).

## Analytics

- Plausible or Umami (privacy-focused).
- Track: most-viewed components, search queries, browser/OS distribution.
- No user-identifying data.

---

## Acceptance Criteria

- [ ] Docs site live at voidframe.dev (or equivalent).
- [ ] Every component has a docs page with: description, playground, variants, API table, a11y notes.
- [ ] Every primitive, hook, and utility documented.
- [ ] Getting-started + framework integration guides published.
- [ ] Recipe cookbook with ≥10 end-to-end examples.
- [ ] Migration guides for major alternatives.
- [ ] Live playground works in every doc page where relevant.
- [ ] Search functional.
- [ ] Accessibility statement published.
- [ ] Responsive design works on mobile.

## Notes

- **Dogfood.** The docs site must be built with Voidframe. This surfaces bugs and gaps immediately.
- **Live > static examples.** Every example should be tweakable.
- **API table is auto-generated** or maintaining it manually becomes a nightmare.
- **Search matters.** Users find components by searching — invest in DocSearch setup.
