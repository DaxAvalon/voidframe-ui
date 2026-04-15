// Phase 19 — Test mock factories
//
// `installMatchMedia` returns a controller that lets a test simulate
// viewport resizes without the real matchMedia machinery. `createMockStorage`
// mirrors the Storage interface for persistence-hook testing.

export interface MatchMediaController {
  /** Set the viewport width. Listeners fire only when match state flips. */
  setWidth(px: number): void;
  /** Restore the previous matchMedia implementation. */
  restore(): void;
}

interface FakeMql {
  matches: boolean;
  media: string;
  listeners: Array<(e: MediaQueryListEvent) => void>;
}

/**
 * Install a deterministic matchMedia on the given window-like object.
 * Only `min-width: NNNpx` predicates are honored — which is the only
 * shape voidframe's media hooks emit.
 */
export function installMatchMedia(
  initialWidth: number,
  target: Pick<Window, "matchMedia"> & Record<string, unknown> = globalThis as unknown as Pick<
    Window,
    "matchMedia"
  > &
    Record<string, unknown>
): MatchMediaController {
  const entries = new Map<string, FakeMql>();
  const objects = new Map<string, MediaQueryList>();
  let width = initialWidth;
  const previous = (target as Record<string, unknown>).matchMedia;

  const parseMinPx = (query: string): number => {
    const m = query.match(/min-width:\s*(\d+)px/);
    return m ? parseFloat(m[1]!) : 0;
  };
  const recompute = () => {
    for (const [query, entry] of entries.entries()) {
      const nextMatches = width >= parseMinPx(query);
      entry.matches = nextMatches;
      const obj = objects.get(query);
      if (obj) (obj as unknown as { matches: boolean }).matches = nextMatches;
    }
  };

  const impl = (query: string) => {
    const existing = objects.get(query);
    if (existing) return existing;
    const entry: FakeMql = {
      matches: width >= parseMinPx(query),
      media: query,
      listeners: [],
    };
    entries.set(query, entry);
    const obj = {
      matches: entry.matches,
      media: query,
      addEventListener: (_ev: string, cb: (e: MediaQueryListEvent) => void) =>
        entry.listeners.push(cb),
      removeEventListener: (
        _ev: string,
        cb: (e: MediaQueryListEvent) => void
      ) => {
        const idx = entry.listeners.indexOf(cb);
        if (idx >= 0) entry.listeners.splice(idx, 1);
      },
      addListener: () => undefined,
      removeListener: () => undefined,
      dispatchEvent: () => false,
      onchange: null,
    } as unknown as MediaQueryList;
    objects.set(query, obj);
    return obj;
  };

  Object.defineProperty(target, "matchMedia", {
    configurable: true,
    writable: true,
    value: impl,
  });

  return {
    setWidth(next: number) {
      const prev = new Map(
        [...entries.entries()].map(([k, v]) => [k, v.matches])
      );
      width = next;
      recompute();
      for (const [query, entry] of entries.entries()) {
        if (prev.get(query) !== entry.matches) {
          entry.listeners.forEach((cb) =>
            cb({ matches: entry.matches, media: query } as MediaQueryListEvent)
          );
        }
      }
    },
    restore() {
      Object.defineProperty(target, "matchMedia", {
        configurable: true,
        writable: true,
        value: previous,
      });
    },
  };
}

export interface MockStorageApi {
  get: (key: string) => string | null;
  set: (key: string, value: string) => void;
  remove?: (key: string) => void;
  /** Direct access for assertions. */
  store: Map<string, string>;
}

/**
 * Build an in-memory storage adapter compatible with
 * `useThemePersistence` and `WhatsNewPopover`. Useful because happy-dom's
 * real localStorage persists across tests in some configurations.
 */
export function createMockStorage(seed?: Record<string, string>): MockStorageApi {
  const store = new Map<string, string>(
    seed ? Object.entries(seed) : undefined
  );
  return {
    store,
    get: (k) => store.get(k) ?? null,
    set: (k, v) => {
      store.set(k, v);
    },
    remove: (k) => {
      store.delete(k);
    },
  };
}
