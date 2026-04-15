# Voidframe for VS Code

Snippets, hover docs, and quick actions for the [Voidframe](https://voidframe.dev)
React UI framework.

## Features

- **Snippets for every component.** Every public voidframe export has a
  snippet. Trigger with `vf-<name>` (e.g. `vf-button`, `vf-dialog`) or the
  PascalCase name (`Button`, `Dialog`). Required props become tab stops;
  literal-union props become choice snippets.
- **Hover docs.** Hover any PascalCase identifier in a `.ts`/`.tsx`/`.js`/
  `.jsx` file. If it matches a voidframe component, the hover tooltip
  shows the summary, required props, and a sample of optional props.
- **Open Playground.** Command palette: `Voidframe: Open playground for
  component` opens the docs site at the page for the currently-selected
  component.

## Installation

This extension is distributed as a `.vsix` artifact, not published to the
Marketplace. Install with:

```bash
code --install-extension voidframe-<version>.vsix
```

## Regenerating artifacts

The extension's snippet file and hover index are generated from the
voidframe repo's [`docs/data/props.json`](../../docs/data/props.json).
From the repo root:

```bash
npm run vscode:snippets   # regenerate snippets
npm run vscode:package    # rebuild .vsix
```
