// Theme-aware series color palette.
//
// Charts use CSS custom properties so individual strokes/fills inherit
// from the active theme. `seriesPalette(n)` returns an array of length n of
// CSS `var(--vf-*)` strings that cycle through the accent palette.

// Series N reads --vf-chart-N (tokens.css), which defaults to the accent
// ramp below — identical rendering out of the box, but categorical series
// are decoupled from semantic status colors and re-mappable per theme.
const DEFAULT_PALETTE: string[] = [
  "var(--vf-chart-1, var(--vf-green))",
  "var(--vf-chart-2, var(--vf-amber))",
  "var(--vf-chart-3, var(--vf-blue))",
  "var(--vf-chart-4, var(--vf-red))",
  "var(--vf-chart-5, var(--vf-cyan))",
  "var(--vf-chart-6, var(--vf-purple))",
  "var(--vf-chart-7, var(--vf-rose))",
  "var(--vf-chart-8, var(--vf-text-2))",
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

/** Color-blind-safe palette (Okabe-Ito). */
export const CVD_PALETTE: string[] = [
  "#E69F00", "#56B4E9", "#009E73", "#F0E442",
  "#0072B2", "#D55E00", "#CC79A7", "#000000",
];

/** Diverging palette (blue -> white -> red). */
export const DIVERGING_PALETTE: string[] = [
  "#2166ac", "#4393c3", "#92c5de", "#d1e5f0",
  "#f7f7f7",
  "#fddbc7", "#f4a582", "#d6604d", "#b2182b",
];

export function cvdPalette(n: number): string[] {
  return seriesPalette(n, { palette: CVD_PALETTE });
}

export function divergingPalette(n: number): string[] {
  if (n <= DIVERGING_PALETTE.length) return DIVERGING_PALETTE.slice(0, n);
  return DIVERGING_PALETTE.slice();
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
