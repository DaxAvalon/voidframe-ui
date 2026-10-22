"use client";

// Phase 15 — persisted theme preference
//
// `usePersistedChoice` with theme names: reads from localStorage, falls
// back to the supplied default, writes back on change, stays in sync across
// tabs and across instances in the same tab.

import { usePersistedChoice } from "./usePersistedChoice";

export interface UseThemePersistenceOptions<T extends string = string> {
  /** localStorage key. Default `"voidframe-theme"`. */
  key?: string;
  /** Initial theme used when nothing is persisted. Default `"system"`. */
  defaultTheme?: T;
  /** Optional whitelist — values not in this list revert to `defaultTheme`. */
  allowed?: readonly T[];
  /**
   * When the persisted value is read. `"effect"` (default) starts on
   * `defaultTheme` and promotes the stored value after mount, which keeps
   * server and client markup identical under SSR at the cost of one frame
   * on the default theme. `"sync"` reads storage in the initial render: no
   * flash, for client-only apps (under SSR it would mismatch hydration).
   */
  hydrate?: "effect" | "sync";
  /** Test/SSR override for the storage backend. */
  storage?: {
    get: (key: string) => string | null;
    set: (key: string, value: string) => void;
    remove?: (key: string) => void;
  };
}

export interface UseThemePersistenceReturn<T extends string> {
  theme: T;
  setTheme: (next: T) => void;
  /** Remove the persisted value; reverts to `defaultTheme`. */
  clearTheme: () => void;
}

/**
 * Persist the active theme in `localStorage` (key configurable), sync across
 * tabs via the `storage` event and across instances in the same tab via a
 * shared emitter per key. Pairs with `ThemeSelector` and the provider's
 * `themeName` / `onThemeNameChange`.
 */
export function useThemePersistence<T extends string = string>(
  options: UseThemePersistenceOptions<T> = {}
): UseThemePersistenceReturn<T> {
  const {
    key = "voidframe-theme",
    defaultTheme = "system" as T,
    allowed,
    storage,
    hydrate = "effect",
  } = options;
  const { value, setValue, clear } = usePersistedChoice<T>(key, {
    default: defaultTheme,
    allowed,
    storage,
    hydrate,
  });
  return { theme: value, setTheme: setValue, clearTheme: clear };
}
