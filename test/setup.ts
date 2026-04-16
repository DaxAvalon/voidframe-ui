import "@testing-library/jest-dom/vitest";

// ── Browser API stubs ──────────────────────────────────────
// happy-dom is missing several observer / media APIs that
// components depend on. Centralize stubs here so individual
// test files don't need to re-create them.

// ResizeObserver
if (!globalThis.ResizeObserver) {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
}

// IntersectionObserver
if (!globalThis.IntersectionObserver) {
  globalThis.IntersectionObserver = class {
    root = null;
    rootMargin = "0px";
    thresholds = [0];
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  } as unknown as typeof IntersectionObserver;
}

// matchMedia — defaults to non-matching, no listeners.
if (!globalThis.matchMedia) {
  Object.defineProperty(globalThis, "matchMedia", {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}

// Canvas 2D context — happy-dom doesn't implement canvas. Tests
// that need a mock context (e.g., chart rendering) should install
// their own per-test mock via vi.spyOn(HTMLCanvasElement.prototype,
// "getContext"). The global stub is omitted here because SignaturePad
// relies on getContext returning null to skip the draw path — a
// global mock that returns a real-looking context triggers scheduler
// reentrancy in its flush cycle.
