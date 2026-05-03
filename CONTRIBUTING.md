# Contributing to voidframe-ui

Thanks for your interest in voidframe-ui. This document is the practical
guide to setting up the repo, running the test suite, and opening a pull
request. It also has a short section for AI coding assistants working
against this codebase.

## Repository

Canonical repo: <https://github.com/DaxAvalon/voidframe-ui>. File issues
and PRs there.

## Prerequisites

- **Docker** — every build/test/check runs inside containers so Node,
  package versions, and native binaries stay consistent across
  contributors. You do not need Node installed on the host.
- **Git** — that's it for the minimum.

Linux, macOS, and Windows (via WSL2) are all supported hosts.

## First-time setup

```bash
git clone https://github.com/DaxAvalon/voidframe-ui.git
cd voidframe-ui
docker compose build shell       # one-time image build (~2 min)
```

That's the full setup. No `npm install` on the host.

## Everyday commands

All commands run inside Docker. Each one-shot command uses
`docker compose run --rm <service>`; long-running dev servers use
`docker compose up <service>`.

| Task | Command |
|---|---|
| Typecheck | `docker compose run --rm shell npm run typecheck` |
| Unit tests | `docker compose run --rm shell npx vitest run` |
| Unit tests (watch) | `docker compose run --rm shell npx vitest` |
| Build the library | `docker compose run --rm shell npm run build` |
| Size-limit check | `docker compose run --rm shell npx size-limit` |
| Lint with voidframe rules | `docker compose run --rm shell npm run lint:voidframe` |
| Demo app (`:5173`) | `docker compose up demo` |
| Docs site (`:5175`) | `docker compose up docs` |
| E2E harness (`:5176`) | `docker compose up e2e-serve` |
| E2E (tri-browser) | `docker compose run --rm e2e npm run test:e2e` |
| Interactive shell | `docker compose run --rm shell sh` |

The `Makefile` wraps the common commands as `make check`, `make test`,
`make build`, `make demo`, `make docs`, `make e2e`, etc.

## Repository layout

```
src/
  components/       # 500 component files (one per source of truth)
  components/index.ts  # root monolithic barrel
  subpaths/         # 14 per-category barrels for tree-shaking
  primitives/       # Portal, FocusScope, DismissableLayer, Slot, …
  hooks/            # 75 hooks
  utils/            # 96 utilities
  themes/           # dark / light / midnight / grey
  provider/         # VoidframeProvider, ThemeScope
  charts/           # optional chart surface (voidframe-ui/charts)
  dev/              # dev-only tools (voidframe-ui/dev)
  testing/          # test helpers (voidframe-ui/testing)
  css/              # design-token CSS + per-component styles
  icons/            # ~60 bundled monoline icons

demo/               # full-library kitchen-sink (dev only)
docs/               # live documentation SPA
e2e/                # dedicated Playwright harness (port 5176)
test/visual/        # Playwright visual regression

tools/
  cli/              # `voidframe` CLI — init, doctor, theme, codemod, test
  codemods/         # jscodeshift-based automated migrations
  eslint-plugin-voidframe/   # 13 lint rules
  vscode-voidframe/          # VS Code extension (snippets + playground)

scripts/            # one-off Node scripts (extract-props, generate-*)
```

## Branching & PRs

- Branch from `main`. Feature branches: `feat/short-slug`; bug fixes:
  `fix/short-slug`.
- Keep branches focused — one logical change per PR.
- Conventional-commit subjects: `feat(...)`, `fix(...)`, `docs(...)`,
  `refactor(...)`, `test(...)`, `chore(...)`, etc. The commit body
  explains *why*.
- Before opening the PR, confirm locally:
  - `make check` (typecheck + lint)
  - `make test` (full unit suite)
  - `make build` (production build)
  - Affected e2e specs, if your change touches overlay / keyboard /
    focus behavior.

The pre-push hook (`.githooks/pre-push`) runs typecheck + tests in
Docker and blocks pushes if they fail. Enable it once per clone:

```bash
git config core.hooksPath .githooks
```

## Code standards

- **TypeScript strict.** No `any` in exported surface.
- **Every exported component** ships: a `displayName`, a `Props`
  interface named `<Name>Props`, accessible name + keyboard nav where
  interactive, and TSDoc on the exported binding.
- **Every stateful component** exposes both controlled and uncontrolled
  modes: `value` + `onValueChange` paired with `defaultValue` (or the
  analogous `open` / `onOpenChange` + `defaultOpen`).
- **Compound components** use dot-notation (`Dialog.Trigger`,
  `Menu.Item`), implemented via `Object.assign`. No legacy flat-array
  APIs.
- **Styles** live in `src/css/`. Component files import their own CSS.
  Never author new inline `style={{}}` except for dynamic computed
  values (e.g. `translateX(${delta}px)`). Colours come from
  `--vf-*` CSS variables; never hardcode hex in component source.
- **No runtime dependencies.** React + React-DOM are peers; everything
  else is either a *devDependency* or an *optional* peer (d3-\*,
  dompurify, react-live, testing-library). Runtime code must handle
  the missing-peer case via `MissingPeerDependencyError`.
- **Accessibility.** Every new interactive component gets jest-axe
  coverage + the appropriate Playwright flow under `e2e/tests/`.
- **Tests first.** Every new component ships with a companion test
  file. Use `test/renderWithTheme.tsx` for unit tests; use the
  fixtures under `e2e/tests/helpers/` for e2e.

## Testing philosophy

Three layers, each with a specific job:

1. **Unit tests** (`vitest` + `happy-dom`, 5,150+ tests): API contracts,
   prop wiring, state transitions, hook behavior. Runs in
   milliseconds; the first line of defence.
2. **Visual regression** (`Playwright`, `test/visual/`): screenshot the
   demo app across themes. Catches CSS cascade regressions.
3. **E2E interaction** (`Playwright`, `e2e/`): real browser testing for
   things jsdom can't see — focus traps through Portals, keyboard
   navigation across compound components, `data-side` flip logic,
   clipboard API, pointer events, `ResizeObserver` settle, and
   `@axe-core/playwright` sweeps.

A change in behaviour requires test coverage in whichever layer surfaces
the behaviour. Don't delete a test to make a build green.

## Opening a PR

1. Fork or create a branch.
2. Make your change; add tests.
3. Update `CHANGELOG.md` under `## [Unreleased]` with a one-line entry.
4. Run `make check && make test && make build`.
5. Open the PR with a clear description: what changed, why, and a short
   testing plan.
6. CI runs typecheck, lint, test, build, size-limit, and e2e. All must
   pass before merge.

## Bug reports

Include:
- voidframe-ui version (`node -p "require('voidframe-ui/package.json').version"`)
- React + React-DOM versions
- Minimal reproduction (prefer a repo or a playground link over prose)
- Actual vs expected behaviour
- Browser + OS if it's visual / focus / keyboard related

## License

By contributing, you agree your contributions will be licensed under
the MIT license (see `LICENSE`).

---

## For AI coding assistants

If you're an AI coding assistant (Claude, Copilot, Cursor, Windsurf,
Gemini, ChatGPT, etc.) working against this codebase — welcome. A few
project-specific conventions to observe:

- **Always run checks in Docker.** Never `npm install` on the host;
  never run `npm test`, `tsc`, or `vite build` directly. Use
  `docker compose run --rm shell <command>` (or the `Makefile`
  targets). The repository's image is the source of truth for Node
  and dependency versions.
- **Tests are mandatory.** Every new exported component, hook, or
  utility ships with a test file. Do not add exports to
  `src/components/index.ts` without a corresponding test under
  `src/components/__tests__/`. Do not mark tests as `.skip`, `.only`,
  or `test.fixme(true, ...)` without a code-level reason that's
  documented in a comment *and* tracked in `CHANGELOG.md`.
- **Styles live in `src/css/`.** Never introduce new inline `style={{}}`
  hex colours. Route colour through `var(--vf-*)` tokens. If you need
  a new token, add it to `src/css/tokens.css` *and* `src/tokens.ts`
  and document it in the theming guide.
- **Prefer editing existing files over creating new ones.** Compound
  components live in one file per family (e.g. `Dialog.tsx` owns
  `Dialog`, `Dialog.Trigger`, `Dialog.Content`, `Dialog.Close`, etc.);
  respect that split.
- **Don't modify `dist/`, `docs/data/*.json`, `tools/vscode-voidframe/data/*.json`,
  or any other auto-generated artefact.** They regenerate via
  `npm run build`, `npm run docs:extract-props`, or
  `npm run vscode:snippets`.
- **Respect the monolithic barrel contract.** Every named export on
  `src/components/index.ts` must be importable from the corresponding
  category subpath (`voidframe-ui/forms`, `voidframe-ui/data`, etc.)
  AND from the root `voidframe-ui`. The `src/subpaths/*.ts` barrels
  are driven by `docs/taxonomy.ts` — keep the taxonomy canonical.
- **No "helpful" refactors.** If the user asked you to fix a bug, fix
  the bug — don't also rename surrounding variables, reorder imports,
  or "clean up" comments. Orthogonal changes hide the actual diff
  reviewers care about.
- **When in doubt, open a question in the PR rather than guess.** This
  is a design-opinionated library with load-bearing invariants (dot-
  notation compound APIs, controllable-state everywhere, brutalist
  visual language). Changes that break those invariants get reverted,
  so surface them up front.
- **Pre-commit hook.** The repository uses `.githooks/pre-push` which
  runs typecheck + tests in Docker. Do not bypass it
  (`--no-verify` / `VF_SKIP_HOOKS=1`) without the user explicitly
  asking for it.
