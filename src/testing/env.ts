// Test-environment installers for DOMs that lack layout APIs (jsdom,
// happy-dom): ResizeObserver, IntersectionObserver, scrollIntoView and
// matchMedia, plus one call that installs them all.

import { installMatchMedia, type MatchMediaController } from "./mocks";

export interface ResizeObserverController {
  /** Fire every observer with these entries (default: one zero-size entry per observed element). */
  trigger: (entries?: Array<Partial<ResizeObserverEntry> & { target: Element }>) => void;
  /** Elements currently observed. */
  observed: () => Element[];
  restore: () => void;
}

/**
 * Install a deterministic `ResizeObserver` when the DOM has none (or
 * `force` it). Observers record their targets; `trigger()` invokes their
 * callbacks so a test can simulate a resize.
 */
export function installResizeObserver(options: { force?: boolean } = {}): ResizeObserverController {
  const g = globalThis as unknown as { ResizeObserver?: unknown };
  const previous = g.ResizeObserver;
  const observers = new Set<{ cb: ResizeObserverCallback; targets: Set<Element>; instance: ResizeObserver }>();
  if (previous === undefined || options.force) {
    class FakeResizeObserver {
      private record: { cb: ResizeObserverCallback; targets: Set<Element>; instance: ResizeObserver };
      constructor(cb: ResizeObserverCallback) {
        this.record = { cb, targets: new Set(), instance: this as unknown as ResizeObserver };
        observers.add(this.record);
      }
      observe(el: Element) {
        this.record.targets.add(el);
      }
      unobserve(el: Element) {
        this.record.targets.delete(el);
      }
      disconnect() {
        this.record.targets.clear();
        observers.delete(this.record);
      }
    }
    g.ResizeObserver = FakeResizeObserver;
  }
  return {
    trigger: (entries) => {
      for (const o of observers) {
        const list =
          entries ??
          [...o.targets].map((target) => {
            const rect = target.getBoundingClientRect();
            return { target, contentRect: rect, borderBoxSize: [], contentBoxSize: [], devicePixelContentBoxSize: [] };
          });
        o.cb(list as ResizeObserverEntry[], o.instance);
      }
    },
    observed: () => [...observers].flatMap((o) => [...o.targets]),
    restore: () => {
      if (previous === undefined) delete g.ResizeObserver;
      else g.ResizeObserver = previous;
    },
  };
}

export interface IntersectionObserverController {
  /** Mark elements as intersecting (or not) and fire the observers. */
  trigger: (entries: Array<{ target: Element; isIntersecting: boolean }>) => void;
  restore: () => void;
}

/** Install a controllable `IntersectionObserver` when the DOM has none. */
export function installIntersectionObserver(options: { force?: boolean } = {}): IntersectionObserverController {
  const g = globalThis as unknown as { IntersectionObserver?: unknown };
  const previous = g.IntersectionObserver;
  const observers = new Set<{ cb: IntersectionObserverCallback; instance: IntersectionObserver }>();
  if (previous === undefined || options.force) {
    class FakeIntersectionObserver {
      private record: { cb: IntersectionObserverCallback; instance: IntersectionObserver };
      readonly root = null;
      readonly rootMargin = "0px";
      readonly thresholds = [0];
      constructor(cb: IntersectionObserverCallback) {
        this.record = { cb, instance: this as unknown as IntersectionObserver };
        observers.add(this.record);
      }
      observe() {}
      unobserve() {}
      disconnect() {
        observers.delete(this.record);
      }
      takeRecords() {
        return [];
      }
    }
    g.IntersectionObserver = FakeIntersectionObserver;
  }
  return {
    trigger: (entries) => {
      for (const o of observers) {
        o.cb(
          entries.map((e) => ({
            target: e.target,
            isIntersecting: e.isIntersecting,
            intersectionRatio: e.isIntersecting ? 1 : 0,
            boundingClientRect: e.target.getBoundingClientRect(),
            intersectionRect: e.target.getBoundingClientRect(),
            rootBounds: null,
            time: Date.now(),
          })) as IntersectionObserverEntry[],
          o.instance
        );
      }
    },
    restore: () => {
      if (previous === undefined) delete g.IntersectionObserver;
      else g.IntersectionObserver = previous;
    },
  };
}

export interface VoidframeTestEnvOptions {
  /** Viewport width for `matchMedia`. Default 1024. */
  width?: number;
  /** Install the ResizeObserver stub even when one exists. Default false. */
  forceResizeObserver?: boolean;
}

export interface VoidframeTestEnv {
  matchMedia: MatchMediaController;
  resizeObserver: ResizeObserverController;
  intersectionObserver: IntersectionObserverController;
  /** Undo every installation. */
  restore: () => void;
}

/**
 * One call for a jsdom / happy-dom test file: matchMedia, ResizeObserver,
 * IntersectionObserver, a no-op `scrollIntoView` and `requestAnimationFrame`
 * where missing. Call in `beforeAll` and `restore()` in `afterAll`.
 *
 * ```ts
 * let env: VoidframeTestEnv;
 * beforeAll(() => { env = setupVoidframeTestEnv({ width: 390 }); });
 * afterAll(() => env.restore());
 * ```
 */
export function setupVoidframeTestEnv(options: VoidframeTestEnvOptions = {}): VoidframeTestEnv {
  const matchMedia = installMatchMedia(options.width ?? 1024);
  const resizeObserver = installResizeObserver({ force: options.forceResizeObserver });
  const intersectionObserver = installIntersectionObserver();
  const restores: Array<() => void> = [];
  if (typeof Element !== "undefined") {
    const proto = Element.prototype as { scrollIntoView?: (arg?: unknown) => void };
    if (typeof proto.scrollIntoView !== "function") {
      proto.scrollIntoView = () => undefined;
      restores.push(() => {
        delete proto.scrollIntoView;
      });
    }
  }
  const g = globalThis as unknown as { requestAnimationFrame?: unknown; cancelAnimationFrame?: unknown };
  if (typeof g.requestAnimationFrame !== "function") {
    g.requestAnimationFrame = (cb: (t: number) => void) => setTimeout(() => cb(Date.now()), 16) as unknown as number;
    g.cancelAnimationFrame = (id: number) => clearTimeout(id as unknown as ReturnType<typeof setTimeout>);
    restores.push(() => {
      delete g.requestAnimationFrame;
      delete g.cancelAnimationFrame;
    });
  }
  return {
    matchMedia,
    resizeObserver,
    intersectionObserver,
    restore: () => {
      for (const r of restores.reverse()) r();
      intersectionObserver.restore();
      resizeObserver.restore();
      matchMedia.restore();
    },
  };
}
