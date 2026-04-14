import { describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { createSafeContext } from "../createSafeContext";

interface FooState {
  value: string;
}

describe("createSafeContext", () => {
  it("returns the provided value to consumers inside the provider", () => {
    const [Provider, useFoo] = createSafeContext<FooState>({ name: "Foo" });
    const { result } = renderHook(() => useFoo("Foo.Consumer"), {
      wrapper: ({ children }) => (
        <Provider value={{ value: "x" }}>{children}</Provider>
      ),
    });
    expect(result.current.value).toBe("x");
  });

  it("throws a clear error when used outside the provider", () => {
    const [, useFoo] = createSafeContext<FooState>({ name: "Foo" });
    // Suppress React's error boundary stderr noise.
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() =>
      renderHook(() => useFoo("Foo.Consumer"))
    ).toThrowError(/<Foo\.Consumer> must be used within <Foo>/);
    errSpy.mockRestore();
  });

  it("uses a default value when configured", () => {
    const [, useFoo] = createSafeContext<FooState>({
      name: "Foo",
      defaultValue: { value: "default" },
    });
    const { result } = renderHook(() => useFoo());
    expect(result.current.value).toBe("default");
  });
});
