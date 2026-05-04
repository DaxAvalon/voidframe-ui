#!/usr/bin/env node

/**
 * Generate AI-navigability files from the docs data:
 *   - docs/public/llms.txt       (llmstxt.org standard summary)
 *   - docs/public/llms-full.txt  (complete API reference)
 *   - docs/public/sitemap.xml    (search engine sitemap)
 *   - docs/public/api/*.json     (structured data endpoints)
 *
 * Reads: docs/data/{props,hooks,utils}.json + docs/taxonomy.ts
 * Run:   node scripts/generate-llms.mjs
 */

import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "..");
const dataDir = join(repoRoot, "docs", "data");
const publicDir = join(repoRoot, "docs", "public");
const apiDir = join(publicDir, "api");

const BASE_URL =
  process.env.DOCS_BASE_URL ||
  "https://daxavalon.github.io/voidframe-ui/";

// ── Read data ────────────────────────────────────────────────────────

const components = JSON.parse(readFileSync(join(dataDir, "props.json"), "utf8"));
const hooks = JSON.parse(readFileSync(join(dataDir, "hooks.json"), "utf8"));
const utils = JSON.parse(readFileSync(join(dataDir, "utils.json"), "utf8"));

// ── Count top-level components (excluding compound sub-components) ────
// Sub-components like DialogTrigger, CardHeader are accessed via dot
// notation (Dialog.Trigger) and shouldn't inflate the headline count.
const COMPOUND_PARENTS = [
  "Dialog", "DrawerV2", "Sheet", "Popover", "PopoverV2", "Tooltip",
  "Tabs", "AlertDialog", "Card", "DropdownMenu", "Menu", "Select",
  "Accordion", "Field", "Sidebar", "ContextMenu",
];
const SUB_SUFFIXES = [
  "Trigger", "Content", "Title", "Header", "Body", "Footer", "Close",
  "Cancel", "Action", "Description", "Item", "Label", "Separator",
  "Root", "Value", "Handle", "Panel", "List", "Brand", "Section",
  "Group", "Sub", "SubContent", "SubTrigger", "CheckboxItem",
  "RadioItem", "RadioGroup",
];
function isSubComponent(name) {
  for (const parent of COMPOUND_PARENTS) {
    if (name === parent) continue;
    if (name.startsWith(parent)) {
      const suffix = name.slice(parent.length);
      if (SUB_SUFFIXES.some((s) => suffix === s || suffix.startsWith(s))) return true;
    }
  }
  return false;
}
const topLevelCount = components.filter((c) => !isSubComponent(c.name)).length;

// ── Parse taxonomy from docs/taxonomy.ts ─────────────────────────────

const taxonomySrc = readFileSync(join(repoRoot, "docs", "taxonomy.ts"), "utf8");

const CATEGORIES = [
  "Primitives", "Core", "Layout", "Navigation", "Forms", "Data",
  "Activity", "Overlays", "Media", "Animation", "Charts", "Icons",
  "Chat & AI", "Specialty", "Interactive", "Dev", "Other",
];

// Parse FILE_MAP entries: "src/components/Button.tsx": "Core",
const fileMapRegex = /^\s*"([^"]+)":\s*"([^"]+)"/gm;
const fileMap = new Map();
let match;
while ((match = fileMapRegex.exec(taxonomySrc)) !== null) {
  fileMap.set(match[1], match[2]);
}

// Prefix fallbacks
const prefixMap = [
  ["src/primitives/", "Primitives"],
  ["src/charts/", "Charts"],
  ["src/icons/", "Icons"],
  ["src/dev/", "Dev"],
];

function categorize(file) {
  if (!file) return "Other";
  const exact = fileMap.get(file);
  if (exact) return exact;
  for (const [prefix, cat] of prefixMap) {
    if (file.startsWith(prefix)) return cat;
  }
  return "Other";
}

// ── Group components by category ─────────────────────────────────────

const byCategory = new Map();
for (const cat of CATEGORIES) byCategory.set(cat, []);

for (const comp of components) {
  const cat = categorize(comp.file);
  if (!byCategory.has(cat)) byCategory.set(cat, []);
  byCategory.get(cat).push(comp);
}

for (const [, comps] of byCategory) {
  comps.sort((a, b) => a.name.localeCompare(b.name));
}

// ── Helpers ──────────────────────────────────────────────────────────

function oneLine(desc) {
  if (!desc) return "";
  return desc.replace(/\n/g, " ").replace(/\s+/g, " ").trim();
}

function truncate(s, max = 120) {
  if (!s || s.length <= max) return s || "";
  return s.slice(0, max - 1) + "\u2026";
}

const today = new Date().toISOString().slice(0, 10);

// ── Generate llms.txt ────────────────────────────────────────────────

function generateLlmsTxt() {
  const lines = [];

  lines.push("# VoidFrame UI");
  lines.push("");
  lines.push("> Dark monochrome React UI framework. Terminal-brutalist. Data-dense. Zero border-radius. Monospace-first.");
  lines.push("");
  lines.push("## Key Facts");
  lines.push("- " + "500+ components, " + hooks.length + " hooks, " + utils.length + " utilities");
  lines.push("- React 18+ peer dependency");
  lines.push("- TypeScript strict mode, full .d.ts declarations");
  lines.push("- 4 built-in themes: dark, light, midnight, grey");
  lines.push("- 10 locales with RTL support");
  lines.push("- WAI-ARIA semantics + keyboard navigation on every interactive surface");
  lines.push("- Tree-shakeable subpath exports: voidframe-ui/core, /forms, /data, /charts, etc.");
  lines.push("- MIT licensed");
  lines.push("");
  lines.push("## Links");
  lines.push("- [Documentation](" + BASE_URL + ")");
  lines.push("- [Full API Reference](" + BASE_URL + "llms-full.txt)");
  lines.push("- [GitHub](https://github.com/DaxAvalon/voidframe-ui)");
  lines.push("- [npm](https://www.npmjs.com/package/voidframe-ui)");
  lines.push("- [Component JSON](" + BASE_URL + "api/components.json)");
  lines.push("- [Hooks JSON](" + BASE_URL + "api/hooks.json)");
  lines.push("- [Utilities JSON](" + BASE_URL + "api/utils.json)");
  lines.push("");

  lines.push("## Components");
  lines.push("");
  for (const cat of CATEGORIES) {
    const comps = byCategory.get(cat);
    if (!comps || comps.length === 0) continue;
    lines.push("### " + cat);
    for (const c of comps) {
      const desc = truncate(oneLine(c.description), 100);
      lines.push("- " + c.name + (desc ? ": " + desc : ""));
    }
    lines.push("");
  }

  lines.push("## Hooks");
  lines.push("");
  const sortedHooks = [...hooks].sort((a, b) => a.name.localeCompare(b.name));
  for (const h of sortedHooks) {
    const desc = truncate(oneLine(h.description), 80);
    lines.push("- " + h.name + (desc ? ": " + desc : ""));
  }
  lines.push("");

  lines.push("## Utilities");
  lines.push("");
  const sortedUtils = [...utils].sort((a, b) => a.name.localeCompare(b.name));
  for (const u of sortedUtils) {
    const desc = truncate(oneLine(u.description), 80);
    lines.push("- " + u.name + (desc ? ": " + desc : ""));
  }
  lines.push("");

  return lines.join("\n");
}

// ── Generate llms-full.txt ───────────────────────────────────────────

function generateLlmsFullTxt() {
  const lines = [];

  lines.push("# VoidFrame UI \u2014 Full API Reference");
  lines.push("");
  lines.push("> Dark monochrome React UI framework. Terminal-brutalist. Data-dense. Zero border-radius. Monospace-first.");
  lines.push("");
  lines.push("> " + "500+ components, " + hooks.length + " hooks, " + utils.length + " utilities");
  lines.push("");
  lines.push("Generated: " + today);
  lines.push("");
  lines.push("---");
  lines.push("");
  lines.push("## Components");
  lines.push("");

  for (const cat of CATEGORIES) {
    const comps = byCategory.get(cat);
    if (!comps || comps.length === 0) continue;

    lines.push("### " + cat);
    lines.push("");

    for (const c of comps) {
      lines.push("#### " + c.name);
      if (c.file) lines.push("Source: `" + c.file + "`");
      if (c.description) {
        lines.push("");
        lines.push(oneLine(c.description));
      }
      lines.push("");

      if (c.props && c.props.length > 0) {
        lines.push("| Prop | Type | Required | Default | Description |");
        lines.push("|------|------|----------|---------|-------------|");
        for (const p of c.props) {
          const req = p.required ? "Yes" : "No";
          const def = p.defaultValue || "\u2014";
          const desc = oneLine(p.description) || "";
          const type = (p.type || "").replace(/\|/g, "\\|");
          lines.push("| " + p.name + " | " + type + " | " + req + " | " + def + " | " + desc + " |");
        }
        lines.push("");
      }
    }
  }

  lines.push("---");
  lines.push("");
  lines.push("## Hooks");
  lines.push("");

  const sortedHooks = [...hooks].sort((a, b) => a.name.localeCompare(b.name));
  for (const h of sortedHooks) {
    lines.push("#### " + h.name);
    if (h.file) lines.push("Source: `" + h.file + "`");
    if (h.signature) lines.push("```ts\n" + h.signature + "\n```");
    if (h.description) lines.push(oneLine(h.description));
    lines.push("");
  }

  lines.push("---");
  lines.push("");
  lines.push("## Utilities");
  lines.push("");

  const sortedUtils = [...utils].sort((a, b) => a.name.localeCompare(b.name));
  for (const u of sortedUtils) {
    lines.push("#### " + u.name);
    if (u.file) lines.push("Source: `" + u.file + "`");
    if (u.signature) lines.push("```ts\n" + u.signature + "\n```");
    if (u.description) lines.push(oneLine(u.description));
    lines.push("");
  }

  return lines.join("\n");
}

// ── Generate sitemap.xml ─────────────────────────────────────────────

function generateSitemap() {
  const urls = [
    { loc: BASE_URL, changefreq: "weekly" },
    { loc: BASE_URL + "llms.txt" },
    { loc: BASE_URL + "llms-full.txt" },
    { loc: BASE_URL + "api/components.json" },
    { loc: BASE_URL + "api/hooks.json" },
    { loc: BASE_URL + "api/utils.json" },
  ];

  const entries = urls
    .map((u) => {
      const freq = u.changefreq ? "\n    <changefreq>" + u.changefreq + "</changefreq>" : "";
      return "  <url>\n    <loc>" + u.loc + "</loc>\n    <lastmod>" + today + "</lastmod>" + freq + "\n  </url>";
    })
    .join("\n");

  return '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + entries + "\n</urlset>\n";
}

// ── Write everything ─────────────────────────────────────────────────

mkdirSync(publicDir, { recursive: true });
mkdirSync(apiDir, { recursive: true });

writeFileSync(join(publicDir, "llms.txt"), generateLlmsTxt());
console.log("\u2713 llms.txt");

writeFileSync(join(publicDir, "llms-full.txt"), generateLlmsFullTxt());
console.log("\u2713 llms-full.txt");

writeFileSync(join(publicDir, "sitemap.xml"), generateSitemap());
console.log("\u2713 sitemap.xml");

copyFileSync(join(dataDir, "props.json"), join(apiDir, "components.json"));
copyFileSync(join(dataDir, "hooks.json"), join(apiDir, "hooks.json"));
copyFileSync(join(dataDir, "utils.json"), join(apiDir, "utils.json"));
console.log("\u2713 api/components.json, hooks.json, utils.json");

const llmsLines = readFileSync(join(publicDir, "llms.txt"), "utf8").split("\n").length;
const fullLines = readFileSync(join(publicDir, "llms-full.txt"), "utf8").split("\n").length;
console.log("\nGenerated: " + llmsLines + " lines (llms.txt), " + fullLines + " lines (llms-full.txt)");
