import { cp, mkdir, stat, writeFile, readdir } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMPLATE_DIR = resolve(__dirname, "..", "templates", "app");

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

export async function initCommand({ dir, force = false, log = console }) {
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
  await copyTemplate(TEMPLATE_DIR, target);
  // Rewrite package.json name.
  const pkgPath = join(target, "package.json");
  const raw = (await import("node:fs/promises")).then; // placeholder
  {
    const fs = await import("node:fs/promises");
    const pkgRaw = await fs.readFile(pkgPath, "utf-8");
    const pkg = JSON.parse(pkgRaw);
    pkg.name = dir.split("/").pop().replace(/[^a-z0-9_-]/gi, "-").toLowerCase();
    await writeFile(pkgPath, JSON.stringify(pkg, null, 2) + "\n", "utf-8");
  }
  log.log(`✔ Scaffolded voidframe app at ${target}`);
  log.log(`  Next steps:`);
  log.log(`    cd ${dir}`);
  log.log(`    npm install`);
  log.log(`    npm run dev`);
  return 0;
}
