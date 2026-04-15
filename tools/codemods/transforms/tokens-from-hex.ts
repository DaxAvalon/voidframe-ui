/**
 * tokens-from-hex
 *
 * Best-effort rewrite of raw hex color literals in JSX `style={{ ... }}`
 * props into `var(--vf-*)` theme tokens for a curated set of canonical
 * voidframe colors. Anything not in the map is left alone and will still
 * be flagged by the `no-raw-hex-colors` ESLint rule.
 *
 * This is deliberately conservative: we only touch values inside the
 * JSX `style` attribute, and only for a short list of exact hex codes
 * that map 1:1 onto default-theme tokens. Consumers with custom themes
 * should review the diff before committing.
 */
import type { API, ASTPath, FileInfo, Options } from "jscodeshift";

// Normalize to lowercase + 6-digit hex when comparing.
function normalizeHex(v: string): string | null {
  const s = v.trim().toLowerCase();
  if (!s.startsWith("#")) return null;
  if (/^#[0-9a-f]{3}$/.test(s)) {
    const [, r, g, b] = s;
    return `#${r}${r}${g}${g}${b}${b}`;
  }
  if (/^#[0-9a-f]{6}$/.test(s)) return s;
  return null;
}

// Map of canonical hex values → var(--vf-*) tokens. Values match the
// default dark theme in src/themes.
const HEX_TO_TOKEN: Record<string, string> = {
  "#000000": "var(--vf-bg-0)",
  "#0a0a0a": "var(--vf-bg-0)",
  "#111111": "var(--vf-bg-1)",
  "#1a1a1a": "var(--vf-bg-2)",
  "#222222": "var(--vf-bg-3)",
  "#ffffff": "var(--vf-text-0)",
  "#e0e0e0": "var(--vf-text-1)",
  "#b0b0b0": "var(--vf-text-2)",
  "#808080": "var(--vf-text-3)",
  "#303030": "var(--vf-border-0)",
  "#404040": "var(--vf-border-1)",
  "#505050": "var(--vf-border-2)",
};

const COLOR_PROPS = new Set([
  "color",
  "background",
  "backgroundColor",
  "borderColor",
  "borderTopColor",
  "borderRightColor",
  "borderBottomColor",
  "borderLeftColor",
  "outlineColor",
  "fill",
  "stroke",
]);

export default function transform(
  file: FileInfo,
  api: API,
  _options: Options
): string {
  const j = api.jscodeshift;
  const root = j(file.source);
  let changed = false;

  function isStringLit(n: { type: string; value?: unknown }): n is {
    type: string;
    value: string;
  } {
    return (
      (n.type === "Literal" || n.type === "StringLiteral") &&
      typeof n.value === "string"
    );
  }

  root
    .find(j.JSXAttribute, { name: { name: "style" } })
    .forEach((p: ASTPath<import("jscodeshift").JSXAttribute>) => {
      const val = p.node.value;
      if (!val || val.type !== "JSXExpressionContainer") return;
      const obj = val.expression;
      if (obj.type !== "ObjectExpression") return;
      for (const prop of obj.properties) {
        if (prop.type !== "Property" && prop.type !== "ObjectProperty") continue;
        const propKey = (prop as { key: { type: string; name?: unknown; value?: unknown } })
          .key;
        let keyName: string | null = null;
        if (propKey.type === "Identifier" && typeof propKey.name === "string")
          keyName = propKey.name;
        else if (isStringLit(propKey as { type: string; value?: unknown })) {
          keyName = (propKey as { value: string }).value;
        }
        if (!keyName || !COLOR_PROPS.has(keyName)) continue;
        const propVal = (prop as { value: { type: string; value?: unknown } }).value;
        if (!isStringLit(propVal)) continue;
        const normalized = normalizeHex(propVal.value);
        if (!normalized) continue;
        const token = HEX_TO_TOKEN[normalized];
        if (!token) continue;
        (prop as { value: unknown }).value = j.literal(token);
        changed = true;
      }
    });

  return changed ? root.toSource({ quote: "double" }) : file.source;
}
