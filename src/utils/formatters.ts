// ═══════════════════════════════════════════════════════════════
// VOIDFRAME — UTILITIES
// Pure helper functions. No React dependency.
// ═══════════════════════════════════════════════════════════════

/**
 * Format a number with locale-aware commas.
 *
 * @example formatNumber(12847)     → "12,847"
 * @example formatNumber(3.14159, 2) → "3.14"
 */
export function formatNumber(n: number, decimals?: number): string {
  const value = decimals !== undefined ? Number(n.toFixed(decimals)) : n;
  return value.toLocaleString();
}

/**
 * Format bytes into human-readable string.
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const unit = units[i] ?? "B";
  return `${(bytes / Math.pow(1024, i)).toFixed(i > 0 ? 1 : 0)} ${unit}`;
}

/**
 * Format duration in ms to human string.
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  if (ms < 3600000) return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
  return `${Math.floor(ms / 3600000)}h ${Math.floor((ms % 3600000) / 60000)}m`;
}

/**
 * Relative time string ("2 hours ago", "in 3 days").
 */
export function timeAgo(date: Date | number | string): string {
  const now = Date.now();
  const then = new Date(date).getTime();
  const diff = now - then;
  const abs = Math.abs(diff);
  const future = diff < 0;
  const prefix = future ? "in " : "";
  const suffix = future ? "" : " ago";

  if (abs < 60000) return "just now";
  if (abs < 3600000) return `${prefix}${Math.floor(abs / 60000)}m${suffix}`;
  if (abs < 86400000) return `${prefix}${Math.floor(abs / 3600000)}h${suffix}`;
  if (abs < 2592000000) return `${prefix}${Math.floor(abs / 86400000)}d${suffix}`;
  return `${prefix}${Math.floor(abs / 2592000000)}mo${suffix}`;
}

/**
 * Truncate string with ellipsis.
 */
export function truncate(str: string | null | undefined, max: number = 40): string {
  if (!str || str.length <= max) return str ?? "";
  return str.slice(0, max - 1) + "…";
}

/**
 * Clamp a number between min and max.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Map a value from one range to another.
 */
export function mapRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number {
  return ((value - inMin) / (inMax - inMin)) * (outMax - outMin) + outMin;
}

/**
 * Generate a deterministic hash color from a string.
 * Useful for avatar colors, chart series, etc.
 */
export function stringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 50%, 60%)`;
}

/**
 * Lighten or darken a hex color.
 * @param amount Positive = lighten, negative = darken (-255 to 255)
 */
export function adjustColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = clamp(((num >> 16) & 0xff) + amount, 0, 255);
  const g = clamp(((num >> 8) & 0xff) + amount, 0, 255);
  const b = clamp((num & 0xff) + amount, 0, 255);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

/**
 * Deep merge two objects (useful for theme composition).
 */
export function deepMerge<T extends Record<string, unknown>>(
  target: T,
  source: Partial<T>
): T {
  const result: Record<string, unknown> = { ...target };
  for (const key of Object.keys(source)) {
    if (key === "__proto__" || key === "constructor" || key === "prototype") continue;
    const srcVal = (source as Record<string, unknown>)[key];
    const tgtVal = result[key];
    if (srcVal && typeof srcVal === "object" && !Array.isArray(srcVal)) {
      result[key] = deepMerge(
        (tgtVal as Record<string, unknown>) ?? {},
        srcVal as Record<string, unknown>
      );
    } else {
      result[key] = srcVal;
    }
  }
  return result as T;
}

/**
 * Simple unique ID generator (not cryptographically secure).
 */
let counter = 0;
/**
 * Generate a short unique ID (monotonic counter, prefixed). Useful for
 * non-ARIA identifiers where `useId` isn't an option (e.g. module-level
 * caches). Not cryptographically random.
 *
 * @param prefix Default `"vf"`.
 */
export function uid(prefix: string = "vf"): string {
  return `${prefix}-${++counter}-${Math.random().toString(36).slice(2, 6)}`;
}

/**
 * Group an array by a key function.
 */
export function groupBy<T, K extends string | number>(
  arr: T[],
  keyFn: (item: T) => K
): Record<K, T[]> {
  const result = {} as Record<K, T[]>;
  for (const item of arr) {
    const key = keyFn(item);
    (result[key] ??= []).push(item);
  }
  return result;
}

/**
 * Sort an array of objects by key (returns new array).
 */
export function sortBy<T, K extends keyof T>(
  arr: T[],
  key: K,
  order: "asc" | "desc" = "asc"
): T[] {
  return [...arr].sort((a, b) => {
    const va = a[key];
    const vb = b[key];
    const cmp = va < vb ? -1 : va > vb ? 1 : 0;
    return order === "desc" ? -cmp : cmp;
  });
}

/**
 * Copy text to clipboard.
 * @returns true on success, false on failure
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
