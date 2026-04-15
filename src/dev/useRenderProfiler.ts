"use client";

import { useSyncExternalStore } from "react";
import type { ProfilerOnRenderCallback } from "react";

export interface ProfilerStats {
  id: string;
  renderCount: number;
  lastDuration: number;
  avgDuration: number;
  totalDuration: number;
  lastPhase: "mount" | "update" | "nested-update";
}

type Listener = () => void;

const EMPTY_ALL: ProfilerStats[] = [];

function deferNotify(listeners: Iterable<Listener>): void {
  const snapshot = Array.from(listeners);
  queueMicrotask(() => {
    for (const fn of snapshot) {
      try {
        fn();
      } catch {
        /* isolate listener errors */
      }
    }
  });
}

class ProfilerStore {
  private data = new Map<string, ProfilerStats>();
  private listeners = new Map<string, Set<Listener>>();
  private allSnapshot: ProfilerStats[] = EMPTY_ALL;

  record(id: string, phase: ProfilerStats["lastPhase"], duration: number): void {
    const prev =
      this.data.get(id) ??
      ({
        id,
        renderCount: 0,
        lastDuration: 0,
        avgDuration: 0,
        totalDuration: 0,
        lastPhase: phase,
      } satisfies ProfilerStats);
    const renderCount = prev.renderCount + 1;
    const totalDuration = prev.totalDuration + duration;
    this.data.set(id, {
      id,
      renderCount,
      lastDuration: duration,
      avgDuration: totalDuration / renderCount,
      totalDuration,
      lastPhase: phase,
    });
    this.allSnapshot = Array.from(this.data.values());
    const perId = this.listeners.get(id);
    if (perId) deferNotify(perId);
    deferNotify(this.allListeners);
  }

  get(id: string): ProfilerStats | undefined {
    return this.data.get(id);
  }

  all(): ProfilerStats[] {
    return this.allSnapshot;
  }

  clear(id?: string): void {
    if (id) {
      this.data.delete(id);
      const perId = this.listeners.get(id);
      if (perId) deferNotify(perId);
    } else {
      this.data.clear();
    }
    this.allSnapshot =
      this.data.size === 0 ? EMPTY_ALL : Array.from(this.data.values());
    deferNotify(this.allListeners);
  }

  subscribe(id: string, fn: Listener): () => void {
    let set = this.listeners.get(id);
    if (!set) {
      set = new Set();
      this.listeners.set(id, set);
    }
    set.add(fn);
    return () => {
      set!.delete(fn);
    };
  }

  private allListeners = new Set<Listener>();
  subscribeAll(fn: Listener): () => void {
    this.allListeners.add(fn);
    return () => {
      this.allListeners.delete(fn);
    };
  }
}

const store = new ProfilerStore();

export function getProfilerStore(): ProfilerStore {
  return store;
}

const emptyCache = new Map<string, ProfilerStats>();
function emptyFor(id: string): ProfilerStats {
  let cached = emptyCache.get(id);
  if (!cached) {
    cached = {
      id,
      renderCount: 0,
      lastDuration: 0,
      avgDuration: 0,
      totalDuration: 0,
      lastPhase: "mount",
    };
    emptyCache.set(id, cached);
  }
  return cached;
}

/**
 * React 18 onRender signature varies slightly across versions; we only need
 * id/phase/actualDuration here.
 */
export const recordRender: ProfilerOnRenderCallback = (
  id,
  phase,
  actualDuration
) => {
  store.record(id, phase as ProfilerStats["lastPhase"], actualDuration);
};

/**
 * Hook that returns profiler stats for `id`. Pair with a
 * `<ProfilerScope id={id}>` wrapping the component you want to measure.
 *
 * The returned value is the most recent snapshot *at the time this hook's
 * component rendered*. It does not auto-re-render when stats change — if
 * you need a live display, mount `<DevPanel>` or subscribe via
 * `getProfilerStore().subscribeAll(...)` from a parent tree that does not
 * contain the scope being measured (subscribing from within the scope
 * creates a re-measure/re-render loop).
 */
export function useRenderProfiler(id: string): ProfilerStats {
  return store.get(id) ?? emptyFor(id);
}

export function useAllProfilerStats(): ProfilerStats[] {
  return useSyncExternalStore(
    (cb) => store.subscribeAll(cb),
    () => store.all(),
    () => store.all()
  );
}
