#!/usr/bin/env node
/**
 * Generate VS Code snippets for every voidframe component listed in
 * docs/data/props.json.
 *
 *   node scripts/generate-vscode-snippets.mjs
 *
 * Snippet shape:
 *   prefix   : "vf-<componentname>" (lowercased)
 *   body     : JSX with tab-stops over required props, then optional props
 *   description : the component's doc description (first line)
 *
 * We also keep an alias with the exact component name prefix so
 * typing "Button" followed by Ctrl+Space can trigger the snippet.
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "..");
const propsJson = join(repoRoot, "docs", "data", "props.json");
const outFile = join(
  repoRoot,
  "tools",
  "vscode-voidframe",
  "snippets",
  "voidframe.code-snippets"
);

function placeholderFor(prop, tabIndex) {
  const t = prop.type ?? "";
  // For literal unions ("a" | "b" | "c"), offer VS Code choice snippets.
  const choiceMatch = t.match(/^"(.+?)"(\s*\|\s*"(.+?)")+$/);
  if (choiceMatch) {
    const values = t
      .split("|")
      .map((v) => v.trim().replace(/^"|"$/g, ""));
    return `"\${${tabIndex}|${values.join(",")}|}"`;
  }
  // booleans render as shorthand attr.
  if (t === "boolean") return `{\${${tabIndex}:true}}`;
  // numbers / strings: empty tab-stop with type hint.
  if (t === "number") return `{\${${tabIndex}:0}}`;
  if (t === "string") return `"\${${tabIndex}:${prop.name}}"`;
  // Anything else: expression placeholder, no pre-filled value.
  return `{\${${tabIndex}:/* ${prop.name}: ${t || "any"} */}}`;
}

function buildBody(comp) {
  const required = comp.props.filter((p) => p.required);
  // Optional props useful enough to front-fill: size, variant, tone, label.
  const useful = comp.props.filter(
    (p) =>
      !p.required &&
      ["size", "variant", "tone", "label", "accent"].includes(p.name)
  );
  let tab = 1;
  const attrs = [];
  for (const p of [...required, ...useful]) {
    attrs.push(`  ${p.name}=${placeholderFor(p, tab++)}`);
  }
  const hasChildren = comp.props.some((p) => p.name === "children");
  const opener = attrs.length
    ? `<${comp.name}\n${attrs.join("\n")}\n>`
    : `<${comp.name}>`;
  if (hasChildren) {
    return [opener, `  \${${tab}:/* children */}`, `</${comp.name}>`];
  }
  return [attrs.length ? `<${comp.name}\n${attrs.join("\n")}\n/>` : `<${comp.name} />`];
}

function shortDescription(raw) {
  if (!raw) return undefined;
  // Collapse internal line breaks to single spaces so we don't lose a full
  // sentence at the first newline. Then take the first full sentence (ending
  // in . ! or ?) up to 160 chars, falling back to a 160-char slice if the
  // prose has no sentence-ending punctuation.
  const flat = raw.replace(/\s*\n\s*/g, " ").trim();
  const sentenceMatch = flat.match(/^(.*?[.!?])(?:\s|$)/);
  const first = sentenceMatch ? sentenceMatch[1] : flat;
  return first.length > 160 ? first.slice(0, 157) + "…" : first;
}

/**
 * Build the snippets object from an array of component docs. Pure
 * function — no IO. Exported for testing.
 */
export function buildSnippets(docs) {
  const snippets = {};
  let count = 0;
  for (const comp of docs) {
    if (!comp.name || !/^[A-Z]/.test(comp.name)) continue;
    // Only emit snippets for components that look like React components —
    // skip utility types and non-component exports that happen to be parsed.
    if (!Array.isArray(comp.props)) continue;

    const body = buildBody(comp);
    const description = shortDescription(comp.description);

    // Primary: prefix is the lowercased component name with "vf-" prefix.
    snippets[comp.name] = {
      prefix: [`vf-${comp.name.toLowerCase()}`, comp.name],
      body,
      description: description ?? `Voidframe ${comp.name} component.`,
      scope:
        "typescript,typescriptreact,javascript,javascriptreact",
    };
    count++;
  }
  return { snippets, count };
}

export function main() {
  const docs = JSON.parse(readFileSync(propsJson, "utf-8"));
  const { snippets, count } = buildSnippets(docs);
  mkdirSync(dirname(outFile), { recursive: true });
  writeFileSync(outFile, JSON.stringify(snippets, null, 2));
  console.log(
    `[generate-vscode-snippets] wrote ${count} snippets to ${outFile.replace(
      repoRoot + "/",
      ""
    )}`
  );
  return { snippets, count };
}

export { buildBody, shortDescription, placeholderFor };

// Only execute when invoked directly.
const invokedDirectly =
  process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (invokedDirectly) {
  main();
}
