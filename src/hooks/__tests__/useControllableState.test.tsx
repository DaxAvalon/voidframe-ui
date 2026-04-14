import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useControllableState } from "../useControllableState";
import { _resetWarnings, getLogger, setLogger } from "../../utils/warn";

describe("useControllableState — uncontrolled", () => {
  it("seeds from defaultValue", () => {
    const { result } = renderHook(() =>
      useControllableState<number>({ defaultValue: 5 })
    );
    expect(result.current[0]).toBe(5);
  });

  it("updates internal state on setValue", () => {
    const { result } = renderHook(() =>
      useControllableState<number>({ defaultValue: 0 })
    );
    act(() => result.current[1](42));
    expect(result.current[0]).toBe(42);
  });

  it("notifies onChange on setValue", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useControllableState<number>({ defaultValue: 0, onChange })
    );
    act(() => result.current[1](7));
    expect(onChange).toHaveBeenCalledWith(7);
  });
});

describe("useControllableState — controlled", () => {
  it("returns the controlled value, not internal state", () => {
    const { result, rerender } = renderHook(
      ({ v }: { v: number }) =>
        useControllableState<number>({ value: v, onChange: () => {} }),
      { initialProps: { v: 1 } }
    );
    expect(result.current[0]).toBe(1);
    rerender({ v: 2 });
    expect(result.current[0]).toBe(2);
  });

  it("does NOT mutate internal state when setValue is called", () => {
    let externalValue = 1;
    const onChange = vi.fn((next: number) => {
      externalValue = next;
    });
    const { result, rerender } = renderHook(
      ({ v }: { v: number }) =>
        useControllableState<number>({ value: v, onChange }),
      { initialProps: { v: externalValue } }
    );
    // setValue fires onChange; consumer would update externalValue then re-render
    act(() => result.current[1](99));
    expect(onChange).toHaveBeenCalledWith(99);
    // Until parent re-renders with new value, the hook still reflects old value.
    expect(result.current[0]).toBe(1);
    rerender({ v: externalValue });
    expect(result.current[0]).toBe(99);
  });
});

describe("useControllableState — controlled↔uncontrolled switch warning", () => {
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

  it("warns when switching from uncontrolled to controlled", () => {
    const { rerender } = renderHook(
      ({ v }: { v?: number }) =>
        useControllableState<number>({
          value: v,
          defaultValue: 0,
          componentName: "Test",
        }),
      { initialProps: { v: undefined as number | undefined } }
    );
    rerender({ v: 5 });
    expect(logged.some((l) => String(l[0]).includes("<Test>"))).toBe(true);
  });

  it("warns when switching from controlled to uncontrolled", () => {
    const { rerender } = renderHook(
      ({ v }: { v?: number }) =>
        useControllableState<number>({
          value: v,
          defaultValue: 0,
          componentName: "Test",
        }),
      { initialProps: { v: 5 as number | undefined } }
    );
    rerender({ v: undefined });
    expect(logged.length).toBeGreaterThan(0);
  });
});
