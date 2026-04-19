# Verbiage surface inventory

Generated 2026-04-17 for plan 32 (docs verbiage audit). Read-only inventory of
every text surface in scope per the plan. Counts sourced from the repo
filesystem and from `docs/data/*.json` (regenerated 2026-04-17).

> Methodology note: `docker compose run … scripts/extract-props.mjs` could not
> be re-run in this session (sandbox denied docker/node invocation). The
> existing `docs/data/*.json` files are timestamped 2026-04-17 23:46 (same day
> as this audit), so they are treated as current. If a source file under `src/`
> has been modified after that timestamp the counts below may be stale by one
> commit; no such modifications were observed during this audit.

## Primary

- [ ] `README.md` (914 lines)
- [ ] `CHANGELOG.md` (78 lines)
- [ ] `VoidFrameImplementationPlan.md` (spot-check only; excluded from package via `.npmignore`)

## Docs site

- [ ] `docs/App.tsx`
- [ ] `docs/curated.tsx` (primary content)
- [ ] `docs/guides.tsx`
- [ ] `docs/patterns.tsx`
- [ ] `docs/migration.tsx`
- [ ] `docs/taxonomy.ts`
- [ ] `docs/hookMap.ts`
- [ ] `docs/a11y-audit.ts`
- [ ] `docs/scope.ts`
- [ ] `docs/autoPlayground.ts`
- [ ] `docs/CONVENTIONS.md`

## Auto-extracted data (audit source, not target)

- [ ] `docs/data/props.json` — 499 components (array; confirmed shape)
- [ ] `docs/data/hooks.json` — 75 hooks
- [ ] `docs/data/utils.json` — 96 utils

## Demo

- [ ] `demo/App.tsx`
- [ ] `demo/index.html`

## Runtime messages

- [ ] 27 `warnOnce(...)` call sites in `src/` (including tests/dev panels)
- [ ] 10 `invariant(...)` call sites in `src/`
- [ ] `src/utils/warn.ts` wrapper and `src/utils/deprecate.ts`
- [ ] `src/utils/invariant.ts`

## Tooling

- [ ] `tools/cli/bin/voidframe.mjs` (entry)
- [ ] `tools/cli/commands/` — `init.mjs`, `theme.mjs`, `codemod.mjs`, `doctor.mjs`, `test.mjs` (5 files)
- [ ] `tools/codemods/run.mjs` + `tools/codemods/transforms/` (2 transforms)
- [ ] `tools/eslint-plugin-voidframe/rules/` — 6 rules
  - `no-deprecated-props.ts`
  - `no-legacy-chart-imports.ts`
  - `no-raw-hex-colors.ts`
  - `prefer-compound-pattern.ts`
  - `require-a11y-label.ts`
  - `require-use-client.ts`
- [ ] `tools/vscode-voidframe/snippets/voidframe.code-snippets`
- [ ] `tools/vscode-voidframe/src/docs.js` (hover provider)
- [ ] `tools/vscode-voidframe/src/extension.js`
- [ ] `tools/vscode-voidframe/data/props.json` (bundled snapshot)
- [ ] `tools/vscode-voidframe/README.md`

## Scripts producing tooling-consumer text

- [ ] `scripts/export-tokens.mjs` (emitted file headers)
- [ ] `scripts/generate-changelog.mjs`
- [ ] `scripts/generate-vscode-snippets.mjs`
- [ ] `scripts/package-vscode.mjs`

## Out of scope (per plan)

- `__tests__/**` describe/it strings
- Git commit messages
- LICENSE boilerplate
- Forgejo README footer
