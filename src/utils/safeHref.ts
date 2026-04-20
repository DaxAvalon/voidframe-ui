// ═══════════════════════════════════════════════════════════════
// URL safety — blocks `javascript:`, `data:`, `vbscript:` payloads
// ═══════════════════════════════════════════════════════════════
//
// Every component that accepts a user-controlled `href` or navigates
// somewhere based on user input must pass the value through this
// helper. The defaults are conservative: only common navigation
// protocols are allowed; everything else is rejected.

import { warnOnce } from "./warn";

const SAFE_PROTOCOLS = new Set([
  "http:",
  "https:",
  "mailto:",
  "tel:",
  "sms:",
]);

const RELATIVE_PREFIXES = ["/", "./", "../", "?", "#"];

export interface SafeHrefOptions {
  /** Additional protocols to allow (normalise to lowercase, include trailing ":"). */
  allowProtocols?: string[];
  /** Value returned when the URL is unsafe. Default: `"#"`. */
  fallback?: string;
}

/**
 * Returns the URL if it's safe to render in an `href`/`src` attribute,
 * otherwise returns `fallback` (default `"#"`).
 *
 * Safe inputs:
 *   - `http(s)://…`
 *   - `mailto:…`, `tel:…`, `sms:…`
 *   - relative paths (`/foo`, `./x`, `../y`), query fragments (`?q=1`),
 *     and in-page hash links (`#main`)
 *   - empty string (passes through unchanged — consumers often use "" as a no-op)
 *
 * Unsafe inputs (returns fallback):
 *   - `javascript:…`, `data:…`, `vbscript:…`, `file:…`, etc.
 *   - Whitespace-prefixed schemes that the browser would tolerate
 *     (e.g. ` javascript:…`)
 *   - Anything non-string
 */
export function safeHref(
  url: unknown,
  options: SafeHrefOptions = {}
): string {
  const { allowProtocols, fallback = "#" } = options;
  if (url === "") return "";
  if (typeof url !== "string") return fallback;

  // Browsers are lenient about leading whitespace / control chars
  // (e.g. `"\tjavascript:alert(1)"` is treated as `javascript:…`);
  // normalize before inspecting the scheme.
  const trimmed = url.replace(/^[\s\u0000-\u001f]+/, "").trim();
  if (trimmed === "") return fallback;

  for (const prefix of RELATIVE_PREFIXES) {
    if (trimmed.startsWith(prefix)) return url;
  }

  // Bare schemeless value like "example.com/foo" — treat as relative,
  // browsers don't execute it.
  if (!/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) return url;

  const colon = trimmed.indexOf(":");
  const protocol = trimmed.slice(0, colon + 1).toLowerCase();
  const allowed =
    SAFE_PROTOCOLS.has(protocol) ||
    (allowProtocols?.some((p) => p.toLowerCase() === protocol) ?? false);

  return allowed ? url : fallback;
}

/**
 * Same as `safeHref` but throws a dev warning when rejecting. Intended
 * for places where the consumer is passing untrusted data and we want
 * to surface the attempt rather than silently fall back.
 */
export function safeHrefOrWarn(
  url: unknown,
  component: string,
  options: SafeHrefOptions = {}
): string {
  const out = safeHref(url, options);
  if (out === (options.fallback ?? "#") && url !== "" && url !== undefined) {
    warnOnce(
      `safeHref:rejected:${component}:${String(url)}`,
      `${component}: rejected unsafe href "${String(url)}" — only http(s), mailto, tel, sms, and relative paths are allowed.`
    );
  }
  return out;
}
