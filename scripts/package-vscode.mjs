#!/usr/bin/env node
/**
 * Build the Voidframe VS Code extension into a .vsix file.
 *
 * Steps:
 *   1. Regenerate snippets from docs/data/props.json.
 *   2. Copy the current props.json into the extension's `data/` folder so
 *      the hover provider has it bundled.
 *   3. Run `vsce package` to produce <extension>-<version>.vsix.
 *
 * The output lands at tools/vscode-voidframe/voidframe-<version>.vsix.
 * Not published — install locally via:
 *   code --install-extension voidframe-<version>.vsix
 */
import { copyFileSync, mkdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "..");
const extDir = join(repoRoot, "tools", "vscode-voidframe");

export const paths = { repoRoot, extDir };

/**
 * Execute one build step under a named log group.
 */
export function step(label, fn, log = console) {
  log.log(`\n[${label}]`);
  fn();
}

/**
 * Package the VS Code extension. Exported so tests can exercise it
 * with injected runners (spawnSync and the filesystem ops can be
 * mocked).
 */
export function packageExtension({
  runner = spawnSync,
  copy = copyFileSync,
  ensureDir = mkdirSync,
  log = console,
  exit = (code) => process.exit(code),
} = {}) {
  step(
    "regenerate snippets",
    () => {
      const r = runner(
        "node",
        [join(repoRoot, "scripts", "generate-vscode-snippets.mjs")],
        { stdio: "inherit" }
      );
      if (r.status !== 0) exit(r.status ?? 1);
    },
    log
  );

  step(
    "bundle props.json into extension",
    () => {
      const src = join(repoRoot, "docs", "data", "props.json");
      const destDir = join(extDir, "data");
      ensureDir(destDir, { recursive: true });
      copy(src, join(destDir, "props.json"));
      log.log(
        `  copied → ${join("tools/vscode-voidframe/data", "props.json")}`
      );
    },
    log
  );

  step(
    "package .vsix",
    () => {
      // vsce is installed as a devDep at the repo root; invoke via npx.
      const r = runner(
        "npx",
        [
          "--no-install",
          "vsce",
          "package",
          "--no-dependencies",
          "--allow-star-activation",
        ],
        { stdio: "inherit", cwd: extDir }
      );
      if (r.status !== 0) exit(r.status ?? 1);
    },
    log
  );

  log.log("\n✔ VS Code extension packaged. Install locally with:");
  log.log("  code --install-extension tools/vscode-voidframe/*.vsix");
}

// Only execute when invoked directly.
const invokedDirectly =
  process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (invokedDirectly) {
  packageExtension();
}
