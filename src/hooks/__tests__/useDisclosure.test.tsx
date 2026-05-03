/**
 * @vitest-environment happy-dom
 */
import { renderHook, act } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useDisclosure } from "../useDisclosure";

describe("useDisclosure", () => {
  it("defaults to closed", () => {
    const { result } = renderHook(() => useDisclosure());
    expect(result.current.open).toBe(false);
  });

  it("respects defaultOpen", () => {
    const { result } = renderHook(() => useDisclosure({ defaultOpen: true }));
    expect(result.current.open).toBe(true);
  });

  it("toggles via toggle()", () => {
    const { result } = renderHook(() => useDisclosure({ defaultOpen: false }));
    act(() => result.current.toggle());
    expect(result.current.open).toBe(true);
    act(() => result.current.toggle());
    expect(result.current.open).toBe(false);
  });

  it("opens via open_() and closes via close()", () => {
    const { result } = renderHook(() => useDisclosure());
    act(() => result.current.open_());
    expect(result.current.open).toBe(true);
    act(() => result.current.close());
    expect(result.current.open).toBe(false);
  });

  it("setOpen sets explicit value", () => {
    const { result } = renderHook(() => useDisclosure());
    act(() => result.current.setOpen(true));
    expect(result.current.open).toBe(true);
    act(() => result.current.setOpen(false));
    expect(result.current.open).toBe(false);
  });

  it("fires onOpenChange in uncontrolled mode", () => {
    const onOpenChange = vi.fn();
    const { result } = renderHook(() =>
      useDisclosure({ defaultOpen: false, onOpenChange })
    );
    act(() => result.current.toggle());
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it("controlled mode honors `open` prop", () => {
    const onOpenChange = vi.fn();
    const { result, rerender } = renderHook(
      ({ open }: { open: boolean }) =>
        useDisclosure({ open, onOpenChange }),
      { initialProps: { open: false } }
    );
    expect(result.current.open).toBe(false);
    rerender({ open: true });
    expect(result.current.open).toBe(true);
  });

  it("controlled mode reports changes via onOpenChange but does not mutate internal state", () => {
    const onOpenChange = vi.fn();
    const { result } = renderHook(() =>
      useDisclosure({ open: false, onOpenChange })
    );
    act(() => result.current.toggle());
    expect(onOpenChange).toHaveBeenCalledWith(true);
    // Still false because parent controls state.
    expect(result.current.open).toBe(false);
  });
});
