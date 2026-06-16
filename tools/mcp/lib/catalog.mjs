// Data layer for the voidframe MCP server. Loads the structured
// component / hook / utility catalog (the same JSON the docs site and
// llms.txt are generated from) and provides pure search/lookup helpers.
//
// Zero dependencies — just node:fs. The transport (lib/server.mjs) and the
// tool definitions (lib/tools.mjs) build on these pure functions, which keeps
// everything unit-testable without spinning up stdio.

import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Data directory resolution, in order:
//   1. VOIDFRAME_MCP_DATA env override
//   2. a co-located `data/` snapshot bundled into a published package
//   3. the committed structured data in the monorepo (in-repo / dev)
function resolveDataDir() {
  if (process.env.VOIDFRAME_MCP_DATA) return process.env.VOIDFRAME_MCP_DATA;
  const bundled = resolve(__dirname, "..", "data");
  if (existsSync(resolve(bundled, "components.json"))) return bundled;
  return resolve(__dirname, "..", "..", "..", "docs", "public", "api");
}

export const DEFAULT_DATA_DIR = resolveDataDir();

function readJson(dir, file) {
  return JSON.parse(readFileSync(resolve(dir, file), "utf8"));
}

/**
 * Load and index the catalog from a data directory.
 * @param {string} [dataDir]
 */
export function loadCatalog(dataDir = DEFAULT_DATA_DIR) {
  const components = readJson(dataDir, "components.json");
  const hooks = readJson(dataDir, "hooks.json");
  const utils = readJson(dataDir, "utils.json");

  const index = (list) => new Map(list.map((e) => [e.name, e]));

  return {
    dataDir,
    components,
    hooks,
    utils,
    byName: {
      component: index(components),
      hook: index(hooks),
      util: index(utils),
    },
  };
}

/** First sentence / line of a (possibly multi-line) description. */
export function shortDescription(desc) {
  if (!desc) return "";
  const firstLine = String(desc).split("\n")[0].trim();
  const dot = firstLine.indexOf(". ");
  return dot > 0 ? firstLine.slice(0, dot + 1) : firstLine;
}

function scoreMatch(entry, q) {
  const name = entry.name.toLowerCase();
  if (name === q) return 100;
  if (name.startsWith(q)) return 80;
  if (name.includes(q)) return 60;
  const haystack = `${entry.description ?? ""} ${entry.signature ?? ""}`.toLowerCase();
  if (haystack.includes(q)) return 30;
  return 0;
}

/**
 * Case-insensitive ranked search over a catalog list. Empty query returns the
 * list in name order. Results are capped at `limit`.
 */
export function searchList(list, query, limit = 50) {
  if (!query) {
    return list
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name))
      .slice(0, limit);
  }
  const q = query.toLowerCase();
  return list
    .map((entry) => ({ entry, score: scoreMatch(entry, q) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score || a.entry.name.localeCompare(b.entry.name))
    .slice(0, limit)
    .map((r) => r.entry);
}

/** Component summary for list views (no full props array). */
export function componentSummary(c) {
  return {
    name: c.name,
    kind: c.kind,
    description: shortDescription(c.description),
    ...(c.docsParent ? { parent: c.docsParent } : {}),
  };
}

/** Hook / util summary for list views. */
export function apiSummary(e) {
  return {
    name: e.name,
    kind: e.kind,
    signature: e.signature,
    description: shortDescription(e.description),
  };
}
