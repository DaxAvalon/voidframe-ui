#!/usr/bin/env node
/**
 * Walk src/**\/*.tsx, extract component PropDocs via react-docgen-typescript,
 * and emit docs/data/props.json.
 *
 * The docs site reads this JSON at runtime for its PropsTable entries.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import docgen from "react-docgen-typescript";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "..");
const srcDir = join(repoRoot, "src");
const outFile = join(repoRoot, "docs", "data", "props.json");

// Fallback for Node versions without fs.globSync via fs/promises —
// use a tiny recursive walker.
async function findTsxFiles(root) {
  const out = [];
  const { readdir } = await import("node:fs/promises");
  async function walk(dir) {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const e of entries) {
      const full = join(dir, e.name);
      if (e.isDirectory()) {
        if (e.name === "__tests__" || e.name === "node_modules") continue;
        await walk(full);
      } else if (e.name.endsWith(".tsx")) {
        if (e.name.includes(".test.") || e.name.includes(".spec.")) continue;
        out.push(full);
      }
    }
  }
  await walk(root);
  return out;
}

const parser = docgen.withCustomConfig(
  join(repoRoot, "tsconfig.json"),
  {
    savePropValueAsString: true,
    shouldExtractLiteralValuesFromEnum: true,
    shouldRemoveUndefinedFromOptional: true,
    propFilter: (prop) => {
      // Drop anything sourced from @types/react (HTML attributes etc).
      if (prop.parent && /node_modules/.test(prop.parent.fileName)) return false;
      // Skip common framework-forwarded props that clutter tables.
      if (prop.name.startsWith("aria-")) return false;
      if (prop.name === "children") return false;
      if (prop.name === "className") return false;
      if (prop.name === "style") return false;
      if (prop.name === "ref") return false;
      if (prop.name === "key") return false;
      return true;
    },
  }
);

async function main() {
  const files = await findTsxFiles(srcDir);
  const docs = [];
  for (const file of files) {
    try {
      const parsed = parser.parse(file);
      for (const comp of parsed) {
        docs.push({
          name: comp.displayName,
          description: comp.description,
          file: file.replace(repoRoot + "/", ""),
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
      // Continue on file-level errors so one bad file doesn't kill the batch.
      console.warn(`[extract-props] skipped ${file}: ${err.message}`);
    }
  }

  // De-dup by display name. Later entries win when duplicates exist
  // (subcomponents re-declared in multiple files).
  const byName = new Map();
  for (const d of docs) {
    if (!d.name) continue;
    byName.set(d.name, d);
  }
  const final = Array.from(byName.values()).sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  mkdirSync(dirname(outFile), { recursive: true });
  writeFileSync(outFile, JSON.stringify(final, null, 2));
  console.log(
    `[extract-props] wrote ${final.length} components to ${outFile.replace(
      repoRoot + "/",
      ""
    )}`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
