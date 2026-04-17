// ═══════════════════════════════════════════════════════════════
// composeEventHandlers — compose multiple event handlers
// Default variant stops on defaultPrevented; Always variant
// calls all handlers regardless.
// ═══════════════════════════════════════════════════════════════

/**
 * Compose event handlers. If any handler calls `event.preventDefault()`,
 * subsequent handlers are skipped.
 */
export function composeEventHandlers<E extends { defaultPrevented: boolean }>(
  ...handlers: (((event: E) => void) | undefined | null)[]
): (event: E) => void {
  return (event: E) => {
    for (const handler of handlers) {
      if (!handler) continue;
      if (event.defaultPrevented) break;
      handler(event);
    }
  };
}

/**
 * Compose event handlers. All handlers are called regardless of
 * `event.defaultPrevented`.
 */
export function composeEventHandlersAlways<E extends { defaultPrevented: boolean }>(
  ...handlers: (((event: E) => void) | undefined | null)[]
): (event: E) => void {
  return (event: E) => {
    for (const handler of handlers) {
      if (!handler) continue;
      handler(event);
    }
  };
}
