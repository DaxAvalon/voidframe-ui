// Theme-aware series color palette.
//
// Charts use CSS custom properties so individual strokes/fills inherit
// from the active theme. `seriesPalette(n)` returns an array of length n of
// CSS `var(--vf-*)` strings that cycle through the accent palette.

const DEFAULT_PALETTE: string[] = [
  "var(--vf-green)",
  "var(--vf-amber)",
  "var(--vf-blue)",
  "var(--vf-red)",
  "var(--vf-cyan)",
  "var(--vf-purple)",
  "var(--vf-rose)",
  "var(--vf-text-2)",
];

export interface SeriesPaletteOptions {
  /** Override the first color. Useful when the chart has a single accent. */
  accent?: string;
  /** Explicit palette — overrides the built-in cycle. */
  palette?: string[];
}

/**
 * Return `n` series colors. When `n` exceeds the palette, colors cycle.
 */
export function seriesPalette(
  n: number,
  options: SeriesPaletteOptions = {}
): string[] {
  const source = options.palette ?? DEFAULT_PALETTE;
  const arr = source.slice();
  if (options.accent) arr[0] = options.accent;
  const out: string[] = [];
  for (let i = 0; i < n; i++) out.push(arr[i % arr.length]!);
  return out;
}

/** The default palette, exported so consumers can reference it. */
export function defaultSeriesPalette(): string[] {
  return DEFAULT_PALETTE.slice();
}

/**
 * Format a number for display in tooltips / axes with sensible defaults:
 * - Integers rendered without a decimal.
 * - Values with |v| >= 1000 rendered with thousands separators.
 * - Everything else rendered with up to `maxDecimals` (default 2),
 *   trimming trailing zeroes.
 */
export function formatChartNumber(v: number, maxDecimals = 2): string {
  if (!Number.isFinite(v)) return String(v);
  if (Number.isInteger(v)) return v.toLocaleString();
  if (Math.abs(v) >= 1000) {
    return v.toLocaleString(undefined, {
      maximumFractionDigits: maxDecimals,
    });
  }
  const rounded = Number(v.toFixed(maxDecimals));
  return rounded.toString();
}
