// readToken — resolve a `--vf-*` custom property to its current computed
// value.
//
// Most of the library styles through `var(--vf-…)` references, which the
// browser resolves for free. Some integrations cannot take a `var()` string:
// canvas 2D contexts, SVG attributes serialised by third-party renderers,
// React Flow's `MiniMap nodeColor`, `markerEnd.color` and `labelStyle`, chart
// libraries that validate colours. For those, read the token at runtime.
//
// Reading goes through `getComputedStyle`, so the value reflects the theme
// in effect on the element asked about (defaults to `document.documentElement`;
// pass the element inside a `ThemeScope` to read that scope's value).

export interface ReadTokenOptions {
  /** Element whose computed style to read. Default `document.documentElement`. */
  element?: Element | null;
  /** Value returned when the token is unset or no DOM is available. */
  fallback?: string;
}

function normalizeName(name: string): string {
  return name.startsWith("--") ? name : `--vf-${name}`;
}

/**
 * Read one `--vf-*` token. `name` may be the full custom property
 * (`"--vf-accent"`) or the bare suffix (`"accent"`). Returns the trimmed
 * computed value, or `fallback` (default `""`) when unset or when there is no
 * document (SSR).
 */
export function readToken(name: string, options: ReadTokenOptions = {}): string {
  const fallback = options.fallback ?? "";
  if (typeof window === "undefined" || typeof document === "undefined") return fallback;
  const el = options.element ?? document.documentElement;
  if (!el) return fallback;
  const value = window.getComputedStyle(el).getPropertyValue(normalizeName(name)).trim();
  return value === "" ? fallback : value;
}

/**
 * Read several tokens at once. The result is keyed by the names as given
 * (`{ accent: "#…", "--vf-bg-0": "#…" }`).
 */
export function readTokens<K extends string>(
  names: readonly K[],
  options: Omit<ReadTokenOptions, "fallback"> & { fallbacks?: Partial<Record<K, string>> } = {}
): Record<K, string> {
  const out = {} as Record<K, string>;
  for (const name of names) {
    out[name] = readToken(name, {
      element: options.element,
      fallback: options.fallbacks?.[name],
    });
  }
  return out;
}
