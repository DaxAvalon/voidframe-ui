// ═══════════════════════════════════════════════════════════════
// responsiveClasses — breakpoint-aware class generation
// Maps responsive value objects to Tailwind-style breakpoint classes.
// ═══════════════════════════════════════════════════════════════

/**
 * Generate responsive utility classes from a plain value or a
 * breakpoint-keyed object.
 *
 * @example
 * responsiveClasses("cols", "2")           // "vf-cols-2"
 * responsiveClasses("cols", { base: "1", md: "2", lg: "3" })
 * // "vf-cols-1 md:vf-cols-2 lg:vf-cols-3"
 */
export function responsiveClasses<T extends string>(
  prefix: string,
  value: T | Partial<Record<string, T>>,
): string {
  if (typeof value === "string") {
    return `vf-${prefix}-${value}`;
  }

  if (value === undefined || value === null) return "";

  const classes: string[] = [];

  for (const [bp, val] of Object.entries(value)) {
    if (val === undefined) continue;
    classes.push(breakpointClass(prefix, val, bp === "base" ? undefined : bp));
  }

  return classes.join(" ");
}

/**
 * Generate a single breakpoint-prefixed class.
 *
 * @example
 * breakpointClass("cols", "2")        // "vf-cols-2"
 * breakpointClass("cols", "2", "md")  // "md:vf-cols-2"
 */
export function breakpointClass(
  prefix: string,
  value: string,
  breakpoint?: string,
): string {
  const base = `vf-${prefix}-${value}`;
  return breakpoint ? `${breakpoint}:${base}` : base;
}
