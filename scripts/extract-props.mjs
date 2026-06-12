#!/usr/bin/env node
/**
 * Extract voidframe's API surface for the docs site:
 *   - docs/data/props.json — component PropDocs via react-docgen-typescript
 *   - docs/data/hooks.json — exported hooks from src/hooks/**\/*.ts(x)
 *   - docs/data/utils.json — exported helpers from src/utils/**\/*.ts
 *
 * Everything is read from the real source via the TypeScript compiler so
 * descriptions stay in sync with code.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { readFile, readdir } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import docgen from "react-docgen-typescript";
import ts from "typescript";
import { resolveKind } from "./docs-kinds.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "..");
const srcDir = join(repoRoot, "src");
const hooksDir = join(srcDir, "hooks");
const utilsDir = join(srcDir, "utils");
const outDir = join(repoRoot, "docs", "data");

// ── Walkers ──────────────────────────────────────────────────

async function walk(root, accept) {
  const out = [];
  async function visit(dir) {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const e of entries) {
      const full = join(dir, e.name);
      if (e.isDirectory()) {
        if (e.name === "__tests__" || e.name === "node_modules") continue;
        await visit(full);
      } else if (accept(e.name)) {
        out.push(full);
      }
    }
  }
  await visit(root);
  return out;
}

const tsxFilter = (name) =>
  name.endsWith(".tsx") &&
  !name.includes(".test.") &&
  !name.includes(".spec.");
const tsFilter = (name) =>
  (name.endsWith(".ts") || name.endsWith(".tsx")) &&
  !name.endsWith(".d.ts") &&
  !name.includes(".test.") &&
  !name.includes(".spec.");

// ── Components (react-docgen-typescript) ────────────────────

// Use a lightweight tsconfig that only includes src/ — the full tsconfig
// pulls in demo/, docs/, and tools/ which massively inflates the TS program.
const extractTsConfig = join(repoRoot, "tsconfig.extract.json");
const parser = docgen.withCustomConfig(extractTsConfig, {
  savePropValueAsString: true,
  shouldExtractLiteralValuesFromEnum: true,
  shouldRemoveUndefinedFromOptional: true,
  propFilter: (prop) => {
    if (prop.parent && /node_modules/.test(prop.parent.fileName)) return false;
    if (prop.name.startsWith("aria-")) return false;
    if (["children", "className", "style", "ref", "key"].includes(prop.name))
      return false;
    return true;
  },
});

async function extractComponents() {
  const files = await walk(srcDir, tsxFilter);
  console.log(`[extract-props] found ${files.length} .tsx files to parse…`);
  const docs = [];
  let skipped = 0;
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const rel = file.replace(repoRoot + "/", "");
    try {
      // Skip testing mocks and dev tools — they confuse the parser
      if (rel.includes("/testing/") || rel.includes("/dev/")) continue;
      const parsed = parser.parse(file);
      for (const comp of parsed) {
        if (!comp.displayName || !/^[A-Z]/.test(comp.displayName)) continue;
        if (comp.displayName === "__type") continue;
        // Skip non-component exports that react-docgen mistakenly picks up
        const EXCLUDED_NAMES = new Set([
          'ReactNode', 'RESPONSIVE_SIZE_PRESETS', 'Context',
        ]);
        if (EXCLUDED_NAMES.has(comp.displayName)) continue;
        const { kind, parent } = resolveKind(comp.displayName, rel, comp.tags);
        docs.push({
          name: comp.displayName,
          description: comp.description,
          file: rel,
          kind,
          ...(parent ? { docsParent: parent } : {}),
          props: Object.values(comp.props).map((p) => ({
            name: p.name,
            type: p.type?.name ?? "unknown",
            defaultValue: p.defaultValue?.value,
            description: p.description,
            required: p.required,
          })),
        });
      }
    } catch (err) {
      skipped++;
      console.warn(`[extract-props] skipped ${rel}: ${err.message}`);
    }
    // Progress indicator every 20 files
    if ((i + 1) % 20 === 0) {
      console.log(`[extract-props] parsed ${i + 1}/${files.length}…`);
    }
  }
  if (skipped > 0) console.log(`[extract-props] skipped ${skipped} files with errors`);
  const byName = new Map();
  for (const d of docs) byName.set(d.name, d);
  return Array.from(byName.values()).sort((a, b) =>
    a.name.localeCompare(b.name)
  );
}

// ── Hooks / utilities (TypeScript AST) ───────────────────────

function tsCompile(files) {
  return ts.createProgram(files, {
    target: ts.ScriptTarget.ES2020,
    module: ts.ModuleKind.ESNext,
    jsx: ts.JsxEmit.ReactJSX,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    strict: true,
    skipLibCheck: true,
    esModuleInterop: true,
    noEmit: true,
  });
}

function commentFor(node, sourceFile) {
  const ranges = ts.getLeadingCommentRanges(sourceFile.text, node.pos);
  if (!ranges || ranges.length === 0) return undefined;
  const last = ranges[ranges.length - 1];
  const raw = sourceFile.text.slice(last.pos, last.end).trim();
  if (!raw.startsWith("/**")) return undefined;
  // Strip the /** … */ wrapper and the leading " * " on each line.
  return raw
    .replace(/^\/\*\*/, "")
    .replace(/\*\/$/, "")
    .split(/\r?\n/)
    .map((l) => l.replace(/^\s*\*\s?/, "").trimEnd())
    .join("\n")
    .trim();
}

function signatureFor(node, sourceFile) {
  // Keep the declaration text but stop at the first `{` that opens the body.
  const text = node.getText(sourceFile);
  const brace = text.indexOf("{\n");
  const sig = brace === -1 ? text : text.slice(0, brace).trim();
  // Collapse whitespace; keep it readable for inline code.
  return sig.replace(/\s+/g, " ").replace(/\s*,\s*/g, ", ");
}

function extractExports(file, file_rel) {
  return new Promise(async (resolvePromise) => {
    const source = await readFile(file, "utf-8");
    const sf = ts.createSourceFile(
      file,
      source,
      ts.ScriptTarget.ES2020,
      true,
      file.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS
    );
    const out = [];
    for (const stmt of sf.statements) {
      const isExported =
        stmt.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword) ??
        false;
      if (!isExported) continue;
      if (ts.isFunctionDeclaration(stmt) && stmt.name) {
        out.push({
          name: stmt.name.text,
          kind: "function",
          signature: signatureFor(stmt, sf),
          description: commentFor(stmt, sf),
          file: file_rel,
        });
      } else if (ts.isVariableStatement(stmt)) {
        for (const decl of stmt.declarationList.declarations) {
          if (ts.isIdentifier(decl.name)) {
            let kind = "variable";
            if (
              decl.initializer &&
              (ts.isArrowFunction(decl.initializer) ||
                ts.isFunctionExpression(decl.initializer))
            ) {
              kind = "function";
            }
            const sig = signatureFor(decl, sf);
            out.push({
              name: decl.name.text,
              kind,
              signature: sig,
              description: commentFor(stmt, sf),
              file: file_rel,
            });
          }
        }
      } else if (ts.isTypeAliasDeclaration(stmt)) {
        out.push({
          name: stmt.name.text,
          kind: "type",
          signature: signatureFor(stmt, sf),
          description: commentFor(stmt, sf),
          file: file_rel,
        });
      } else if (ts.isInterfaceDeclaration(stmt)) {
        out.push({
          name: stmt.name.text,
          kind: "interface",
          signature: `interface ${stmt.name.text}`,
          description: commentFor(stmt, sf),
          file: file_rel,
        });
      }
    }
    resolvePromise(out);
  });
}

async function extractFromDir(dir, accept) {
  const files = await walk(dir, accept);
  const out = [];
  for (const f of files) {
    const rel = f.replace(repoRoot + "/", "");
    const entries = await extractExports(f, rel);
    out.push(...entries);
  }
  // De-dup by name; keep the first.
  const byName = new Map();
  for (const e of out) {
    if (!byName.has(e.name)) byName.set(e.name, e);
  }
  return Array.from(byName.values()).sort((a, b) =>
    a.name.localeCompare(b.name)
  );
}

// ── Main ─────────────────────────────────────────────────────

/**
 * Run the full extraction pipeline. Exported so tests can invoke it
 * without spawning a subprocess (and therefore without losing coverage
 * on the extraction helpers).
 */
export async function main() {
  mkdirSync(outDir, { recursive: true });

  const components = await extractComponents();
  writeFileSync(
    join(outDir, "props.json"),
    JSON.stringify(components, null, 2)
  );
  console.log(`[extract-props] ${components.length} components → props.json`);

  const hooks = (await extractFromDir(hooksDir, tsFilter)).filter(
    (e) => e.name.startsWith("use") || e.name === "ShortcutProvider"
  );
  writeFileSync(join(outDir, "hooks.json"), JSON.stringify(hooks, null, 2));
  console.log(`[extract-props] ${hooks.length} hooks → hooks.json`);

  const utils = (await extractFromDir(utilsDir, tsFilter)).filter(
    (e) =>
      (e.kind === "function" || e.kind === "variable") &&
      // Drop internal-only test helpers. These live inside the utils
      // folder but are excluded from the public surface barrel.
      !e.name.startsWith("_")
  );
  writeFileSync(join(outDir, "utils.json"), JSON.stringify(utils, null, 2));
  console.log(`[extract-props] ${utils.length} utils → utils.json`);
  return { components, hooks, utils };
}

// Also expose the helpers so tests can exercise them in isolation.
export {
  tsFilter,
  tsxFilter,
  walk,
  commentFor,
  signatureFor,
  extractExports,
  extractFromDir,
  extractComponents,
};

// Only run the pipeline when invoked directly (not when imported by tests).
const invokedDirectly =
  process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (invokedDirectly) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
