// ═══════════════════════════════════════════════════════════════
// cx — class-name composition
// Same shape as `clsx` / `classnames`. Tiny, no dependencies.
// ═══════════════════════════════════════════════════════════════

export type ClassValue =
  | string
  | number
  | false
  | null
  | undefined
  | Record<string, unknown>
  | ClassValue[];

/**
 * Compose class names. Truthy values are joined with spaces.
 *
 * @example
 * cx("vf-button", `vf-button--${variant}`, { "vf-button--full-width": fullWidth }, className)
 */
export function cx(...args: ClassValue[]): string {
  const out: string[] = [];
  for (const arg of args) {
    if (!arg) continue;
    if (typeof arg === "string" || typeof arg === "number") {
      out.push(String(arg));
    } else if (Array.isArray(arg)) {
      const inner = cx(...arg);
      if (inner) out.push(inner);
    } else if (typeof arg === "object") {
      for (const key in arg) {
        if (arg[key]) out.push(key);
      }
    }
  }
  return out.join(" ");
}
