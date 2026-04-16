"use client";

// Phase 15 — persisted theme preference
//
// Reads from localStorage, falls back to the supplied default. Writes
// back on change, and listens for `storage` events so multiple tabs
// stay in sync.

import { useCallback, useEffect, useState } from "react";

export interface UseThemePersistenceOptions<T extends string = string> {
  /** localStorage key. Default `"voidframe-theme"`. */
  key?: string;
  /** Initial theme used when nothing is persisted. Default `"system"`. */
  defaultTheme?: T;
  /** Optional whitelist — values not in this list revert to `defaultTheme`. */
  allowed?: readonly T[];
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

function defaultStorage(): UseThemePersistenceOptions["storage"] {
  if (typeof localStorage === "undefined") {
    return {
      get: () => null,
      set: () => undefined,
      remove: () => undefined,
    };
  }
  return {
    get: (k: string) => {
      try {
        return localStorage.getItem(k);
      } catch {
        return null;
      }
    },
    set: (k: string, v: string) => {
      try {
        localStorage.setItem(k, v);
      } catch {
        /* ignore quota / security errors */
      }
    },
    remove: (k: string) => {
      try {
        localStorage.removeItem(k);
      } catch {
        /* ignore */
      }
    },
  };
}

export function useThemePersistence<T extends string = string>(
  options: UseThemePersistenceOptions<T> = {}
): UseThemePersistenceReturn<T> {
  const {
    key = "voidframe-theme",
    defaultTheme = "system" as T,
    allowed,
    storage,
  } = options;
  const backend = storage ?? defaultStorage()!;

  // Start with the default on both server and client. Under SSR the
  // server has no access to localStorage, so hydrating with a persisted
  // value would produce an HTML/DOM mismatch with the server-rendered
  // output. Instead, we read the persisted value in a post-mount
  // effect and promote it to state, accepting one re-render in
  // exchange for hydration safety.
  const [theme, setThemeState] = useState<T>(defaultTheme);

  useEffect(() => {
    const raw = backend.get(key);
    if (raw && (!allowed || (allowed as readonly string[]).includes(raw))) {
      setThemeState(raw as T);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cross-tab sync.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onStorage = (e: StorageEvent) => {
      if (e.key !== key) return;
      const next = e.newValue;
      if (next && (!allowed || (allowed as readonly string[]).includes(next))) {
        setThemeState(next as T);
      } else if (!next) {
        setThemeState(defaultTheme);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [key, allowed, defaultTheme]);

  const setTheme = useCallback(
    (next: T) => {
      setThemeState(next);
      backend.set(key, next);
    },
    [backend, key]
  );

  const clearTheme = useCallback(() => {
    setThemeState(defaultTheme);
    backend.remove?.(key);
  }, [backend, key, defaultTheme]);

  return { theme, setTheme, clearTheme };
}
