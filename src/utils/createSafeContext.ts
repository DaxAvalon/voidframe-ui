"use client";

// ═══════════════════════════════════════════════════════════════
// createSafeContext — context with provider-presence guarantee
// Replaces raw `React.createContext` for compound components.
// Throws a clear error when consumers are used outside the provider.
// ═══════════════════════════════════════════════════════════════

import {
  createContext,
  useContext,
  type Context,
  type Provider,
} from "react";

export interface SafeContextOptions<T> {
  /** Optional default value. When set, `useSafeContext` won't throw. */
  defaultValue?: T;
  /** Display name used in DevTools and error messages. */
  name: string;
}

export type SafeContextTuple<T> = readonly [
  Provider<T | null>,
  (consumerName?: string) => T,
  Context<T | null>,
];

/**
 * Creates a typed context with a provider-presence guard.
 *
 * @returns `[Provider, useContext, RawContext]`
 *
 * @example
 * const [TabsProvider, useTabsContext] = createSafeContext<TabsState>({ name: "Tabs" });
 *
 * function TabsTrigger() {
 *   const { value, setValue } = useTabsContext("Tabs.Trigger");
 *   ...
 * }
 */
export function createSafeContext<T>(
  options: SafeContextOptions<T>
): SafeContextTuple<T> {
  const Ctx = createContext<T | null>(options.defaultValue ?? null);
  Ctx.displayName = options.name;

  function useSafeContext(consumerName?: string): T {
    const value = useContext(Ctx);
    if (value === null) {
      const who = consumerName ? `<${consumerName}>` : "consumer";
      throw new Error(
        `[voidframe] ${who} must be used within <${options.name}>.`
      );
    }
    return value;
  }

  return [Ctx.Provider, useSafeContext, Ctx] as const;
}
