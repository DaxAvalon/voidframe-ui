"use client";

// Phase 15 — persisted theme preference
//
// Reads from localStorage, falls back to the supplied default. Writes
// back on change, listens for `storage` events so multiple tabs stay in
// sync, and shares an in-memory emitter per key so every instance in the
// same tab (a settings pane and the root provider) sees one value.

import { useCallback, useEffect, useRef, useState } from "react";

type Listener = (next: string | null) => void;
const emitters = new Map<string, Set<Listener>>();

function subscribe(key: string, fn: Listener): () => void {
  let set = emitters.get(key);
  if (!set) {
    set = new Set();
    emitters.set(key, set);
  }
  set.add(fn);
  return () => {
    set!.delete(fn);
    if (set!.size === 0) emitters.delete(key);
  };
}

function emit(key: string, next: string | null, except: Listener): void {
  emitters.get(key)?.forEach((fn) => {
    if (fn !== except) fn(next);
  });
}

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
  const backend = storage ?? defaultStorage()!;
  const accept = (raw: string | null | undefined): raw is string =>
    !!raw && (!allowed || (allowed as readonly string[]).includes(raw));

  // "effect": start with the default on both server and client. Under SSR
  // the server has no access to localStorage, so hydrating with a persisted
  // value would produce an HTML/DOM mismatch; the stored value is promoted
  // in a post-mount effect instead. "sync" reads it in the initializer.
  const listenerRef = useRef<Listener>(() => undefined);
  const [theme, setThemeState] = useState<T>(() => {
    if (hydrate !== "sync") return defaultTheme;
    const raw = backend.get(key);
    return accept(raw) ? (raw as T) : defaultTheme;
  });

  useEffect(() => {
    if (hydrate === "sync") return;
    const raw = backend.get(key);
    if (accept(raw)) setThemeState(raw as T);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Same-tab sync: another instance with this key wrote a value.
  useEffect(() => {
    const listener: Listener = (next) => {
      if (accept(next)) setThemeState(next as T);
      else if (next === null) setThemeState(defaultTheme);
    };
    listenerRef.current = listener;
    return subscribe(key, listener);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, allowed, defaultTheme]);

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
      emit(key, next, listenerRef.current);
    },
    [backend, key]
  );

  const clearTheme = useCallback(() => {
    setThemeState(defaultTheme);
    backend.remove?.(key);
    emit(key, null, listenerRef.current);
  }, [backend, key, defaultTheme]);

  return { theme, setTheme, clearTheme };
}
