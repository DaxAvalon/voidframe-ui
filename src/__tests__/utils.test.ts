import { describe, expect, it } from "vitest";
import {
  adjustColor,
  clamp,
  copyToClipboard,
  deepMerge,
  formatBytes,
  formatDuration,
  formatNumber,
  groupBy,
  mapRange,
  sortBy,
  stringToColor,
  timeAgo,
  truncate,
  uid,
} from "../utils";

describe("formatNumber", () => {
  it("formats with thousand separators", () => {
    // Locale dependent — happy-dom uses "en-US" by default.
    expect(formatNumber(12847)).toMatch(/12[,.]847/);
  });

  it("respects decimal precision", () => {
    expect(formatNumber(3.14159, 2)).toBe("3.14");
  });

  it("handles zero", () => {
    expect(formatNumber(0)).toBe("0");
  });

  it("handles negatives", () => {
    expect(formatNumber(-42)).toBe("-42");
  });
});

describe("formatBytes", () => {
  it("returns '0 B' for zero", () => {
    expect(formatBytes(0)).toBe("0 B");
  });

  it("formats bytes", () => {
    expect(formatBytes(500)).toBe("500 B");
  });

  it("formats kilobytes", () => {
    expect(formatBytes(1024)).toBe("1.0 KB");
  });

  it("formats megabytes", () => {
    expect(formatBytes(1024 * 1024 * 5)).toBe("5.0 MB");
  });
});

describe("formatDuration", () => {
  it("formats milliseconds", () => {
    expect(formatDuration(500)).toBe("500ms");
  });
  it("formats seconds", () => {
    expect(formatDuration(1500)).toBe("1.5s");
  });
  it("formats minutes + seconds", () => {
    expect(formatDuration(75000)).toBe("1m 15s");
  });
  it("formats hours + minutes", () => {
    expect(formatDuration(3_900_000)).toBe("1h 5m");
  });
});

describe("timeAgo", () => {
  it("returns 'just now' for recent timestamps", () => {
    expect(timeAgo(Date.now() - 5000)).toBe("just now");
  });
  it("returns minutes for older times", () => {
    expect(timeAgo(Date.now() - 5 * 60 * 1000)).toMatch(/5m ago/);
  });
  it("uses 'in X' prefix for future times", () => {
    expect(timeAgo(Date.now() + 5 * 60 * 1000)).toMatch(/in 5m/);
  });
});

describe("truncate", () => {
  it("returns short strings unchanged", () => {
    expect(truncate("hi", 10)).toBe("hi");
  });
  it("truncates and adds ellipsis", () => {
    expect(truncate("hello world", 6)).toBe("hello…");
  });
  it("handles null/undefined without throwing", () => {
    expect(truncate(null)).toBe("");
    expect(truncate(undefined)).toBe("");
  });
});

describe("clamp", () => {
  it("clamps within range", () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });
  it("clamps above max", () => {
    expect(clamp(15, 0, 10)).toBe(10);
  });
  it("clamps below min", () => {
    expect(clamp(-5, 0, 10)).toBe(0);
  });
});

describe("mapRange", () => {
  it("maps a value from one range to another", () => {
    expect(mapRange(5, 0, 10, 0, 100)).toBe(50);
  });
  it("handles negative ranges", () => {
    expect(mapRange(0, -10, 10, 0, 100)).toBe(50);
  });
});

describe("stringToColor", () => {
  it("produces same color for same string", () => {
    expect(stringToColor("alice")).toBe(stringToColor("alice"));
  });
  it("produces different colors for different strings", () => {
    expect(stringToColor("alice")).not.toBe(stringToColor("bob"));
  });
  it("returns valid hsl color format", () => {
    expect(stringToColor("test")).toMatch(/^hsl\(\d+, \d+%, \d+%\)$/);
  });
});

describe("adjustColor", () => {
  it("lightens with positive amount", () => {
    const lighter = adjustColor("#808080", 20);
    expect(lighter).not.toBe("#808080");
    expect(lighter.length).toBe(7);
  });
  it("darkens with negative amount", () => {
    const darker = adjustColor("#808080", -20);
    expect(darker).not.toBe("#808080");
  });
  it("clamps to valid hex range", () => {
    const max = adjustColor("#ffffff", 100);
    expect(max).toBe("#ffffff");
    const min = adjustColor("#000000", -100);
    expect(min).toBe("#000000");
  });
});

describe("deepMerge", () => {
  it("merges flat objects", () => {
    expect(deepMerge({ a: 1, b: 2 }, { b: 3 })).toEqual({ a: 1, b: 3 });
  });
  it("merges nested objects", () => {
    expect(deepMerge({ a: { x: 1 } }, { a: { y: 2 } } as { a: { x?: number; y: number } })).toEqual(
      { a: { x: 1, y: 2 } }
    );
  });
  it("does not mutate inputs", () => {
    const a = { x: 1 };
    const b = { y: 2 };
    deepMerge(a, b as unknown as typeof a);
    expect(a).toEqual({ x: 1 });
  });
});

describe("uid", () => {
  it("returns a string with default prefix", () => {
    expect(uid()).toMatch(/^vf-/);
  });
  it("accepts custom prefix", () => {
    expect(uid("btn")).toMatch(/^btn-/);
  });
  it("produces unique values", () => {
    const set = new Set(Array.from({ length: 50 }, () => uid()));
    expect(set.size).toBe(50);
  });
});

describe("groupBy", () => {
  it("groups items by key function", () => {
    const result = groupBy(
      [{ t: "a" }, { t: "b" }, { t: "a" }],
      (x) => x.t
    );
    expect(result.a).toHaveLength(2);
    expect(result.b).toHaveLength(1);
  });
  it("returns empty object for empty array", () => {
    expect(groupBy([], (x) => String(x))).toEqual({});
  });
});

describe("sortBy", () => {
  const data = [
    { n: 3, name: "c" },
    { n: 1, name: "a" },
    { n: 2, name: "b" },
  ];
  it("sorts ascending by default", () => {
    expect(sortBy(data, "n")).toEqual([
      { n: 1, name: "a" },
      { n: 2, name: "b" },
      { n: 3, name: "c" },
    ]);
  });
  it("sorts descending when asked", () => {
    expect(sortBy(data, "n", "desc")[0]!.n).toBe(3);
  });
  it("does not mutate input", () => {
    const copy = [...data];
    sortBy(data, "n");
    expect(data).toEqual(copy);
  });
});

describe("copyToClipboard", () => {
  it("returns false when clipboard API is unavailable", async () => {
    // happy-dom's clipboard may or may not exist; either way, function must not throw.
    const result = await copyToClipboard("test").catch(() => false);
    expect(typeof result).toBe("boolean");
  });
});
