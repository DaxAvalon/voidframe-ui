// Shared scaffolding logic — used by `voidframe init` (the in-CLI
// command at ./init.mjs) AND by the standalone `create-voidframe-app`
// package (tools/create-voidframe-app/bin/cli.mjs). Keeping the
// implementation here means consumers of either entrypoint get the
// same template + name-rewrite behavior without code duplication.

import { cp, mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
export const TEMPLATES_ROOT = resolve(__dirname, "..", "templates");
/** Default (Vite) template. Kept as a named export for back-compat. */
export const TEMPLATE_DIR = resolve(TEMPLATES_ROOT, "app");

/** Templates the scaffolder can produce, in display order. */
export const TEMPLATES = {
  app: "Vite + React + TypeScript SPA",
  next: "Next.js (App Router) + TypeScript",
};

async function pathExists(p) {
  try {
    await stat(p);
    return true;
  } catch {
    return false;
  }
}

async function copyTemplate(src, dest) {
  await mkdir(dest, { recursive: true });
  const entries = await readdir(src, { withFileTypes: true });
  for (const e of entries) {
    const s = join(src, e.name);
    const d = join(dest, e.name);
    if (e.isDirectory()) {
      await copyTemplate(s, d);
    } else {
      await cp(s, d);
    }
  }
}

/**
 * Run the scaffold. Resolves to a numeric exit code (0 = success).
 *
 * @param {object} opts
 * @param {string} opts.dir Target directory (relative paths resolved against cwd).
 * @param {boolean} [opts.force] Overwrite an existing non-empty target.
 * @param {string} [opts.template] Template name (see TEMPLATES). Default "app".
 * @param {Console} [opts.log] Logger; defaults to global console.
 */
export async function scaffold({
  dir,
  force = false,
  template = "app",
  log = console,
} = {}) {
  if (!dir) {
    log.error("✖ Missing target directory.");
    return 1;
  }
  if (!Object.prototype.hasOwnProperty.call(TEMPLATES, template)) {
    log.error(
      `✖ Unknown template "${template}". Available: ${Object.keys(TEMPLATES).join(", ")}.`
    );
    return 1;
  }
  const templateDir = resolve(TEMPLATES_ROOT, template);
  const target = resolve(dir);
  const exists = await pathExists(target);
  if (exists && !force) {
    const entries = await readdir(target).catch(() => []);
    if (entries.length > 0) {
      log.error(
        `✖ ${dir} already exists and is not empty. Re-run with --force to overwrite.`
      );
      return 1;
    }
  }
  await copyTemplate(templateDir, target);
  // Rewrite package.json name.
  const pkgPath = join(target, "package.json");
  const pkgRaw = await readFile(pkgPath, "utf-8");
  const pkg = JSON.parse(pkgRaw);
  pkg.name = dir
    .split("/")
    .pop()
    .replace(/[^a-z0-9_-]/gi, "-")
    .toLowerCase();
  await writeFile(pkgPath, JSON.stringify(pkg, null, 2) + "\n", "utf-8");
  log.log(`✔ Scaffolded voidframe ${template} app at ${target}`);
  log.log(`  Next steps:`);
  log.log(`    cd ${dir}`);
  log.log(`    npm install`);
  log.log(`    npm run dev`);
  return 0;
}
