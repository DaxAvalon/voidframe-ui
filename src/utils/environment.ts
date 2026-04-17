// ═══════════════════════════════════════════════════════════════
// environment — runtime environment detection
// Pure boolean flags, no side effects.
// ═══════════════════════════════════════════════════════════════

/** `true` when running in a browser with a DOM. */
export const isClient: boolean =
  typeof window !== "undefined" && typeof document !== "undefined";

/** `true` when running on the server (Node, Deno, etc). */
export const isServer: boolean = !isClient;

/** `true` when running inside a test runner (Vitest or Jest). */
export const isTest: boolean =
  typeof process !== "undefined" &&
  (process.env.VITEST === "true" || process.env.NODE_ENV === "test");

/** `true` when NODE_ENV is "development". */
export const isDev: boolean =
  typeof process !== "undefined" && process.env.NODE_ENV === "development";
