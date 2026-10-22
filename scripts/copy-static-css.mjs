#!/usr/bin/env node
/**
 * Copy stylesheets that ship as-is (not bundled into dist/voidframe.css)
 * into dist/. Today: the shadcn token bridges, exported as
 * `voidframe-ui/compat-shadcn/tokens.css` and `…/tokens-v4.css`.
 */
import { copyFileSync, mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

export const STATIC_CSS = [
  ["src/css/compat/shadcn-tokens.css", "dist/compat-shadcn-tokens.css"],
  ["src/css/compat/shadcn-tokens-v4.css", "dist/compat-shadcn-tokens-v4.css"],
];

export function copyStaticCss(base = root) {
  for (const [from, to] of STATIC_CSS) {
    mkdirSync(dirname(join(base, to)), { recursive: true });
    copyFileSync(join(base, from), join(base, to));
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  copyStaticCss();
  console.log(`[copy-static-css] ${STATIC_CSS.length} file(s) copied to dist/`);
}
