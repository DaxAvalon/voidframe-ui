import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useAsync } from "../useAsync";
import { useAsyncCallback } from "../useAsyncCallback";

describe("useAsync", () => {
  it("starts idle", () => {
    const { result } = renderHook(() => useAsync(async () => 1));
    expect(result.current.status).toBe("idle");
    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBeUndefined();
  });

  it("transitions through pending → success", async () => {
    const { result } = renderHook(() => useAsync(async (n: number) => n * 2));
    let returned: number | undefined;
    await act(async () => {
      returned = await result.current.run(5);
    });
    expect(returned).toBe(10);
    expect(result.current.status).toBe("success");
    expect(result.current.data).toBe(10);
    expect(result.current.loading).toBe(false);
  });

  it("transitions through pending → error", async () => {
    const { result } = renderHook(() =>
      useAsync(async () => {
        throw new Error("boom");
      })
    );
    await act(async () => {
      await result.current.run().catch(() => {});
    });
    expect(result.current.status).toBe("error");
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe("boom");
  });

  it("reset() clears state", async () => {
    const { result } = renderHook(() => useAsync(async () => 1));
    await act(async () => {
      await result.current.run();
    });
    act(() => result.current.reset());
    expect(result.current.status).toBe("idle");
    expect(result.current.data).toBeUndefined();
  });
});

describe("useAsyncCallback", () => {
  it("aliases useAsync", async () => {
    const fn = vi.fn(async () => 7);
    const { result } = renderHook(() => useAsyncCallback(fn));
    await act(async () => {
      await result.current.run();
    });
    expect(result.current.data).toBe(7);
  });
});
