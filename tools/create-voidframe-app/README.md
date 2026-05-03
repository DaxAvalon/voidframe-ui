# create-voidframe-app

Scaffold a new Vite + React + TypeScript project pre-wired with [voidframe-ui](https://npmjs.com/package/voidframe-ui)'s `VoidframeProvider`, stylesheet, and a starter page.

## Usage

```bash
npm create voidframe-app@latest my-app
# or
npx create-voidframe-app my-app
```

Then:

```bash
cd my-app
npm install
npm run dev
```

## Options

- `--force` / `-f` — overwrite a non-empty target directory.
- `--help` / `-h` — show usage.

## What you get

- Vite 5 + React 18 + TypeScript 5
- `voidframe-ui` (latest) installed as a runtime dependency
- `<VoidframeProvider themeName="system">` mounted at the React root
- `voidframe-ui/styles.css` imported once
- Pre-hydration `theme-script.js` injected to prevent dark↔light flash
- A starter `App.tsx` with `<AppShell>` + `<Sidebar>` + a few demo widgets

## Internals

This package is a thin wrapper around `voidframe init`. The scaffolding logic lives in `tools/cli/commands/init.mjs` of the [voidframe-ui](https://github.com/DaxAvalon/voidframe-ui) monorepo so both entry points stay in sync.
