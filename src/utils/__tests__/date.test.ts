import { describe, expect, it } from "vitest";
import {
  addDays,
  addMonths,
  clampDate,
  endOfMonth,
  formatDate,
  getMonthGrid,
  isSameDay,
  isSameMonth,
  monthName,
  parseDate,
  startOfDay,
  startOfMonth,
  weekdayNames,
} from "../date";

describe("startOfDay / startOfMonth / endOfMonth", () => {
  it("startOfDay zeroes the time components", () => {
    const d = new Date(2026, 3, 14, 15, 30, 45, 123);
    const s = startOfDay(d);
    expect(s.getHours()).toBe(0);
    expect(s.getMinutes()).toBe(0);
    expect(s.getSeconds()).toBe(0);
    expect(s.getMilliseconds()).toBe(0);
    // Doesn't mutate input.
    expect(d.getHours()).toBe(15);
  });

  it("startOfMonth goes to day 1", () => {
    const d = new Date(2026, 5, 20);
    const s = startOfMonth(d);
    expect(s.getDate()).toBe(1);
    expect(s.getMonth()).toBe(5);
  });

  it("endOfMonth returns last day at end of day", () => {
    const feb = endOfMonth(new Date(2023, 1, 10)); // 2023 is non-leap
    expect(feb.getDate()).toBe(28);
    const feb2024 = endOfMonth(new Date(2024, 1, 10)); // leap
    expect(feb2024.getDate()).toBe(29);
  });
});

describe("addDays / addMonths", () => {
  it("addDays handles month/year boundaries", () => {
    const d = new Date(2026, 2, 30); // March 30
    expect(addDays(d, 3).getMonth()).toBe(3); // April
    expect(addDays(d, 3).getDate()).toBe(2);
  });

  it("addMonths clamps day when target month is shorter", () => {
    const d = new Date(2026, 0, 31); // Jan 31
    const next = addMonths(d, 1);
    expect(next.getMonth()).toBe(1); // Feb
    // 2026 is not a leap year → Feb has 28 days
    expect(next.getDate()).toBe(28);
  });

  it("addMonths handles negative offset across year boundary", () => {
    const d = new Date(2026, 1, 15); // Feb 15
    const prev = addMonths(d, -3);
    expect(prev.getFullYear()).toBe(2025);
    expect(prev.getMonth()).toBe(10); // November
  });
});

describe("isSameDay / isSameMonth", () => {
  it("isSameDay compares Y/M/D (ignores time)", () => {
    expect(
      isSameDay(new Date(2026, 0, 1, 0, 0), new Date(2026, 0, 1, 23, 59))
    ).toBe(true);
    expect(isSameDay(new Date(2026, 0, 1), new Date(2026, 0, 2))).toBe(false);
  });
  it("handles null args", () => {
    expect(isSameDay(null, new Date())).toBe(false);
    expect(isSameDay(new Date(), undefined)).toBe(false);
  });
  it("isSameMonth compares Y/M", () => {
    expect(
      isSameMonth(new Date(2026, 3, 1), new Date(2026, 3, 30))
    ).toBe(true);
    expect(
      isSameMonth(new Date(2026, 3, 30), new Date(2026, 4, 1))
    ).toBe(false);
  });
});

describe("getMonthGrid", () => {
  it("returns exactly 42 cells", () => {
    expect(getMonthGrid(new Date(2026, 2, 1))).toHaveLength(42);
  });
  it("first cell is before-or-equal to the 1st", () => {
    const grid = getMonthGrid(new Date(2026, 2, 1));
    expect(grid[0]!.getTime()).toBeLessThanOrEqual(new Date(2026, 2, 1).getTime());
  });
  it("respects firstDayOfWeek=1 (Monday-first)", () => {
    const grid = getMonthGrid(new Date(2026, 0, 1), 1);
    // In 2026, Jan 1 is Thursday. With Monday-first, the grid starts on Monday Dec 29.
    expect(grid[0]!.getDay()).toBe(1); // Monday
  });
});

describe("weekdayNames / monthName", () => {
  it("weekdayNames returns 7 entries", () => {
    expect(weekdayNames("en-US")).toHaveLength(7);
  });
  it("rotated with firstDayOfWeek=1", () => {
    const sun = weekdayNames("en-US", 0);
    const mon = weekdayNames("en-US", 1);
    expect(sun[0]).not.toBe(mon[0]);
    expect(sun[0]).toBe(mon[6]);
  });
  it("monthName returns localized long form", () => {
    const name = monthName(new Date(2026, 2, 1), "en-US");
    expect(name.toLowerCase()).toContain("march");
  });
});

describe("formatDate", () => {
  const d = new Date(2026, 2, 7, 9, 5, 3); // March 7 2026 09:05:03

  it("yyyy-MM-dd", () => {
    expect(formatDate(d, "yyyy-MM-dd")).toBe("2026-03-07");
  });
  it("yy/M/d", () => {
    expect(formatDate(d, "yy/M/d")).toBe("26/3/7");
  });
  it("24-hour HH:mm:ss", () => {
    expect(formatDate(d, "HH:mm:ss")).toBe("09:05:03");
  });
  it("12-hour h:mm a", () => {
    expect(formatDate(d, "h:mm a")).toBe("9:05 AM");
  });
  it("12-hour after noon", () => {
    const pm = new Date(2026, 0, 1, 15, 30);
    expect(formatDate(pm, "h:mm a")).toBe("3:30 PM");
  });
});

describe("parseDate", () => {
  it("parses yyyy-MM-dd", () => {
    const d = parseDate("2026-03-07", "yyyy-MM-dd");
    expect(d).toBeInstanceOf(Date);
    expect(d!.getFullYear()).toBe(2026);
    expect(d!.getMonth()).toBe(2);
    expect(d!.getDate()).toBe(7);
  });
  it("parses short year", () => {
    const d = parseDate("26/3/7", "yy/M/d");
    expect(d!.getFullYear()).toBe(2026);
  });
  it("rejects invalid dates (Feb 31)", () => {
    expect(parseDate("2026-02-31", "yyyy-MM-dd")).toBeNull();
  });
  it("returns null for non-matching input", () => {
    expect(parseDate("not-a-date", "yyyy-MM-dd")).toBeNull();
    expect(parseDate("", "yyyy-MM-dd")).toBeNull();
  });
  it("round-trips with formatDate", () => {
    const original = new Date(2026, 5, 15, 14, 30, 0);
    const formatted = formatDate(original, "yyyy-MM-dd HH:mm");
    const parsed = parseDate(formatted, "yyyy-MM-dd HH:mm");
    expect(parsed!.getFullYear()).toBe(2026);
    expect(parsed!.getMonth()).toBe(5);
    expect(parsed!.getHours()).toBe(14);
    expect(parsed!.getMinutes()).toBe(30);
  });
  it("handles 12-hour with AM/PM", () => {
    const d = parseDate("3:30 PM", "h:mm a")!;
    expect(d.getHours()).toBe(15);
    expect(d.getMinutes()).toBe(30);
  });
});

describe("clampDate", () => {
  const min = new Date(2026, 0, 1);
  const max = new Date(2026, 11, 31);
  it("returns value within range", () => {
    const mid = new Date(2026, 5, 15);
    expect(clampDate(mid, min, max)).toBe(mid);
  });
  it("clamps below min", () => {
    const below = new Date(2025, 11, 1);
    expect(clampDate(below, min, max)).toBe(min);
  });
  it("clamps above max", () => {
    const above = new Date(2027, 5, 1);
    expect(clampDate(above, min, max)).toBe(max);
  });
});
