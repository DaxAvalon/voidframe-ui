import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import {
  formatNumber,
  formatBytes,
  formatDuration,
  timeAgo,
  truncate,
  clamp,
  mapRange,
  stringToColor,
  adjustColor,
  deepMerge,
  uid,
  groupBy,
  sortBy,
  copyToClipboard,
} from "../formatters";

// ── formatNumber ───────────────────────────────────────────
describe("formatNumber", () => {
  it("formats integers with locale separators", () => {
    // toLocaleString is locale-dependent; just verify it returns a string
    const result = formatNumber(12847);
    expect(result).toBeTruthy();
    expect(typeof result).toBe("string");
  });

  it("rounds to specified decimal places", () => {
    expect(formatNumber(3.14159, 2)).toContain("3.14");
  });

  it("handles zero", () => {
    expect(formatNumber(0)).toBe("0");
  });

  it("handles negative numbers", () => {
    const result = formatNumber(-1234);
    expect(result).toContain("1");
    expect(result).toContain("-");
  });
});

// ── formatBytes ────────────────────────────────────────────
describe("formatBytes", () => {
  it("formats 0 bytes", () => {
    expect(formatBytes(0)).toBe("0 B");
  });

  it("formats bytes under 1 KB", () => {
    expect(formatBytes(512)).toBe("512 B");
  });

  it("formats kilobytes", () => {
    expect(formatBytes(1024)).toBe("1.0 KB");
  });

  it("formats megabytes", () => {
    expect(formatBytes(1048576)).toBe("1.0 MB");
  });

  it("formats gigabytes", () => {
    expect(formatBytes(1073741824)).toBe("1.0 GB");
  });
});

// ── formatDuration ─────────────────────────────────────────
describe("formatDuration", () => {
  it("formats milliseconds", () => {
    expect(formatDuration(500)).toBe("500ms");
  });

  it("formats seconds", () => {
    expect(formatDuration(45000)).toBe("45.0s");
  });

  it("formats minutes and seconds", () => {
    expect(formatDuration(135000)).toBe("2m 15s");
  });

  it("formats hours and minutes", () => {
    expect(formatDuration(8100000)).toBe("2h 15m");
  });
});

// ── timeAgo ────────────────────────────────────────────────
describe("timeAgo", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-15T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns 'just now' for recent times", () => {
    const recent = new Date("2026-04-15T11:59:30Z");
    expect(timeAgo(recent)).toBe("just now");
  });

  it("returns minutes ago", () => {
    const fiveMinAgo = new Date("2026-04-15T11:55:00Z");
    expect(timeAgo(fiveMinAgo)).toBe("5m ago");
  });

  it("returns hours ago", () => {
    const twoHoursAgo = new Date("2026-04-15T10:00:00Z");
    expect(timeAgo(twoHoursAgo)).toBe("2h ago");
  });

  it("returns days ago", () => {
    const twoDaysAgo = new Date("2026-04-13T12:00:00Z");
    expect(timeAgo(twoDaysAgo)).toBe("2d ago");
  });

  it("accepts numeric timestamps", () => {
    const ts = new Date("2026-04-15T11:55:00Z").getTime();
    expect(timeAgo(ts)).toBe("5m ago");
  });
});

// ── truncate ───────────────────────────────────────────────
describe("truncate", () => {
  it("returns short strings unchanged", () => {
    expect(truncate("hello", 10)).toBe("hello");
  });

  it("truncates long strings with ellipsis", () => {
    const result = truncate("hello world this is long", 10);
    expect(result).toHaveLength(10);
    expect(result.endsWith("…")).toBe(true);
  });

  it("returns empty string for null", () => {
    expect(truncate(null)).toBe("");
  });

  it("returns empty string for undefined", () => {
    expect(truncate(undefined)).toBe("");
  });
});

// ── clamp ──────────────────────────────────────────────────
describe("clamp", () => {
  it("clamps below min", () => {
    expect(clamp(-5, 0, 100)).toBe(0);
  });

  it("clamps above max", () => {
    expect(clamp(150, 0, 100)).toBe(100);
  });

  it("returns value within range unchanged", () => {
    expect(clamp(50, 0, 100)).toBe(50);
  });
});

// ── mapRange ───────────────────────────────────────────────
describe("mapRange", () => {
  it("maps midpoint correctly", () => {
    expect(mapRange(5, 0, 10, 0, 100)).toBe(50);
  });

  it("maps min to outMin", () => {
    expect(mapRange(0, 0, 10, 20, 80)).toBe(20);
  });

  it("maps max to outMax", () => {
    expect(mapRange(10, 0, 10, 20, 80)).toBe(80);
  });
});

// ── stringToColor ──────────────────────────────────────────
describe("stringToColor", () => {
  it("returns an HSL string", () => {
    const color = stringToColor("alice");
    expect(color).toMatch(/^hsl\(\d+, 50%, 60%\)$/);
  });

  it("is deterministic", () => {
    expect(stringToColor("test")).toBe(stringToColor("test"));
  });

  it("produces different colors for different strings", () => {
    expect(stringToColor("alice")).not.toBe(stringToColor("bob"));
  });
});

// ── adjustColor ────────────────────────────────────────────
describe("adjustColor", () => {
  it("lightens a color", () => {
    const result = adjustColor("#808080", 20);
    expect(result).toMatch(/^#[0-9a-f]{6}$/);
    // 0x80 + 20 = 0x94 → should be brighter
    expect(result).not.toBe("#808080");
  });

  it("darkens a color", () => {
    const result = adjustColor("#808080", -20);
    expect(result).toMatch(/^#[0-9a-f]{6}$/);
  });

  it("clamps to valid range", () => {
    const result = adjustColor("#ffffff", 100);
    expect(result).toBe("#ffffff");
  });
});

// ── deepMerge ──────────────────────────────────────────────
describe("deepMerge", () => {
  it("merges flat objects", () => {
    expect(deepMerge({ a: 1 }, { b: 2 })).toEqual({ a: 1, b: 2 });
  });

  it("overrides scalar values", () => {
    expect(deepMerge({ a: 1 }, { a: 2 })).toEqual({ a: 2 });
  });

  it("recursively merges nested objects", () => {
    const result = deepMerge(
      { theme: { color: "red", size: 12 } },
      { theme: { color: "blue" } }
    );
    expect(result).toEqual({ theme: { color: "blue", size: 12 } });
  });

  it("does not mutate the target", () => {
    const target = { a: 1 };
    deepMerge(target, { a: 2 });
    expect(target.a).toBe(1);
  });
});

// ── uid ────────────────────────────────────────────────────
describe("uid", () => {
  it("returns a string starting with default prefix", () => {
    expect(uid()).toMatch(/^vf-/);
  });

  it("accepts a custom prefix", () => {
    expect(uid("test")).toMatch(/^test-/);
  });

  it("generates unique ids", () => {
    const ids = new Set(Array.from({ length: 100 }, () => uid()));
    expect(ids.size).toBe(100);
  });
});

// ── groupBy ────────────────────────────────────────────────
describe("groupBy", () => {
  it("groups items by key function", () => {
    const items = [
      { type: "a", v: 1 },
      { type: "b", v: 2 },
      { type: "a", v: 3 },
    ];
    const result = groupBy(items, (i) => i.type);
    expect(result.a).toHaveLength(2);
    expect(result.b).toHaveLength(1);
  });

  it("returns empty object for empty array", () => {
    expect(groupBy([], () => "x")).toEqual({});
  });
});

// ── sortBy ─────────────────────────────────────────────────
describe("sortBy", () => {
  const items = [
    { name: "Charlie", age: 30 },
    { name: "Alice", age: 25 },
    { name: "Bob", age: 35 },
  ];

  it("sorts ascending by default", () => {
    const sorted = sortBy(items, "name");
    expect(sorted.map((i) => i.name)).toEqual(["Alice", "Bob", "Charlie"]);
  });

  it("sorts descending", () => {
    const sorted = sortBy(items, "age", "desc");
    expect(sorted.map((i) => i.age)).toEqual([35, 30, 25]);
  });

  it("does not mutate the original array", () => {
    const original = [...items];
    sortBy(items, "name");
    expect(items).toEqual(original);
  });
});

// ── copyToClipboard ────────────────────────────────────────
describe("copyToClipboard", () => {
  it("returns true on success", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      writable: true,
      configurable: true,
    });
    expect(await copyToClipboard("hello")).toBe(true);
    expect(writeText).toHaveBeenCalledWith("hello");
  });

  it("returns false on failure", async () => {
    const writeText = vi.fn().mockRejectedValue(new Error("denied"));
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      writable: true,
      configurable: true,
    });
    expect(await copyToClipboard("hello")).toBe(false);
  });
});
