// Development-time check: every `var(--vf-…)` referenced by a loaded
// stylesheet should name a custom property some loaded stylesheet defines.
// An unknown name fails silently in CSS (a border shorthand disappears, a
// colour inherits), so the provider can run this once in development and
// warn with the exact names.

export interface TokenAuditResult {
  /** `--vf-*` names defined by any readable stylesheet. */
  defined: string[];
  /** `--vf-*` names referenced through `var()` that nothing defines. */
  unknown: string[];
  /** Stylesheets that could not be read (cross-origin). */
  skipped: number;
}

function* cssTexts(sheet: CSSStyleSheet): Generator<string> {
  let rules: CSSRuleList;
  try {
    rules = sheet.cssRules;
  } catch {
    throw new Error("cross-origin");
  }
  for (let i = 0; i < rules.length; i++) {
    const rule = rules[i]!;
    yield rule.cssText;
  }
}

/** Scan `document.styleSheets` (or the given sheets) for undefined `--vf-*` references. */
export function auditTokens(sheets?: Iterable<CSSStyleSheet>): TokenAuditResult {
  const defined = new Set<string>();
  const referenced = new Set<string>();
  let skipped = 0;
  const list = sheets ?? (typeof document !== "undefined" ? Array.from(document.styleSheets) : []);
  for (const sheet of list) {
    try {
      for (const text of cssTexts(sheet)) {
        for (const m of text.matchAll(/(--vf-[\w-]+)\s*:/g)) defined.add(m[1]!);
        for (const m of text.matchAll(/var\(\s*(--vf-[\w-]+)/g)) referenced.add(m[1]!);
      }
    } catch {
      skipped++;
    }
  }
  const unknown = [...referenced].filter((n) => !defined.has(n)).sort();
  return { defined: [...defined].sort(), unknown, skipped };
}

let warned = false;

/** Run `auditTokens` once and `console.warn` the unknown names. Dev helper. */
export function warnUnknownTokens(): TokenAuditResult | undefined {
  if (warned || typeof document === "undefined") return undefined;
  warned = true;
  const result = auditTokens();
  if (result.unknown.length > 0) {
    console.warn(
      `[voidframe] ${result.unknown.length} --vf-* token name(s) referenced by loaded stylesheets are not defined anywhere: ${result.unknown.join(", ")}. They resolve to nothing. Known aliases: --vf-text-muted, --vf-text-subtle, --vf-border, --vf-accent-{success|warning|danger|info}, --vf-surface-0…5.`
    );
  }
  return result;
}

/** Test hook: allow `warnUnknownTokens` to run again. */
export function resetTokenAudit(): void {
  warned = false;
}
