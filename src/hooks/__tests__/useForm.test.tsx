import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useForm } from "../useForm";

interface Basic {
  name: string;
  age: number;
  subscribed: boolean;
}

describe("useForm", () => {
  it("tracks values and emits change through register", () => {
    const { result } = renderHook(() =>
      useForm<Basic>({ initialValues: { name: "", age: 0, subscribed: false } })
    );
    const field = result.current.register("name");
    act(() => {
      field.onChange({ target: { value: "Alice", type: "text" } } as never);
    });
    expect(result.current.values.name).toBe("Alice");
    expect(result.current.dirty.name).toBe(true);
    expect(result.current.isDirty).toBe(true);
  });

  it("coerces number inputs", () => {
    const { result } = renderHook(() =>
      useForm<Basic>({ initialValues: { name: "", age: 0, subscribed: false } })
    );
    act(() => {
      result.current
        .register("age")
        .onChange({ target: { value: "42", type: "number" } } as never);
    });
    expect(result.current.values.age).toBe(42);
  });

  it("coerces checkbox inputs", () => {
    const { result } = renderHook(() =>
      useForm<Basic>({ initialValues: { name: "", age: 0, subscribed: false } })
    );
    act(() => {
      result.current
        .register("subscribed")
        .onChange({ target: { value: "on", type: "checkbox", checked: true } } as never);
    });
    expect(result.current.values.subscribed).toBe(true);
  });

  it("runs per-field validators on blur", async () => {
    const { result } = renderHook(() =>
      useForm<{ name: string }>({
        initialValues: { name: "" },
        validators: {
          name: (v) => (String(v).length < 3 ? "Too short" : null),
        },
      })
    );
    await act(async () => {
      result.current.register("name").onBlur({} as never);
    });
    expect(result.current.errors.name).toBe("Too short");
    expect(result.current.touched.name).toBe(true);
    expect(result.current.isValid).toBe(false);
  });

  it("validateOn=change runs validators immediately", async () => {
    const { result } = renderHook(() =>
      useForm<{ name: string }>({
        initialValues: { name: "" },
        validateOn: "change",
        validators: {
          name: (v) => (String(v).length < 3 ? "Too short" : null),
        },
      })
    );
    await act(async () => {
      result.current
        .register("name")
        .onChange({ target: { value: "ab", type: "text" } } as never);
      // flush microtasks
      await Promise.resolve();
    });
    expect(result.current.errors.name).toBe("Too short");
  });

  it("async validators are awaited", async () => {
    const { result } = renderHook(() =>
      useForm<{ name: string }>({
        initialValues: { name: "x" },
        validators: {
          name: async (v) => (String(v) === "bad" ? "No" : null),
        },
      })
    );
    act(() => result.current.setValue("name", "bad"));
    await act(async () => {
      await result.current.validateField("name");
    });
    expect(result.current.errors.name).toBe("No");
  });

  it("handleSubmit skips onSubmit when form is invalid", async () => {
    const onSubmit = vi.fn();
    const { result } = renderHook(() =>
      useForm<{ name: string }>({
        initialValues: { name: "" },
        validators: { name: (v) => (v ? null : "Required") },
        onSubmit,
      })
    );
    await act(async () => {
      await result.current.handleSubmit();
    });
    expect(onSubmit).not.toHaveBeenCalled();
    expect(result.current.errors.name).toBe("Required");
    expect(result.current.touched.name).toBe(true);
  });

  it("handleSubmit calls onSubmit when valid", async () => {
    const onSubmit = vi.fn();
    const { result } = renderHook(() =>
      useForm<{ name: string }>({
        initialValues: { name: "hi" },
        validators: { name: (v) => (v ? null : "Required") },
        onSubmit,
      })
    );
    await act(async () => {
      await result.current.handleSubmit();
    });
    expect(onSubmit).toHaveBeenCalledWith({ name: "hi" });
  });

  it("reset restores initial values", () => {
    const { result } = renderHook(() =>
      useForm<Basic>({ initialValues: { name: "a", age: 1, subscribed: false } })
    );
    act(() => result.current.setValue("name", "b"));
    expect(result.current.values.name).toBe("b");
    act(() => result.current.reset());
    expect(result.current.values.name).toBe("a");
    expect(result.current.isDirty).toBe(false);
  });

  it("top-level validate runs alongside per-field validators", async () => {
    const { result } = renderHook(() =>
      useForm<{ a: string; b: string }>({
        initialValues: { a: "hi", b: "hi" },
        validate: (v) => (v.a === v.b ? { b: "Must differ" } : {}),
      })
    );
    await act(async () => {
      await result.current.validateForm();
    });
    expect(result.current.errors.b).toBe("Must differ");
  });

  it("getField exposes a typed field handle", () => {
    const { result } = renderHook(() =>
      useForm<Basic>({ initialValues: { name: "a", age: 1, subscribed: false } })
    );
    const field = result.current.getField("name");
    expect(field.value).toBe("a");
    expect(field.dirty).toBe(false);
    act(() => field.setValue("z"));
    expect(result.current.values.name).toBe("z");
  });
});
