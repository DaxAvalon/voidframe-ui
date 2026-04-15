// Phase 16 — Breakpoint tokens + Responsive<T> type.

export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  xxl: 1536,
} as const;

export const BREAKPOINT_ORDER = ["base", "sm", "md", "lg", "xl", "xxl"] as const;

export type Breakpoint = (typeof BREAKPOINT_ORDER)[number];

export type Responsive<T> = T | Partial<Record<Breakpoint, T>>;

/**
 * Normalize a `Responsive<T>` value into a full breakpoint map.
 *
 * Missing breakpoints inherit from the previous one in ascending order so
 * downstream consumers always see a deterministic value.
 */
export function normalizeResponsive<T>(
  value: Responsive<T>
): Record<Breakpoint, T | undefined> {
  if (!isResponsiveObject(value)) {
    return {
      base: value as T,
      sm: undefined,
      md: undefined,
      lg: undefined,
      xl: undefined,
      xxl: undefined,
    };
  }
  const src = value as Partial<Record<Breakpoint, T>>;
  const out: Record<Breakpoint, T | undefined> = {
    base: src.base,
    sm: src.sm,
    md: src.md,
    lg: src.lg,
    xl: src.xl,
    xxl: src.xxl,
  };
  return out;
}

/**
 * Return the active value for a resolved breakpoint ladder. Walks down from
 * the active breakpoint until it finds a defined value.
 */
export function pickResponsive<T>(
  value: Responsive<T>,
  active: Breakpoint
): T | undefined {
  if (!isResponsiveObject(value)) return value as T;
  const src = value as Partial<Record<Breakpoint, T>>;
  const idx = BREAKPOINT_ORDER.indexOf(active);
  for (let i = idx; i >= 0; i--) {
    const key = BREAKPOINT_ORDER[i]!;
    const v = src[key];
    if (v !== undefined) return v;
  }
  return undefined;
}

export function isResponsiveObject<T>(
  value: Responsive<T>
): value is Partial<Record<Breakpoint, T>> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    // Reject plain React elements / refs; allow only the known keys.
    Object.keys(value as object).every((k) =>
      (BREAKPOINT_ORDER as readonly string[]).includes(k)
    )
  );
}
