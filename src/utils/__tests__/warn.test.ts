import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { _resetWarnings, getLogger, setLogger, warn, warnOnce } from "../warn";

describe("warn", () => {
  let logged: unknown[][];
  const original = getLogger();

  beforeEach(() => {
    logged = [];
    setLogger({ warn: (...args) => logged.push(args) });
    _resetWarnings();
  });

  afterEach(() => {
    setLogger(original);
  });

  it("does nothing when condition is true", () => {
    warn(true, "should not fire");
    expect(logged).toHaveLength(0);
  });

  it("logs when condition is false", () => {
    warn(false, "fire");
    expect(logged).toHaveLength(1);
    expect(logged[0]![0]).toContain("[voidframe]");
    expect(logged[0]![0]).toContain("fire");
  });

  it("forwards extra args to logger", () => {
    warn(false, "msg", { detail: 1 });
    expect(logged[0]![1]).toEqual({ detail: 1 });
  });
});

describe("warnOnce", () => {
  let logged: unknown[][];
  const original = getLogger();

  beforeEach(() => {
    logged = [];
    setLogger({ warn: (...args) => logged.push(args) });
    _resetWarnings();
  });

  afterEach(() => {
    setLogger(original);
  });

  it("logs only once per key", () => {
    warnOnce("dup", "first");
    warnOnce("dup", "second");
    warnOnce("dup", "third");
    expect(logged).toHaveLength(1);
  });

  it("logs different keys independently", () => {
    warnOnce("a", "x");
    warnOnce("b", "y");
    expect(logged).toHaveLength(2);
  });

  it("can be reset between tests", () => {
    warnOnce("k", "msg");
    expect(logged).toHaveLength(1);
    _resetWarnings();
    warnOnce("k", "msg");
    expect(logged).toHaveLength(2);
  });
});

describe("setLogger", () => {
  it("merges over the default logger", () => {
    const original = getLogger();
    const customWarn = vi.fn();
    setLogger({ warn: customWarn });
    expect(getLogger().warn).toBe(customWarn);
    expect(getLogger().error).toBe(original.error);
    setLogger(original);
  });
});
