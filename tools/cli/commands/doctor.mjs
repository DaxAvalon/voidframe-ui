import { readFile, readdir, stat } from "node:fs/promises";
import { join, resolve } from "node:path";

async function pathExists(p) {
  try {
    await stat(p);
    return true;
  } catch {
    return false;
  }
}

async function loadPkg(cwd) {
  const pkgPath = join(cwd, "package.json");
  if (!(await pathExists(pkgPath))) return null;
  try {
    return JSON.parse(await readFile(pkgPath, "utf-8"));
  } catch {
    return null;
  }
}

async function grepForVoidframeCss(cwd, depth = 4) {
  async function walk(dir, d) {
    if (d > depth) return false;
    let entries;
    try {
      entries = await readdir(dir, { withFileTypes: true });
    } catch {
      return false;
    }
    for (const e of entries) {
      if (e.name === "node_modules" || e.name.startsWith(".")) continue;
      const full = join(dir, e.name);
      if (e.isDirectory()) {
        if (await walk(full, d + 1)) return true;
      } else if (/\.(ts|tsx|js|jsx|html|css)$/.test(e.name)) {
        const raw = await readFile(full, "utf-8").catch(() => "");
        if (raw.includes("voidframe/styles.css")) return true;
      }
    }
    return false;
  }
  return walk(cwd, 0);
}

async function grepForPattern(cwd, pattern, depth = 4) {
  async function walk(dir, d) {
    if (d > depth) return false;
    let entries;
    try {
      entries = await readdir(dir, { withFileTypes: true });
    } catch {
      return false;
    }
    for (const e of entries) {
      if (e.name === "node_modules" || e.name.startsWith(".")) continue;
      const full = join(dir, e.name);
      if (e.isDirectory()) {
        if (await walk(full, d + 1)) return true;
      } else if (/\.(ts|tsx|js|jsx)$/.test(e.name)) {
        const raw = await readFile(full, "utf-8").catch(() => "");
        if (pattern.test(raw)) return true;
      }
    }
    return false;
  }
  return walk(cwd, 0);
}

function check(name, ok, detail) {
  return { name, ok, detail };
}

export async function doctorCommand({ cwd = process.cwd(), log = console } = {}) {
  const checks = [];
  const pkg = await loadPkg(cwd);
  if (!pkg) {
    log.error("✖ No package.json in " + resolve(cwd));
    return 1;
  }
  const deps = { ...(pkg.dependencies ?? {}), ...(pkg.devDependencies ?? {}) };

  const vfVersion = deps.voidframe;
  checks.push(
    check("voidframe installed", Boolean(vfVersion), vfVersion ?? "missing")
  );

  const reactVersion = deps.react ?? "(missing)";
  const reactOk = /^(\^|~)?(\d+)/.test(reactVersion)
    ? parseInt(reactVersion.replace(/^[^\d]*/, ""), 10) >= 18
    : false;
  checks.push(
    check("react >= 18", reactOk, reactVersion)
  );

  const reactDomVersion = deps["react-dom"] ?? "(missing)";
  checks.push(
    check(
      "react-dom present",
      Boolean(deps["react-dom"]),
      reactDomVersion
    )
  );

  const cssImported = await grepForVoidframeCss(cwd);
  checks.push(
    check(
      'imports "voidframe/styles.css"',
      cssImported,
      cssImported
        ? "ok"
        : 'add `import "voidframe/styles.css"` to your entry file'
    )
  );

  // Optional peer-dep awareness: if the user has a chart in their code
  // but the peer isn't installed, flag it rather than wait for a runtime
  // throw. This is a soft check — the grep is bounded by `depth`.
  const OPTIONAL_PEERS = [
    ["d3-force", /NetworkGraph/],
    ["d3-geo", /ChoroplethMap|BubbleMap/],
    ["topojson-client", /ChoroplethMap|BubbleMap/],
    ["d3-hierarchy", /TreeMap|Sunburst/],
    ["d3-sankey", /Sankey/],
    ["dompurify", /MarkdownRenderer|MarkdownEditor/],
  ];
  for (const [peer, needle] of OPTIONAL_PEERS) {
    if (!deps[peer]) {
      const used = await grepForPattern(cwd, needle);
      checks.push(
        check(
          `${peer} (optional peer)`,
          !used,
          used
            ? `used by code matching /${needle.source}/; run \`npm install ${peer}\``
            : "not used"
        )
      );
    }
  }

  let failed = 0;
  for (const c of checks) {
    const mark = c.ok ? "✔" : "✖";
    const line = `${mark} ${c.name}${c.detail ? ` — ${c.detail}` : ""}`;
    if (c.ok) log.log(line);
    else {
      log.error(line);
      failed++;
    }
  }
  if (failed > 0) {
    log.error(`\n${failed} check(s) failed.`);
    return 1;
  }
  log.log("\nAll checks passed.");
  return 0;
}
