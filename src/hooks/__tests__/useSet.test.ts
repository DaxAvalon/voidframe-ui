import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useSet } from "../useSet";

describe("useSet", () => {
  it("initializes with values", () => {
    const { result } = renderHook(() => useSet([1, 2, 3]));
    expect(result.current.size).toBe(3);
    expect(result.current.has(1)).toBe(true);
    expect(result.current.has(2)).toBe(true);
    expect(result.current.has(3)).toBe(true);
  });

  it("add inserts a value", () => {
    const { result } = renderHook(() => useSet<number>());
    act(() => result.current.add(5));
    expect(result.current.has(5)).toBe(true);
    expect(result.current.size).toBe(1);
  });

  it("add existing value is a no-op", () => {
    const { result } = renderHook(() => useSet([1, 2]));
    const before = result.current.set;
    act(() => result.current.add(1));
    expect(result.current.set).toBe(before);
    expect(result.current.size).toBe(2);
  });

  it("remove deletes a value", () => {
    const { result } = renderHook(() => useSet([1, 2, 3]));
    act(() => result.current.remove(2));
    expect(result.current.has(2)).toBe(false);
    expect(result.current.size).toBe(2);
  });

  it("toggle adds if absent", () => {
    const { result } = renderHook(() => useSet<number>());
    act(() => result.current.toggle(7));
    expect(result.current.has(7)).toBe(true);
  });

  it("toggle removes if present", () => {
    const { result } = renderHook(() => useSet([7]));
    act(() => result.current.toggle(7));
    expect(result.current.has(7)).toBe(false);
  });

  it("has returns correct boolean", () => {
    const { result } = renderHook(() => useSet(["a", "b"]));
    expect(result.current.has("a")).toBe(true);
    expect(result.current.has("z")).toBe(false);
  });

  it("clear empties the set", () => {
    const { result } = renderHook(() => useSet([1, 2, 3]));
    act(() => result.current.clear());
    expect(result.current.size).toBe(0);
  });

  it("size is correct", () => {
    const { result } = renderHook(() => useSet([10, 20, 30]));
    expect(result.current.size).toBe(3);
  });

  it("reset restores to initial values", () => {
    const { result } = renderHook(() => useSet([1, 2]));
    act(() => result.current.add(3));
    act(() => result.current.reset());
    expect(result.current.size).toBe(2);
    expect(result.current.has(3)).toBe(false);
  });

  it("toArray returns array of values", () => {
    const { result } = renderHook(() => useSet([3, 1, 2]));
    const arr = result.current.toArray();
    expect(arr).toEqual([3, 1, 2]);
  });

  it("initializes empty without arguments", () => {
    const { result } = renderHook(() => useSet<string>());
    expect(result.current.size).toBe(0);
    expect(result.current.toArray()).toEqual([]);
  });
});
