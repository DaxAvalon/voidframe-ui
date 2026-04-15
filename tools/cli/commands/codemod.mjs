import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const transformsDir = resolve(__dirname, "..", "..", "codemods", "transforms");

export async function codemodCommand({ name, paths, log = console }) {
  if (!name) {
    log.error("✖ Missing codemod name. Try: legacy-charts-to-v2 | tokens-from-hex");
    return 2;
  }
  const tPath = resolve(transformsDir, `${name}.ts`);
  if (!existsSync(tPath)) {
    log.error(`✖ Unknown codemod: ${name}`);
    return 2;
  }
  if (!paths || paths.length === 0) {
    log.error("✖ No paths given. Pass one or more files/dirs to rewrite.");
    return 2;
  }
  const result = spawnSync(
    "npx",
    [
      "jscodeshift",
      "--parser=tsx",
      "--extensions=ts,tsx,js,jsx",
      "-t",
      tPath,
      ...paths,
    ],
    { stdio: "inherit" }
  );
  return result.status ?? 1;
}
