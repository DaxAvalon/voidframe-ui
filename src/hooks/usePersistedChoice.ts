"use client";

// usePersistedChoice — a string choice persisted in storage, kept in sync
// across tabs (the `storage` event) and across instances in the same tab (an
// in-memory emitter per key). `useThemePersistence` is this hook with theme
// names.

import { useCallback, useEffect, useRef, useState } from "react";

export type PersistedChoiceListener = (next: string | null) => void;
const emitters = new Map<string, Set<PersistedChoiceListener>>();

export function subscribePersistedChoice(key: string, fn: PersistedChoiceListener): () => void {
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

export function emitPersistedChoice(key: string, next: string | null, except?: PersistedChoiceListener): void {
  emitters.get(key)?.forEach((fn) => {
    if (fn !== except) fn(next);
  });
}

export interface PersistedChoiceStorage {
  get: (key: string) => string | null;
  set: (key: string, value: string) => void;
  remove?: (key: string) => void;
}

export function defaultPersistedStorage(): PersistedChoiceStorage {
  if (typeof localStorage === "undefined") {
    return { get: () => null, set: () => undefined, remove: () => undefined };
  }
  return {
    get: (k) => {
      try {
        return localStorage.getItem(k);
      } catch {
        return null;
      }
    },
    set: (k, v) => {
      try {
        localStorage.setItem(k, v);
      } catch {
        /* ignore quota / security errors */
      }
    },
    remove: (k) => {
      try {
        localStorage.removeItem(k);
      } catch {
        /* ignore */
      }
    },
  };
}

export interface UsePersistedChoiceOptions<T extends string> {
  /** Value used when nothing valid is persisted. */
  default: T;
  /** Whitelist; stored values outside it revert to `default`. */
  allowed?: readonly T[];
  /** Storage backend. Default `localStorage` (no-op when unavailable). */
  storage?: PersistedChoiceStorage;
  /**
   * `"effect"` (default) starts on `default` and promotes the stored value
   * after mount (SSR-safe); `"sync"` reads storage in the first render.
   */
  hydrate?: "effect" | "sync";
}

export interface UsePersistedChoiceReturn<T extends string> {
  value: T;
  setValue: (next: T) => void;
  /** Remove the persisted value; reverts to `default`. */
  clear: () => void;
}

/**
 * Persist one choice from a known set: a theme, a density, a sidebar
 * mode, a default tab.
 *
 * ```ts
 * const { value: density, setValue: setDensity } = usePersistedChoice("app-density", {
 *   default: "comfortable",
 *   allowed: ["comfortable", "compact"],
 * });
 * ```
 */
export function usePersistedChoice<T extends string>(
  key: string,
  options: UsePersistedChoiceOptions<T>
): UsePersistedChoiceReturn<T> {
  const { default: fallback, allowed, storage, hydrate = "effect" } = options;
  const backend = storage ?? defaultPersistedStorage();
  const accept = (raw: string | null | undefined): raw is string =>
    !!raw && (!allowed || (allowed as readonly string[]).includes(raw));

  const listenerRef = useRef<PersistedChoiceListener>(() => undefined);
  const [value, setState] = useState<T>(() => {
    if (hydrate !== "sync") return fallback;
    const raw = backend.get(key);
    return accept(raw) ? (raw as T) : fallback;
  });

  useEffect(() => {
    if (hydrate === "sync") return;
    const raw = backend.get(key);
    if (accept(raw)) setState(raw as T);
    // Mount-time hydration only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Same-tab sync: another instance with this key wrote a value.
  useEffect(() => {
    const listener: PersistedChoiceListener = (next) => {
      if (accept(next)) setState(next as T);
      else if (next === null) setState(fallback);
    };
    listenerRef.current = listener;
    return subscribePersistedChoice(key, listener);
    // `accept` closes over allowed/fallback, which are deps here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, allowed, fallback]);

  // Cross-tab sync.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onStorage = (e: StorageEvent) => {
      if (e.key !== key) return;
      const next = e.newValue;
      if (next && (!allowed || (allowed as readonly string[]).includes(next))) setState(next as T);
      else if (!next) setState(fallback);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [key, allowed, fallback]);

  const setValue = useCallback(
    (next: T) => {
      setState(next);
      backend.set(key, next);
      emitPersistedChoice(key, next, listenerRef.current);
    },
    [backend, key]
  );

  const clear = useCallback(() => {
    setState(fallback);
    backend.remove?.(key);
    emitPersistedChoice(key, null, listenerRef.current);
  }, [backend, key, fallback]);

  return { value, setValue, clear };
}
