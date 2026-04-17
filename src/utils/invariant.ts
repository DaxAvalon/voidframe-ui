// ═══════════════════════════════════════════════════════════════
// invariant — runtime assertion helpers
// ═══════════════════════════════════════════════════════════════

/**
 * Assert a condition at runtime. Throws if falsy.
 *
 * @example
 * invariant(user, "User must be defined");
 * // TypeScript now narrows `user` to truthy
 */
export function invariant(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

/**
 * Unconditionally throw an invariant violation.
 * Useful in switch default branches or "impossible" code paths.
 *
 * @example
 * default: invariantViolation(`Unknown status: ${status}`);
 */
export function invariantViolation(message: string): never {
  throw new Error(message);
}
