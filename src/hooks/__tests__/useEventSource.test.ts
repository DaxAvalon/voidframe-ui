import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useEventSource } from "../useEventSource";

class MockEventSource {
  url: string;
  options: EventSourceInit | undefined;
  onopen: ((ev: Event) => void) | null = null;
  onerror: ((ev: Event) => void) | null = null;
  onmessage: ((ev: MessageEvent) => void) | null = null;
  readyState = 0;
  close = vi.fn();

  constructor(url: string, options?: EventSourceInit) {
    this.url = url;
    this.options = options;
    MockEventSource.instances.push(this);
  }

  static instances: MockEventSource[] = [];
  static reset() {
    MockEventSource.instances = [];
  }
}

beforeEach(() => {
  MockEventSource.reset();
  vi.stubGlobal("EventSource", vi.fn().mockImplementation((url: string, opts?: EventSourceInit) => new MockEventSource(url, opts)));
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

function lastInstance(): MockEventSource {
  return MockEventSource.instances[MockEventSource.instances.length - 1];
}

describe("useEventSource", () => {
  it("creates EventSource with URL", () => {
    renderHook(() => useEventSource("http://example.com/events"));
    expect(MockEventSource.instances).toHaveLength(1);
    expect(lastInstance().url).toBe("http://example.com/events");
  });

  it("transitions status from connecting to open", () => {
    const { result } = renderHook(() => useEventSource("http://example.com/events"));
    expect(result.current.status).toBe("connecting");

    act(() => {
      lastInstance().onopen?.(new Event("open"));
    });
    expect(result.current.status).toBe("open");
  });

  it("fires onMessage and updates lastEvent/lastEventData", () => {
    const onMessage = vi.fn();
    const { result } = renderHook(() =>
      useEventSource("http://example.com/events", { onMessage })
    );

    const msg = new MessageEvent("message", { data: "hello" });
    act(() => {
      lastInstance().onmessage?.(msg);
    });

    expect(onMessage).toHaveBeenCalledWith(msg);
    expect(result.current.lastEvent).toBe(msg);
    expect(result.current.lastEventData).toBe("hello");
  });

  it("updates lastEvent and lastEventData on message", () => {
    const { result } = renderHook(() => useEventSource("http://example.com/events"));

    act(() => {
      lastInstance().onmessage?.(new MessageEvent("message", { data: "first" }));
    });
    expect(result.current.lastEventData).toBe("first");

    act(() => {
      lastInstance().onmessage?.(new MessageEvent("message", { data: "second" }));
    });
    expect(result.current.lastEventData).toBe("second");
  });

  it("fires onOpen callback", () => {
    const onOpen = vi.fn();
    renderHook(() => useEventSource("http://example.com/events", { onOpen }));

    act(() => {
      lastInstance().onopen?.(new Event("open"));
    });
    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it("fires onError callback and sets error state", () => {
    const onError = vi.fn();
    const { result } = renderHook(() =>
      useEventSource("http://example.com/events", { onError, maxRetries: 0 })
    );

    const errorEvent = new Event("error");
    act(() => {
      lastInstance().onerror?.(errorEvent);
    });

    expect(onError).toHaveBeenCalledWith(errorEvent);
    expect(result.current.status).toBe("error");
    expect(result.current.error).toBe(errorEvent);
  });

  it("close() closes the connection", () => {
    const { result } = renderHook(() => useEventSource("http://example.com/events"));
    const instance = lastInstance();

    act(() => {
      result.current.close();
    });

    expect(instance.close).toHaveBeenCalled();
    expect(result.current.status).toBe("closed");
  });

  it("reconnect() re-establishes connection", () => {
    const { result } = renderHook(() => useEventSource("http://example.com/events"));
    expect(MockEventSource.instances).toHaveLength(1);

    act(() => {
      result.current.reconnect();
    });

    // Old one closed, new one created
    expect(MockEventSource.instances.length).toBeGreaterThanOrEqual(2);
    expect(result.current.status).toBe("connecting");
  });

  it("URL change closes old and opens new", () => {
    const { rerender } = renderHook(
      ({ url }) => useEventSource(url),
      { initialProps: { url: "http://example.com/a" as string | null } }
    );
    const first = lastInstance();

    rerender({ url: "http://example.com/b" });
    expect(first.close).toHaveBeenCalled();
    expect(lastInstance().url).toBe("http://example.com/b");
  });

  it("null url does not connect", () => {
    const { result } = renderHook(() => useEventSource(null));
    expect(MockEventSource.instances).toHaveLength(0);
    expect(result.current.status).toBe("closed");
  });

  it("autoConnect={false} skips initial connection", () => {
    const { result } = renderHook(() =>
      useEventSource("http://example.com/events", { autoConnect: false })
    );
    expect(MockEventSource.instances).toHaveLength(0);
    expect(result.current.status).toBe("closed");
  });

  it("cleans up on unmount", () => {
    const { unmount } = renderHook(() => useEventSource("http://example.com/events"));
    const instance = lastInstance();

    unmount();
    expect(instance.close).toHaveBeenCalled();
  });
});
