import { describe, expect, it } from "vitest";
import { composeEventHandlers, composeEventHandlersAlways } from "../composeEventHandlers";

function makeEvent(defaultPrevented = false) {
  return {
    defaultPrevented,
    preventDefault() {
      this.defaultPrevented = true;
    },
  };
}

describe("composeEventHandlers", () => {
  it("calls a single handler", () => {
    const calls: number[] = [];
    const handler = composeEventHandlers((e) => calls.push(1));
    handler(makeEvent());
    expect(calls).toEqual([1]);
  });

  it("calls multiple handlers in order", () => {
    const calls: number[] = [];
    const handler = composeEventHandlers(
      () => calls.push(1),
      () => calls.push(2),
      () => calls.push(3),
    );
    handler(makeEvent());
    expect(calls).toEqual([1, 2, 3]);
  });

  it("skips null and undefined handlers", () => {
    const calls: number[] = [];
    const handler = composeEventHandlers(null, () => calls.push(1), undefined, () => calls.push(2));
    handler(makeEvent());
    expect(calls).toEqual([1, 2]);
  });

  it("stops subsequent handlers after preventDefault", () => {
    const calls: number[] = [];
    const handler = composeEventHandlers(
      (e) => {
        calls.push(1);
        e.preventDefault();
      },
      () => calls.push(2),
    );
    handler(makeEvent());
    expect(calls).toEqual([1]);
  });

  it("returns a no-op function when given no handlers", () => {
    const handler = composeEventHandlers();
    expect(() => handler(makeEvent())).not.toThrow();
  });

  it("passes the same event reference to all handlers", () => {
    const events: unknown[] = [];
    const handler = composeEventHandlers(
      (e) => events.push(e),
      (e) => events.push(e),
    );
    const event = makeEvent();
    handler(event);
    expect(events[0]).toBe(event);
    expect(events[1]).toBe(event);
  });

  it("works with plain objects matching the interface", () => {
    const calls: number[] = [];
    const handler = composeEventHandlers<{ defaultPrevented: boolean; custom: string }>(
      (e) => calls.push(1),
    );
    handler({ defaultPrevented: false, custom: "test" });
    expect(calls).toEqual([1]);
  });
});

describe("composeEventHandlersAlways", () => {
  it("calls all handlers even after preventDefault", () => {
    const calls: number[] = [];
    const handler = composeEventHandlersAlways(
      (e) => {
        calls.push(1);
        e.preventDefault();
      },
      () => calls.push(2),
      () => calls.push(3),
    );
    handler(makeEvent());
    expect(calls).toEqual([1, 2, 3]);
  });
});
