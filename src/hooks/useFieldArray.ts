"use client";

import { useCallback, useMemo } from "react";
import type { UseFormReturn } from "./useForm";

type FormValues = Record<string, unknown>;

export interface UseFieldArrayReturn<T> {
  /** Current array of items. */
  fields: T[];
  /** Add an item at the end. */
  append: (item: T) => void;
  /** Insert an item at a specific index. */
  insert: (index: number, item: T) => void;
  /** Remove the item at index. */
  remove: (index: number) => void;
  /** Swap two items by index. */
  swap: (a: number, b: number) => void;
  /** Move an item from one index to another. */
  move: (from: number, to: number) => void;
  /** Replace all items. */
  replace: (items: T[]) => void;
}

/**
 * Manage a dynamic list of fields inside a `useForm` instance.
 *
 * @example
 * const form = useForm({ initialValues: { addresses: [{ line1: "" }] } });
 * const addresses = useFieldArray(form, "addresses");
 *
 * addresses.fields.map((addr, i) => (
 *   <Input key={i} {...form.register(`addresses.${i}.line1`)} />
 * ));
 * <Button onClick={() => addresses.append({ line1: "" })}>Add</Button>
 */
export function useFieldArray<
  TForm extends FormValues,
  TKey extends keyof TForm & string,
  TItem = TForm[TKey] extends Array<infer U> ? U : never,
>(
  form: UseFormReturn<TForm>,
  name: TKey
): UseFieldArrayReturn<TItem> {
  const fields = useMemo(
    () => (form.values[name] as unknown as TItem[]) ?? [],
    [form.values, name]
  );

  const setArray = useCallback(
    (next: TItem[]) => {
      form.setValue(name, next as unknown as TForm[TKey]);
    },
    [form, name]
  );

  const append = useCallback(
    (item: TItem) => setArray([...fields, item]),
    [fields, setArray]
  );

  const insert = useCallback(
    (index: number, item: TItem) => {
      const next = [...fields];
      next.splice(index, 0, item);
      setArray(next);
    },
    [fields, setArray]
  );

  const remove = useCallback(
    (index: number) => {
      const next = [...fields];
      next.splice(index, 1);
      setArray(next);
    },
    [fields, setArray]
  );

  const swap = useCallback(
    (a: number, b: number) => {
      const next = [...fields];
      [next[a], next[b]] = [next[b]!, next[a]!];
      setArray(next);
    },
    [fields, setArray]
  );

  const move = useCallback(
    (from: number, to: number) => {
      const next = [...fields];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item!);
      setArray(next);
    },
    [fields, setArray]
  );

  const replace = useCallback(
    (items: TItem[]) => setArray(items),
    [setArray]
  );

  return { fields, append, insert, remove, swap, move, replace };
}
