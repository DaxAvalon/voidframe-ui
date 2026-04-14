// ═══════════════════════════════════════════════════════════════
// Dev-mode warnings
// All calls are wrapped in NODE_ENV checks so production bundles
// drop them via dead-code elimination.
// ═══════════════════════════════════════════════════════════════

const seen = new Set<string>();

const isDev: boolean =
  typeof process !== "undefined" &&
  process.env != null &&
  process.env.NODE_ENV !== "production";

export interface VoidframeLogger {
  warn: (message: string, ...args: unknown[]) => void;
  error: (message: string, ...args: unknown[]) => void;
}

let logger: VoidframeLogger = {
  warn: (msg, ...args) => console.warn(msg, ...args),
  error: (msg, ...args) => console.error(msg, ...args),
};

/**
 * Override the logger used by `warn()` / `warnOnce()`. Useful for routing
 * dev warnings to Sentry, Datadog, or a test harness.
 */
export function setLogger(next: Partial<VoidframeLogger>): void {
  logger = { ...logger, ...next };
}

export function getLogger(): VoidframeLogger {
  return logger;
}

/**
 * Warn in development if `condition` is false. Production: noop.
 *
 * @param condition When false, the warning fires.
 * @param message   Human-readable explanation. Should name the component and the fix.
 */
export function warn(condition: boolean, message: string, ...args: unknown[]): void {
  if (isDev && !condition) {
    logger.warn(`[voidframe] ${message}`, ...args);
  }
}

/**
 * Warn at most once per `key`. For deprecation notices, missing-context errors,
 * etc. that would otherwise spam the console.
 */
export function warnOnce(key: string, message: string, ...args: unknown[]): void {
  if (isDev && !seen.has(key)) {
    seen.add(key);
    logger.warn(`[voidframe] ${message}`, ...args);
  }
}

/**
 * Test helper: clear the `warnOnce` deduplication cache so each test
 * sees fresh warnings. Not exported from the package barrel.
 */
export function _resetWarnings(): void {
  seen.clear();
}
