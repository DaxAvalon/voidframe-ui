#!/usr/bin/env node
/**
 * Wrapper around `jscodeshift` that resolves transforms by short name.
 *
 *   node tools/codemods/run.mjs <transform> <path...>
 *
 * Available transforms:
 *   legacy-charts-to-v2
 *   tokens-from-hex
 */
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const [, , transform, ...targets] = process.argv;

if (!transform || targets.length === 0) {
  console.error(
    "Usage: node tools/codemods/run.mjs <transform> <path...>\n" +
      "Available transforms:\n" +
      "  legacy-charts-to-v2\n" +
      "  tokens-from-hex"
  );
  process.exit(2);
}

const transformPath = resolve(
  __dirname,
  "transforms",
  `${transform}.ts`
);
if (!existsSync(transformPath)) {
  console.error(`Unknown transform: ${transform}`);
  process.exit(2);
}

const result = spawnSync(
  "npx",
  [
    "jscodeshift",
    "--parser=tsx",
    "--extensions=ts,tsx,js,jsx",
    "-t",
    transformPath,
    ...targets,
  ],
  { stdio: "inherit" }
);
process.exit(result.status ?? 1);
