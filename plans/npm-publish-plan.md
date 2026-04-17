# Voidframe npm Publish & Distribution Plan

## Context

Voidframe is ready to publish. The build infrastructure is already mature — multi-entry Vite build, Forgejo CI pipeline, pre-push hooks, size budgets, and a release job stub. This plan covers the remaining steps to publish `@voidframe/ui` to both Forgejo Packages and npmjs.org, with a GitHub mirror for public visibility and GitHub Pages for docs hosting.

## Decisions

| Decision | Choice |
|----------|--------|
| Registry | Both — Forgejo Packages (internal) + npmjs.org (public) |
| Package name | `@voidframe/ui` (org-scoped) |
| Docs hosting | GitHub Pages |
| Repository URL | GitHub mirror (public face), Forgejo stays source of truth |

---

## Step 1: Rename package to `@voidframe/ui`

**Files to modify:**
- `package.json` — change `"name": "voidframe"` to `"name": "@voidframe/ui"`
- `package.json` — add `"publishConfig": { "access": "public" }`

**Side effects to update:**
- All internal imports using the package name (none — internal imports use relative paths `../src`)
- CI workflow: `npm publish --access public` already configured
- Size-limit config: artifact names in `dist/` stay the same (Vite `fileName` doesn't use package name)
- README install instructions: `npm install @voidframe/ui`
- Docs playground scope: uses `../src` imports, not package name — no change needed

**npm org setup:**
- Create `voidframe` org on npmjs.org
- Add your npm account as owner
- The scoped name `@voidframe/ui` is then reserved

---

## Step 2: Set up GitHub mirror

**Create the GitHub repo:**
- Repository: `github.com/voidframe/ui` (under the `voidframe` org) or `github.com/aeryn/voidframe`
- Set as public
- Add as a second remote in the local repo

**Configure Forgejo → GitHub sync:**
Option A — Forgejo mirror (if Forgejo supports push mirrors):
```
# In Forgejo repo settings → Mirror → Push mirror
URL: https://github.com/voidframe/ui.git
Auth: GitHub PAT with repo scope
```

Option B — CI-based sync (add to `.forgejo/workflows/ci.yml`):
```yaml
  mirror:
    name: Mirror to GitHub
    needs: ci
    if: github.ref == 'refs/heads/main' || startsWith(github.ref, 'refs/tags/v')
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - run: |
          git remote add github https://x-access-token:${GITHUB_TOKEN}@github.com/voidframe/ui.git
          git push github --all --force
          git push github --tags --force
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_MIRROR_TOKEN }}
```

**Update `package.json`:**
```json
"repository": {
  "type": "git",
  "url": "https://github.com/voidframe/ui.git"
},
"homepage": "https://voidframe.github.io/ui",
"bugs": {
  "url": "https://github.com/voidframe/ui/issues"
}
```

---

## Step 3: Set up GitHub Pages for docs

**Approach:** Build the docs site in CI and deploy to GitHub Pages on the mirror repo.

**Add to CI workflow (new job):**
```yaml
  docs:
    name: Deploy docs to GitHub Pages
    needs: ci
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci --no-fund
      - run: npm run docs:extract-props
      - run: npx vite build docs --outDir docs-dist --base /ui/
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_MIRROR_TOKEN }}
          publish_dir: docs-dist
          external_repository: voidframe/ui
```

**Vite docs build config:** Need a `docs/vite.config.ts` (or pass `--config`) that builds the docs site as a static SPA:
```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  root: "docs",
  base: "/ui/",
  plugins: [react()],
  build: {
    outDir: "../docs-dist",
    emptyOutDir: true,
  },
});
```

---

## Step 4: Configure dual-registry publishing

**Forgejo Packages:**
Add to CI release job:
```yaml
      - name: Publish to Forgejo Packages
        run: |
          echo "@voidframe:registry=https://git.ahadley.local/api/packages/aeryn/npm/" > .npmrc
          echo "//git.ahadley.local/api/packages/aeryn/npm/:_authToken=${FORGEJO_TOKEN}" >> .npmrc
          npm publish
        env:
          FORGEJO_TOKEN: ${{ secrets.FORGEJO_TOKEN }}
```

**npmjs.org:**
Already configured in CI. Update the publish step for the new scoped name:
```yaml
      - name: Publish to npm
        if: ${{ secrets.NPM_TOKEN != '' }}
        run: |
          echo "//registry.npmjs.org/:_authToken=${NPM_TOKEN}" > .npmrc
          npm publish --access public
        env:
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

**Secrets needed:**
| Secret | Where | Purpose |
|--------|-------|---------|
| `NPM_TOKEN` | Forgejo repo secrets | npm publish auth |
| `FORGEJO_TOKEN` | Forgejo repo secrets | Forgejo Packages publish auth |
| `GITHUB_MIRROR_TOKEN` | Forgejo repo secrets | Push mirror + Pages deploy |

---

## Step 5: Update CHANGELOG.md for v1.0.0

Change `[Unreleased]` to `[1.0.0] - 2026-04-16` and add a summary of the Phase 1 expansion:

```markdown
## [1.0.0] - 2026-04-16

### New Components (31)
- Core: SplitButton, CopyButton, Result
- Forms: Transfer, InlineEdit, ToggleGroup, NumberStepper, Cascader, CommandInput, FilterBuilder, CronBuilder
- Data: NotificationBadge, SkeletonComposites (6), HorizontalTimeline, Descriptions, MultiProgress, CSVViewer, ConfidenceMeter
- Navigation: Anchor, FloatingActionButton
- Overlays: Popconfirm
- Dev Tools: HexDump, EnvironmentVars, ColorContrast, RegExpTester
- Chat/AI: ModelCompare, TokenVisualizer, LiveIndicator
- Media: ImageDiff
- Activity: Comment
- Charts: OrgChart

### New Hooks (19)
useDocumentTitle, useUndoRedo, useClipboardRead, useMutationObserver, useFullscreen,
useEventSource, useWebSocket, useLockBodyScroll, useOnlineStatus, useMap, useSet,
useList, usePermission, useGeolocation, useHistoryState, useDerivedState,
useOrientation, usePreferredLanguage, useAbortController

### New Utilities (13)
Form validation adapters (Zod/Yup/Valibot), color manipulation, focus management,
imperative announcer, mergeStyles, invariant, pick/omit/splitProps,
composeEventHandlers, environment detection, portal container, cookies,
animation sequences, responsive classes

### Theme & Styling
- 35 opacity token variants, border width tokens, shadow/transition expansion
- Gradient system, CSS container queries, expanded utility classes
- color-scheme meta, print stylesheet expansion

### Docs & DX
- Interactive docs site with playground for every component
- 8 page-level pattern examples
- Token export (JSON/SCSS/CSS/Figma)
- A11y audit page, migration guide framework
- 3 new ESLint rules
- Test generator CLI
```

---

## Step 6: Update README.md for publish

Key sections needed:
```markdown
# @voidframe/ui

Dark monochrome React UI framework. Terminal-brutalist. Data-dense. Zero border-radius. Monospace-first.

## Install
npm install @voidframe/ui

## Quick Start
import { VoidframeProvider, Button } from "@voidframe/ui";
import "@voidframe/ui/styles.css";

## Subpath Imports
- @voidframe/ui — core components
- @voidframe/ui/charts — D3-based charts (requires d3-* peer deps)
- @voidframe/ui/dev — DevPanel, Playground, PropsTable
- @voidframe/ui/styles.css — stylesheet
- @voidframe/ui/tokens — design token values
- @voidframe/ui/testing — test utilities (renderWithTheme, mocks)

## Peer Dependencies
- react >= 18.0.0 (required)
- react-dom >= 18.0.0 (required)
- d3-* packages (optional, for charts)
- dompurify (optional, for HTML sanitization)
- react-live (optional, for Playground component)
```

---

## Step 7: Pre-publish verification

Run in order:
```bash
# 1. Build
docker compose run --rm build

# 2. Pack and inspect
docker compose run --rm _base npm pack
tar -tzf voidframe-ui-1.0.0.tgz  # verify contents

# 3. Test install in a fresh project
mkdir /tmp/test-vf && cd /tmp/test-vf
npm init -y
npm install /path/to/voidframe-ui-1.0.0.tgz react react-dom
node -e "const vf = require('@voidframe/ui'); console.log(Object.keys(vf).length, 'exports')"

# 4. Verify all subpath imports
node -e "require('@voidframe/ui')"
node -e "require('@voidframe/ui/charts')"
node -e "require('@voidframe/ui/dev')"
node -e "require.resolve('@voidframe/ui/styles.css')"
```

---

## Step 8: Publish

```bash
# Merge branch
git checkout main
git merge feat/phase1-components

# Version bump (updates package.json + creates git tag)
npm version 1.0.0

# Push with tag
git push && git push --tags

# CI triggers:
# 1. ci job: typecheck → test → build → size-check
# 2. release job: build → publish to Forgejo + npm
# 3. docs job: build docs → deploy to GitHub Pages
# 4. mirror job: push to GitHub
```

---

## Step 9: Post-publish

1. Verify on npm: `npm view @voidframe/ui`
2. Verify install: `npm install @voidframe/ui` in clean project
3. Verify docs site: `https://voidframe.github.io/ui`
4. Verify GitHub mirror: `https://github.com/voidframe/ui`
5. Create GitHub release with changelog notes

---

## Verification

| Check | Command |
|-------|---------|
| Package name correct | `npm pack --dry-run` shows `@voidframe/ui` |
| Tarball size reasonable | < 600 KB packed |
| All exports resolve | Test CJS + ESM imports of all subpaths |
| Types work | Import in a TS project, verify autocomplete |
| CSS loads | `import "@voidframe/ui/styles.css"` works |
| Peer deps documented | `npm install` warns about missing React |
| Changelog dated | `[1.0.0] - 2026-04-16` header |
| README has install instructions | Quick start works copy-paste |
| GitHub mirror synced | Same commits as Forgejo |
| Docs site live | GitHub Pages serves at `/ui/` |
