# Audit 28 — CI/CD Pipeline

## Critical

1. **GitHub Actions in Forgejo** — Workflow uses `actions/checkout@v4`, `actions/setup-node@v4`, `actions/upload-artifact@v3` which may not be fully compatible with Forgejo's native runner. Container image `catthehacker/ubuntu:act-latest` is designed for `act`, not native Forgejo.

2. **Artifact Upload 500 Errors** — `actions/upload-artifact@v3` requires Forgejo artifact storage to be configured. Currently masked by `continue-on-error: true`. Coverage reports and dist files are not persisted.

3. **No npm Publishing** — Release job builds and packages tarball but never runs `npm publish`. No `NPM_TOKEN` secret, no `.npmrc` auth, no SemVer validation.

## High

4. **Linting Not Enforced** — `npm run lint:voidframe` exists but is never called in CI. Custom ESLint rules (`no-raw-hex-colors`, `no-legacy-chart-imports`, `require-use-client`) are unenforced.

5. **No Branch Protection** — CI runs are advisory only. No Forgejo branch protection rules requiring CI to pass before merge.

6. **Size-Limit Not Checked** — `npm run size` defined with budgets (170KB core, 40KB charts, 10KB dev) but never run in CI.

## Medium

7. **Coverage Report Inaccessible** — Coverage generated but artifact upload fails silently. No integration with coverage services.

8. **Container Image Mismatch** — `catthehacker/ubuntu:act-latest` is unstable, designed for GitHub Actions, not Forgejo.

9. **Unused CI Scripts** — `test:ssr`, `test:a11y`, `size`, `pack:check`, `lint:voidframe`, `docs:build` all defined but never run in CI.

## Low

10. **No Automated Changelog** — CHANGELOG.md manually maintained. No conventional-commits parser.

11. **No Security Scanning** — `npm ci --no-audit` explicitly skips audit. No dependency scanning.

12. **Type Declaration Dual Emission** — Both `tsc --emitDeclarationOnly` and `vite-plugin-dts` may emit types.

## Strengths

- Correct step ordering: typecheck → test → coverage → build → verify dist
- Comprehensive dist verification (checks all expected output files)
- Concurrency control (cancels older runs on same ref)
- `prepublishOnly` hook validates local publishes
- Release job triggers correctly on `refs/tags/v*`
