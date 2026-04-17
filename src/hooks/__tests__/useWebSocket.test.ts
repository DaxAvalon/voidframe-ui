import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useWebSocket } from "../useWebSocket";

class MockWebSocket {
  url: string;
  protocols: string | string[] | undefined;
  onopen: ((ev: Event) => void) | null = null;
  onclose: ((ev: CloseEvent) => void) | null = null;
  onerror: ((ev: Event) => void) | null = null;
  onmessage: ((ev: MessageEvent) => void) | null = null;
  readyState = 0;
  send = vi.fn();
  close = vi.fn();

  constructor(url: string, protocols?: string | string[]) {
    this.url = url;
    this.protocols = protocols;
    MockWebSocket.instances.push(this);
  }

  static instances: MockWebSocket[] = [];
  static reset() {
    MockWebSocket.instances = [];
  }
}

beforeEach(() => {
  MockWebSocket.reset();
  vi.stubGlobal(
    "WebSocket",
    vi.fn().mockImplementation((url: string, protocols?: string | string[]) => new MockWebSocket(url, protocols))
  );
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

function lastInstance(): MockWebSocket {
  return MockWebSocket.instances[MockWebSocket.instances.length - 1];
}

describe("useWebSocket", () => {
  it("creates WebSocket with URL", () => {
    renderHook(() => useWebSocket("ws://example.com"));
    expect(MockWebSocket.instances).toHaveLength(1);
    expect(lastInstance().url).toBe("ws://example.com");
  });

  it("transitions status on open", () => {
    const { result } = renderHook(() => useWebSocket("ws://example.com"));
    expect(result.current.status).toBe("connecting");

    act(() => {
      lastInstance().onopen?.(new Event("open"));
    });
    expect(result.current.status).toBe("open");
    expect(result.current.readyState).toBe(1);
  });

  it("send() transmits data", () => {
    const { result } = renderHook(() => useWebSocket("ws://example.com"));
    const instance = lastInstance();

    act(() => {
      instance.onopen?.(new Event("open"));
    });
    act(() => {
      result.current.send("hello");
    });
    expect(instance.send).toHaveBeenCalledWith("hello");
  });

  it("sendJson() serializes and sends", () => {
    const { result } = renderHook(() => useWebSocket("ws://example.com"));
    const instance = lastInstance();

    act(() => {
      instance.onopen?.(new Event("open"));
    });
    act(() => {
      result.current.sendJson({ key: "value" });
    });
    expect(instance.send).toHaveBeenCalledWith('{"key":"value"}');
  });

  it("lastMessage updates on message", () => {
    const { result } = renderHook(() => useWebSocket("ws://example.com"));
    const msg = new MessageEvent("message", { data: "test" });

    act(() => {
      lastInstance().onmessage?.(msg);
    });
    expect(result.current.lastMessage).toBe(msg);
  });

  it("lastJsonMessage parses JSON data", () => {
    const { result } = renderHook(() => useWebSocket("ws://example.com"));

    act(() => {
      lastInstance().onmessage?.(
        new MessageEvent("message", { data: '{"a":1}' })
      );
    });
    expect(result.current.lastJsonMessage).toEqual({ a: 1 });
  });

  it("lastJsonMessage is null for non-JSON data", () => {
    const { result } = renderHook(() => useWebSocket("ws://example.com"));

    act(() => {
      lastInstance().onmessage?.(
        new MessageEvent("message", { data: "not json" })
      );
    });
    expect(result.current.lastJsonMessage).toBeNull();
  });

  it("fires onOpen, onClose, onError, onMessage callbacks", () => {
    const onOpen = vi.fn();
    const onClose = vi.fn();
    const onError = vi.fn();
    const onMessage = vi.fn();
    renderHook(() =>
      useWebSocket("ws://example.com", { onOpen, onClose, onError, onMessage })
    );

    act(() => { lastInstance().onopen?.(new Event("open")); });
    expect(onOpen).toHaveBeenCalledTimes(1);

    act(() => { lastInstance().onerror?.(new Event("error")); });
    expect(onError).toHaveBeenCalledTimes(1);

    act(() => { lastInstance().onmessage?.(new MessageEvent("message", { data: "x" })); });
    expect(onMessage).toHaveBeenCalledTimes(1);

    act(() => {
      lastInstance().onclose?.(new CloseEvent("close"));
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("auto-reconnects on unexpected close", () => {
    renderHook(() => useWebSocket("ws://example.com", { retryInterval: 1000, maxRetries: 2 }));
    expect(MockWebSocket.instances).toHaveLength(1);

    act(() => {
      lastInstance().onclose?.(new CloseEvent("close"));
    });
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(MockWebSocket.instances).toHaveLength(2);
  });

  it("close() prevents reconnect", () => {
    const { result } = renderHook(() => useWebSocket("ws://example.com"));

    act(() => {
      result.current.close();
    });
    expect(result.current.status).toBe("closed");
    // Should not reconnect
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(MockWebSocket.instances).toHaveLength(1);
  });

  it("reconnect() re-establishes connection", () => {
    const { result } = renderHook(() => useWebSocket("ws://example.com"));
    expect(MockWebSocket.instances).toHaveLength(1);

    act(() => {
      result.current.reconnect();
    });
    expect(MockWebSocket.instances.length).toBeGreaterThanOrEqual(2);
  });

  it("null url does not connect", () => {
    const { result } = renderHook(() => useWebSocket(null));
    expect(MockWebSocket.instances).toHaveLength(0);
    expect(result.current.status).toBe("closed");
  });

  it("autoConnect={false} skips initial connection", () => {
    renderHook(() => useWebSocket("ws://example.com", { autoConnect: false }));
    expect(MockWebSocket.instances).toHaveLength(0);
  });

  it("filter excludes messages from state updates", () => {
    const { result } = renderHook(() =>
      useWebSocket("ws://example.com", {
        filter: (msg) => msg.data !== "skip",
      })
    );

    act(() => {
      lastInstance().onmessage?.(new MessageEvent("message", { data: "skip" }));
    });
    expect(result.current.lastMessage).toBeNull();

    act(() => {
      lastInstance().onmessage?.(new MessageEvent("message", { data: "keep" }));
    });
    expect(result.current.lastMessage?.data).toBe("keep");
  });

  it("cleans up on unmount", () => {
    const { unmount } = renderHook(() => useWebSocket("ws://example.com"));
    const instance = lastInstance();

    unmount();
    expect(instance.close).toHaveBeenCalled();
  });
});
