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

export interface WarningEntry {
  level: "warn" | "error";
  message: string;
  args: unknown[];
  key?: string;
  time: number;
}

type Listener = (entry: WarningEntry) => void;
const listeners = new Set<Listener>();
const history: WarningEntry[] = [];
const MAX_HISTORY = 200;

function emit(entry: WarningEntry): void {
  history.push(entry);
  if (history.length > MAX_HISTORY) history.shift();
  listeners.forEach((fn) => {
    try {
      fn(entry);
    } catch {
      /* listener errors shouldn't break warnings */
    }
  });
}

/** Subscribe to every dev warning emitted by voidframe. Returns unsubscribe. */
export function subscribeWarnings(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Read the captured warning history (newest last). */
export function getWarningHistory(): WarningEntry[] {
  return history.slice();
}

/** Clear the captured warning history. */
export function clearWarningHistory(): void {
  history.length = 0;
}

/**
 * Override the logger used by `warn()` / `warnOnce()`. Useful for routing
 * dev warnings to Sentry, Datadog, or a test harness.
 */
export function setLogger(next: Partial<VoidframeLogger>): void {
  logger = { ...logger, ...next };
}

/**
 * Read the currently-installed logger used by `warn()` / `warnOnce()`.
 * Useful in tests that want to assert on a captured output. Mirror of
 * `setLogger`.
 */
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
    emit({ level: "warn", message, args, time: Date.now() });
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
    emit({ level: "warn", message, args, key, time: Date.now() });
  }
}

/**
 * Test helper: clear the `warnOnce` deduplication cache so each test
 * sees fresh warnings. Not exported from the package barrel.
 */
export function _resetWarnings(): void {
  seen.clear();
  history.length = 0;
}
