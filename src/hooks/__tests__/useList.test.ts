import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useList } from "../useList";

describe("useList", () => {
  it("initializes with items", () => {
    const { result } = renderHook(() => useList([1, 2, 3]));
    expect(result.current.list).toEqual([1, 2, 3]);
    expect(result.current.size).toBe(3);
  });

  it("push appends items", () => {
    const { result } = renderHook(() => useList([1]));
    act(() => result.current.push(2, 3));
    expect(result.current.list).toEqual([1, 2, 3]);
  });

  it("removeAt removes by index", () => {
    const { result } = renderHook(() => useList(["a", "b", "c"]));
    act(() => result.current.removeAt(1));
    expect(result.current.list).toEqual(["a", "c"]);
  });

  it("removeWhere removes matching items", () => {
    const { result } = renderHook(() => useList([1, 2, 3, 4]));
    act(() => result.current.removeWhere((n) => n % 2 === 0));
    expect(result.current.list).toEqual([1, 3]);
  });

  it("updateAt replaces an item", () => {
    const { result } = renderHook(() => useList(["a", "b", "c"]));
    act(() => result.current.updateAt(1, "B"));
    expect(result.current.list).toEqual(["a", "B", "c"]);
  });

  it("updateWhere updates matching items", () => {
    const { result } = renderHook(() => useList([1, 2, 3, 4]));
    act(() =>
      result.current.updateWhere(
        (n) => n > 2,
        (n) => n * 10
      )
    );
    expect(result.current.list).toEqual([1, 2, 30, 40]);
  });

  it("insertAt inserts at index", () => {
    const { result } = renderHook(() => useList([1, 3]));
    act(() => result.current.insertAt(1, 2));
    expect(result.current.list).toEqual([1, 2, 3]);
  });

  it("move relocates an item", () => {
    const { result } = renderHook(() => useList(["a", "b", "c", "d"]));
    act(() => result.current.move(0, 2));
    expect(result.current.list).toEqual(["b", "c", "a", "d"]);
  });

  it("swap exchanges two items", () => {
    const { result } = renderHook(() => useList([1, 2, 3]));
    act(() => result.current.swap(0, 2));
    expect(result.current.list).toEqual([3, 2, 1]);
  });

  it("sort orders items", () => {
    const { result } = renderHook(() => useList([3, 1, 2]));
    act(() => result.current.sort((a, b) => a - b));
    expect(result.current.list).toEqual([1, 2, 3]);
  });

  it("filter removes non-matching items", () => {
    const { result } = renderHook(() => useList([1, 2, 3, 4, 5]));
    act(() => result.current.filter((n) => n <= 3));
    expect(result.current.list).toEqual([1, 2, 3]);
  });

  it("clear empties the list", () => {
    const { result } = renderHook(() => useList([1, 2, 3]));
    act(() => result.current.clear());
    expect(result.current.list).toEqual([]);
    expect(result.current.size).toBe(0);
  });

  it("reset restores to initial list", () => {
    const { result } = renderHook(() => useList([1, 2]));
    act(() => result.current.push(3));
    act(() => result.current.reset());
    expect(result.current.list).toEqual([1, 2]);
  });

  it("size reflects current length", () => {
    const { result } = renderHook(() => useList([1, 2, 3, 4, 5]));
    expect(result.current.size).toBe(5);
    act(() => result.current.removeAt(0));
    expect(result.current.size).toBe(4);
  });

  it("out-of-bounds operations are graceful", () => {
    const { result } = renderHook(() => useList([1, 2]));
    const before = result.current.list;
    act(() => result.current.removeAt(99));
    expect(result.current.list).toBe(before);
    act(() => result.current.updateAt(-1, 0));
    expect(result.current.list).toBe(before);
    act(() => result.current.swap(0, 99));
    expect(result.current.list).toBe(before);
    act(() => result.current.move(-1, 0));
    expect(result.current.list).toBe(before);
  });

  it("initializes empty without arguments", () => {
    const { result } = renderHook(() => useList<number>());
    expect(result.current.list).toEqual([]);
    expect(result.current.size).toBe(0);
  });
});
