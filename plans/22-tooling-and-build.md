# 22 — Tooling & Build

**Goal:** Modern, strict, automated tooling for linting, formatting, Storybook, CI, releases, and contribution workflow.

**Depends on:** 01 TypeScript, 19 Testing.
**Effort:** 2 days.

## ESLint

```
npm install -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-plugin-react eslint-plugin-react-hooks eslint-plugin-jsx-a11y eslint-plugin-import eslint-config-prettier
```

`.eslintrc.cjs`:

```js
module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: { project: "./tsconfig.json", ecmaFeatures: { jsx: true } },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-type-checked",
    "plugin:react/recommended",
    "plugin:react/jsx-runtime",
    "plugin:react-hooks/recommended",
    "plugin:jsx-a11y/recommended",
    "plugin:import/recommended",
    "plugin:import/typescript",
    "prettier",
  ],
  plugins: ["@typescript-eslint", "react", "react-hooks", "jsx-a11y", "import"],
  settings: {
    react: { version: "detect" },
    "import/resolver": { typescript: true },
  },
  rules: {
    "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/consistent-type-imports": "error",
    "react/prop-types": "off",          // TypeScript handles this
    "react/display-name": "error",
    "react-hooks/exhaustive-deps": "warn",
    "import/no-default-export": "error", // named exports only
    "import/order": ["error", { "newlines-between": "always" }],
  },
  overrides: [
    { files: ["**/*.test.ts", "**/*.test.tsx"], rules: { "@typescript-eslint/no-explicit-any": "off" } },
    { files: ["demo/**"], rules: { "import/no-default-export": "off" } },
  ],
};
```

## Prettier

`.prettierrc.json`:

```json
{
  "semi": true,
  "singleQuote": false,
  "tabWidth": 2,
  "printWidth": 100,
  "trailingComma": "all",
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

`.prettierignore`: `dist`, `node_modules`, `coverage`, `.changeset`.

## Stylelint (CSS)

```
npm install -D stylelint stylelint-config-standard stylelint-config-recess-order
```

`.stylelintrc.json`:

```json
{
  "extends": ["stylelint-config-standard", "stylelint-config-recess-order"],
  "rules": {
    "declaration-empty-line-before": null,
    "selector-class-pattern": "^vf-",
    "custom-property-pattern": "^vf-"
  }
}
```

## TypeScript

Already configured in Phase 01. Plus:

- `"skipLibCheck": true` for fast builds.
- Project references if we split packages later.

## Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -p tsconfig.build.json --emitDeclarationOnly && vite build",
    "preview": "vite preview",
    "lint": "eslint src demo",
    "lint:fix": "eslint src demo --fix",
    "lint:css": "stylelint 'src/**/*.css'",
    "format": "prettier --write src demo",
    "typecheck": "tsc --noEmit",
    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:ssr": "vitest --run test/ssr.test.tsx",
    "test:a11y": "vitest --run test/a11y.test.tsx",
    "test:e2e": "playwright test",
    "storybook": "storybook dev -p 6006",
    "build:storybook": "storybook build",
    "chromatic": "chromatic --exit-zero-on-changes",
    "size": "size-limit",
    "size:why": "size-limit --why",
    "prepare": "husky install",
    "release": "changeset publish",
    "prepublishOnly": "npm run typecheck && npm run lint && npm run test && npm run build"
  }
}
```

## Git Hooks (husky + lint-staged)

```
npm install -D husky lint-staged
npx husky install
npx husky add .husky/pre-commit "npx lint-staged"
```

`.lintstagedrc.json`:

```json
{
  "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
  "*.css": ["stylelint --fix", "prettier --write"],
  "*.{md,json}": ["prettier --write"]
}
```

Pre-commit hook also runs `npm run typecheck` on changed files (optional; can be slow).

## Storybook

```
npx storybook@latest init --builder vite
```

Config adjustments:

- `stories: ["../src/**/*.stories.tsx"]`
- Addons: `@storybook/addon-a11y`, `@storybook/addon-interactions`, `@storybook/addon-links`, `@chromatic-com/storybook`.
- Decorator wraps all stories with VoidframeProvider.

### Story Template

```tsx
// src/components/Button/Button.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./Button";

const meta: Meta<typeof Button> = {
  title: "Components/Button",
  component: Button,
  tags: ["autodocs"],
  args: { children: "Click me" },
  argTypes: {
    variant: { control: "select", options: ["default", "ghost", "accent", "solid"] },
    size: { control: "select", options: ["xs", "sm", "md", "lg"] },
    disabled: { control: "boolean" },
  },
};
export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {};
export const Ghost: Story = { args: { variant: "ghost" } };
export const Sizes: Story = {
  render: () => (
    <>
      <Button size="xs">XS</Button>
      <Button size="sm">SM</Button>
      <Button size="md">MD</Button>
      <Button size="lg">LG</Button>
    </>
  ),
};
export const Disabled: Story = { args: { disabled: true } };
export const WithIcons: Story = { args: { leadingIcon: "→", trailingIcon: "↗" } };
```

Rule: **every component has a story file** covering: default, all variants/sizes, disabled, playground.

## Bundle Size Enforcement

```
npm install -D size-limit @size-limit/preset-small-lib
```

`.size-limit.json`:

```json
[
  { "name": "full lib (es)", "path": "dist/voidframe.es.js", "limit": "150 KB" },
  { "name": "button only", "path": "dist/components/Button.js", "limit": "3 KB" },
  { "name": "css", "path": "dist/styles.css", "limit": "25 KB" }
]
```

Fails CI on breach.

## Bundle Visualizer

```
npm install -D rollup-plugin-visualizer
```

Plugin added to Vite config; emits `stats.html` on build. Uploaded as PR artifact.

## CI (GitHub Actions)

`.github/workflows/ci.yml`:

```yaml
name: CI
on:
  push:
    branches: [main]
  pull_request:

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - run: npm ci
      - run: npm run lint
      - run: npm run lint:css
      - run: npm run typecheck
      - run: npm run test:coverage
      - run: npm run test:ssr
      - run: npm run build
      - run: npm run size
      - uses: actions/upload-artifact@v4
        with: { name: coverage, path: coverage }

  e2e:
    runs-on: ubuntu-latest
    needs: validate
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run build:storybook
      - run: npm run test:e2e

  chromatic:
    runs-on: ubuntu-latest
    needs: validate
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0 }
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - run: npm ci
      - run: npm run chromatic
        env: { CHROMATIC_PROJECT_TOKEN: ${{ secrets.CHROMATIC_PROJECT_TOKEN }} }
```

## Release (Changesets)

```
npm install -D @changesets/cli
npx changeset init
```

Workflow:

1. Contributor adds a changeset with `npx changeset` describing the change.
2. PR merges; a "Version Packages" PR is auto-opened by the `changesets/action`.
3. Merging the version PR triggers a release workflow that publishes to npm + creates a GitHub release.

`.github/workflows/release.yml`:

```yaml
name: Release
on:
  push:
    branches: [main]

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm, registry-url: https://registry.npmjs.org }
      - run: npm ci
      - run: npm run build
      - uses: changesets/action@v1
        with:
          publish: npm run release
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## Semantic Versioning

- Major: breaking API changes (prop renames, removed components).
- Minor: new components, new props.
- Patch: bug fixes, a11y fixes, non-breaking refactors.

Changesets enforce this automatically based on change types.

## Contribution Workflow

`.github/CONTRIBUTING.md` covers:
- Cloning, installing, running tests.
- How to add a component (scaffolding guide).
- Commit message convention (Conventional Commits optional).
- How to add a changeset.
- PR template.

## Code of Conduct

`.github/CODE_OF_CONDUCT.md` — Contributor Covenant 2.1.

## Issue Templates

`.github/ISSUE_TEMPLATE/`:
- `bug.yml` — reproduce steps, expected, actual.
- `feature.yml` — use case, proposed API, alternatives.
- `a11y.yml` — component, AT, behavior.

## PR Template

`.github/pull_request_template.md`:

```markdown
## Summary

## Changes

## Screenshots / video (UI changes)

## Checklist
- [ ] Added/updated tests
- [ ] Added/updated Storybook story
- [ ] Added changeset
- [ ] a11y audit passes
```

## Dependency Update Bot

- Dependabot enabled for npm + GitHub Actions.
- Grouped updates to reduce noise.

## Docs Build

Phase 23 covers the docs site; CI runs `npm run docs:build` on every PR.

---

## Acceptance Criteria

- [ ] ESLint + Prettier + Stylelint configured and enforced.
- [ ] Husky pre-commit hook runs lint + format.
- [ ] Storybook builds with stories for every component.
- [ ] Size-limit enforces bundle budgets.
- [ ] CI runs on every PR: lint, typecheck, test, build, size, storybook build, e2e, chromatic.
- [ ] Changesets release workflow publishes to npm.
- [ ] Contribution docs published.
- [ ] Issue + PR templates in place.
- [ ] Dependabot enabled.

## Notes

- **CI speed matters.** If CI takes >10 minutes, contributors suffer. Parallelize jobs aggressively.
- **Auto-fix > yelling.** Prefer ESLint/Prettier autofix over blocking on style.
- **Changesets over manual versioning.** Consistent and auditable.
