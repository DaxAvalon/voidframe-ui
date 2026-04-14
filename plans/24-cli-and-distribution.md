# 24 — CLI & Distribution

**Goal:** Two distribution modes — (1) npm package for traditional consumers, (2) shadcn-style source-copy CLI for consumers who want to own and modify the component source. Plus starter templates for every major framework.

**Depends on:** 22 (build), 23 (docs).
**Effort:** 2-3 days.

## Dual Distribution Model

### Mode A: npm package

Standard:

```
npm install voidframe
```

Consumer imports: `import { Button } from "voidframe"`.
CSS: `import "voidframe/styles.css"`.

Upgrades via `npm update`. Consumer can't modify component source but can theme, compose, wrap.

**For**: teams who want stability, automatic updates, minimal maintenance surface.

### Mode B: source-copy CLI (shadcn-style)

```
npx voidframe init                        # scaffolds voidframe config + base files
npx voidframe add button                  # copies Button source + types + CSS into consumer's src/
npx voidframe add modal dropdown tooltip  # multi-add
npx voidframe list                        # lists available components
npx voidframe diff button                 # shows diff vs latest upstream version
npx voidframe upgrade button              # updates to latest upstream
```

CLI copies **source files, not compiled artifacts**. Consumer owns the code; modifies at will.

**For**: teams who want full control, custom branding beyond theming, ability to fork components.

---

## CLI Implementation

### Package: `create-voidframe` / `voidframe-cli`

Published as `@voidframe/cli` or similar. Binary name: `voidframe`.

### Commands

#### `voidframe init`

```
$ npx voidframe init

? Which framework are you using? (Use arrow keys)
  ❯ Next.js (app router)
    Next.js (pages router)
    Remix
    Astro
    Vite / plain React
? Where should components live? (./src/components)
? Where should hooks live? (./src/hooks)
? Where should utilities live? (./src/lib)
? Use TypeScript? (Yes)
? Use tokens via CSS custom properties? (Yes)
? Create voidframe.config.json? (Yes)
```

Produces:
- `voidframe.config.json` — paths, preferences.
- Base files: `VoidframeProvider`, tokens, utilities, types.
- CSS entry (`styles/voidframe.css`).
- Installs required peer deps (React, etc.).

`voidframe.config.json`:

```json
{
  "framework": "next-app",
  "typescript": true,
  "paths": {
    "components": "./src/components",
    "hooks": "./src/hooks",
    "primitives": "./src/primitives",
    "lib": "./src/lib",
    "css": "./src/styles"
  },
  "style": {
    "cssVariables": true,
    "theme": "dark"
  },
  "aliases": {
    "@/components": "./src/components",
    "@/lib": "./src/lib"
  }
}
```

#### `voidframe add <name...>`

Fetches component source from the registry (GitHub tag or CDN) and writes to configured paths. Resolves dependencies:

```
$ npx voidframe add data-grid

Resolving dependencies:
  - data-grid
  ├─ table (primitive)
  ├─ checkbox
  ├─ virtual-list (primitive)
  └─ useResizeObserver (hook)

Writing files:
  ✓ src/components/data-grid/data-grid.tsx
  ✓ src/components/data-grid/data-grid.css
  ✓ src/components/data-grid/data-grid.test.tsx
  ✓ src/components/table/table.tsx
  ...

Updated:
  ✓ src/components/index.ts (added DataGrid export)

Done.
```

- Source is pre-processed: import paths rewritten per config aliases.
- Existing files are diffed before overwrite; user confirms.
- Dependencies auto-added.

#### `voidframe list`

Lists all available components with category and short description.

#### `voidframe diff <name>`

Shows diff between local copy and latest upstream.

#### `voidframe upgrade <name | "all">`

Applies upstream changes. Conflicts surfaced for manual merge.

#### `voidframe sync`

Runs `diff` on all installed components; reports out-of-date ones.

#### `voidframe theme`

Scaffolds a custom theme file.

```
$ npx voidframe theme create my-brand
✓ Created src/styles/themes/my-brand.css
✓ Created src/styles/themes/my-brand.ts
```

---

## Registry

Component source lives in the main Voidframe repo. A registry manifest (`registry.json`) is published alongside each release:

```json
{
  "version": "1.2.0",
  "components": [
    {
      "name": "button",
      "category": "inputs",
      "files": [
        { "path": "components/button/button.tsx", "source": "..." },
        { "path": "components/button/button.css", "source": "..." }
      ],
      "dependencies": [],
      "peerDependencies": ["react"],
      "devDependencies": []
    },
    ...
  ]
}
```

CLI fetches manifest from `https://voidframe.dev/registry/{version}.json` or embedded.

---

## Starter Templates

Published as `create-voidframe-app`:

```
npm create voidframe-app@latest my-app
```

Prompts:
- Framework: Next.js (app / pages) / Remix / Astro / Vite.
- Language: TypeScript (yes/no).
- Components starter: blank / dashboard / chat / docs.
- Features: authentication stub / database stub.

Templates live in the monorepo under `templates/`:

```
templates/
├── next-app-blank/
├── next-app-dashboard/
├── next-app-chat/
├── next-pages-blank/
├── remix-blank/
├── remix-dashboard/
├── astro-blank/
├── astro-content/
├── vite-blank/
└── ...
```

### `next-app-dashboard` template

A fully-themed admin dashboard:
- AppShell with Sidebar + TopNav.
- Dashboard page with stats, charts, DataGrid.
- Users page with DataGrid + filters.
- Settings page with forms.
- Auth stub (sign-in / sign-up / forgot-password).

### `next-app-chat` template

A Claude-style chat interface:
- ChatLayout with SessionList + Conversation.
- Composer with attachments + mic.
- Streaming message rendering.
- Model selector.

### `astro-content` template

Docs/blog site scaffolding:
- Astro with MDX.
- Voidframe typography + code blocks.
- Sidebar navigation.
- Search integration.

---

## Distribution Channels

- **npm**: main channel (`voidframe`).
- **GitHub Packages**: mirror for internal enterprise use (optional).
- **jsDelivr / unpkg**: CDN access for CDN consumers.
- **Deno**: `deno.land/x/voidframe` mirror (optional).

---

## Versioning

- SemVer strictly.
- CLI versioned alongside library — CLI v1.2.0 fetches library v1.2.0 sources by default.
- `--version` flag overrides.

---

## Documentation

CLI commands documented in [23-docs-and-playground.md](23-docs-and-playground.md):

- Installation.
- Command reference.
- Config reference.
- Custom registries (for enterprise forks).
- CI integration (`voidframe upgrade` in automated workflows).

---

## Advanced: Private Registries

For enterprise consumers forking Voidframe:

```json
{
  "registry": "https://internal.company.com/voidframe/registry.json"
}
```

CLI honors this override. Enables shipping internal component forks.

---

## Starter Template Workflow

Templates maintained with tests:

- Every template has a CI job that runs `npm install && npm run build`.
- On library release, templates auto-updated via changesets.
- Templates published to the templates repo or as separate npm packages.

---

## Acceptance Criteria

- [ ] `@voidframe/cli` published with all commands.
- [ ] `voidframe init` scaffolds a working setup across frameworks.
- [ ] `voidframe add <name>` copies component + deps + CSS.
- [ ] `voidframe diff` and `voidframe upgrade` work.
- [ ] Registry manifest published per release.
- [ ] `create-voidframe-app` published.
- [ ] ≥5 starter templates shipped (next-app-blank, next-app-dashboard, next-app-chat, remix-blank, vite-blank).
- [ ] Templates CI-tested on release.
- [ ] Documentation complete.
- [ ] Private registry override supported.

## Notes

- **shadcn-style distribution is a major DX differentiator.** It's what makes modern component libraries feel personal. Worth the investment.
- **Don't over-engineer the CLI.** It should be thin — fetch, write, update imports. The library is the product, not the CLI.
- **Templates rot.** Automated template CI is mandatory to keep them working as the library evolves.
