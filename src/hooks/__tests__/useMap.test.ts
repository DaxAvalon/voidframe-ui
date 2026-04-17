import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useMap } from "../useMap";

describe("useMap", () => {
  it("initializes with entries", () => {
    const { result } = renderHook(() =>
      useMap<string, number>([
        ["a", 1],
        ["b", 2],
      ])
    );
    expect(result.current.map.size).toBe(2);
    expect(result.current.map.get("a")).toBe(1);
    expect(result.current.map.get("b")).toBe(2);
  });

  it("get retrieves values", () => {
    const { result } = renderHook(() =>
      useMap<string, number>([["x", 42]])
    );
    expect(result.current.get("x")).toBe(42);
    expect(result.current.get("y")).toBeUndefined();
  });

  it("set adds a new entry and re-renders", () => {
    const { result } = renderHook(() => useMap<string, number>());
    act(() => result.current.set("key", 10));
    expect(result.current.map.get("key")).toBe(10);
    expect(result.current.size).toBe(1);
  });

  it("set updates an existing entry", () => {
    const { result } = renderHook(() =>
      useMap<string, number>([["a", 1]])
    );
    act(() => result.current.set("a", 99));
    expect(result.current.get("a")).toBe(99);
    expect(result.current.size).toBe(1);
  });

  it("remove deletes an entry", () => {
    const { result } = renderHook(() =>
      useMap<string, number>([
        ["a", 1],
        ["b", 2],
      ])
    );
    act(() => result.current.remove("a"));
    expect(result.current.has("a")).toBe(false);
    expect(result.current.size).toBe(1);
  });

  it("has returns correct boolean", () => {
    const { result } = renderHook(() =>
      useMap<string, number>([["a", 1]])
    );
    expect(result.current.has("a")).toBe(true);
    expect(result.current.has("z")).toBe(false);
  });

  it("clear empties the map", () => {
    const { result } = renderHook(() =>
      useMap<string, number>([
        ["a", 1],
        ["b", 2],
      ])
    );
    act(() => result.current.clear());
    expect(result.current.size).toBe(0);
  });

  it("size is correct", () => {
    const { result } = renderHook(() =>
      useMap<string, number>([
        ["a", 1],
        ["b", 2],
        ["c", 3],
      ])
    );
    expect(result.current.size).toBe(3);
  });

  it("reset restores to initial entries", () => {
    const initial: [string, number][] = [["a", 1]];
    const { result } = renderHook(() => useMap<string, number>(initial));
    act(() => result.current.set("b", 2));
    act(() => result.current.reset());
    expect(result.current.size).toBe(1);
    expect(result.current.get("a")).toBe(1);
  });

  it("reset to new entries", () => {
    const { result } = renderHook(() =>
      useMap<string, number>([["a", 1]])
    );
    act(() =>
      result.current.reset([
        ["x", 10],
        ["y", 20],
      ])
    );
    expect(result.current.size).toBe(2);
    expect(result.current.get("x")).toBe(10);
    expect(result.current.get("y")).toBe(20);
  });

  it("setAll adds multiple entries", () => {
    const { result } = renderHook(() =>
      useMap<string, number>([["a", 1]])
    );
    act(() =>
      result.current.setAll([
        ["b", 2],
        ["c", 3],
      ])
    );
    expect(result.current.size).toBe(3);
    expect(result.current.get("b")).toBe(2);
    expect(result.current.get("c")).toBe(3);
  });

  it("supports iteration via map property", () => {
    const { result } = renderHook(() =>
      useMap<string, number>([
        ["a", 1],
        ["b", 2],
      ])
    );
    const keys = [...result.current.map.keys()];
    const values = [...result.current.map.values()];
    const entries = [...result.current.map.entries()];
    expect(keys).toEqual(["a", "b"]);
    expect(values).toEqual([1, 2]);
    expect(entries).toEqual([
      ["a", 1],
      ["b", 2],
    ]);
  });

  it("initializes empty without arguments", () => {
    const { result } = renderHook(() => useMap<string, number>());
    expect(result.current.size).toBe(0);
    expect(result.current.map.size).toBe(0);
  });

  it("supports complex key types", () => {
    const keyA = { id: 1 };
    const keyB = { id: 2 };
    const { result } = renderHook(() =>
      useMap<object, string>([
        [keyA, "first"],
        [keyB, "second"],
      ])
    );
    expect(result.current.get(keyA)).toBe("first");
    expect(result.current.has(keyB)).toBe(true);
  });
});
