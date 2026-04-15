import { describe, expect, it, beforeEach, vi } from "vitest";
import {
  _resetWarnings,
  warn,
  warnOnce,
  subscribeWarnings,
  getWarningHistory,
  clearWarningHistory,
  type WarningEntry,
} from "../../utils/warn";

describe("warn tap/subscribe", () => {
  beforeEach(() => {
    _resetWarnings();
  });

  it("subscribers receive every warn call", () => {
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const received: WarningEntry[] = [];
    const unsub = subscribeWarnings((e) => received.push(e));
    warn(false, "msg-a");
    warn(false, "msg-b");
    expect(received).toHaveLength(2);
    expect(received[0].message).toBe("msg-a");
    expect(received[1].message).toBe("msg-b");
    unsub();
    spy.mockRestore();
  });

  it("unsubscribe stops further notifications", () => {
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const received: WarningEntry[] = [];
    const unsub = subscribeWarnings((e) => received.push(e));
    warn(false, "first");
    unsub();
    warn(false, "second");
    expect(received).toHaveLength(1);
    spy.mockRestore();
  });

  it("warnOnce dedupes but still notifies on the first call only", () => {
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const received: WarningEntry[] = [];
    const unsub = subscribeWarnings((e) => received.push(e));
    warnOnce("k1", "hello");
    warnOnce("k1", "hello");
    warnOnce("k2", "other");
    expect(received).toHaveLength(2);
    expect(received[0].key).toBe("k1");
    expect(received[1].key).toBe("k2");
    unsub();
    spy.mockRestore();
  });

  it("getWarningHistory returns accumulated entries", () => {
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
    warn(false, "h1");
    warn(false, "h2");
    const history = getWarningHistory();
    expect(history.length).toBeGreaterThanOrEqual(2);
    expect(history.map((e) => e.message)).toContain("h1");
    expect(history.map((e) => e.message)).toContain("h2");
    spy.mockRestore();
  });

  it("clearWarningHistory empties captured entries", () => {
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
    warn(false, "to-clear");
    expect(getWarningHistory().length).toBeGreaterThan(0);
    clearWarningHistory();
    expect(getWarningHistory().length).toBe(0);
    spy.mockRestore();
  });

  it("listener errors do not propagate", () => {
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const unsub = subscribeWarnings(() => {
      throw new Error("listener boom");
    });
    expect(() => warn(false, "still-fires")).not.toThrow();
    unsub();
    spy.mockRestore();
  });
});
