"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface UseHistoryStateReturn<T> {
  state: T;
  push: (newState: T, url?: string) => void;
  replace: (newState: T, url?: string) => void;
  back: () => void;
  forward: () => void;
}

const isBrowser = typeof window !== "undefined";

/**
 * Sync React state with the browser History API.
 *
 * State is namespaced under `key` inside `history.state` to avoid conflicts.
 * SSR-safe — returns `initialState` and all methods are no-ops on the server.
 */
export function useHistoryState<T>(
  initialState: T,
  key: string = "__historyState"
): UseHistoryStateReturn<T> {
  const [state, setState] = useState<T>(() => {
    if (!isBrowser) return initialState;
    const existing = window.history.state;
    if (existing && key in existing) {
      return existing[key] as T;
    }
    return initialState;
  });

  const keyRef = useRef(key);
  keyRef.current = key;

  const push = useCallback(
    (newState: T, url?: string) => {
      if (!isBrowser) return;
      const merged = { ...window.history.state, [keyRef.current]: newState };
      window.history.pushState(merged, "", url);
      setState(newState);
    },
    []
  );

  const replace = useCallback(
    (newState: T, url?: string) => {
      if (!isBrowser) return;
      const merged = { ...window.history.state, [keyRef.current]: newState };
      window.history.replaceState(merged, "", url);
      setState(newState);
    },
    []
  );

  const back = useCallback(() => {
    if (!isBrowser) return;
    window.history.back();
  }, []);

  const forward = useCallback(() => {
    if (!isBrowser) return;
    window.history.forward();
  }, []);

  useEffect(() => {
    if (!isBrowser) return;

    const onPopState = (e: PopStateEvent) => {
      const s = e.state;
      if (s && keyRef.current in s) {
        setState(s[keyRef.current] as T);
      } else {
        setState(initialState);
      }
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [initialState]);

  return { state, push, replace, back, forward };
}
