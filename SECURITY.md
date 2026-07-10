# Security Policy

Voidframe is a client-side React component library. It ships **zero runtime
dependencies** (every heavy capability — charts, QR/barcode, flow diagrams,
HTML sanitisation — is a *peer* dependency you install and version yourself),
which keeps the attack surface we are responsible for small and auditable.

This document explains which versions receive fixes, how to report a
vulnerability privately, and what to expect after you do.

## Supported versions

Security fixes are published for the latest released minor line. Older lines
do not receive backports; upgrading within the same major is always
non-breaking by policy (see [CHANGELOG.md](./CHANGELOG.md)).

| Version | Supported          |
| ------- | ------------------ |
| 1.4.x   | :white_check_mark: |
| < 1.4   | :x: (please upgrade) |

The current release is **1.4.0**.

## Reporting a vulnerability

**Please do not open a public issue for security problems.**

Report privately through GitHub's coordinated-disclosure channel:

1. Go to the [**Security** tab](https://github.com/DaxAvalon/voidframe-ui/security/advisories).
2. Click **Report a vulnerability**.
3. Describe the issue, including affected version(s), a reproduction or proof
   of concept, and the impact you have in mind.

A private advisory keeps the discussion confidential between you and the
maintainers until a fix is ready and coordinated disclosure is agreed.

### What to include

- The affected package version (`npm ls voidframe-ui`) and React version.
- A minimal reproduction — a component, props, and the observed vs. expected
  behaviour. CodeSandbox/StackBlitz links are welcome.
- The security impact you foresee (e.g. XSS, prototype pollution, ReDoS).

### Response targets

These are goals, not contractual guarantees, for a small maintainer team:

| Stage                         | Target            |
| ----------------------------- | ----------------- |
| Acknowledge the report        | within 3 days     |
| Initial assessment / severity | within 7 days     |
| Fix or mitigation plan        | within 30 days    |

We will keep you updated through the advisory thread and credit you in the
release notes and advisory unless you ask to remain anonymous.

## Scope

Voidframe renders UI in the browser. The classes of issue most relevant to a
component library are:

- **Cross-site scripting (XSS)** through component props that end up in the
  DOM. Voidframe does **not** call `dangerouslySetInnerHTML` on untrusted
  input on your behalf; components that render rich/markup content (e.g. chat
  and markdown surfaces) require **`dompurify`** as a peer dependency and
  expect sanitised input. If you find a path where attacker-controlled props
  reach the DOM unescaped, that is in scope.
- **Prototype pollution / ReDoS** in utility helpers, hooks, or token parsing.
- **Supply-chain integrity** of the published `voidframe-ui` package (see
  below).

The following are **out of scope** here (report to the respective project):

- Vulnerabilities in peer dependencies (React, d3-*, `@xyflow/react`,
  `dompurify`, `jsbarcode`, `qrcode-generator`, `topojson-client`, etc.). We
  will help coordinate, but the fix belongs upstream.
- Vulnerabilities that only affect the dev toolchain (Vite, Vitest, esbuild
  dev server) and never reach published artifacts. CI audits these
  informationally but does not ship them to consumers.

## Supply-chain integrity

What we do so you can trust the bytes you install:

- **No runtime dependencies.** `npm ls --omit=dev --omit=peer` is empty for the
  published package — there is no transitive runtime tree to compromise.
- **Trusted publishing via OIDC.** Releases are published from GitHub Actions
  using npm's OIDC trusted publishing — there is **no long-lived `NPM_TOKEN`**
  to leak. Each release carries an **npm provenance attestation** linking the
  tarball to the exact workflow run and commit that built it.
- **Pinned CI actions.** Every GitHub Action is pinned to a full commit SHA,
  not a moving tag, so a compromised upstream tag cannot silently alter our
  pipeline.
- **Runtime dependency audit gate.** CI runs `npm audit --omit=dev
  --audit-level=low` on every push and PR; a runtime advisory fails the build.

Verify a published release yourself:

```sh
npm view voidframe-ui dist.integrity        # subresource integrity hash
npm audit signatures                         # verify provenance + signatures
```

## Disclosure policy

We follow coordinated disclosure: we ask that you give us a reasonable window
to ship a fix before any public write-up. Once a patched version is released we
will publish a GitHub Security Advisory (and an npm advisory where applicable)
describing the issue, affected versions, and the fix.
