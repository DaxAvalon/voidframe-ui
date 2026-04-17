import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { useClipboardRead } from "../useClipboardRead";

describe("useClipboardRead", () => {
  let readTextMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    readTextMock = vi.fn().mockResolvedValue("clipboard content");
    Object.defineProperty(navigator, "clipboard", {
      value: { readText: readTextMock },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(navigator, "clipboard", {
      value: undefined,
      writable: true,
      configurable: true,
    });
  });

  it("isSupported is true when clipboard API available", () => {
    const { result } = renderHook(() => useClipboardRead());
    expect(result.current.isSupported).toBe(true);
  });

  it("isSupported is false when clipboard API unavailable", () => {
    Object.defineProperty(navigator, "clipboard", {
      value: undefined,
      writable: true,
      configurable: true,
    });
    const { result } = renderHook(() => useClipboardRead());
    expect(result.current.isSupported).toBe(false);
  });

  it("read stores text in state", async () => {
    const { result } = renderHook(() => useClipboardRead());
    await act(async () => {
      await result.current.read();
    });
    expect(result.current.text).toBe("clipboard content");
  });

  it("loading is true during read", async () => {
    let resolveFn: (v: string) => void;
    readTextMock.mockImplementation(
      () => new Promise<string>((r) => { resolveFn = r; })
    );
    const { result } = renderHook(() => useClipboardRead());

    let readPromise: Promise<string>;
    act(() => {
      readPromise = result.current.read();
    });
    expect(result.current.loading).toBe(true);

    await act(async () => {
      resolveFn!("done");
      await readPromise;
    });
    expect(result.current.loading).toBe(false);
  });

  it("sets error on permission denied", async () => {
    readTextMock.mockRejectedValue(new Error("Permission denied"));
    const { result } = renderHook(() => useClipboardRead());
    await act(async () => {
      await result.current.read().catch(() => {});
    });
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe("Permission denied");
  });

  it("text is null before any read", () => {
    const { result } = renderHook(() => useClipboardRead());
    expect(result.current.text).toBeNull();
  });

  it("multiple reads update text", async () => {
    readTextMock.mockResolvedValueOnce("first");
    readTextMock.mockResolvedValueOnce("second");

    const { result } = renderHook(() => useClipboardRead());
    await act(async () => {
      await result.current.read();
    });
    expect(result.current.text).toBe("first");

    await act(async () => {
      await result.current.read();
    });
    expect(result.current.text).toBe("second");
  });

  it("resets error on successful read", async () => {
    readTextMock.mockRejectedValueOnce(new Error("fail"));
    readTextMock.mockResolvedValueOnce("ok");

    const { result } = renderHook(() => useClipboardRead());
    await act(async () => {
      await result.current.read().catch(() => {});
    });
    expect(result.current.error).not.toBeNull();

    await act(async () => {
      await result.current.read();
    });
    expect(result.current.error).toBeNull();
    expect(result.current.text).toBe("ok");
  });

  it("does not error in SSR environment", () => {
    Object.defineProperty(navigator, "clipboard", {
      value: undefined,
      writable: true,
      configurable: true,
    });
    expect(() => {
      renderHook(() => useClipboardRead());
    }).not.toThrow();
  });
});
