/**
 * shadcn-hsl-to-vf
 *
 * Rewrites shadcn/ui colour variable usage in TS/JS sources onto voidframe
 * tokens:
 *
 *   hsl(var(--background))          → var(--vf-bg-0)
 *   hsl(var(--border) / 0.5)        → color-mix(in srgb, var(--vf-border-1) 50%, transparent)
 *   var(--radius)                   → var(--vf-radius)
 *   var(--muted-foreground)         → var(--vf-text-2)
 *
 * String literals and template-literal text are rewritten; anything built
 * at runtime is left alone. Variables not in the map are reported (so you
 * can decide) and left untouched. `rewriteShadcnColors` is exported for CSS
 * files and other non-JS text.
 */
import type { API, FileInfo, Options } from "jscodeshift";

/** shadcn variable name (without `--`) → voidframe token (without `var()`). */
export const SHADCN_TO_VF: Record<string, string> = {
  background: "--vf-bg-0",
  foreground: "--vf-text-0",
  card: "--vf-bg-1",
  "card-foreground": "--vf-text-0",
  popover: "--vf-bg-2",
  "popover-foreground": "--vf-text-0",
  primary: "--vf-accent",
  "primary-foreground": "--vf-on-accent",
  secondary: "--vf-bg-3",
  "secondary-foreground": "--vf-text-1",
  muted: "--vf-bg-2",
  "muted-foreground": "--vf-text-2",
  accent: "--vf-bg-4",
  "accent-foreground": "--vf-text-0",
  destructive: "--vf-danger",
  "destructive-foreground": "--vf-text-0",
  success: "--vf-success",
  "success-foreground": "--vf-text-0",
  warning: "--vf-warning",
  "warning-foreground": "--vf-bg-0",
  info: "--vf-info",
  "info-foreground": "--vf-text-0",
  border: "--vf-border-1",
  input: "--vf-border-2",
  ring: "--vf-accent",
  "chart-1": "--vf-chart-1",
  "chart-2": "--vf-chart-2",
  "chart-3": "--vf-chart-3",
  "chart-4": "--vf-chart-4",
  "chart-5": "--vf-chart-5",
  sidebar: "--vf-bg-1",
  "sidebar-background": "--vf-bg-1",
  "sidebar-foreground": "--vf-text-0",
  "sidebar-primary": "--vf-accent",
  "sidebar-primary-foreground": "--vf-on-accent",
  "sidebar-accent": "--vf-bg-3",
  "sidebar-accent-foreground": "--vf-text-0",
  "sidebar-border": "--vf-border-1",
  "sidebar-ring": "--vf-accent",
  radius: "--vf-radius",
};

const HSL_RE = /hsl\(\s*var\(\s*--([a-z][\w-]*)\s*\)\s*(?:\/\s*([\d.]+%?)\s*)?\)/g;
const BARE_RE = /var\(\s*--([a-z][\w-]*)\s*\)/g;

function alphaPercent(alpha: string): string {
  if (alpha.endsWith("%")) return alpha;
  const n = Number(alpha);
  return `${Math.round(n * 1000) / 10}%`;
}

export interface RewriteResult {
  output: string;
  changed: boolean;
  /** shadcn-looking variables seen inside `hsl(var(--x))` with no mapping. */
  unmapped: string[];
}

/** Rewrite one piece of text (a string literal, template chunk, or a CSS file). */
export function rewriteShadcnColors(text: string): RewriteResult {
  const unmapped = new Set<string>();
  let changed = false;
  let out = text.replace(HSL_RE, (whole, name: string, alpha?: string) => {
    const token = SHADCN_TO_VF[name];
    if (!token) {
      unmapped.add(name);
      return whole;
    }
    changed = true;
    return alpha
      ? `color-mix(in srgb, var(${token}) ${alphaPercent(alpha)}, transparent)`
      : `var(${token})`;
  });
  out = out.replace(BARE_RE, (whole, name: string) => {
    const token = SHADCN_TO_VF[name];
    if (!token) return whole;
    changed = true;
    return `var(${token})`;
  });
  return { output: out, changed, unmapped: [...unmapped] };
}

export default function transform(file: FileInfo, api: API, _options: Options): string {
  const j = api.jscodeshift;
  const root = j(file.source);
  let changed = false;
  const unmapped = new Set<string>();

  root.find(j.StringLiteral).forEach((p) => {
    const r = rewriteShadcnColors(p.node.value);
    r.unmapped.forEach((u) => unmapped.add(u));
    if (!r.changed) return;
    p.node.value = r.output;
    // Drop stale `raw` so the printer re-quotes from `value`.
    delete (p.node as { extra?: unknown }).extra;
    changed = true;
  });
  root.find(j.Literal).forEach((p) => {
    if (typeof p.node.value !== "string") return;
    const r = rewriteShadcnColors(p.node.value);
    r.unmapped.forEach((u) => unmapped.add(u));
    if (!r.changed) return;
    p.node.value = r.output;
    delete (p.node as { raw?: unknown }).raw;
    changed = true;
  });
  root.find(j.TemplateElement).forEach((p) => {
    const r = rewriteShadcnColors(p.node.value.raw);
    r.unmapped.forEach((u) => unmapped.add(u));
    if (!r.changed) return;
    p.node.value = { raw: r.output, cooked: r.output };
    changed = true;
  });

  if (unmapped.size) {
    api.report(
      `${file.path}: no voidframe token for hsl(var(--${[...unmapped].join(")), hsl(var(--")})) — left as is`
    );
  }
  return changed ? root.toSource({ quote: "double" }) : file.source;
}
