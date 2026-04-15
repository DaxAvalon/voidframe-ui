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

function step(label, fn) {
  console.log(`\n[${label}]`);
  fn();
}

step("regenerate snippets", () => {
  const r = spawnSync(
    "node",
    [join(repoRoot, "scripts", "generate-vscode-snippets.mjs")],
    { stdio: "inherit" }
  );
  if (r.status !== 0) process.exit(r.status ?? 1);
});

step("bundle props.json into extension", () => {
  const src = join(repoRoot, "docs", "data", "props.json");
  const destDir = join(extDir, "data");
  mkdirSync(destDir, { recursive: true });
  copyFileSync(src, join(destDir, "props.json"));
  console.log(`  copied → ${join("tools/vscode-voidframe/data", "props.json")}`);
});

step("package .vsix", () => {
  // vsce is installed as a devDep at the repo root; invoke via npx.
  const r = spawnSync(
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
  if (r.status !== 0) process.exit(r.status ?? 1);
});

console.log("\n✔ VS Code extension packaged. Install locally with:");
console.log("  code --install-extension tools/vscode-voidframe/*.vsix");
