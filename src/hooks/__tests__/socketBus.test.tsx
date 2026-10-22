import { act, render, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createSocketBus, useSocketBusStatus, useSocketTopic } from "../socketBus";
import { Button } from "../../components/Button";
import { CurrencyDisplay, NumberDisplay, minorUnitFactor } from "../../components/Numeric";
import { DataList } from "../../components/DataList";

class MockWebSocket {
  url: string;
  onopen: ((ev: Event) => void) | null = null;
  onclose: ((ev: CloseEvent) => void) | null = null;
  onerror: ((ev: Event) => void) | null = null;
  onmessage: ((ev: MessageEvent) => void) | null = null;
  readyState = 0;
  send = vi.fn();
  close = vi.fn((code?: number) => {
    this.readyState = 3;
    void code;
  });
  constructor(url: string) {
    this.url = url;
    MockWebSocket.instances.push(this);
  }
  open() {
    this.readyState = 1;
    this.onopen?.(new Event("open"));
  }
  message(obj: unknown) {
    this.onmessage?.({ data: JSON.stringify(obj) } as MessageEvent);
  }
  closeWith(code: number) {
    this.readyState = 3;
    this.onclose?.({ code } as CloseEvent);
  }
  static instances: MockWebSocket[] = [];
}
const last = () => MockWebSocket.instances[MockWebSocket.instances.length - 1]!;

beforeEach(() => {
  MockWebSocket.instances = [];
  vi.stubGlobal("WebSocket", vi.fn().mockImplementation((url: string) => new MockWebSocket(url)));
  vi.useFakeTimers();
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("createSocketBus", () => {
  it("connects lazily, routes by topic, and closes when the last subscriber leaves", () => {
    const bus = createSocketBus({ url: "ws://x", topicKey: "conversationId" });
    expect(MockWebSocket.instances).toHaveLength(0);
    const a = vi.fn();
    const b = vi.fn();
    const all = vi.fn();
    const offA = bus.subscribe("a", a);
    const offB = bus.subscribe("b", b);
    const offAll = bus.subscribe("*", all);
    expect(MockWebSocket.instances).toHaveLength(1);
    last().open();
    expect(bus.getStatus()).toBe("open");
    last().message({ conversationId: "a", text: "hi" });
    last().message({ conversationId: "b", text: "yo" });
    expect(a).toHaveBeenCalledTimes(1);
    expect(a.mock.calls[0]![0]).toMatchObject({ text: "hi" });
    expect(b).toHaveBeenCalledTimes(1);
    expect(all).toHaveBeenCalledTimes(2);
    offA();
    offB();
    expect(last().close).not.toHaveBeenCalled();
    offAll();
    expect(last().close).toHaveBeenCalled();
    expect(bus.getStatus()).toBe("closed");
  });

  it("queues sends until open and reconnects with backoff passing the last event id", () => {
    const bus = createSocketBus({
      url: (from) => (from ? `ws://x?from=${from}` : "ws://x"),
      replay: true,
      retryInterval: 100,
    });
    bus.subscribe("t", () => undefined);
    bus.send({ type: "hello" });
    expect(last().send).not.toHaveBeenCalled();
    last().open();
    expect(last().send).toHaveBeenCalledWith(JSON.stringify({ type: "hello" }));
    last().message({ topic: "t", id: "42" });
    expect(bus.getLastEventId()).toBe("42");
    last().closeWith(1006);
    expect(bus.getStatus()).toBe("closed");
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(MockWebSocket.instances).toHaveLength(2);
    expect(last().url).toBe("ws://x?from=42");
  });

  it("stops retrying on an auth close code", () => {
    const bus = createSocketBus({ url: "ws://x", retryInterval: 10 });
    bus.subscribe("t", () => undefined);
    last().open();
    last().closeWith(4401);
    expect(bus.getStatus()).toBe("unauthorized");
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(MockWebSocket.instances).toHaveLength(1);
  });

  it("useSocketTopic follows the topic and uses the latest handler; useSocketBusStatus tracks status", () => {
    const bus = createSocketBus({ url: "ws://x" });
    const seen: string[] = [];
    const { rerender } = renderHook(
      ({ topic, tag }: { topic: string; tag: string }) =>
        useSocketTopic(bus, topic, (m) => seen.push(`${tag}:${String(m.text)}`)),
      { initialProps: { topic: "one", tag: "v1" } }
    );
    const status = renderHook(() => useSocketBusStatus(bus));
    expect(status.result.current).toBe("connecting");
    act(() => last().open());
    expect(status.result.current).toBe("open");
    act(() => last().message({ topic: "one", text: "a" }));
    rerender({ topic: "one", tag: "v2" });
    act(() => last().message({ topic: "one", text: "b" }));
    rerender({ topic: "two", tag: "v2" });
    act(() => last().message({ topic: "one", text: "c" }));
    act(() => last().message({ topic: "two", text: "d" }));
    expect(seen).toEqual(["v1:a", "v2:b", "v2:d"]);
    expect(bus.size()).toBe(1);
  });
});

describe("#103 control refinements", () => {
  it("Button variant=primary emits the primary class", () => {
    const { container } = render(<Button variant="primary">Save</Button>);
    expect(container.querySelector("button")!.className).toContain("vf-button--primary");
  });

  it("CurrencyDisplay minorUnits divides by the currency factor; scale overrides", () => {
    expect(minorUnitFactor("usd")).toBe(100);
    expect(minorUnitFactor("JPY")).toBe(1);
    expect(minorUnitFactor("KWD")).toBe(1000);
    const a = render(<CurrencyDisplay value={123456} currency="USD" locale="en-US" minorUnits />);
    expect(a.container.textContent).toBe("$1,234.56");
    const b = render(<CurrencyDisplay value={5000} currency="JPY" locale="en-US" minorUnits />);
    expect(b.container.textContent).toBe("¥5,000");
    const c = render(<CurrencyDisplay value={-2500} currency="USD" locale="en-US" minorUnits autoTone />);
    expect(c.container.textContent).toBe("-$25.00");
    expect(c.container.firstElementChild!.className).toContain("danger");
    const d = render(<CurrencyDisplay value={1500} currency="USD" locale="en-US" minorUnits scale={1000} />);
    expect(d.container.textContent).toBe("$1.50");
  });

  it("NumberDisplay scale divides before formatting", () => {
    const { container } = render(<NumberDisplay value={12500} scale={1000} locale="en-US" decimals={1} />);
    expect(container.textContent).toBe("12.5");
  });

  it("DataList gap / rowGap set the CSS variables", () => {
    const { container } = render(
      <DataList gap={2} rowGap="0" items={[{ label: "a", value: "1" }]} />
    );
    const style = (container.firstElementChild as HTMLElement).style;
    expect(style.getPropertyValue("--vf-datalist-gap")).toBe("2px");
    expect(style.getPropertyValue("--vf-datalist-row-gap")).toBe("0");
  });
});
