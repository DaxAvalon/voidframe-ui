# create-voidframe-app

Scaffold a new React + TypeScript project pre-wired with [voidframe-ui](https://npmjs.com/package/voidframe-ui)'s `VoidframeProvider`, stylesheet, and a starter page. Choose a **Vite SPA** or a **Next.js (App Router)** project.

## Usage

```bash
# Vite SPA (default)
npm create voidframe-app@latest my-app

# Next.js App Router
npm create voidframe-app@latest my-app --template next

# or via npx
npx create-voidframe-app my-app --template next
```

Then:

```bash
cd my-app
npm install
npm run dev
```

## Options

- `--template` / `-t` `<name>` — template to scaffold: `app` (Vite SPA, default) or `next` (Next.js App Router).
- `--force` / `-f` — overwrite a non-empty target directory.
- `--help` / `-h` — show usage.

## Templates

### `app` — Vite SPA

- Vite 5 + React 18 + TypeScript 5
- `voidframe-ui` installed as a runtime dependency
- `voidframe-ui/styles.css` imported once in `src/main.tsx`
- `<VoidframeProvider>` mounted at the React root in `src/App.tsx`
- A starter page using `Card`, `Text`, and `Button`

### `next` — Next.js App Router

- Next.js 14 (App Router) + React 18 + TypeScript 5
- `voidframe-ui/styles.css` imported in `app/layout.tsx`
- `<VoidframeProvider>` wraps the app in the root layout
- A **pre-hydration theme script** inlined in `<head>` (the App Router placement of `voidframe-ui/theme-script.js`) that mirrors the saved theme onto `<html data-vf-theme>` before paint — no dark↔light flash. `<html>` carries `suppressHydrationWarning` because the script mutates the attribute before hydration.
- A server-component starter `app/page.tsx` rendering voidframe components

## Internals

This package is a thin wrapper around `voidframe init`. The scaffolding logic and templates live under `tools/cli/` of the [voidframe-ui](https://github.com/DaxAvalon/voidframe-ui) monorepo (`commands/_init-shared.mjs`, `templates/<name>/`) so both entry points stay in sync.
