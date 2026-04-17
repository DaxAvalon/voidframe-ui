import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useUndoRedo } from "../useUndoRedo";

describe("useUndoRedo", () => {
  it("returns initial state", () => {
    const { result } = renderHook(() => useUndoRedo(0));
    expect(result.current.state).toBe(0);
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
  });

  it("set updates state", () => {
    const { result } = renderHook(() => useUndoRedo(0));
    act(() => result.current.set(1));
    expect(result.current.state).toBe(1);
  });

  it("canUndo is true after set", () => {
    const { result } = renderHook(() => useUndoRedo(0));
    act(() => result.current.set(1));
    expect(result.current.canUndo).toBe(true);
  });

  it("undo reverts to previous state", () => {
    const { result } = renderHook(() => useUndoRedo(0));
    act(() => result.current.set(1));
    act(() => result.current.undo());
    expect(result.current.state).toBe(0);
  });

  it("canRedo is true after undo", () => {
    const { result } = renderHook(() => useUndoRedo(0));
    act(() => result.current.set(1));
    act(() => result.current.undo());
    expect(result.current.canRedo).toBe(true);
  });

  it("redo restores undone state", () => {
    const { result } = renderHook(() => useUndoRedo(0));
    act(() => result.current.set(1));
    act(() => result.current.undo());
    act(() => result.current.redo());
    expect(result.current.state).toBe(1);
  });

  it("undo when cannot undo does nothing", () => {
    const { result } = renderHook(() => useUndoRedo(0));
    act(() => result.current.undo());
    expect(result.current.state).toBe(0);
  });

  it("redo when cannot redo does nothing", () => {
    const { result } = renderHook(() => useUndoRedo(0));
    act(() => result.current.redo());
    expect(result.current.state).toBe(0);
  });

  it("set after undo clears future", () => {
    const { result } = renderHook(() => useUndoRedo(0));
    act(() => result.current.set(1));
    act(() => result.current.set(2));
    act(() => result.current.undo());
    act(() => result.current.set(3));
    expect(result.current.state).toBe(3);
    expect(result.current.canRedo).toBe(false);
    expect(result.current.history.future).toEqual([]);
  });

  it("supports functional setter", () => {
    const { result } = renderHook(() => useUndoRedo(10));
    act(() => result.current.set((prev) => prev + 5));
    expect(result.current.state).toBe(15);
  });

  it("maxHistory limits past length", () => {
    const { result } = renderHook(() =>
      useUndoRedo(0, { maxHistory: 2 })
    );
    act(() => result.current.set(1));
    act(() => result.current.set(2));
    act(() => result.current.set(3));
    expect(result.current.history.past).toHaveLength(2);
    expect(result.current.history.past).toEqual([1, 2]);
  });

  it("isEqual prevents duplicate pushes", () => {
    const { result } = renderHook(() =>
      useUndoRedo(0, { isEqual: (a, b) => a === b })
    );
    act(() => result.current.set(0));
    expect(result.current.canUndo).toBe(false);
    expect(result.current.history.past).toEqual([]);
  });

  it("reset clears history", () => {
    const { result } = renderHook(() => useUndoRedo(0));
    act(() => result.current.set(1));
    act(() => result.current.set(2));
    act(() => result.current.reset());
    expect(result.current.state).toBe(0);
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
  });

  it("history exposes past/present/future arrays", () => {
    const { result } = renderHook(() => useUndoRedo("a"));
    act(() => result.current.set("b"));
    act(() => result.current.set("c"));
    act(() => result.current.undo());

    expect(result.current.history.past).toEqual(["a"]);
    expect(result.current.history.present).toBe("b");
    expect(result.current.history.future).toEqual(["c"]);
  });

  it("handles rapid set/undo/redo", () => {
    const { result } = renderHook(() => useUndoRedo(0));
    act(() => {
      result.current.set(1);
    });
    act(() => {
      result.current.set(2);
    });
    act(() => {
      result.current.set(3);
    });
    act(() => {
      result.current.undo();
    });
    act(() => {
      result.current.undo();
    });
    act(() => {
      result.current.redo();
    });
    expect(result.current.state).toBe(2);
  });

  it("works with complex objects", () => {
    const { result } = renderHook(() =>
      useUndoRedo({ name: "Alice", age: 30 })
    );
    act(() => result.current.set({ name: "Bob", age: 25 }));
    expect(result.current.state).toEqual({ name: "Bob", age: 25 });

    act(() => result.current.undo());
    expect(result.current.state).toEqual({ name: "Alice", age: 30 });
  });
});
