#!/usr/bin/env node
/**
 * Token discipline for CSS: the ESLint plugin's no-raw-hex-colors rule
 * only covers TSX style objects, so this script enforces the same rule
 * for stylesheets — every color in src/css must come from a --vf-*
 * token.
 *
 * Allowed:
 *   - tokens.css (it DEFINES the tokens, including --vf-static-*),
 *   - hex/rgb inside var(--…, fallback) fallbacks (theme-safe by
 *     construction — unused whenever the token is defined),
 *   - lines carrying `vf-allow-raw-color: <reason>` in a comment on
 *     the same or the preceding line.
 *
 * Exits 1 listing file:line for every violation.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const cssRoot = join(repoRoot, "src", "css");

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) yield* walk(full);
    else if (name.endsWith(".css")) yield full;
  }
}

/** Remove var(...) expressions (handles one level of nesting) so hex
 * fallbacks inside them don't count as violations. */
function stripVarExpressions(line) {
  let prev;
  do {
    prev = line;
    line = line.replace(/var\([^()]*\)/g, "var()");
  } while (line !== prev);
  return line;
}

// Hex/rgb/hsl literals, plus bare white/black keywords in declarations
// or color-mix() — the two keyword forms that sneak past hex greps.
const RAW_COLOR =
  /#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(|:\s*(?:white|black)\b|color-mix\([^)]*\b(?:white|black)\b/;
const ALLOW = /vf-allow-raw-color\s*:/;

const violations = [];
for (const file of walk(cssRoot)) {
  const rel = relative(repoRoot, file);
  if (rel.endsWith("tokens.css")) continue;
  const lines = readFileSync(file, "utf8").split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (ALLOW.test(line) || (i > 0 && ALLOW.test(lines[i - 1]))) continue;
    const stripped = stripVarExpressions(line);
    const match = stripped.match(RAW_COLOR);
    if (match) {
      violations.push(`${rel}:${i + 1}: ${line.trim()}`);
    }
  }
}

// ── Undefined token references ───────────────────────────────
// var(--vf-border) silently resolving to currentColor is how 42
// borders ended up text-colored; every var(--vf-*) reference without
// a fallback must point at a property defined somewhere in src/css or
// set from a component's TSX (style={{ "--vf-…": … }}).

function collectDefined() {
  const defined = new Set();
  for (const file of walk(cssRoot)) {
    const text = readFileSync(file, "utf8");
    for (const m of text.matchAll(/(--vf-[\w-]+)\s*:/g)) defined.add(m[1]);
  }
  // Custom properties assigned from TSX style objects.
  const srcRoot = join(repoRoot, "src");
  for (const file of walkAll(srcRoot)) {
    if (!/\.(tsx?|mjs)$/.test(file)) continue;
    const text = readFileSync(file, "utf8");
    for (const m of text.matchAll(/["'](--vf-[\w-]+)["']\s*[:\]]/g)) {
      defined.add(m[1]);
    }
  }
  return defined;
}

function* walkAll(dir) {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === "__tests__") continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) yield* walkAll(full);
    else yield full;
  }
}

const defined = collectDefined();
const undefinedRefs = [];
for (const file of walk(cssRoot)) {
  const rel = relative(repoRoot, file);
  const lines = readFileSync(file, "utf8").split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    // Only flag fallback-less references — var(--x, fallback) is safe.
    for (const m of lines[i].matchAll(/var\((--vf-[\w-]+)\)/g)) {
      if (!defined.has(m[1])) {
        undefinedRefs.push(`${rel}:${i + 1}: var(${m[1]}) — token not defined anywhere`);
      }
    }
  }
}

if (violations.length > 0 || undefinedRefs.length > 0) {
  if (violations.length > 0) {
    console.error(
      `[check-css-colors] ${violations.length} raw color(s) outside the token system:\n`
    );
    for (const v of violations) console.error("  " + v);
    console.error(
      `\nUse a --vf-* token (or --vf-static-white/black for optical surfaces).` +
        `\nIf a raw value is genuinely required, annotate the line with` +
        `\n/* vf-allow-raw-color: <reason> */ and justify it in review.`
    );
  }
  if (undefinedRefs.length > 0) {
    console.error(
      `\n[check-css-colors] ${undefinedRefs.length} reference(s) to undefined --vf-* tokens` +
        ` (these silently resolve to currentColor/initial):\n`
    );
    for (const v of undefinedRefs) console.error("  " + v);
  }
  process.exit(1);
}
console.log(
  "[check-css-colors] OK — no raw colors, no undefined token references"
);
