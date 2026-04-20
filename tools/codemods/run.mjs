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

export const TRANSFORMS = ["legacy-charts-to-v2", "tokens-from-hex"];

/**
 * Resolve a codemod short name to an absolute file path. Returns null
 * when the transform doesn't exist.
 */
export function resolveTransform(name) {
  const transformPath = resolve(__dirname, "transforms", `${name}.ts`);
  return existsSync(transformPath) ? transformPath : null;
}

/**
 * Run a codemod. Returns the exit code of the underlying jscodeshift
 * invocation (or 2 on argument errors).
 *
 * @param {object} opts
 * @param {string|undefined} opts.transform  Short name of the transform.
 * @param {string[]} [opts.targets]          Paths to rewrite.
 * @param {{ log?: (msg: string) => void, error?: (msg: string) => void }} [opts.log]
 * @param {(cmd: string, args: string[], opts: object) => { status: number | null }} [opts.runner]
 *   Spawn implementation. Defaults to `child_process.spawnSync`. Tests
 *   override to assert on the invocation without launching jscodeshift.
 */
export function runCodemod({
  transform,
  targets = [],
  log = { log: console.log, error: console.error },
  runner = spawnSync,
}) {
  if (!transform || targets.length === 0) {
    log.error?.(
      "Usage: node tools/codemods/run.mjs <transform> <path...>\n" +
        "Available transforms:\n" +
        TRANSFORMS.map((n) => `  ${n}`).join("\n")
    );
    return 2;
  }
  const transformPath = resolveTransform(transform);
  if (!transformPath) {
    log.error?.(
      `Unknown transform: ${transform}\n` +
        `Available: ${TRANSFORMS.join(", ")}`
    );
    return 2;
  }
  const result = runner(
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
  return result.status ?? 1;
}

// Only execute when invoked directly (not when imported by tests).
const invokedDirectly =
  process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (invokedDirectly) {
  const [, , transform, ...targets] = process.argv;
  const code = runCodemod({ transform, targets });
  process.exit(code);
}
