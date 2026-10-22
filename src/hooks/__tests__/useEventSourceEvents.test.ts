import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useEventSource } from "../useEventSource";

class FakeEventSource {
  static instances: FakeEventSource[] = [];
  url: string;
  withCredentials: boolean;
  onopen: (() => void) | null = null;
  onerror: ((e: Event) => void) | null = null;
  onmessage: ((e: MessageEvent) => void) | null = null;
  listeners = new Map<string, Array<(e: MessageEvent) => void>>();
  closed = false;
  constructor(url: string, init?: { withCredentials?: boolean }) {
    this.url = url;
    this.withCredentials = init?.withCredentials ?? false;
    FakeEventSource.instances.push(this);
  }
  addEventListener(type: string, fn: (e: MessageEvent) => void) {
    this.listeners.set(type, [...(this.listeners.get(type) ?? []), fn]);
  }
  close() {
    this.closed = true;
  }
  emit(type: string, data: string, lastEventId = "") {
    const e = new MessageEvent(type, { data, lastEventId });
    if (type === "message") this.onmessage?.(e);
    for (const fn of this.listeners.get(type) ?? []) fn(e);
  }
}

describe("useEventSource named events, parse and resume", () => {
  const original = (globalThis as { EventSource?: unknown }).EventSource;
  beforeEach(() => {
    FakeEventSource.instances = [];
    (globalThis as { EventSource?: unknown }).EventSource = FakeEventSource;
  });
  afterEach(() => {
    (globalThis as { EventSource?: unknown }).EventSource = original;
  });

  it("subscribes to named events, parses data and tracks lastEventId", () => {
    const onEvent = vi.fn();
    const { result } = renderHook(() =>
      useEventSource<{ n: number }>("/feed", { events: ["job", "done"], parse: (d) => JSON.parse(d) as { n: number }, onEvent })
    );
    const es = FakeEventSource.instances[0]!;
    expect([...es.listeners.keys()]).toEqual(["job", "done"]);
    act(() => es.emit("job", JSON.stringify({ n: 1 }), "41"));
    expect(result.current.lastEventType).toBe("job");
    expect(result.current.lastParsed).toEqual({ n: 1 });
    expect(result.current.lastEventId).toBe("41");
    expect(onEvent).toHaveBeenCalledWith(expect.objectContaining({ type: "job", parsed: { n: 1 }, lastEventId: "41" }));
    act(() => es.emit("message", "not json", "42"));
    expect(result.current.parseError).toBeInstanceOf(SyntaxError);
    expect(result.current.lastParsed).toBeNull();
    expect(result.current.lastEventId).toBe("42");
    expect(result.current.lastEventData).toBe("not json");
  });

  it("builds the reconnect url from the last event id", () => {
    const urlFor = vi.fn((id: string | null) => (id ? `/feed?from=${id}` : "/feed"));
    const { result } = renderHook(() => useEventSource(urlFor));
    expect(FakeEventSource.instances[0]!.url).toBe("/feed");
    act(() => FakeEventSource.instances[0]!.emit("message", "a", "7"));
    act(() => result.current.reconnect());
    expect(FakeEventSource.instances[0]!.closed).toBe(true);
    expect(FakeEventSource.instances[1]!.url).toBe("/feed?from=7");
    expect(urlFor).toHaveBeenLastCalledWith("7");
  });

  it("keeps the legacy onMessage for default events only", () => {
    const onMessage = vi.fn();
    renderHook(() => useEventSource("/feed", { events: ["tick"], onMessage }));
    const es = FakeEventSource.instances[0]!;
    act(() => es.emit("tick", "x"));
    expect(onMessage).not.toHaveBeenCalled();
    act(() => es.emit("message", "y"));
    expect(onMessage).toHaveBeenCalledTimes(1);
  });
});
