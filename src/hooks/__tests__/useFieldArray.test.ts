import { describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useForm } from "../useForm";
import { useFieldArray } from "../useFieldArray";

interface TestForm {
  tags: string[];
}

function setup(initial: string[] = ["a", "b", "c"]) {
  const { result } = renderHook(() => {
    const form = useForm<TestForm>({
      initialValues: { tags: initial },
    });
    const arr = useFieldArray(form, "tags");
    return { form, arr };
  });
  return result;
}

describe("useFieldArray", () => {
  it("fields reflect the form value", () => {
    const result = setup();
    expect(result.current.arr.fields).toEqual(["a", "b", "c"]);
  });

  it("append adds an item at the end", () => {
    const result = setup();
    act(() => result.current.arr.append("d"));
    expect(result.current.arr.fields).toEqual(["a", "b", "c", "d"]);
  });

  it("insert adds at a specific index", () => {
    const result = setup();
    act(() => result.current.arr.insert(1, "x"));
    expect(result.current.arr.fields).toEqual(["a", "x", "b", "c"]);
  });

  it("remove deletes the item at index", () => {
    const result = setup();
    act(() => result.current.arr.remove(1));
    expect(result.current.arr.fields).toEqual(["a", "c"]);
  });

  it("swap exchanges two items", () => {
    const result = setup();
    act(() => result.current.arr.swap(0, 2));
    expect(result.current.arr.fields).toEqual(["c", "b", "a"]);
  });

  it("move relocates an item", () => {
    const result = setup();
    act(() => result.current.arr.move(0, 2));
    expect(result.current.arr.fields).toEqual(["b", "c", "a"]);
  });

  it("replace overwrites the whole array", () => {
    const result = setup();
    act(() => result.current.arr.replace(["x", "y"]));
    expect(result.current.arr.fields).toEqual(["x", "y"]);
  });

  it("changes sync back to the form values", () => {
    const result = setup();
    act(() => result.current.arr.append("z"));
    expect(result.current.form.values.tags).toEqual(["a", "b", "c", "z"]);
  });
});
