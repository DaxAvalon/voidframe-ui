#!/usr/bin/env node
// Copy the generated structured catalog into tools/mcp/data/ so the published
// `voidframe-mcp` package is self-contained. Run from the monorepo after
// `npm run docs:extract-props && npm run docs:generate-llms` (which produce
// docs/public/api/*.json). In-repo the server falls back to docs/public/api,
// so this is only needed before publishing the standalone package.

import { copyFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const src = resolve(__dirname, "..", "..", "..", "docs", "public", "api");
const dest = resolve(__dirname, "..", "data");

mkdirSync(dest, { recursive: true });
for (const file of ["components.json", "hooks.json", "utils.json"]) {
  copyFileSync(resolve(src, file), resolve(dest, file));
  console.log(`✓ ${file}`);
}
console.log(`\nCatalog synced to ${dest}/`);
