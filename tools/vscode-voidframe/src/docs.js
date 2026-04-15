// Pure utilities for building hover docs from ComponentDoc entries.
// No vscode import — so this file is unit-testable under vitest/node.

/**
 * Load the bundled props index. The VS Code extension ships with a copy of
 * docs/data/props.json at tools/vscode-voidframe/data/props.json (copied by
 * the packaging script).
 */
function loadIndex(json) {
  const parsed = Array.isArray(json) ? json : [];
  const index = new Map();
  for (const entry of parsed) {
    if (entry && typeof entry.name === "string") {
      index.set(entry.name, entry);
    }
  }
  return index;
}

function formatProps(props) {
  if (!Array.isArray(props) || props.length === 0) {
    return "_No documented props._";
  }
  const required = props.filter((p) => p.required);
  const optional = props.filter((p) => !p.required);
  const lines = [];
  if (required.length > 0) {
    lines.push("**Required props**");
    for (const p of required) {
      lines.push(`- \`${p.name}\`: \`${p.type}\`${p.description ? ` — ${p.description}` : ""}`);
    }
  }
  if (optional.length > 0) {
    lines.push("");
    lines.push("**Optional props**");
    for (const p of optional.slice(0, 12)) {
      const def = p.defaultValue ? ` (default: \`${p.defaultValue}\`)` : "";
      lines.push(`- \`${p.name}\`: \`${p.type}\`${def}`);
    }
    if (optional.length > 12) {
      lines.push(`- …and ${optional.length - 12} more`);
    }
  }
  return lines.join("\n");
}

/**
 * Build a markdown hover body for a component doc. Returns null when the
 * component isn't in the index.
 */
function buildHoverMarkdown(index, name) {
  const entry = index.get(name);
  if (!entry) return null;
  const header = `**voidframe · ${entry.name}**`;
  const summary = entry.description ? entry.description.trim() : "";
  const props = formatProps(entry.props);
  return [header, "", summary, "", "---", "", props]
    .filter((line) => line !== undefined)
    .join("\n");
}

module.exports = { loadIndex, buildHoverMarkdown, formatProps };
